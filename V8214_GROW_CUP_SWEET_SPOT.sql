-- Grow Legends V8.214 — one action / one hidden sweet spot per phase
-- Six actions, max 600 points. Sweet spots are server-only and rotate by event date.

drop function if exists public.v8210_growcup_tune(integer,integer,numeric,text);

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
 where user_id=u and rules_version=3 and status='completed' and not rank_reward_claimed and not test_mode
 order by event_key desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_UNCLAIMED_CUP'); end if;

 perform recovery_private.v8211_sync_expired(ev,now());
 if public.v7102_auto_weekend_event_active('growcup',now())
    or exists(select 1 from recovery_private.v8210_growcup_runs
      where event_key=ev and rules_version=3 and status='active' and not test_mode) then
   return jsonb_build_object('ok',false,'reason','RANKING_NOT_FINAL');
 end if;

 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=3 and not test_mode for update;
 select z.rnk into rank_no from (
   select user_id,row_number() over(order by final_score desc,completed_at asc,user_id)::int rnk
   from recovery_private.v8210_growcup_runs
   where event_key=ev and rules_version=3 and status='completed' and not test_mode
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
 where user_id=u and event_key=ev and rules_version=3 and not test_mode;
 out:=jsonb_build_object('ok',true,'event_key',ev,'rank',rank_no,'runes_awarded',rr,'shards_awarded',ss);
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'rank_reward_v3',out);
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
   select max(event_key) into ev from recovery_private.v8210_growcup_runs where rules_version=3 and not test_mode;
 end if;
 if ev is null then return jsonb_build_object('ok',true,'event_key',null,'rows','[]'::jsonb,'final',false); end if;
 perform recovery_private.v8211_sync_expired(ev,now());
 final:=not public.v7102_auto_weekend_event_active('growcup',now())
   and not exists(
     select 1 from recovery_private.v8210_growcup_runs
     where event_key=ev and rules_version=3 and status='active' and not test_mode
   );
 select coalesce(jsonb_agg(to_jsonb(z) order by z.rank),'[]'::jsonb) into rows
 from (
   select row_number() over(order by r.final_score desc,r.completed_at asc,r.user_id)::int as rank,
          coalesce(p.character_name,'Legende') as player,r.cup_seed,r.final_score,r.tier
   from recovery_private.v8210_growcup_runs r
   left join public.profiles p on p.id=r.user_id
   where r.event_key=ev and r.rules_version=3 and r.status='completed' and not r.test_mode
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
   revision,started_at,completed_at,updated_at,rules_version,phenotype,phase_records,test_mode
 ) values(
   u,ev,recovery_private.v8210_seed_name(ev),'active',1,70,70,70,70,70,
   '[]'::jsonb,'[]'::jsonb,null,null,false,false,
   0,now(),null,now(),3,'{}'::jsonb,'{}'::jsonb,false
 )
 on conflict(user_id,event_key) do update set
   status=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 'active' else recovery_private.v8210_growcup_runs.status end,
   phase=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 1 else recovery_private.v8210_growcup_runs.phase end,
   quality=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.quality end,
   yield_score=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.yield_score end,
   resin=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.resin end,
   genetics=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.genetics end,
   health=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.health end,
   history=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then '[]'::jsonb else recovery_private.v8210_growcup_runs.history end,
   final_score=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.final_score end,
   tier=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.tier end,
   personal_reward_awarded=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then false else recovery_private.v8210_growcup_runs.personal_reward_awarded end,
   rank_reward_claimed=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then false else recovery_private.v8210_growcup_runs.rank_reward_claimed end,
   started_at=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then now() else recovery_private.v8210_growcup_runs.started_at end,
   completed_at=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.completed_at end,
   updated_at=now(),rules_version=3,test_mode=false,phenotype='{}'::jsonb,
   phase_records=case when recovery_private.v8210_growcup_runs.rules_version<>3 or recovery_private.v8210_growcup_runs.test_mode then '{}'::jsonb else recovery_private.v8210_growcup_runs.phase_records end;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'start_v3',out);
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

 if not exists(select 1 from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev and rules_version=3) then
   select event_key into ev from recovery_private.v8210_growcup_runs
   where user_id=u and rules_version=3 and status='active'
   order by started_at desc limit 1;
 end if;
 if ev is null and active then ev:=recovery_private.v8210_event_key(now()); end if;
 if ev is not null then r:=recovery_private.v8210_public_run(u,ev); else r:=null; end if;

 insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
 select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
 return jsonb_build_object(
   'ok',true,'active',active,'test_eligible',recovery_private.v8213_is_beta_tester(u),
   'next_event',recovery_private.v8210_next_growcup(now()),
   'event_key',ev,
   'cup_seed',recovery_private.v8210_seed_name(coalesce(ev,recovery_private.v8210_event_key(now()))),
   'runes',w.runes,'rune_shards',w.rune_shards,'run',r,'server_now',now()
 );
