-- Grow Legends V8.291.
-- Direct edits to Beta and Server1 canonical quest owners make both Harz probabilities
-- editable through server-authorized v8290_admin_console. Current values stay 0.50 and 0.065.
-- Quest total bonus per 100 Dampf still capped at 1.
-- This file captures the deployed function definitions (not an additive monkey-patch).
-- Functions are updated in-place. No item, inventory, currency, balance, or character-class writes.

-- public.v6359_claim_quest_old_v7088
CREATE OR REPLACE FUNCTION public.v6359_claim_quest_old_v7088()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();q public.player_quest_state%rowtype;run public.player_quest_runs%rowtype;t public.player_progress_trusted%rowtype;
 offer jsonb;fight jsonb;rid bigint;xp int;gold bigint;harz int:=0;daily_harz int:=0;energy_drop int:=0;bonus_drop int:=0;elite_harz int:=0;
 qe_before int;qe_after int;missing int;remaining int;chancev numeric;
 xp_event boolean:=false;gold_event boolean:=false;guild_xp int:=0;guild_gold int:=0;pf jsonb:='{}'::jsonb;xp_mul numeric:=1;gold_mul numeric:=1;
 xp_res jsonb;gold_res jsonb;harz_res jsonb;v_item jsonb:=null;v_pet jsonb:=null;v_seedr jsonb:=null;v_unlockr jsonb:=null;
 item_q text;ref text;today date:=(now() at time zone 'Europe/Berlin')::date;
