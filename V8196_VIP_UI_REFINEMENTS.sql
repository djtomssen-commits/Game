-- V8.196 VIP UI refinement: expose today's already-claimed VIP reward for replay-only display.
-- Deployed to Beta on 2026-10-07.

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
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into st from recovery_private.v8195_vip_state where user_id=u;
  active:=found and st.vip_until>now();

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
    'daily_claim_available',active and st.daily_claim_day is distinct from today,
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

revoke all on function public.v8195_vip_state() from public,anon;
grant execute on function public.v8195_vip_state() to authenticated,service_role;
