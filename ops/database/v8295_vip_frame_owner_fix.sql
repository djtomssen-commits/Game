-- V8.295: VIP crown missing from Server1 frame selection after verified Play purchase.
-- ROOT CAUSE: Server1 authenticated v7137_avatar_frame_state() called
-- server1.v7137_frame_state_for(uid), an obsolete pre-VIP owner. This returned
-- frame_count 0 and never appended vip_crown, despite canonical private VIP
-- state and is_active_for(uid) being correct. Old logic could even unequip it.
--
-- Directly replace the original v7137_frame_state_for code with a single
-- canonical delegation to server1_private.v7137_frame_state_for (already
-- the owner used by set_avatar_frame). Never let authenticated clients
-- invoke the parameterized internal helper with arbitrary UIDs.
--
-- V8.295 also counts temporary VIP_crown as an owned frame on both servers.
-- No new balances/items/VIP durations are invented or credited.
CREATE OR REPLACE FUNCTION server1.v7137_frame_state_for(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'server1_private', 'pg_temp'
AS $function$
BEGIN
  IF p_uid IS NULL THEN RAISE EXCEPTION 'UID_REQUIRED'; END IF;
  -- V8.295: original server1 frame owner was never updated for VIP:
  -- no VIP crown, frame_count zero, and it incorrectly stripped equipped VIP
  -- crowns. Delegate to the actual server1-private canonical owner that
  -- knows VIP entitlement and owns all frames.
  RETURN server1_private.v7137_frame_state_for(p_uid);
END;
$function$;
REVOKE ALL ON FUNCTION server1.v7137_frame_state_for(uuid) FROM PUBLIC,anon,authenticated;

-- Canonical private Server1 owner (shown for deployment reproducibility)
CREATE OR REPLACE FUNCTION server1_private.v7137_frame_state_for(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'server1', 'server1_private', 'pg_temp'
AS $function$
declare
  st server1.player_avatar_frames_v7137%rowtype;
  owned text[]:=array[]::text[];
  referral boolean:=false;
  frames jsonb:='[]'::jsonb;
  bal bigint:=0;
  frame_count integer:=0;
  vip_active boolean:=false;
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  insert into server1.player_avatar_frames_v7137(user_id)
  values(p_uid)
  on conflict(user_id) do nothing;

  select * into st
  from server1.player_avatar_frames_v7137
  where user_id=p_uid
  for update;

  select coalesce(r.frame_unlocked,false)
    into referral
  from server1.player_referral_state_v7129 r
  where r.user_id=p_uid;
  referral:=coalesce(referral,false);

  vip_active:=server1_private.v8195_is_active_for(p_uid);

  select coalesce(array_agg(distinct x order by x),array[]::text[])
    into owned
  from unnest(
    coalesce(st.unlocked,array[]::text[])
    || case when referral then array['referral_legend']::text[] else array[]::text[] end
  ) q(x);

  if st.active_frame_id is not null
     and not (st.active_frame_id=any(owned))
     and not (st.active_frame_id='vip_crown' and vip_active) then
    st.active_frame_id:=null;
    update server1.player_avatar_frames_v7137
    set active_frame_id=null, revision=revision+1, updated_at=now()
    where user_id=p_uid;
  end if;

  update server1.profiles
  set avatar_frame_id=st.active_frame_id, updated_at=now()
  where id=p_uid
    and avatar_frame_id is distinct from st.active_frame_id;

  select greatest(0,coalesce(t.harz_taler,0))
    into bal
  from server1.player_progress_trusted t
  where t.user_id=p_uid;
  bal:=coalesce(bal,0);

  frame_count:=coalesce(cardinality(owned),0)+(case when vip_active then 1 else 0 end);

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',c.id,
      'name',c.label,
      'price',c.price,
      'effect',c.effect,
      'source',c.source,
      'owned',c.id=any(owned),
      'active',c.id=st.active_frame_id
    ) order by c.sort_order
  ),'[]'::jsonb)
  into frames
  from server1_private.v7137_frame_catalog() c;

  if vip_active then
    frames:=frames||jsonb_build_array(jsonb_build_object(
      'id','vip_crown',
      'name','VIP-Kronenrahmen',
      'price',0,
      'effect',true,
      'source','vip',
      'owned',true,
      'active',st.active_frame_id='vip_crown',
      'temporary',true
    ));
  end if;

  return jsonb_build_object(
    'ok',true,
    'active_frame_id',st.active_frame_id,
    'unlocked',to_jsonb(owned),
    'frame_count',frame_count,
    'purchased_count',greatest(0,coalesce(st.purchased_count,0)),
    'harz',bal,
    'frames',frames,
    'vip_active',vip_active,
    'revision',st.revision
  );
