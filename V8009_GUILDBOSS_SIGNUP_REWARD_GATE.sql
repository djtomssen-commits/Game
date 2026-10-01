-- V8.009 Guildboss signup gate
-- Rule: a player may not register for a new guildboss round while an older
-- resolved guildboss reward is still unclaimed. Unregistering remains allowed.

create or replace function public.v7307_set_guild_boss_signup(p_value boolean)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
  gid uuid;
  h int := public.v255_berlin_hour();
  d date := public.v255_berlin_date();
  registered boolean := false;
  parts jsonb := '[]'::jsonb;
  pending_reward boolean := false;
begin
  if uid is null then raise exception 'Account erforderlich'; end if;
  if h >= 19 then raise exception 'Boss-Anmeldung ist heute seit 19:00 geschlossen'; end if;

  select guild_id into gid from public.guild_members where user_id=uid limit 1;
  if gid is null then raise exception 'Du bist in keiner Gilde'; end if;

  if coalesce(p_value,false) then
    select exists(
      select 1
      from public.guild_boss_participants bp
      join public.guild_boss_rounds gr on gr.id=bp.round_id
      where bp.user_id=uid
        and gr.guild_id=gid
        and gr.battle_date = d - 1
        and gr.status in ('won','lost')
        and not coalesce(bp.reward_claimed,false)
    ) into pending_reward;

    if pending_reward then
      raise exception 'Bitte zuerst die offene Gildenboss-Belohnung der vorherigen Runde abholen';
    end if;
  end if;

  update public.guild_members
     set boss_signed=coalesce(p_value,false)
   where user_id=uid
   returning boss_signed into registered;

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',gm.user_id,
    'character_name',coalesce(p.character_name,'Spieler'),
    'class_id',p.class_id,
    'class_name',p.class_name,
    'level',greatest(1,coalesce(p.level,1)),
    'combat_power',greatest(1,coalesce(p.combat_power,1)),
    'damage_done',null
  ) order by gm.joined_at),'[]'::jsonb)
  into parts
  from public.guild_members gm
  join public.profiles p on p.id=gm.user_id
  where gm.guild_id=gid and gm.boss_signed=true;

  return jsonb_build_object(
    'ok',true,
    'registered',registered,
    'participant_count',jsonb_array_length(parts),
    'participants',parts
  );
end;
$function$;

create or replace function server1.v7307_set_guild_boss_signup(p_value boolean)
returns jsonb
language plpgsql
security definer
set search_path to 'server1','public'
as $function$
declare
  uid uuid := auth.uid();
  gid uuid;
  h int := server1.v255_berlin_hour();
  d date := server1.v255_berlin_date();
  registered boolean := false;
  parts jsonb := '[]'::jsonb;
  pending_reward boolean := false;
begin
  if uid is null then raise exception 'Account erforderlich'; end if;
  if h >= 19 then raise exception 'Boss-Anmeldung ist heute seit 19:00 geschlossen'; end if;

  select guild_id into gid from server1.guild_members where user_id=uid limit 1;
  if gid is null then raise exception 'Du bist in keiner Gilde'; end if;

  if coalesce(p_value,false) then
    select exists(
      select 1
      from server1.guild_boss_participants bp
      join server1.guild_boss_rounds gr on gr.id=bp.round_id
      where bp.user_id=uid
        and gr.guild_id=gid
        and gr.battle_date = d - 1
        and gr.status in ('won','lost')
        and not coalesce(bp.reward_claimed,false)
    ) into pending_reward;

    if pending_reward then
      raise exception 'Bitte zuerst die offene Gildenboss-Belohnung der vorherigen Runde abholen';
    end if;
  end if;

  update server1.guild_members
     set boss_signed=coalesce(p_value,false)
   where user_id=uid
   returning boss_signed into registered;

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',gm.user_id,
    'character_name',coalesce(p.character_name,'Spieler'),
    'class_id',p.class_id,
    'class_name',p.class_name,
    'level',greatest(1,coalesce(p.level,1)),
    'combat_power',greatest(1,coalesce(p.combat_power,1)),
    'damage_done',null
  ) order by gm.joined_at),'[]'::jsonb)
  into parts
  from server1.guild_members gm
  join server1.profiles p on p.id=gm.user_id
  where gm.guild_id=gid and gm.boss_signed=true;

  return jsonb_build_object(
    'ok',true,
    'registered',registered,
    'participant_count',jsonb_array_length(parts),
    'participants',parts
  );
end;
$function$;
