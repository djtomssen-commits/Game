-- Grow Legends V8.213 — Beta-only accelerated Grow Cup test mode
-- 6 real hours -> 6 test minutes for authorized Beta tester only.
-- Test runs grant no rewards and never enter the leaderboard.

alter table recovery_private.v8210_growcup_runs
  add column if not exists test_mode boolean not null default false;

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
 where user_id=u and rules_version=2 and status='completed' and not rank_reward_claimed and not test_mode
 order by event_key desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_UNCLAIMED_CUP'); end if;

 perform recovery_private.v8211_sync_expired(ev,now());
 if public.v7102_auto_weekend_event_active('growcup',now())
    or exists(select 1 from recovery_private.v8210_growcup_runs
      where event_key=ev and rules_version=2 and status='active' and not test_mode) then
   return jsonb_build_object('ok',false,'reason','RANKING_NOT_FINAL');
 end if;

 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=2 and not test_mode for update;
 select z.rnk into rank_no from (
   select user_id,row_number() over(order by final_score desc,completed_at asc,user_id)::int rnk
   from recovery_private.v8210_growcup_runs
   where event_key=ev and rules_version=2 and status='completed' and not test_mode
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
 where user_id=u and event_key=ev and rules_version=2 and not test_mode;
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
   select max(event_key) into ev from recovery_private.v8210_growcup_runs where rules_version=2 and not test_mode;
 end if;
 if ev is null then return jsonb_build_object('ok',true,'event_key',null,'rows','[]'::jsonb,'final',false); end if;
 perform recovery_private.v8211_sync_expired(ev,now());
 final:=not public.v7102_auto_weekend_event_active('growcup',now())
   and not exists(
     select 1 from recovery_private.v8210_growcup_runs
     where event_key=ev and rules_version=2 and status='active' and not test_mode
   );
 select coalesce(jsonb_agg(to_jsonb(z) order by z.rank),'[]'::jsonb) into rows
 from (
   select row_number() over(order by r.final_score desc,r.completed_at asc,r.user_id)::int as rank,
          coalesce(p.character_name,'Legende') as player,r.cup_seed,r.final_score,r.tier
   from recovery_private.v8210_growcup_runs r
   left join public.profiles p on p.id=r.user_id
   where r.event_key=ev and r.rules_version=2 and r.status='completed' and not r.test_mode
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
   0,now(),null,now(),2,recovery_private.v8211_new_phenotype(),'{}'::jsonb,false
 )
 on conflict(user_id,event_key) do update set
   status=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 'active' else recovery_private.v8210_growcup_runs.status end,
   phase=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 1 else recovery_private.v8210_growcup_runs.phase end,
   quality=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.quality end,
   yield_score=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.yield_score end,
   resin=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.resin end,
   genetics=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.genetics end,
   health=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then 70 else recovery_private.v8210_growcup_runs.health end,
   history=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then '[]'::jsonb else recovery_private.v8210_growcup_runs.history end,
   final_score=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.final_score end,
   tier=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.tier end,
   personal_reward_awarded=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then false else recovery_private.v8210_growcup_runs.personal_reward_awarded end,
   rank_reward_claimed=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then false else recovery_private.v8210_growcup_runs.rank_reward_claimed end,
   started_at=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then now() else recovery_private.v8210_growcup_runs.started_at end,
   completed_at=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then null else recovery_private.v8210_growcup_runs.completed_at end,
   updated_at=now(),rules_version=2,test_mode=false,
   phenotype=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then recovery_private.v8211_new_phenotype() else recovery_private.v8210_growcup_runs.phenotype end,
   phase_records=case when recovery_private.v8210_growcup_runs.rules_version=1 or recovery_private.v8210_growcup_runs.test_mode then '{}'::jsonb else recovery_private.v8210_growcup_runs.phase_records end;

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
   where user_id=u and rules_version=2 and status='active'
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
 phase_seconds integer; open_seconds integer; rec jsonb; out jsonb;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
 if p_light_minutes<0 or p_light_minutes>60 then return jsonb_build_object('ok',false,'reason','LIGHT_RANGE'); end if;
 if p_water_ml<0 or p_water_ml>400 then return jsonb_build_object('ok',false,'reason','WATER_RANGE'); end if;
 if p_nutrient_ml<0 or p_nutrient_ml>10 then return jsonb_build_object('ok',false,'reason','NUTRIENT_RANGE'); end if;

 select * into old from recovery_private.v8210_growcup_ledger where user_id=u and request_id=req;
 if found then return old.payload; end if;

 select event_key into ev from recovery_private.v8210_growcup_runs
 where user_id=u and rules_version=2 and status='active'
 order by started_at desc limit 1;
 if ev is null then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_CUP_RUN'); end if;

 perform recovery_private.v8211_sync_run(u,ev,now());
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=u and event_key=ev and rules_version=2 for update;
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
 if found and existing.rules_version=2 and not existing.test_mode then
   return jsonb_build_object('ok',false,'reason','REAL_RUN_EXISTS');
 end if;

 insert into recovery_private.v8210_growcup_runs(
   user_id,event_key,cup_seed,status,phase,quality,yield_score,resin,genetics,health,
   choices,history,final_score,tier,personal_reward_awarded,rank_reward_claimed,
   revision,started_at,completed_at,updated_at,rules_version,phenotype,phase_records,test_mode
 ) values(
   u,ev,recovery_private.v8210_seed_name(ev),'active',1,70,70,70,70,70,
   '[]'::jsonb,'[]'::jsonb,null,null,false,false,
   0,now(),null,now(),2,recovery_private.v8211_new_phenotype(),'{}'::jsonb,true
 )
 on conflict(user_id,event_key) do update set
   status='active',phase=1,quality=70,yield_score=70,resin=70,genetics=70,health=70,
   choices='[]'::jsonb,history='[]'::jsonb,final_score=null,tier=null,
   personal_reward_awarded=false,rank_reward_claimed=false,revision=recovery_private.v8210_growcup_runs.revision+1,
   started_at=now(),completed_at=null,updated_at=now(),rules_version=2,
   phenotype=recovery_private.v8211_new_phenotype(),phase_records='{}'::jsonb,test_mode=true;

 out:=public.v8210_growcup_state();
 insert into recovery_private.v8210_growcup_ledger(user_id,request_id,action,payload)
 values(u,req,'test_start_v8213',out);
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
 rec jsonb; last_settings jsonb; window_state text; now_at timestamptz:=now();
 clues jsonb;
begin
 perform recovery_private.v8211_sync_run(p_uid,p_event,now_at);
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=2;
 if not found then return null; end if;

 phase_seconds:=recovery_private.v8213_phase_seconds(r.test_mode);
 open_seconds:=recovery_private.v8213_care_open_seconds(r.test_mode);
 phase_no:=case when r.status='completed' then 6
   else greatest(1,least(6,floor(greatest(0,extract(epoch from (now_at-r.started_at)))/phase_seconds)::int+1)) end;
 phase_start:=r.started_at+make_interval(secs=>(phase_no-1)*phase_seconds);
 open_at:=phase_start+make_interval(secs=>open_seconds);
 end_at:=phase_start+make_interval(secs=>phase_seconds);
 rec:=coalesce(r.phase_records->phase_no::text,'{}'::jsonb);
 last_settings:=recovery_private.v8211_last_settings(r.phase_records,phase_no);
 clues:=case when r.status='active' then recovery_private.v8211_phase_clues(phase_no,r.phenotype,last_settings) else '[]'::jsonb end;

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
     where event_key=p_event and rules_version=2 and status='completed' and not test_mode
   ) z where z.user_id=p_uid;
 end if;

 return jsonb_build_object(
   'event_key',r.event_key,'run_id',r.run_id,'status',r.status,'cup_seed',r.cup_seed,
   'phase',phase_no,'rules_version',r.rules_version,'test_mode',r.test_mode,
   'metrics',jsonb_build_object('quality',r.quality,'yield',r.yield_score,'resin',r.resin,'genetics',r.genetics,'health',r.health),
   'history',r.history,'final_score',r.final_score,'tier',r.tier,
   'personal_reward_awarded',r.personal_reward_awarded,'rank_reward_claimed',r.rank_reward_claimed,
   'rank',rank_no,'rank_reward',case when rank_no is null then null else recovery_private.v8210_rank_reward(rank_no) end,
   'revision',r.revision,'started_at',r.started_at,'completed_at',r.completed_at,
   'run_ends_at',r.started_at+make_interval(secs=>phase_seconds*6),
   'phase_started_at',phase_start,'decision_opens_at',open_at,'phase_ends_at',end_at,
   'window_state',window_state,
   'phase_record',case when rec='{}'::jsonb then null else rec end,
   'last_settings',last_settings,'clues',clues,'server_now',now_at
 );
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
 rec jsonb; settings jsonb; score jsonb; del jsonb;
 records jsonb; hist jsonb;
 q integer; y integer; rs integer; g integer; h integer;
 source_text text;
 final numeric; tr text; champion boolean:=false;
