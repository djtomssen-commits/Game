-- Grow Legends V8.290 standalone admin backend.
-- Existing game_admins RBAC enforced on every RPC call.
-- Authenticated users can EXECUTE only; non-admin IDs rejected before any query.
-- Live writes use server-side idempotent currency credit RPCs and private audit.
-- Settings use revision compare-and-swap with reason; no direct player save overwrites.
-- All other game systems are read-only until dedicated owner commands exist.
CREATE TABLE IF NOT EXISTS recovery_private.v8290_admin_console_actions (request_id uuid PRIMARY KEY,actor_id uuid NOT NULL,target_user uuid,action text NOT NULL,payload jsonb NOT NULL DEFAULT '{}'::jsonb,result jsonb,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
REVOKE ALL ON recovery_private.v8290_admin_console_actions FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.v8290_admin_console(p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'public', 'recovery_private', 'pg_temp'
AS $function$
DECLARE
 v_uid uuid:=auth.uid();
 v_action text:=lower(trim(coalesce(p_action,'')));
 v_payload jsonb:=coalesce(p_payload,'{}'::jsonb);
 v_user uuid;
 v_query text;
 v_result jsonb;
 v_before jsonb;
 v_after jsonb;
 v_key text;
 v_reason text;
 v_revision bigint;
 v_value numeric;
 v_count int;
 v_bots int;
 v_gold bigint;
 v_harz integer;
 v_event uuid;
 v_gold_response jsonb;
 v_harz_response jsonb;
 v_record record;
BEGIN
 IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.game_admins a WHERE a.user_id=v_uid)
 THEN RAISE EXCEPTION 'ADMIN_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF v_action='whoami' THEN
   RETURN jsonb_build_object('ok',true,'isAdmin',true,'server','beta');
 ELSIF v_action='overview' THEN
   v_bots:=0;
   SELECT count(*) INTO v_count FROM public.profiles;
   RETURN jsonb_build_object('ok',true,'server','beta',
      'players',v_count,'bots',v_bots,
      'alerts',(SELECT count(*) FROM recovery_private.v8287_loss_watch_alerts),
      'recentAlerts',(SELECT count(*) FROM recovery_private.v8287_loss_watch_alerts WHERE detected_at>now()-interval '24 hours'),
      'purchaseCount',(SELECT count(*) FROM public.google_play_purchases WHERE server_id='beta' AND verified_at IS NOT NULL),
      'activeEvents',(SELECT count(*) FROM public.game_events WHERE is_active AND starts_at<=now() AND ends_at>=now()),
      'auditEvents',(SELECT count(*) FROM recovery_private.v8285_value_change_audit),
      'lastWatch',(SELECT max(finished_at) FROM recovery_private.v8287_loss_watch_runs),
      'questDampfChance',(SELECT value FROM recovery_private.v8289_admin_settings WHERE key='quest_energy_harz_chance'));
 ELSIF v_action='settings' THEN
   SELECT coalesce(jsonb_agg(jsonb_build_object('key',s.key,'value',s.value,'revision',s.revision,
     'updatedAt',s.updated_at,'editable',s.key='quest_energy_harz_chance',
     'title',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Harz-Taler pro 100 Quest-Dampf (0/1)' ELSE 'Zusätzliche Harz-Taler-Dropchance pro Quest' END,
     'description',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Beim Erreichen von 100 Dampf: Chance auf exakt +1 Harz-Taler.' ELSE 'Aktuell noch fest im Quest-Owner, nur lesbar.' END)
     ORDER BY s.key),'[]'::jsonb) INTO v_result FROM recovery_private.v8289_admin_settings s;
   RETURN jsonb_build_object('ok',true,'settings',v_result);
 ELSIF v_action='set_setting' THEN
   v_key:=coalesce(v_payload->>'key','');
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   IF v_key<>'quest_energy_harz_chance' THEN RAISE EXCEPTION 'SETTING_NOT_EDITABLE';END IF;
   IF length(v_reason)<8 OR length(v_reason)>400 THEN RAISE EXCEPTION 'REASON_LENGTH_INVALID';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'beta' THEN
     RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION'; END IF;
   v_value:=(v_payload->>'value')::numeric;
   v_revision:=(v_payload->>'expected_revision')::bigint;
   IF v_value IS NULL OR v_value<0 OR v_value>1 THEN RAISE EXCEPTION 'SETTING_OUT_OF_RANGE';END IF;
   SELECT to_jsonb(s) INTO v_before FROM recovery_private.v8289_admin_settings s WHERE key=v_key FOR UPDATE;
   IF v_before IS NULL OR (v_before->>'revision')::bigint IS DISTINCT FROM v_revision THEN
     RAISE EXCEPTION 'SETTING_VERSION_CONFLICT';END IF;
   UPDATE recovery_private.v8289_admin_settings SET value=to_jsonb(v_value),revision=revision+1,updated_by=v_uid,
     reason=v_reason,updated_at=clock_timestamp() WHERE key=v_key RETURNING to_jsonb(recovery_private.v8289_admin_settings.*) INTO v_after;
   INSERT INTO recovery_private.v8290_admin_console_actions(request_id,actor_id,action,payload,result)
    VALUES(gen_random_uuid(),v_uid,'set_setting',
      jsonb_build_object('reason',v_reason,'key',v_key,'before',v_before->'value','after',v_after->'value'),
      jsonb_build_object('revision',v_after->'revision'));
   RETURN jsonb_build_object('ok',true,'key',v_key,'value',v_after->'value','revision',v_after->'revision');
 ELSIF v_action='players' THEN
   v_query:=left(trim(coalesce(v_payload->>'query','')),80);
   IF length(v_query)<2 THEN RETURN jsonb_build_object('ok',true,'players','[]'::jsonb);END IF;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.character_name,
      'level',p.level,'class',p.class_id,'combatPower',p.combat_power,
      'gold',w.gold,'harz',w.harz_taler,'itemRevision',i.revision)
     ORDER BY p.level DESC),'[]'::jsonb) INTO v_result
   FROM (SELECT * FROM public.profiles
      WHERE character_name ILIKE '%'||v_query||'%' ORDER BY level DESC LIMIT 40) p
   LEFT JOIN public.player_progress_trusted w ON w.user_id=p.id
   LEFT JOIN public.player_item_state i ON i.user_id=p.id;
   RETURN jsonb_build_object('ok',true,'players',v_result);
 ELSIF v_action='player' THEN
   v_user:=(v_payload->>'user_id')::uuid;
   SELECT jsonb_build_object('id',p.id,'name',p.character_name,'level',p.level,'class',p.class_id,
     'gold',w.gold,'harz',w.harz_taler,'dampf',q.energy,'questDampf',q.quest_energy,
     'inventory',i.inventory,'equipment',i.equipment,'itemRevision',i.revision,
     'towerBest',t.best_floor,'towerScore',t.best_score,'towerRuns',t.runs,
     'protected',jsonb_build_object('items',i.guard_enabled,'gold',w.gold_guard_enabled,'premium',w.harz_guard_enabled))
     INTO v_result
   FROM public.profiles p
    LEFT JOIN public.player_progress_trusted w ON w.user_id=p.id
    LEFT JOIN public.player_item_state i ON i.user_id=p.id
    LEFT JOIN public.player_quest_state q ON q.user_id=p.id
    LEFT JOIN public.player_tower_state t ON t.user_id=p.id
   WHERE p.id=v_user;
   IF v_result IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND'; END IF;
   RETURN jsonb_build_object('ok',true,'player',v_result);
 ELSIF v_action='alerts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.event_at DESC),'[]'::jsonb) INTO v_result FROM (
     SELECT a.id,a.domain,a.rule,a.severity,a.event_at,a.detected_at,a.before_summary,a.after_summary,
       p.character_name AS player_name
     FROM recovery_private.v8287_loss_watch_alerts a
     LEFT JOIN public.profiles p ON p.id=a.user_id
     ORDER BY a.detected_at DESC LIMIT 60) t;
   RETURN jsonb_build_object('ok',true,'alerts',v_result);
 ELSIF v_action='audit' THEN
   v_user:=NULLIF(v_payload->>'user_id','')::uuid;
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.recorded_at DESC),'[]'::jsonb) INTO v_result FROM(
      SELECT a.id,a.domain,a.operation,a.recorded_at,a.revision_before,a.revision_after,
       a.transaction_id,p.character_name AS player_name,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.before_state->'gold','harz',a.before_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.before_state->'inventory','[]'::jsonb)),'equipment',a.before_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_before) END AS previous,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.after_state->'gold','harz',a.after_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.after_state->'inventory','[]'::jsonb)),'equipment',a.after_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_after) END AS current
      FROM recovery_private.v8285_value_change_audit a
      LEFT JOIN public.profiles p ON p.id=a.user_id
      WHERE v_user IS NULL OR a.user_id=v_user
      ORDER BY a.recorded_at DESC LIMIT 60)t;
   RETURN jsonb_build_object('ok',true,'changes',v_result);
 ELSIF v_action='events' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.starts_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT name,description,is_active,starts_at,ends_at
     FROM public.game_events ORDER BY starts_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'events',v_result);
 ELSIF v_action='broadcasts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT title,kind,is_published,created_at,allow_comment FROM public.admin_broadcasts ORDER BY created_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'broadcasts',v_result);
 ELSIF v_action='bot_status' THEN
   v_result:=jsonb_build_object('count',0,'message','Bots currently run only on Server1');
   RETURN jsonb_build_object('ok',true,'bots',v_result);
 ELSIF v_action='grant' THEN
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   v_user:=(v_payload->>'user_id')::uuid;
   v_event:=(v_payload->>'request_id')::uuid;
   v_gold:=coalesce((v_payload->>'gold')::bigint,0);
   v_harz:=coalesce((v_payload->>'harz')::integer,0);
   IF v_event IS NULL OR v_user IS NULL OR length(v_reason)<10 OR length(v_reason)>400 THEN RAISE EXCEPTION 'INVALID_GRANT_REQUEST';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'beta' THEN RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION';END IF;
   IF (v_payload->>'confirm_player') IS DISTINCT FROM v_user::text THEN RAISE EXCEPTION 'PLAYER_CONFIRMATION_REQUIRED';END IF;
   IF v_gold<0 OR v_gold>100000 OR v_harz<0 OR v_harz>250 OR (v_gold=0 AND v_harz=0) THEN RAISE EXCEPTION 'GRANT_AMOUNT_OUT_OF_RANGE';END IF;
   IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=v_user) THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND';END IF;
   INSERT INTO recovery_private.v8290_admin_console_actions
     (request_id,actor_id,target_user,action,payload)
   VALUES(v_event,v_uid,v_user,'grant',jsonb_build_object('gold',v_gold,'harz',v_harz,'reason',v_reason))
   ON CONFLICT(request_id) DO NOTHING;
   GET DIAGNOSTICS v_count=ROW_COUNT;
   IF v_count=0 THEN
     SELECT result INTO v_result FROM recovery_private.v8290_admin_console_actions WHERE request_id=v_event AND actor_id=v_uid;
     RETURN coalesce(v_result,jsonb_build_object('ok',false,'reason','REQUEST_ALREADY_PROCESSING'));
   END IF;
   IF v_gold>0 THEN
     v_gold_response:=public.v6358_server_award_gold(v_user,'v8290_admin_gold_'||v_event::text,'admin_console',v_gold,'admin_console:'||v_event::text);
   END IF;
   IF v_harz>0 THEN
     v_harz_response:=public.v6358_server_award_harz(v_user,'v8290_admin_harz_'||v_event::text,'admin_console',v_harz,'admin_console:'||v_event::text);
   END IF;
   /* V8.290: successful trusted awards must also synchronize the legacy
      display-only save mirror, without ever pulling saved balances backward. */
   UPDATE public.player_saves save
   SET save_data=jsonb_set(
       jsonb_set(coalesce(save.save_data,'{}'::jsonb),'{gold}',
         to_jsonb((SELECT gold FROM public.player_progress_trusted w WHERE w.user_id=v_user)),true),
       '{harzTaler}',
         to_jsonb((SELECT harz_taler FROM public.player_progress_trusted w WHERE w.user_id=v_user)),true),
       updated_at=now()
   WHERE save.user_id=v_user;
   SELECT jsonb_build_object('ok',true,'gold',v_gold_response,'harz',v_harz_response,'requestId',v_event)
     INTO v_result;
   UPDATE recovery_private.v8290_admin_console_actions SET result=v_result WHERE request_id=v_event;
   RETURN v_result;
 ELSE
   RAISE EXCEPTION 'UNKNOWN_ADMIN_ACTION';
 END IF;
