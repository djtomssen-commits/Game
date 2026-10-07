-- V8.194 Guild bloom donation authority
-- Deployed to Beta/public + Server1 on 2026-10-07.
-- One harvested bloom per player and Europe/Berlin calendar day.
-- Donation is independent of the normal 625/day gameplay guild-XP cap.

create table if not exists recovery_private.v8194_guild_bloom_donations (
  user_id uuid not null,
  donation_day date not null,
  guild_id uuid not null,
  bloom_id text not null,
  awarded integer not null check (awarded > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, donation_day)
);
alter table recovery_private.v8194_guild_bloom_donations enable row level security;
revoke all on table recovery_private.v8194_guild_bloom_donations from public, anon, authenticated;

create table if not exists server1_private.v8194_guild_bloom_donations (
  user_id uuid not null,
  donation_day date not null,
  guild_id uuid not null,
  bloom_id text not null,
  awarded integer not null check (awarded > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, donation_day)
);
alter table server1_private.v8194_guild_bloom_donations enable row level security;
revoke all on table server1_private.v8194_guild_bloom_donations from public, anon, authenticated;

create or replace function recovery_private.v8194_donate_guild_bloom_for(p_uid uuid, p_bloom_id text)
returns jsonb
language plpgsql
security definer
set search_path = 'public','recovery_private','pg_temp'
as $$
declare
  gid uuid;
  d date := (now() at time zone 'Europe/Berlin')::date;
  bid text := left(btrim(coalesce(p_bloom_id,'')),180);
  g public.player_grow_state%rowtype;
  bloom jsonb := null;
  newbag jsonb := '[]'::jsonb;
  x jsonb;
  old_xp bigint := 0;
  new_xp bigint := 0;
  old_level integer := 1;
  new_level integer := 1;
  award integer := 5;
begin
  if p_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if bid = '' then return jsonb_build_object('ok',true,'donated',false,'reason','INVALID_BLOOM'); end if;

  perform pg_advisory_xact_lock(hashtext(p_uid::text), hashtext(d::text));

  select gm.guild_id into gid
  from public.guild_members gm
  where gm.user_id=p_uid
  limit 1;

  if gid is null then
    return jsonb_build_object('ok',true,'donated',false,'reason','NO_GUILD');
  end if;

  if exists(
    select 1 from recovery_private.v8194_guild_bloom_donations z
    where z.user_id=p_uid and z.donation_day=d
  ) then
    select coalesce(gu.guild_xp,0) into new_xp from public.guilds gu where gu.id=gid;
    return jsonb_build_object('ok',true,'donated',false,'reason','DAILY_LIMIT',
                              'donation_day',d,'guild_xp',coalesce(new_xp,0));
  end if;

  select * into g
  from public.player_grow_state
  where user_id=p_uid
  for update;

  if not found or not coalesce(g.guard_enabled,false) then
    raise exception 'GROW_GUARD_NOT_ENABLED';
  end if;

  for x in select value from jsonb_array_elements(coalesce(g.bag,'[]'::jsonb)) loop
    if bloom is null and x->>'id'=bid then bloom:=x;
    else newbag:=newbag||jsonb_build_array(x);
    end if;
  end loop;

  if bloom is null then
    return jsonb_build_object('ok',true,'donated',false,'reason','BLOOM_NOT_FOUND');
  end if;

  select coalesce(gu.guild_xp,0) into old_xp
  from public.guilds gu
  where gu.id=gid
  for update;

  old_level:=public.v7273_guild_level_for_xp(old_xp);

  update public.guilds
  set guild_xp=coalesce(guild_xp,0)+award
  where id=gid
  returning guild_xp into new_xp;

  new_level:=public.v7273_guild_level_for_xp(new_xp);

  update public.player_grow_state
  set bag=newbag,revision=revision+1,updated_at=now()
  where user_id=p_uid
  returning * into g;

  insert into recovery_private.v8194_guild_bloom_donations(user_id,donation_day,guild_id,bloom_id,awarded)
  values (p_uid,d,gid,bid,award);

  if new_level>old_level then
    begin
      insert into public.push_jobs(user_id,type,title,body,send_at)
      select gm.user_id,'guild_level_up','Grow Legends',
             '🏰 Eure Gilde hat Gildenlevel '||new_level::text||' erreicht!',now()
      from public.guild_members gm
      where gm.guild_id=gid
        and not exists(
          select 1 from public.push_jobs pj
          where pj.user_id=gm.user_id and pj.type='guild_level_up'
            and pj.sent_at is null and pj.cancelled_at is null
        );
    exception when others then null;
    end;
  end if;

  return jsonb_build_object(
    'ok',true,'donated',true,'reason','DONATED','awarded',award,'guild_xp',new_xp,
    'donation_day',d,'bloom',bloom,
    'grow_state',jsonb_build_object(
      'room_level',g.room_level,'lamp_level',g.lamp_level,'pots_level',g.pots_level,
      'mastery_xp',g.mastery_xp,'harvested',g.harvested,'perfect',g.perfect,
      'splus',g.splus,'mutation_count',g.mutation_count,'prismatic',g.prismatic,
      'week_key',g.week_key,'week_harvested',g.week_harvested,'week_perfect',g.week_perfect,
      'week_mutations',g.week_mutations,'week_claimed',g.week_claimed,
      'bag',g.bag,'active',g.active,'revision',g.revision
    )
  );
end;
$$;