end;
$function$;

-- Canonical private Beta owner (frame count parity)
CREATE OR REPLACE FUNCTION recovery_private.v7137_frame_state_for(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  st public.player_avatar_frames_v7137%rowtype;
  owned text[]:=array[]::text[];
  referral boolean:=false;
  frames jsonb:='[]'::jsonb;
  bal bigint:=0;
  frame_count integer:=0;
  vip_active boolean:=false;
begin
  if p_uid is null then raise exception 'UID_REQUIRED'; end if;

  insert into public.player_avatar_frames_v7137(user_id)
  values(p_uid)
  on conflict(user_id) do nothing;

  select * into st
  from public.player_avatar_frames_v7137
  where user_id=p_uid
  for update;

  select coalesce(r.frame_unlocked,false)
    into referral
  from public.player_referral_state_v7129 r
  where r.user_id=p_uid;
  referral:=coalesce(referral,false);

  vip_active:=recovery_private.v8195_is_active_for(p_uid);

  select coalesce(array_agg(distinct x order by x),array[]::text[])
    into owned
  from unnest(
    coalesce(st.unlocked,array[]::text[])
    || case when referral then array['referral_legend']::text[] else array[]::text[] end
  ) q(x);

  if st.active_frame_id is not null
     and not (st.active_frame_id=any(owned))
     and not (st.active_frame_id='vip_crown' and vip_active) then
    st.active_frame_id:=null;
    update public.player_avatar_frames_v7137
    set active_frame_id=null, revision=revision+1, updated_at=now()
    where user_id=p_uid;
  end if;

  update public.profiles
  set avatar_frame_id=st.active_frame_id, updated_at=now()
  where id=p_uid
    and avatar_frame_id is distinct from st.active_frame_id;

  select greatest(0,coalesce(t.harz_taler,0))
    into bal
  from public.player_progress_trusted t
  where t.user_id=p_uid;
  bal:=coalesce(bal,0);

  frame_count:=coalesce(cardinality(owned),0)+(case when vip_active then 1 else 0 end);

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',c.id,
      'name',c.label,
      'price',c.price,
      'effect',c.effect,
      'source',c.source,
      'owned',c.id=any(owned),
      'active',c.id=st.active_frame_id
    ) order by c.sort_order
  ),'[]'::jsonb)
  into frames
  from recovery_private.v7137_frame_catalog() c;

  if vip_active then
    frames:=frames||jsonb_build_array(jsonb_build_object(
      'id','vip_crown',
      'name','VIP-Kronenrahmen',
      'price',0,
      'effect',true,
      'source','vip',
      'owned',true,
      'active',st.active_frame_id='vip_crown',
      'temporary',true
    ));
  end if;

  return jsonb_build_object(
    'ok',true,
    'active_frame_id',st.active_frame_id,
    'unlocked',to_jsonb(owned),
    'frame_count',frame_count,
    'purchased_count',greatest(0,coalesce(st.purchased_count,0)),
    'harz',bal,
    'frames',frames,
    'vip_active',vip_active,
    'revision',st.revision
  );
end;
$function$;
