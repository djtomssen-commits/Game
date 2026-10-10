-- V8.356 · 2026-10-10 · Grow Legends Server 1 production fix
-- Live migration: v8356_server1_grow_dealer_unique_trade_ledger_refs (already applied)
-- Fix: different daily purchases of the same offer previously reused source_ref
-- 'grow_dealer:gold' / 'grow_dealer:fragments' / ... across days; unique positive
-- ledger index correctly rejected any second Goldbündel claim for that user.
-- Use offer + original caller request ID as source_ref for all five event paths,
-- preserving event_id, verified ledger, atomic reward/bag/claimed updates,
-- one-per-day eligibility, and exact-request duplicate detection.
-- KEEP the server1.player_gold_events unique (user_id, source_ref) index.
-- Does NOT backfill failed purchases: failed transactions roll back atomically.
-- Changes server1.v7071_buy_grow_dealer only; public (Beta) untouched.
CREATE OR REPLACE FUNCTION server1.v7071_buy_grow_dealer(p_offer_id text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'public', 'server1_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  oid text:=lower(btrim(coalesce(p_offer_id,'')));
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  oldev server1_private.v7071_grow_dealer_events%rowtype;
  d server1_private.v7071_grow_dealer_state%rowtype;
  g server1.player_grow_state%rowtype;
  t server1.player_progress_trusted%rowtype;
  i server1.player_item_state%rowtype;
  ss server1.player_seed_state%rowtype;
  offer jsonb:=null;
  reward jsonb;
  rtype text;
  amount bigint:=0;
  cost integer:=0;
  minq text;
  need_seed text:=null;
  rec record;
  score integer:=0;
  ids text[]:=array[]::text[];
  consumed jsonb:='[]'::jsonb;
  newbag jsonb;
  old_gold bigint;
  old_frag bigint;
  old_time integer;
  mat jsonb:=null;
  item jsonb:=null;
  lvl integer:=1;
  event_rev bigint;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if not server1_private.v7071_stage_enabled(u) then raise exception 'V7071_STAGE_NOT_ENABLED'; end if;
  if oid not in ('gold','fragments','scroll','gem','time','item') then
    return jsonb_build_object('ok',false,'reason','INVALID_OFFER');
  end if;
  if length(req)<8 then raise exception 'REQUEST_ID_REQUIRED'; end if;

  select * into oldev
  from server1_private.v7071_grow_dealer_events
  where user_id=u and request_id=req;
  if found then
    return server1.v7071_grow_dealer_state()
      ||jsonb_build_object('duplicate',true,'reward',oldev.reward,'consumed',oldev.consumed);
  end if;

  select * into g from server1.player_grow_state where user_id=u for update;
  if not found or not g.guard_enabled then raise exception 'GROW_GUARD_NOT_ENABLED'; end if;
  select * into ss from server1.player_seed_state where user_id=u for update;
  if not found or not ss.guard_enabled then raise exception 'SEED_GUARD_NOT_ENABLED'; end if;
  select * into t from server1.player_progress_trusted where user_id=u for update;
  if not found or not t.gold_guard_enabled then raise exception 'GOLD_GUARD_NOT_ENABLED'; end if;
  select * into i from server1.player_item_state where user_id=u for update;
  if not found or not i.guard_enabled then raise exception 'ITEM_GUARD_NOT_ENABLED'; end if;

  d:=server1_private.v7071_ensure_dealer_state(u);
  select * into d from server1_private.v7071_grow_dealer_state where user_id=u for update;

  select x.value into offer
  from jsonb_array_elements(d.offers) x(value)
  where x.value->>'id'=oid
  limit 1;
  if offer is null then return jsonb_build_object('ok',false,'reason','OFFER_NOT_FOUND'); end if;
  if d.claimed ? oid then return jsonb_build_object('ok',false,'reason','ALREADY_CLAIMED'); end if;

  cost:=greatest(1,coalesce((offer->>'cost')::integer,1));
  minq:=coalesce(offer->>'minQ','C');
  need_seed:=nullif(offer->>'seed','');

  for rec in
    select x.value as b,x.ord,
           server1_private.v7071_bloom_value(x.value) as val
    from jsonb_array_elements(coalesce(g.bag,'[]'::jsonb)) with ordinality x(value,ord)
    where server1_private.v7071_bloom_rank(x.value->>'quality')
            >= server1_private.v7071_bloom_rank(minq)
      and (need_seed is null or x.value->>'seed'=need_seed)
    order by
      coalesce((x.value->>'refined')::boolean,false) desc,
      server1_private.v7071_bloom_value(x.value) asc,
      x.ord asc
  loop
    exit when score>=cost;
    if coalesce(rec.b->>'id','')='' then continue; end if;
    ids:=array_append(ids,rec.b->>'id');
    consumed:=consumed||jsonb_build_array(rec.b);
    score:=score+rec.val;
  end loop;

  if score<cost then
    return jsonb_build_object(
      'ok',false,'reason','INSUFFICIENT_BLOOM_VALUE',
      'have',score,'required',cost
    );
  end if;

  select coalesce(jsonb_agg(x.value order by x.ord),'[]'::jsonb)
    into newbag
  from jsonb_array_elements(coalesce(g.bag,'[]'::jsonb)) with ordinality x(value,ord)
  where not (coalesce(x.value->>'id','')=any(ids));

  reward:=offer->'reward';
  rtype:=lower(coalesce(reward->>'type',''));
  amount:=greatest(0,coalesce((reward->>'amount')::bigint,0));
  old_gold:=t.gold; old_frag:=i.fragments; old_time:=ss.time_seeds;

  if rtype='gold' then
    update server1.player_progress_trusted
    set gold=gold+amount,gold_claimed_at=now(),
        source_version='v7071-grow-dealer',updated_at=now()
    where user_id=u returning * into t;

    insert into server1.player_gold_events(
      user_id,event_id,source,requested_delta,applied_delta,
      balance_before,balance_after,source_ref,decision,verified
    ) values(
      u,'gold_'||req,'grow_dealer',amount,amount,
      old_gold,t.gold,'grow_dealer:'||oid||':'||req,'verified_server_grow_dealer_v7071',true
    );

  elsif rtype='fragments' then
    update server1.player_item_state
    set fragments=fragments+amount,revision=revision+1,updated_at=now()
    where user_id=u returning * into i;

    insert into server1.player_item_events(
      user_id,event_id,source,action,added_count,removed_count,changed_count,
      fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
    ) values(
      u,'item_'||req,'grow_dealer','server_grow_dealer_fragments',
      0,0,0,old_frag,i.fragments,0,'grow_dealer:'||oid||':'||req,'accepted',i.revision
    );

  elsif rtype='time' then
    update server1.player_seed_state
    set time_seeds=time_seeds+amount::integer,
        revision=revision+1,updated_at=now()
    where user_id=u returning * into ss;

    insert into server1.player_seed_events(
      user_id,event_id,source,grow_added,grow_removed,time_delta,
      plants_added,plants_removed,source_ref,decision,revision_after,details
    ) values(
      u,'seed_'||req,'grow_dealer',0,0,amount::integer,0,0,
      'grow_dealer:'||oid||':'||req,'accepted',ss.revision,jsonb_build_object('offer',oid)
    );

  elsif rtype in ('gem','scroll') then
    mat:=server1_private.v7071_make_dealer_material(u,rtype);
    update server1.player_item_state
    set materials=materials||jsonb_build_array(mat),
        revision=revision+1,updated_at=now()
    where user_id=u returning * into i;

    insert into server1.player_item_events(
      user_id,event_id,source,action,added_count,removed_count,changed_count,
      fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
    ) values(
      u,'item_'||req,'grow_dealer','server_grow_dealer_material',
      1,0,0,i.fragments,i.fragments,0,'grow_dealer:'||oid||':'||req,'accepted',i.revision
    );
    reward:=reward||jsonb_build_object('material',mat);

  elsif rtype='item' then
    item:=server1_private.v7071_make_dealer_item(u,'grow_dealer:'||req);
    if jsonb_array_length(i.inventory)>=250 then
      return jsonb_build_object('ok',false,'reason','INVENTORY_CAP_REACHED');
    end if;
    update server1.player_item_state
    set inventory=inventory||jsonb_build_array(item),
        revision=revision+1,updated_at=now()
    where user_id=u returning * into i;

    insert into server1.player_item_events(
      user_id,event_id,source,action,added_count,removed_count,changed_count,
      fragments_before,fragments_after,sale_value,source_ref,decision,revision_after
    ) values(
      u,'item_'||req,'grow_dealer','server_grow_dealer_item',
      1,0,0,i.fragments,i.fragments,0,'grow_dealer:'||oid||':'||req,'accepted',i.revision
    );
    perform server1.v6358_refresh_combat_power_for(u);
    select * into i from server1.player_item_state where user_id=u;
    reward:=reward||jsonb_build_object('item',item);
  else
    raise exception 'INVALID_DEALER_REWARD';
  end if;

  update server1.player_grow_state
  set bag=newbag,revision=revision+1,updated_at=now()
  where user_id=u returning * into g;

  d.claimed:=jsonb_set(
    coalesce(d.claimed,'{}'::jsonb),array[oid],
    to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint),true
  );
  update server1_private.v7071_grow_dealer_state
  set claimed=d.claimed,revision=revision+1,updated_at=now()
  where user_id=u returning * into d;

  insert into server1_private.v7071_grow_dealer_events(
    user_id,request_id,offer_id,reward,consumed
  ) values(u,req,oid,reward,consumed);

  perform server1_private.v7071_sync_dealer_save(u);

  select * into t from server1.player_progress_trusted where user_id=u;
  select * into i from server1.player_item_state where user_id=u;
  select * into ss from server1.player_seed_state where user_id=u;

  return jsonb_build_object(
    'ok',true,'duplicate',false,'offer_id',oid,
    'reward',reward,'consumed',consumed,'consumed_value',score,
    'dealer',jsonb_build_object(
      'day',to_char(d.day_key,'YYYY-MM-DD'),'offers',d.offers,
      'claimed',d.claimed,'drying',d.drying,'revision',d.revision
    ),
    'bag',g.bag,'active',g.active,
    'gold',t.gold,'fragments',i.fragments,'time_seeds',ss.time_seeds,
    'inventory',i.inventory,'materials',i.materials,
    'item_revision',i.revision,'grow_revision',g.revision
  );
end;
$function$

