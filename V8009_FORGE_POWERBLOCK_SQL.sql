-- V8.009 Forge Powerblock
-- Deployed 2026-10-01 to Grow Legends Supabase project.
-- Purpose: idempotent Beta Nebelschmied rerolls keyed by client request ID.

create or replace function public.v8009_nebelforge_reroll(
  p_item_id text,
  p_focus_stat text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  u uuid:=auth.uid();
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  existing public.player_item_events%rowtype;
  inserted boolean:=false;
  r jsonb;
  st public.player_item_state%rowtype;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  if length(btrim(coalesce(p_item_id,'')))<1 then raise exception 'ITEM_ID_REQUIRED'; end if;

  insert into public.player_item_events(
    user_id,event_id,source,action,added_count,removed_count,changed_count,
    fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
  )
  select
    u,req,'v8009_nebelforge','reforge_request',0,0,0,
    coalesce(s.fragments,0),coalesce(s.fragments,0),0,
    'item:'||left(btrim(p_item_id),160),'pending',coalesce(s.revision,0)
  from public.player_item_state s
  where s.user_id=u
  on conflict(user_id,event_id) do nothing;

  get diagnostics inserted = row_count;
  if not inserted then
    select * into existing
    from public.player_item_events
    where user_id=u and event_id=req;

    return jsonb_build_object(
      'ok',true,
      'duplicate',true,
      'itemId',btrim(p_item_id),
      'cost',greatest(0,coalesce(existing.sale_value,0)),
      'requestId',req
    );
  end if;

  r:=public.v7240_nebelforge_reroll(p_item_id,p_focus_stat);

  select * into st from public.player_item_state where user_id=u;

  update public.player_item_events
  set action='reforge',
      changed_count=1,
      fragments_after=coalesce(st.fragments,fragments_before),
      sale_value=greatest(0,coalesce((r->>'cost')::bigint,0)),
      decision='accepted',
      revision_after=coalesce(st.revision,revision_after)
  where user_id=u and event_id=req;

  return r || jsonb_build_object('duplicate',false,'requestId',req);
end
$function$;

revoke all on function public.v8009_nebelforge_reroll(text,text,text) from public, anon;
grant execute on function public.v8009_nebelforge_reroll(text,text,text) to authenticated, service_role;
