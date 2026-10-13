-- V8.399 SERVER1 user-approved promotion of Beta V8.398 individual harvest.
-- Preserve existing Server1 original reward/ledger logic and all balance.
-- Old no-argument harvest remains compatible and continues to harvest all ripe plants.
BEGIN;
CREATE OR REPLACE FUNCTION server1.v6358_harvest_grow(p_plant_uid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  g server1.player_grow_state%rowtype;
  ss server1.player_seed_state%rowtype;
  tp server1.player_progress_trusted%rowtype;
  ist server1.player_item_state%rowtype;
  ps server1.player_pet_state%rowtype;
  w server1.game_weather_state%rowtype;
  p jsonb;
  meta jsonb;
  mat jsonb;
  pet jsonb;
  rows jsonb:='[]'::jsonb;
  pets jsonb:='[]'::jsonb;
  v_plants jsonb;
  v_bag jsonb;
  idx integer:=0;
  harvested_n integer:=0;
  care_n integer:=0;
  quality text;
  qmul numeric;
  rarity text;
  rrank integer;
  rmult numeric;
  mastery_lvl integer;
  mastery_yield numeric;
  mutation text:=null;
  mut_ch numeric;
  rr numeric;
  nowms bigint:=floor(extract(epoch from clock_timestamp())*1000)::bigint;
  startms bigint;
  dur bigint;
  progress numeric;
  daily bigint;
  hours numeric;
  potmul numeric;
  plant_gold bigint;
  plant_xp integer;
  plant_frag integer;
  total_gold bigint:=0;
  total_xp integer:=0;
  total_frag integer:=0;
  mastery_gain integer:=0;
  perfect_add integer:=0;
  splus_add integer:=0;
  mutation_add integer:=0;
  prism_add integer:=0;
  harvest_id bigint;
  seed text;
  seed_buy bigint;
  v_extra_seed text:=null;
  v_rare_seed text:=null;
  stock bigint;
  seed_added integer:=0;
  gold_event_active boolean:=false;
  xp_event_active boolean:=false;
  guild_gold integer:=0;
  guild_xp integer:=0;
  pet_gold_mul numeric:=1;
  pet_xp_mul numeric:=1;
  pet_yield_mul numeric:=1;
  wk text:=to_char(now() at time zone 'Europe/Berlin','IYYY-IW');
  fr_before bigint:=0;
  order_state jsonb;
  cp jsonb;
  ev text;
  removed_rows jsonb:='[]'::jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_plant_uid is not null and (btrim(p_plant_uid)='' or length(p_plant_uid)>128) then
    return jsonb_build_object('ok',false,'reason','INVALID_PLANT_UID');
  end if;

  /* V7.106 Golden Master: finalize the V6.349 70%-mutation roll before
     harvesting. Mutation statistics are awarded at discovery, not at harvest. */
  perform server1.v7106_roll_ready_grow_mutations_for(u);

  select * into g from server1.player_grow_state where user_id=u for update;
  if not found or not g.guard_enabled then raise exception 'GROW_GUARD_NOT_ENABLED'; end if;

  select * into ss from server1.player_seed_state where user_id=u for update;
  if not found or not ss.guard_enabled then raise exception 'SEED_GUARD_NOT_ENABLED'; end if;

  select * into tp from server1.player_progress_trusted where user_id=u for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;
  if not coalesce(tp.xp_guard_enabled,false) then raise exception 'XP_GUARD_NOT_ENABLED'; end if;
  if not coalesce(tp.gold_guard_enabled,false) then raise exception 'GOLD_GUARD_NOT_ENABLED'; end if;

  select * into ist from server1.player_item_state where user_id=u for update;
  if not found or not ist.guard_enabled then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;

  select * into ps from server1.player_pet_state where user_id=u and guard_enabled;
  if not found then ps.found:='{}'::jsonb; end if;

  select * into w from server1.game_weather_state where id=1;
  if not found then
    w.kind:='neutral';w.grow_mul:=1;w.yield_mul:=1;w.extra_seed_chance:=0;w.rare_seed_chance:=0;
  end if;

  if g.week_key<>wk then
    g.week_key:=wk;g.week_harvested:=0;g.week_perfect:=0;g.week_mutations:=0;g.week_claimed:=false;
  end if;

  select (
    server1.v7102_auto_weekend_event_active('gold',now())
    or exists(
      select 1 from server1.game_events ge
      where ge.name='Gold-Event' and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into gold_event_active;
  select (
    server1.v7102_auto_weekend_event_active('xp',now())
    or exists(
      select 1 from server1.game_events ge
      where ge.name='Erfahrungs-Event' and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into xp_event_active;

  select greatest(0,least(8,coalesce(gg.gold_level,0))),
         greatest(0,least(8,coalesce(gg.xp_level,0)))
    into guild_gold,guild_xp
  from server1.guild_members gm
  join server1.guilds gg on gg.id=gm.guild_id
  where gm.user_id=u limit 1;
  guild_gold:=coalesce(guild_gold,0);
  guild_xp:=coalesce(guild_xp,0);

  if server1.v6358_pet_complete(coalesce(ps.found,'{}'::jsonb),'bud_hase') then pet_gold_mul:=pet_gold_mul+.03; end if;
  if server1.v6358_pet_complete(coalesce(ps.found,'{}'::jsonb),'kush_waschbaer') then pet_gold_mul:=pet_gold_mul+.02; end if;
  if server1.v6358_pet_complete(coalesce(ps.found,'{}'::jsonb),'rauch_fuchs') then pet_xp_mul:=pet_xp_mul+.03; end if;
  if server1.v6358_pet_complete(coalesce(ps.found,'{}'::jsonb),'kief_maulwurf') then pet_xp_mul:=pet_xp_mul+.02; end if;
  if server1.v6358_pet_complete(coalesce(ps.found,'{}'::jsonb),'harz_baer') then pet_yield_mul:=pet_yield_mul+.02; end if;

  insert into server1.player_grow_harvests(user_id,weather_kind)
  values(u,coalesce(w.kind,'neutral'))
  returning id into harvest_id;

  v_plants:=coalesce(ss.plants,'[]'::jsonb);
  v_bag:=coalesce(g.bag,'[]'::jsonb);
  daily:=greatest(1000,tp.level::bigint*500);
  potmul:=1+g.pots_level*.10;

  idx:=0;
  for p in select value from jsonb_array_elements(v_plants) loop
    if p is null or p='null'::jsonb then idx:=idx+1;continue; end if;
    -- V8.399: individually selected pot; keep all other slots unchanged.
    if p_plant_uid is not null and coalesce(p->>'uid','')<>p_plant_uid then idx:=idx+1;continue; end if;
    if coalesce(p->>'start','') !~ '^[0-9]+$'
       or coalesce(p->>'duration','') !~ '^[0-9]+$'
       or not exists(
         select 1 from server1.player_grow_plant_events pe
         where pe.user_id=u and pe.plant_uid=p->>'uid' and pe.harvested_at is null
       )
    then idx:=idx+1;continue; end if;

    startms:=(p->>'start')::bigint;
    dur:=greatest(1,(p->>'duration')::bigint);
    progress:=greatest(0,((nowms-startms)*greatest(.80,least(1.30,coalesce(w.grow_mul,1))))/dur);
    if progress<1 then idx:=idx+1;continue; end if;

    seed:=lower(coalesce(p->>'seed',''));
    meta:=server1.v6358_seed_meta(seed);
    if meta is null then idx:=idx+1;continue; end if;

    select count(*) into care_n
    from server1.player_grow_care_events ce
    where ce.user_id=u and ce.plant_uid=p->>'uid';
    care_n:=greatest(0,least(4,care_n));
    quality:=server1.v6358_grow_quality(care_n);
    qmul:=case quality when 'C' then .82 when 'B' then .92 when 'A' then 1 when 'S' then 1.14 when 'S+' then 1.30 else .82 end;
    rarity:=coalesce(meta->>'rarity','common');
    rrank:=greatest(0,coalesce((meta->>'rank')::integer,0));
    rmult:=case rarity when 'uncommon' then 1.05 when 'rare' then 1.10 when 'epic' then 1.18 when 'legendary' then 1.30 else 1 end;

    mastery_lvl:=least(300,greatest(1,floor(sqrt(g.mastery_xp/18.0))::integer+1));
    mastery_yield:=1
      + case when mastery_lvl>=10 then .01 else 0 end
      + case when mastery_lvl>=100 then .02 else 0 end;

    mutation:=nullif(p->>'mutation','');
    if not coalesce((p->>'mutationChecked')::boolean,false) then
      /* Legacy/recovered fallback only. New plants are fixed at 70% by
         v7106_roll_ready_grow_mutations_for(). Use care completed before
         the threshold so late Nährstoffe cannot improve the old roll. */
      select count(*)::int into care_n
      from server1.player_grow_care_events ce
      where ce.user_id=u and ce.plant_uid=p->>'uid' and ce.progress<.70;
      care_n:=greatest(0,least(4,care_n));
      mut_ch:=.018 + care_n*.009 + rrank*.004
        + case when mastery_lvl>=200 then .012 when mastery_lvl>=100 then .006 else 0 end;
      if random()<mut_ch then
        rr:=random();
        mutation:=case
          when rr<.02 then 'prismatic'
          when rr<.17 then 'emerald'
          when rr<.35 then 'golden'
          when rr<.55 then 'purple'
          when rr<.75 then 'frost'
          when rr<.90 then 'black'
          else 'emerald'
        end;
        if mutation='emerald' and mastery_lvl<200 and random()<.60 then mutation:='purple'; end if;
      end if;
    end if;

    hours:=(coalesce((meta->>'grow_ms')::bigint,dur)/3600000.0);
    seed_buy:=greatest(0,coalesce((meta->>'buy')::bigint,0));
    plant_gold:=round(
      seed_buy
      + (
        round((daily*.20*(hours/24.0)/4.0*qmul*rmult*potmul*mastery_yield)/10.0)*10
      )
    )::bigint;
    if mutation='golden' then plant_gold:=round(plant_gold*1.20)::bigint; end if;
    plant_gold:=greatest(0,round(
      plant_gold
      * greatest(.80,least(1.30,coalesce(w.yield_mul,1)))
      * pet_yield_mul
      * pet_gold_mul
      * (1+(guild_gold*2)/100.0)
      * case when gold_event_active then 2 else 1 end
    )::bigint);

    plant_xp:=greatest(1,round(
      (coalesce((meta->>'grow_ms')::bigint,dur)/60000.0)
      * (.8+tp.level*.004)
      * case quality when 'C' then .75 when 'B' then .85 when 'A' then 1 when 'S' then 1.10 when 'S+' then 1.20 else .75 end
      * case rarity when 'uncommon' then 1.05 when 'rare' then 1.10 when 'epic' then 1.15 when 'legendary' then 1.25 else 1 end
      * pet_xp_mul
      * (1+(guild_xp*2)/100.0)
      * case when xp_event_active then 2 else 1 end
    )::integer);

    plant_frag:=
      (case quality when 'A' then 1 when 'S' then 2 when 'S+' then 4 else 0 end)
      +(case rarity when 'rare' then 1 when 'epic' then 2 when 'legendary' then 3 else 0 end)
      +(case when mutation is not null then 1 else 0 end)
      +(case when mutation='prismatic' then 3 else 0 end);

    mastery_gain:=mastery_gain + 12 + server1.v6358_quality_rank(quality)*5 + rrank*3 + case when mutation is not null then 8 else 0 end;
    if quality='S+' then perfect_add:=perfect_add+1;splus_add:=splus_add+1; end if;
    /* mutation_count / prismatic / week_mutations were already
       awarded at the V6.349 70% discovery threshold. */

    mat:=server1.v6358_make_grow_material_for(u,harvest_id,idx);

    rows:=rows||jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'uid',p->>'uid','seed',seed,'quality',quality,'mutation',mutation,
      'care_count',care_n,'gold',plant_gold,'xp',plant_xp,'fragments',plant_frag,
      'material',mat
    )));
    removed_rows:=removed_rows||jsonb_build_array(jsonb_build_object(
      'uid',p->>'uid','seed',seed,'quality',quality,'mutation',mutation,
      'care',coalesce(p->'care','[]'::jsonb),'care_count',care_n,
      'fragments',plant_frag
    ));

    v_bag:=v_bag||jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id','bloom_'||replace(gen_random_uuid()::text,'-',''),
      'seed',seed,'quality',quality,'mutation',mutation,
      'createdAt',nowms,'refined',false,'v6358ServerBloom',true
    )));
    if jsonb_array_length(v_bag)>150 then
      select coalesce(jsonb_agg(value order by ord),'[]'::jsonb) into v_bag
      from jsonb_array_elements(v_bag) with ordinality a(value,ord)
      where ord>jsonb_array_length(v_bag)-150;
    end if;

    total_gold:=total_gold+plant_gold;
    total_xp:=total_xp+plant_xp;
    total_frag:=total_frag+plant_frag;
    harvested_n:=harvested_n+1;

    update server1.player_grow_plant_events
    set harvested_at=now()
    where user_id=u and plant_uid=p->>'uid' and harvested_at is null;

    v_plants:=jsonb_set(v_plants,array[idx::text],'null'::jsonb,true);

    pet:=server1.v6358_roll_pet_for(
      u,'grow','grow_harvest:'||harvest_id::text||':'||(p->>'uid'),
      .02+care_n*.01,false
    );
    pets:=pets||jsonb_build_array(pet);
    idx:=idx+1;
  end loop;

  if harvested_n=0 then
    delete from server1.player_grow_harvests where id=harvest_id;
    return jsonb_build_object(
      'ok',false,'reason','NO_READY_PLANTS','plants',ss.plants,
      'grow_seeds',ss.grow_seeds,'time_seeds',ss.time_seeds
    );
  end if;

  if random()<greatest(0,least(.50,coalesce(w.extra_seed_chance,0))) then
    select value->>'seed' into v_extra_seed
    from jsonb_array_elements(rows) order by random() limit 1;
  end if;
  if random()<greatest(0,least(.50,coalesce(w.rare_seed_chance,0))) then
    v_rare_seed:=(array['violet','blue','critical','nebula','lemon'])[1+floor(random()*5)::integer];
  end if;

  if v_extra_seed is not null then
    stock:=greatest(0,coalesce((ss.grow_seeds->>v_extra_seed)::bigint,0))+1;
    ss.grow_seeds:=jsonb_set(ss.grow_seeds,array[v_extra_seed],to_jsonb(stock),true);
    seed_added:=seed_added+1;
  end if;
  if v_rare_seed is not null then
    stock:=greatest(0,coalesce((ss.grow_seeds->>v_rare_seed)::bigint,0))+1;
    ss.grow_seeds:=jsonb_set(ss.grow_seeds,array[v_rare_seed],to_jsonb(stock),true);
    seed_added:=seed_added+1;
  end if;

  update server1.player_seed_state pss
  set plants=v_plants,
      grow_seeds=ss.grow_seeds,
      revision=pss.revision+1,
      updated_at=now()
  where pss.user_id=u
  returning pss.* into ss;

  insert into server1.player_seed_events(
    user_id,event_id,source,grow_added,grow_removed,time_delta,plants_added,plants_removed,
    source_ref,decision,revision_after,details
  ) values(
    u,'seed_harvest_'||harvest_id::text,'harvest',seed_added,0,0,0,harvested_n,
    'grow_harvest:'||harvest_id::text,'accepted',ss.revision,
    jsonb_build_object('harvested',removed_rows,'extra_seed',v_extra_seed,'rare_seed',v_rare_seed)
  );

  fr_before:=ist.fragments;
  update server1.player_item_state
  set fragments=fragments+total_frag,revision=revision+1,updated_at=now()
  where user_id=u
  returning * into ist;

  if total_frag>0 then
    insert into server1.player_item_events(
      user_id,event_id,source,action,added_count,removed_count,changed_count,
      fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
    ) values(
      u,'item_grow_frag_'||harvest_id::text,'grow','server_grow_fragments',
      0,0,0,fr_before,ist.fragments,0,
      'grow_harvest:'||harvest_id::text||':fragments','accepted',ist.revision
    );
  end if;

  perform server1.v6358_server_award_gold(
    u,'gold_grow_harvest_'||harvest_id::text,'grow',total_gold,'grow_harvest:'||harvest_id::text
  );
  perform server1.v6358_server_award_xp(
    u,'xp_grow_harvest_'||harvest_id::text,'grow',total_xp,'grow_harvest:'||harvest_id::text
  );

  update server1.player_grow_state
  set mastery_xp=mastery_xp+mastery_gain,
      harvested=harvested+harvested_n,
      perfect=perfect+perfect_add,
      splus=splus+splus_add,
      mutation_count=mutation_count+mutation_add,
      prismatic=prismatic+prism_add,
      week_key=wk,
      week_harvested=week_harvested+harvested_n,
      week_perfect=week_perfect+perfect_add,
      week_mutations=week_mutations+mutation_add,
      week_claimed=case when week_key=wk then week_claimed else false end,
      bag=v_bag,
      revision=revision+1,
      updated_at=now()
  where user_id=u
  returning * into g;

  order_state:=server1.v6358_progress_grow_orders_for(u,removed_rows);

  update server1.player_grow_harvests
  set plants=rows,gold_awarded=total_gold,xp_awarded=total_xp,
      fragments_awarded=total_frag,extra_seed=v_extra_seed,rare_seed=v_rare_seed
  where id=harvest_id;

  perform server1.v6358_refresh_combat_power_for(u);
  cp:=server1.v6358_combat_snapshot_for(u);
  select * into tp from server1.player_progress_trusted where user_id=u;

  return jsonb_build_object(
    'ok',true,'harvest_id',harvest_id,'rows',rows,'pets',pets,
    'gold_awarded',total_gold,'xp_awarded',total_xp,'fragments_awarded',total_frag,
    'extra_seed',v_extra_seed,'rare_seed',v_rare_seed,
    'gold',tp.gold,'harz',tp.harz_taler,'level',tp.level,'xp',tp.xp,
    'fragments',ist.fragments,'grow_seeds',ss.grow_seeds,'time_seeds',ss.time_seeds,'plants',ss.plants,
    'grow_state',jsonb_build_object(
      'room_level',g.room_level,'lamp_level',g.lamp_level,'pots_level',g.pots_level,
      'mastery_xp',g.mastery_xp,'harvested',g.harvested,'perfect',g.perfect,
      'splus',g.splus,'mutation_count',g.mutation_count,'prismatic',g.prismatic,
      'week_key',g.week_key,'week_harvested',g.week_harvested,
      'week_perfect',g.week_perfect,'week_mutations',g.week_mutations,
      'week_claimed',g.week_claimed,'bag',g.bag,'active',g.active,'revision',g.revision
    ),
    'orders',order_state,
    'weather',server1.v6358_get_weather(),
    'combat',cp
  );
end;
$function$;

CREATE OR REPLACE FUNCTION server1.v6358_harvest_grow()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $v8399_compat$
 SELECT server1.v6358_harvest_grow(NULL::text);
$v8399_compat$;
REVOKE ALL ON FUNCTION server1.v6358_harvest_grow(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION server1.v6358_harvest_grow(text) TO authenticated, service_role;
COMMIT;
