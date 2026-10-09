-- Grow Legends V8.296 | VIP day-chest catch-up 0-3 on Beta + Server 1.
-- Deployed direct modifications of canonical VIP owners.
-- Only most recent 3 Berlin calendar dates in current uninterrupted VIP membership.
-- No duplicate day payout: private daily_claims primary key user_id,claim_day,
-- plus VIP row lock and advisory transaction lock.
-- Multiple dates are settled in one atomic payout, with gold/harz ledgers and
-- legacy display-save mirror derived from trusted balances.
-- Historical VIP purchases/claim history are never rewritten or reset.
-- Beta canonical schema public/recovery_private; live server1/server1_private.
-- PRIVATE helpers must remain noncallable by authenticated/anon roles.

-- recovery_private.v8296_pending_vip_chest_days
CREATE OR REPLACE FUNCTION recovery_private.v8296_pending_vip_chest_days(p_uid uuid, p_today date DEFAULT ((now() AT TIME ZONE 'Europe/Berlin'::text))::date)
 RETURNS date[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
 v_start date;
 v_days date[]:=ARRAY[]::date[];
BEGIN
 IF p_uid IS NULL OR p_today IS NULL OR NOT EXISTS(
   SELECT 1 FROM recovery_private.v8195_vip_state s
   WHERE s.user_id=p_uid AND s.vip_until>now()
 ) THEN RETURN v_days; END IF;
 -- Replay only days in the currently uninterrupted purchased VIP period.
 -- If the member extended while active, preserve the original streak start.
 -- If VIP expired and was re-purchased, never pay for the gap.
 WITH RECURSIVE purchases AS (
   SELECT verified_at,days_added,
          ROW_NUMBER() OVER (ORDER BY verified_at,purchase_token) AS nr
   FROM recovery_private.v8195_google_play_vip_purchases
   WHERE user_id=p_uid AND days_added>0
 ), streak AS (
   SELECT nr,verified_at AS streak_start,verified_at+(days_added*INTERVAL '1 day') AS valid_until
   FROM purchases WHERE nr=1
   UNION ALL
   SELECT p.nr,
     CASE WHEN p.verified_at>s.valid_until THEN p.verified_at ELSE s.streak_start END,
     GREATEST(p.verified_at,s.valid_until)+(p.days_added*INTERVAL '1 day')
   FROM streak s JOIN purchases p ON p.nr=s.nr+1
 )
 SELECT (s.streak_start AT TIME ZONE 'Europe/Berlin')::date INTO v_start
 FROM streak s ORDER BY s.nr DESC LIMIT 1;
 -- Legacy/admin-granted VIP without a Google receipt still starts only on the
 -- day this VIP state record was first created, never before.
 IF v_start IS NULL THEN
   SELECT (created_at AT TIME ZONE 'Europe/Berlin')::date INTO v_start
   FROM recovery_private.v8195_vip_state WHERE user_id=p_uid;
 END IF;
 IF v_start IS NULL OR v_start>p_today THEN RETURN v_days;END IF;
 SELECT COALESCE(ARRAY_AGG(dayvalue ORDER BY dayvalue),ARRAY[]::date[]) INTO v_days
 FROM (
   SELECT dayvalue::date
   FROM generate_series(GREATEST(v_start,p_today-2)::timestamp,p_today::timestamp,INTERVAL '1 day') AS days(dayvalue)
   WHERE NOT EXISTS(
     SELECT 1 FROM recovery_private.v8195_vip_daily_claims c
     WHERE c.user_id=p_uid AND c.claim_day=dayvalue::date
   )
 ) pending;
 RETURN v_days;
END;
$function$;

REVOKE ALL ON FUNCTION recovery_private.v8296_pending_vip_chest_days(uuid,date) FROM PUBLIC,anon,authenticated;

-- public.v8195_vip_state
CREATE OR REPLACE FUNCTION public.v8195_vip_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  u uuid:=auth.uid();
  st recovery_private.v8195_vip_state%rowtype;
  cfg recovery_private.v8195_vip_config%rowtype;
  today date:=(now() at time zone 'Europe/Berlin')::date;
  active boolean:=false;
  today_claim jsonb:=null;
  v_pending date[]:=ARRAY[]::date[];
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into st from recovery_private.v8195_vip_state where user_id=u;
  active:=found and st.vip_until>now();

  IF active THEN v_pending:=recovery_private.v8296_pending_vip_chest_days(u,today); END IF;

  select jsonb_build_object(
    'claim_day',c.claim_day,
    'harz_awarded',c.harz,
    'gold_awarded',c.gold,
    'fragments_awarded',c.fragments
  )
  into today_claim
  from recovery_private.v8195_vip_daily_claims c
  where c.user_id=u and c.claim_day=today;

  return jsonb_build_object(
    'ok',true,
    'active',active,
    'vip_until',case when st.user_id is null then null else st.vip_until end,
    'public_visible',case when st.user_id is null then true else st.public_visible end,
    'daily_claim_available',active and cardinality(v_pending)>0,
    'pending_chests',CASE WHEN active THEN cardinality(v_pending) ELSE 0 END,
    'max_pending_chests',3,
    'pending_chest_days',to_jsonb(v_pending),
    'today_claim',today_claim,
    'free_reroll_available',active and coalesce(cfg.free_shop_rerolls,1)>0 and st.daily_reroll_day is distinct from today,
    'daily_harz',coalesce(cfg.daily_harz,1),
    'daily_fragments',coalesce(cfg.daily_fragments,10),
    'daily_gold_base',coalesce(cfg.daily_gold_base,250),
    'daily_gold_per_level',coalesce(cfg.daily_gold_per_level,50),
    'weekly_xp_bonus_pct',coalesce(cfg.weekly_xp_bonus_pct,10),
    'free_shop_rerolls',coalesce(cfg.free_shop_rerolls,1),
    'title','Grow VIP',
    'frame_id','vip_crown'
  );
end;
$function$;

-- public.v8195_vip_claim_daily
CREATE OR REPLACE FUNCTION public.v8195_vip_claim_daily()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  u uuid:=auth.uid();
  st recovery_private.v8195_vip_state%rowtype;
  cfg recovery_private.v8195_vip_config%rowtype;
  tp public.player_progress_trusted%rowtype;
  it public.player_item_state%rowtype;
  today date:=(now() at time zone 'Europe/Berlin')::date;
  h integer:=0;
  g bigint:=0;
  f integer:=0;
  chest_days date[]:=ARRAY[]::date[];
  chest_count integer:=0;
  claimed_day date;
  v_event_suffix text;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtext(u::text), hashtext(today::text||':vip_daily'));

  select * into st from recovery_private.v8195_vip_state where user_id=u for update;
  if not found or st.vip_until is null or st.vip_until<=now() then
    return jsonb_build_object('ok',false,'reason','VIP_INACTIVE','state',public.v8195_vip_state());
  end if;
  chest_days:=recovery_private.v8296_pending_vip_chest_days(u,today);
  chest_count:=COALESCE(cardinality(chest_days),0);
  IF chest_count=0 THEN
    return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',public.v8195_vip_state());
  END IF;
  v_event_suffix:=array_to_string(chest_days,'_');

  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into tp from public.player_progress_trusted where user_id=u for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;
  select * into it from public.player_item_state where user_id=u for update;
  if not found then raise exception 'ITEM_STATE_MISSING'; end if;

  h:=greatest(0,coalesce(cfg.daily_harz,1))*chest_count;
  f:=greatest(0,coalesce(cfg.daily_fragments,10))*chest_count;
  g:=greatest(0,coalesce(cfg.daily_gold_base,250)+greatest(1,coalesce(tp.level,1))*coalesce(cfg.daily_gold_per_level,50))*chest_count;

  update public.player_progress_trusted
  set harz_taler=greatest(0,harz_taler)+h,
      gold=greatest(0,gold)+g,
      harz_claimed_at=case when h>0 then now() else harz_claimed_at end,
      gold_claimed_at=case when g>0 then now() else gold_claimed_at end,
      source_version='v8195-vip-daily',
      updated_at=now()
  where user_id=u
  returning * into tp;

  update public.player_item_state
  set fragments=greatest(0,fragments)+f,
      revision=revision+1,
      updated_at=now()
  where user_id=u
  returning * into it;

  -- V8.296: every VIP bank payout has an immutable, server-verifiable
  -- currency ledger entry and updates the legacy display mirror from canonical.
  IF g>0 THEN
    INSERT INTO public.player_gold_events(user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified)
    VALUES(u,'v8296_vip_bank_gold_'||v_event_suffix,'vip_daily',g,g,
      tp.gold-g,tp.gold,'vip_bank:'||v_event_suffix,'verified_server',true);
  END IF;
  IF h>0 THEN
    INSERT INTO public.player_harz_events(user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified)
    VALUES(u,'v8296_vip_bank_harz_'||v_event_suffix,'vip_daily',h,h,
      tp.harz_taler-h,tp.harz_taler,'vip_bank:'||v_event_suffix,'verified_server',true);
  END IF;
  UPDATE public.player_saves ps
  SET save_data=jsonb_set(jsonb_set(coalesce(ps.save_data,'{}'::jsonb),
    '{gold}',to_jsonb(tp.gold),true),'{harzTaler}',to_jsonb(tp.harz_taler),true),
    updated_at=now()
  WHERE ps.user_id=u;

  FOREACH claimed_day IN ARRAY chest_days LOOP
    INSERT INTO recovery_private.v8195_vip_daily_claims(user_id,claim_day,harz,gold,fragments)
    VALUES(u,claimed_day,h/chest_count,g/chest_count,f/chest_count);
  END LOOP;

  update recovery_private.v8195_vip_state
  set daily_claim_day=today, revision=revision+1, updated_at=now()
  where user_id=u;

  return jsonb_build_object(
    'ok',true,'claimed',true,
    'chests_claimed',chest_count,'claimed_days',to_jsonb(chest_days),
    'harz_awarded',h,'gold_awarded',g,'fragments_awarded',f,
    'harz',tp.harz_taler,'gold',tp.gold,'fragments',it.fragments,
    'state',public.v8195_vip_state()
  );
