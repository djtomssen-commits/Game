-- Grow Legends V8.284: Authoritative save guards. Server 1 = server1 schema; Beta = public schema.
-- Canonical owner routines; deployed via Supabase migrations v8284_beta_canonical_legacy_economy_item_save_shield
-- and v8284_server1_canonical_legacy_economy_item_save_shield on 2026-10-08.
-- Important: Never import inventory/gold/harzTaler from a legacy full-save when guarded.
-- For legitimate admin currency grants, use explicit trusted owner RPCs / ledgered audited operations.
-- This file is a source-controlled reconstruction of live pg_get_functiondef output.

CREATE OR REPLACE FUNCTION public.v6352_guard_player_save_gold()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_gold bigint;
  v_enabled boolean;
BEGIN
  SELECT gold, gold_guard_enabled INTO v_gold,v_enabled
  FROM public.player_progress_trusted WHERE user_id=NEW.user_id;
  IF NOT COALESCE(v_enabled,false) THEN RETURN NEW; END IF;
  -- Whole-save writes are a display mirror, never authoritative economic mutations.
  -- Even admin players must credit/debit via explicit ledgered server operations.
  NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),
    '{gold}',to_jsonb(GREATEST(0,COALESCE(v_gold,0))),true);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.v6354_guard_player_save_harz()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_harz bigint;
  v_enabled boolean;
BEGIN
  SELECT harz_taler, harz_guard_enabled INTO v_harz,v_enabled
  FROM public.player_progress_trusted WHERE user_id=NEW.user_id;
  IF NOT COALESCE(v_enabled,false) THEN RETURN NEW; END IF;
  -- Never accept stale/purchased currency balances from a client save.
  NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),
    '{harzTaler}',to_jsonb(GREATEST(0,COALESCE(v_harz,0))),true);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.v6355_guard_player_save_items()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v public.player_item_state%rowtype;
  v_forge jsonb;
BEGIN
  SELECT * INTO v FROM public.player_item_state WHERE user_id=NEW.user_id;
  IF NOT FOUND OR NOT v.guard_enabled THEN RETURN NEW; END IF;
  -- No legacy client state may write backward to guarded canonical item state,
  -- including admins and non-enforce migration configurations.
  NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),'{inventory}',v.inventory,true);
  NEW.save_data:=jsonb_set(NEW.save_data,'{equipment}',v.equipment,true);
  NEW.save_data:=jsonb_set(NEW.save_data,'{materials}',v.materials,true);
  v_forge:=COALESCE(NEW.save_data->'v488Forge','{}'::jsonb);
  v_forge:=jsonb_set(v_forge,'{fragments}',to_jsonb(v.fragments),true);
  NEW.save_data:=jsonb_set(NEW.save_data,'{v488Forge}',v_forge,true);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION server1.v6352_guard_player_save_gold()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $function$
DECLARE v_gold bigint; v_enabled boolean;
BEGIN
 SELECT gold,gold_guard_enabled INTO v_gold,v_enabled
 FROM server1.player_progress_trusted WHERE user_id=NEW.user_id;
 IF NOT COALESCE(v_enabled,false) THEN RETURN NEW; END IF;
 -- Enforced wallet is the only source; authenticated administrators must not import stale save balances.
 NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),'{gold}',to_jsonb(GREATEST(0,COALESCE(v_gold,0))),true);
 RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION server1.v6354_guard_player_save_harz()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $function$
DECLARE v_harz bigint; v_enabled boolean;
BEGIN
 SELECT harz_taler,harz_guard_enabled INTO v_harz,v_enabled
 FROM server1.player_progress_trusted WHERE user_id=NEW.user_id;
 IF NOT COALESCE(v_enabled,false) THEN RETURN NEW; END IF;
 -- No full-save write, including from a game admin, may rewrite guarded premium currency.
 NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),'{harzTaler}',to_jsonb(GREATEST(0,COALESCE(v_harz,0))),true);
 RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION server1.v6355_guard_player_save_items()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $function$
DECLARE v server1.player_item_state%rowtype; v_forge jsonb;
BEGIN
 SELECT * INTO v FROM server1.player_item_state WHERE user_id=NEW.user_id;
 IF NOT FOUND OR NOT v.guard_enabled THEN RETURN NEW; END IF;
 -- Authoritative state only. No stale full-save backflow for anyone, not even admins.
 NEW.save_data:=jsonb_set(COALESCE(NEW.save_data,'{}'::jsonb),'{inventory}',v.inventory,true);
 NEW.save_data:=jsonb_set(NEW.save_data,'{equipment}',v.equipment,true);
 NEW.save_data:=jsonb_set(NEW.save_data,'{materials}',v.materials,true);
 v_forge:=COALESCE(NEW.save_data->'v488Forge','{}'::jsonb);
 v_forge:=jsonb_set(v_forge,'{fragments}',to_jsonb(v.fragments),true);
 NEW.save_data:=jsonb_set(NEW.save_data,'{v488Forge}',v_forge,true);
 RETURN NEW;
END;
$function$;
