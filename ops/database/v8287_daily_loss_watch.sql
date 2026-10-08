-- Grow Legends V8.287: automatic daily loss surveillance on both servers.
-- Generates private suspicion flags, not automated restitution or bans.
-- Replay-safe via unique audit_id + rule. Each scan checks transactional v8285 before/after history.
-- Tested with rolled-back artificial loss fixtures on beta and Server1; no player data modified by tests.
-- Daily pg_cron: beta 06:05 UTC; Server1 06:10 UTC.
-- Separate ChatGPT conditional reminder checks alerts and cron failures; not part of this SQL.
-- Watchlist covers bulk item wipes, vanished equipped gear, unexplained Gold/Harz decreases,
-- disappearance of multiple plants and cleared talent trees.
-- Audit histories may grow; define retention after operational review.
-- Read-only detection on existing game state; writes only run metadata and anomaly reports.

-- Beta: private anomaly logs. No direct client access.
CREATE TABLE IF NOT EXISTS recovery_private.v8287_loss_watch_alerts (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 audit_id bigint NOT NULL, user_id uuid NOT NULL, domain text NOT NULL,
 rule text NOT NULL, severity text NOT NULL CHECK (severity IN ('high','medium','low')),
 before_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 after_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 event_at timestamptz NOT NULL, detected_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(audit_id,rule)
);
CREATE INDEX IF NOT EXISTS v8287_loss_watch_alert_user_date ON recovery_private.v8287_loss_watch_alerts(user_id,detected_at DESC);
CREATE INDEX IF NOT EXISTS v8287_loss_watch_alert_detected ON recovery_private.v8287_loss_watch_alerts(detected_at DESC);
CREATE TABLE IF NOT EXISTS recovery_private.v8287_loss_watch_runs (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 finished_at timestamptz,
 scanned_changes integer NOT NULL DEFAULT 0,
 new_alerts integer NOT NULL DEFAULT 0
);
REVOKE ALL ON recovery_private.v8287_loss_watch_alerts,recovery_private.v8287_loss_watch_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE recovery_private.v8287_loss_watch_alerts_id_seq,recovery_private.v8287_loss_watch_runs_id_seq FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION recovery_private.v8287_count_items(p_state jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE n integer:=0;v jsonb;
BEGIN
 IF jsonb_typeof(p_state->'inventory')='array'
 THEN n:=n+jsonb_array_length(p_state->'inventory');END IF;
 IF jsonb_typeof(p_state->'equipment')='object'
 THEN
   FOR v IN SELECT value FROM jsonb_each(p_state->'equipment') LOOP
     IF v IS NOT NULL AND v<>'null'::jsonb THEN n:=n+1;END IF;
   END LOOP;
 END IF;
 RETURN n;
END;
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8287_equipped_count(p_equipment jsonb)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$ SELECT COUNT(*)::integer FROM jsonb_each(
 CASE WHEN jsonb_typeof(p_equipment)='object' THEN p_equipment ELSE '{}'::jsonb END
 ) e WHERE e.value IS NOT NULL AND e.value<>'null'::jsonb $function$;

CREATE OR REPLACE FUNCTION recovery_private.v8287_json_size(p jsonb)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
 SELECT CASE jsonb_typeof(p)
   WHEN 'object' THEN (SELECT COUNT(*)::integer FROM jsonb_object_keys(p))
   WHEN 'array' THEN jsonb_array_length(p)
   ELSE 0 END;
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8287_loss_watch_scan()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'recovery_private', 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
 evt RECORD;
 v_last timestamptz;
 v_run bigint;
 v_processed integer:=0;
 v_added integer:=0;
 v_n integer;
 v_rule text;
 v_severity text;
 v_before jsonb;
 v_after jsonb;
 old_count integer;
 new_count integer;
 old_equip integer;
 new_equip integer;
 v_old bigint;
 v_new bigint;
 v_ledger_match boolean;
BEGIN
 IF NOT pg_try_advisory_xact_lock(hashtext('recovery_private.v8287_loss_watch_scan')) THEN
   RETURN jsonb_build_object('server','public','ok',false,'reason','already_running');
 END IF;
 SELECT MAX(finished_at) INTO v_last FROM recovery_private.v8287_loss_watch_runs;
 INSERT INTO recovery_private.v8287_loss_watch_runs DEFAULT VALUES RETURNING id INTO v_run;
 FOR evt IN
   SELECT * FROM recovery_private.v8285_value_change_audit a
   WHERE a.operation='UPDATE' AND a.before_state IS NOT NULL AND a.after_state IS NOT NULL
     AND a.recorded_at >= COALESCE(v_last - INTERVAL '1 day',clock_timestamp() - INTERVAL '7 days')
     AND a.recorded_at < clock_timestamp() - interval '10 seconds'
   ORDER BY a.id
 LOOP
   v_processed:=v_processed+1;
   v_rule:=NULL;v_severity:=NULL;
   v_before:='{}'::jsonb;v_after:='{}'::jsonb;
   IF evt.domain='items' THEN
     old_count:=recovery_private.v8287_count_items(evt.before_state);
     new_count:=recovery_private.v8287_count_items(evt.after_state);
     old_equip:=recovery_private.v8287_equipped_count(evt.before_state->'equipment');
     new_equip:=recovery_private.v8287_equipped_count(evt.after_state->'equipment');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='FULL_ITEM_WIPE';v_severity:='high';
     ELSIF old_count>=4 AND new_count<=floor(old_count*.25) THEN
       v_rule:='BULK_ITEM_LOSS';v_severity:='high';
     ELSIF old_equip>=2 AND new_equip=0 AND new_count<old_count THEN
       v_rule:='EQUIPMENT_DISAPPEARED';v_severity:='high';
     END IF;
     v_before:=jsonb_build_object('itemCount',old_count,'equipmentSlots',old_equip,'revision',evt.revision_before);
     v_after:=jsonb_build_object('itemCount',new_count,'equipmentSlots',new_equip,'revision',evt.revision_after);
   ELSIF evt.domain='wallet' THEN
     v_old:=COALESCE((evt.before_state->>'gold')::bigint,0);
     v_new:=COALESCE((evt.after_state->>'gold')::bigint,0);
     IF v_old>v_new THEN
       SELECT EXISTS(SELECT 1 FROM public.player_gold_events e
         WHERE e.user_id=evt.user_id
           AND e.balance_before=v_old AND e.balance_after=v_new
           AND e.created_at BETWEEN evt.recorded_at-INTERVAL '30 seconds'
                               AND evt.recorded_at+INTERVAL '30 seconds')
       INTO v_ledger_match;
       IF NOT v_ledger_match THEN
         v_rule:='UNLEDGERED_GOLD_DECREASE';
         v_severity:=CASE WHEN v_old-v_new>=500 THEN 'high' ELSE 'medium' END;
       END IF;
     END IF;
     v_before:=jsonb_build_object('gold',v_old);
     v_after:=jsonb_build_object('gold',v_new);
     IF v_rule IS NOT NULL THEN
       v_before:=v_before||jsonb_build_object('harz',evt.before_state->'harz_taler');
       v_after:=v_after||jsonb_build_object('harz',evt.after_state->'harz_taler');
     END IF;
     IF v_rule='UNLEDGERED_GOLD_DECREASE' THEN
       INSERT INTO recovery_private.v8287_loss_watch_alerts
        (audit_id,user_id,domain,rule,severity,before_summary,after_summary,event_at)
       VALUES (evt.id,evt.user_id,evt.domain,v_rule,v_severity,v_before,v_after,evt.recorded_at)
       ON CONFLICT(audit_id,rule) DO NOTHING;
       GET DIAGNOSTICS v_n=ROW_COUNT;
       v_added:=v_added+v_n;
       v_rule:=NULL;
       v_severity:=NULL;
     END IF;
     -- Independent premium-currency rule; don't conflate it with gold.
     v_old:=COALESCE((evt.before_state->>'harz_taler')::bigint,0);
     v_new:=COALESCE((evt.after_state->>'harz_taler')::bigint,0);
     IF v_old>v_new THEN
       SELECT EXISTS(SELECT 1 FROM public.player_harz_events e
         WHERE e.user_id=evt.user_id
           AND e.balance_before=v_old AND e.balance_after=v_new
           AND e.created_at BETWEEN evt.recorded_at-INTERVAL '30 seconds'
                               AND evt.recorded_at+INTERVAL '30 seconds')
       INTO v_ledger_match;
       IF NOT v_ledger_match THEN
         -- A wallet update affecting both currencies is uncommon; keep the premium signal highest priority.
         v_rule:='UNLEDGERED_PREMIUM_DECREASE';
         v_severity:='high';
         v_before:=jsonb_build_object('gold',evt.before_state->'gold','harz',v_old);
         v_after:=jsonb_build_object('gold',evt.after_state->'gold','harz',v_new);
       END IF;
     END IF;
   ELSIF evt.domain='seeds' THEN
     old_count:=recovery_private.v8287_json_size(evt.before_state->'plants');
     new_count:=recovery_private.v8287_json_size(evt.after_state->'plants');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='ALL_PLANTS_DISAPPEARED';v_severity:='high';
     END IF;
     v_before:=jsonb_build_object('plants',old_count,'timeSeeds',evt.before_state->'time_seeds');
     v_after:=jsonb_build_object('plants',new_count,'timeSeeds',evt.after_state->'time_seeds');
   ELSIF evt.domain='build' THEN
     old_count:=recovery_private.v8287_json_size(evt.before_state->'talents');
     new_count:=recovery_private.v8287_json_size(evt.after_state->'talents');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='TALENT_TREE_CLEARED';v_severity:='medium';
     END IF;
     v_before:=jsonb_build_object('talentEntries',old_count,'revision',evt.revision_before);
     v_after:=jsonb_build_object('talentEntries',new_count,'revision',evt.revision_after);
   END IF;
   IF v_rule IS NOT NULL THEN
     INSERT INTO recovery_private.v8287_loss_watch_alerts
      (audit_id,user_id,domain,rule,severity,before_summary,after_summary,event_at)
     VALUES(evt.id,evt.user_id,evt.domain,v_rule,v_severity,v_before,v_after,evt.recorded_at)
     ON CONFLICT(audit_id,rule) DO NOTHING;
     GET DIAGNOSTICS v_n=ROW_COUNT;
     v_added:=v_added+v_n;
   END IF;
 END LOOP;
 UPDATE recovery_private.v8287_loss_watch_runs
    SET finished_at=clock_timestamp(),scanned_changes=v_processed,new_alerts=v_added
  WHERE id=v_run;
 RETURN jsonb_build_object('ok',true,'server','public','scanned',v_processed,
 'newAlerts',v_added,'runId',v_run);
END;
$function$;

REVOKE ALL ON FUNCTION recovery_private.v8287_loss_watch_scan(),
 recovery_private.v8287_count_items(jsonb),recovery_private.v8287_json_size(jsonb),recovery_private.v8287_equipped_count(jsonb)
 FROM PUBLIC, anon, authenticated;
-- UTC daily schedule; Berlin local time shifts with daylight saving.
SELECT cron.schedule('v8287-beta-loss-watch','5 6 * * *',$$SELECT recovery_private.v8287_loss_watch_scan();$$);

-- Server 1: private anomaly logs. No direct client access.
CREATE TABLE IF NOT EXISTS server1_private.v8287_loss_watch_alerts (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 audit_id bigint NOT NULL, user_id uuid NOT NULL, domain text NOT NULL,
 rule text NOT NULL, severity text NOT NULL CHECK (severity IN ('high','medium','low')),
 before_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 after_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
 event_at timestamptz NOT NULL, detected_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(audit_id,rule)
);
CREATE INDEX IF NOT EXISTS v8287_loss_watch_alert_user_date ON server1_private.v8287_loss_watch_alerts(user_id,detected_at DESC);
CREATE INDEX IF NOT EXISTS v8287_loss_watch_alert_detected ON server1_private.v8287_loss_watch_alerts(detected_at DESC);
CREATE TABLE IF NOT EXISTS server1_private.v8287_loss_watch_runs (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 finished_at timestamptz,
 scanned_changes integer NOT NULL DEFAULT 0,
 new_alerts integer NOT NULL DEFAULT 0
);
REVOKE ALL ON server1_private.v8287_loss_watch_alerts,server1_private.v8287_loss_watch_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE server1_private.v8287_loss_watch_alerts_id_seq,server1_private.v8287_loss_watch_runs_id_seq FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION server1_private.v8287_count_items(p_state jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE n integer:=0;v jsonb;
BEGIN
 IF jsonb_typeof(p_state->'inventory')='array'
 THEN n:=n+jsonb_array_length(p_state->'inventory');END IF;
 IF jsonb_typeof(p_state->'equipment')='object'
 THEN
   FOR v IN SELECT value FROM jsonb_each(p_state->'equipment') LOOP
     IF v IS NOT NULL AND v<>'null'::jsonb THEN n:=n+1;END IF;
   END LOOP;
 END IF;
 RETURN n;
END;
$function$;

CREATE OR REPLACE FUNCTION server1_private.v8287_equipped_count(p_equipment jsonb)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$ SELECT COUNT(*)::integer FROM jsonb_each(
 CASE WHEN jsonb_typeof(p_equipment)='object' THEN p_equipment ELSE '{}'::jsonb END
 ) e WHERE e.value IS NOT NULL AND e.value<>'null'::jsonb $function$;

CREATE OR REPLACE FUNCTION server1_private.v8287_json_size(p jsonb)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
 SELECT CASE jsonb_typeof(p)
   WHEN 'object' THEN (SELECT COUNT(*)::integer FROM jsonb_object_keys(p))
   WHEN 'array' THEN jsonb_array_length(p)
   ELSE 0 END;
$function$;

CREATE OR REPLACE FUNCTION server1_private.v8287_loss_watch_scan()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1_private', 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
 evt RECORD;
 v_last timestamptz;
 v_run bigint;
 v_processed integer:=0;
 v_added integer:=0;
 v_n integer;
 v_rule text;
 v_severity text;
 v_before jsonb;
 v_after jsonb;
 old_count integer;
 new_count integer;
 old_equip integer;
 new_equip integer;
 v_old bigint;
 v_new bigint;
 v_ledger_match boolean;
BEGIN
 IF NOT pg_try_advisory_xact_lock(hashtext('server1_private.v8287_loss_watch_scan')) THEN
   RETURN jsonb_build_object('server','server1','ok',false,'reason','already_running');
 END IF;
 SELECT MAX(finished_at) INTO v_last FROM server1_private.v8287_loss_watch_runs;
 INSERT INTO server1_private.v8287_loss_watch_runs DEFAULT VALUES RETURNING id INTO v_run;
 FOR evt IN
   SELECT * FROM server1_private.v8285_value_change_audit a
   WHERE a.operation='UPDATE' AND a.before_state IS NOT NULL AND a.after_state IS NOT NULL
     AND a.recorded_at >= COALESCE(v_last - INTERVAL '1 day',clock_timestamp() - INTERVAL '7 days')
     AND a.recorded_at < clock_timestamp() - interval '10 seconds'
   ORDER BY a.id
 LOOP
   v_processed:=v_processed+1;
   v_rule:=NULL;v_severity:=NULL;
   v_before:='{}'::jsonb;v_after:='{}'::jsonb;
   IF evt.domain='items' THEN
     old_count:=server1_private.v8287_count_items(evt.before_state);
     new_count:=server1_private.v8287_count_items(evt.after_state);
     old_equip:=server1_private.v8287_equipped_count(evt.before_state->'equipment');
     new_equip:=server1_private.v8287_equipped_count(evt.after_state->'equipment');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='FULL_ITEM_WIPE';v_severity:='high';
     ELSIF old_count>=4 AND new_count<=floor(old_count*.25) THEN
       v_rule:='BULK_ITEM_LOSS';v_severity:='high';
     ELSIF old_equip>=2 AND new_equip=0 AND new_count<old_count THEN
       v_rule:='EQUIPMENT_DISAPPEARED';v_severity:='high';
     END IF;
     v_before:=jsonb_build_object('itemCount',old_count,'equipmentSlots',old_equip,'revision',evt.revision_before);
     v_after:=jsonb_build_object('itemCount',new_count,'equipmentSlots',new_equip,'revision',evt.revision_after);
   ELSIF evt.domain='wallet' THEN
     v_old:=COALESCE((evt.before_state->>'gold')::bigint,0);
     v_new:=COALESCE((evt.after_state->>'gold')::bigint,0);
     IF v_old>v_new THEN
       SELECT EXISTS(SELECT 1 FROM server1.player_gold_events e
         WHERE e.user_id=evt.user_id
           AND e.balance_before=v_old AND e.balance_after=v_new
           AND e.created_at BETWEEN evt.recorded_at-INTERVAL '30 seconds'
                               AND evt.recorded_at+INTERVAL '30 seconds')
       INTO v_ledger_match;
       IF NOT v_ledger_match THEN
         v_rule:='UNLEDGERED_GOLD_DECREASE';
         v_severity:=CASE WHEN v_old-v_new>=500 THEN 'high' ELSE 'medium' END;
       END IF;
     END IF;
     v_before:=jsonb_build_object('gold',v_old);
     v_after:=jsonb_build_object('gold',v_new);
     IF v_rule IS NOT NULL THEN
       v_before:=v_before||jsonb_build_object('harz',evt.before_state->'harz_taler');
       v_after:=v_after||jsonb_build_object('harz',evt.after_state->'harz_taler');
     END IF;
     IF v_rule='UNLEDGERED_GOLD_DECREASE' THEN
       INSERT INTO server1_private.v8287_loss_watch_alerts
        (audit_id,user_id,domain,rule,severity,before_summary,after_summary,event_at)
       VALUES (evt.id,evt.user_id,evt.domain,v_rule,v_severity,v_before,v_after,evt.recorded_at)
       ON CONFLICT(audit_id,rule) DO NOTHING;
       GET DIAGNOSTICS v_n=ROW_COUNT;
       v_added:=v_added+v_n;
       v_rule:=NULL;
       v_severity:=NULL;
     END IF;
     -- Independent premium-currency rule; don't conflate it with gold.
     v_old:=COALESCE((evt.before_state->>'harz_taler')::bigint,0);
     v_new:=COALESCE((evt.after_state->>'harz_taler')::bigint,0);
     IF v_old>v_new THEN
       SELECT EXISTS(SELECT 1 FROM server1.player_harz_events e
         WHERE e.user_id=evt.user_id
           AND e.balance_before=v_old AND e.balance_after=v_new
           AND e.created_at BETWEEN evt.recorded_at-INTERVAL '30 seconds'
                               AND evt.recorded_at+INTERVAL '30 seconds')
       INTO v_ledger_match;
       IF NOT v_ledger_match THEN
         -- A wallet update affecting both currencies is uncommon; keep the premium signal highest priority.
         v_rule:='UNLEDGERED_PREMIUM_DECREASE';
         v_severity:='high';
         v_before:=jsonb_build_object('gold',evt.before_state->'gold','harz',v_old);
         v_after:=jsonb_build_object('gold',evt.after_state->'gold','harz',v_new);
       END IF;
     END IF;
   ELSIF evt.domain='seeds' THEN
     old_count:=server1_private.v8287_json_size(evt.before_state->'plants');
     new_count:=server1_private.v8287_json_size(evt.after_state->'plants');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='ALL_PLANTS_DISAPPEARED';v_severity:='high';
     END IF;
     v_before:=jsonb_build_object('plants',old_count,'timeSeeds',evt.before_state->'time_seeds');
     v_after:=jsonb_build_object('plants',new_count,'timeSeeds',evt.after_state->'time_seeds');
   ELSIF evt.domain='build' THEN
     old_count:=server1_private.v8287_json_size(evt.before_state->'talents');
     new_count:=server1_private.v8287_json_size(evt.after_state->'talents');
     IF old_count>=2 AND new_count=0 THEN
       v_rule:='TALENT_TREE_CLEARED';v_severity:='medium';
     END IF;
     v_before:=jsonb_build_object('talentEntries',old_count,'revision',evt.revision_before);
     v_after:=jsonb_build_object('talentEntries',new_count,'revision',evt.revision_after);
   END IF;
   IF v_rule IS NOT NULL THEN
     INSERT INTO server1_private.v8287_loss_watch_alerts
      (audit_id,user_id,domain,rule,severity,before_summary,after_summary,event_at)
     VALUES(evt.id,evt.user_id,evt.domain,v_rule,v_severity,v_before,v_after,evt.recorded_at)
     ON CONFLICT(audit_id,rule) DO NOTHING;
     GET DIAGNOSTICS v_n=ROW_COUNT;
     v_added:=v_added+v_n;
   END IF;
 END LOOP;
 UPDATE server1_private.v8287_loss_watch_runs
    SET finished_at=clock_timestamp(),scanned_changes=v_processed,new_alerts=v_added
  WHERE id=v_run;
 RETURN jsonb_build_object('ok',true,'server','server1','scanned',v_processed,
 'newAlerts',v_added,'runId',v_run);
END;
$function$;

REVOKE ALL ON FUNCTION server1_private.v8287_loss_watch_scan(),
 server1_private.v8287_count_items(jsonb),server1_private.v8287_json_size(jsonb),server1_private.v8287_equipped_count(jsonb)
 FROM PUBLIC, anon, authenticated;
-- UTC daily schedule; Berlin local time shifts with daylight saving.
SELECT cron.schedule('v8287-server1-loss-watch','10 6 * * *',$$SELECT server1_private.v8287_loss_watch_scan();$$);
