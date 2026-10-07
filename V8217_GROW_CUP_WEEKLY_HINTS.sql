-- Grow Legends V8.217 — weekly Grow Cup plants, weekly non-repeating Sweet Spots,
-- indirect plant-status hints and weekly Sunday gate.
-- Snapshot of the applied Beta backend state.

CREATE OR REPLACE FUNCTION public.v7102_auto_weekend_event_active(p_type text, p_at timestamp with time zone DEFAULT now())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 d date := (p_at at time zone 'Europe/Berlin')::date;
 iso integer := extract(isodow from (p_at at time zone 'Europe/Berlin'))::integer;
 monday date;
 week_index integer;
 cycle integer;
 typ text := lower(btrim(coalesce(p_type,'')));
 beta_test_user boolean := false;
begin
 if typ in ('growcup','grow-cup','cup')
    and p_at < timestamptz '2026-10-08 14:00:00+02'
    and auth.uid() is not null then
   select exists(
     select 1 from public.profiles p
     where p.id=auth.uid()
       and lower(coalesce(p.character_name,''))='tomssen'
   ) into beta_test_user;
   if beta_test_user then return true; end if;
 end if;

 monday := d-(iso-1);
 week_index := ((monday-date '2026-09-14')/7)::integer;
 cycle := ((week_index % 2)+2)%2;

 if typ in ('gold','gold-event') then return iso in (5,6,7) and cycle=0; end if;
 if typ in ('dampf','steam','dampf-event') then return iso in (5,6,7) and cycle=0; end if;
 if typ in ('xp','exp','erfahrung','erfahrungs-event') then return iso in (5,6,7) and cycle=1; end if;
 if typ in ('koloss','worldboss','weltboss','mystic','mystisch','smaragd') then return iso=4; end if;
 if typ in ('growcup','grow-cup','cup') then return iso=7; end if;
 if typ in ('runehunt','runenjagd','rune','runen') then return false; end if;
 return false;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_public_run(p_uid uuid, p_event date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 r recovery_private.v8210_growcup_runs%rowtype;
 rank_no integer:=null;
 phase_no integer; phase_start timestamptz; open_at timestamptz; end_at timestamptz;
 phase_seconds integer; open_seconds integer;
 rec jsonb; window_state text; now_at timestamptz:=now();
 action jsonb; hint jsonb; visible_record jsonb; total_so_far integer:=0; results jsonb:='[]'::jsonb;
 i integer; rr jsonb;
begin
 perform recovery_private.v8211_sync_run(p_uid,p_event,now_at);
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=3;
 if not found then return null; end if;

 phase_seconds:=recovery_private.v8213_phase_seconds(r.test_mode);
 open_seconds:=recovery_private.v8213_care_open_seconds(r.test_mode);
 phase_no:=case when r.status='completed' then 6
   else greatest(1,least(6,floor(greatest(0,extract(epoch from (now_at-r.started_at)))/phase_seconds)::int+1)) end;
 phase_start:=r.started_at+make_interval(secs=>(phase_no-1)*phase_seconds);
 open_at:=phase_start+make_interval(secs=>open_seconds);
 end_at:=phase_start+make_interval(secs=>phase_seconds);
 rec:=coalesce(r.phase_records->phase_no::text,'{}'::jsonb);
 action:=recovery_private.v8214_action_public(phase_no);
 hint:=recovery_private.v8216_action_hint(r.event_key,phase_no);

 if r.status='completed' then window_state:='completed';
 elsif coalesce(rec->>'status','')='submitted' then window_state:='submitted';
 elsif now_at<open_at then window_state:='waiting';
 elsif now_at<end_at then window_state:='open';
 else window_state:='processing';
 end if;

 if r.status='completed' and not r.test_mode then
   select z.rnk into rank_no
   from (
     select user_id,row_number() over(order by final_score desc,completed_at asc,user_id) rnk
     from recovery_private.v8210_growcup_runs
     where event_key=p_event and rules_version=3 and status='completed' and not test_mode
   ) z where z.user_id=p_uid;
 end if;

 for i in 1..6 loop
   rr:=r.phase_records->i::text;
   if rr is not null and rr ? 'score' then
     total_so_far:=total_so_far+coalesce((rr->>'score')::int,0);
     if r.status='completed' then
       results:=results||jsonb_build_array(jsonb_build_object(
         'phase',i,
         'action',recovery_private.v8214_action_public(i),
         'value',case when rr ? 'value' then (rr->>'value')::numeric else null end,
         'score',coalesce((rr->>'score')::int,0),
         'status',coalesce(rr->>'status','missed')
       ));
     end if;
   end if;
 end loop;

 visible_record:=case when rec='{}'::jsonb then null else (rec-'score'-'scored_at') end;

 return jsonb_build_object(
   'event_key',r.event_key,'week_key',recovery_private.v8216_week_key(r.event_key),
   'run_id',r.run_id,'status',r.status,'cup_seed',r.cup_seed,
   'phase',phase_no,'rules_version',r.rules_version,'test_mode',r.test_mode,
   'metrics',jsonb_build_object('quality',r.quality,'yield',r.yield_score,'resin',r.resin,'genetics',r.genetics,'health',r.health),
   'final_score',r.final_score,'max_score',600,'tier',r.tier,
   'personal_reward_awarded',r.personal_reward_awarded,'rank_reward_claimed',r.rank_reward_claimed,
   'rank',rank_no,'rank_reward',case when rank_no is null then null else recovery_private.v8210_rank_reward(rank_no) end,
   'revision',r.revision,'started_at',r.started_at,'completed_at',r.completed_at,
   'run_ends_at',r.started_at+make_interval(secs=>phase_seconds*6),
   'phase_started_at',phase_start,'decision_opens_at',open_at,'phase_ends_at',end_at,
   'window_state',window_state,'action',action,'plant_status',hint,'phase_record',visible_record,
   'results',case when r.status='completed' then results else '[]'::jsonb end,
   'server_now',now_at
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_seed_name(p_event date)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 names text[]:=array[
   'White Widow','Northern Lights','Jack Herer','Purple Haze','Blue Dream','Critical+',
   'OG Kush','Lemon Haze','Gorilla Glue','Green Crack','Amnesia Haze','Smaragd OG'
 ];
 wk date:=recovery_private.v8216_week_key(p_event);
 week_no integer;
 ix integer;
begin
 week_no:=floor((wk-date '2026-01-05')/7)::int;
 ix:=1+mod(abs(week_no),array_length(names,1));
 return names[ix];
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8214_action_full(p_event date, p_phase integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 ph integer:=greatest(1,least(6,p_phase));
 id text; title text; icon text; unit text; descr text;
 minv numeric; maxv numeric; stepv numeric;
 steps integer; low_idx integer; high_idx integer; slots integer;
 raw bytea; prev_raw bytea; seed bigint; prev_seed bigint; idx integer; prev_idx integer; target numeric;
 wk date:=recovery_private.v8216_week_key(p_event);
begin
 case ph
  when 1 then id:='light'; title:='Licht'; icon:='💡'; unit:='Min.'; minv:=0; maxv:=60; stepv:=5; descr:='Wie lange bekommt die Pflanze in dieser Phase Licht?';
  when 2 then id:='water'; title:='Gießen'; icon:='💧'; unit:='ml'; minv:=0; maxv:=500; stepv:=10; descr:='Wie viel Wasser gibst du der Pflanze?';
  when 3 then id:='nutrient'; title:='Dünger'; icon:='🧪'; unit:='ml'; minv:=0; maxv:=10; stepv:=0.5; descr:='Wie viel Dünger mischst du in die Versorgung?';
  when 4 then id:='prune'; title:='Beschneiden'; icon:='✂️'; unit:='%'; minv:=0; maxv:=50; stepv:=5; descr:='Wie stark beschneidest du die Pflanze?';
  when 5 then id:='temperature'; title:='Temperatur'; icon:='🌡️'; unit:='°C'; minv:=18; maxv:=32; stepv:=0.5; descr:='Welche Temperatur stellst du für diese Phase ein?';
  else id:='harvest'; title:='Erntezeitpunkt'; icon:='⏳'; unit:='Min.'; minv:=0; maxv:=60; stepv:=5; descr:='Wie lange lässt du die Pflanze in der finalen Phase noch reifen?';
 end case;

 steps:=floor((maxv-minv)/stepv)::int;
 low_idx:=greatest(1,ceil(steps*0.15)::int);
 high_idx:=least(steps-1,floor(steps*0.85)::int);
 slots:=greatest(1,high_idx-low_idx+1);

 raw:=decode(md5(wk::text||':growcup:v8217:'||ph::text),'hex');
 seed:=(get_byte(raw,0)::bigint*16777216)
      +(get_byte(raw,1)::bigint*65536)
      +(get_byte(raw,2)::bigint*256)
      + get_byte(raw,3)::bigint;
 idx:=low_idx+mod(seed,slots)::int;

 prev_raw:=decode(md5((wk-7)::text||':growcup:v8217:'||ph::text),'hex');
 prev_seed:=(get_byte(prev_raw,0)::bigint*16777216)
      +(get_byte(prev_raw,1)::bigint*65536)
      +(get_byte(prev_raw,2)::bigint*256)
      + get_byte(prev_raw,3)::bigint;
 prev_idx:=low_idx+mod(prev_seed,slots)::int;

 if slots>1 and idx=prev_idx then
   idx:=low_idx+mod((idx-low_idx+1),slots);
 end if;

 target:=minv+(idx*stepv);

 return jsonb_build_object(
   'id',id,'title',title,'icon',icon,'unit',unit,'description',descr,
   'min',minv,'max',maxv,'step',stepv,'target',target,'week_key',wk
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8216_action_hint(p_event date, p_phase integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 a jsonb:=recovery_private.v8214_action_full(p_event,p_phase);
 target numeric:=(a->>'target')::numeric;
 minv numeric:=(a->>'min')::numeric;
 maxv numeric:=(a->>'max')::numeric;
 mid numeric:=(minv+maxv)/2;
 dead numeric:=(maxv-minv)*0.10;
 relation integer;
 msg text;
 ph integer:=greatest(1,least(6,p_phase));
begin
 relation:=case when target>mid+dead then 1
                when target<mid-dead then -1
                else 0 end;

 case ph
  when 1 then
   msg:=case relation
    when 1 then 'Die Pflanze bleibt auffällig klein und kompakt.'
    when -1 then 'Die Pflanze schießt sichtbar in die Höhe und streckt sich.'
    else 'Der Wuchs wirkt gleichmäßig und stabil.' end;
  when 2 then
   msg:=case relation
    when 1 then 'Die obere Erdschicht wirkt trocken und leicht.'
    when -1 then 'Das Substrat wirkt schwer und hält noch viel Feuchtigkeit.'
    else 'Die Erde wirkt weder trocken noch besonders nass.' end;
  when 3 then
   msg:=case relation
    when 1 then 'Das neue Wachstum wirkt blasser und etwas kraftlos.'
    when -1 then 'An einzelnen Blattspitzen zeigen sich erste kräftige Verfärbungen.'
    else 'Die Blattfarbe wirkt satt und ruhig.' end;
  when 4 then
   msg:=case relation
    when 1 then 'Die Krone wird sehr dicht und mehrere Triebe beschatten sich.'
    when -1 then 'Die Krone wirkt eher dünn und offen.'
    else 'Die Triebe verteilen sich recht gleichmäßig.' end;
  when 5 then
   msg:=case relation
    when 1 then 'Der Stoffwechsel wirkt langsam und die Blätter stehen eher steif.'
    when -1 then 'Die Blattränder rollen sich leicht und wirken gestresst.'
    else 'Die Blätter stehen ruhig und entspannt.' end;
  else
   msg:=case relation
    when 1 then 'Viele Trichome wirken noch klar und glasig.'
    when -1 then 'Viele Trichome wirken bereits dunkel und sehr reif.'
    else 'Die Trichome zeigen ein gemischtes Reifestadium.' end;
 end case;

 return jsonb_build_object('message',msg);
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8216_week_key(p_date date)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select date_trunc('week',p_date::timestamp)::date
$function$;

