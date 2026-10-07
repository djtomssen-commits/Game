-- Grow Legends V8.210 — Grow Cup foundation (Beta)
-- Snapshot of migration applied to Supabase.
-- Replaces the scheduled Runenjagd slot. Legacy v8202 data remains intact but inactive.

create table if not exists recovery_private.v8210_growcup_runs(
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key date not null,
  run_id uuid not null default gen_random_uuid(),
  status text not null default 'active' check (status in ('active','completed')),
  cup_seed text not null,
  phase smallint not null default 1 check (phase between 1 and 6),
  quality smallint not null default 70 check (quality between 0 and 100),
  yield_score smallint not null default 70 check (yield_score between 0 and 100),
  resin smallint not null default 70 check (resin between 0 and 100),
  genetics smallint not null default 70 check (genetics between 0 and 100),
  health smallint not null default 70 check (health between 0 and 100),
  choices jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  final_score numeric(5,2),
  tier text,
  personal_reward_awarded boolean not null default false,
  rank_reward_claimed boolean not null default false,
  revision bigint not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id,event_key),
  unique(run_id)
);
alter table recovery_private.v8210_growcup_runs enable row level security;
revoke all on recovery_private.v8210_growcup_runs from public,anon,authenticated;

create table if not exists recovery_private.v8210_growcup_ledger(
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table recovery_private.v8210_growcup_ledger enable row level security;
revoke all on recovery_private.v8210_growcup_ledger from public,anon,authenticated;

create index if not exists v8210_growcup_rank_idx
on recovery_private.v8210_growcup_runs(event_key,status,final_score desc,completed_at asc)
where status='completed';

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
  if typ in ('growcup','grow-cup','cup') then return iso=7 and cycle=1; end if;
  -- V8.210: legacy Runenjagd no longer owns a scheduled event slot.
  if typ in ('runehunt','runenjagd','rune','runen') then return false; end if;
  return false;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_choose(p_choice_id text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();
 req text:=left(btrim(coalesce(p_request_id,'')),160);
 cid text:=lower(btrim(coalesce(p_choice_id,'')));
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date:=recovery_private.v8210_event_key(now());
 r recovery_private.v8210_growcup_runs%rowtype;
 choice jsonb;
 q integer; y integer; rs integer; g integer; h integer;
 event_roll numeric;
 event_name text:='';
 event_text text:='';
 event_delta integer:=0;
 score numeric;
 tr text;
 personal_runes integer:=0;
 personal_shards integer:=0;
 out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;
 if not public.v7102_auto_weekend_event_active('growcup',now()) then return jsonb_build_object('ok',false,'reason','GROWCUP_INACTIVE'); end if;

 select * into r from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev for update;
 if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 select value into choice
 from jsonb_array_elements(recovery_private.v8210_phase_choices(r.phase))
 where value->>'id'=cid limit 1;
 if choice is null then return jsonb_build_object('ok',false,'reason','INVALID_CHOICE'); end if;

 q:=least(100,greatest(0,r.quality+coalesce((choice->>'quality')::int,0)));
 y:=least(100,greatest(0,r.yield_score+coalesce((choice->>'yield')::int,0)));
 rs:=least(100,greatest(0,r.resin+coalesce((choice->>'resin')::int,0)));
 g:=least(100,greatest(0,r.genetics+coalesce((choice->>'genetics')::int,0)));
 h:=least(100,greatest(0,r.health+coalesce((choice->>'health')::int,0)));

 -- A small server-side event layer makes each run different without using character power or premium resources.
 event_roll:=random();
 if event_roll<0.12 then
   event_name:='Perfekte Entwicklung';event_text:='Die Pflanze reagiert außergewöhnlich gut.';event_delta:=3;
   q:=least(100,q+3);rs:=least(100,rs+3);h:=least(100,h+2);
 elsif event_roll<0.20 then
   event_name:='Starker Phänotyp';event_text:='Die Genetik zeigt besonders stabile Merkmale.';event_delta:=3;
   g:=least(100,g+4);q:=least(100,q+2);
 elsif event_roll<0.27 then
   event_name:='Leichter Stress';event_text:='Die Pflanze verliert kurz an Vitalität.';event_delta:=-3;
   h:=greatest(0,h-4);q:=greatest(0,q-2);
 elsif event_roll<0.32 then
   event_name:='Trichom-Schub';event_text:='Die Harzproduktion zieht sichtbar an.';event_delta:=4;
   rs:=least(100,rs+5);
 end if;

 if r.phase>=6 then
   score:=round((q+y+rs+g+h)::numeric/5.0,2);
   tr:=recovery_private.v8210_tier(score);
   if score>=92 and not r.personal_reward_awarded then
     personal_runes:=1;personal_shards:=10;
     insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
     update recovery_private.v8198_enchant_wallet
       set runes=runes+personal_runes,rune_shards=rune_shards+personal_shards,revision=revision+1,updated_at=now()
       where user_id=u;
   end if;
   update recovery_private.v8210_growcup_runs set
     status='completed',quality=q,yield_score=y,resin=rs,genetics=g,health=h,
     choices=choices||jsonb_build_array(cid),
     history=history||jsonb_build_array(jsonb_build_object('phase',phase,'choice_id',cid,'choice_title',choice->>'title','event',nullif(event_name,''),'event_text',nullif(event_text,''),'event_delta',event_delta)),
     final_score=score,tier=tr,personal_reward_awarded=(personal_reward_awarded or score>=92),
     completed_at=now(),revision=revision+1,updated_at=now()
   where user_id=u and event_key=ev;
 else
   update recovery_private.v8210_growcup_runs set
     quality=q,yield_score=y,resin=rs,genetics=g,health=h,
     choices=choices||jsonb_build_array(cid),
     history=history||jsonb_build_array(jsonb_build_object('phase',phase,'choice_id',cid,'choice_title',choice->>'title','event',nullif(event_name,''),'event_text',nullif(event_text,''),'event_delta',event_delta)),
     phase=phase+1,revision=revision+1,updated_at=now()
   where user_id=u and event_key=ev;
 end if;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'choice:'||cid,out);
 return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_claim_rank_reward(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();
 req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date;
 r recovery_private.v8210_growcup_runs%rowtype;
 rank_no integer;
 rew jsonb;
 rr integer; ss integer;
 out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select event_key into ev from recovery_private.v8210_growcup_runs
 where user_id=u and status='completed' and not rank_reward_claimed
 order by event_key desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_UNCLAIMED_CUP'); end if;
 if public.v7102_auto_weekend_event_active('growcup',now()) and ev=recovery_private.v8210_event_key(now()) then
   return jsonb_build_object('ok',false,'reason','RANKING_NOT_FINAL');
 end if;

 select * into r from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev for update;
 select z.rnk into rank_no from (
   select user_id,row_number() over(order by final_score desc,completed_at asc,user_id)::int rnk
   from recovery_private.v8210_growcup_runs where event_key=ev and status='completed'
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
 where user_id=u and event_key=ev;

 out:=jsonb_build_object('ok',true,'event_key',ev,'rank',rank_no,'runes_awarded',rr,'shards_awarded',ss);
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'rank_reward',out);
 return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_leaderboard(p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();
 ev date;
 rows jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if public.v7102_auto_weekend_event_active('growcup',now()) then
   ev:=recovery_private.v8210_event_key(now());
 else
   select max(event_key) into ev from recovery_private.v8210_growcup_runs where status='completed';
 end if;
 if ev is null then return jsonb_build_object('ok',true,'event_key',null,'rows','[]'::jsonb); end if;
 select coalesce(jsonb_agg(to_jsonb(z) order by z.rank),'[]'::jsonb) into rows
 from (
   select row_number() over(order by r.final_score desc,r.completed_at asc,r.user_id)::int as rank,
          coalesce(p.character_name,'Legende') as player,
          r.cup_seed,
          r.final_score,
          r.tier
   from recovery_private.v8210_growcup_runs r
   left join public.profiles p on p.id=r.user_id
   where r.event_key=ev and r.status='completed'
   order by r.final_score desc,r.completed_at asc,r.user_id
   limit greatest(1,least(100,coalesce(p_limit,100)))
 ) z;
 return jsonb_build_object('ok',true,'event_key',ev,'rows',rows);
end
$function$;

CREATE OR REPLACE FUNCTION public.v8210_growcup_start(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();
 req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date:=recovery_private.v8210_event_key(now());
 out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;
 if not public.v7102_auto_weekend_event_active('growcup',now()) then return jsonb_build_object('ok',false,'reason','GROWCUP_INACTIVE'); end if;

 insert into recovery_private.v8210_growcup_runs(user_id,event_key,cup_seed)
 values(u,ev,recovery_private.v8210_seed_name(ev))
 on conflict(user_id,event_key) do nothing;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'start',out);
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
 u uuid:=auth.uid();
 active boolean;
 ev date;
 r jsonb;
 w recovery_private.v8198_enchant_wallet%rowtype;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 active:=public.v7102_auto_weekend_event_active('growcup',now());
 ev:=recovery_private.v8210_event_key(now());
 if active then
   r:=recovery_private.v8210_public_run(u,ev);
 else
   select event_key into ev
   from recovery_private.v8210_growcup_runs
   where user_id=u order by event_key desc limit 1;
   if ev is not null then r:=recovery_private.v8210_public_run(u,ev); else r:=null; end if;
 end if;
 insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
 select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
 return jsonb_build_object(
   'ok',true,'active',active,'next_event',recovery_private.v8210_next_growcup(now()),
   'event_key',case when active then recovery_private.v8210_event_key(now()) else ev end,
   'cup_seed',recovery_private.v8210_seed_name(case when active then recovery_private.v8210_event_key(now()) else coalesce(ev,recovery_private.v8210_event_key(now())) end),
   'runes',w.runes,'rune_shards',w.rune_shards,'run',r
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_event_key(p_at timestamp with time zone DEFAULT now())
 RETURNS date
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select (p_at at time zone 'Europe/Berlin')::date
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_next_growcup(p_at timestamp with time zone DEFAULT now())
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  base_date date := (p_at at time zone 'Europe/Berlin')::date;
  d date;
  i integer;
  monday date;
  week_index integer;
  cycle integer;
begin
  for i in 0..21 loop
    d:=base_date+i;
    if extract(isodow from d)::integer=7 then
      monday:=d-6;
      week_index:=((monday-date '2026-09-14')/7)::integer;
      cycle:=((week_index%2)+2)%2;
      if cycle=1 and (d>base_date or not public.v7102_auto_weekend_event_active('growcup',p_at)) then
        return (d::timestamp at time zone 'Europe/Berlin');
      end if;
    end if;
  end loop;
  return ((base_date+14)::timestamp at time zone 'Europe/Berlin');
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_phase_choices(p_phase integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
begin
  return case greatest(1,least(6,p_phase))
  when 1 then jsonb_build_array(
    jsonb_build_object('id','p1_balanced','title','Sanfte Keimung','icon','💧','text','Stabiler Start mit sauberer Feuchte.','quality',4,'yield',2,'resin',1,'genetics',5,'health',6),
    jsonb_build_object('id','p1_warm','title','Warmer Start','icon','🌡️','text','Schneller Austrieb, dafür etwas mehr Stress.','quality',1,'yield',7,'resin',2,'genetics',3,'health',5),
    jsonb_build_object('id','p1_root','title','Wurzelfokus','icon','🌱','text','Langsamer, aber besonders stabiles Fundament.','quality',3,'yield',3,'resin',1,'genetics',7,'health',4)
  )
  when 2 then jsonb_build_array(
    jsonb_build_object('id','p2_light','title','Licht hochfahren','icon','💡','text','Mehr Wachstum und Harz, leichte Belastung.','quality',2,'yield',7,'resin',6,'genetics',2,'health',1),
    jsonb_build_object('id','p2_safe','title','Konstantes Licht','icon','☀️','text','Sehr gleichmäßige Entwicklung.','quality',5,'yield',3,'resin',3,'genetics',3,'health',4),
    jsonb_build_object('id','p2_rootzone','title','Wurzelzone optimieren','icon','🪴','text','Gesundheit und Stabilität vor Tempo.','quality',3,'yield',2,'resin',2,'genetics',5,'health',6)
  )
  when 3 then jsonb_build_array(
    jsonb_build_object('id','p3_top','title','Topping','icon','✂️','text','Mehr Haupttriebe, kurzzeitig höherer Stress.','quality',3,'yield',8,'resin',4,'genetics',2,'health',1),
    jsonb_build_object('id','p3_lst','title','LST Training','icon','🪢','text','Ausgewogene Krone und gute Lichtverteilung.','quality',5,'yield',5,'resin',4,'genetics',2,'health',2),
    jsonb_build_object('id','p3_natural','title','Natürlich wachsen','icon','🌿','text','Maximale Stabilität, weniger Eingriff.','quality',3,'yield',2,'resin',2,'genetics',6,'health',5)
  )
  when 4 then jsonb_build_array(
    jsonb_build_object('id','p4_feed','title','Blüte-Booster','icon','🧪','text','Viel Masse und Harz, Gesundheit wird gefordert.','quality',2,'yield',7,'resin',7,'genetics',2,'health',0),
    jsonb_build_object('id','p4_clean','title','Saubere Nährlösung','icon','💧','text','Qualität und Gesundheit bleiben im Fokus.','quality',6,'yield',3,'resin',3,'genetics',2,'health',4),
    jsonb_build_object('id','p4_genetic','title','Genetik stabilisieren','icon','🧬','text','Starker Phänotyp mit kontrollierter Blüte.','quality',4,'yield',2,'resin',3,'genetics',7,'health',2)
  )
  when 5 then jsonb_build_array(
    jsonb_build_object('id','p5_resin','title','Harz pushen','icon','✨','text','Maximale Trichome, etwas weniger Ertrag.','quality',4,'yield',1,'resin',9,'genetics',2,'health',2),
    jsonb_build_object('id','p5_mass','title','Ertrag halten','icon','⚖️','text','Dichte Blüten mit kontrollierter Belastung.','quality',3,'yield',8,'resin',4,'genetics',1,'health',2),
    jsonb_build_object('id','p5_stable','title','Reife stabilisieren','icon','🧬','text','Gesunde, gleichmäßige Endphase.','quality',5,'yield',2,'resin',3,'genetics',5,'health',3)
  )
  else jsonb_build_array(
    jsonb_build_object('id','p6_flush','title','Sauber spülen','icon','💧','text','Starker Qualitäts-Finish.','quality',8,'yield',1,'resin',3,'genetics',2,'health',4),
    jsonb_build_object('id','p6_late','title','Länger reifen lassen','icon','⏳','text','Mehr Harz und Gewicht, etwas riskanter.','quality',3,'yield',6,'resin',7,'genetics',1,'health',1),
    jsonb_build_object('id','p6_select','title','Selektive Ernte','icon','🏆','text','Die besten Blüten zuerst für die Jury.','quality',7,'yield',2,'resin',4,'genetics',4,'health',1)
  ) end;
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
begin
 select * into r from recovery_private.v8210_growcup_runs where user_id=p_uid and event_key=p_event;
 if not found then return null; end if;
 if r.status='completed' then
   select z.rnk into rank_no
   from (
     select user_id,row_number() over(order by final_score desc,completed_at asc,user_id) rnk
     from recovery_private.v8210_growcup_runs
     where event_key=p_event and status='completed'
   ) z where z.user_id=p_uid;
 end if;
 return jsonb_build_object(
   'event_key',r.event_key,'run_id',r.run_id,'status',r.status,'cup_seed',r.cup_seed,
   'phase',r.phase,
   'metrics',jsonb_build_object('quality',r.quality,'yield',r.yield_score,'resin',r.resin,'genetics',r.genetics,'health',r.health),
   'choices',case when r.status='active' then recovery_private.v8210_phase_choices(r.phase) else '[]'::jsonb end,
   'history',r.history,'final_score',r.final_score,'tier',r.tier,
   'personal_reward_awarded',r.personal_reward_awarded,'rank_reward_claimed',r.rank_reward_claimed,
   'rank',rank_no,'rank_reward',case when rank_no is null then null else recovery_private.v8210_rank_reward(rank_no) end,
   'revision',r.revision,'started_at',r.started_at,'completed_at',r.completed_at
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_rank_reward(p_rank integer)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select case
    when p_rank=1 then jsonb_build_object('runes',3,'shards',30)
    when p_rank=2 then jsonb_build_object('runes',2,'shards',25)
    when p_rank=3 then jsonb_build_object('runes',2,'shards',20)
    when p_rank between 4 and 10 then jsonb_build_object('runes',1,'shards',15)
    when p_rank between 11 and 25 then jsonb_build_object('runes',0,'shards',12)
    when p_rank between 26 and 50 then jsonb_build_object('runes',0,'shards',8)
    when p_rank between 51 and 100 then jsonb_build_object('runes',0,'shards',5)
    else jsonb_build_object('runes',0,'shards',0)
  end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_seed_name(p_event date)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  names text[]:=array['Cup Widow','Golden Haze','Black Kush','Emerald Dream','Purple Crown','Northern Gold'];
  ix integer;
begin
  ix:=1+mod(abs(p_event-date '2026-01-01'),array_length(names,1));
  return names[ix];
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_tier(p_score numeric)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select case
    when p_score>=92 then 'champion'
    when p_score>=88 then 'master'
    when p_score>=82 then 'gold'
    when p_score>=74 then 'silver'
    else 'bronze'
  end
$function$;

revoke all on function public.v8210_growcup_state() from public,anon;
revoke all on function public.v8210_growcup_start(text) from public,anon;
revoke all on function public.v8210_growcup_choose(text,text) from public,anon;
revoke all on function public.v8210_growcup_leaderboard(integer) from public,anon;
revoke all on function public.v8210_growcup_claim_rank_reward(text) from public,anon;
grant execute on function public.v8210_growcup_state() to authenticated;
grant execute on function public.v8210_growcup_start(text) to authenticated;
grant execute on function public.v8210_growcup_choose(text,text) to authenticated;
grant execute on function public.v8210_growcup_leaderboard(integer) to authenticated;
grant execute on function public.v8210_growcup_claim_rank_reward(text) to authenticated;
