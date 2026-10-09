-- V8.298: Normalize Server1 VIP three-chest Harz ledger source_ref
-- to the same verified bank-of-days identifier used by Beta.
-- No reward, wallet, entitlement or class balance change.
DO $migration$
DECLARE owner_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO owner_def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='server1' AND p.proname='v8195_vip_claim_daily'
    AND pg_get_function_identity_arguments(p.oid)='';
  IF owner_def IS NULL OR
     position('tp.harz_taler-h,tp.harz_taler,''vip_daily:''||today::text,''verified_server'',true)' IN owner_def)=0 OR
     position('''v8296_vip_bank_harz_''||v_event_suffix' IN owner_def)=0
  THEN
    RAISE EXCEPTION 'V8.298: Server1 VIP bank owner has changed; refusing migration';
  END IF;
  owner_def:=replace(owner_def,
    'tp.harz_taler-h,tp.harz_taler,''vip_daily:''||today::text,''verified_server'',true)',
    'tp.harz_taler-h,tp.harz_taler,''vip_bank:''||v_event_suffix,''verified_server'',true)');
  EXECUTE owner_def;
END
$migration$;