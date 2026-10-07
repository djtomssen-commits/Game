-- Grow Legends V8.219 — remove public Grow Cup test mode.
delete from recovery_private.v8210_growcup_ledger
where action like 'test_start%';

delete from recovery_private.v8210_growcup_runs
where test_mode=true;

create or replace function public.v8210_growcup_state()
returns jsonb
language plpgsql security definer
set search_path to 'public','recovery_private','pg_temp'
as $f$
declare
 u uuid:=auth.uid(); active boolean; ev date; r jsonb; w recovery_private.v8198_enchant_wallet%rowtype;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 active:=public.v7102_auto_weekend_event_active('growcup',now());
 ev:=recovery_private.v8210_event_key(now());

 if not exists(select 1 from recovery_private.v8210_growcup_runs where user_id=u and event_key=ev and rules_version=3) then
   select event_key into ev from recovery_private.v8210_growcup_runs
   where user_id=u and rules_version=3 and status='active' and not test_mode
   order by started_at desc limit 1;
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
$f$;

drop function if exists public.v8213_growcup_test_start(text);
drop function if exists recovery_private.v8213_is_beta_tester(uuid);