begin
 if u is null then raise exception 'AUTH_REQUIRED';end if;
 q:=public.v6359_ensure_quest_day_for(u);
 select * into q from public.player_quest_state where user_id=u for update;
 if q.active is null then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_QUEST');end if;
 rid:=coalesce((q.active->>'serverRunId')::bigint,0);
 select * into run from public.player_quest_runs where id=rid and user_id=u for update;
 if not found then raise exception 'QUEST_RUN_MISSING';end if;
 if run.resolved_at is not null and coalesce(run.won,false) then
   return jsonb_build_object('ok',true,'duplicate',true,'won',true,'run_id',run.id);
 end if;
 if run.ready_at>now() then
   return jsonb_build_object('ok',false,'reason','QUEST_NOT_READY','ready_at',run.ready_at,'seconds_left',ceil(extract(epoch from(run.ready_at-now())))::int);
 end if;

 offer:=run.offer;
 fight:=public.v6359_simulate_fight(
   u,
   greatest(20,coalesce((offer->>'v6359EnemyHp')::int,100)),
   greatest(5,coalesce((offer->>'v6359EnemyAttack')::int,10)),
   1,30,null,null
 );
 update public.player_quest_runs set attempts=attempts+1,replay=coalesce(fight->'replay','[]'::jsonb) where id=rid returning * into run;
 if not coalesce((fight->>'won')::boolean,false) then
   q.active:=jsonb_set(q.active,'{ends}',to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint),true);
   q.active:=jsonb_set(q.active,'{v6359LastFightWon}','false'::jsonb,true);
   update public.player_quest_state set active=q.active,revision=revision+1,updated_at=now() where user_id=u returning * into q;
   return jsonb_build_object('ok',true,'won',false,'run_id',rid,'fight',fight,'active',q.active,'energy',q.energy);
 end if;

 select * into t from public.player_progress_trusted where user_id=u for update;
 xp:=greatest(1,coalesce((offer->>'xp')::int,1));
 gold:=greatest(0,coalesce((offer->>'gold')::bigint,0));

 select exists(select 1 from public.game_events ge where ge.name='Erfahrungs-Event' and coalesce(ge.is_active,false) and ge.starts_at<=now() and ge.ends_at>=now()) into xp_event;
 select exists(select 1 from public.game_events ge where ge.name='Gold-Event' and coalesce(ge.is_active,false) and ge.starts_at<=now() and ge.ends_at>=now()) into gold_event;
 select greatest(0,least(8,coalesce(g.xp_level,0))),greatest(0,least(8,coalesce(g.gold_level,0)))
 into guild_xp,guild_gold from public.guild_members gm join public.guilds g on g.id=gm.guild_id where gm.user_id=u limit 1;
 guild_xp:=coalesce(guild_xp,0);guild_gold:=coalesce(guild_gold,0);
 select pps.found into pf from public.player_pet_state pps where pps.user_id=u and pps.guard_enabled;pf:=coalesce(pf,'{}'::jsonb);
 if public.v6358_pet_complete(pf,'rauch_fuchs') then xp_mul:=xp_mul+.03;end if;
 if public.v6358_pet_complete(pf,'kief_maulwurf') then xp_mul:=xp_mul+.02;end if;
 if public.v6358_pet_complete(pf,'haze_hase') then xp_mul:=xp_mul+.02;end if;
 if public.v6358_pet_complete(pf,'bud_hase') then gold_mul:=gold_mul+.03;end if;
 if public.v6358_pet_complete(pf,'kush_waschbaer') then gold_mul:=gold_mul+.02;end if;
 if public.v6358_pet_complete(pf,'og_katze') then gold_mul:=gold_mul+.02;end if;
 xp:=greatest(1,round(xp*(case when xp_event then 2 else 1 end)*(1+guild_xp*.02)*xp_mul)::int);
 gold:=greatest(0,round(gold*(case when gold_event then 2 else 1 end)*(1+guild_gold*.02)*gold_mul)::bigint);

 ref:='quest_run:'||rid::text;
 xp_res:=public.v6359_server_award_xp(u,'xp_quest_'||rid::text,'quest',xp,ref);
 gold_res:=public.v6358_server_award_gold(u,'gold_quest_'||rid::text,'quest',gold,ref);

 if not q.first_quest_claimed then daily_harz:=2;q.first_quest_claimed:=true;end if;
 
 qe_before:=q.quest_energy;
 qe_after:=least(100,qe_before+greatest(0,run.energy_cost));
 q.quest_energy:=qe_after;
 -- V8.289: Max 1 Harz per 100 Quest-Dampf, 0 or 1 (50:50), never 2.
 -- Old partial guarantees are not paid again; do not claw back past credits.
 q.energy_harz:=least(1,greatest(0,q.energy_harz));
 if qe_before<100 and qe_after>=100 and q.energy_harz=0 then
   if random()<coalesce((select (value #>> '{}')::numeric from recovery_private.v8289_admin_settings where key='quest_energy_harz_chance'),.50) then
     energy_drop:=1;
     q.energy_harz:=1;
   end if;
 end if;
 if random()<coalesce((select (value #>> '{}')::numeric from recovery_private.v8289_admin_settings where key='quest_bonus_harz_chance'),.065) then bonus_drop:=case when random()<.12 then 2 else 1 end;end if;
 if run.elite then elite_harz:=1+floor(random()*3)::int;end if;
 harz:=daily_harz+energy_drop+bonus_drop+elite_harz;
 if harz>0 then harz_res:=public.v6358_server_award_harz(u,'harz_quest_'||rid::text,'quest',harz,ref);end if;

 if run.elite then
   item_q:=case when random()<.35 then 'purple' else 'blue' end;
   v_item:=public.v6359_make_item_for(u,'quest_elite',ref||':item',t.level,item_q,false);
 elsif random()<.20 then
   item_q:=case when random()<.05 then 'orange' when random()<.20 then 'purple' when random()<.45 then 'blue' else 'green' end;
   v_item:=public.v6359_make_item_for(u,'quest',ref||':item',t.level,item_q,false);
 end if;

 v_pet:=public.v6358_roll_pet_for(u,case when run.elite then 'quest_elite' else 'quest' end,ref,case when run.elite then .12 else .04 end,false);
 v_seedr:=public.v6356_claim_gameplay_seed_reward('quest',false);
 begin v_unlockr:=public.v6358_claim_dungeon_unlock_from_quest();exception when others then v_unlockr:=jsonb_build_object('ok',false,'reason','UNLOCK_CHECK_FAILED');end;

 update public.player_quest_runs
 set resolved_at=now(),won=true,xp_awarded=xp,gold_awarded=gold,harz_awarded=harz,item=v_item,pet=v_pet,seed_reward=v_seedr,dungeon_unlock=v_unlockr,replay=coalesce(fight->'replay','[]'::jsonb)
 where id=rid;

 q.active:=null;q.offers:=public.v6359_generate_quest_offers(u,false);q.elite_offer:=public.v6359_roll_elite_offer_for(u);
 update public.player_quest_state
 set active=null,offers=q.offers,elite_offer=q.elite_offer,first_quest_claimed=q.first_quest_claimed,quest_energy=q.quest_energy,energy_harz=q.energy_harz,
     revision=revision+1,updated_at=now()
 where user_id=u returning * into q;

 select * into t from public.player_progress_trusted where user_id=u;
 return jsonb_build_object(
   'ok',true,'won',true,'run_id',rid,'fight',fight,'xp_awarded',xp,'gold_awarded',gold,'harz_awarded',harz,
   'harz_breakdown',jsonb_build_object('daily',daily_harz,'energy',energy_drop,'bonus',bonus_drop,'elite',elite_harz),
   'item',v_item,'pet',v_pet,'seed_reward',v_seedr,'dungeon_unlock',v_unlockr,
   'energy',q.energy,'offers',q.offers,'eliteOffer',q.elite_offer,'active',null,'daily',jsonb_build_object('firstQuest',q.first_quest_claimed,'questEnergy',q.quest_energy,'energyHarz',q.energy_harz),
   'level',t.level,'level_xp',t.xp,'gold_balance',t.gold,'harz_balance',t.harz_taler
 );
end;
$function$;

-- recovery_private.v7044_claim_quest_core
CREATE OR REPLACE FUNCTION recovery_private.v7044_claim_quest_core(p_uid uuid, p_run_id bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
#variable_conflict use_variable
declare
  q public.player_quest_state%rowtype;
  run public.player_quest_runs%rowtype;
  t public.player_progress_trusted%rowtype;
  offer jsonb;
  rid bigint;
  elite boolean:=false;
  ref text;
  xp_event_id text;
  gold_event_id text;
  harz_event_id text;

  xp_event boolean:=false;
  gold_event boolean:=false;
  guild_xp integer:=0;
  pet_found jsonb:='{}'::jsonb;
  pet_pct numeric:=0;

  base_xp integer:=0;
  xp_stage integer:=0;
  xp_award integer:=0;
  base_gold bigint:=0;
  gold_award bigint:=0;

  level_before integer;
  xp_before bigint;
  level_after integer;
  xp_after bigint;
  need bigint;
  gold_before bigint;
  gold_after bigint;
  harz_before bigint;
  harz_after bigint;

  daily_harz integer:=0;
  energy_drop integer:=0;
  bonus_drop integer:=0;
  elite_harz integer:=0;
  harz_award integer:=0;
  qe_after integer;
  remaining integer;
  missing integer;
  chancev numeric;

  luck numeric:=0;
  item_chance numeric:=0;
  item_drop boolean:=false;
  epic_replacement boolean:=false;
  own_class text;
  item jsonb:=null;
  mats jsonb:='[]'::jsonb;
  mat jsonb:=null;
  fragments_award integer:=0;
  fragments_balance bigint:=0;

  pet jsonb:=null;
  seedr jsonb:=null;
  unlockr jsonb:=null;
  nextq jsonb:=null;
  bundle jsonb;
  fight jsonb:=jsonb_build_object('won',true,'presentationOnly',true,'replay','[]'::jsonb);
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  select * into q
  from public.player_quest_state
  where user_id=p_uid and guard_enabled
  for update;
  if not found then raise exception 'QUEST_GUARD_NOT_ENABLED'; end if;
  if q.active is null then
    return jsonb_build_object('ok',false,'reason','NO_ACTIVE_QUEST');
  end if;

  rid:=coalesce(
    p_run_id,
    nullif(q.active->>'serverRunId','')::bigint,
    0
  );
  if rid=0 then raise exception 'QUEST_RUN_MISSING'; end if;

  select * into run
  from public.player_quest_runs
  where id=rid and user_id=p_uid
  for update;
  if not found then raise exception 'QUEST_RUN_MISSING'; end if;

  if run.resolved_at is not null and coalesce(run.won,false) then
    return coalesce(
      run.reward_bundle,
      jsonb_build_object(
        'ok',true,'duplicate',true,'won',true,'run_id',run.id,
        'xp_awarded',run.xp_awarded,'gold_awarded',run.gold_awarded,
        'harz_awarded',run.harz_awarded,'item',run.item,'materials',run.materials,
        'fragments_awarded',run.fragments_awarded,'pet',run.pet,
        'seed_reward',run.seed_reward,'dungeon_unlock',run.dungeon_unlock
      )
    ) || jsonb_build_object('duplicate',true);
  end if;

  if run.ready_at>now() then
    return jsonb_build_object(
      'ok',false,'reason','QUEST_NOT_READY','ready_at',run.ready_at,
      'seconds_left',ceil(extract(epoch from(run.ready_at-now())))::integer
    );
  end if;

  offer:=coalesce(run.offer,'{}'::jsonb);
  elite:=coalesce(run.elite,false)
         or coalesce((offer->>'v310Elite')::boolean,false)
         or lower(coalesce(offer->>'v309Role',''))='elite';
  ref:='quest_run:'||rid::text;
  xp_event_id:='xp_quest_v7044_'||rid::text;
  gold_event_id:='gold_quest_v7044_'||rid::text;
  harz_event_id:='harz_quest_v7044_'||rid::text;

  select * into t
  from public.player_progress_trusted
  where user_id=p_uid
  for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;

  level_before:=t.level;
  xp_before:=t.xp;
  gold_before:=t.gold;
  harz_before:=t.harz_taler;

  base_xp:=greatest(1,coalesce((offer->>'v094BaseXp')::integer,(offer->>'xp')::integer,1));
  select (
    public.v7102_auto_weekend_event_active('xp',now())
    or exists(
      select 1 from public.game_events ge
      where coalesce(ge.is_active,false)
        and ge.name='Erfahrungs-Event'
        and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into xp_event;

  /* Exact client order: event -> Pet bonus -> guild XP bonus, with a round at each bonus layer. */
  xp_stage:=greatest(1,round(base_xp*(case when xp_event then 2 else 1 end))::integer);

  select coalesce(pps.found,'{}'::jsonb) into pet_found
  from public.player_pet_state pps
  where pps.user_id=p_uid and pps.guard_enabled;
  pet_found:=coalesce(pet_found,'{}'::jsonb);

  if public.v6358_pet_complete(pet_found,'rauch_fuchs') then pet_pct:=pet_pct+3; end if;
  if public.v6358_pet_complete(pet_found,'kief_maulwurf') then pet_pct:=pet_pct+2; end if;
  if public.v6358_pet_complete(pet_found,'haze_hase') then pet_pct:=pet_pct+2; end if;
  if pet_pct>0 then xp_stage:=greatest(1,round(xp_stage*(1+pet_pct/100.0))::integer); end if;

  select greatest(0,least(8,coalesce(g.xp_level,0)))
    into guild_xp
  from public.guild_members gm
  join public.guilds g on g.id=gm.guild_id
  where gm.user_id=p_uid
  limit 1;
  guild_xp:=coalesce(guild_xp,0);
  xp_award:=greatest(1,round(xp_stage*(1+(guild_xp*2)/100.0))::integer);

  level_after:=level_before;
  xp_after:=xp_before+xp_award;
  if level_after>=300 then
    level_after:=300;xp_after:=0;xp_award:=0;
  else
    while level_after<300 loop
      need:=public.v6348_xp_need(level_after);
      exit when need<=0 or xp_after<need;
      xp_after:=xp_after-need;
      level_after:=level_after+1;
    end loop;
    if level_after>=300 then level_after:=300;xp_after:=0;end if;
  end if;

  base_gold:=greatest(0,coalesce((offer->>'v274BaseGold')::bigint,(offer->>'gold')::bigint,0));
  select (
    public.v7102_auto_weekend_event_active('gold',now())
    or exists(
      select 1 from public.game_events ge
      where coalesce(ge.is_active,false)
        and ge.name='Gold-Event'
        and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into gold_event;
  /* Current client Quest Gold is base or exactly x2 during Gold-Event. No guild/pet Gold layer. */
  gold_award:=base_gold*(case when gold_event then 2 else 1 end);
  gold_after:=gold_before+gold_award;

  if not q.first_quest_claimed then
    daily_harz:=2;
    q.first_quest_claimed:=true;
  end if;

  
  -- V8.289: Dampf-Bonus only at completion of 100/100; 0 or 1, 50% chance.
  qe_after:=least(100,q.quest_energy+greatest(0,run.energy_cost));
  if q.quest_energy<100 and qe_after>=100 and q.energy_harz=0 then
    if random()<coalesce((select (value #>> '{}')::numeric from recovery_private.v8289_admin_settings where key='quest_energy_harz_chance'),.50) then
      energy_drop:=1;
      q.energy_harz:=1;
    end if;
  end if;
  q.quest_energy:=qe_after;
  q.energy_harz:=least(1,greatest(0,q.energy_harz));
  if random()<coalesce((select (value #>> '{}')::numeric from recovery_private.v8289_admin_settings where key='quest_bonus_harz_chance'),.065) then bonus_drop:=case when random()<.12 then 2 else 1 end; end if;
  if elite then elite_harz:=1+floor(random()*3)::integer; end if;
  harz_award:=daily_harz+energy_drop+bonus_drop+elite_harz;
  harz_after:=harz_before+harz_award;

  update public.player_progress_trusted
  set level=level_after,
      xp=xp_after,
      gold=gold_after,
      harz_taler=harz_after,
      source_version='v7044-quest-atomic',
      updated_at=now()
  where user_id=p_uid;

  update public.profiles
  set level=level_after,updated_at=now()
  where id=p_uid;

  insert into public.player_xp_events(
    user_id,event_id,source,requested_xp,awarded_xp,
    level_before,xp_before,level_after,xp_after,
    source_ref,decision,verified
  ) values(
    p_uid,xp_event_id,'quest',xp_award,xp_award,
    level_before,xp_before,level_after,xp_after,
    ref,'verified_server_quest',true
  );

  insert into public.player_gold_events(
    user_id,event_id,source,requested_delta,applied_delta,
    balance_before,balance_after,source_ref,decision,verified
  ) values(
    p_uid,gold_event_id,'quest',gold_award,gold_award,
    gold_before,gold_after,ref,'verified_server_quest',true
  );

  if harz_award>0 then
    insert into public.player_harz_events(
      user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified
    ) values(
      p_uid,harz_event_id,'quest',harz_award,harz_award,
      harz_before,harz_after,ref,'verified_server_quest',true
    );
  end if;

  /* Loot is rolled only after XP, matching the client: a level-up affects the new item's level. */
  if elite then
    item:=recovery_private.v7043_generate_quest_item(
      p_uid,ref||':item',true,null,null,null
    );
    item:=recovery_private.v7044_append_quest_item(p_uid,item,ref||':item');
  else
    luck:=public.v7043_total_luck_for(p_uid);
    /* V6.349 Golden Master: normal Quest item roll is a flat 20 %.
       Luck never changes this roll. */
    item_chance:=.20;
    if random()<item_chance then
      item_drop:=true;
      /* Historical 1.5% "set" roll is forge-only in the current client.
         Effective result is an EPIC NON-SET item for the current class. */
      epic_replacement:=random()<.015;
      if epic_replacement then
        select lower(coalesce(player_class,'grower')) into own_class
        from public.player_build_state where user_id=p_uid;
        if own_class not in ('grower','bruiser','scout','frost','summoner') then own_class:='grower'; end if;
        item:=recovery_private.v7043_generate_quest_item(
          p_uid,ref||':item',false,'purple',own_class,null
        );
        item:=item||jsonb_build_object('v7044QuestEpicReplacement',true);
      else
        item:=recovery_private.v7043_generate_quest_item(
          p_uid,ref||':item',false,null,null,null
        );
      end if;
      item:=recovery_private.v7044_append_quest_item(p_uid,item,ref||':item');
    end if;
  end if;

  if random()<.05 then
    mat:=public.v7043_make_quest_material_for(p_uid,ref,'gem');
    mats:=mats||jsonb_build_array(mat);
  end if;
  if random()<.05 then
    mat:=public.v7043_make_quest_material_for(p_uid,ref,'scroll');
    mats:=mats||jsonb_build_array(mat);
  end if;

  if random()<(case when elite then .10 else .04 end) then
    fragments_award:=case when elite
      then 5+floor(random()*5)::integer
      else 3+floor(random()*4)::integer
    end;
  end if;

  if fragments_award>0 then
    declare
      fb bigint;
      fa bigint;
      rev bigint;
    begin
      select fragments into fb
      from public.player_item_state
      where user_id=p_uid and guard_enabled
      for update;
      if fb is null then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;

      update public.player_item_state
      set fragments=fragments+fragments_award,
          revision=revision+1,
          updated_at=now()
      where user_id=p_uid
      returning fragments,revision into fa,rev;

      insert into public.player_item_events(
        user_id,event_id,source,action,added_count,removed_count,changed_count,
        fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
      ) values(
        p_uid,'frag_'||replace(gen_random_uuid()::text,'-',''),
        'quest','server_quest_fragments',0,0,0,
        fb,fa,0,ref||':fragments','accepted',rev
      );
    end;
  end if;

  select fragments into fragments_balance
  from public.player_item_state where user_id=p_uid;

  pet:=recovery_private.v7044_roll_quest_pet(p_uid,ref||':pet',elite);
  seedr:=recovery_private.v7044_roll_quest_seed(p_uid,ref||':seed',elite);
  unlockr:=recovery_private.v7044_dungeon_unlock_for(p_uid,xp_event_id);
  nextq:=recovery_private.v7044_next_quest_batch(p_uid,level_after);

  q.active:=null;
  q.offers:=coalesce(nextq->'offers','[]'::jsonb);
  q.elite_offer:=nextq->'eliteOffer';

  update public.player_quest_state
  set active=null,
      offers=q.offers,
      elite_offer=case when q.elite_offer='null'::jsonb then null else q.elite_offer end,
      first_quest_claimed=q.first_quest_claimed,
      quest_energy=q.quest_energy,
      energy_harz=q.energy_harz,
      pending_receipt_run_id=rid,
      pending_receipt_at=now(),
      revision=revision+1,
      updated_at=now()
  where user_id=p_uid
  returning * into q;

  bundle:=jsonb_build_object(
    'ok',true,'duplicate',false,'won',true,'run_id',rid,'fight',fight,
    'xp_awarded',xp_award,'xp_base',base_xp,'xp_event_x2',xp_event,
    'xp_pet_pct',pet_pct,'xp_guild_level',guild_xp,
    'gold_awarded',gold_award,'gold_base',base_gold,'gold_event_x2',gold_event,
    'harz_awarded',harz_award,
    'harz_breakdown',jsonb_build_object(
      'daily',daily_harz,'energy',energy_drop,'bonus',bonus_drop,'elite',elite_harz
    ),
    'item',item,'item_drop',item_drop or elite,
    'item_chance',case when elite then 1 else item_chance end,
    'epic_nonset_replacement',epic_replacement,
    'materials',mats,
    'fragments_awarded',fragments_award,
    'fragments_balance',fragments_balance,
    'pet',pet,'seed_reward',seedr,'dungeon_unlock',unlockr,
    'energy',q.energy,'offers',q.offers,'eliteOffer',q.elite_offer,'active',null,
    'daily',jsonb_build_object(
      'firstQuest',q.first_quest_claimed,
      'questEnergy',q.quest_energy,
      'energyHarz',q.energy_harz
    ),
    'level',level_after,'level_xp',xp_after,
    'gold_balance',gold_after,'harz_balance',harz_after
  );

  update public.player_quest_runs
  set resolved_at=now(),
      won=true,
      replay='[]'::jsonb,
      xp_awarded=xp_award,
      gold_awarded=gold_award,
      harz_awarded=harz_award,
      item=item,
      materials=mats,
      fragments_awarded=fragments_award,
      harz_breakdown=bundle->'harz_breakdown',
      pet=pet,
      seed_reward=seedr,
      dungeon_unlock=unlockr,
      reward_bundle=bundle
  where id=rid;

  return bundle;
end;
$function$;

-- server1.v6359_claim_quest_old_v7088
CREATE OR REPLACE FUNCTION server1.v6359_claim_quest_old_v7088()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid();q server1.player_quest_state%rowtype;run server1.player_quest_runs%rowtype;t server1.player_progress_trusted%rowtype;
 offer jsonb;fight jsonb;rid bigint;xp int;gold bigint;harz int:=0;daily_harz int:=0;energy_drop int:=0;bonus_drop int:=0;elite_harz int:=0;
 qe_before int;qe_after int;missing int;remaining int;chancev numeric;
 xp_event boolean:=false;gold_event boolean:=false;guild_xp int:=0;guild_gold int:=0;pf jsonb:='{}'::jsonb;xp_mul numeric:=1;gold_mul numeric:=1;
 xp_res jsonb;gold_res jsonb;harz_res jsonb;v_item jsonb:=null;v_pet jsonb:=null;v_seedr jsonb:=null;v_unlockr jsonb:=null;
 item_q text;ref text;today date:=(now() at time zone 'Europe/Berlin')::date;
begin
 if u is null then raise exception 'AUTH_REQUIRED';end if;
 q:=server1.v6359_ensure_quest_day_for(u);
 select * into q from server1.player_quest_state where user_id=u for update;
 if q.active is null then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_QUEST');end if;
 rid:=coalesce((q.active->>'serverRunId')::bigint,0);
 select * into run from server1.player_quest_runs where id=rid and user_id=u for update;
 if not found then raise exception 'QUEST_RUN_MISSING';end if;
 if run.resolved_at is not null and coalesce(run.won,false) then
   return jsonb_build_object('ok',true,'duplicate',true,'won',true,'run_id',run.id);
 end if;
 if run.ready_at>now() then
   return jsonb_build_object('ok',false,'reason','QUEST_NOT_READY','ready_at',run.ready_at,'seconds_left',ceil(extract(epoch from(run.ready_at-now())))::int);
 end if;

 offer:=run.offer;
 fight:=server1.v6359_simulate_fight(
   u,
   greatest(20,coalesce((offer->>'v6359EnemyHp')::int,100)),
   greatest(5,coalesce((offer->>'v6359EnemyAttack')::int,10)),
   1,30,null,null
 );
 update server1.player_quest_runs set attempts=attempts+1,replay=coalesce(fight->'replay','[]'::jsonb) where id=rid returning * into run;
 if not coalesce((fight->>'won')::boolean,false) then
   q.active:=jsonb_set(q.active,'{ends}',to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint),true);
   q.active:=jsonb_set(q.active,'{v6359LastFightWon}','false'::jsonb,true);
   update server1.player_quest_state set active=q.active,revision=revision+1,updated_at=now() where user_id=u returning * into q;
   return jsonb_build_object('ok',true,'won',false,'run_id',rid,'fight',fight,'active',q.active,'energy',q.energy);
 end if;

 select * into t from server1.player_progress_trusted where user_id=u for update;
 xp:=greatest(1,coalesce((offer->>'xp')::int,1));
 gold:=greatest(0,coalesce((offer->>'gold')::bigint,0));

 select exists(select 1 from server1.game_events ge where ge.name='Erfahrungs-Event' and coalesce(ge.is_active,false) and ge.starts_at<=now() and ge.ends_at>=now()) into xp_event;
 select exists(select 1 from server1.game_events ge where ge.name='Gold-Event' and coalesce(ge.is_active,false) and ge.starts_at<=now() and ge.ends_at>=now()) into gold_event;
 select greatest(0,least(8,coalesce(g.xp_level,0))),greatest(0,least(8,coalesce(g.gold_level,0)))
 into guild_xp,guild_gold from server1.guild_members gm join server1.guilds g on g.id=gm.guild_id where gm.user_id=u limit 1;
 guild_xp:=coalesce(guild_xp,0);guild_gold:=coalesce(guild_gold,0);
 select pps.found into pf from server1.player_pet_state pps where pps.user_id=u and pps.guard_enabled;pf:=coalesce(pf,'{}'::jsonb);
 if server1.v6358_pet_complete(pf,'rauch_fuchs') then xp_mul:=xp_mul+.03;end if;
 if server1.v6358_pet_complete(pf,'kief_maulwurf') then xp_mul:=xp_mul+.02;end if;
 if server1.v6358_pet_complete(pf,'haze_hase') then xp_mul:=xp_mul+.02;end if;
 if server1.v6358_pet_complete(pf,'bud_hase') then gold_mul:=gold_mul+.03;end if;
 if server1.v6358_pet_complete(pf,'kush_waschbaer') then gold_mul:=gold_mul+.02;end if;
 if server1.v6358_pet_complete(pf,'og_katze') then gold_mul:=gold_mul+.02;end if;
 xp:=greatest(1,round(xp*(case when xp_event then 2 else 1 end)*(1+guild_xp*.02)*xp_mul)::int);
 gold:=greatest(0,round(gold*(case when gold_event then 2 else 1 end)*(1+guild_gold*.02)*gold_mul)::bigint);

 ref:='quest_run:'||rid::text;
 xp_res:=server1.v6359_server_award_xp(u,'xp_quest_'||rid::text,'quest',xp,ref);
 gold_res:=server1.v6358_server_award_gold(u,'gold_quest_'||rid::text,'quest',gold,ref);

 if not q.first_quest_claimed then daily_harz:=2;q.first_quest_claimed:=true;end if;
 
 qe_before:=q.quest_energy;
 qe_after:=least(100,qe_before+greatest(0,run.energy_cost));
 q.quest_energy:=qe_after;
 -- V8.289: Max 1 Harz per 100 Quest-Dampf, 0 or 1 (50:50), never 2.
 -- Old partial guarantees are not paid again; do not claw back past credits.
 q.energy_harz:=least(1,greatest(0,q.energy_harz));
 if qe_before<100 and qe_after>=100 and q.energy_harz=0 then
   if random()<coalesce((select (value #>> '{}')::numeric from server1_private.v8289_admin_settings where key='quest_energy_harz_chance'),.50) then
     energy_drop:=1;
     q.energy_harz:=1;
   end if;
 end if;
 if random()<coalesce((select (value #>> '{}')::numeric from server1_private.v8289_admin_settings where key='quest_bonus_harz_chance'),.065) then bonus_drop:=case when random()<.12 then 2 else 1 end;end if;
 if run.elite then elite_harz:=1+floor(random()*3)::int;end if;
 harz:=daily_harz+energy_drop+bonus_drop+elite_harz;
 if harz>0 then harz_res:=server1.v6358_server_award_harz(u,'harz_quest_'||rid::text,'quest',harz,ref);end if;

 if run.elite then
   item_q:=case when random()<.35 then 'purple' else 'blue' end;
   v_item:=server1.v6359_make_item_for(u,'quest_elite',ref||':item',t.level,item_q,false);
 elsif random()<.20 then
   item_q:=case when random()<.05 then 'orange' when random()<.20 then 'purple' when random()<.45 then 'blue' else 'green' end;
   v_item:=server1.v6359_make_item_for(u,'quest',ref||':item',t.level,item_q,false);
 end if;

 v_pet:=server1.v6358_roll_pet_for(u,case when run.elite then 'quest_elite' else 'quest' end,ref,case when run.elite then .12 else .04 end,false);
 v_seedr:=server1.v6356_claim_gameplay_seed_reward('quest',false);
 begin v_unlockr:=server1.v6358_claim_dungeon_unlock_from_quest();exception when others then v_unlockr:=jsonb_build_object('ok',false,'reason','UNLOCK_CHECK_FAILED');end;

 update server1.player_quest_runs
 set resolved_at=now(),won=true,xp_awarded=xp,gold_awarded=gold,harz_awarded=harz,item=v_item,pet=v_pet,seed_reward=v_seedr,dungeon_unlock=v_unlockr,replay=coalesce(fight->'replay','[]'::jsonb)
 where id=rid;

 q.active:=null;q.offers:=server1.v6359_generate_quest_offers(u,false);q.elite_offer:=server1.v6359_roll_elite_offer_for(u);
 update server1.player_quest_state
 set active=null,offers=q.offers,elite_offer=q.elite_offer,first_quest_claimed=q.first_quest_claimed,quest_energy=q.quest_energy,energy_harz=q.energy_harz,
     revision=revision+1,updated_at=now()
 where user_id=u returning * into q;

 select * into t from server1.player_progress_trusted where user_id=u;
 return jsonb_build_object(
   'ok',true,'won',true,'run_id',rid,'fight',fight,'xp_awarded',xp,'gold_awarded',gold,'harz_awarded',harz,
   'harz_breakdown',jsonb_build_object('daily',daily_harz,'energy',energy_drop,'bonus',bonus_drop,'elite',elite_harz),
   'item',v_item,'pet',v_pet,'seed_reward',v_seedr,'dungeon_unlock',v_unlockr,
   'energy',q.energy,'offers',q.offers,'eliteOffer',q.elite_offer,'active',null,'daily',jsonb_build_object('firstQuest',q.first_quest_claimed,'questEnergy',q.quest_energy,'energyHarz',q.energy_harz),
   'level',t.level,'level_xp',t.xp,'gold_balance',t.gold,'harz_balance',t.harz_taler
 );
end;
$function$;

-- server1_private.v7044_claim_quest_core
CREATE OR REPLACE FUNCTION server1_private.v7044_claim_quest_core(p_uid uuid, p_run_id bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'server1_private', 'pg_temp'
AS $function$
#variable_conflict use_variable
declare
  q server1.player_quest_state%rowtype;
  run server1.player_quest_runs%rowtype;
  t server1.player_progress_trusted%rowtype;
  offer jsonb;
  rid bigint;
  elite boolean:=false;
  ref text;
  xp_event_id text;
  gold_event_id text;
  harz_event_id text;

  xp_event boolean:=false;
  gold_event boolean:=false;
  guild_xp integer:=0;
  pet_found jsonb:='{}'::jsonb;
  pet_pct numeric:=0;

  base_xp integer:=0;
  xp_stage integer:=0;
  xp_award integer:=0;
  base_gold bigint:=0;
  gold_award bigint:=0;

  level_before integer;
  xp_before bigint;
  level_after integer;
  xp_after bigint;
  need bigint;
  gold_before bigint;
  gold_after bigint;
  harz_before bigint;
  harz_after bigint;

  daily_harz integer:=0;
  energy_drop integer:=0;
  bonus_drop integer:=0;
  elite_harz integer:=0;
  harz_award integer:=0;
  qe_after integer;
  remaining integer;
  missing integer;
  chancev numeric;

  luck numeric:=0;
  item_chance numeric:=0;
  item_drop boolean:=false;
  epic_replacement boolean:=false;
  own_class text;
  item jsonb:=null;
  mats jsonb:='[]'::jsonb;
  mat jsonb:=null;
  fragments_award integer:=0;
  fragments_balance bigint:=0;

  pet jsonb:=null;
  seedr jsonb:=null;
  unlockr jsonb:=null;
  nextq jsonb:=null;
  bundle jsonb;
  fight jsonb:=jsonb_build_object('won',true,'presentationOnly',true,'replay','[]'::jsonb);
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  select * into q
  from server1.player_quest_state
  where user_id=p_uid and guard_enabled
  for update;
  if not found then raise exception 'QUEST_GUARD_NOT_ENABLED'; end if;
  if q.active is null then
    return jsonb_build_object('ok',false,'reason','NO_ACTIVE_QUEST');
  end if;

  rid:=coalesce(
    p_run_id,
    nullif(q.active->>'serverRunId','')::bigint,
    0
  );
  if rid=0 then raise exception 'QUEST_RUN_MISSING'; end if;

  select * into run
  from server1.player_quest_runs
  where id=rid and user_id=p_uid
  for update;
  if not found then raise exception 'QUEST_RUN_MISSING'; end if;

  if run.resolved_at is not null and coalesce(run.won,false) then
    return coalesce(
      run.reward_bundle,
      jsonb_build_object(
        'ok',true,'duplicate',true,'won',true,'run_id',run.id,
        'xp_awarded',run.xp_awarded,'gold_awarded',run.gold_awarded,
        'harz_awarded',run.harz_awarded,'item',run.item,'materials',run.materials,
        'fragments_awarded',run.fragments_awarded,'pet',run.pet,
        'seed_reward',run.seed_reward,'dungeon_unlock',run.dungeon_unlock
      )
    ) || jsonb_build_object('duplicate',true);
  end if;

  if run.ready_at>now() then
    return jsonb_build_object(
      'ok',false,'reason','QUEST_NOT_READY','ready_at',run.ready_at,
      'seconds_left',ceil(extract(epoch from(run.ready_at-now())))::integer
    );
  end if;

  offer:=coalesce(run.offer,'{}'::jsonb);
  elite:=coalesce(run.elite,false)
         or coalesce((offer->>'v310Elite')::boolean,false)
         or lower(coalesce(offer->>'v309Role',''))='elite';
  ref:='quest_run:'||rid::text;
  xp_event_id:='xp_quest_v7044_'||rid::text;
  gold_event_id:='gold_quest_v7044_'||rid::text;
  harz_event_id:='harz_quest_v7044_'||rid::text;

  select * into t
  from server1.player_progress_trusted
  where user_id=p_uid
  for update;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;

  level_before:=t.level;
  xp_before:=t.xp;
  gold_before:=t.gold;
  harz_before:=t.harz_taler;

  base_xp:=greatest(1,coalesce((offer->>'v094BaseXp')::integer,(offer->>'xp')::integer,1));
  select (
    server1.v7102_auto_weekend_event_active('xp',now())
    or exists(
      select 1 from server1.game_events ge
      where coalesce(ge.is_active,false)
        and ge.name='Erfahrungs-Event'
        and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into xp_event;

  /* Exact client order: event -> Pet bonus -> guild XP bonus, with a round at each bonus layer. */
  xp_stage:=greatest(1,round(base_xp*(case when xp_event then 2 else 1 end))::integer);

  select coalesce(pps.found,'{}'::jsonb) into pet_found
  from server1.player_pet_state pps
  where pps.user_id=p_uid and pps.guard_enabled;
  pet_found:=coalesce(pet_found,'{}'::jsonb);

  if server1.v6358_pet_complete(pet_found,'rauch_fuchs') then pet_pct:=pet_pct+3; end if;
  if server1.v6358_pet_complete(pet_found,'kief_maulwurf') then pet_pct:=pet_pct+2; end if;
  if server1.v6358_pet_complete(pet_found,'haze_hase') then pet_pct:=pet_pct+2; end if;
  if pet_pct>0 then xp_stage:=greatest(1,round(xp_stage*(1+pet_pct/100.0))::integer); end if;

  select greatest(0,least(8,coalesce(g.xp_level,0)))
    into guild_xp
  from server1.guild_members gm
  join server1.guilds g on g.id=gm.guild_id
  where gm.user_id=p_uid
  limit 1;
  guild_xp:=coalesce(guild_xp,0);
  xp_award:=greatest(1,round(xp_stage*(1+(guild_xp*2)/100.0))::integer);

  level_after:=level_before;
  xp_after:=xp_before+xp_award;
  if level_after>=300 then
    level_after:=300;xp_after:=0;xp_award:=0;
  else
    while level_after<300 loop
      need:=server1.v6348_xp_need(level_after);
      exit when need<=0 or xp_after<need;
      xp_after:=xp_after-need;
      level_after:=level_after+1;
    end loop;
    if level_after>=300 then level_after:=300;xp_after:=0;end if;
  end if;

  base_gold:=greatest(0,coalesce((offer->>'v274BaseGold')::bigint,(offer->>'gold')::bigint,0));
  select (
    server1.v7102_auto_weekend_event_active('gold',now())
    or exists(
      select 1 from server1.game_events ge
      where coalesce(ge.is_active,false)
        and ge.name='Gold-Event'
        and ge.starts_at<=now() and ge.ends_at>=now()
    )
  ) into gold_event;
  /* Current client Quest Gold is base or exactly x2 during Gold-Event. No guild/pet Gold layer. */
  gold_award:=base_gold*(case when gold_event then 2 else 1 end);
  gold_after:=gold_before+gold_award;

  if not q.first_quest_claimed then
    daily_harz:=2;
    q.first_quest_claimed:=true;
  end if;

  
  -- V8.289: Dampf-Bonus only at completion of 100/100; 0 or 1, 50% chance.
  qe_after:=least(100,q.quest_energy+greatest(0,run.energy_cost));
  if q.quest_energy<100 and qe_after>=100 and q.energy_harz=0 then
    if random()<coalesce((select (value #>> '{}')::numeric from server1_private.v8289_admin_settings where key='quest_energy_harz_chance'),.50) then
      energy_drop:=1;
      q.energy_harz:=1;
    end if;
  end if;
  q.quest_energy:=qe_after;
  q.energy_harz:=least(1,greatest(0,q.energy_harz));
  if random()<coalesce((select (value #>> '{}')::numeric from server1_private.v8289_admin_settings where key='quest_bonus_harz_chance'),.065) then bonus_drop:=case when random()<.12 then 2 else 1 end; end if;
  if elite then elite_harz:=1+floor(random()*3)::integer; end if;
  harz_award:=daily_harz+energy_drop+bonus_drop+elite_harz;
  harz_after:=harz_before+harz_award;

  update server1.player_progress_trusted
  set level=level_after,
      xp=xp_after,
      gold=gold_after,
      harz_taler=harz_after,
      source_version='v7044-quest-atomic',
      updated_at=now()
  where user_id=p_uid;

  update server1.profiles
  set level=level_after,updated_at=now()
  where id=p_uid;

  insert into server1.player_xp_events(
    user_id,event_id,source,requested_xp,awarded_xp,
    level_before,xp_before,level_after,xp_after,
    source_ref,decision,verified
  ) values(
    p_uid,xp_event_id,'quest',xp_award,xp_award,
    level_before,xp_before,level_after,xp_after,
    ref,'verified_server_quest',true
  );

  insert into server1.player_gold_events(
    user_id,event_id,source,requested_delta,applied_delta,
    balance_before,balance_after,source_ref,decision,verified
  ) values(
    p_uid,gold_event_id,'quest',gold_award,gold_award,
    gold_before,gold_after,ref,'verified_server_quest',true
  );

  if harz_award>0 then
    insert into server1.player_harz_events(
      user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified
    ) values(
      p_uid,harz_event_id,'quest',harz_award,harz_award,
      harz_before,harz_after,ref,'verified_server_quest',true
    );
  end if;

  /* Loot is rolled only after XP, matching the client: a level-up affects the new item's level. */
  if elite then
    item:=server1_private.v7043_generate_quest_item(
      p_uid,ref||':item',true,null,null,null
    );
    item:=server1_private.v7044_append_quest_item(p_uid,item,ref||':item');
  else
    luck:=server1.v7043_total_luck_for(p_uid);
    /* V6.349 Golden Master: normal Quest item roll is a flat 20 %.
       Luck never changes this roll. */
    item_chance:=.20;
    if random()<item_chance then
      item_drop:=true;
      /* Historical 1.5% "set" roll is forge-only in the current client.
         Effective result is an EPIC NON-SET item for the current class. */
      epic_replacement:=random()<.015;
      if epic_replacement then
        select lower(coalesce(player_class,'grower')) into own_class
        from server1.player_build_state where user_id=p_uid;
        if own_class not in ('grower','bruiser','scout','frost','summoner') then own_class:='grower'; end if;
        item:=server1_private.v7043_generate_quest_item(
          p_uid,ref||':item',false,'purple',own_class,null
        );
        item:=item||jsonb_build_object('v7044QuestEpicReplacement',true);
      else
        item:=server1_private.v7043_generate_quest_item(
          p_uid,ref||':item',false,null,null,null
        );
      end if;
      item:=server1_private.v7044_append_quest_item(p_uid,item,ref||':item');
    end if;
  end if;

  if random()<.05 then
    mat:=server1.v7043_make_quest_material_for(p_uid,ref,'gem');
    mats:=mats||jsonb_build_array(mat);
  end if;
  if random()<.05 then
    mat:=server1.v7043_make_quest_material_for(p_uid,ref,'scroll');
    mats:=mats||jsonb_build_array(mat);
  end if;

  if random()<(case when elite then .10 else .04 end) then
    fragments_award:=case when elite
      then 5+floor(random()*5)::integer
      else 3+floor(random()*4)::integer
    end;
  end if;

  if fragments_award>0 then
    declare
      fb bigint;
      fa bigint;
      rev bigint;
    begin
      select fragments into fb
      from server1.player_item_state
      where user_id=p_uid and guard_enabled
      for update;
      if fb is null then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;

      update server1.player_item_state
      set fragments=fragments+fragments_award,
          revision=revision+1,
          updated_at=now()
      where user_id=p_uid
      returning fragments,revision into fa,rev;

      insert into server1.player_item_events(
        user_id,event_id,source,action,added_count,removed_count,changed_count,
        fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
      ) values(
        p_uid,'frag_'||replace(gen_random_uuid()::text,'-',''),
        'quest','server_quest_fragments',0,0,0,
        fb,fa,0,ref||':fragments','accepted',rev
      );
    end;
  end if;

  select fragments into fragments_balance
  from server1.player_item_state where user_id=p_uid;

  pet:=server1_private.v7044_roll_quest_pet(p_uid,ref||':pet',elite);
  seedr:=server1_private.v7044_roll_quest_seed(p_uid,ref||':seed',elite);
  unlockr:=server1_private.v7044_dungeon_unlock_for(p_uid,xp_event_id);
  nextq:=server1_private.v7044_next_quest_batch(p_uid,level_after);

  q.active:=null;
  q.offers:=coalesce(nextq->'offers','[]'::jsonb);
  q.elite_offer:=nextq->'eliteOffer';

  update server1.player_quest_state
  set active=null,
      offers=q.offers,
      elite_offer=case when q.elite_offer='null'::jsonb then null else q.elite_offer end,
      first_quest_claimed=q.first_quest_claimed,
      quest_energy=q.quest_energy,
      energy_harz=q.energy_harz,
      pending_receipt_run_id=rid,
      pending_receipt_at=now(),
      revision=revision+1,
      updated_at=now()
  where user_id=p_uid
  returning * into q;

  bundle:=jsonb_build_object(
    'ok',true,'duplicate',false,'won',true,'run_id',rid,'fight',fight,
    'xp_awarded',xp_award,'xp_base',base_xp,'xp_event_x2',xp_event,
    'xp_pet_pct',pet_pct,'xp_guild_level',guild_xp,
    'gold_awarded',gold_award,'gold_base',base_gold,'gold_event_x2',gold_event,
    'harz_awarded',harz_award,
    'harz_breakdown',jsonb_build_object(
      'daily',daily_harz,'energy',energy_drop,'bonus',bonus_drop,'elite',elite_harz
    ),
    'item',item,'item_drop',item_drop or elite,
    'item_chance',case when elite then 1 else item_chance end,
    'epic_nonset_replacement',epic_replacement,
    'materials',mats,
    'fragments_awarded',fragments_award,
    'fragments_balance',fragments_balance,
    'pet',pet,'seed_reward',seedr,'dungeon_unlock',unlockr,
    'energy',q.energy,'offers',q.offers,'eliteOffer',q.elite_offer,'active',null,
    'daily',jsonb_build_object(
      'firstQuest',q.first_quest_claimed,
      'questEnergy',q.quest_energy,
      'energyHarz',q.energy_harz
    ),
    'level',level_after,'level_xp',xp_after,
    'gold_balance',gold_after,'harz_balance',harz_after
  );

  update server1.player_quest_runs
  set resolved_at=now(),
      won=true,
      replay='[]'::jsonb,
      xp_awarded=xp_award,
      gold_awarded=gold_award,
      harz_awarded=harz_award,
      item=item,
      materials=mats,
      fragments_awarded=fragments_award,
      harz_breakdown=bundle->'harz_breakdown',
      pet=pet,
      seed_reward=seedr,
      dungeon_unlock=unlockr,
      reward_bundle=bundle
  where id=rid;

  return bundle;
end;
$function$;

-- public.v8290_admin_console
CREATE OR REPLACE FUNCTION public.v8290_admin_console(p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'public', 'recovery_private', 'pg_temp'
AS $function$
DECLARE
 v_uid uuid:=auth.uid();
 v_action text:=lower(trim(coalesce(p_action,'')));
 v_payload jsonb:=coalesce(p_payload,'{}'::jsonb);
 v_user uuid;
 v_query text;
 v_result jsonb;
 v_before jsonb;
 v_after jsonb;
 v_key text;
 v_reason text;
 v_revision bigint;
 v_value numeric;
 v_count int;
 v_bots int;
 v_gold bigint;
 v_harz integer;
 v_event uuid;
 v_gold_response jsonb;
 v_harz_response jsonb;
 v_record record;
BEGIN
 IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.game_admins a WHERE a.user_id=v_uid)
 THEN RAISE EXCEPTION 'ADMIN_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF v_action='whoami' THEN
   RETURN jsonb_build_object('ok',true,'isAdmin',true,'server','beta');
 ELSIF v_action='overview' THEN
   v_bots:=0;
   SELECT count(*) INTO v_count FROM public.profiles;
   RETURN jsonb_build_object('ok',true,'server','beta',
      'players',v_count,'bots',v_bots,
      'alerts',(SELECT count(*) FROM recovery_private.v8287_loss_watch_alerts),
      'recentAlerts',(SELECT count(*) FROM recovery_private.v8287_loss_watch_alerts WHERE detected_at>now()-interval '24 hours'),
      'purchaseCount',(SELECT count(*) FROM public.google_play_purchases WHERE server_id='beta' AND verified_at IS NOT NULL),
      'activeEvents',(SELECT count(*) FROM public.game_events WHERE is_active AND starts_at<=now() AND ends_at>=now()),
      'auditEvents',(SELECT count(*) FROM recovery_private.v8285_value_change_audit),
      'lastWatch',(SELECT max(finished_at) FROM recovery_private.v8287_loss_watch_runs),
      'questDampfChance',(SELECT value FROM recovery_private.v8289_admin_settings WHERE key='quest_energy_harz_chance'),
      'questBonusChance',(SELECT value FROM recovery_private.v8289_admin_settings WHERE key='quest_bonus_harz_chance'));
 ELSIF v_action='settings' THEN
   SELECT coalesce(jsonb_agg(jsonb_build_object('key',s.key,'value',s.value,'revision',s.revision,
     'updatedAt',s.updated_at,'editable',s.key IN ('quest_energy_harz_chance','quest_bonus_harz_chance'),
     'title',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Harz-Taler pro 100 Quest-Dampf (0/1)' ELSE 'Zusätzliche Harz-Taler-Dropchance pro Quest' END,
     'description',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Beim Erreichen von 100 Dampf: Chance auf exakt +1 Harz-Taler.' ELSE 'Zufallsdrop zusätzlich zu Tages-, Dampf- und Elite-Boni; live serverseitig einstellbar.' END)
     ORDER BY s.key),'[]'::jsonb) INTO v_result FROM recovery_private.v8289_admin_settings s;
   RETURN jsonb_build_object('ok',true,'settings',v_result);
 ELSIF v_action='set_setting' THEN
   v_key:=coalesce(v_payload->>'key','');
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   IF v_key NOT IN ('quest_energy_harz_chance','quest_bonus_harz_chance') THEN RAISE EXCEPTION 'SETTING_NOT_EDITABLE';END IF;
   IF length(v_reason)<8 OR length(v_reason)>400 THEN RAISE EXCEPTION 'REASON_LENGTH_INVALID';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'beta' THEN
     RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION'; END IF;
   v_value:=(v_payload->>'value')::numeric;
   v_revision:=(v_payload->>'expected_revision')::bigint;
   IF v_value IS NULL OR v_value<0 OR (v_key='quest_energy_harz_chance' AND v_value>1) OR (v_key='quest_bonus_harz_chance' AND v_value>0.25) THEN RAISE EXCEPTION 'SETTING_OUT_OF_RANGE';END IF;
   SELECT to_jsonb(s) INTO v_before FROM recovery_private.v8289_admin_settings s WHERE key=v_key FOR UPDATE;
   IF v_before IS NULL OR (v_before->>'revision')::bigint IS DISTINCT FROM v_revision THEN
     RAISE EXCEPTION 'SETTING_VERSION_CONFLICT';END IF;
   UPDATE recovery_private.v8289_admin_settings SET value=to_jsonb(v_value),revision=revision+1,updated_by=v_uid,
     reason=v_reason,updated_at=clock_timestamp() WHERE key=v_key RETURNING to_jsonb(recovery_private.v8289_admin_settings.*) INTO v_after;
   INSERT INTO recovery_private.v8290_admin_console_actions(request_id,actor_id,action,payload,result)
    VALUES(gen_random_uuid(),v_uid,'set_setting',
      jsonb_build_object('reason',v_reason,'key',v_key,'before',v_before->'value','after',v_after->'value'),
      jsonb_build_object('revision',v_after->'revision'));
   RETURN jsonb_build_object('ok',true,'key',v_key,'value',v_after->'value','revision',v_after->'revision');
 ELSIF v_action='players' THEN
   v_query:=left(trim(coalesce(v_payload->>'query','')),80);
   IF length(v_query)<2 THEN RETURN jsonb_build_object('ok',true,'players','[]'::jsonb);END IF;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.character_name,
      'level',p.level,'class',p.class_id,'combatPower',p.combat_power,
      'gold',w.gold,'harz',w.harz_taler,'itemRevision',i.revision)
     ORDER BY p.level DESC),'[]'::jsonb) INTO v_result
   FROM (SELECT * FROM public.profiles
      WHERE character_name ILIKE '%'||v_query||'%' ORDER BY level DESC LIMIT 40) p
   LEFT JOIN public.player_progress_trusted w ON w.user_id=p.id
   LEFT JOIN public.player_item_state i ON i.user_id=p.id;
   RETURN jsonb_build_object('ok',true,'players',v_result);
 ELSIF v_action='player' THEN
   v_user:=(v_payload->>'user_id')::uuid;
   SELECT jsonb_build_object('id',p.id,'name',p.character_name,'level',p.level,'class',p.class_id,
     'gold',w.gold,'harz',w.harz_taler,'dampf',q.energy,'questDampf',q.quest_energy,
     'inventory',i.inventory,'equipment',i.equipment,'itemRevision',i.revision,
     'towerBest',t.best_floor,'towerScore',t.best_score,'towerRuns',t.runs,
     'protected',jsonb_build_object('items',i.guard_enabled,'gold',w.gold_guard_enabled,'premium',w.harz_guard_enabled))
     INTO v_result
   FROM public.profiles p
    LEFT JOIN public.player_progress_trusted w ON w.user_id=p.id
    LEFT JOIN public.player_item_state i ON i.user_id=p.id
    LEFT JOIN public.player_quest_state q ON q.user_id=p.id
    LEFT JOIN public.player_tower_state t ON t.user_id=p.id
   WHERE p.id=v_user;
   IF v_result IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND'; END IF;
   RETURN jsonb_build_object('ok',true,'player',v_result);
 ELSIF v_action='alerts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.event_at DESC),'[]'::jsonb) INTO v_result FROM (
     SELECT a.id,a.domain,a.rule,a.severity,a.event_at,a.detected_at,a.before_summary,a.after_summary,
       p.character_name AS player_name
     FROM recovery_private.v8287_loss_watch_alerts a
     LEFT JOIN public.profiles p ON p.id=a.user_id
     ORDER BY a.detected_at DESC LIMIT 60) t;
   RETURN jsonb_build_object('ok',true,'alerts',v_result);
 ELSIF v_action='audit' THEN
   v_user:=NULLIF(v_payload->>'user_id','')::uuid;
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.recorded_at DESC),'[]'::jsonb) INTO v_result FROM(
      SELECT a.id,a.domain,a.operation,a.recorded_at,a.revision_before,a.revision_after,
       a.transaction_id,p.character_name AS player_name,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.before_state->'gold','harz',a.before_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.before_state->'inventory','[]'::jsonb)),'equipment',a.before_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_before) END AS previous,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.after_state->'gold','harz',a.after_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.after_state->'inventory','[]'::jsonb)),'equipment',a.after_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_after) END AS current
      FROM recovery_private.v8285_value_change_audit a
      LEFT JOIN public.profiles p ON p.id=a.user_id
      WHERE v_user IS NULL OR a.user_id=v_user
      ORDER BY a.recorded_at DESC LIMIT 60)t;
   RETURN jsonb_build_object('ok',true,'changes',v_result);
 ELSIF v_action='events' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.starts_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT name,description,is_active,starts_at,ends_at
     FROM public.game_events ORDER BY starts_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'events',v_result);
 ELSIF v_action='broadcasts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT title,kind,is_published,created_at,allow_comment FROM public.admin_broadcasts ORDER BY created_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'broadcasts',v_result);
 ELSIF v_action='bot_status' THEN
   v_result:=jsonb_build_object('count',0,'message','Bots currently run only on Server1');
   RETURN jsonb_build_object('ok',true,'bots',v_result);
 ELSIF v_action='grant' THEN
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   v_user:=(v_payload->>'user_id')::uuid;
   v_event:=(v_payload->>'request_id')::uuid;
   v_gold:=coalesce((v_payload->>'gold')::bigint,0);
   v_harz:=coalesce((v_payload->>'harz')::integer,0);
   IF v_event IS NULL OR v_user IS NULL OR length(v_reason)<10 OR length(v_reason)>400 THEN RAISE EXCEPTION 'INVALID_GRANT_REQUEST';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'beta' THEN RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION';END IF;
   IF (v_payload->>'confirm_player') IS DISTINCT FROM v_user::text THEN RAISE EXCEPTION 'PLAYER_CONFIRMATION_REQUIRED';END IF;
   IF v_gold<0 OR v_gold>100000 OR v_harz<0 OR v_harz>250 OR (v_gold=0 AND v_harz=0) THEN RAISE EXCEPTION 'GRANT_AMOUNT_OUT_OF_RANGE';END IF;
   IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=v_user) THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND';END IF;
   INSERT INTO recovery_private.v8290_admin_console_actions
     (request_id,actor_id,target_user,action,payload)
   VALUES(v_event,v_uid,v_user,'grant',jsonb_build_object('gold',v_gold,'harz',v_harz,'reason',v_reason))
   ON CONFLICT(request_id) DO NOTHING;
   GET DIAGNOSTICS v_count=ROW_COUNT;
   IF v_count=0 THEN
     SELECT result INTO v_result FROM recovery_private.v8290_admin_console_actions WHERE request_id=v_event AND actor_id=v_uid;
     RETURN coalesce(v_result,jsonb_build_object('ok',false,'reason','REQUEST_ALREADY_PROCESSING'));
   END IF;
   IF v_gold>0 THEN
     v_gold_response:=public.v6358_server_award_gold(v_user,'v8290_admin_gold_'||v_event::text,'admin_console',v_gold,'admin_console:'||v_event::text);
   END IF;
   IF v_harz>0 THEN
     v_harz_response:=public.v6358_server_award_harz(v_user,'v8290_admin_harz_'||v_event::text,'admin_console',v_harz,'admin_console:'||v_event::text);
   END IF;
   /* V8.290: successful trusted awards must also synchronize the legacy
      display-only save mirror, without ever pulling saved balances backward. */
   UPDATE public.player_saves save
   SET save_data=jsonb_set(
       jsonb_set(coalesce(save.save_data,'{}'::jsonb),'{gold}',
         to_jsonb((SELECT gold FROM public.player_progress_trusted w WHERE w.user_id=v_user)),true),
       '{harzTaler}',
         to_jsonb((SELECT harz_taler FROM public.player_progress_trusted w WHERE w.user_id=v_user)),true),
       updated_at=now()
   WHERE save.user_id=v_user;
   SELECT jsonb_build_object('ok',true,'gold',v_gold_response,'harz',v_harz_response,'requestId',v_event)
     INTO v_result;
   UPDATE recovery_private.v8290_admin_console_actions SET result=v_result WHERE request_id=v_event;
   RETURN v_result;
 ELSE
   RAISE EXCEPTION 'UNKNOWN_ADMIN_ACTION';
 END IF;
END;
$function$;

-- server1.v8290_admin_console
CREATE OR REPLACE FUNCTION server1.v8290_admin_console(p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'server1_private', 'pg_temp'
AS $function$
DECLARE
 v_uid uuid:=auth.uid();
 v_action text:=lower(trim(coalesce(p_action,'')));
 v_payload jsonb:=coalesce(p_payload,'{}'::jsonb);
 v_user uuid;
 v_query text;
 v_result jsonb;
 v_before jsonb;
 v_after jsonb;
 v_key text;
 v_reason text;
 v_revision bigint;
 v_value numeric;
 v_count int;
 v_bots int;
 v_gold bigint;
 v_harz integer;
 v_event uuid;
 v_gold_response jsonb;
 v_harz_response jsonb;
 v_record record;
BEGIN
 IF v_uid IS NULL OR NOT EXISTS(SELECT 1 FROM server1.game_admins a WHERE a.user_id=v_uid)
 THEN RAISE EXCEPTION 'ADMIN_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF v_action='whoami' THEN
   RETURN jsonb_build_object('ok',true,'isAdmin',true,'server','server1');
 ELSIF v_action='overview' THEN
   SELECT count(*) INTO v_bots FROM server1_private.v8243_bot_agents;
   SELECT count(*) INTO v_count FROM server1.profiles;
   RETURN jsonb_build_object('ok',true,'server','server1',
      'players',v_count,'bots',v_bots,
      'alerts',(SELECT count(*) FROM server1_private.v8287_loss_watch_alerts),
      'recentAlerts',(SELECT count(*) FROM server1_private.v8287_loss_watch_alerts WHERE detected_at>now()-interval '24 hours'),
      'purchaseCount',(SELECT count(*) FROM public.google_play_purchases WHERE server_id='server1' AND verified_at IS NOT NULL),
      'activeEvents',(SELECT count(*) FROM server1.game_events WHERE is_active AND starts_at<=now() AND ends_at>=now()),
      'auditEvents',(SELECT count(*) FROM server1_private.v8285_value_change_audit),
      'lastWatch',(SELECT max(finished_at) FROM server1_private.v8287_loss_watch_runs),
      'questDampfChance',(SELECT value FROM server1_private.v8289_admin_settings WHERE key='quest_energy_harz_chance'),
      'questBonusChance',(SELECT value FROM server1_private.v8289_admin_settings WHERE key='quest_bonus_harz_chance'));
 ELSIF v_action='settings' THEN
   SELECT coalesce(jsonb_agg(jsonb_build_object('key',s.key,'value',s.value,'revision',s.revision,
     'updatedAt',s.updated_at,'editable',s.key IN ('quest_energy_harz_chance','quest_bonus_harz_chance'),
     'title',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Harz-Taler pro 100 Quest-Dampf (0/1)' ELSE 'Zusätzliche Harz-Taler-Dropchance pro Quest' END,
     'description',CASE WHEN s.key='quest_energy_harz_chance' THEN 'Beim Erreichen von 100 Dampf: Chance auf exakt +1 Harz-Taler.' ELSE 'Zufallsdrop zusätzlich zu Tages-, Dampf- und Elite-Boni; live serverseitig einstellbar.' END)
     ORDER BY s.key),'[]'::jsonb) INTO v_result FROM server1_private.v8289_admin_settings s;
   RETURN jsonb_build_object('ok',true,'settings',v_result);
 ELSIF v_action='set_setting' THEN
   v_key:=coalesce(v_payload->>'key','');
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   IF v_key NOT IN ('quest_energy_harz_chance','quest_bonus_harz_chance') THEN RAISE EXCEPTION 'SETTING_NOT_EDITABLE';END IF;
   IF length(v_reason)<8 OR length(v_reason)>400 THEN RAISE EXCEPTION 'REASON_LENGTH_INVALID';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'server1' THEN
     RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION'; END IF;
   v_value:=(v_payload->>'value')::numeric;
   v_revision:=(v_payload->>'expected_revision')::bigint;
   IF v_value IS NULL OR v_value<0 OR (v_key='quest_energy_harz_chance' AND v_value>1) OR (v_key='quest_bonus_harz_chance' AND v_value>0.25) THEN RAISE EXCEPTION 'SETTING_OUT_OF_RANGE';END IF;
   SELECT to_jsonb(s) INTO v_before FROM server1_private.v8289_admin_settings s WHERE key=v_key FOR UPDATE;
   IF v_before IS NULL OR (v_before->>'revision')::bigint IS DISTINCT FROM v_revision THEN
     RAISE EXCEPTION 'SETTING_VERSION_CONFLICT';END IF;
   UPDATE server1_private.v8289_admin_settings SET value=to_jsonb(v_value),revision=revision+1,updated_by=v_uid,
     reason=v_reason,updated_at=clock_timestamp() WHERE key=v_key RETURNING to_jsonb(server1_private.v8289_admin_settings.*) INTO v_after;
   INSERT INTO server1_private.v8290_admin_console_actions(request_id,actor_id,action,payload,result)
    VALUES(gen_random_uuid(),v_uid,'set_setting',
      jsonb_build_object('reason',v_reason,'key',v_key,'before',v_before->'value','after',v_after->'value'),
      jsonb_build_object('revision',v_after->'revision'));
   RETURN jsonb_build_object('ok',true,'key',v_key,'value',v_after->'value','revision',v_after->'revision');
 ELSIF v_action='players' THEN
   v_query:=left(trim(coalesce(v_payload->>'query','')),80);
   IF length(v_query)<2 THEN RETURN jsonb_build_object('ok',true,'players','[]'::jsonb);END IF;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.character_name,
      'level',p.level,'class',p.class_id,'combatPower',p.combat_power,
      'gold',w.gold,'harz',w.harz_taler,'itemRevision',i.revision)
     ORDER BY p.level DESC),'[]'::jsonb) INTO v_result
   FROM (SELECT * FROM server1.profiles
      WHERE character_name ILIKE '%'||v_query||'%' ORDER BY level DESC LIMIT 40) p
   LEFT JOIN server1.player_progress_trusted w ON w.user_id=p.id
   LEFT JOIN server1.player_item_state i ON i.user_id=p.id;
   RETURN jsonb_build_object('ok',true,'players',v_result);
 ELSIF v_action='player' THEN
   v_user:=(v_payload->>'user_id')::uuid;
   SELECT jsonb_build_object('id',p.id,'name',p.character_name,'level',p.level,'class',p.class_id,
     'gold',w.gold,'harz',w.harz_taler,'dampf',q.energy,'questDampf',q.quest_energy,
     'inventory',i.inventory,'equipment',i.equipment,'itemRevision',i.revision,
     'towerBest',t.best_floor,'towerScore',t.best_score,'towerRuns',t.runs,
     'protected',jsonb_build_object('items',i.guard_enabled,'gold',w.gold_guard_enabled,'premium',w.harz_guard_enabled))
     INTO v_result
   FROM server1.profiles p
    LEFT JOIN server1.player_progress_trusted w ON w.user_id=p.id
    LEFT JOIN server1.player_item_state i ON i.user_id=p.id
    LEFT JOIN server1.player_quest_state q ON q.user_id=p.id
    LEFT JOIN server1.player_tower_state t ON t.user_id=p.id
   WHERE p.id=v_user;
   IF v_result IS NULL THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND'; END IF;
   RETURN jsonb_build_object('ok',true,'player',v_result);
 ELSIF v_action='alerts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.event_at DESC),'[]'::jsonb) INTO v_result FROM (
     SELECT a.id,a.domain,a.rule,a.severity,a.event_at,a.detected_at,a.before_summary,a.after_summary,
       p.character_name AS player_name
     FROM server1_private.v8287_loss_watch_alerts a
     LEFT JOIN server1.profiles p ON p.id=a.user_id
     ORDER BY a.detected_at DESC LIMIT 60) t;
   RETURN jsonb_build_object('ok',true,'alerts',v_result);
 ELSIF v_action='audit' THEN
   v_user:=NULLIF(v_payload->>'user_id','')::uuid;
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.recorded_at DESC),'[]'::jsonb) INTO v_result FROM(
      SELECT a.id,a.domain,a.operation,a.recorded_at,a.revision_before,a.revision_after,
       a.transaction_id,p.character_name AS player_name,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.before_state->'gold','harz',a.before_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.before_state->'inventory','[]'::jsonb)),'equipment',a.before_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_before) END AS previous,
       CASE WHEN a.domain='wallet' THEN jsonb_build_object('gold',a.after_state->'gold','harz',a.after_state->'harz_taler')
            WHEN a.domain='items' THEN jsonb_build_object('inventoryCount',jsonb_array_length(coalesce(a.after_state->'inventory','[]'::jsonb)),'equipment',a.after_state->'equipment')
            ELSE jsonb_build_object('revision',a.revision_after) END AS current
      FROM server1_private.v8285_value_change_audit a
      LEFT JOIN server1.profiles p ON p.id=a.user_id
      WHERE v_user IS NULL OR a.user_id=v_user
      ORDER BY a.recorded_at DESC LIMIT 60)t;
   RETURN jsonb_build_object('ok',true,'changes',v_result);
 ELSIF v_action='events' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.starts_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT name,description,is_active,starts_at,ends_at
     FROM server1.game_events ORDER BY starts_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'events',v_result);
 ELSIF v_action='broadcasts' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC),'[]'::jsonb) INTO v_result FROM(
     SELECT title,kind,is_published,created_at,allow_comment FROM server1.admin_broadcasts ORDER BY created_at DESC LIMIT 30)t;
   RETURN jsonb_build_object('ok',true,'broadcasts',v_result);
 ELSIF v_action='bot_status' THEN
   SELECT jsonb_build_object('count',count(*),'active',count(*) FILTER(WHERE lifecycle='active'),'errors',count(*) FILTER(WHERE last_error IS NOT NULL AND last_error<>''),'lastAction',max(last_action_at)) INTO v_result FROM server1_private.v8243_bot_agents;
   RETURN jsonb_build_object('ok',true,'bots',v_result);
 ELSIF v_action='grant' THEN
   v_reason:=trim(coalesce(v_payload->>'reason',''));
   v_user:=(v_payload->>'user_id')::uuid;
   v_event:=(v_payload->>'request_id')::uuid;
   v_gold:=coalesce((v_payload->>'gold')::bigint,0);
   v_harz:=coalesce((v_payload->>'harz')::integer,0);
   IF v_event IS NULL OR v_user IS NULL OR length(v_reason)<10 OR length(v_reason)>400 THEN RAISE EXCEPTION 'INVALID_GRANT_REQUEST';END IF;
   IF (v_payload->>'confirm_server') IS DISTINCT FROM 'server1' THEN RAISE EXCEPTION 'WRONG_SERVER_CONFIRMATION';END IF;
   IF (v_payload->>'confirm_player') IS DISTINCT FROM v_user::text THEN RAISE EXCEPTION 'PLAYER_CONFIRMATION_REQUIRED';END IF;
   IF v_gold<0 OR v_gold>100000 OR v_harz<0 OR v_harz>250 OR (v_gold=0 AND v_harz=0) THEN RAISE EXCEPTION 'GRANT_AMOUNT_OUT_OF_RANGE';END IF;
   IF NOT EXISTS(SELECT 1 FROM server1.profiles WHERE id=v_user) THEN RAISE EXCEPTION 'PLAYER_NOT_FOUND';END IF;
   INSERT INTO server1_private.v8290_admin_console_actions
     (request_id,actor_id,target_user,action,payload)
   VALUES(v_event,v_uid,v_user,'grant',jsonb_build_object('gold',v_gold,'harz',v_harz,'reason',v_reason))
   ON CONFLICT(request_id) DO NOTHING;
   GET DIAGNOSTICS v_count=ROW_COUNT;
   IF v_count=0 THEN
     SELECT result INTO v_result FROM server1_private.v8290_admin_console_actions WHERE request_id=v_event AND actor_id=v_uid;
     RETURN coalesce(v_result,jsonb_build_object('ok',false,'reason','REQUEST_ALREADY_PROCESSING'));
   END IF;
   IF v_gold>0 THEN
     v_gold_response:=server1.v6358_server_award_gold(v_user,'v8290_admin_gold_'||v_event::text,'admin_console',v_gold,'admin_console:'||v_event::text);
   END IF;
   IF v_harz>0 THEN
     v_harz_response:=server1.v6358_server_award_harz(v_user,'v8290_admin_harz_'||v_event::text,'admin_console',v_harz,'admin_console:'||v_event::text);
   END IF;
   /* V8.290: successful trusted awards must also synchronize the legacy
      display-only save mirror, without ever pulling saved balances backward. */
   UPDATE server1.player_saves save
   SET save_data=jsonb_set(
       jsonb_set(coalesce(save.save_data,'{}'::jsonb),'{gold}',
         to_jsonb((SELECT gold FROM server1.player_progress_trusted w WHERE w.user_id=v_user)),true),
       '{harzTaler}',
         to_jsonb((SELECT harz_taler FROM server1.player_progress_trusted w WHERE w.user_id=v_user)),true),
       updated_at=now()
   WHERE save.user_id=v_user;
   SELECT jsonb_build_object('ok',true,'gold',v_gold_response,'harz',v_harz_response,'requestId',v_event)
     INTO v_result;
   UPDATE server1_private.v8290_admin_console_actions SET result=v_result WHERE request_id=v_event;
   RETURN v_result;
 ELSE
   RAISE EXCEPTION 'UNKNOWN_ADMIN_ACTION';
 END IF;
END;
$function$;

