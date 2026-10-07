-- Grow Legends V8.195 — Beta VIP system
-- Deployed to Supabase project egzfmnlqwaixwsyppucp on 2026-10-07.
-- Beta-first: no server1 VIP schema is created by this migration.

begin;

create table if not exists recovery_private.v8195_vip_config (
  singleton boolean primary key default true check (singleton),
  daily_harz integer not null default 1 check (daily_harz between 0 and 20),
  daily_fragments integer not null default 10 check (daily_fragments between 0 and 1000),
  daily_gold_base bigint not null default 250 check (daily_gold_base >= 0),
  daily_gold_per_level bigint not null default 50 check (daily_gold_per_level >= 0),
  weekly_xp_bonus_pct numeric(6,2) not null default 10 check (weekly_xp_bonus_pct between 0 and 100),
  free_shop_rerolls integer not null default 1 check (free_shop_rerolls between 0 and 10),
  updated_at timestamptz not null default now()
);
insert into recovery_private.v8195_vip_config(singleton) values(true) on conflict(singleton) do nothing;

create table if not exists recovery_private.v8195_vip_state (
  user_id uuid primary key,
  vip_until timestamptz,
  public_visible boolean not null default true,
  daily_claim_day date,
  daily_reroll_day date,
  weekly_bonus_remainder numeric(10,4) not null default 0,
  weekly_bonus_cycle date,
  last_product_id text,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table recovery_private.v8195_vip_state add column if not exists weekly_bonus_cycle date;

create table if not exists recovery_private.v8195_vip_daily_claims (
  user_id uuid not null,
  claim_day date not null,
  harz integer not null,
  gold bigint not null,
  fragments integer not null,
  created_at timestamptz not null default now(),
  primary key(user_id,claim_day)
);

create table if not exists recovery_private.v8195_vip_reroll_events (
  user_id uuid not null,
  request_id text not null,
  reroll_day date not null,
  kind text not null check(kind in ('weapon','magic')),
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);

create table if not exists recovery_private.v8195_google_play_vip_purchases (
  purchase_token text primary key,
  user_id uuid not null,
  product_id text not null check(product_id in ('vip_7day','vip_7d','vip_14d','vip_30d')),
  order_id text,
  google_payload jsonb not null default '{}'::jsonb,
  days_added integer not null check(days_added in (7,14,30)),
  verified_at timestamptz not null default now()
);

alter table recovery_private.v8195_vip_config enable row level security;
alter table recovery_private.v8195_vip_state enable row level security;
alter table recovery_private.v8195_vip_daily_claims enable row level security;
alter table recovery_private.v8195_vip_reroll_events enable row level security;
alter table recovery_private.v8195_google_play_vip_purchases enable row level security;

revoke all on recovery_private.v8195_vip_config from public,anon,authenticated;
revoke all on recovery_private.v8195_vip_state from public,anon,authenticated;
revoke all on recovery_private.v8195_vip_daily_claims from public,anon,authenticated;
revoke all on recovery_private.v8195_vip_reroll_events from public,anon,authenticated;
revoke all on recovery_private.v8195_google_play_vip_purchases from public,anon,authenticated;

alter table public.profiles
  add column if not exists vip_until timestamptz,
  add column if not exists vip_visible boolean not null default false;

CREATE OR REPLACE FUNCTION public.v6359_weekly_chest_activity_for(p_uid uuid, p_type text, p_event_id text, p_detail jsonb DEFAULT '{}'::jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 st public.player_weekly_chest_state%rowtype;
 typ text:=lower(coalesce(p_type,''));
 eid text:=left(coalesce(p_event_id,''),200);
 req int:=0;
 base_req int:=0;
 vip_bonus int:=0;
 gain int:=0;
 role text;
 cnt int;
 floorv int;
 diff int;
 roomtype text;
 oldlv int;
 newlv int;
 vip recovery_private.v8195_vip_state%rowtype;
 cfg recovery_private.v8195_vip_config%rowtype;
 bonus_exact numeric(12,4):=0;
 bonus_remainder numeric(10,4):=0;
 event_detail jsonb:=coalesce(p_detail,'{}'::jsonb);
begin
 if p_uid is null or eid='' then return 0;end if;

 select * into st from public.player_weekly_chest_state
 where user_id=p_uid;
 if not found or not st.guard_enabled then return 0;end if;

 st:=public.v6359_weekly_chest_sync_for(p_uid);
 select * into st from public.player_weekly_chest_state
 where user_id=p_uid for update;

 if st.pending is not null then return 0;end if;

 if exists(
   select 1 from public.player_weekly_chest_events
   where user_id=p_uid and event_id=eid
 ) then return 0;end if;

 if typ='quest' then
   if coalesce((p_detail->>'elite')::boolean,false) then req:=20;
   else
     role:=lower(coalesce(p_detail->>'role','normal'));
     req:=case when role in ('quick','fast') then 6
               when role in ('heavy','hard') then 10
               else 8 end;
   end if;

 elsif typ='dungeon' then
   req:=case when coalesce((p_detail->>'boss')::boolean,false) then 12 else 5 end;

 elsif typ='pvp' then
   if st.daily_pvp_wins>=5 then req:=0;
   else
     req:=8;
     st.daily_pvp_wins:=st.daily_pvp_wins+1;
   end if;

 elsif typ='grow' then
   cnt:=greatest(0,coalesce((p_detail->>'count')::int,0));
   cnt:=least(cnt,greatest(0,8-st.daily_plants));
   if cnt>0 then
     req:=cnt*2;
     st.daily_plants:=st.daily_plants+cnt;
   end if;

 elsif typ='grow_order' then req:=6;
 elsif typ='worldboss' then req:=15;
 elsif typ='guildboss' then req:=15;

 elsif typ='tower' then
   floorv:=greatest(0,coalesce((p_detail->>'floor')::int,0));
   roomtype:=lower(coalesce(p_detail->>'room_type','normal'));
   diff:=greatest(0,floorv-st.tower_max_floor);
   if diff>0 then
     req:=diff;
     if roomtype='elite' then req:=req+2;end if;
     if roomtype='boss' then req:=req+5;end if;
     st.tower_max_floor:=floorv;
   end if;
 end if;

 base_req:=greatest(0,req);

 if base_req>0 and st.xp<1700 then
   select * into vip
   from recovery_private.v8195_vip_state
   where user_id=p_uid
   for update;

   if found and vip.vip_until>now() then
     select * into cfg from recovery_private.v8195_vip_config where singleton=true;

     if vip.weekly_bonus_cycle is distinct from st.cycle_key then
       bonus_remainder:=0;
     else
       bonus_remainder:=greatest(0,coalesce(vip.weekly_bonus_remainder,0));
     end if;

     bonus_exact:=(base_req*greatest(0,coalesce(cfg.weekly_xp_bonus_pct,10))/100.0)+bonus_remainder;
     vip_bonus:=floor(bonus_exact)::int;
     bonus_remainder:=bonus_exact-vip_bonus;
     req:=base_req+vip_bonus;

     update recovery_private.v8195_vip_state
     set weekly_bonus_remainder=bonus_remainder,
         weekly_bonus_cycle=st.cycle_key,
         revision=revision+1,
         updated_at=now()
     where user_id=p_uid;

     event_detail:=event_detail||jsonb_build_object(
       'vip_weekly_bonus_pct',coalesce(cfg.weekly_xp_bonus_pct,10),
       'vip_base_xp',base_req,
       'vip_bonus_xp',vip_bonus
     );
   end if;
 end if;

 oldlv:=public.v6359_weekly_chest_level(st.xp);
 gain:=least(greatest(0,req),greatest(0,1700-st.xp));

 update public.player_weekly_chest_state
 set xp=xp+gain,
     lifetime_xp=lifetime_xp+gain,
     max_level_ever=greatest(max_level_ever,public.v6359_weekly_chest_level(xp+gain)),
     tower_max_floor=st.tower_max_floor,
     daily_pvp_wins=st.daily_pvp_wins,
     daily_plants=st.daily_plants,
     revision=revision+1,
     updated_at=now()
 where user_id=p_uid
 returning * into st;

 insert into public.player_weekly_chest_events(
   user_id,event_id,activity_type,requested_xp,applied_xp,detail
 ) values(
   p_uid,eid,typ,req,gain,event_detail
 );

 return gain;
exception
 when unique_violation then return 0;
end;
$function$;

CREATE OR REPLACE FUNCTION public.v7083_refresh_shop_section(p_kind text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  kind text:=lower(btrim(coalesce(p_kind,'')));
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  h jsonb;
  sh recovery_private.v7063_shop_state%rowtype;
  tp public.player_progress_trusted%rowtype;
  vip recovery_private.v8195_vip_state%rowtype;
  cfg recovery_private.v8195_vip_config%rowtype;
  today date:=(now() at time zone 'Europe/Berlin')::date;
  vip_free boolean:=false;
  vip_available boolean:=false;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if not recovery_private.v7063_item_stage_enabled(u) then raise exception 'ITEM_STAGE_NOT_ENABLED'; end if;
  if kind not in ('weapon','magic') then raise exception 'INVALID_SHOP_SECTION'; end if;
  if length(req)<8 then raise exception 'REQUEST_ID_REQUIRED'; end if;

  perform recovery_private.v7063_ensure_shop_state(u);

  if exists(
    select 1 from recovery_private.v8195_vip_reroll_events e
    where e.user_id=u and e.request_id=req
  ) then
    select * into sh from recovery_private.v7063_shop_state where user_id=u;
    select * into tp from public.player_progress_trusted where user_id=u;
    return jsonb_build_object(
      'ok',true,'duplicate',true,'kind',kind,
      'gold',tp.gold,'harz',tp.harz_taler,
      'vip_free_reroll_used',true,'vip_free_reroll_available',false,
      'weaponShop',sh.weapon_offers,'magicShop',sh.magic_offers,'revision',sh.revision
    );
  end if;

  if exists(
    select 1 from public.player_harz_events
    where user_id=u and event_id=req
  ) then
    select * into sh from recovery_private.v7063_shop_state where user_id=u;
    select * into tp from public.player_progress_trusted where user_id=u;
    select * into vip from recovery_private.v8195_vip_state where user_id=u;
    select * into cfg from recovery_private.v8195_vip_config where singleton=true;
    vip_available:=found
      and vip.vip_until>now()
      and coalesce(cfg.free_shop_rerolls,1)>0
      and vip.daily_reroll_day is distinct from today;
    return jsonb_build_object(
      'ok',true,'duplicate',true,'kind',kind,
      'gold',tp.gold,'harz',tp.harz_taler,
      'vip_free_reroll_used',false,'vip_free_reroll_available',vip_available,
      'weaponShop',sh.weapon_offers,'magicShop',sh.magic_offers,'revision',sh.revision
    );
  end if;

  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into vip from recovery_private.v8195_vip_state where user_id=u for update;
  if found
     and vip.vip_until>now()
     and coalesce(cfg.free_shop_rerolls,1)>0
     and vip.daily_reroll_day is distinct from today then
    update recovery_private.v8195_vip_state
    set daily_reroll_day=today,
        revision=revision+1,
        updated_at=now()
    where user_id=u;

    insert into recovery_private.v8195_vip_reroll_events(user_id,request_id,reroll_day,kind)
    values(u,req,today,kind);
    vip_free:=true;
  else
    h:=public.v6354_apply_harz_event(req,'shop_reroll',-1);
    if coalesce((h->>'applied_delta')::integer,0)<>-1 then
      return jsonb_build_object(
        'ok',false,'reason',coalesce(h->>'decision','INSUFFICIENT_HARZ'),
        'harz',coalesce((h->>'harz')::bigint,0),
        'vip_free_reroll_used',false,'vip_free_reroll_available',false
      );
    end if;
  end if;

  if kind='weapon' then
    update recovery_private.v7063_shop_state
    set day_key=today,
        weapon_offers=recovery_private.v7063_generate_weapon_offers(u),
        revision=revision+1,
        updated_at=now()
    where user_id=u
    returning * into sh;
  else
    update recovery_private.v7063_shop_state
    set day_key=today,
        magic_offers=recovery_private.v7063_generate_magic_offers(u),
        revision=revision+1,
        updated_at=now()
    where user_id=u
    returning * into sh;
  end if;

  select * into tp from public.player_progress_trusted where user_id=u;

  select * into vip from recovery_private.v8195_vip_state where user_id=u;
  vip_available:=found
    and vip.vip_until>now()
    and coalesce(cfg.free_shop_rerolls,1)>0
    and vip.daily_reroll_day is distinct from today;

  return jsonb_build_object(
    'ok',true,'duplicate',false,'kind',kind,
    'gold',tp.gold,'harz',tp.harz_taler,
    'vip_free_reroll_used',vip_free,
    'vip_free_reroll_available',vip_available,
    'weaponShop',sh.weapon_offers,'magicShop',sh.magic_offers,'revision',sh.revision
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.v7137_set_avatar_frame(p_frame_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  fid text:=nullif(lower(btrim(coalesce(p_frame_id,''))),'');
  st public.player_avatar_frames_v7137%rowtype;
  owned text[]:=array[]::text[];
  referral boolean:=false;
  vip_active boolean:=false;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if fid='none' then fid:=null; end if;

  insert into public.player_avatar_frames_v7137(user_id)
  values(u) on conflict(user_id) do nothing;

  select * into st
  from public.player_avatar_frames_v7137
  where user_id=u
  for update;

  select coalesce(r.frame_unlocked,false)
    into referral
  from public.player_referral_state_v7129 r
  where r.user_id=u;
  referral:=coalesce(referral,false);
  vip_active:=recovery_private.v8195_is_active_for(u);

  select coalesce(array_agg(distinct x order by x),array[]::text[])
    into owned
  from unnest(
    coalesce(st.unlocked,array[]::text[])
    || case when referral then array['referral_legend']::text[] else array[]::text[] end
  ) q(x);

  if fid='vip_crown' and not vip_active then
    return jsonb_build_object('ok',false,'reason','VIP_REQUIRED','frame_id',fid);
  end if;

  if fid is not null and fid<>'vip_crown' and not (fid=any(owned)) then
    return jsonb_build_object('ok',false,'reason','FRAME_NOT_UNLOCKED','frame_id',fid);
  end if;

  update public.player_avatar_frames_v7137
  set active_frame_id=fid,
      revision=revision+1,
      updated_at=now()
  where user_id=u;

  update public.profiles
  set avatar_frame_id=fid,updated_at=now()
  where id=u;

  return recovery_private.v7137_frame_state_for(u);
end;
$function$;

CREATE OR REPLACE FUNCTION public.v8195_credit_google_play_vip_purchase(p_user_id uuid, p_purchase_token text, p_product_id text, p_order_id text, p_google_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  days_add integer;
  existing recovery_private.v8195_google_play_vip_purchases%rowtype;
  st recovery_private.v8195_vip_state%rowtype;
  inserted boolean:=false;
begin
  if p_user_id is null then raise exception 'user_id fehlt'; end if;
  if coalesce(length(trim(p_purchase_token)),0)<8 then raise exception 'purchase_token ungültig'; end if;
  days_add:=case p_product_id when 'vip_7day' then 7 when 'vip_7d' then 7 when 'vip_14d' then 14 when 'vip_30d' then 30 else null end;
  if days_add is null then raise exception 'Unbekannte VIP Produkt-ID: %',p_product_id; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_purchase_token,0));

  select * into existing
  from recovery_private.v8195_google_play_vip_purchases
  where purchase_token=p_purchase_token;

  if found then
    if existing.user_id<>p_user_id or existing.product_id<>p_product_id then
      raise exception 'Kauftoken wurde bereits einem anderen Account/Produkt zugeordnet';
    end if;
  else
    insert into recovery_private.v8195_google_play_vip_purchases(
      purchase_token,user_id,product_id,order_id,google_payload,days_added
    ) values(
      p_purchase_token,p_user_id,p_product_id,nullif(p_order_id,''),coalesce(p_google_payload,'{}'::jsonb),days_add
    );
    inserted:=true;
  end if;

  if inserted then
    insert into recovery_private.v8195_vip_state(user_id,vip_until,last_product_id,public_visible,revision,updated_at)
    values(p_user_id,now()+make_interval(days=>days_add),p_product_id,true,1,now())
    on conflict(user_id) do update
    set vip_until=greatest(coalesce(recovery_private.v8195_vip_state.vip_until,now()),now())+make_interval(days=>days_add),
        last_product_id=p_product_id,
        revision=recovery_private.v8195_vip_state.revision+1,
        updated_at=now();
  end if;

  select * into st from recovery_private.v8195_vip_state where user_id=p_user_id;

  update public.profiles p
  set vip_until=st.vip_until,
      vip_visible=(st.public_visible and st.vip_until>now()),
      updated_at=now()
  where p.id=p_user_id;

  return jsonb_build_object(
    'ok',true,'server','beta','alreadyProcessed',not inserted,'productId',p_product_id,
    'vipDaysAdded',case when inserted then days_add else 0 end,
    'vipUntil',st.vip_until,
    'active',st.vip_until>now()
  );
end;
$function$;

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
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtext(u::text), hashtext(today::text||':vip_daily'));

  select * into st from recovery_private.v8195_vip_state where user_id=u for update;
  if not found or st.vip_until<=now() then
    return jsonb_build_object('ok',false,'reason','VIP_INACTIVE','state',public.v8195_vip_state());
  end if;
  if st.daily_claim_day=today or exists(
    select 1 from recovery_private.v8195_vip_daily_claims c where c.user_id=u and c.claim_day=today
  ) then
    return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',public.v8195_vip_state());
  end if;

  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into tp from public.player_progress_trusted where user_id=u for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;
  select * into it from public.player_item_state where user_id=u for update;
  if not found then raise exception 'ITEM_STATE_MISSING'; end if;

  h:=greatest(0,coalesce(cfg.daily_harz,1));
  f:=greatest(0,coalesce(cfg.daily_fragments,10));
  g:=greatest(0,coalesce(cfg.daily_gold_base,250)+greatest(1,coalesce(tp.level,1))*coalesce(cfg.daily_gold_per_level,50));

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

  insert into recovery_private.v8195_vip_daily_claims(user_id,claim_day,harz,gold,fragments)
  values(u,today,h,g,f);

  update recovery_private.v8195_vip_state
  set daily_claim_day=today, revision=revision+1, updated_at=now()
  where user_id=u;

  return jsonb_build_object(
    'ok',true,'claimed',true,
    'harz_awarded',h,'gold_awarded',g,'fragments_awarded',f,
    'harz',tp.harz_taler,'gold',tp.gold,'fragments',it.fragments,
    'state',public.v8195_vip_state()
  );
exception when unique_violation then
  return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED','state',public.v8195_vip_state());
end;
$function$;

CREATE OR REPLACE FUNCTION public.v8195_vip_set_visible(p_visible boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  u uuid:=auth.uid();
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  insert into recovery_private.v8195_vip_state(user_id,public_visible,updated_at)
  values(u,coalesce(p_visible,true),now())
  on conflict(user_id) do update
  set public_visible=excluded.public_visible,
      revision=recovery_private.v8195_vip_state.revision+1,
      updated_at=now();

  update public.profiles p
  set vip_visible=(coalesce(p_visible,true) and recovery_private.v8195_is_active_for(u)),
      vip_until=(select v.vip_until from recovery_private.v8195_vip_state v where v.user_id=u),
      updated_at=now()
  where p.id=u;

  return public.v8195_vip_state();
end;
$function$;

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
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into cfg from recovery_private.v8195_vip_config where singleton=true;
  select * into st from recovery_private.v8195_vip_state where user_id=u;
  active:=found and st.vip_until>now();
  return jsonb_build_object(
    'ok',true,
    'active',active,
    'vip_until',case when st.user_id is null then null else st.vip_until end,
    'public_visible',case when st.user_id is null then true else st.public_visible end,
    'daily_claim_available',active and st.daily_claim_day is distinct from today,
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

CREATE OR REPLACE FUNCTION recovery_private.v7137_frame_state_for(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  st public.player_avatar_frames_v7137%rowtype;
  owned text[]:=array[]::text[];
  referral boolean:=false;
  frames jsonb:='[]'::jsonb;
  bal bigint:=0;
  frame_count integer:=0;
  vip_active boolean:=false;
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  insert into public.player_avatar_frames_v7137(user_id)
  values(p_uid)
  on conflict(user_id) do nothing;

  select * into st
  from public.player_avatar_frames_v7137
  where user_id=p_uid
  for update;

  select coalesce(r.frame_unlocked,false)
    into referral
  from public.player_referral_state_v7129 r
  where r.user_id=p_uid;
  referral:=coalesce(referral,false);

  vip_active:=recovery_private.v8195_is_active_for(p_uid);

  select coalesce(array_agg(distinct x order by x),array[]::text[])
    into owned
  from unnest(
    coalesce(st.unlocked,array[]::text[])
    || case when referral then array['referral_legend']::text[] else array[]::text[] end
  ) q(x);

  if st.active_frame_id is not null
     and not (st.active_frame_id=any(owned))
     and not (st.active_frame_id='vip_crown' and vip_active) then
    st.active_frame_id:=null;
    update public.player_avatar_frames_v7137
    set active_frame_id=null, revision=revision+1, updated_at=now()
    where user_id=p_uid;
  end if;

  update public.profiles
  set avatar_frame_id=st.active_frame_id, updated_at=now()
  where id=p_uid
    and avatar_frame_id is distinct from st.active_frame_id;

  select greatest(0,coalesce(t.harz_taler,0))
    into bal
  from public.player_progress_trusted t
  where t.user_id=p_uid;
  bal:=coalesce(bal,0);

  frame_count:=coalesce(cardinality(owned),0);

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',c.id,
      'name',c.label,
      'price',c.price,
      'effect',c.effect,
      'source',c.source,
      'owned',c.id=any(owned),
      'active',c.id=st.active_frame_id
    ) order by c.sort_order
  ),'[]'::jsonb)
  into frames
  from recovery_private.v7137_frame_catalog() c;

  if vip_active then
    frames:=frames||jsonb_build_array(jsonb_build_object(
      'id','vip_crown',
      'name','VIP-Kronenrahmen',
      'price',0,
      'effect',true,
      'source','vip',
      'owned',true,
      'active',st.active_frame_id='vip_crown',
      'temporary',true
    ));
  end if;

  return jsonb_build_object(
    'ok',true,
    'active_frame_id',st.active_frame_id,
    'unlocked',to_jsonb(owned),
    'frame_count',frame_count,
    'purchased_count',greatest(0,coalesce(st.purchased_count,0)),
    'harz',bal,
    'frames',frames,
    'vip_active',vip_active,
    'revision',st.revision
  );
end;
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8195_guard_profile_vip()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  vu timestamptz;
  vv boolean:=false;
begin
  select v.vip_until, (v.public_visible and v.vip_until>now())
  into vu,vv
  from recovery_private.v8195_vip_state v
  where v.user_id=new.id;
  new.vip_until:=vu;
  new.vip_visible:=coalesce(vv,false);
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8195_is_active_for(p_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(
    select 1
    from recovery_private.v8195_vip_state v
    where v.user_id=p_uid and v.vip_until>now()
  );
$function$;

drop trigger if exists trg_v8195_guard_profile_vip on public.profiles;
create trigger trg_v8195_guard_profile_vip
before insert or update on public.profiles
for each row execute function recovery_private.v8195_guard_profile_vip();

revoke all on function recovery_private.v8195_is_active_for(uuid) from public,anon,authenticated;
grant execute on function recovery_private.v8195_is_active_for(uuid) to service_role;
revoke all on function recovery_private.v8195_guard_profile_vip() from public,anon,authenticated;
grant execute on function recovery_private.v8195_guard_profile_vip() to service_role;

revoke all on function public.v8195_vip_state() from public,anon;
grant execute on function public.v8195_vip_state() to authenticated,service_role;
revoke all on function public.v8195_vip_set_visible(boolean) from public,anon;
grant execute on function public.v8195_vip_set_visible(boolean) to authenticated,service_role;
revoke all on function public.v8195_vip_claim_daily() from public,anon;
grant execute on function public.v8195_vip_claim_daily() to authenticated,service_role;
revoke all on function public.v8195_credit_google_play_vip_purchase(uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.v8195_credit_google_play_vip_purchase(uuid,text,text,text,jsonb) to service_role;

commit;