end
$function$;

CREATE OR REPLACE FUNCTION public.v8213_growcup_test_start(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); req text:=left(btrim(coalesce(p_request_id,'')),160);
 old recovery_private.v8210_growcup_ledger%rowtype;
 ev date:=recovery_private.v8210_event_key(now()); existing recovery_private.v8210_growcup_runs%rowtype; out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if not recovery_private.v8213_is_beta_tester(u) then return jsonb_build_object('ok',false,'reason','TEST_NOT_ALLOWED'); end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select * into existing from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev for update;
 if found and existing.rules_version=3 and not existing.test_mode then
   return jsonb_build_object('ok',false,'reason','REAL_RUN_EXISTS');
 end if;

 insert into recovery_private.v8210_growcup_runs(
   user_id,event_key,cup_seed,status,phase,quality,yield_score,resin,genetics,health,
   choices,history,final_score,tier,personal_reward_awarded,rank_reward_claimed,
   revision,started_at,completed_at,updated_at,rules_version,phenotype,phase_records,test_mode
 ) values(
   u,ev,recovery_private.v8210_seed_name(ev),'active',1,70,70,70,70,70,
   '[]'::jsonb,'[]'::jsonb,null,null,false,false,
   0,now(),null,now(),3,'{}'::jsonb,'{}'::jsonb,true
 )
 on conflict(user_id,event_key) do update set
   status='active',phase=1,quality=70,yield_score=70,resin=70,genetics=70,health=70,
   choices='[]'::jsonb,history='[]'::jsonb,final_score=null,tier=null,
   personal_reward_awarded=false,rank_reward_claimed=false,revision=recovery_private.v8210_growcup_runs.revision+1,
   started_at=now(),completed_at=null,updated_at=now(),rules_version=3,
   phenotype='{}'::jsonb,phase_records='{}'::jsonb,test_mode=true;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'test_start_v8214',out);
 return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8214_growcup_submit(p_value numeric, p_request_id text)
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
 phase_seconds integer; open_seconds integer; rec jsonb; out jsonb; action jsonb;
 minv numeric; maxv numeric; stepv numeric; scaled numeric;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;

 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select event_key into ev from recovery_private.v8210_growcup_runs
 where user_id=u and rules_version=3 and status='active'
 order by started_at desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 perform recovery_private.v8211_sync_run(u,ev,now());
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=3 for update;
 if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 phase_seconds:=recovery_private.v8213_phase_seconds(r.test_mode);
 open_seconds:=recovery_private.v8213_care_open_seconds(r.test_mode);
 elapsed:=greatest(0,extract(epoch from (now()-r.started_at)));
 phase_no:=greatest(1,least(6,floor(elapsed/phase_seconds)::int+1));
 phase_start:=r.started_at+make_interval(secs=>(phase_no-1)*phase_seconds);
 open_at:=phase_start+make_interval(secs=>open_seconds);
 end_at:=phase_start+make_interval(secs=>phase_seconds);

 if now()<open_at then return jsonb_build_object('ok',false,'reason','CARE_TOO_EARLY','opens_at',open_at); end if;
 if now()>=end_at then return jsonb_build_object('ok',false,'reason','CARE_WINDOW_CLOSED'); end if;

 action:=recovery_private.v8214_action_public(phase_no);
 minv:=(action->>'min')::numeric; maxv:=(action->>'max')::numeric; stepv:=(action->>'step')::numeric;
 if p_value<minv or p_value>maxv then return jsonb_build_object('ok',false,'reason','VALUE_RANGE'); end if;
 scaled:=(p_value-minv)/stepv;
 if abs(scaled-round(scaled))>0.00001 then return jsonb_build_object('ok',false,'reason','VALUE_STEP'); end if;

 rec:=r.phase_records->phase_no::text;
 if rec is not null and coalesce(rec->>'status','')='submitted' then
   return jsonb_build_object('ok',false,'reason','CARE_ALREADY_SET');
 end if;

 rec:=jsonb_build_object(
   'phase',phase_no,'action_id',action->>'id','status','submitted','source','player','scored',false,
   'value',p_value,'submitted_at',now()
 );
 update recovery_private.v8210_growcup_runs set
   phase_records=jsonb_set(coalesce(phase_records,'{}'::jsonb),array[phase_no::text],rec,true),
   revision=revision+1,updated_at=now()
 where user_id=u and event_key=ev and rules_version=3;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'submit_p'||phase_no,out);
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
 phase_seconds integer; open_seconds integer;
 rec jsonb; window_state text; now_at timestamptz:=now();
 action jsonb; visible_record jsonb; total_so_far integer:=0; results jsonb:='[]'::jsonb;
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

 visible_record:=case
   when rec='{}'::jsonb then null
   else (rec-'score'-'scored_at')
 end;

 return jsonb_build_object(
   'event_key',r.event_key,'run_id',r.run_id,'status',r.status,'cup_seed',r.cup_seed,
   'phase',phase_no,'rules_version',r.rules_version,'test_mode',r.test_mode,
   'metrics',jsonb_build_object('quality',r.quality,'yield',r.yield_score,'resin',r.resin,'genetics',r.genetics,'health',r.health),
   'final_score',r.final_score,'max_score',600,'tier',r.tier,
   'personal_reward_awarded',r.personal_reward_awarded,'rank_reward_claimed',r.rank_reward_claimed,
   'rank',rank_no,'rank_reward',case when rank_no is null then null else recovery_private.v8210_rank_reward(rank_no) end,
   'revision',r.revision,'started_at',r.started_at,'completed_at',r.completed_at,
   'run_ends_at',r.started_at+make_interval(secs=>phase_seconds*6),
   'phase_started_at',phase_start,'decision_opens_at',open_at,'phase_ends_at',end_at,
   'window_state',window_state,'action',action,'phase_record',visible_record,
   'results',case when r.status='completed' then results else '[]'::jsonb end,
   'server_now',now_at
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_tier(p_score numeric)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
 select case
   when p_score>=552 then 'champion'
   when p_score>=528 then 'master'
   when p_score>=492 then 'gold'
   when p_score>=444 then 'silver'
   else 'bronze'
 end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8211_sync_expired(p_event date, p_at timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'recovery_private', 'pg_temp'
AS $function$
declare x record; max_seconds integer;
begin
 for x in
   select user_id,test_mode,started_at
   from recovery_private.v8210_growcup_runs
   where event_key=p_event and rules_version=3 and status='active'
 loop
   max_seconds:=recovery_private.v8213_phase_seconds(x.test_mode)*6;
   if x.started_at+make_interval(secs=>max_seconds)<=p_at then
     perform recovery_private.v8211_sync_run(x.user_id,p_event,p_at);
   end if;
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
 elapsed numeric; ended integer; p integer; phase_seconds integer; total_seconds integer;
 rec jsonb; records jsonb; hist jsonb; effect jsonb;
 q integer; y integer; rs integer; g integer; h integer;
 action_score integer; total_score integer:=0;
 final numeric; tr text; champion boolean:=false;
begin
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=3 for update;
 if not found or r.status='completed' then return; end if;

 phase_seconds:=recovery_private.v8213_phase_seconds(r.test_mode);
 total_seconds:=phase_seconds*6;
 elapsed:=greatest(0,extract(epoch from (p_at-r.started_at)));
 ended:=least(6,greatest(0,floor(elapsed/phase_seconds)::int));
 records:=coalesce(r.phase_records,'{}'::jsonb);
 hist:=coalesce(r.history,'[]'::jsonb);
 q:=r.quality;y:=r.yield_score;rs:=r.resin;g:=r.genetics;h:=r.health;

 if ended>0 then
  for p in 1..ended loop
   rec:=records->p::text;
   if coalesce((rec->>'scored')::boolean,false) then continue; end if;

   if rec is null or coalesce(rec->>'status','')<>'submitted' then
     action_score:=0;
     rec:=jsonb_build_object(
       'phase',p,'status','missed','source','missed','scored',true,
       'score',0,'scored_at',p_at
     );
   else
     action_score:=recovery_private.v8214_score_action(
       p_event,p,(rec->>'value')::numeric
     );
     rec:=rec||jsonb_build_object(
       'scored',true,'scored_at',p_at,'score',action_score
     );
   end if;

   effect:=recovery_private.v8214_apply_plant_effect(p,action_score,q,y,rs,g,h);
   q:=(effect->>'quality')::int;
   y:=(effect->>'yield')::int;
   rs:=(effect->>'resin')::int;
   g:=(effect->>'genetics')::int;
   h:=(effect->>'health')::int;

   records:=jsonb_set(records,array[p::text],rec,true);
   hist:=hist||jsonb_build_array(jsonb_build_object(
     'phase',p,'kind','action_result','source',coalesce(rec->>'source','player')
   ));
  end loop;
 end if;

 update recovery_private.v8210_growcup_runs set
   phase=case when elapsed>=total_seconds then 6 else greatest(1,least(6,floor(elapsed/phase_seconds)::int+1)) end,
   quality=q,yield_score=y,resin=rs,genetics=g,health=h,
   phase_records=records,history=hist,revision=revision+1,updated_at=p_at
 where user_id=p_uid and event_key=p_event and rules_version=3;

 if elapsed>=total_seconds and ended=6 then
   select coalesce(sum((value->>'score')::int),0)::int into total_score
   from jsonb_each(records)
   where value ? 'score';

   final:=total_score;
   tr:=recovery_private.v8210_tier(final);
   champion:=final>=552 and not r.personal_reward_awarded and not r.test_mode;
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
   where user_id=p_uid and event_key=p_event and rules_version=3;
 end if;
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
 raw bytea; seed bigint; idx integer; target numeric;
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

 raw:=decode(md5(p_event::text||':growcup:v8214:'||ph::text),'hex');
 seed:=(get_byte(raw,0)::bigint*16777216)
      +(get_byte(raw,1)::bigint*65536)
      +(get_byte(raw,2)::bigint*256)
      + get_byte(raw,3)::bigint;
 idx:=low_idx+mod(seed,slots)::int;
 target:=minv+(idx*stepv);

 return jsonb_build_object(
   'id',id,'title',title,'icon',icon,'unit',unit,'description',descr,
   'min',minv,'max',maxv,'step',stepv,'target',target
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8214_action_public(p_phase integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare x jsonb;
begin
 x:=recovery_private.v8214_action_full(date '2026-01-01',p_phase);
 return x-'target';
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8214_apply_plant_effect(p_phase integer, p_score integer, p_quality integer, p_yield integer, p_resin integer, p_genetics integer, p_health integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 d integer:=greatest(-5,least(5,round((p_score-50)::numeric/10)::int));
 q integer:=p_quality; y integer:=p_yield; r integer:=p_resin; g integer:=p_genetics; h integer:=p_health;
begin
 case greatest(1,least(6,p_phase))
  when 1 then q:=q+d; h:=h+d;
  when 2 then y:=y+d; h:=h+d;
  when 3 then y:=y+d; r:=r+d;
  when 4 then y:=y+d; g:=g+d;
  when 5 then r:=r+d; h:=h+d;
  else q:=q+d; r:=r+d;
 end case;
 return jsonb_build_object(
  'quality',greatest(0,least(100,q)),
  'yield',greatest(0,least(100,y)),
  'resin',greatest(0,least(100,r)),
  'genetics',greatest(0,least(100,g)),
  'health',greatest(0,least(100,h))
 );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8214_score_action(p_event date, p_phase integer, p_value numeric)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
 x jsonb:=recovery_private.v8214_action_full(p_event,p_phase);
 target numeric:=(x->>'target')::numeric;
 minv numeric:=(x->>'min')::numeric;
 maxv numeric:=(x->>'max')::numeric;
 maxdist numeric;
 score numeric;
begin
 maxdist:=greatest(target-minv,maxv-target);
 if maxdist<=0 then return 100; end if;
 score:=100*(1-(abs(p_value-target)/maxdist));
 return greatest(0,least(100,round(score)::int));
end
$function$;


revoke all on function public.v8214_growcup_submit(numeric,text) from public,anon;
grant execute on function public.v8214_growcup_submit(numeric,text) to authenticated;
