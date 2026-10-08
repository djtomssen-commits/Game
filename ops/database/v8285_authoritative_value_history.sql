-- Grow Legends V8.285: transactional, private, before/after snapshots of canonical game valuables.
-- Deployed on 2026-10-08 as v8285_beta_authoritative_value_change_history
-- (followed by v8285_beta_value_history_recordtype_safety for the final generic function)
-- and v8285_server1_authoritative_value_change_history.
-- This source is versioned for reproducibility, not re-executed on existing installs.
-- All history rows commit or roll back in the SAME transaction as the underlying game action.
-- No anonymous/authenticated grants. Store only in private schemas, never expose client-side.
-- Tables hold before/after inventory, gold, harz, seed, plant and character build values.
-- Monitor DB storage and introduce archival/retention only after backup policy approval.

-- Beta / recovery_private
CREATE TABLE IF NOT EXISTS recovery_private.v8285_value_change_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL,
 domain text NOT NULL CHECK (domain IN ('wallet','items','seeds','build')),
 operation text NOT NULL,
 actor_uid uuid,
 source_table text NOT NULL,
 before_state jsonb,
 after_state jsonb,
 revision_before bigint,
 revision_after bigint,
 source_version text,
 transaction_id bigint NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
REVOKE ALL ON recovery_private.v8285_value_change_audit FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE recovery_private.v8285_value_change_audit_id_seq FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS v8285_value_change_audit_user_date
 ON recovery_private.v8285_value_change_audit(user_id, recorded_at DESC);
CREATE OR REPLACE FUNCTION recovery_private.v8285_capture_value_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'recovery_private', 'pg_temp'
AS $function$
DECLARE v_old jsonb;v_new jsonb;v_uid uuid;v_rev_old bigint;v_rev_new bigint;v_source text;v_domain text:=TG_ARGV[0];
BEGIN
 IF TG_OP<>'INSERT' THEN v_old:=to_jsonb(OLD);END IF;
 IF TG_OP<>'DELETE' THEN v_new:=to_jsonb(NEW);END IF;
 IF TG_OP='UPDATE' THEN
   IF v_domain='wallet' AND
       (v_old->'gold',v_old->'harz_taler',v_old->'level',v_old->'xp',v_old->'xp_total')
         IS NOT DISTINCT FROM
       (v_new->'gold',v_new->'harz_taler',v_new->'level',v_new->'xp',v_new->'xp_total')
   THEN RETURN NEW;END IF;
   IF v_domain='items' AND
       (v_old->'inventory',v_old->'equipment',v_old->'materials',v_old->'fragments')
         IS NOT DISTINCT FROM
       (v_new->'inventory',v_new->'equipment',v_new->'materials',v_new->'fragments')
   THEN RETURN NEW;END IF;
   IF v_domain='seeds' AND
       (v_old->'grow_seeds',v_old->'time_seeds',v_old->'plants',v_old->'blooms',v_old->'active_bloom')
         IS NOT DISTINCT FROM
       (v_new->'grow_seeds',v_new->'time_seeds',v_new->'plants',v_new->'blooms',v_new->'active_bloom')
   THEN RETURN NEW;END IF;
   IF v_domain='build' AND
       (v_old->'attrs',v_old->'class_skills',v_old->'talents',v_old->'player_class',v_old->'attr_budget_offset',v_old->'legacy_skill_budget_offset')
         IS NOT DISTINCT FROM
       (v_new->'attrs',v_new->'class_skills',v_new->'talents',v_new->'player_class',v_new->'attr_budget_offset',v_new->'legacy_skill_budget_offset')
   THEN RETURN NEW;END IF;
 END IF;
 v_rev_old:=NULLIF(v_old->>'revision','')::bigint;
 v_rev_new:=NULLIF(v_new->>'revision','')::bigint;
 v_uid:=COALESCE((v_new->>'user_id')::uuid,(v_old->>'user_id')::uuid);
 v_source:=COALESCE(v_new->>'source_version',v_old->>'source_version',NULL);
 INSERT INTO recovery_private.v8285_value_change_audit
 (user_id,domain,operation,actor_uid,source_table,before_state,after_state,revision_before,revision_after,source_version,transaction_id)
 VALUES
 (v_uid,v_domain,TG_OP,auth.uid(),TG_TABLE_SCHEMA||'.'||TG_TABLE_NAME,v_old,v_new,v_rev_old,v_rev_new,v_source,txid_current());
 RETURN COALESCE(NEW,OLD);
END;
$function$;
REVOKE ALL ON FUNCTION recovery_private.v8285_capture_value_change() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER v8285_audit_wallet AFTER INSERT OR UPDATE OR DELETE ON public.player_progress_trusted
 FOR EACH ROW EXECUTE FUNCTION recovery_private.v8285_capture_value_change('wallet');
CREATE TRIGGER v8285_audit_items AFTER INSERT OR UPDATE OR DELETE ON public.player_item_state
 FOR EACH ROW EXECUTE FUNCTION recovery_private.v8285_capture_value_change('items');
