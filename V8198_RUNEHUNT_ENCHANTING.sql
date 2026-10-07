-- Grow Legends V8.198 — Runenjagd + Verzaubern (Beta)
-- Snapshot of applied migrations v8198_runehunt_enchant_beta + v8198_runehunt_state_fix.

create table if not exists recovery_private.v8198_enchant_wallet(
  user_id uuid primary key references auth.users(id) on delete cascade,
  rune_shards integer not null default 0 check (rune_shards >= 0),
  runes integer not null default 0 check (runes >= 0),
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table recovery_private.v8198_enchant_wallet enable row level security;
revoke all on recovery_private.v8198_enchant_wallet from public, anon, authenticated;

create table if not exists recovery_private.v8198_runehunt_progress(
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key date not null,
  runs_used smallint not null default 0 check (runs_used between 0 and 5),
  completion_bonus_claimed boolean not null default false,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,event_key)
);
alter table recovery_private.v8198_runehunt_progress enable row level security;
revoke all on recovery_private.v8198_runehunt_progress from public, anon, authenticated;

create table if not exists recovery_private.v8198_rune_ledger(
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  kind text not null check (kind in ('hunt','fuse','enchant')),
  event_key date,
  item_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table recovery_private.v8198_rune_ledger enable row level security;
revoke all on recovery_private.v8198_rune_ledger from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.v7102_auto_weekend_event_active(p_type text, p_at timestamp with time zone DEFAULT now())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  d date := (p_at at time zone 'Europe/Berlin')::date;
  iso integer := extract(isodow from (p_at at time zone 'Europe/Berlin'))::integer;
  monday date;
  week_index integer;
  cycle integer;
  typ text := lower(btrim(coalesce(p_type,'')));
begin
  monday := d-(iso-1);
  week_index := ((monday-date '2026-09-14')/7)::integer;
  cycle := ((week_index % 2)+2)%2;

  if typ in ('gold','gold-event') then
    return iso in (5,6,7) and cycle=0;
  end if;
  if typ in ('dampf','steam','dampf-event') then
    return iso in (5,6,7) and cycle=0;
  end if;
  if typ in ('xp','exp','erfahrung','erfahrungs-event') then
    return iso in (5,6,7) and cycle=1;
  end if;
  if typ in ('koloss','worldboss','weltboss','mystic','mystisch','smaragd') then
    return iso=4;
  end if;
  if typ in ('runehunt','runenjagd','rune','runen') then
    return iso=7 and cycle=1;
  end if;
  return false;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8198_enchant_item(p_item_id text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  iid text := btrim(coalesce(p_item_id,''));
  req text := left(btrim(coalesce(p_request_id,'')),160);
  led recovery_private.v8198_rune_ledger%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  st public.player_item_state%rowtype;
  it jsonb;
  place text;
  slot text;
  inv_ord bigint;
  current_level integer:=0;
  target_level integer;
  chance numeric;
  succeeded boolean;
  base_native jsonb;
  new_native jsonb:='{}'::jsonb;
  new_bonus jsonb;
  k text;
  base_v numeric;
  boosted numeric;
  addon numeric;
  gem jsonb;
  scroll jsonb;
  meta jsonb;
  newinv jsonb;
  neweq jsonb;
  payload jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(iid)<1 then raise exception 'ITEM_ID_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;

  select * into led from recovery_private.v8198_rune_ledger where user_id=u and request_id=req;
  if found then
    select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
    select * into st from public.player_item_state where user_id=u;
    return coalesce(led.payload,'{}'::jsonb)||jsonb_build_object(
      'ok',true,'duplicate',true,'rune_shards',coalesce(w.rune_shards,0),'runes',coalesce(w.runes,0),
      'inventory',st.inventory,'equipment',st.equipment,'materials',st.materials,'fragments',st.fragments,
      'revision',st.revision,'combat_power',st.combat_power,'gear_score',st.gear_score
    );
  end if;

  insert into recovery_private.v8198_enchant_wallet(user_id)
  values(u) on conflict(user_id) do nothing;

  select * into w from recovery_private.v8198_enchant_wallet where user_id=u for update;
  select * into st from public.player_item_state where user_id=u for update;
  if not found or not coalesce(st.guard_enabled,false) then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;
  if w.runes<1 then
    return jsonb_build_object('ok',false,'reason','NO_ENCHANT_RUNE','rune_shards',w.rune_shards,'runes',w.runes);
  end if;

  select x.value,x.ord into it,inv_ord
  from jsonb_array_elements(coalesce(st.inventory,'[]'::jsonb)) with ordinality x(value,ord)
  where public.v6355_item_id(x.value)=iid
  limit 1;
  if found then
    place:='inventory';
  else
    select e.key,e.value into slot,it
    from jsonb_each(coalesce(st.equipment,'{}'::jsonb)) e
    where public.v6355_item_id(e.value)=iid
    limit 1;
    if found then place:='equipment'; end if;
  end if;

  if it is null then
    return jsonb_build_object('ok',false,'reason','ITEM_NOT_FOUND','rune_shards',w.rune_shards,'runes',w.runes);
  end if;

  current_level:=greatest(0,coalesce(nullif(it#>>'{v8198Enchant,level}','')::integer,0));
  if current_level>=10 then
    return jsonb_build_object('ok',false,'reason','MAX_ENCHANT','level',current_level,'rune_shards',w.rune_shards,'runes',w.runes);
  end if;

  target_level:=current_level+1;
  chance:=recovery_private.v8198_enchant_chance(target_level);
  succeeded:=(random()*100)<chance;

  update recovery_private.v8198_enchant_wallet
  set runes=runes-1,revision=revision+1,updated_at=now()
  where user_id=u returning * into w;

  if succeeded then
    base_native:=coalesce(it#>'{v8198Enchant,baseNative}',recovery_private.v7064_item_native_map(it));
    if jsonb_typeof(base_native)<>'object' or base_native='{}'::jsonb then
      raise exception 'ITEM_NATIVE_STATS_MISSING';
    end if;

    gem:=it->'gem';
    scroll:=case when jsonb_typeof(it->'enchants')='array' and jsonb_array_length(it->'enchants')>0 then it->'enchants'->0 else it->'enchant' end;
    new_bonus:=coalesce(it->'bonus','{}'::jsonb);

    foreach k in array array['staerke','geschick','intelligenz','ausdauer','glueck'] loop
      base_v:=coalesce((base_native->>k)::numeric,0);
      boosted:=round(base_v*(1+(target_level*0.015)),2);
      addon:=0;
      if gem is not null and gem<>'null'::jsonb and gem->>'stat'=k and coalesce(gem->>'value','')~'^-?[0-9]+([.][0-9]+)?$' then
        addon:=addon+(gem->>'value')::numeric;
      end if;
      if k='glueck' and scroll is not null and scroll<>'null'::jsonb and lower(coalesce(scroll->>'effect',''))='luck' and coalesce(scroll->>'value','')~'^-?[0-9]+([.][0-9]+)?$' then
        addon:=addon+(scroll->>'value')::numeric;
      end if;
      if base_v<>0 then
        new_native:=jsonb_set(new_native,array[k],to_jsonb(boosted),true);
        new_bonus:=jsonb_set(new_bonus,array[k],to_jsonb(boosted+addon),true);
      end if;
    end loop;

    meta:=jsonb_build_object(
      'level',target_level,
      'baseNative',base_native,
      'statPct',round(target_level*1.5,1),
      'updatedAt',extract(epoch from now())::bigint*1000
    );
    it:=jsonb_set(it,'{v8198Enchant}',meta,true);
    it:=jsonb_set(it,'{bonus}',new_bonus,true);
    it:=jsonb_set(it,'{v429StatLock,native}',new_native,true);

    if place='inventory' then
      select coalesce(jsonb_agg(case when x.ord=inv_ord then it else x.value end order by x.ord),'[]'::jsonb)
      into newinv
      from jsonb_array_elements(st.inventory) with ordinality x(value,ord);
      neweq:=st.equipment;
    else
      newinv:=st.inventory;
      neweq:=jsonb_set(st.equipment,array[slot],it,true);
    end if;

    update public.player_item_state
    set inventory=newinv,
        equipment=neweq,
        gear_score=public.v6355_gear_score(neweq),
        revision=revision+1,
        updated_at=now()
    where user_id=u
    returning * into st;

    perform public.v6358_refresh_combat_power_for(u);
    select * into st from public.player_item_state where user_id=u;
  end if;

  payload:=jsonb_build_object(
    'ok',true,'duplicate',false,'item_id',iid,
    'success',succeeded,'previous_level',current_level,'target_level',target_level,
    'level',case when succeeded then target_level else current_level end,
    'chance',chance,'stat_pct',case when succeeded then target_level*1.5 else current_level*1.5 end
  );

  insert into recovery_private.v8198_rune_ledger(user_id,request_id,kind,item_id,payload)
  values(u,req,'enchant',iid,payload);

  insert into public.player_item_events(
    user_id,event_id,source,action,added_count,removed_count,changed_count,
    fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
  ) values(
    u,req,'v8198_enchant',case when succeeded then 'enchant_success' else 'enchant_fail' end,
    0,0,case when succeeded then 1 else 0 end,
    st.fragments,st.fragments,0,'item:'||iid||':target:'||target_level,
    case when succeeded then 'accepted' else 'failed_roll' end,st.revision
  ) on conflict(user_id,event_id) do nothing;

  return payload||jsonb_build_object(
    'rune_shards',w.rune_shards,'runes',w.runes,
    'inventory',st.inventory,'equipment',st.equipment,'materials',st.materials,'fragments',st.fragments,
    'revision',st.revision,'combat_power',st.combat_power,'gear_score',st.gear_score
  );
end
$function$;

CREATE OR REPLACE FUNCTION public.v8198_enchant_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  w recovery_private.v8198_enchant_wallet%rowtype;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;

  insert into recovery_private.v8198_enchant_wallet(user_id)
  values(u) on conflict(user_id) do nothing;

  select * into w
  from recovery_private.v8198_enchant_wallet
  where user_id=u;

  return jsonb_build_object(
    'ok',true,
    'rune_shards',w.rune_shards,
    'runes',w.runes,
    'wallet_revision',w.revision,
    'shards_per_rune',10,
    'max_enchant',10,
    'stat_pct_per_level',1.5,
    'chances',jsonb_build_object(
      '1',100,'2',70,'3',50,'4',30,'5',15,'6',5,
      '7',6,'8',6,'9',6,'10',6
    )
  );
end
$function$;

CREATE OR REPLACE FUNCTION public.v8198_fuse_rune(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  req text := left(btrim(coalesce(p_request_id,'')),160);
  led recovery_private.v8198_rune_ledger%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  payload jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;

  select * into led from recovery_private.v8198_rune_ledger where user_id=u and request_id=req;
  if found then
    select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
    return coalesce(led.payload,'{}'::jsonb)||jsonb_build_object('ok',true,'duplicate',true,'rune_shards',coalesce(w.rune_shards,0),'runes',coalesce(w.runes,0));
  end if;

  insert into recovery_private.v8198_enchant_wallet(user_id)
  values(u) on conflict(user_id) do nothing;
  select * into w from recovery_private.v8198_enchant_wallet where user_id=u for update;

  if w.rune_shards<10 then
    return jsonb_build_object('ok',false,'reason','INSUFFICIENT_RUNE_SHARDS','rune_shards',w.rune_shards,'required',10,'runes',w.runes);
  end if;

  update recovery_private.v8198_enchant_wallet
  set rune_shards=rune_shards-10,runes=runes+1,revision=revision+1,updated_at=now()
  where user_id=u returning * into w;

  payload:=jsonb_build_object('ok',true,'duplicate',false,'fused',1,'rune_shards',w.rune_shards,'runes',w.runes);
  insert into recovery_private.v8198_rune_ledger(user_id,request_id,kind,payload)
  values(u,req,'fuse',payload);
  return payload;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8198_runehunt_run(p_sigil text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  req text := left(btrim(coalesce(p_request_id,'')),160);
  sig text := lower(btrim(coalesce(p_sigil,'')));
  d date := (now() at time zone 'Europe/Berlin')::date;
  led recovery_private.v8198_rune_ledger%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  p recovery_private.v8198_runehunt_progress%rowtype;
  base_shards integer;
  bonus_shards integer := 0;
  direct_runes integer := 0;
  next_runs integer;
  reward jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  if sig not in ('verdant','ember','void') then raise exception 'INVALID_SIGIL'; end if;

  select * into led from recovery_private.v8198_rune_ledger
  where user_id=u and request_id=req;
  if found then
    select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
    select * into p from recovery_private.v8198_runehunt_progress where user_id=u and event_key=led.event_key;
    return coalesce(led.payload,'{}'::jsonb)||jsonb_build_object(
      'ok',true,'duplicate',true,
      'rune_shards',coalesce(w.rune_shards,0),'runes',coalesce(w.runes,0),
      'runs_used',coalesce(p.runs_used,0),'runs_left',greatest(0,5-coalesce(p.runs_used,0))
    );
  end if;

  if not public.v7102_auto_weekend_event_active('runehunt',now()) then
    return jsonb_build_object('ok',false,'reason','RUNEHUNT_INACTIVE','next_event',recovery_private.v8198_next_runehunt(now()));
  end if;

  insert into recovery_private.v8198_enchant_wallet(user_id)
  values(u) on conflict(user_id) do nothing;
  insert into recovery_private.v8198_runehunt_progress(user_id,event_key)
  values(u,d) on conflict(user_id,event_key) do nothing;

  select * into w from recovery_private.v8198_enchant_wallet where user_id=u for update;
  select * into p from recovery_private.v8198_runehunt_progress where user_id=u and event_key=d for update;

  if p.runs_used>=5 then
    return jsonb_build_object('ok',false,'reason','NO_RUNS_LEFT','runs_used',p.runs_used,'runs_left',0,'rune_shards',w.rune_shards,'runes',w.runes);
  end if;

  base_shards := case when random()<0.60 then 1 else 2 end;
  direct_runes := case when random()<0.06 then 1 else 0 end;
  next_runs := p.runs_used+1;
  if next_runs=5 and not p.completion_bonus_claimed then
    bonus_shards := 3;
  end if;

  update recovery_private.v8198_enchant_wallet
  set rune_shards=rune_shards+base_shards+bonus_shards,
      runes=runes+direct_runes,
      revision=revision+1,
      updated_at=now()
  where user_id=u
  returning * into w;

  update recovery_private.v8198_runehunt_progress
  set runs_used=next_runs,
      completion_bonus_claimed=(completion_bonus_claimed or next_runs=5),
      revision=revision+1,
      updated_at=now()
  where user_id=u and event_key=d
  returning * into p;

  reward := jsonb_build_object(
    'ok',true,'duplicate',false,'sigil',sig,'event_key',d,
    'shards_awarded',base_shards+bonus_shards,
    'base_shards',base_shards,
    'completion_shards',bonus_shards,
    'runes_awarded',direct_runes,
    'runs_used',p.runs_used,'runs_left',greatest(0,5-p.runs_used),
    'rune_shards',w.rune_shards,'runes',w.runes
  );

  insert into recovery_private.v8198_rune_ledger(user_id,request_id,kind,event_key,payload)
  values(u,req,'hunt',d,reward);

  return reward;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8198_runehunt_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  d date := (now() at time zone 'Europe/Berlin')::date;
  active boolean := public.v7102_auto_weekend_event_active('runehunt',now());
  evt_key date := recovery_private.v8198_next_runehunt(now());
  w recovery_private.v8198_enchant_wallet%rowtype;
  p recovery_private.v8198_runehunt_progress%rowtype;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;

  insert into recovery_private.v8198_enchant_wallet(user_id)
  values(u) on conflict(user_id) do nothing;

  if active then
    evt_key := d;
    insert into recovery_private.v8198_runehunt_progress(user_id,event_key)
    values(u,evt_key) on conflict(user_id,event_key) do nothing;
    select * into p
    from recovery_private.v8198_runehunt_progress
    where user_id=u and event_key=evt_key;
  else
    p.runs_used := 0;
    p.completion_bonus_claimed := false;
    p.revision := 0;
  end if;

  select * into w from recovery_private.v8198_enchant_wallet where user_id=u;

  return jsonb_build_object(
    'ok',true,
    'active',active,
    'event_key',evt_key,
    'next_event',recovery_private.v8198_next_runehunt(now()),
    'runs_used',coalesce(p.runs_used,0),
    'runs_left',greatest(0,5-coalesce(p.runs_used,0)),
    'max_runs',5,
    'completion_bonus_claimed',coalesce(p.completion_bonus_claimed,false),
    'rune_shards',w.rune_shards,
    'runes',w.runes,
    'wallet_revision',w.revision,
    'shards_per_rune',10
  );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8198_enchant_chance(p_target_level integer)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_temp'
AS $function$
  select case greatest(1,coalesce(p_target_level,1))
    when 1 then 100::numeric
    when 2 then 70::numeric
    when 3 then 50::numeric
    when 4 then 30::numeric
    when 5 then 15::numeric
    when 6 then 5::numeric
    else 6::numeric
  end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8198_next_runehunt(p_at timestamp with time zone DEFAULT now())
 RETURNS date
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  start_date date := (p_at at time zone 'Europe/Berlin')::date;
  cand date;
  iso integer;
  monday date;
  week_index integer;
  cycle integer;
  i integer;
begin
  for i in 0..20 loop
    cand := start_date+i;
    iso := extract(isodow from cand)::integer;
    monday := cand-(iso-1);
    week_index := ((monday-date '2026-09-14')/7)::integer;
    cycle := ((week_index % 2)+2)%2;
    if iso=7 and cycle=1 then return cand; end if;
  end loop;
  return start_date+14;
end
$function$;

revoke all on function public.v8198_enchant_state() from public, anon;
revoke all on function public.v8198_runehunt_state() from public, anon;
revoke all on function public.v8198_runehunt_run(text,text) from public, anon;
revoke all on function public.v8198_fuse_rune(text) from public, anon;
revoke all on function public.v8198_enchant_item(text,text) from public, anon;
grant execute on function public.v8198_enchant_state() to authenticated, service_role;
grant execute on function public.v8198_runehunt_state() to authenticated, service_role;
grant execute on function public.v8198_runehunt_run(text,text) to authenticated, service_role;
grant execute on function public.v8198_fuse_rune(text) to authenticated, service_role;
grant execute on function public.v8198_enchant_item(text,text) to authenticated, service_role;
revoke all on function recovery_private.v8198_next_runehunt(timestamptz) from public, anon, authenticated;
revoke all on function recovery_private.v8198_enchant_chance(integer) from public, anon, authenticated;
