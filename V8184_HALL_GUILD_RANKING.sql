-- V8.184 Hall of Haze: Guild ranking + public guild profile + editable description
-- Ranking order: guild level DESC -> guild buds DESC -> guild XP DESC.
-- Applied to both public (Beta) and server1 schemas.

alter table public.guilds add column if not exists description text not null default '';
alter table server1.guilds add column if not exists description text not null default '';

alter table public.guilds drop constraint if exists guilds_description_len_v8184;
alter table public.guilds add constraint guilds_description_len_v8184 check (char_length(description) <= 300);
alter table server1.guilds drop constraint if exists guilds_description_len_v8184;
alter table server1.guilds add constraint guilds_description_len_v8184 check (char_length(description) <= 300);

create or replace function public.v8184_hall_guild_ranking(p_offset integer default 0, p_limit integer default 50)
returns jsonb
language plpgsql
security invoker
set search_path to 'public','pg_temp'
as $$
declare
  v_offset integer := greatest(0, least(coalesce(p_offset,0), 10000));
  v_limit integer := greatest(1, least(coalesce(p_limit,50), 100));
  v_total integer := 0;
  v_rows jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select count(*)::integer into v_total from public.guilds;
  with base as (
    select g.id,g.name,g.tag,g.leader_id,g.description,
      greatest(0,coalesce(g.guild_buds,0))::bigint guild_buds,
      greatest(0,coalesce(g.guild_xp,0))::bigint guild_xp,
      (case
      when greatest(0,coalesce(g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(g.guild_xp,0))>=500 then 2
      else 1 end)::integer guild_level,
      coalesce(g.max_members,20)::integer max_members,
      (select count(*)::integer from public.guild_members gm where gm.guild_id=g.id) member_count
    from public.guilds g
  ), ranked as (
    select row_number() over(order by guild_level desc,guild_buds desc,guild_xp desc,lower(name) asc,id asc)::bigint rank_no,* from base
  )
  select coalesce(jsonb_agg(to_jsonb(x) order by x.rank_no),'[]'::jsonb) into v_rows
  from (select * from ranked order by rank_no offset v_offset limit v_limit) x;
  return jsonb_build_object('ok',true,'authority','server','total',v_total,'offset',v_offset,'limit',v_limit,
    'rank_basis',jsonb_build_array('guild_level','guild_buds','guild_xp'),'rows',v_rows);
end;
$$;

create or replace function server1.v8184_hall_guild_ranking(p_offset integer default 0, p_limit integer default 50)
returns jsonb
language plpgsql
security invoker
set search_path to 'server1','public','pg_temp'
as $$
declare
  v_offset integer := greatest(0, least(coalesce(p_offset,0), 10000));
  v_limit integer := greatest(1, least(coalesce(p_limit,50), 100));
  v_total integer := 0;
  v_rows jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select count(*)::integer into v_total from server1.guilds;
  with base as (
    select g.id,g.name,g.tag,g.leader_id,g.description,
      greatest(0,coalesce(g.guild_buds,0))::bigint guild_buds,
      greatest(0,coalesce(g.guild_xp,0))::bigint guild_xp,
      (case
      when greatest(0,coalesce(g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(g.guild_xp,0))>=500 then 2
      else 1 end)::integer guild_level,
      coalesce(g.max_members,20)::integer max_members,
      (select count(*)::integer from server1.guild_members gm where gm.guild_id=g.id) member_count
    from server1.guilds g
  ), ranked as (
    select row_number() over(order by guild_level desc,guild_buds desc,guild_xp desc,lower(name) asc,id asc)::bigint rank_no,* from base
  )
  select coalesce(jsonb_agg(to_jsonb(x) order by x.rank_no),'[]'::jsonb) into v_rows
  from (select * from ranked order by rank_no offset v_offset limit v_limit) x;
  return jsonb_build_object('ok',true,'authority','server1','total',v_total,'offset',v_offset,'limit',v_limit,
    'rank_basis',jsonb_build_array('guild_level','guild_buds','guild_xp'),'rows',v_rows);
end;
$$;

create or replace function public.v8184_hall_guild_profile(p_guild uuid)
returns jsonb
language plpgsql
security invoker
set search_path to 'public','pg_temp'
as $$
declare
  v_g public.guilds%rowtype;
  v_members integer := 0;
  v_leader_name text := '';
  v_top jsonb := '[]'::jsonb;
  v_rank bigint := null;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_g from public.guilds where id=p_guild;
  if not found then raise exception 'GUILD_NOT_FOUND'; end if;
  select count(*)::integer into v_members from public.guild_members where guild_id=p_guild;
  select coalesce(character_name,'') into v_leader_name from public.profiles where id=v_g.leader_id;
  with base as (
    select g.id,(case
      when greatest(0,coalesce(g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(g.guild_xp,0))>=500 then 2
      else 1 end)::integer guild_level,
           greatest(0,coalesce(g.guild_buds,0))::bigint guild_buds,greatest(0,coalesce(g.guild_xp,0))::bigint guild_xp,g.name
    from public.guilds g
  ), ranked as (
    select row_number() over(order by guild_level desc,guild_buds desc,guild_xp desc,lower(name) asc,id asc)::bigint rank_no,id from base
  )
  select rank_no into v_rank from ranked where id=p_guild;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.level desc,x.combat_power desc,x.character_name asc),'[]'::jsonb) into v_top
  from (
    select p.id,p.character_name,p.class_id,p.class_name,greatest(1,coalesce(p.level,1))::integer level,
           greatest(0,coalesce(p.combat_power,0))::integer combat_power,gm.role
    from public.guild_members gm join public.profiles p on p.id=gm.user_id
    where gm.guild_id=p_guild
    order by p.level desc,p.combat_power desc,p.character_name asc limit 3
  ) x;
  return jsonb_build_object('ok',true,'guild',jsonb_build_object(
    'id',v_g.id,'name',v_g.name,'tag',v_g.tag,'leader_id',v_g.leader_id,'leader_name',v_leader_name,
    'description',coalesce(v_g.description,''),'guild_buds',greatest(0,coalesce(v_g.guild_buds,0)),
    'guild_xp',greatest(0,coalesce(v_g.guild_xp,0)),
    'guild_level',(case
      when greatest(0,coalesce(v_g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(v_g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(v_g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(v_g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(v_g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(v_g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(v_g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(v_g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(v_g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(v_g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(v_g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(v_g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(v_g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(v_g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(v_g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(v_g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(v_g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(v_g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(v_g.guild_xp,0))>=500 then 2
      else 1 end),
    'member_count',v_members,'max_members',coalesce(v_g.max_members,20),'rank_no',v_rank),'top_members',v_top);
end;
$$;

create or replace function server1.v8184_hall_guild_profile(p_guild uuid)
returns jsonb
language plpgsql
security invoker
set search_path to 'server1','public','pg_temp'
as $$
declare
  v_g server1.guilds%rowtype;
  v_members integer := 0;
  v_leader_name text := '';
  v_top jsonb := '[]'::jsonb;
  v_rank bigint := null;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_g from server1.guilds where id=p_guild;
  if not found then raise exception 'GUILD_NOT_FOUND'; end if;
  select count(*)::integer into v_members from server1.guild_members where guild_id=p_guild;
  select coalesce(character_name,'') into v_leader_name from server1.profiles where id=v_g.leader_id;
  with base as (
    select g.id,(case
      when greatest(0,coalesce(g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(g.guild_xp,0))>=500 then 2
      else 1 end)::integer guild_level,
           greatest(0,coalesce(g.guild_buds,0))::bigint guild_buds,greatest(0,coalesce(g.guild_xp,0))::bigint guild_xp,g.name
    from server1.guilds g
  ), ranked as (
    select row_number() over(order by guild_level desc,guild_buds desc,guild_xp desc,lower(name) asc,id asc)::bigint rank_no,id from base
  )
  select rank_no into v_rank from ranked where id=p_guild;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.level desc,x.combat_power desc,x.character_name asc),'[]'::jsonb) into v_top
  from (
    select p.id,p.character_name,p.class_id,p.class_name,greatest(1,coalesce(p.level,1))::integer level,
           greatest(0,coalesce(p.combat_power,0))::integer combat_power,gm.role
    from server1.guild_members gm join server1.profiles p on p.id=gm.user_id
    where gm.guild_id=p_guild
    order by p.level desc,p.combat_power desc,p.character_name asc limit 3
  ) x;
  return jsonb_build_object('ok',true,'guild',jsonb_build_object(
    'id',v_g.id,'name',v_g.name,'tag',v_g.tag,'leader_id',v_g.leader_id,'leader_name',v_leader_name,
    'description',coalesce(v_g.description,''),'guild_buds',greatest(0,coalesce(v_g.guild_buds,0)),
    'guild_xp',greatest(0,coalesce(v_g.guild_xp,0)),
    'guild_level',(case
      when greatest(0,coalesce(v_g.guild_xp,0))>=1800000 then 20
      when greatest(0,coalesce(v_g.guild_xp,0))>=900000 then 19
      when greatest(0,coalesce(v_g.guild_xp,0))>=600000 then 18
      when greatest(0,coalesce(v_g.guild_xp,0))>=460000 then 17
      when greatest(0,coalesce(v_g.guild_xp,0))>=355000 then 16
      when greatest(0,coalesce(v_g.guild_xp,0))>=275000 then 15
      when greatest(0,coalesce(v_g.guild_xp,0))>=212000 then 14
      when greatest(0,coalesce(v_g.guild_xp,0))>=162000 then 13
      when greatest(0,coalesce(v_g.guild_xp,0))>=122000 then 12
      when greatest(0,coalesce(v_g.guild_xp,0))>=90000 then 11
      when greatest(0,coalesce(v_g.guild_xp,0))>=65000 then 10
      when greatest(0,coalesce(v_g.guild_xp,0))>=46000 then 9
      when greatest(0,coalesce(v_g.guild_xp,0))>=31500 then 8
      when greatest(0,coalesce(v_g.guild_xp,0))>=20500 then 7
      when greatest(0,coalesce(v_g.guild_xp,0))>=12500 then 6
      when greatest(0,coalesce(v_g.guild_xp,0))>=7000 then 5
      when greatest(0,coalesce(v_g.guild_xp,0))>=3500 then 4
      when greatest(0,coalesce(v_g.guild_xp,0))>=1500 then 3
      when greatest(0,coalesce(v_g.guild_xp,0))>=500 then 2
      else 1 end),
    'member_count',v_members,'max_members',coalesce(v_g.max_members,20),'rank_no',v_rank),'top_members',v_top);
end;
$$;

create or replace function public.v8184_set_guild_description(p_description text)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_desc text := left(regexp_replace(trim(coalesce(p_description,'')), E'[\r\n\t]+', ' ', 'g'),300);
  v_id uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  update public.guilds set description=v_desc where leader_id=v_uid returning id into v_id;
  if v_id is null then raise exception 'GUILD_LEADER_REQUIRED'; end if;
  return jsonb_build_object('ok',true,'guild_id',v_id,'description',v_desc);
end;
$$;

create or replace function server1.v8184_set_guild_description(p_description text)
returns jsonb language plpgsql security definer set search_path to 'server1','public','pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_desc text := left(regexp_replace(trim(coalesce(p_description,'')), E'[\r\n\t]+', ' ', 'g'),300);
  v_id uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  update server1.guilds set description=v_desc where leader_id=v_uid returning id into v_id;
  if v_id is null then raise exception 'GUILD_LEADER_REQUIRED'; end if;
  return jsonb_build_object('ok',true,'guild_id',v_id,'description',v_desc);
end;
$$;

revoke all on function public.v8184_hall_guild_ranking(integer,integer) from public,anon;
revoke all on function public.v8184_hall_guild_profile(uuid) from public,anon;
revoke all on function public.v8184_set_guild_description(text) from public,anon;
grant execute on function public.v8184_hall_guild_ranking(integer,integer) to authenticated;
grant execute on function public.v8184_hall_guild_profile(uuid) to authenticated;
grant execute on function public.v8184_set_guild_description(text) to authenticated;

revoke all on function server1.v8184_hall_guild_ranking(integer,integer) from public,anon;
revoke all on function server1.v8184_hall_guild_profile(uuid) from public,anon;
revoke all on function server1.v8184_set_guild_description(text) from public,anon;
grant execute on function server1.v8184_hall_guild_ranking(integer,integer) to authenticated;
grant execute on function server1.v8184_hall_guild_profile(uuid) to authenticated;
grant execute on function server1.v8184_set_guild_description(text) to authenticated;
