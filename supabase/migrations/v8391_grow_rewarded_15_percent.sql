-- V8.391 Beta: 3 signed videos per plant, each skips only 15% of original growth time.
-- Existing V8.390 care-catchup flags remain unchanged. No player data updates.
-- Server1 RPC/HTML and AdMob SSV signature verification remain unchanged.
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
  -- V8.391: Every signed ad skips 15 percent of the ORIGINAL growth length. Weather
  -- affects the real-time value, but is not altered by the reward.
  delta_ms:=least(remaining_ms,greatest(1,round(duration_ms*.15/w)::bigint));
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

COMMIT;
