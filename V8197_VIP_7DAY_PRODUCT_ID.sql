-- V8.197 — align 7-day VIP Google Play product ID with Play Console: vip_7day
-- Keeps vip_7d as a legacy-compatible alias.

begin;

alter table recovery_private.v8195_google_play_vip_purchases
  drop constraint if exists v8195_google_play_vip_purchases_product_id_check;

alter table recovery_private.v8195_google_play_vip_purchases
  add constraint v8195_google_play_vip_purchases_product_id_check
  check (product_id = any(array['vip_7day'::text,'vip_7d'::text,'vip_14d'::text,'vip_30d'::text]));

CREATE OR REPLACE FUNCTION public.v8195_credit_google_play_vip_purchase(p_user_id uuid, p_purchase_token text, p_product_id text, p_order_id text, p_google_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  days_add integer;
  existing recovery_private.v8195_google_play_vip_purchases%rowtype;
  st recovery_private.v8195_vip_state%rowtype;
  inserted boolean:=false;
begin
  if p_user_id is null then raise exception 'user_id fehlt'; end if;
  if coalesce(length(trim(p_purchase_token)),0)<8 then raise exception 'purchase_token ungültig'; end if;

  days_add:=case p_product_id
    when 'vip_7day' then 7
    when 'vip_7d' then 7
    when 'vip_14d' then 14
    when 'vip_30d' then 30
    else null
  end;

  if days_add is null then raise exception 'Unbekannte VIP Produkt-ID: %',p_product_id; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_purchase_token,0));

  select * into existing
  from recovery_private.v8195_google_play_vip_purchases
  where purchase_token=p_purchase_token;

  if found then
    if existing.user_id<>p_user_id or existing.product_id<>p_product_id then
      raise exception 'Kauftoken wurde bereits einem anderen Account/Produkt zugeordnet';
    end if;
  else
    insert into recovery_private.v8195_google_play_vip_purchases(
      purchase_token,user_id,product_id,order_id,google_payload,days_added
    ) values(
      p_purchase_token,p_user_id,p_product_id,nullif(p_order_id,''),coalesce(p_google_payload,'{}'::jsonb),days_add
    );
    inserted:=true;
  end if;

  if inserted then
    insert into recovery_private.v8195_vip_state(user_id,vip_until,last_product_id,public_visible,revision,updated_at)
    values(p_user_id,now()+make_interval(days=>days_add),p_product_id,true,1,now())
    on conflict(user_id) do update
    set vip_until=greatest(coalesce(recovery_private.v8195_vip_state.vip_until,now()),now())+make_interval(days=>days_add),
        last_product_id=p_product_id,
        revision=recovery_private.v8195_vip_state.revision+1,
        updated_at=now();
  end if;

  select * into st from recovery_private.v8195_vip_state where user_id=p_user_id;

  update public.profiles p
  set vip_until=st.vip_until,
      vip_visible=(st.public_visible and st.vip_until>now()),
      updated_at=now()
  where p.id=p_user_id;

  return jsonb_build_object(
    'ok',true,'server','beta','alreadyProcessed',not inserted,'productId',p_product_id,
    'vipDaysAdded',case when inserted then days_add else 0 end,
    'vipUntil',st.vip_until,
    'active',st.vip_until>now()
  );
end;
$function$;

revoke all on function public.v8195_credit_google_play_vip_purchase(uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.v8195_credit_google_play_vip_purchase(uuid,text,text,text,jsonb) to service_role;

commit;
