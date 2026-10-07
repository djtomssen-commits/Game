-- Grow Legends V8.199 — Runenjagd Raum-Expedition (Beta)
-- Snapshot der angewendeten Migration v8199_runehunt_room_expeditions.

create table if not exists recovery_private.v8199_runehunt_runs(
  user_id uuid primary key references auth.users(id) on delete cascade,
  event_key date not null,
  run_id uuid not null,
  status text not null check (status in ('active','completed','failed')),
  room_no smallint not null default 1 check (room_no between 1 and 10),
  life smallint not null default 3 check (life between 0 and 3),
  keys smallint not null default 0 check (keys between 0 and 5),
  essence integer not null default 0 check (essence >= 0),
  doors jsonb not null default '[]'::jsonb,
  pending_event jsonb,
  last_result jsonb,
  revision bigint not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table recovery_private.v8199_runehunt_runs enable row level security;
revoke all on recovery_private.v8199_runehunt_runs from public, anon, authenticated;

create table if not exists recovery_private.v8199_runehunt_ledger(
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  run_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table recovery_private.v8199_runehunt_ledger enable row level security;
revoke all on recovery_private.v8199_runehunt_ledger from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.v8199_runehunt_action(p_action text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  req text := left(btrim(coalesce(p_request_id,'')),160);
  act text := lower(btrim(coalesce(p_action,'')));
  d date := (now() at time zone 'Europe/Berlin')::date;
  led recovery_private.v8199_runehunt_ledger%rowtype;
  r recovery_private.v8199_runehunt_runs%rowtype;
  p recovery_private.v8198_runehunt_progress%rowtype;
  w recovery_private.v8198_enchant_wallet%rowtype;
  etype text;
  secret text;
  valid boolean := false;
  life2 integer;
  keys2 integer;
  essence2 integer;
  delta_ess integer := 0;
  delta_life integer := 0;
  delta_keys integer := 0;
  result_title text;
  result_text text;
  success boolean := true;
  reward_shards integer := 0;
  reward_runes integer := 0;
  completion_bonus integer := 0;
  next_room integer;
  out jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;

  select * into led from recovery_private.v8199_runehunt_ledger where user_id=u and request_id=req;
  if found then return led.payload; end if;

  select * into r from recovery_private.v8199_runehunt_runs where user_id=u for update;
  if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_RUN','state',recovery_private.v8199_public_state(u)); end if;
  if r.pending_event is null then return jsonb_build_object('ok',false,'reason','NO_PENDING_EVENT','state',recovery_private.v8199_public_state(u)); end if;

  etype := r.pending_event->>'type';
  secret := r.pending_event->>'secret';
  select exists(
    select 1 from jsonb_array_elements(coalesce(r.pending_event->'options','[]'::jsonb)) x
    where x->>'id'=act
  ) into valid;
  if not valid then return jsonb_build_object('ok',false,'reason','INVALID_ACTION','state',recovery_private.v8199_public_state(u)); end if;

  life2:=r.life; keys2:=r.keys; essence2:=r.essence;

  if etype='chest' then
    delta_ess:=case when act=secret then 2 else 1 end;
    result_title:=case when act=secret then 'Das Hauptsiegel antwortet' else 'Die Truhe öffnet sich' end;
    result_text:=case when act=secret then 'Die stärkste Rune pulsiert und gibt zusätzliche Essenz frei.' else 'Ein Teil der Runenessenz löst sich aus dem Deckel.' end;
  elsif etype='shrine' then
    if act='restore' then
      if life2<3 then delta_life:=1;result_title:='Runenleben wiederhergestellt';result_text:='Der Schrein schließt einen Riss in deiner Aura.';
      else delta_ess:=1;result_title:='Heilkraft wird zu Essenz';result_text:='Dein Runenleben ist voll. Die überschüssige Kraft bindet sich als Essenz.';
      end if;
    else
      delta_ess:=2;result_title:='Essenz gebunden';result_text:='Der Schrein überträgt seine gespeicherte Kraft.';
    end if;
  elsif etype='trap' then
    if act=secret then
      delta_ess:=1;result_title:='Falle durchquert';result_text:='Du erwischst das richtige Zeitfenster und sicherst Restenergie.';
    else
      delta_life:=-1;success:=false;result_title:='Runenfalle trifft';result_text:='Ein Puls durchbricht deine Aura. Du verlierst 1 Runenleben.';
    end if;
  elsif etype='puzzle' then
    if act=secret then
      delta_ess:=2;result_title:='Glyphenkreis geschlossen';result_text:='Die drei Zeichen rasten ein und geben Essenz frei.';
    else
      delta_life:=-1;success:=false;result_title:='Falsche Glyphe';result_text:='Der Kreis schlägt zurück. Du verlierst 1 Runenleben.';
    end if;
  elsif etype='key' then
    if act='take_key' then delta_keys:=1;result_title:='Runenschlüssel gesichert';result_text:='Der Schlüssel verschwindet in deiner Runentasche.';
    else delta_ess:=2;result_title:='Energiekern gebrochen';result_text:='Der Kern zerfällt zu konzentrierter Essenz.';
    end if;
  elsif etype='echo' then
    delta_ess:=case when act=secret then 2 else 1 end;
    result_title:=case when act=secret then 'Das Echo gehorcht' else 'Das Echo zerreißt' end;
    result_text:=case when act=secret then 'Die Resonanz führt dich zu einer starken Essenzspur.' else 'Du sicherst noch einen Rest der flüchtigen Energie.' end;
  elsif etype='vault' then
    if act='unlock' then
      if keys2<1 then return jsonb_build_object('ok',false,'reason','KEY_REQUIRED','state',recovery_private.v8199_public_state(u)); end if;
      delta_keys:=-1;delta_ess:=3;result_title:='Runenkammer geöffnet';result_text:='Der Schlüssel zerfällt und die versiegelte Essenz gehört dir.';
    else
      delta_ess:=1;result_title:='Kammer umgangen';result_text:='Du löst etwas Energie aus dem äußeren Siegel.';
    end if;
  else
    delta_ess:=case when act=secret then 2 else 1 end;
    result_title:='Heiligtum vollendet';
    result_text:='Die gesammelte Runenkraft wird an den Abschlusskreis gebunden.';
  end if;

  life2:=greatest(0,least(3,life2+delta_life));
  keys2:=greatest(0,least(5,keys2+delta_keys));
  essence2:=greatest(0,essence2+delta_ess);

  if life2<=0 then
    reward_shards:=greatest(1,least(2,1+floor(essence2/6.0)::integer));
    select * into w from recovery_private.v8198_enchant_wallet where user_id=u for update;
    update recovery_private.v8198_enchant_wallet
    set rune_shards=rune_shards+reward_shards,revision=revision+1,updated_at=now()
    where user_id=u;
    update recovery_private.v8199_runehunt_runs
    set status='failed',life=0,keys=keys2,essence=essence2,pending_event=null,doors='[]'::jsonb,
        last_result=jsonb_build_object(
          'kind','run_end','success',false,'title','Die Expedition bricht zusammen',
          'text','Dein Runenleben ist aufgebraucht. Gesicherte Fragmente bleiben dir.',
          'shards_awarded',reward_shards,'runes_awarded',0,'completion_shards',0
        ),
        revision=revision+1,updated_at=now()
    where user_id=u;
  elsif r.room_no>=10 then
    select * into p from recovery_private.v8198_runehunt_progress where user_id=u and event_key=r.event_key for update;
    select * into w from recovery_private.v8198_enchant_wallet where user_id=u for update;
    reward_shards:=least(4,2+floor(essence2/6.0)::integer);
    reward_runes:=case when random()<0.06 then 1 else 0 end;
    if coalesce(p.runs_used,0)>=5 and not coalesce(p.completion_bonus_claimed,false) then
      completion_bonus:=3;
      update recovery_private.v8198_runehunt_progress
      set completion_bonus_claimed=true,revision=revision+1,updated_at=now()
      where user_id=u and event_key=r.event_key;
    end if;
    update recovery_private.v8198_enchant_wallet
    set rune_shards=rune_shards+reward_shards+completion_bonus,
        runes=runes+reward_runes,
        revision=revision+1,updated_at=now()
    where user_id=u;
    update recovery_private.v8199_runehunt_runs
    set status='completed',life=life2,keys=keys2,essence=essence2,pending_event=null,doors='[]'::jsonb,
        last_result=jsonb_build_object(
          'kind','run_end','success',true,'title','Runenheiligtum bezwungen',
          'text','Der zehnte Raum öffnet den Abschlusskreis.',
          'shards_awarded',reward_shards+completion_bonus,'base_shards',reward_shards,
          'runes_awarded',reward_runes,'completion_shards',completion_bonus
        ),
        revision=revision+1,updated_at=now()
    where user_id=u;
  else
    next_room:=r.room_no+1;
    update recovery_private.v8199_runehunt_runs
    set room_no=next_room,life=life2,keys=keys2,essence=essence2,
        pending_event=null,doors=recovery_private.v8199_make_doors(next_room),
        last_result=jsonb_build_object(
          'kind','event','success',success,'title',result_title,'text',result_text,
          'delta_essence',delta_ess,'delta_life',delta_life,'delta_keys',delta_keys
        ),
        revision=revision+1,updated_at=now()
    where user_id=u;
  end if;

  out:=recovery_private.v8199_public_state(u);
  insert into recovery_private.v8199_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,r.run_id,'event:'||etype||':'||act,out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8199_runehunt_choose(p_door_id text, p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  req text := left(btrim(coalesce(p_request_id,'')),160);
  door_id text := lower(btrim(coalesce(p_door_id,'')));
  led recovery_private.v8199_runehunt_ledger%rowtype;
  r recovery_private.v8199_runehunt_runs%rowtype;
  door jsonb;
  roll numeric := random();
  etype text;
  secret text;
  ev jsonb;
  out jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;
  if door_id not in ('left','right') then raise exception 'INVALID_DOOR'; end if;

  select * into led from recovery_private.v8199_runehunt_ledger where user_id=u and request_id=req;
  if found then return led.payload; end if;

  select * into r from recovery_private.v8199_runehunt_runs where user_id=u for update;
  if not found or r.status<>'active' then return jsonb_build_object('ok',false,'reason','NO_ACTIVE_RUN','state',recovery_private.v8199_public_state(u)); end if;
  if r.pending_event is not null then return jsonb_build_object('ok',false,'reason','EVENT_ACTION_REQUIRED','state',recovery_private.v8199_public_state(u)); end if;

  select value into door from jsonb_array_elements(r.doors) where value->>'id'=door_id limit 1;
  if door is null then return jsonb_build_object('ok',false,'reason','DOOR_NOT_AVAILABLE','state',recovery_private.v8199_public_state(u)); end if;

  if r.room_no=10 then
    etype:='sanctum';
  elsif roll<0.22 then etype:='chest';
  elsif roll<0.40 then etype:='shrine';
  elsif roll<0.56 then etype:='trap';
  elsif roll<0.74 then etype:='puzzle';
  elsif roll<0.86 then etype:='key';
  elsif roll<0.94 then etype:='echo';
  else etype:=case when r.keys>0 then 'vault' else 'chest' end;
  end if;

  if etype='chest' then
    secret := (array['seal_left','seal_center','seal_right'])[1+floor(random()*3)::integer];
    ev := jsonb_build_object(
      'type','chest','theme',door->>'theme','title','Versiegelte Runentruhe',
      'text','Drei Siegel liegen auf dem Deckel. Nur eines pulsiert mit voller Kraft.',
      'secret',secret,
      'options',jsonb_build_array(
        jsonb_build_object('id','seal_left','icon','◇','label','Linkes Siegel','sub','Berühre die erste Rune.'),
        jsonb_build_object('id','seal_center','icon','ᚱ','label','Mittleres Siegel','sub','Binde die Rune im Zentrum.'),
        jsonb_build_object('id','seal_right','icon','◆','label','Rechtes Siegel','sub','Löse das äußere Zeichen.')
      )
    );
  elsif etype='shrine' then
    ev := jsonb_build_object(
      'type','shrine','theme',door->>'theme','title','Schrein der Alten',
      'text','Der Schrein reagiert auf deine Hand. Du kannst Kraft heilen oder Essenz binden.',
      'options',jsonb_build_array(
        jsonb_build_object('id','restore','icon','✚','label','Runenleben stärken','sub','Heilt 1 Leben, falls nötig.'),
        jsonb_build_object('id','attune','icon','✦','label','Essenz binden','sub','Gewinnt 2 Runenessenz.')
      )
    );
  elsif etype='trap' then
    secret := case when random()<0.5 then 'ward' else 'dash' end;
    ev := jsonb_build_object(
      'type','trap','theme',door->>'theme','title','Runenfalle',
      'text','Die Bodenzeichen erwachen. Entscheide sofort, wie du die Falle durchquerst.',
      'secret',secret,
      'options',jsonb_build_array(
        jsonb_build_object('id','ward','icon','⬡','label','Schutzrune aktivieren','sub','Versiegle den Boden vor dir.'),
        jsonb_build_object('id','dash','icon','➤','label','Durchbrechen','sub','Nutze den kurzen Moment zwischen den Pulsen.')
      )
    );
  elsif etype='puzzle' then
    secret := (array['rune_a','rune_b','rune_c'])[1+floor(random()*3)::integer];
    ev := jsonb_build_object(
      'type','puzzle','theme',door->>'theme','title','Flüsternde Glyphen',
      'text','Drei Glyphen antworten aufeinander. Finde das Zeichen, das den Kreis schließt.',
      'secret',secret,
      'options',jsonb_build_array(
        jsonb_build_object('id','rune_a','icon','ᚠ','label','Fehu','sub','Wachstum und Beginn.'),
        jsonb_build_object('id','rune_b','icon','ᛉ','label','Algiz','sub','Schutz und Schwelle.'),
        jsonb_build_object('id','rune_c','icon','ᛏ','label','Tiwaz','sub','Wille und Richtung.')
      )
    );
  elsif etype='key' then
    ev := jsonb_build_object(
      'type','key','theme',door->>'theme','title','Schlüsselkammer',
      'text','Ein Runenschlüssel hängt über einem gesprungenen Energiekern.',
      'options',jsonb_build_array(
        jsonb_build_object('id','take_key','icon','⚿','label','Schlüssel nehmen','sub','Sichert 1 Runenschlüssel.'),
        jsonb_build_object('id','crack_core','icon','✦','label','Kern brechen','sub','Gewinnt 2 Runenessenz.')
      )
    );
  elsif etype='echo' then
    secret := case when random()<0.5 then 'listen' else 'break' end;
    ev := jsonb_build_object(
      'type','echo','theme',door->>'theme','title','Echo des Nebels',
      'text','Eine fremde Stimme wiederholt deine Schritte. Ein Symbol antwortet im Dunkeln.',
      'secret',secret,
      'options',jsonb_build_array(
        jsonb_build_object('id','listen','icon','◉','label','Dem Echo folgen','sub','Lass die Runen den Weg zeigen.'),
        jsonb_build_object('id','break','icon','✧','label','Echo brechen','sub','Zerschneide die Resonanz.')
      )
    );
  elsif etype='vault' then
    ev := jsonb_build_object(
      'type','vault','theme',door->>'theme','title','Verschlossene Runenkammer',
      'text','Eine schwere Kammer reagiert auf deinen Runenschlüssel.',
      'options',jsonb_build_array(
        jsonb_build_object('id','unlock','icon','⚿','label','Kammer öffnen','sub','Verbraucht 1 Schlüssel · 3 Essenz.'),
        jsonb_build_object('id','leave','icon','↩','label','Siegel umgehen','sub','Sichert 1 Essenz und zieht weiter.')
      )
    );
  else
    secret := case when random()<0.5 then 'bind' else 'release' end;
    ev := jsonb_build_object(
      'type','sanctum','theme',door->>'theme','title','Das Runenheiligtum',
      'text','Der zehnte Raum antwortet. Binde die gesammelte Essenz an das Heiligtum.',
      'secret',secret,
      'options',jsonb_build_array(
        jsonb_build_object('id','bind','icon','ᚱ','label','Kern binden','sub','Schließe den Run im Runenkreis.'),
        jsonb_build_object('id','release','icon','✦','label','Essenz freisetzen','sub','Lass die Zeichen den Kreis vollenden.')
      )
    );
  end if;

  update recovery_private.v8199_runehunt_runs
  set doors='[]'::jsonb,pending_event=ev,
      last_result=jsonb_build_object('kind','door','theme',door->>'theme','title',door->>'label','text','Die Pforte öffnet sich.'),
      revision=revision+1,updated_at=now()
  where user_id=u;

  out := recovery_private.v8199_public_state(u);
  insert into recovery_private.v8199_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,r.run_id,'door:'||door_id,out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8199_runehunt_start(p_request_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  u uuid := auth.uid();
  req text := left(btrim(coalesce(p_request_id,'')),160);
  d date := (now() at time zone 'Europe/Berlin')::date;
  led recovery_private.v8199_runehunt_ledger%rowtype;
  p recovery_private.v8198_runehunt_progress%rowtype;
  r recovery_private.v8199_runehunt_runs%rowtype;
  rid uuid := gen_random_uuid();
  out jsonb;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(req)<8 or req !~ '^[A-Za-z0-9:_-]+$' then raise exception 'REQUEST_ID_REQUIRED'; end if;

  select * into led from recovery_private.v8199_runehunt_ledger where user_id=u and request_id=req;
  if found then return led.payload; end if;

  if not public.v7102_auto_weekend_event_active('runehunt',now()) then
    return jsonb_build_object('ok',false,'reason','RUNEHUNT_INACTIVE','state',recovery_private.v8199_public_state(u));
  end if;

  insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
  insert into recovery_private.v8198_runehunt_progress(user_id,event_key)
  values(u,d) on conflict(user_id,event_key) do nothing;

  select * into p from recovery_private.v8198_runehunt_progress where user_id=u and event_key=d for update;
  select * into r from recovery_private.v8199_runehunt_runs where user_id=u for update;

  if r.user_id is not null and r.status='active' then
    out := recovery_private.v8199_public_state(u);
    insert into recovery_private.v8199_runehunt_ledger(user_id,request_id,run_id,action,payload)
    values(u,req,r.run_id,'resume',out);
    return out;
  end if;

  if p.runs_used>=5 then
    return jsonb_build_object('ok',false,'reason','NO_RUNS_LEFT','state',recovery_private.v8199_public_state(u));
  end if;

  update recovery_private.v8198_runehunt_progress
  set runs_used=runs_used+1,revision=revision+1,updated_at=now()
  where user_id=u and event_key=d;

  insert into recovery_private.v8199_runehunt_runs(
    user_id,event_key,run_id,status,room_no,life,keys,essence,doors,pending_event,last_result,revision,started_at,updated_at
  ) values(
    u,d,rid,'active',1,3,0,0,recovery_private.v8199_make_doors(1),null,
    jsonb_build_object('kind','start','title','Das Runentor schließt sich hinter dir.','text','Vor dir liegen zwei versiegelte Pforten.'),1,now(),now()
  )
  on conflict(user_id) do update set
    event_key=excluded.event_key,run_id=excluded.run_id,status='active',room_no=1,life=3,keys=0,essence=0,
    doors=excluded.doors,pending_event=null,last_result=excluded.last_result,revision=recovery_private.v8199_runehunt_runs.revision+1,
    started_at=now(),updated_at=now();

  out := recovery_private.v8199_public_state(u);
  insert into recovery_private.v8199_runehunt_ledger(user_id,request_id,run_id,action,payload)
  values(u,req,rid,'start',out);
  return out;
end
$function$;

CREATE OR REPLACE FUNCTION public.v8199_runehunt_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  insert into recovery_private.v8198_enchant_wallet(user_id) values(u) on conflict(user_id) do nothing;
  return recovery_private.v8199_public_state(u);
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8199_make_doors(p_room integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  a integer := floor(random()*3)::integer;
  b integer := (a + 1 + floor(random()*2)::integer) % 3;
  themes text[] := array['verdant','ember','void'];
  labels text[] := array['Wurzelpforte','Glutportal','Nebelbogen'];
  marks text[] := array['ᚠ','ᛏ','ᛉ'];
  hints text[] := array[
    'Alte Wurzeln bewegen sich hinter dem Stein.',
    'Warme Luft und Funken dringen durch die Fugen.',
    'Flüstern zieht durch den violetten Nebel.'
  ];
begin
  return jsonb_build_array(
    jsonb_build_object('id','left','theme',themes[a+1],'label',labels[a+1],'mark',marks[a+1],'hint',hints[a+1]),
    jsonb_build_object('id','right','theme',themes[b+1],'label',labels[b+1],'mark',marks[b+1],'hint',hints[b+1])
  );
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8199_public_state(p_uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'recovery_private', 'pg_temp'
AS $function$
declare
  d date := (now() at time zone 'Europe/Berlin')::date;
  w recovery_private.v8198_enchant_wallet%rowtype;
  p recovery_private.v8198_runehunt_progress%rowtype;
  r recovery_private.v8199_runehunt_runs%rowtype;
  run_json jsonb := null;
  safe_event jsonb := null;
  allowed boolean := false;
begin
  allowed := public.v7102_auto_weekend_event_active('runehunt',now());

  select * into w from recovery_private.v8198_enchant_wallet where user_id=p_uid;
  select * into p from recovery_private.v8198_runehunt_progress where user_id=p_uid and event_key=d;
  select * into r from recovery_private.v8199_runehunt_runs where user_id=p_uid;

  if r.pending_event is not null then
    safe_event := r.pending_event - 'secret';
  end if;

  if r.user_id is not null then
    run_json := jsonb_build_object(
      'run_id',r.run_id,
      'status',r.status,
      'event_key',r.event_key,
      'room_no',r.room_no,
      'total_rooms',10,
      'life',r.life,
      'max_life',3,
      'keys',r.keys,
      'essence',r.essence,
      'doors',case when r.status='active' and r.pending_event is null then r.doors else '[]'::jsonb end,
      'event',safe_event,
      'last_result',r.last_result,
      'revision',r.revision
    );
  end if;

  return jsonb_build_object(
    'ok',true,
    'active',allowed,
    'event_key',d,
    'next_event',recovery_private.v8198_next_runehunt(now()),
    'runs_used',coalesce(p.runs_used,0),
    'runs_left',greatest(0,5-coalesce(p.runs_used,0)),
    'max_runs',5,
    'runes',coalesce(w.runes,0),
    'rune_shards',coalesce(w.rune_shards,0),
    'shards_per_rune',10,
    'run',run_json
  );
end
$function$;


revoke all on function recovery_private.v8199_make_doors(integer) from public, anon, authenticated;
revoke all on function recovery_private.v8199_public_state(uuid) from public, anon, authenticated;
revoke all on function public.v8199_runehunt_state() from public, anon;
revoke all on function public.v8199_runehunt_start(text) from public, anon;
revoke all on function public.v8199_runehunt_choose(text,text) from public, anon;
revoke all on function public.v8199_runehunt_action(text,text) from public, anon;
grant execute on function public.v8199_runehunt_state() to authenticated, service_role;
grant execute on function public.v8199_runehunt_start(text) to authenticated, service_role;
grant execute on function public.v8199_runehunt_choose(text,text) to authenticated, service_role;
grant execute on function public.v8199_runehunt_action(text,text) to authenticated, service_role;
