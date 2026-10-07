-- Grow Legends V8.211 — Grow Cup six-hour live-care system
-- Snapshot of the applied Beta migration.

alter table recovery_private.v8210_growcup_runs
  add column if not exists rules_version smallint not null default 1,
  add column if not exists phenotype jsonb not null default '{}'::jsonb,
  add column if not exists phase_records jsonb not null default '{}'::jsonb;

drop function if exists public.v8210_growcup_choose(text,text);
drop function if exists recovery_private.v8210_phase_choices(integer);

CREATE OR REPLACE FUNCTION public.v8210_growcup_claim_rank_reward(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype; ev date;
 r recovery_private.v8210_growcup_runs%rowtype; rank_no integer; rew jsonb; rr integer; ss integer; out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select event_key into ev from recovery_private.v8210_growcup_runs
 where user_id=u and rules_version=2 and status='completed' and not rank_reward_claimed
 order by event_key desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_UNCLAIMED_CUP'); end if;

 perform recovery_private.v8211_sync_expired(ev,now());
 if public.v7102_auto_weekend_event_active('growcup',now())
    or exists(select 1 from recovery_private.v8210_growcup_runs
      where event_key=ev and rules_version=2 and status='active' and started_at+interval '6 hours'>now()) then
   return jsonb_build_object('ok',false,'reason','RANKING_NOT_FINAL');
 end if;

 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=2 for update;
 select z.rnk into rank_no from (
   select user_id,row_number() over(order by final_score desc,completed_at asc,user_id)::int rnk
   from recovery_private.v8210_growcup_runs
   where event_key=ev and rules_version=2 and status='completed'
 ) z where z.user_id=u;
 rew:=recovery_private.v8210_rank_reward(coalesce(rank_no,999999));
 rr:=coalesce((rew->>'runes')::int,0);ss:=coalesce((rew->>'shards')::int,0);
 if rr>0 or ss>0 then
   insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
   update recovery_private.v8198_enchant_wallet
      set runes=runes+rr,rune_shards=rune_shards+ss,revision=revision+1,updated_at=now()
      where user_id=u;
 end if;
 update recovery_private.v8210_growcup_runs set rank_reward_claimed=true,revision=revision+1,updated_at=now()
 where user_id=u and event_key=ev and rules_version=2;
 out:=jsonb_build_object('ok',true,'event_key',ev,'rank',rank_no,'runes_awarded',rr,'shards_awarded',ss);
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'rank_reward_v2',out);
 return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_leaderboard(p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare u uuid:=auth.uid(); ev date; rows jsonb; final boolean;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if public.v7102_auto_weekend_event_active('growcup',now()) then
   ev:=recovery_private.v8210_event_key(now());
 else
   select max(event_key) into ev from recovery_private.v8210_growcup_runs where rules_version=2;
 end if;
 if ev is null then return jsonb_build_object('ok',true,'event_key',null,'rows','[]'::jsonb,'final',false); end if;
 perform recovery_private.v8211_sync_expired(ev,now());
 final:=not public.v7102_auto_weekend_event_active('growcup',now())
   and not exists(
     select 1 from recovery_private.v8210_growcup_runs
     where event_key=ev and rules_version=2 and status='active' and started_at+interval '6 hours'>now()
   );
 select coalesce(jsonb_agg(to_jsonb(z) order by z.rank),'[]'::jsonb) into rows
 from (
   select row_number() over(order by r.final_score desc,r.completed_at asc,r.user_id)::int as rank,
          coalesce(p.character_name,'Legende') as player,r.cup_seed,r.final_score,r.tier
   from recovery_private.v8210_growcup_runs r
   left join public.profiles p on p.id=r.user_id
   where r.event_key=ev and r.rules_version=2 and r.status='completed'
   order by r.final_score desc,r.completed_at asc,r.user_id
   limit greatest(1,least(100,coalesce(p_limit,100)))
 ) z;
 return jsonb_build_object('ok',true,'event_key',ev,'rows',rows,'final',final);
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_start(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date:=recovery_private.v8210_event_key(now()); out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;
 if not public.v7102_auto_weekend_event_active('growcup',now()) then return jsonb_build_object('ok',false,'reason','GROWCUP_INACTIVE'); end if;

 insert into recovery_private.v8210_growcup_runs(
   user_id,event_key,cup_seed,status,phase,quality,yield_score,resin,genetics,health,
   choices,history,final_score,tier,personal_reward_awarded,rank_reward_claimed,
   revision,started_at,completed_at,updated_at,rules_version,phenotype,phase_records
 ) values(
   u,ev,recovery_private.v8210_seed_name(ev),'active',1,70,70,70,70,70,
   '[]'::jsonb,'[]'::jsonb,null,null,false,false,
   0,now(),null,now(),2,recovery_private.v8211_new_phenotype(),'{}'::jsonb
 )
 on conflict(user_id,event_key) do update set
   status=case when recovery_private.v8210_growcup_runs.rules_version=1 then 'active' else recovery_private.v8210_growcup_runs.status end,
   phase=case when recovery_private.v8210_growcup_runs.rules_version=1 then 1 else recovery_private.v8210_growcup_runs.phase end,
   quality=case when recovery_private.v8210_growcup_runs.rules_version=1 then 70 else recovery_private.v8210_growcup_runs.quality end,
   yield_score=case when recovery_private.v8210_growcup_runs.rules_version=1 then 70 else recovery_private.v8210_growcup_runs.yield_score end,
   resin=case when recovery_private.v8210_growcup_runs.rules_version=1 then 70 else recovery_private.v8210_growcup_runs.resin end,
   genetics=case when recovery_private.v8210_growcup_runs.rules_version=1 then 70 else recovery_private.v8210_growcup_runs.genetics end,
   health=case when recovery_private.v8210_growcup_runs.rules_version=1 then 70 else recovery_private.v8210_growcup_runs.health end,
   history=case when recovery_private.v8210_growcup_runs.rules_version=1 then '[]'::jsonb else recovery_private.v8210_growcup_runs.history end,
   final_score=case when recovery_private.v8210_growcup_runs.rules_version=1 then null else recovery_private.v8210_growcup_runs.final_score end,
   tier=case when recovery_private.v8210_growcup_runs.rules_version=1 then null else recovery_private.v8210_growcup_runs.tier end,
   personal_reward_awarded=case when recovery_private.v8210_growcup_runs.rules_version=1 then false else recovery_private.v8210_growcup_runs.personal_reward_awarded end,
   rank_reward_claimed=case when recovery_private.v8210_growcup_runs.rules_version=1 then false else recovery_private.v8210_growcup_runs.rank_reward_claimed end,
   started_at=case when recovery_private.v8210_growcup_runs.rules_version=1 then now() else recovery_private.v8210_growcup_runs.started_at end,
   completed_at=case when recovery_private.v8210_growcup_runs.rules_version=1 then null else recovery_private.v8210_growcup_runs.completed_at end,
   updated_at=now(),
   rules_version=2,
   phenotype=case when recovery_private.v8210_growcup_runs.rules_version=1 then recovery_private.v8211_new_phenotype() else recovery_private.v8210_growcup_runs.phenotype end,
   phase_records=case when recovery_private.v8210_growcup_runs.rules_version=1 then '{}'::jsonb else recovery_private.v8210_growcup_runs.phase_records end;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'start_v2',out);
 return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); active boolean; ev date; r jsonb; w recovery_private.v8198_enchant_wallet%rowtype;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 active:=public.v7102_auto_weekend_event_active('growcup',now());
 ev:=recovery_private.v8210_event_key(now());
 if not exists(select 1 from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev and rules_version=2) then
   select event_key into ev from recovery_private.v8210_growcup_runs
   where user_id=u and rules_version=2 and status='active' and started_at+interval '6 hours'>now()
   order by started_at desc limit 1;
 end if;
 if ev is null and active then ev:=recovery_private.v8210_event_key(now()); end if;
 if ev is not null then r:=recovery_private.v8210_public_run(u,ev); else r:=null; end if;
 insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
 select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
 return jsonb_build_object(
   'ok',true,'active',active,'next_event',recovery_private.v8210_next_growcup(now()),
   'event_key',ev,
   'cup_seed',recovery_private.v8210_seed_name(coalesce(ev,recovery_private.v8210_event_key(now()))),
   'runes',w.runes,'rune_shards',w.rune_shards,'run',r,'server_now',now()
 );
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_tune(p_light_minutes integer, p_water_ml integer, p_nutrient_ml numeric, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date; r recovery_private.v8210_growcup_runs%rowtype;
 elapsed numeric; phase_no integer; phase_start timestamptz; open_at timestamptz; end_at timestamptz;
 rec jsonb; out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 if p_light_minutes<0 or p_light_minutes>60 then return jsonb_build_object('ok',false,'reason','LIGHT_RANGE'); end if;
 if p_water_ml<0 or p_water_ml>400 then return jsonb_build_object('ok',false,'reason','WATER_RANGE'); end if;
 if p_nutrient_ml<0 or p_nutrient_ml>10 then return jsonb_build_object('ok',false,'reason','NUTRIENT_RANGE'); end if;

 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select event_key into ev from recovery_private.v8210_growcup_runs
 where user_id=u and rules_version=2 and status='active' and started_at+interval '6 hours'>now()
 order by started_at desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 perform recovery_private.v8211_sync_run(u,ev,now());
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=2 for update;
 if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 elapsed:=greatest(0,extract(epoch from (now()-r.started_at)));
 phase_no:=greatest(1,least(6,floor(elapsed/3600)::int+1));
 phase_start:=r.started_at+make_interval(hours=>phase_no-1);
 open_at:=phase_start+interval '45 minutes';
 end_at:=phase_start+interval '1 hour';

 if now()<open_at then return jsonb_build_object('ok',false,'reason','CARE_TOO_EARLY','opens_at',open_at); end if;
 if now()>=end_at then return jsonb_build_object('ok',false,'reason','CARE_WINDOW_CLOSED'); end if;

 rec:=r.phase_records->phase_no::text;
 if rec is not null and coalesce(rec->>'status','')='submitted' then
   return jsonb_build_object('ok',false,'reason','CARE_ALREADY_SET');
 end if;

 rec:=jsonb_build_object(
   'phase',phase_no,'status','submitted','source','player','scored',false,
   'light_minutes',p_light_minutes,'water_ml',p_water_ml,'nutrient_ml',round(p_nutrient_ml,1),
   'submitted_at',now()
 );
 update recovery_private.v8210_growcup_runs set
   phase_records=jsonb_set(coalesce(phase_records,'{}'::jsonb),array[phase_no::text],rec,true),
   revision=revision+1,updated_at=now()
 where user_id=u and event_key=ev and rules_version=2;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'tune_p'||phase_no,out);
 return out;
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
 rec jsonb; last_settings jsonb; window_state text; now_at timestamptz:=now();
 clues jsonb;