exception when unique_violation then
  return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',public.v8195_vip_state());
end;
$function$;

-- server1_private.v8296_pending_vip_chest_days
CREATE OR REPLACE FUNCTION server1_private.v8296_pending_vip_chest_days(p_uid uuid, p_today date DEFAULT ((now() AT TIME ZONE 'Europe/Berlin'::text))::date)
 RETURNS date[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
 v_start date;
 v_days date[]:=ARRAY[]::date[];
BEGIN
 IF p_uid IS NULL OR p_today IS NULL OR NOT EXISTS(
   SELECT 1 FROM server1_private.v8195_vip_state s
   WHERE s.user_id=p_uid AND s.vip_until>now()
 ) THEN RETURN v_days; END IF;
 -- Replay only days in the currently uninterrupted purchased VIP period.
 -- If the member extended while active, preserve the original streak start.
 -- If VIP expired and was re-purchased, never pay for the gap.
 WITH RECURSIVE purchases AS (
   SELECT verified_at,days_added,
          ROW_NUMBER() OVER (ORDER BY verified_at,purchase_token) AS nr
   FROM server1_private.v8195_google_play_vip_purchases
   WHERE user_id=p_uid AND days_added>0
 ), streak AS (
   SELECT nr,verified_at AS streak_start,verified_at+(days_added*INTERVAL '1 day') AS valid_until
   FROM purchases WHERE nr=1
   UNION ALL
   SELECT p.nr,
     CASE WHEN p.verified_at>s.valid_until THEN p.verified_at ELSE s.streak_start END,
     GREATEST(p.verified_at,s.valid_until)+(p.days_added*INTERVAL '1 day')
   FROM streak s JOIN purchases p ON p.nr=s.nr+1
 )
 SELECT (s.streak_start AT TIME ZONE 'Europe/Berlin')::date INTO v_start
 FROM streak s ORDER BY s.nr DESC LIMIT 1;
 -- Legacy/admin-granted VIP without a Google receipt still starts only on the
 -- day this VIP state record was first created, never before.
 IF v_start IS NULL THEN
   SELECT (created_at AT TIME ZONE 'Europe/Berlin')::date INTO v_start
   FROM server1_private.v8195_vip_state WHERE user_id=p_uid;
 END IF;
 IF v_start IS NULL OR v_start>p_today THEN RETURN v_days;END IF;
 SELECT COALESCE(ARRAY_AGG(dayvalue ORDER BY dayvalue),ARRAY[]::date[]) INTO v_days
 FROM (
   SELECT dayvalue::date
   FROM generate_series(GREATEST(v_start,p_today-2)::timestamp,p_today::timestamp,INTERVAL '1 day') AS days(dayvalue)
   WHERE NOT EXISTS(
     SELECT 1 FROM server1_private.v8195_vip_daily_claims c
     WHERE c.user_id=p_uid AND c.claim_day=dayvalue::date
   )
 ) pending;
 RETURN v_days;
END;
$function$;

REVOKE ALL ON FUNCTION server1_private.v8296_pending_vip_chest_days(uuid,date) FROM PUBLIC,anon,authenticated;

-- server1.v8195_vip_state
CREATE OR REPLACE FUNCTION server1.v8195_vip_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  u uuid:=auth.uid();
  st server1_private.v8195_vip_state%rowtype;
  cfg server1_private.v8195_vip_config%rowtype;
  today date:=(now() at time zone 'Europe/Berlin')::date;
  active boolean:=false;
  today_claim jsonb:=null;
  v_pending date[]:=ARRAY[]::date[];
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into cfg from server1_private.v8195_vip_config where singleton=true;
  select * into st from server1_private.v8195_vip_state where user_id=u;
  active:=found and st.vip_until>now();

  IF active THEN v_pending:=server1_private.v8296_pending_vip_chest_days(u,today); END IF;

  select jsonb_build_object(
    'claim_day',c.claim_day,
    'harz_awarded',c.harz,
    'gold_awarded',c.gold,
    'fragments_awarded',c.fragments
  )
  into today_claim
  from server1_private.v8195_vip_daily_claims c
  where c.user_id=u and c.claim_day=today;

  return jsonb_build_object(
    'ok',true,
    'active',active,
    'vip_until',case when st.user_id is null then null else st.vip_until end,
    'public_visible',case when st.user_id is null then true else st.public_visible end,
    'daily_claim_available',active and cardinality(v_pending)>0,
    'pending_chests',CASE WHEN active THEN cardinality(v_pending) ELSE 0 END,
    'max_pending_chests',3,
    'pending_chest_days',to_jsonb(v_pending),
    'today_claim',today_claim,
    'free_reroll_available',active and coalesce(cfg.free_shop_rerolls,1)>0 and st.daily_reroll_day is distinct from today,
    'daily_harz',coalesce(cfg.daily_harz,1),
    'daily_fragments',coalesce(cfg.daily_fragments,10),
    'daily_gold_base',coalesce(cfg.daily_gold_base,250),
    'daily_gold_per_level',coalesce(cfg.daily_gold_per_level,50),
    'weekly_xp_bonus_pct',coalesce(cfg.weekly_xp_bonus_pct,10),
    'free_shop_rerolls',coalesce(cfg.free_shop_rerolls,1),
    'title','Grow VIP',
    'frame_id','vip_crown'
  );
end;
$function$;

-- server1.v8195_vip_claim_daily
CREATE OR REPLACE FUNCTION server1.v8195_vip_claim_daily()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  u uuid:=auth.uid();
  st server1_private.v8195_vip_state%rowtype;
  cfg server1_private.v8195_vip_config%rowtype;
  tp server1.player_progress_trusted%rowtype;
  it server1.player_item_state%rowtype;
  today date:=(now() at time zone 'Europe/Berlin')::date;
  h integer:=0;
  g bigint:=0;
  f integer:=0;
  chest_days date[]:=ARRAY[]::date[];
  chest_count integer:=0;
  claimed_day date;
  v_event_suffix text;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtext(u::text), hashtext(today::text||':vip_daily'));

  select * into st from server1_private.v8195_vip_state where user_id=u for update;
  if not found or st.vip_until is null or st.vip_until<=now() then
    return jsonb_build_object('ok',false,'reason','VIP_INACTIVE','state',server1.v8195_vip_state());
  end if;
  chest_days:=server1_private.v8296_pending_vip_chest_days(u,today);
  chest_count:=COALESCE(cardinality(chest_days),0);
  IF chest_count=0 THEN
    return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',server1.v8195_vip_state());
  END IF;
  v_event_suffix:=array_to_string(chest_days,'_');

  select * into cfg from server1_private.v8195_vip_config where singleton=true;
  select * into tp from server1.player_progress_trusted where user_id=u for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;
  select * into it from server1.player_item_state where user_id=u for update;
  if not found then raise exception 'ITEM_STATE_MISSING'; end if;

  h:=greatest(0,coalesce(cfg.daily_harz,1))*chest_count;
  f:=greatest(0,coalesce(cfg.daily_fragments,10))*chest_count;
  g:=greatest(0,coalesce(cfg.daily_gold_base,250)+greatest(1,coalesce(tp.level,1))*coalesce(cfg.daily_gold_per_level,50))*chest_count;

  -- New live VIP settlements are atomic and ledger-visible for Echtgeld QA.
  -- Original trusted values still live in tp.gold, tp.harz_taler until the update.
  update server1.player_progress_trusted
  set harz_taler=greatest(0,harz_taler)+h,
      gold=greatest(0,gold)+g,
      harz_claimed_at=case when h>0 then now() else harz_claimed_at end,
      gold_claimed_at=case when g>0 then now() else gold_claimed_at end,
      source_version='v8195-vip-daily',
      updated_at=now()
  where user_id=u
  returning * into tp;

  update server1.player_item_state
  set fragments=greatest(0,fragments)+f,
      revision=revision+1,
      updated_at=now()
  where user_id=u
  returning * into it;


  IF g>0 THEN
    INSERT INTO server1.player_gold_events(user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified)
    VALUES(u,'v8296_vip_bank_gold_'||v_event_suffix,'vip_daily',g,g,
      tp.gold-g,tp.gold,'vip_bank:'||v_event_suffix,'verified_server',true);
  END IF;
  IF h>0 THEN
    INSERT INTO server1.player_harz_events(user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified)
    VALUES(u,'v8296_vip_bank_harz_'||v_event_suffix,'vip_daily',h,h,
      tp.harz_taler-h,tp.harz_taler,'vip_daily:'||today::text,'verified_server',true);
  END IF;
  UPDATE server1.player_saves ps
  SET save_data=jsonb_set(jsonb_set(coalesce(ps.save_data,'{}'::jsonb),
       '{gold}',to_jsonb(tp.gold),true),'{harzTaler}',to_jsonb(tp.harz_taler),true),
      updated_at=now()
  WHERE ps.user_id=u;
  FOREACH claimed_day IN ARRAY chest_days LOOP
    INSERT INTO server1_private.v8195_vip_daily_claims(user_id,claim_day,harz,gold,fragments)
    VALUES(u,claimed_day,h/chest_count,g/chest_count,f/chest_count);
  END LOOP;

  update server1_private.v8195_vip_state
  set daily_claim_day=today, revision=revision+1, updated_at=now()
  where user_id=u;

  return jsonb_build_object(
    'ok',true,'claimed',true,
    'chests_claimed',chest_count,'claimed_days',to_jsonb(chest_days),
    'harz_awarded',h,'gold_awarded',g,'fragments_awarded',f,
    'harz',tp.harz_taler,'gold',tp.gold,'fragments',it.fragments,
    'state',server1.v8195_vip_state()
  );
exception when unique_violation then
  return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',server1.v8195_vip_state());
end;
$function$;