create or replace function public.v8194_donate_guild_bloom(p_bloom_id text)
returns jsonb
language sql
security definer
set search_path = 'public','recovery_private','pg_temp'
as $$
  select recovery_private.v8194_donate_guild_bloom_for(auth.uid(),p_bloom_id);
$$;
revoke execute on function public.v8194_donate_guild_bloom(text) from public, anon;
grant execute on function public.v8194_donate_guild_bloom(text) to authenticated, service_role;
revoke execute on function recovery_private.v8194_donate_guild_bloom_for(uuid,text) from public, anon, authenticated;
grant execute on function recovery_private.v8194_donate_guild_bloom_for(uuid,text) to service_role;

create or replace function server1_private.v8194_donate_guild_bloom_for(p_uid uuid, p_bloom_id text)
returns jsonb
language plpgsql
security definer
set search_path = 'server1','server1_private','pg_temp'
as $$
declare
  gid uuid;
  d date := (now() at time zone 'Europe/Berlin')::date;
  bid text := left(btrim(coalesce(p_bloom_id,'')),180);
  g server1.player_grow_state%rowtype;
  bloom jsonb := null;
  newbag jsonb := '[]'::jsonb;
  x jsonb;
  old_xp bigint := 0;
  new_xp bigint := 0;
  old_level integer := 1;
  new_level integer := 1;
  award integer := 5;
begin
  if p_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if bid = '' then return jsonb_build_object('ok',true,'donated',false,'reason','INVALID_BLOOM'); end if;

  perform pg_advisory_xact_lock(hashtext(p_uid::text), hashtext(d::text));

  select gm.guild_id into gid
  from server1.guild_members gm
  where gm.user_id=p_uid
  limit 1;

  if gid is null then
    return jsonb_build_object('ok',true,'donated',false,'reason','NO_GUILD');
  end if;

  if exists(
    select 1 from server1_private.v8194_guild_bloom_donations z
    where z.user_id=p_uid and z.donation_day=d
  ) then
    select coalesce(gu.guild_xp,0) into new_xp from server1.guilds gu where gu.id=gid;
    return jsonb_build_object('ok',true,'donated',false,'reason','DAILY_LIMIT',
                              'donation_day',d,'guild_xp',coalesce(new_xp,0));
  end if;

  select * into g
  from server1.player_grow_state
  where user_id=p_uid
  for update;

  if not found or not coalesce(g.guard_enabled,false) then
    raise exception 'GROW_GUARD_NOT_ENABLED';
  end if;

  for x in select value from jsonb_array_elements(coalesce(g.bag,'[]'::jsonb)) loop
    if bloom is null and x->>'id'=bid then bloom:=x;
    else newbag:=newbag||jsonb_build_array(x);
    end if;
  end loop;

  if bloom is null then
    return jsonb_build_object('ok',true,'donated',false,'reason','BLOOM_NOT_FOUND');
  end if;

  select coalesce(gu.guild_xp,0) into old_xp
  from server1.guilds gu
  where gu.id=gid
  for update;

  old_level:=server1.v7273_guild_level_for_xp(old_xp);

  update server1.guilds
  set guild_xp=coalesce(guild_xp,0)+award
  where id=gid
  returning guild_xp into new_xp;

  new_level:=server1.v7273_guild_level_for_xp(new_xp);

  update server1.player_grow_state
  set bag=newbag,revision=revision+1,updated_at=now()
  where user_id=p_uid
  returning * into g;

  insert into server1_private.v8194_guild_bloom_donations(user_id,donation_day,guild_id,bloom_id,awarded)
  values (p_uid,d,gid,bid,award);

  if new_level>old_level then
    begin
      insert into server1.push_jobs(user_id,type,title,body,send_at)
      select gm.user_id,'guild_level_up','Grow Legends',
             '🏰 Eure Gilde hat Gildenlevel '||new_level::text||' erreicht!',now()
      from server1.guild_members gm
      where gm.guild_id=gid
        and not exists(
          select 1 from server1.push_jobs pj
          where pj.user_id=gm.user_id and pj.type='guild_level_up'
            and pj.sent_at is null and pj.cancelled_at is null
        );
    exception when others then null;
    end;
  end if;

  return jsonb_build_object(
    'ok',true,'donated',true,'reason','DONATED','awarded',award,'guild_xp',new_xp,
    'donation_day',d,'bloom',bloom,
    'grow_state',jsonb_build_object(
      'room_level',g.room_level,'lamp_level',g.lamp_level,'pots_level',g.pots_level,
      'mastery_xp',g.mastery_xp,'harvested',g.harvested,'perfect',g.perfect,
      'splus',g.splus,'mutation_count',g.mutation_count,'prismatic',g.prismatic,
      'week_key',g.week_key,'week_harvested',g.week_harvested,'week_perfect',g.week_perfect,
      'week_mutations',g.week_mutations,'week_claimed',g.week_claimed,
      'bag',g.bag,'active',g.active,'revision',g.revision
    )
  );
end;
$$;

create or replace function server1.v8194_donate_guild_bloom(p_bloom_id text)
returns jsonb
language sql
security definer
set search_path = 'server1','server1_private','pg_temp'
as $$
  select server1_private.v8194_donate_guild_bloom_for(auth.uid(),p_bloom_id);
$$;
revoke execute on function server1.v8194_donate_guild_bloom(text) from public, anon;
grant execute on function server1.v8194_donate_guild_bloom(text) to authenticated, service_role;
revoke execute on function server1_private.v8194_donate_guild_bloom_for(uuid,text) from public, anon, authenticated;
grant execute on function server1_private.v8194_donate_guild_bloom_for(uuid,text) to service_role;