END;
$function$;
REVOKE ALL ON FUNCTION public.v8290_admin_console(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.v8290_admin_console(text,jsonb) TO authenticated;

CREATE TABLE IF NOT EXISTS server1_private.v8290_admin_console_actions (request_id uuid PRIMARY KEY,actor_id uuid NOT NULL,target_user uuid,action text NOT NULL,payload jsonb NOT NULL DEFAULT '{}'::jsonb,result jsonb,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
REVOKE ALL ON server1_private.v8290_admin_console_actions FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION server1.v8290_admin_console(p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'server1_private', 'pg_temp'
AS $function$
DECLARE
 v_uid uuid:=auth.uid();
 v_action text:=lower(trim(coalesce(p_action,'')));
 v_payload jsonb:=coalesce(p_payload,'{}'::jsonb);
 v_user uuid;
 v_query text;
 v_result jsonb;
 v_before jsonb;
 v_after jsonb;
 v_key text;
 v_reason text;
 v_revision bigint;
 v_value numeric;
 v_count int;
 v_bots int;
 v_gold bigint;
 v_harz integer;
 v_event uuid;
 v_gold_response jsonb;
 v_harz_response jsonb;
 v_record record;
BEGIN
 IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM server1.game_admins a WHERE a.user_id=v_uid)
 THEN RAISE EXCEPTION 'ADMIN_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF v_action='whoami' THEN
   RETURN jsonb_build_object('ok',true,'isAdmin',true,'server','server1');
 ELSIF v_action='overview' THEN
   SELECT count(*) INTO v_bots FROM server1_private.v8243_bot_agents;
   SELECT count(*) INTO v_count FROM server1.profiles;
   RETURN jsonb_build_object('ok',true,'server','server1',
      'players',v_count,'bots',v_bots,
      'alerts',(SELECT count(*) FROM server1_private.v8287_loss_watch_alerts),
      'recentAlerts',(SELECT count(*) FROM server1_private.v8287_loss_watch_alerts WHERE detected_at>now()-interval '24 hours'),
      'purchaseCount',(SELECT count(*) FROM public.google_play_purchases WHERE server_id='server1' AND verified_at IS NOT NULL),
      'activeEvents',(SELECT count(*) FROM server1.game_events WHERE is_active AND starts_at<=now() AND ends_at>=now()),
      'auditEvents',(SELECT count(*) FROM server1_private.v8285_value_change_audit),
      'lastWatch',(SELECT max(finished_at) FROM server1_private.v8287_loss_watch_runs),
      'questDampfChance',(SELECT value FROM server1_private.v8289_admin_settings WHERE key='quest_energy_harz_chance'));
 ELSIF v_action='settings' THEN
   SELECT coalesce(jsonb_agg(jsonb_build_object('key',s.key,'value',s.value,'revision',s.revision,
     'updatedAt',s.updated_at,'editable',s.key='quest_energy_harz_chance',
     'title',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Harz-Taler pro 100 Quest-Dampf (0/1)' ELSE 'Zusätzliche Harz-Taler-Dropchance pro Quest' END,
     'description',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Beim Erreichen von 100 Dampf: Chance auf exakt +1 Harz-Taler.' ELSE 'Aktuell noch fest im Quest-Owner, nur lesbar.' END)
     ORDER BY s.key),'[]'::jsonb) INTO v_result FROM server1_private.v8289_admin_settings s;
   RETURN jsonb_build_object('ok',true,'settings',v_result);
 ELSIF v_action='set_setting' THEN
   v_key:=coalesce(v_payload->>'key','');
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   IF v_key<>'quest_energy_harz_chance' THEN RAISE EXCEPTION 'SETTING_NOT_EDITABLE';END IF;
   IF length(v_reason)<8 OR length(v_reason)>400 THEN RAISE EXCEPTION 'REASON_LENGTH_INVALID';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'server1' THEN
     RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION'; END IF;
   v_value:=(v_payload->>'value')::numeric;
   v_revision:=(v_payload->>'expected_revision')::bigint;
   IF v_value IS NULL OR v_value<0 OR v_value>1 THEN RAISE EXCEPTION 'SETTING_OUT_OF_RANGE';END IF;
   SELECT to_jsonb(s) INTO v_before FROM server1_private.v8289_admin_settings s WHERE key=v_key FOR UPDATE;
   IF v_before IS NULL OR (v_before->>'revision')::bigint IS DISTINCT FROM v_revision THEN
     RAISE EXCEPTION 'SETTING_VERSION_CONFLICT';END IF;
   UPDATE server1_private.v8289_admin_settings SET value=to_jsonb(v_value),revision=revision+1,updated_by=v_uid,
     reason=v_reason,updated_at=clock_timestamp() WHERE key=v_key RETURNING to_jsonb(server1_private.v8289_admin_settings.*) INTO v_after;
   INSERT INTO server1_private.v8290_admin_console_actions(request_id,actor_id,action,payload,result)
    VALUES(gen_random_uuid(),v_uid,'set_setting',
      jsonb_build_object('reason',v_reason,'key',v_key,'before',v_before->'value','after',v_after->'value'),
      jsonb_build_object('revision',v_after->'revision'));
   RETURN jsonb_build_object('ok',true,'key',v_key,'value',v_after->'value','revision',v_after->'revision');
 ELSIF v_action='players' THEN
   v_query:=left(trim(coalesce(v_payload->>'query','')),80);
   IF length(v_query)<2 THEN RETURN jsonb_build_object('ok',true,'players','[]'::jsonb);END IF;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.character_name,
      'level',p.level,'class',p.class_id,'combatPower',p.combat_power,
      'gold',w.gold,'harz',w.harz_taler,'itemRevision',i.revision)
     ORDER BY p.level DESC),'[]'::jsonb) INTO v_result
   FROM (SELECT * FROM server1.profiles
      WHERE character_name ILIKE '%'||v_query||'%' ORDER BY level DESC LIMIT 40) p
   LEFT JOIN server1.player_progress_trusted w ON w.user_id=p.id
   LEFT JOIN server1.player_item_state i ON i.user_id=p.id;
   RETURN jsonb_build_object('ok',true,'players',v_result);
 ELSIF v_action='player' THEN
   v_user:=(v_payload->>'user_id')::uuid;
   SELECT jsonb_build_object('id',p.id,'name',p.character_name,'level',p.level,'class',p.class_id,
     'gold',w.gold,'harz',w.harz_taler,'dampf',q.energy,'questDampf',q.quest_energy,
     'inventory',i.inventory,'equipment',i.equipment,'itemRevision',i.revision,
     'towerBest',t.best_floor,'towerScore',t.best_score,'towerRuns',t.runs,
     'protected',jsonb_build_object('items',i.guard_enabled,'gold',w.gold_guard_enabled,'premium',w.harz_guard_enabled))
     INTO v_result
   FROM server1.profiles p
    LEFT JOIN server1.player_progress_trusted w ON w.user_id=p.id
    LEFT JOIN server1.player_item_state i ON i.user_id=p.id
    LEFT JOIN server1.player_quest_state q ON q.user_id=p.id
    LEFT JOIN server1.player_tower_state t ON t.user_id=p.id
   WHERE p.id=v_user;
   IF v_result IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND'; END IF;
   RETURN jsonb_build_object('ok',true,'player',v_result);
 ELSIF v_action='alerts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.event_at DESC),'[]'::jsonb) INTO v_result FROM (
     SELECT a.id,a.domain,a.rule,a.severity,a.event_at,a.detected_at,a.before_summary,a.after_summary,
       p.character_name AS player_name
     FROM server1_private.v8287_loss_watch_alerts a
     LEFT JOIN server1.profiles p ON p.id=a.user_id
     ORDER BY a.detected_at DESC LIMIT 60) t;
   RETURN jsonb_build_object('ok',true,'alerts',v_result);
 ELSIF v_action='audit' THEN
   v_user:=NULLIF(v_payload->>'user_id','')::uuid;
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.recorded_at DESC),'[]'::jsonb) INTO v_result FROM(
      SELECT a.id,a.domain,a.operation,a.recorded_at,a.revision_before,a.revision_after,
       a.transaction_id,p.character_name AS player_name,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.before_state->'gold','harz',a.before_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.before_state->'inventory','[]'::jsonb)),'equipment',a.before_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_before) END AS previous,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.after_state->'gold','harz',a.after_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.after_state->'inventory','[]'::jsonb)),'equipment',a.after_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_after) END AS current
      FROM server1_private.v8285_value_change_audit a
      LEFT JOIN server1.profiles p ON p.id=a.user_id
      WHERE v_user IS NULL OR a.user_id=v_user
      ORDER BY a.recorded_at DESC LIMIT 60)t;
   RETURN jsonb_build_object('ok',true,'changes',v_result);
 ELSIF v_action='events' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.starts_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT name,description,is_active,starts_at,ends_at
     FROM server1.game_events ORDER BY starts_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'events',v_result);
 ELSIF v_action='broadcasts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT title,kind,is_published,created_at,allow_comment FROM server1.admin_broadcasts ORDER BY created_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'broadcasts',v_result);
 ELSIF v_action='bot_status' THEN
   SELECT jsonb_build_object('count',count(*),'active',count(*) FILTER(WHERE lifecycle='active'),'errors',count(*) FILTER(WHERE last_error IS NOT NULL AND last_error<>''),'lastAction',max(last_action_at)) INTO v_result FROM server1_private.v8243_bot_agents;
   RETURN jsonb_build_object('ok',true,'bots',v_result);
 ELSIF v_action='grant' THEN
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   v_user:=(v_payload->>'user_id')::uuid;
   v_event:=(v_payload->>'request_id')::uuid;
   v_gold:=coalesce((v_payload->>'gold')::bigint,0);
   v_harz:=coalesce((v_payload->>'harz')::integer,0);
   IF v_event IS NULL OR v_user IS NULL OR length(v_reason)<10 OR length(v_reason)>400 THEN RAISE EXCEPTION 'INVALID_GRANT_REQUEST';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'server1' THEN RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION';END IF;
   IF (v_payload->>'confirm_player') IS DISTINCT FROM v_user::text THEN RAISE EXCEPTION 'PLAYER_CONFIRMATION_REQUIRED';END IF;
   IF v_gold<0 OR v_gold>100000 OR v_harz<0 OR v_harz>250 OR (v_gold=0 AND v_harz=0) THEN RAISE EXCEPTION 'GRANT_AMOUNT_OUT_OF_RANGE';END IF;
   IF NOT EXISTS(SELECT 1 FROM server1.profiles WHERE id=v_user) THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND';END IF;
   INSERT INTO server1_private.v8290_admin_console_actions
     (request_id,actor_id,target_user,action,payload)
   VALUES(v_event,v_uid,v_user,'grant',jsonb_build_object('gold',v_gold,'harz',v_harz,'reason',v_reason))
   ON CONFLICT(request_id) DO NOTHING;
   GET DIAGNOSTICS v_count=ROW_COUNT;
   IF v_count=0 THEN
     SELECT result INTO v_result FROM server1_private.v8290_admin_console_actions WHERE request_id=v_event AND actor_id=v_uid;
     RETURN coalesce(v_result,jsonb_build_object('ok',false,'reason','REQUEST_ALREADY_PROCESSING'));
   END IF;
   IF v_gold>0 THEN
     v_gold_response:=server1.v6358_server_award_gold(v_user,'v8290_admin_gold_'||v_event::text,'admin_console',v_gold,'admin_console:'||v_event::text);
   END IF;
   IF v_harz>0 THEN
     v_harz_response:=server1.v6358_server_award_harz(v_user,'v8290_admin_harz_'||v_event::text,'admin_console',v_harz,'admin_console:'||v_event::text);
   END IF;
   /* V8.290: successful trusted awards must also synchronize the legacy
      display-only save mirror, without ever pulling saved balances backward. */
   UPDATE server1.player_saves save
   SET save_data=jsonb_set(
       jsonb_set(coalesce(save.save_data,'{}'::jsonb),'{gold}',
         to_jsonb((SELECT gold FROM server1.player_progress_trusted w WHERE w.user_id=v_user)),true),
       '{harzTaler}',
         to_jsonb((SELECT harz_taler FROM server1.player_progress_trusted w WHERE w.user_id=v_user)),true),
       updated_at=now()
   WHERE save.user_id=v_user;
   SELECT jsonb_build_object('ok',true,'gold',v_gold_response,'harz',v_harz_response,'requestId',v_event)
     INTO v_result;
   UPDATE server1_private.v8290_admin_console_actions SET result=v_result WHERE request_id=v_event;
   RETURN v_result;
 ELSE
   RAISE EXCEPTION 'UNKNOWN_ADMIN_ACTION';
 END IF;
END;
$function$;
REVOKE ALL ON FUNCTION server1.v8290_admin_console(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION server1.v8290_admin_console(text,jsonb) TO authenticated;
