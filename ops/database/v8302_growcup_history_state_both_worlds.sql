-- V8.302: retain access to last completed Grow Cup after Thursday on both worlds.
-- Preserve Thursday's new-run lobby, user ownership, rewards, and function privileges.

CREATE OR REPLACE FUNCTION public.v8210_growcup_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); active boolean; ev date; r jsonb; w recovery_private.v8198_enchant_wallet%rowtype;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 active:=public.v7102_auto_weekend_event_active('growcup',now());
 ev:=recovery_private.v8210_event_key(now());

 if not exists(select 1 from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev and rules_version=3) and not active then
   select event_key into ev from recovery_private.v8210_growcup_runs
   where user_id=u and rules_version=3 and not test_mode
   order by event_key desc limit 1;
 end if;
 if ev is null and active then ev:=recovery_private.v8210_event_key(now()); end if;
 if ev is not null then r:=recovery_private.v8210_public_run(u,ev); else r:=null; end if;

 insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
 select * into w from recovery_private.v8198_enchant_wallet where user_id=u;
 return jsonb_build_object(
   'ok',true,'active',active,
   'next_event',recovery_private.v8210_next_growcup(now()),
   'event_key',ev,
   'cup_seed',recovery_private.v8210_seed_name(coalesce(ev,recovery_private.v8210_event_key(now()))),
   'runes',w.runes,'rune_shards',w.rune_shards,'run',r,'server_now',now()
 );
end
$function$;

CREATE OR REPLACE FUNCTION server1.v8210_growcup_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'server1_private', 'pg_temp'
AS $function$
declare
 u uuid:=auth.uid(); active boolean; ev date; r jsonb; w server1_private.v8198_enchant_wallet%rowtype;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 active:=server1.v7102_auto_weekend_event_active('growcup',now());
 ev:=server1_private.v8210_event_key(now());

 if not exists(select 1 from server1_private.v8210_growcup_runs where user_id=u and event_key=ev and rules_version=3) and not active then
   select event_key into ev from server1_private.v8210_growcup_runs
   where user_id=u and rules_version=3 and not test_mode
   order by event_key desc limit 1;
 end if;
 if ev is null and active then ev:=server1_private.v8210_event_key(now()); end if;
 if ev is not null then r:=server1_private.v8210_public_run(u,ev); else r:=null; end if;

 insert into server1_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
 select * into w from server1_private.v8198_enchant_wallet where user_id=u;
 return jsonb_build_object(
   'ok',true,'active',active,
   'next_event',server1_private.v8210_next_growcup(now()),
   'event_key',ev,
   'cup_seed',server1_private.v8210_seed_name(coalesce(ev,server1_private.v8210_event_key(now()))),
   'runes',w.runes,'rune_shards',w.rune_shards,'run',r,'server_now',now()
 );
end
$function$;

