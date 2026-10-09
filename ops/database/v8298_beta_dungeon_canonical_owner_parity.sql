-- V8.298: Align the canonical Beta dungeon owner with the two Server 1
-- PL/pgSQL correctness fixes from V8.254. No class balance or player data.
-- Fail closed if the two owner bodies have otherwise diverged.
DO $migration$
DECLARE
  beta_def text;
  server1_def text;
  patched_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO beta_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'recovery_private'
     AND p.proname = 'v7049_run_dungeon_core'
     AND pg_get_function_identity_arguments(p.oid) =
       'p_uid uuid, p_dungeon_index integer, p_use_harz boolean, p_request_id text';

  SELECT pg_get_functiondef(p.oid) INTO server1_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'server1_private'
     AND p.proname = 'v7049_run_dungeon_core'
     AND pg_get_function_identity_arguments(p.oid) =
       'p_uid uuid, p_dungeon_index integer, p_use_harz boolean, p_request_id text';

  IF beta_def IS NULL OR server1_def IS NULL THEN
    RAISE EXCEPTION 'V8.298: canonical dungeon functions not found';
  END IF;

  IF position('AS $function$' || E'\n' || 'declare' IN beta_def) = 0
     OR position('recovery_private.v8067_weapon_factor_for(p_uid,random(),false)' IN beta_def) = 0
  THEN
    RAISE EXCEPTION 'V8.298: original Beta function changed; refusing unreviewed update';
  END IF;

  patched_def := replace(
    replace(beta_def,
      'AS $function$' || E'\n' || 'declare',
      'AS $function$' || E'\n' || '#variable_conflict use_variable' || E'\n' || 'declare'
    ),
    'recovery_private.v8067_weapon_factor_for(p_uid,random(),false)',
    'recovery_private.v8067_weapon_factor_for(p_uid,random()::numeric,false)'
  );

  server1_def := replace(
    replace(server1_def, 'server1_private', 'recovery_private'),
    'server1', 'public'
  );

  IF patched_def <> server1_def THEN
    RAISE EXCEPTION 'V8.298: unexpected dungeon owner drift; no deployment';
  END IF;

  EXECUTE patched_def;
END
$migration$;