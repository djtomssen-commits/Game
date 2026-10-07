-- Grow Legends V8.202 — Runenjagd Legendary-Style Rebuild (Beta)
-- Snapshot der angewendeten Migration v8202_runehunt_legendary_style_rebuild.

create table if not exists recovery_private.v8202_runehunt_runs(
  user_id uuid primary key references auth.users(id) on delete cascade,
  event_key date not null,
  run_id uuid not null,
  status text not null check (status in ('active','downed','completed')),
  room_no smallint not null default 1 check (room_no between 1 and 100),
  hp smallint not null default 100 check (hp between 0 and 100),
  keys smallint not null default 0 check (keys between 0 and 99),
  dust integer not null default 0 check (dust >= 0),
  blessings jsonb not null default '[]'::jsonb,
  curses jsonb not null default '[]'::jsonb,
  pacts jsonb not null default '[]'::jsonb,
  doors jsonb not null default '[]'::jsonb,
  encounter jsonb,
  revive_at timestamptz,
  last_result jsonb,
  revision bigint not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table recovery_private.v8202_runehunt_runs enable row level security;
revoke all on recovery_private.v8202_runehunt_runs from public, anon, authenticated;

create table if not exists recovery_private.v8202_runehunt_ledger(
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  run_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table recovery_private.v8202_runehunt_ledger enable row level security;
revoke all on recovery_private.v8202_runehunt_ledger from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.v8202_runehunt_action(p_action text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  act text:=lower(btrim(coalesce(p_action,'')));
  old recovery_private.v8202_runehunt_ledger%rowtype;
  r recovery_private.v8202_runehunt_runs%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  e jsonb;
  typ text;
  hp2 integer;
  keys2 integer;
  dust2 integer;
  dmg integer:=0;
  gain integer:=0;
  key_gain integer:=0;
  flee_chance numeric:=0.55;
  dust_mult numeric:=1;
  dmg_mult numeric:=1;
  heal_mult numeric:=1;
  title text;
  body text;
  success boolean:=true;
  out jsonb;
  effect_id text;
  pact_id text;
  shard_reward integer:=0;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  select * into old from recovery_private.v8202_runehunt_ledger where user_id=u and request_id=req;
  if found then return old.payload; end if;

  select * into r from recovery_private.v8202_runehunt_runs where user_id=u for update;
  if not found or r.status<>'active' or r.encounter is null then
    return jsonb_build_object('ok',false,'reason','NO_ACTIVE_ENCOUNTER','state',recovery_private.v8202_public_state(u));
  end if;
  e:=r.encounter; typ:=e->>'type'; hp2:=r.hp; keys2:=r.keys; dust2:=r.dust;

  if recovery_private.v8202_has_effect(r.blessings,'ward') then dmg_mult:=dmg_mult*(case when recovery_private.v8202_effect_tier(r.blessings,'ward')=2 then 0.75 else 0.85 end); end if;
  if recovery_private.v8202_has_effect(r.curses,'fracture') then dmg_mult:=dmg_mult*(case when recovery_private.v8202_effect_tier(r.curses,'fracture')=2 then 1.25 else 1.15 end); end if;
  if recovery_private.v8202_has_effect(r.blessings,'fortune') then dust_mult:=dust_mult*(case when recovery_private.v8202_effect_tier(r.blessings,'fortune')=2 then 1.40 else 1.25 end); end if;
  if recovery_private.v8202_has_effect(r.curses,'hunger') then heal_mult:=heal_mult*(case when recovery_private.v8202_effect_tier(r.curses,'hunger')=2 then 0.55 else 0.70 end); end if;
  if recovery_private.v8202_has_effect(r.blessings,'step') then flee_chance:=flee_chance+(case when recovery_private.v8202_effect_tier(r.blessings,'step')=2 then 0.30 else 0.20 end); end if;

  for pact_id in select x->>'id' from jsonb_array_elements(r.pacts) x loop
    if pact_id='greed' then dust_mult:=dust_mult*1.20;dmg_mult:=dmg_mult*1.10;
    elsif pact_id='guardian' then dmg_mult:=dmg_mult*0.85;dust_mult:=dust_mult*0.90;
    elsif pact_id='locksmith' then heal_mult:=heal_mult*0.90;
    end if;
  end loop;

  if typ in ('monster','miniboss','finalboss') then
    if act not in ('fight','flee') then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    if typ in ('miniboss','finalboss') and act='flee' then return jsonb_build_object('ok',false,'reason','BOSS_CANNOT_FLEE','state',recovery_private.v8202_public_state(u)); end if;

    if typ='monster' and act='flee' then
      if random()<least(0.90,flee_chance) then dmg:=0;title:='Flucht gelungen';body:='Du verschwindest durch die nächste Pforte, bevor die Kreatur dich erreicht.';
      else dmg:=greatest(1,round((5+floor(random()*7))*dmg_mult)::int);title:='Flucht mit Kratzern';body:='Du entkommst, aber nicht ohne Schaden.';success:=false;
      end if;
      hp2:=greatest(0,hp2-dmg);
      update recovery_private.v8202_runehunt_runs set hp=hp2,encounter=null,last_result=jsonb_build_object('kind','flee','success',success,'title',title,'text',body,'damage',dmg),revision=revision+1,updated_at=now() where user_id=u;
      if hp2=0 then
        update recovery_private.v8202_runehunt_runs set status='downed',revive_at=now()+interval '60 minutes' where user_id=u;
      else
        perform recovery_private.v8202_advance(u);
      end if;
    else
      if typ='monster' then dmg:=round((7+floor(random()*9)+(r.room_no/18))*dmg_mult)::int;gain:=round((1+floor(random()*3))*dust_mult)::int;
      elsif typ='miniboss' then dmg:=round((18+(r.room_no/12))*dmg_mult)::int;gain:=round(7*dust_mult)::int;
      else dmg:=round(32*dmg_mult)::int;gain:=round(12*dust_mult)::int;
      end if;
      hp2:=greatest(0,hp2-dmg);
      if hp2=0 then
        update recovery_private.v8202_runehunt_runs set hp=0,status='downed',revive_at=now()+interval '60 minutes',
          last_result=jsonb_build_object('kind','combat','success',false,'title','Du gehst zu Boden','text','Die Runen brauchen 60 Minuten, um dein Runenleben wiederherzustellen.','damage',dmg),
          revision=revision+1,updated_at=now() where user_id=u;
      elsif typ='finalboss' then
        shard_reward:=least(6,greatest(2,floor((dust2+gain)/25.0)::int));
        insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
        update recovery_private.v8198_enchant_wallet
        set runes=runes+1,rune_shards=rune_shards+shard_reward,revision=revision+1,updated_at=now()
        where user_id=u returning * into w;
        update recovery_private.v8202_runehunt_runs
        set hp=hp2,dust=dust+gain,status='completed',encounter=null,doors='[]'::jsonb,
          last_result=jsonb_build_object('kind','complete','success',true,'title','Der Runenkern gehört dir','text','Der Hüter fällt. Eine vollständige Verzauberungsrune löst sich aus dem Kern.','damage',dmg,'dust_gain',gain,'runes_awarded',1,'shards_awarded',shard_reward),
          revision=revision+1,updated_at=now()
        where user_id=u;
      elsif typ='miniboss' then
        update recovery_private.v8202_runehunt_runs
        set hp=hp2,dust=dust+gain,encounter=jsonb_build_object(
          'type','pact','title','Drei Runenpakte',
          'text','Der Zwischenwächter zerfällt. Wähle einen Pakt, der bis zum Ende dieses Runs gilt.',
          'options',jsonb_build_array(
            jsonb_build_object('id','greed','label','Pakt der Gier','text','+20 % Runenstaub, aber +10 % erlittener Schaden.'),
            jsonb_build_object('id','guardian','label','Pakt des Wächters','text','-15 % Schaden, aber -10 % Runenstaub.'),
            jsonb_build_object('id','locksmith','label','Pakt des Schlüssels','text','Höhere Schlüsselchance, aber Heilung wirkt etwas schwächer.')
          )
        ),
        last_result=jsonb_build_object('kind','combat','success',true,'title','Zwischenwächter besiegt','text','Die drei Pakte erscheinen.','damage',dmg,'dust_gain',gain),
        revision=revision+1,updated_at=now()
        where user_id=u;
      else
        if random()<(0.24 + case when exists(select 1 from jsonb_array_elements(r.pacts) x where x->>'id'='locksmith') then 0.20 else 0 end) then key_gain:=1; end if;
        update recovery_private.v8202_runehunt_runs set hp=hp2,dust=dust+gain,keys=keys+key_gain,encounter=null,
          last_result=jsonb_build_object('kind','combat','success',true,'title','Runenwächter besiegt','text','Der Weg ist frei.','damage',dmg,'dust_gain',gain,'keys_gain',key_gain),
          revision=revision+1,updated_at=now() where user_id=u;
        perform recovery_private.v8202_advance(u);
      end if;
    end if;

  elsif typ='pact' then
    if act not in ('greed','guardian','locksmith') then return jsonb_build_object('ok',false,'reason','INVALID_PACT','state',recovery_private.v8202_public_state(u)); end if;
    if jsonb_array_length(r.pacts)>=3 then
      update recovery_private.v8202_runehunt_runs set pacts=(select coalesce(jsonb_agg(value order by ord),'[]'::jsonb) from jsonb_array_elements(pacts) with ordinality q(value,ord) where ord>1) where user_id=u;
    end if;
    update recovery_private.v8202_runehunt_runs
    set pacts=pacts||jsonb_build_array(jsonb_build_object('id',act,'label',case act when 'greed' then 'Pakt der Gier' when 'guardian' then 'Pakt des Wächters' else 'Pakt des Schlüssels' end)),
        encounter=null,last_result=jsonb_build_object('kind','pact','title','Runenpakt gebunden','text','Der Pakt begleitet dich bis zum Ende dieses Runs.'),
        revision=revision+1,updated_at=now()
    where user_id=u;
    perform recovery_private.v8202_advance(u);

  elsif typ='chest' then
    if act<>'open' then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    gain:=round((3+floor(random()*5))*dust_mult)::int; if random()<0.14 then key_gain:=1; end if;
    update recovery_private.v8202_runehunt_runs set dust=dust+gain,keys=keys+key_gain,encounter=null,last_result=jsonb_build_object('kind','chest','title','Truhe geöffnet','text','Runenstaub wirbelt aus der Truhe.','dust_gain',gain,'keys_gain',key_gain),revision=revision+1,updated_at=now() where user_id=u;
    perform recovery_private.v8202_advance(u);

  elsif typ='golden' then
    if act<>'open' then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    gain:=round((8+floor(random()*7))*dust_mult)::int; if random()<0.50 then key_gain:=1; end if;
    update recovery_private.v8202_runehunt_runs set dust=dust+gain,keys=keys+key_gain,encounter=null,last_result=jsonb_build_object('kind','golden','title','Goldene Kammer geplündert','text','Ein großer Schwall Runenstaub löst sich aus den Wänden.','dust_gain',gain,'keys_gain',key_gain),revision=revision+1,updated_at=now() where user_id=u;
    perform recovery_private.v8202_advance(u);

  elsif typ='key' then
    if act<>'take' then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    update recovery_private.v8202_runehunt_runs set keys=keys+1,encounter=null,last_result=jsonb_build_object('kind','key','title','Runenschlüssel gefunden','text','Der Schlüssel kann eine versiegelte Pforte öffnen.','keys_gain',1),revision=revision+1,updated_at=now() where user_id=u;
    perform recovery_private.v8202_advance(u);

  elsif typ='heal' then
    if act not in ('drink','leave') then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    if act='drink' then gain:=greatest(1,round((18+floor(random()*13))*heal_mult)::int); hp2:=least(100,hp2+gain); end if;
    update recovery_private.v8202_runehunt_runs set hp=hp2,encounter=null,last_result=jsonb_build_object('kind','heal','title',case when act='drink' then 'Runenleben geheilt' else 'Brunnen ausgelassen' end,'text',case when act='drink' then 'Die Energie fließt durch deine Aura.' else 'Du ziehst weiter.' end,'heal',case when act='drink' then gain else 0 end),revision=revision+1,updated_at=now() where user_id=u;
    perform recovery_private.v8202_advance(u);

  elsif typ='blessing' then
    if act not in ('take','leave') then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    effect_id:=e->>'effect_id';
    if act='take' then
      update recovery_private.v8202_runehunt_runs set blessings=recovery_private.v8202_add_effect(blessings,effect_id,'blessing'),encounter=null,last_result=jsonb_build_object('kind','blessing','title','Segen angenommen','text',e->>'text'),revision=revision+1,updated_at=now() where user_id=u;
    else
      update recovery_private.v8202_runehunt_runs set encounter=null,last_result=jsonb_build_object('kind','blessing','title','Segen zurückgelassen','text','Du gehst ohne den Segen weiter.'),revision=revision+1,updated_at=now() where user_id=u;
    end if;
    perform recovery_private.v8202_advance(u);

  elsif typ='curse' then
    if act not in ('endure','seal') then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    effect_id:=e->>'effect_id';
    if act='seal' then
      if keys2<1 then return jsonb_build_object('ok',false,'reason','KEY_REQUIRED','state',recovery_private.v8202_public_state(u)); end if;
      update recovery_private.v8202_runehunt_runs set keys=keys-1,encounter=null,last_result=jsonb_build_object('kind','curse','title','Fluch versiegelt','text','Ein Runenschlüssel zerbricht und nimmt den Fluch mit sich.'),revision=revision+1,updated_at=now() where user_id=u;
    else
      update recovery_private.v8202_runehunt_runs set curses=recovery_private.v8202_add_effect(curses,effect_id,'curse'),encounter=null,last_result=jsonb_build_object('kind','curse','title','Fluch gebunden','text',e->>'text'),revision=revision+1,updated_at=now() where user_id=u;
    end if;
    perform recovery_private.v8202_advance(u);

  elsif typ='trap' then
    if act not in ('brace','dash') then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    if act=e->>'secret' then dmg:=0;title:='Falle überwunden';body:='Du liest den Rhythmus der Runen richtig.';
    else dmg:=greatest(1,round((7+floor(random()*10))*dmg_mult)::int);hp2:=greatest(0,hp2-dmg);title:='Falle ausgelöst';body:='Die Runen schlagen zurück.';success:=false;
    end if;
    update recovery_private.v8202_runehunt_runs set hp=hp2,encounter=null,last_result=jsonb_build_object('kind','trap','success',success,'title',title,'text',body,'damage',dmg),revision=revision+1,updated_at=now() where user_id=u;
    if hp2=0 then update recovery_private.v8202_runehunt_runs set status='downed',revive_at=now()+interval '60 minutes' where user_id=u; else perform recovery_private.v8202_advance(u); end if;

  else
    if act<>'continue' then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8202_public_state(u)); end if;
    update recovery_private.v8202_runehunt_runs set encounter=null,last_result=jsonb_build_object('kind','empty','title','Du ziehst weiter','text','Der Raum bleibt still.'),revision=revision+1,updated_at=now() where user_id=u;
    perform recovery_private.v8202_advance(u);
  end if;

  out:=recovery_private.v8202_public_state(u);
  insert into recovery_private.v8202_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,r.run_id,'action:'||typ||':'||act,out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8202_runehunt_choose(p_door_id text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  did text:=lower(btrim(coalesce(p_door_id,'')));
  old recovery_private.v8202_runehunt_ledger%rowtype;
  r recovery_private.v8202_runehunt_runs%rowtype;
  d jsonb;
  out jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  select * into old from recovery_private.v8202_runehunt_ledger where user_id=u and request_id=req;
  if found then return old.payload; end if;

  select * into r from recovery_private.v8202_runehunt_runs where user_id=u for update;
  if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','RUN_NOT_ACTIVE','state',recovery_private.v8202_public_state(u)); end if;
  if r.encounter is not null then return jsonb_build_object('ok',false,'reason','ENCOUNTER_ACTIVE','state',recovery_private.v8202_public_state(u)); end if;

  select value into d from jsonb_array_elements(r.doors) where value->>'id'=did limit 1;
  if d is null then return jsonb_build_object('ok',false,'reason','DOOR_NOT_FOUND','state',recovery_private.v8202_public_state(u)); end if;
  if d->>'status'='blocked' then return jsonb_build_object('ok',false,'reason','DOOR_BLOCKED','state',recovery_private.v8202_public_state(u)); end if;
  if d->>'status'='locked' then
    if r.keys<coalesce((d->>'key_cost')::int,1) then return jsonb_build_object('ok',false,'reason','KEY_REQUIRED','state',recovery_private.v8202_public_state(u)); end if;
    update recovery_private.v8202_runehunt_runs set keys=keys-coalesce((d->>'key_cost')::int,1) where user_id=u;
  end if;

  update recovery_private.v8202_runehunt_runs
  set doors='[]'::jsonb,encounter=recovery_private.v8202_make_encounter(room_no),
      last_result=jsonb_build_object('kind','door','title',d->>'label','text','Die Pforte öffnet sich.'),
      revision=revision+1,updated_at=now()
  where user_id=u;

  out:=recovery_private.v8202_public_state(u);
  insert into recovery_private.v8202_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,r.run_id,'door:'||did,out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8202_runehunt_start(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid:=auth.uid();
  req text:=left(btrim(coalesce(p_request_id,'')),160);
  d date:=(now() at time zone 'Europe/Berlin')::date;
  old recovery_private.v8202_runehunt_ledger%rowtype;
  r recovery_private.v8202_runehunt_runs%rowtype;
  rid uuid:=gen_random_uuid();
  out jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  select * into old from recovery_private.v8202_runehunt_ledger where user_id=u and request_id=req;
  if found then return old.payload; end if;
  if not public.v7102_auto_weekend_event_active('runehunt',now()) then
    return jsonb_build_object('ok',false,'reason','RUNEHUNT_INACTIVE','state',recovery_private.v8202_public_state(u));
  end if;

  select * into r from recovery_private.v8202_runehunt_runs where user_id=u for update;
  if found and r.event_key=d then
    out:=recovery_private.v8202_public_state(u);
    insert into recovery_private.v8202_runehunt_ledger(user_id,request_id,run_id,action,payload)
    values(u,req,r.run_id,'resume',out);
    return out;
  end if;

  insert into recovery_private.v8202_runehunt_runs(
    user_id,event_key,run_id,status,room_no,hp,keys,dust,blessings,curses,pacts,doors,encounter,revive_at,last_result,revision,started_at,updated_at
  ) values(
    u,d,rid,'active',1,100,0,0,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,recovery_private.v8202_make_doors(1),null,null,
    jsonb_build_object('kind','start','title','Das Runentor schließt sich','text','Vor dir beginnt ein Labyrinth aus hundert Räumen.'),1,now(),now()
  )
  on conflict(user_id) do update set
    event_key=excluded.event_key,run_id=excluded.run_id,status='active',room_no=1,hp=100,keys=0,dust=0,
    blessings='[]'::jsonb,curses='[]'::jsonb,pacts='[]'::jsonb,doors=excluded.doors,encounter=null,revive_at=null,
    last_result=excluded.last_result,revision=recovery_private.v8202_runehunt_runs.revision+1,started_at=now(),updated_at=now();

  out:=recovery_private.v8202_public_state(u);
  insert into recovery_private.v8202_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,rid,'start',out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8202_runehunt_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare u uuid:=auth.uid();
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  return recovery_private.v8202_public_state(u);
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_add_effect(p_effects jsonb, p_id text, p_kind text)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  arr jsonb:=coalesce(p_effects,'[]'::jsonb);
  old jsonb;
  out jsonb:='[]'::jsonb;
  found boolean:=false;
  tier integer;
  charges integer;
  label text;
  descr text;
  x jsonb;
begin
  if p_kind='blessing' then
    label:=case p_id when 'ward' then 'Steinhaut' when 'fortune' then 'Runenspürsinn' else 'Nebelschritt' end;
    descr:=case p_id when 'ward' then 'Weniger Schaden in Begegnungen.' when 'fortune' then 'Mehr Runenstaub aus Beute.' else 'Höhere Chance auf schadlose Flucht.' end;
  else
    label:=case p_id when 'fracture' then 'Rissige Aura' when 'hunger' then 'Verzehrender Durst' else 'Blindflug' end;
    descr:=case p_id when 'fracture' then 'Du erleidest mehr Schaden.' when 'hunger' then 'Heilung wirkt schwächer.' else 'Türhinweise werden verschleiert.' end;
  end if;

  for old in select value from jsonb_array_elements(arr) loop
    if old->>'id'=p_id then
      tier:=least(2,coalesce((old->>'tier')::int,1)+1);
      charges:=case when tier=2 then 14 else 9 end;
      out:=out||jsonb_build_array(jsonb_build_object('id',p_id,'kind',p_kind,'label',label,'description',descr,'tier',tier,'charges',charges));
      found:=true;
    else
      out:=out||jsonb_build_array(old);
    end if;
  end loop;

  if not found then
    x:=jsonb_build_object('id',p_id,'kind',p_kind,'label',label,'description',descr,'tier',1,'charges',9);
    if jsonb_array_length(out)<3 then
      out:=out||jsonb_build_array(x);
    else
      select coalesce(jsonb_agg(value order by ord),'[]'::jsonb)
      into out
      from jsonb_array_elements(out) with ordinality e(value,ord)
      where ord>1;
      out:=out||jsonb_build_array(x);
    end if;
  end if;
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_advance(p_uid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare r recovery_private.v8202_runehunt_runs%rowtype;
begin
  select * into r from recovery_private.v8202_runehunt_runs where user_id=p_uid for update;
  if r.room_no>=100 then return; end if;
  update recovery_private.v8202_runehunt_runs
  set room_no=room_no+1,
      blessings=recovery_private.v8202_tick_effects(blessings),
      curses=recovery_private.v8202_tick_effects(curses),
      doors=recovery_private.v8202_make_doors(room_no+1),
      encounter=null,
      revision=revision+1,
      updated_at=now()
  where user_id=p_uid;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_effect_tier(p_effects jsonb, p_id text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select coalesce(max((x->>'tier')::int),0)
  from jsonb_array_elements(coalesce(p_effects,'[]'::jsonb)) x
  where x->>'id'=p_id
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_has_effect(p_effects jsonb, p_id text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select exists(select 1 from jsonb_array_elements(coalesce(p_effects,'[]'::jsonb)) x where x->>'id'=p_id)
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_make_doors(p_room integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  styles text[]:=array['root','ember','mist','stone','gold'];
  labels text[]:=array['Wurzelpforte','Gluttor','Nebelpforte','Runenstein-Tor','Goldene Pforte'];
  hints text[]:=array[
    'Feine Wurzeln bewegen sich in den Fugen.',
    'Warme Luft schlägt dir entgegen.',
    'Violetter Nebel sickert unter dem Tor hervor.',
    'Tiefe Kratzspuren ziehen sich über den Stein.',
    'Ein schwacher Goldschimmer liegt auf den Runen.'
  ];
  a integer:=1+floor(random()*5)::int;
  b integer:=1+floor(random()*5)::int;
  r numeric:=random();
  ls text:='open'; rs text:='open';
begin
  if p_room in (25,50,75,100) then
    return jsonb_build_array(jsonb_build_object(
      'id','boss','style',case when p_room=100 then 'final' else 'boss' end,
      'status','open','key_cost',0,
      'label',case when p_room=100 then 'Tor des Runenkerns' else 'Wächtertor' end,
      'hint',case when p_room=100 then 'Hinter diesem Tor wartet der Hüter des Runenkerns.' else 'Ein mächtiger Wächter blockiert den nächsten Abschnitt.' end
    ));
  end if;

  if r<0.10 then ls:='blocked';
  elsif r<0.28 then ls:='locked';
  elsif r<0.38 then rs:='blocked';
  elsif r<0.56 then rs:='locked';
  end if;

  return jsonb_build_array(
    jsonb_build_object('id','left','style',styles[a],'status',ls,'key_cost',case when ls='locked' then 1 else 0 end,'label',labels[a],'hint',hints[a]),
    jsonb_build_object('id','right','style',styles[b],'status',rs,'key_cost',case when rs='locked' then 1 else 0 end,'label',labels[b],'hint',hints[b])
  );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_make_encounter(p_room integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  r numeric:=random();
  kind text;
  art text;
  blessing_id text;
  curse_id text;
  secret text;
  zone integer:=greatest(1,least(4,1+floor((p_room-1)/25.0)::int));
  monster_names text[]:=array['Runenwächter','Nebelschreiter','Glutbestie','Wurzelkoloss','Kristallhüter','Aschenwolf'];
  mname text:=monster_names[1+floor(random()*array_length(monster_names,1))::int];
begin
  if p_room=100 then
    return jsonb_build_object('type','finalboss','title','Hüter des Runenkerns','text','Der letzte Wächter steht zwischen dir und der Verzauberungsrune.','art','v474_dungeon_assets/d20_boss.png');
  elsif p_room in (25,50,75) then
    art:=case p_room when 25 then 'v474_dungeon_assets/d10_boss.png' when 50 then 'v474_dungeon_assets/d14_boss.png' else 'v474_dungeon_assets/d17_boss.png' end;
    return jsonb_build_object('type','miniboss','title','Runenwächter des Abschnitts','text','Ein Zwischenwächter versperrt dir den Weg.','art',art);
  end if;

  if r<0.34 then kind:='monster';
  elsif r<0.54 then kind:='chest';
  elsif r<0.62 then kind:='blessing';
  elsif r<0.70 then kind:='curse';
  elsif r<0.78 then kind:='heal';
  elsif r<0.85 then kind:='trap';
  elsif r<0.92 then kind:='key';
  elsif r<0.97 then kind:='golden';
  else kind:='empty';
  end if;

  if kind='monster' then
    art:='v474_dungeon_assets/d'||(9+zone)::text||'_'||(1+floor(random()*9)::int)::text||'.png';
    return jsonb_build_object('type','monster','title',mname,'text','Die Kreatur bemerkt dich. Kämpfen oder fliehen?','art',art);
  elsif kind='chest' then
    return jsonb_build_object('type','chest','title','Runentruhe','text','Eine alte Truhe ist mit verblassten Glyphen versiegelt.');
  elsif kind='blessing' then
    blessing_id:=(array['ward','fortune','step'])[1+floor(random()*3)::int];
    return jsonb_build_object(
      'type','blessing','effect_id',blessing_id,'title','Segen der Runen',
      'text',case blessing_id when 'ward' then 'Steinhaut: weniger Schaden.' when 'fortune' then 'Runenspürsinn: mehr Runenstaub.' else 'Nebelschritt: bessere Flucht.' end
    );
  elsif kind='curse' then
    curse_id:=(array['fracture','hunger','blind'])[1+floor(random()*3)::int];
    return jsonb_build_object(
      'type','curse','effect_id',curse_id,'title','Fluchzeichen',
      'text',case curse_id when 'fracture' then 'Rissige Aura: mehr Schaden.' when 'hunger' then 'Verzehrender Durst: schwächere Heilung.' else 'Blindflug: Türhinweise verschwimmen.' end
    );
  elsif kind='heal' then
    return jsonb_build_object('type','heal','title','Runenbrunnen','text','Klares Licht sammelt sich in einer steinernen Schale.');
  elsif kind='trap' then
    secret:=case when random()<0.5 then 'brace' else 'dash' end;
    return jsonb_build_object('type','trap','title','Runenfalle','text','Der Boden pulsiert. Du musst dich entscheiden.','secret',secret);
  elsif kind='key' then
    return jsonb_build_object('type','key','title','Schlüsselkammer','text','Ein einzelner Runenschlüssel schwebt über einem Sockel.');
  elsif kind='golden' then
    return jsonb_build_object('type','golden','title','Goldene Runenkammer','text','Die Wände selbst glimmen vor gebundener Energie.');
  else
    return jsonb_build_object('type','empty','title','Stiller Raum','text','Nur Staub und alte Glyphen. Zumindest scheint hier nichts zu lauern.');
  end if;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_mask_doors(p_doors jsonb, p_curses jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  blind boolean:=recovery_private.v8202_has_effect(p_curses,'blind');
  out jsonb:='[]'::jsonb;
  d jsonb;
begin
  if not blind then return coalesce(p_doors,'[]'::jsonb); end if;
  for d in select value from jsonb_array_elements(coalesce(p_doors,'[]'::jsonb)) loop
    out:=out||jsonb_build_array(jsonb_set(d,'{hint}',to_jsonb('Der Blindflug verschleiert, was hinter dieser Pforte liegt.'::text),true));
  end loop;
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_public_state(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  r recovery_private.v8202_runehunt_runs%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  active boolean:=public.v7102_auto_weekend_event_active('runehunt',now());
  safe_enc jsonb;
begin
  insert into recovery_private.v8198_enchant_wallet(user_id) values(p_uid) on conflict(user_id) do nothing;

  select * into r from recovery_private.v8202_runehunt_runs where user_id=p_uid for update;
  if found and r.status='downed' and r.revive_at is not null and r.revive_at<=now() then
    update recovery_private.v8202_runehunt_runs
    set status='active',hp=100,revive_at=null,
        last_result=jsonb_build_object('kind','revive','title','Die Runen tragen dich zurück','text','Dein Runenleben ist wieder vollständig.'),
        revision=revision+1,updated_at=now()
    where user_id=p_uid
    returning * into r;
  end if;

  select * into w from recovery_private.v8198_enchant_wallet where user_id=p_uid;
  if r.encounter is not null then safe_enc:=r.encounter-'secret'; else safe_enc:=null; end if;

  return jsonb_build_object(
    'ok',true,
    'active',active,
    'next_event',recovery_private.v8198_next_runehunt(now()),
    'runes',w.runes,
    'rune_shards',w.rune_shards,
    'run',case when r.user_id is null then null else jsonb_build_object(
      'event_key',r.event_key,'run_id',r.run_id,'status',r.status,
      'room_no',r.room_no,'total_rooms',100,'hp',r.hp,'max_hp',100,
      'keys',r.keys,'dust',r.dust,
      'blessings',r.blessings,'curses',r.curses,'pacts',r.pacts,
      'doors',case when r.encounter is null then recovery_private.v8202_mask_doors(r.doors,r.curses) else '[]'::jsonb end,
      'encounter',safe_enc,'revive_at',r.revive_at,'last_result',r.last_result,'revision',r.revision
    ) end
  );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8202_tick_effects(p_effects jsonb)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  select coalesce(jsonb_agg(
    jsonb_set(x,'{charges}',to_jsonb(greatest(0,coalesce((x->>'charges')::int,1)-1)),true)
    order by ord
  ) filter (where coalesce((x->>'charges')::int,1)>1),'[]'::jsonb)
  from jsonb_array_elements(coalesce(p_effects,'[]'::jsonb)) with ordinality a(x,ord)
$function$;


revoke all on function public.v8202_runehunt_state() from public, anon;
revoke all on function public.v8202_runehunt_start(text) from public, anon;
revoke all on function public.v8202_runehunt_choose(text,text) from public, anon;
revoke all on function public.v8202_runehunt_action(text,text) from public, anon;
grant execute on function public.v8202_runehunt_state() to authenticated, service_role;
grant execute on function public.v8202_runehunt_start(text) to authenticated, service_role;
grant execute on function public.v8202_runehunt_choose(text,text) to authenticated, service_role;
grant execute on function public.v8202_runehunt_action(text,text) to authenticated, service_role;