CREATE TRIGGER v8285_audit_seeds AFTER INSERT OR UPDATE OR DELETE ON public.player_seed_state
 FOR EACH ROW EXECUTE FUNCTION recovery_private.v8285_capture_value_change('seeds');
CREATE TRIGGER v8285_audit_build AFTER INSERT OR UPDATE OR DELETE ON public.player_build_state
 FOR EACH ROW EXECUTE FUNCTION recovery_private.v8285_capture_value_change('build');

-- Server 1 / server1_private
CREATE TABLE IF NOT EXISTS server1_private.v8285_value_change_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL,
 domain text NOT NULL CHECK (domain IN ('wallet','items','seeds','build')),
 operation text NOT NULL,
 actor_uid uuid,
 source_table text NOT NULL,
 before_state jsonb,
 after_state jsonb,
 revision_before bigint,
 revision_after bigint,
 source_version text,
 transaction_id bigint NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
REVOKE ALL ON server1_private.v8285_value_change_audit FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE server1_private.v8285_value_change_audit_id_seq FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS v8285_value_change_audit_user_date
 ON server1_private.v8285_value_change_audit(user_id, recorded_at DESC);
CREATE OR REPLACE FUNCTION server1_private.v8285_capture_value_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1_private', 'pg_temp'
AS $function$
DECLARE v_old jsonb;v_new jsonb;v_uid uuid;v_rev_old bigint;v_rev_new bigint;v_source text;v_domain text:=TG_ARGV[0];
BEGIN
 IF TG_OP<>'INSERT' THEN v_old:=to_jsonb(OLD);END IF;
 IF TG_OP<>'DELETE' THEN v_new:=to_jsonb(NEW);END IF;
 IF TG_OP='UPDATE' THEN
   IF v_domain='wallet' AND
       (v_old->'gold',v_old->'harz_taler',v_old->'level',v_old->'xp',v_old->'xp_total')
         IS NOT DISTINCT FROM
       (v_new->'gold',v_new->'harz_taler',v_new->'level',v_new->'xp',v_new->'xp_total')
   THEN RETURN NEW;END IF;
   IF v_domain='items' AND
       (v_old->'inventory',v_old->'equipment',v_old->'materials',v_old->'fragments')
         IS NOT DISTINCT FROM
       (v_new->'inventory',v_new->'equipment',v_new->'materials',v_new->'fragments')
   THEN RETURN NEW;END IF;
   IF v_domain='seeds' AND
       (v_old->'grow_seeds',v_old->'time_seeds',v_old->'plants',v_old->'blooms',v_old->'active_bloom')
         IS NOT DISTINCT FROM
       (v_new->'grow_seeds',v_new->'time_seeds',v_new->'plants',v_new->'blooms',v_new->'active_bloom')
   THEN RETURN NEW;END IF;
   IF v_domain='build' AND
       (v_old->'attrs',v_old->'class_skills',v_old->'talents',v_old->'player_class',v_old->'attr_budget_offset',v_old->'legacy_skill_budget_offset')
         IS NOT DISTINCT FROM
       (v_new->'attrs',v_new->'class_skills',v_new->'talents',v_new->'player_class',v_new->'attr_budget_offset',v_new->'legacy_skill_budget_offset')
   THEN RETURN NEW;END IF;
 END IF;
 v_rev_old:=NULLIF(v_old->>'revision','')::bigint;
 v_rev_new:=NULLIF(v_new->>'revision','')::bigint;
 v_uid:=COALESCE((v_new->>'user_id')::uuid,(v_old->>'user_id')::uuid);
 v_source:=COALESCE(v_new->>'source_version',v_old->>'source_version',NULL);
 INSERT INTO server1_private.v8285_value_change_audit
 (user_id,domain,operation,actor_uid,source_table,before_state,after_state,revision_before,revision_after,source_version,transaction_id)
 VALUES
 (v_uid,v_domain,TG_OP,auth.uid(),TG_TABLE_SCHEMA||'.'||TG_TABLE_NAME,v_old,v_new,v_rev_old,v_rev_new,v_source,txid_current());
 RETURN COALESCE(NEW,OLD);
END;
$function$;
REVOKE ALL ON FUNCTION server1_private.v8285_capture_value_change() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER v8285_audit_wallet AFTER INSERT OR UPDATE OR DELETE ON server1.player_progress_trusted
 FOR EACH ROW EXECUTE FUNCTION server1_private.v8285_capture_value_change('wallet');
CREATE TRIGGER v8285_audit_items AFTER INSERT OR UPDATE OR DELETE ON server1.player_item_state
 FOR EACH ROW EXECUTE FUNCTION server1_private.v8285_capture_value_change('items');
CREATE TRIGGER v8285_audit_seeds AFTER INSERT OR UPDATE OR DELETE ON server1.player_seed_state
 FOR EACH ROW EXECUTE FUNCTION server1_private.v8285_capture_value_change('seeds');
CREATE TRIGGER v8285_audit_build AFTER INSERT OR UPDATE OR DELETE ON server1.player_build_state
 FOR EACH ROW EXECUTE FUNCTION server1_private.v8285_capture_value_change('build');
