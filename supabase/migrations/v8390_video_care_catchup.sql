-- V8.390: Care windows crossed only by Google-signed rewarded grow skip
-- can be manually performed until harvest, never auto-completed.
-- Normal windows and Server1 without signed-video flags stay unchanged.
BEGIN;

CREATE OR REPLACE FUNCTION public.v8388_grow_rewarded_apply_verified(p_user_id uuid, p_plant_uid text, p_provider_event_id text, p_provider text DEFAULT 'admob'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
DECLARE
  ss public.player_seed_state%rowtype;
  plant jsonb;
  old_event recovery_private.v8388_grow_rewarded_events%rowtype;
  w numeric := 1;
  pindex integer := -1;
  pos integer := 0;
  used integer;
  previous_start bigint;
  duration_ms bigint;
  now_ms bigint;
  remaining_ms bigint;
  delta_ms bigint;
  new_start bigint;
  new_uses integer;
  -- V8.390: only verified rewarded skips protect crossed care windows.
  old_progress numeric;
  new_progress numeric;
  care_done jsonb;
  care_catchups jsonb;
  care_index integer;
  care_end numeric[] := array[.45,.70,.88,1.00];
  pid text := btrim(coalesce(p_plant_uid,''));
  tid text := btrim(coalesce(p_provider_event_id,''));
BEGIN
  IF p_user_id IS NULL OR lower(coalesce(p_provider,'')) <> 'admob'
    OR pid !~ '^srv_grow_[0-9a-f]{32}$' OR length(tid)<8 OR length(tid)>256 THEN
    RETURN jsonb_build_object('ok',false,'reason','INVALID_SIGNED_REWARD');
  END IF;
  -- Serialization point: both the counter and the immutable Google event ledger
  -- are updated atomically under the user's canonical Grow plant row lock.
  SELECT * INTO ss FROM public.player_seed_state
    WHERE user_id=p_user_id AND guard_enabled FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.player_grow_state WHERE user_id=p_user_id AND guard_enabled) THEN RETURN jsonb_build_object('ok',false,'reason','GROW_GUARD_NOT_ENABLED'); END IF;
  SELECT * INTO old_event FROM recovery_private.v8388_grow_rewarded_events
    WHERE provider='admob' AND provider_event_id=tid;
  IF FOUND THEN
    IF old_event.user_id<>p_user_id OR old_event.plant_uid<>pid THEN
      RETURN jsonb_build_object('ok',false,'reason','EVENT_ALREADY_USED');
    END IF;
    RETURN jsonb_build_object('ok',true,'alreadyApplied',true,'plant_uid',pid,
      'useCount',old_event.slot,'maxUses',3,'msSkipped',old_event.skipped_ms);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.player_grow_plant_events e
    WHERE e.user_id=p_user_id AND e.plant_uid=pid AND e.harvested_at IS NULL
  ) THEN
    RETURN jsonb_build_object('ok',false,'reason','UNVERIFIED_OR_HARVESTED_PLANT');
  END IF;
  FOR plant IN SELECT value FROM jsonb_array_elements(coalesce(ss.plants,'[]'::jsonb)) LOOP
    IF plant IS NOT NULL AND jsonb_typeof(plant)='object' AND plant->>'uid'=pid THEN
      pindex:=pos; EXIT;
    END IF;
    pos:=pos+1;
  END LOOP;
  IF pindex<0 THEN RETURN jsonb_build_object('ok',false,'reason','PLANT_NOT_ACTIVE'); END IF;
  IF plant->>'v6358ServerPlant'<>'true' THEN
    RETURN jsonb_build_object('ok',false,'reason','PLANT_NOT_SERVER_VERIFIED');
  END IF;
  used:=greatest(0,least(3,coalesce((plant->>'v8388VideoUses')::integer,0)));
  IF used>=3 THEN
    RETURN jsonb_build_object('ok',true,'alreadyApplied',true,
      'reason','PLANT_VIDEO_LIMIT','plant_uid',pid,'useCount',3,'maxUses',3);
  END IF;
  SELECT greatest(.80,least(1.30,coalesce(grow_mul,1))) INTO w
    FROM public.game_weather_state WHERE id=1;
  w:=coalesce(w,1);
  previous_start:=coalesce((plant->>'start')::bigint,0);
  duration_ms:=greatest(1,coalesce((plant->>'duration')::bigint,0));
  now_ms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
  remaining_ms:=greatest(0,ceil(previous_start+duration_ms/w-now_ms)::bigint);
  IF remaining_ms<=0 THEN
    RETURN jsonb_build_object('ok',false,'reason','PLANT_ALREADY_READY','plant_uid',pid);
  END IF;
  -- Every ad skips one-quarter of the ORIGINAL growth length. Weather
  -- affects the real-time value, but is not altered by the reward.
  delta_ms:=least(remaining_ms,greatest(1,round(duration_ms*.25/w)::bigint));
  new_start:=previous_start-delta_ms;
  -- Signed-video-only entitlement stored atomically in the server plant.
  old_progress:=((now_ms-previous_start)*w)/duration_ms;
  new_progress:=((now_ms-new_start)*w)/duration_ms;
  care_done:=coalesce(plant->'care','[false,false,false,false]'::jsonb);
  care_catchups:=case
    when jsonb_typeof(plant->'v8390CareCatchup')='array'
      then case when jsonb_array_length(plant->'v8390CareCatchup')=4
           then plant->'v8390CareCatchup'
           else '[false,false,false,false]'::jsonb end
    else '[false,false,false,false]'::jsonb end;
  FOR care_index IN 0..3 LOOP
    IF old_progress < care_end[care_index+1]
       AND new_progress >= care_end[care_index+1]
       AND coalesce(care_done->>care_index,'false') <> 'true' THEN
      care_catchups:=jsonb_set(care_catchups,array[care_index::text],'true'::jsonb,true);
    END IF;
  END LOOP;
  new_uses:=used+1;
  plant:=jsonb_set(plant,'{start}',to_jsonb(new_start),true);
  plant:=jsonb_set(plant,'{v8388VideoUses}',to_jsonb(new_uses),true);
  plant:=jsonb_set(plant,'{v8390CareCatchup}',care_catchups,true);
  plant:=jsonb_set(plant,'{v8388VideoSkippedMs}',
    to_jsonb(greatest(0,coalesce((plant->>'v8388VideoSkippedMs')::bigint,0))+delta_ms),true);
  ss.plants:=jsonb_set(ss.plants,array[pindex::text],plant,true);
  INSERT INTO recovery_private.v8388_grow_rewarded_events(
    provider,provider_event_id,user_id,plant_uid,slot,skipped_ms
  ) VALUES('admob',tid,p_user_id,pid,new_uses,delta_ms);
  UPDATE public.player_seed_state SET plants=ss.plants,revision=revision+1,updated_at=now()
    WHERE user_id=p_user_id RETURNING * INTO ss;
  RETURN jsonb_build_object('ok',true,'alreadyApplied',false,'plant_uid',pid,
    'useCount',new_uses,'maxUses',3,'msSkipped',delta_ms,'plants',ss.plants,
    'revision',ss.revision);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.v6358_care_plant(p_plant_uid text, p_care_index integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();pid text:=left(btrim(coalesce(p_plant_uid,'')),180);ci int:=coalesce(p_care_index,-1);
 ss public.player_seed_state%rowtype;w public.game_weather_state%rowtype;
 p jsonb;idx int:=-1;ord int:=0;nowms bigint;startms bigint;dur bigint;prog numeric;
 starts numeric[]:=array[.20,.45,.70,.88];ends numeric[]:=array[.45,.70,.88,1.00];
 care jsonb;done jsonb;
 -- V8.390: only a protected window may be redeemed after normal expiry.
 video_catchup jsonb;can_catch_up boolean:=false;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if ci<0 or ci>3 or char_length(pid)<4 then return jsonb_build_object('ok',false,'reason','INVALID_CARE'); end if;

 select * into ss from public.player_seed_state where user_id=u for update;
 if not found or not ss.guard_enabled then raise exception 'SEED_GUARD_NOT_ENABLED'; end if;
 select * into w from public.game_weather_state where id=1;

 ord:=0;
 for p in select value from jsonb_array_elements(ss.plants) loop
   if p is not null and p<>'null'::jsonb and p->>'uid'=pid then idx:=ord;exit;end if;
   ord:=ord+1;
 end loop;
 if idx<0 then return jsonb_build_object('ok',false,'reason','PLANT_NOT_FOUND'); end if;
 if not exists(select 1 from public.player_grow_plant_events where user_id=u and plant_uid=pid and harvested_at is null) then
   return jsonb_build_object('ok',false,'reason','UNVERIFIED_PLANT');
 end if;
 if exists(select 1 from public.player_grow_care_events where user_id=u and plant_uid=pid and care_index=ci) then
   return jsonb_build_object('ok',true,'duplicate',true,'plants',ss.plants);
 end if;

 startms:=(p->>'start')::bigint;dur:=greatest(1,(p->>'duration')::bigint);
 nowms:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
 prog:=greatest(0,((nowms-startms)*greatest(.80,least(1.30,coalesce(w.grow_mul,1))))/dur);
 video_catchup:=p->'v8390CareCatchup';
 can_catch_up:=pid ~ '^srv_grow_[0-9a-f]{32}$'
   and jsonb_typeof(video_catchup)='array'
   and coalesce(video_catchup->>ci,'false')='true';
 if prog + ((3000*greatest(.80,least(1.30,coalesce(w.grow_mul,1))))/dur) < starts[ci+1] then
   return jsonb_build_object('ok',false,'reason','CARE_TOO_EARLY','progress',round(prog,4),'required',starts[ci+1]);
 end if;
 if not can_catch_up and prog>ends[ci+1]+((12000*greatest(.80,least(1.30,coalesce(w.grow_mul,1))))/dur) then
   return jsonb_build_object('ok',false,'reason','CARE_WINDOW_MISSED','progress',round(prog,4));
 end if;

 care:=coalesce(p->'care','[false,false,false,false]'::jsonb);
 done:=coalesce(p->'careDoneAt','[0,0,0,0]'::jsonb);
 care:=jsonb_set(care,array[ci::text],'true'::jsonb,true);
 done:=jsonb_set(done,array[ci::text],to_jsonb(nowms),true);
 p:=jsonb_set(p,'{care}',care,true);
 p:=jsonb_set(p,'{careDoneAt}',done,true);
 if can_catch_up then
   video_catchup:=jsonb_set(video_catchup,array[ci::text],'false'::jsonb,true);
   p:=jsonb_set(p,'{v8390CareCatchup}',video_catchup,true);
 end if;
 ss.plants:=jsonb_set(ss.plants,array[idx::text],p,true);

 insert into public.player_grow_care_events(user_id,plant_uid,care_index,done_at,progress)
 values(u,pid,ci,now(),least(1,prog));

 update public.player_seed_state set plants=ss.plants,revision=revision+1,updated_at=now()
 where user_id=u returning * into ss;

 return jsonb_build_object('ok',true,'plant_uid',pid,'care_index',ci,'progress',round(prog,4),'videoCatchup',can_catch_up,'plants',ss.plants,'revision',ss.revision);
end;
$function$
;
COMMIT;
