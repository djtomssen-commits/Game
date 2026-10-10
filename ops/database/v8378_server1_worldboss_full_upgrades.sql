-- V8.378 Server 1: Smaragd-Koloss difficulty parity with Beta, NO entry gate.
-- Applies ONLY server1_private.v7104_worldboss_v6349_combat; public/recovery_private unchanged.
-- Original combat authority; no changes to purchases, wins, loot, player persistence or sessions.

CREATE OR REPLACE FUNCTION server1_private.v7104_worldboss_v6349_combat(p_uid uuid, p_rng jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'server1_private', 'pg_temp'
AS $function$
declare
  t server1.player_progress_trusted%rowtype;
  ist server1.player_item_state%rowtype;
  lvl int;
  ratio numeric:=0;
  equipped int:=0;
  upgrade_total numeric:=0;
  gem_count int:=0;
  enchant_count int:=0;
  rec record;
  qmul numeric;
  age int;
  fresh numeric;
  gem jsonb;
  ench jsonb;
  gq numeric;
  eq numeric;
  up numeric;
  upgraded numeric;
  ideal_hp numeric;
  ideal_damage numeric;
  player_hp0 int;
  player_hp int;
  player_base int;
  boss_hp0 int;
  boss_hp int;
  boss_atk int;
  round_no int:=0;
  idx int:=0;
  phase int;
  phase_mult numeric;
  rv numeric;
  pdmg int;
  edmg int;
  crit boolean;
  crits int:=0;
  replay jsonb:='[]'::jsonb;
  won boolean:=false;
  tape jsonb;
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  select * into t from server1.player_progress_trusted
  where user_id=p_uid;
  if not found then raise exception 'TRUSTED_PROGRESS_MISSING'; end if;

  select * into ist from server1.player_item_state
  where user_id=p_uid and guard_enabled;
  if not found then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;

  lvl:=greatest(1,coalesce(t.level,1));

  /* Exact final V6.349 readiness:
     V290 quality/freshness + V291 gem/enchant upgrade score. */
  for rec in
    select e.key slot,e.value item
    from jsonb_each(coalesce(ist.equipment,'{}'::jsonb)) e
    where e.key in ('weapon','head','body','boots','ring','amulet')
      and e.value is not null and e.value<>'null'::jsonb
  loop
    equipped:=equipped+1;

    qmul:=case lower(coalesce(rec.item->>'quality','gray'))
      when 'green' then .68
      when 'blue' then .82
      when 'purple' then .95
      when 'orange' then 1.00
      when 'cyan' then 1.00
      else .55
    end;

    age:=greatest(0,lvl-greatest(1,coalesce((rec.item->>'dropLevel')::int,lvl)));
    fresh:=greatest(.72,1-age*.028);

    gem:=coalesce(
      rec.item->'gem',
      rec.item->'socketGem',
      rec.item->'socket',
      rec.item->'edelstein',
      rec.item->'gemItem'
    );
    ench:=coalesce(
      rec.item->'enchant',
      rec.item->'enchantment',
      rec.item->'scroll',
      rec.item->'roll',
      rec.item->'verzauberung',
      rec.item->'rolle'
    );

    gq:=0;
    if gem is not null and gem<>'null'::jsonb then
      gem_count:=gem_count+1;
      gq:=case lower(coalesce(gem->>'quality',gem->>'rarity',''))
        when 'gray' then .45 when 'grey' then .45
        when 'green' then .60
        when 'blue' then .75
        when 'purple' then .90
        when 'orange' then 1.00
        when 'cyan' then 1.00
        when 'mystic' then 1.00
        when 'legendary' then 1.00
        else .70
      end;
    end if;

    eq:=0;
    if ench is not null and ench<>'null'::jsonb then
      enchant_count:=enchant_count+1;
      eq:=case lower(coalesce(ench->>'quality',ench->>'rarity',''))
        when 'gray' then .45 when 'grey' then .45
        when 'green' then .60
        when 'blue' then .75
        when 'purple' then .90
        when 'orange' then 1.00
        when 'cyan' then 1.00
        when 'mystic' then 1.00
        when 'legendary' then 1.00
        else .70
      end;
    end if;

    up:=greatest(0,least(1,.55*gq+.45*eq));
    upgraded:=qmul*fresh*(1+.15*up);

    ratio:=ratio+least(1,upgraded);
    upgrade_total:=upgrade_total+up;
  end loop;

  ratio:=greatest(0,least(1,ratio/6.0));

  ideal_hp:=760+lvl*12;
  ideal_damage:=245+lvl*3.75;

  player_hp0:=round(ideal_hp)::int;
  player_hp:=player_hp0;
  /* V8.378: Gems AND enchantments jointly enhance damage; no entry restriction. */
  player_base:=round(
    ideal_damage*(.72+.38*ratio)*
    (.54+.70*power((gem_count::numeric/6.0)*(enchant_count::numeric/6.0),2)
      +.08*greatest(0,least(1,upgrade_total/6.0)))
  )::int;

  boss_hp0:=round(ideal_damage*11.5)::int;
  boss_hp:=boss_hp0;
  boss_atk:=round(ideal_hp*.125)::int;

  /* V311 removed pity completely in the final pre-authority ruleset. */
  if p_rng is null then
    select jsonb_agg(random() order by g)
    into tape
    from generate_series(1,500) g;
  else
    if jsonb_typeof(p_rng)<>'array' or jsonb_array_length(p_rng)<120 then
      raise exception 'INVALID_RNG_TAPE';
    end if;
    tape:=p_rng;
  end if;

  while round_no<60 and player_hp>0 and boss_hp>0 loop
    round_no:=round_no+1;

    phase:=case
      when boss_hp::numeric/boss_hp0<=.25 then 3
      when boss_hp::numeric/boss_hp0<=.60 then 2
      else 1
    end;
    phase_mult:=case phase when 3 then 1.48 when 2 then 1.25 else 1 end;

    rv:=server1_private.v7050_rng(tape,idx);idx:=idx+1;
    pdmg:=greatest(5,round(player_base*(.90+rv*.20))::int);

    rv:=server1_private.v7050_rng(tape,idx);idx:=idx+1;
    crit:=rv<.12;
    if crit then
      crits:=crits+1;
      pdmg:=round(pdmg*1.65)::int;
    end if;

    boss_hp:=greatest(0,boss_hp-pdmg);

    replay:=replay||jsonb_build_array(jsonb_build_object(
      'round',round_no,'r',round_no,
      'side','player','actor','attacker',
      'damage',pdmg,'heal',0,'crit',crit,
      'label',case when crit then 'Kritischer Treffer' else 'Du triffst' end,
      'phase',phase,
      'player_hp',player_hp,'enemy_hp',boss_hp,
      'attackerHp',player_hp,'defenderHp',boss_hp,
      'rng_used',idx
    ));

    if boss_hp<=0 then won:=true;exit;end if;

    rv:=server1_private.v7050_rng(tape,idx);idx:=idx+1;
    edmg:=greatest(5,round(boss_atk*phase_mult*(.90+rv*.20))::int);
    player_hp:=greatest(0,player_hp-edmg);

    replay:=replay||jsonb_build_array(jsonb_build_object(
      'round',round_no,'r',round_no,
      'side','enemy','actor','defender',
      'damage',edmg,'heal',0,'crit',false,'dodge',false,
      'label',case phase
        when 3 then 'LETZTE BLÜTE'
        when 2 then 'SMARAGD-RASEREI'
        else 'Koloss trifft'
      end,
      'phase',phase,
      'player_hp',player_hp,'enemy_hp',boss_hp,
      'attackerHp',player_hp,'defenderHp',boss_hp,
      'rng_used',idx
    ));

    if player_hp<=0 then won:=false;exit;end if;
  end loop;

  if round_no>=60 and player_hp>0 and boss_hp>0 then won:=false;end if;

  return jsonb_build_object(
    'ok',true,
    'ruleset','V8.378-full-upgrades',
    'won',won,
    'rounds',round_no,
    'crits',crits,
    'readiness',round(ratio,4),
    'equipped_slots',equipped,
    'upgrade_ratio',round(greatest(0,least(1,upgrade_total/6.0)),4),
    'gem_count',gem_count,
    'enchant_count',enchant_count,
    'player_hp_start',player_hp0,
    'player_hp_end',player_hp,
    'player_base_damage',player_base,
    'boss_hp_start',boss_hp0,
    'boss_hp_end',boss_hp,
    'boss_attack',boss_atk,
    'pity_steps',0,
    'pity_damage',1,
    'rng_consumed',idx,
    'replay',replay
  );
end;
$function$