begin
 select * into r from recovery_private.v8210_growcup_runs
 where user_id=p_uid and event_key=p_event and rules_version=2 for update;
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
   phase=case when elapsed>=total_seconds then 6 else greatest(1,least(6,floor(elapsed/phase_seconds)::int+1)) end,
   quality=q,yield_score=y,resin=rs,genetics=g,health=h,
   phase_records=records,history=hist,revision=revision+1,updated_at=p_at
 where user_id=p_uid and event_key=p_event and rules_version=2;

 if elapsed>=total_seconds and ended=6 then
   final:=round((q+y+rs+g+h)::numeric/5.0,2);
   tr:=recovery_private.v8210_tier(final);
   champion:=final>=92 and not r.personal_reward_awarded and not r.test_mode;
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

CREATE OR REPLACE FUNCTION recovery_private.v8213_care_open_seconds(p_test boolean)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$ select case when p_test then 45 else 2700 end $function$;

CREATE OR REPLACE FUNCTION recovery_private.v8213_is_beta_tester(p_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists(
    select 1 from public.profiles
    where id=p_uid and lower(coalesce(character_name,''))='tomssen'
  )
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8213_phase_seconds(p_test boolean)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$ select case when p_test then 60 else 3600 end $function$;


revoke all on function public.v8213_growcup_test_start(text) from public,anon;
grant execute on function public.v8213_growcup_test_start(text) to authenticated;