begin
 perform recovery_private.v8211_sync_run(p_uid,p_event,now_at);
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=2;
 if not found then return null; end if;

 phase_no:=case when r.status='completed' then 6
   else greatest(1,least(6,floor(greatest(0,extract(epoch from (now_at-r.started_at)))/3600)::int+1)) end;
 phase_start:=r.started_at+make_interval(hours=>phase_no-1);
 open_at:=phase_start+interval '45 minutes';
 end_at:=phase_start+interval '1 hour';
 rec:=coalesce(r.phase_records->phase_no::text,'{}'::jsonb);
 last_settings:=recovery_private.v8211_last_settings(r.phase_records,phase_no);
 clues:=case when r.status='active' then recovery_private.v8211_phase_clues(phase_no,r.phenotype,last_settings) else '[]'::jsonb end;

 if r.status='completed' then window_state:='completed';
 elsif coalesce(rec->>'status','')='submitted' then window_state:='submitted';
 elsif now_at<open_at then window_state:='waiting';
 elsif now_at<end_at then window_state:='open';
 else window_state:='processing';
 end if;

 if r.status='completed' then
   select z.rnk into rank_no
   from (
     select user_id,row_number() over(order by final_score desc,completed_at asc,user_id) rnk
     from recovery_private.v8210_growcup_runs
     where event_key=p_event and rules_version=2 and status='completed'
   ) z where z.user_id=p_uid;
 end if;

 return jsonb_build_object(
   'event_key',r.event_key,'run_id',r.run_id,'status',r.status,'cup_seed',r.cup_seed,
   'phase',phase_no,'rules_version',r.rules_version,
   'metrics',jsonb_build_object('quality',r.quality,'yield',r.yield_score,'resin',r.resin,'genetics',r.genetics,'health',r.health),
   'history',r.history,'final_score',r.final_score,'tier',r.tier,
   'personal_reward_awarded',r.personal_reward_awarded,'rank_reward_claimed',r.rank_reward_claimed,
   'rank',rank_no,'rank_reward',case when rank_no is null then null else recovery_private.v8210_rank_reward(rank_no) end,
   'revision',r.revision,'started_at',r.started_at,'completed_at',r.completed_at,
   'run_ends_at',r.started_at+interval '6 hours',
   'phase_started_at',phase_start,'decision_opens_at',open_at,'phase_ends_at',end_at,
   'window_state',window_state,
   'phase_record',case when rec='{}'::jsonb then null else rec end,
   'last_settings',last_settings,
   'clues',clues,
   'server_now',now_at
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_base_target(p_phase integer)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
select case greatest(1,least(6,p_phase))
 when 1 then jsonb_build_object('light_minutes',34,'water_ml',105,'nutrient_ml',0.6)
 when 2 then jsonb_build_object('light_minutes',47,'water_ml',175,'nutrient_ml',1.8)
 when 3 then jsonb_build_object('light_minutes',51,'water_ml',225,'nutrient_ml',2.6)
 when 4 then jsonb_build_object('light_minutes',46,'water_ml',285,'nutrient_ml',4.6)
 when 5 then jsonb_build_object('light_minutes',39,'water_ml',225,'nutrient_ml',3.3)
 else jsonb_build_object('light_minutes',22,'water_ml',115,'nutrient_ml',0.7)
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_default_settings(p_phase integer)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
select case greatest(1,least(6,p_phase))
 when 1 then jsonb_build_object('light_minutes',30,'water_ml',100,'nutrient_ml',0.5)
 when 2 then jsonb_build_object('light_minutes',40,'water_ml',160,'nutrient_ml',1.5)
 when 3 then jsonb_build_object('light_minutes',45,'water_ml',220,'nutrient_ml',2.5)
 when 4 then jsonb_build_object('light_minutes',45,'water_ml',280,'nutrient_ml',4.0)
 when 5 then jsonb_build_object('light_minutes',38,'water_ml',220,'nutrient_ml',3.0)
 else jsonb_build_object('light_minutes',20,'water_ml',120,'nutrient_ml',0.5)
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_last_settings(p_records jsonb, p_phase integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare i integer; r jsonb;
begin
 if p_phase>1 then
   for i in reverse p_phase-1..1 loop
     r:=p_records->i::text;
     if r is not null and r ? 'light_minutes' then
       return jsonb_build_object(
         'light_minutes',coalesce((r->>'light_minutes')::int,30),
         'water_ml',coalesce((r->>'water_ml')::int,100),
         'nutrient_ml',coalesce((r->>'nutrient_ml')::numeric,0.5)
       );
     end if;
   end loop;
 end if;
 return recovery_private.v8211_default_settings(p_phase);
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_new_phenotype()
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
select jsonb_build_object(
 'light_bias',(floor(random()*13)-6)::int,
 'water_bias',(floor(random()*51)-25)::int,
 'nutrient_bias',round((random()*1.6-0.8)::numeric,1),
 'light_jitter',jsonb_build_array(
   (floor(random()*9)-4)::int,(floor(random()*9)-4)::int,(floor(random()*9)-4)::int,
   (floor(random()*9)-4)::int,(floor(random()*9)-4)::int,(floor(random()*9)-4)::int
 ),
 'water_jitter',jsonb_build_array(
   (floor(random()*41)-20)::int,(floor(random()*41)-20)::int,(floor(random()*41)-20)::int,
   (floor(random()*41)-20)::int,(floor(random()*41)-20)::int,(floor(random()*41)-20)::int
 ),
 'nutrient_jitter',jsonb_build_array(
   round((random()*1.2-0.6)::numeric,1),round((random()*1.2-0.6)::numeric,1),round((random()*1.2-0.6)::numeric,1),
   round((random()*1.2-0.6)::numeric,1),round((random()*1.2-0.6)::numeric,1),round((random()*1.2-0.6)::numeric,1)
 )
)
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_phase_clues(p_phase integer, p_phenotype jsonb, p_last jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 t jsonb:=recovery_private.v8211_phase_target(p_phase,p_phenotype);
 l integer:=coalesce((p_last->>'light_minutes')::int,30);
 w integer:=coalesce((p_last->>'water_ml')::int,100);
 n numeric:=coalesce((p_last->>'nutrient_ml')::numeric,0.5);
 tl integer:=(t->>'light_minutes')::int;
 tw integer:=(t->>'water_ml')::int;
 tn numeric:=(t->>'nutrient_ml')::numeric;
begin
 return jsonb_build_array(
   case when tl>l+4 then 'Die Pflanze streckt sich deutlich zum Licht.'
        when tl<l-4 then 'Die Blattkanten wirken etwas lichtempfindlich.'
        else 'Die Lichtreaktion wirkt aktuell ausgeglichen.' end,
   case when tw>w+35 then 'Das Substrat trocknet ungewöhnlich schnell.'
        when tw<w-35 then 'Die Wurzelzone hält noch viel Feuchtigkeit.'
        else 'Die Feuchtigkeit wirkt derzeit recht stabil.' end,
   case when tn>n+0.8 then 'Der Wuchs wirkt hungriger als zuvor.'
        when tn<n-0.8 then 'Die Blattspitzen wirken bereits gut versorgt.'
        else 'Die Nährstoffversorgung wirkt ausgeglichen.' end
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_phase_target(p_phase integer, p_phenotype jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 b jsonb:=recovery_private.v8211_base_target(p_phase);
 ix integer:=greatest(0,least(5,p_phase-1));
 l integer; w integer; n numeric;
begin
 l:=coalesce((b->>'light_minutes')::int,30)+coalesce((p_phenotype->>'light_bias')::int,0)
    +coalesce((p_phenotype->'light_jitter'->>ix)::int,0);
 w:=coalesce((b->>'water_ml')::int,150)+coalesce((p_phenotype->>'water_bias')::int,0)
    +coalesce((p_phenotype->'water_jitter'->>ix)::int,0);
 n:=coalesce((b->>'nutrient_ml')::numeric,1)+coalesce((p_phenotype->>'nutrient_bias')::numeric,0)
    +coalesce((p_phenotype->'nutrient_jitter'->>ix)::numeric,0);
 return jsonb_build_object(
   'light_minutes',greatest(0,least(60,l)),
   'water_ml',greatest(0,least(400,w)),
   'nutrient_ml',greatest(0::numeric,least(10::numeric,n))
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_score_phase(p_phase integer, p_phenotype jsonb, p_light integer, p_water integer, p_nutrient numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 t jsonb:=recovery_private.v8211_phase_target(p_phase,p_phenotype);
 tl integer:=(t->>'light_minutes')::int;
 tw integer:=(t->>'water_ml')::int;
 tn numeric:=(t->>'nutrient_ml')::numeric;
 lf numeric; wf numeric; nf numeric; perf numeric;
 d integer; dq integer:=0; dy integer:=0; dr integer:=0; dg integer:=0; dh integer:=0;
 fb jsonb:='[]'::jsonb;
begin
 lf:=greatest(0::numeric,1-abs(p_light-tl)::numeric/28);
 wf:=greatest(0::numeric,1-abs(p_water-tw)::numeric/175);
 nf:=greatest(0::numeric,1-abs(p_nutrient-tn)/5);
 perf:=round(100*(0.34*lf+0.36*wf+0.30*nf),1);
 d:=greatest(-6,least(6,round((perf-58)/8)::int));
 if perf>=92 then d:=least(7,d+1); end if;

 case greatest(1,least(6,p_phase))
  when 1 then dq:=d;dy:=round(d*.35);dr:=round(d*.15);dg:=d;dh:=d+1;
  when 2 then dq:=round(d*.5);dy:=d+1;dr:=round(d*.35);dg:=round(d*.5);dh:=d;
  when 3 then dq:=round(d*.5);dy:=d;dr:=round(d*.35);dg:=d+1;dh:=round(d*.5);
  when 4 then dq:=round(d*.5);dy:=d;dr:=d+1;dg:=round(d*.25);dh:=round(d*.5);
  when 5 then dq:=d;dy:=round(d*.5);dr:=d+1;dg:=round(d*.25);dh:=round(d*.5);
  else dq:=d+1;dy:=round(d*.25);dr:=round(d*.5);dg:=round(d*.5);dh:=d;
 end case;

 if p_light>tl+12 and p_water<tw-45 then
   dh:=dh-3;dq:=dq-1;fb:=fb||jsonb_build_array('Zu viel Licht bei zu trockener Wurzelzone erzeugte Stress.');
 end if;
 if p_water>tw+90 then
   dh:=dh-2;dg:=dg-1;fb:=fb||jsonb_build_array('Die Wurzelzone war deutlich zu nass.');
 end if;
 if p_nutrient>tn+2.5 then
   dh:=dh-2;dq:=dq-1;fb:=fb||jsonb_build_array('Die Nährstoffkonzentration war zu aggressiv.');
 elsif p_nutrient<tn-2.0 and p_phase>=4 then
   dr:=dr-2;dy:=dy-1;fb:=fb||jsonb_build_array('In der Blüte fehlten der Pflanze Nährstoffreserven.');
 end if;

 if abs(p_light-tl)<=5 then fb:=fb||jsonb_build_array('Die Lichtmenge passte sehr gut zur aktuellen Phase.'); end if;
 if abs(p_water-tw)<=35 then fb:=fb||jsonb_build_array('Die Wassermenge traf die Wurzelzone gut.'); end if;
 if abs(p_nutrient-tn)<=0.8 then fb:=fb||jsonb_build_array('Die Düngung lag in einem starken Bereich.'); end if;
 if jsonb_array_length(fb)=0 then fb:=jsonb_build_array('Die Pflanze hat die Pflege ohne auffällige Reaktion verarbeitet.'); end if;

 return jsonb_build_object(
   'performance',perf,
   'deltas',jsonb_build_object('quality',dq,'yield',dy,'resin',dr,'genetics',dg,'health',dh),
   'feedback',fb
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_sync_expired(p_event date, p_at timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'recovery_private', 'pg_temp'
AS $function$
declare x record;
begin
 for x in
   select user_id from recovery_private.v8210_growcup_runs
   where event_key=p_event and rules_version=2 and status='active'
     and started_at+interval '6 hours'<=p_at
 loop
   perform recovery_private.v8211_sync_run(x.user_id,p_event,p_at);
 end loop;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_sync_run(p_uid uuid, p_event date, p_at timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 r recovery_private.v8210_growcup_runs%rowtype;
 elapsed numeric; ended integer; p integer;
 rec jsonb; settings jsonb; score jsonb; del jsonb;
 records jsonb; hist jsonb;
 q integer; y integer; rs integer; g integer; h integer;
 source_text text;
 final numeric; tr text; champion boolean:=false;
begin
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=2 for update;
 if not found or r.status='completed' then return; end if;

 elapsed:=greatest(0,extract(epoch from (p_at-r.started_at)));
 ended:=least(6,greatest(0,floor(elapsed/3600)::int));
 records:=coalesce(r.phase_records,'{}'::jsonb);
 hist:=coalesce(r.history,'[]'::jsonb);
 q:=r.quality;y:=r.yield_score;rs:=r.resin;g:=r.genetics;h:=r.health;

 if ended>0 then
  for p in 1..ended loop
   rec:=records->p::text;
   if coalesce((rec->>'scored')::boolean,false) then continue; end if;

   if rec is null or coalesce(rec->>'status','')<>'submitted' then
     settings:=recovery_private.v8211_last_settings(records,p);
     rec:=coalesce(rec,'{}'::jsonb)||settings||
       jsonb_build_object('status','missed','source','carry','submitted_at',null);
     source_text:='carry';
   else
     settings:=jsonb_build_object(
       'light_minutes',(rec->>'light_minutes')::int,
       'water_ml',(rec->>'water_ml')::int,
       'nutrient_ml',(rec->>'nutrient_ml')::numeric
     );
     source_text:='player';
   end if;

   score:=recovery_private.v8211_score_phase(
      p,r.phenotype,
      (settings->>'light_minutes')::int,
      (settings->>'water_ml')::int,
      (settings->>'nutrient_ml')::numeric
   );
   del:=score->'deltas';
   q:=greatest(0,least(100,q+coalesce((del->>'quality')::int,0)));
   y:=greatest(0,least(100,y+coalesce((del->>'yield')::int,0)));
   rs:=greatest(0,least(100,rs+coalesce((del->>'resin')::int,0)));
   g:=greatest(0,least(100,g+coalesce((del->>'genetics')::int,0)));
   h:=greatest(0,least(100,h+coalesce((del->>'health')::int,0)));

   rec:=rec||jsonb_build_object(
      'scored',true,'scored_at',p_at,'performance',score->'performance',
      'feedback',score->'feedback','deltas',del,'source',source_text
   );
   records:=jsonb_set(records,array[p::text],rec,true);
   hist:=hist||jsonb_build_array(jsonb_build_object(
      'phase',p,'kind','care_result','source',source_text,
      'performance',score->'performance','feedback',score->'feedback'
   ));
  end loop;
 end if;

 update recovery_private.v8210_growcup_runs set
   phase=case when elapsed>=21600 then 6 else greatest(1,least(6,floor(elapsed/3600)::int+1)) end,
   quality=q,yield_score=y,resin=rs,genetics=g,health=h,
   phase_records=records,history=hist,revision=revision+1,updated_at=p_at
 where user_id=p_uid and event_key=p_event and rules_version=2;

 if elapsed>=21600 and ended=6 then
   final:=round((q+y+rs+g+h)::numeric/5.0,2);
   tr:=recovery_private.v8210_tier(final);
   champion:=final>=92 and not r.personal_reward_awarded;
   if champion then
     insert into recovery_private.v8198_enchant_wallet(user_id) values(p_uid) on conflict(user_id) do nothing;
     update recovery_private.v8198_enchant_wallet
       set runes=runes+1,rune_shards=rune_shards+10,revision=revision+1,updated_at=p_at
       where user_id=p_uid;
   end if;
   update recovery_private.v8210_growcup_runs set
     status='completed',final_score=final,tier=tr,
     personal_reward_awarded=(personal_reward_awarded or champion),
     completed_at=coalesce(completed_at,p_at),revision=revision+1,updated_at=p_at
   where user_id=p_uid and event_key=p_event and rules_version=2;
 end if;
end
$function$;


revoke all on function public.v8210_growcup_tune(integer,integer,numeric,text) from public,anon;
grant execute on function public.v8210_growcup_tune(integer,integer,numeric,text) to authenticated;
