/* ===== V4.02 Public equipment rendering ===== */

function v299PublicMysticSpecial(it){
 const sp=it?.mysticSpecial || it?.mystic_special || it?.special || null;
 if(!sp)return '';
 if(typeof sp==='string')return sp;
 const label=String(sp.label||sp.name||'').trim();
 if(label)return label;
 const value=Number(sp.value ?? sp.amount ?? 0)||0;
 const pct=Math.round(value*100);
 const names={
  hpPct:'Leben',mainPct:'Hauptattribut',wuchtChance:'Wuchtschlag',
  dodgeChance:'Ausweichen',doubleChance:'Doppeltreffer',
  critChance:'Krit',critDamage:'Krit-Schaden'
 };
 const key=sp.key||sp.effect||'';
 const name=names[key]||String(key||'Spezialeffekt');
 return `${pct>=0?'+':''}${pct} % ${name}`;
}
function v210Quality(q){
  const map={
    gray:{label:'Normal',cls:'q-gray'},
    green:{label:'Gewöhnlich',cls:'q-green'},
    blue:{label:'Rare',cls:'q-blue'},
    purple:{label:'Episch',cls:'q-purple'},
    orange:{label:'Legendär',cls:'q-orange'},
    cyan:{label:'Mystisch',cls:'q-cyan'}
  };
  return map[q]||map.gray;
}

function v210AttrName(k){
  return String(k||'')
    .replace('staerke','Stärke')
    .replace('geschick','Geschick')
    .replace('intelligenz','Intelligenz')
    .replace('ausdauer','Ausdauer')
    .replace('glueck','Glück')
    .replace('growSkill','Grow-Skill');
}

function v210PublicItemIcon(slot,it){
  if(it?.icon)return it.icon;
  return {
    head:'🪖',
    weapon:'⚔️',
    ring:'💍',
    body:'🛡️',
    chest:'🛡️',
    boots:'🥾',
    feet:'🥾',
    amulet:'📿',
    hands:'🧤',
    legs:'👖',
    offhand:'🛡️'
  }[slot]||'🎁';
}

/*
  Keep enough item information in the public profile to render the equipment
  with the same rarity identity as the player's own inventory.
*/
v074SafeEquipment=function(){
  const out={};

  Object.entries(s.equipment||{}).forEach(([slot,it])=>{
    if(!it)return;

    out[slot]={
      name:String(it.name||'Gegenstand').slice(0,100),
      icon:String(it.icon||v210PublicItemIcon(slot,it)).slice(0,10),
      quality:String(it.quality||'gray').slice(0,20),
      rarity:String(it.rarity||'').slice(0,30),
      dropLevel:Number(it.dropLevel)||null,
      bonus:it.bonus||{},
      enchant:it.enchant||null,
      gem:it.gem||null,
      setName:it.setName||null
    };
  });

  return out;
};

v074EquipmentHtml=function(eq){
  const labels={
    weapon:'Waffe',
    head:'Kopf',
    chest:'Brust',
    body:'Körper',
    hands:'Hände',
    legs:'Beine',
    feet:'Füße',
    boots:'Schuhe',
    ring:'Ring',
    amulet:'Amulett',
    offhand:'Nebenhand'
  };

  const entries=Object.entries(eq||{}).filter(([,it])=>!!it);

  if(!entries.length){
    return '<div class="v072-empty">Keine Ausrüstung sichtbar.</div>';
  }

  return `<div class="v210-profile-equipment">${
    entries.map(([slot,it])=>{
      const q=v210Quality(it.quality);
      const bonus=Object.entries(it.bonus||{})
        .map(([k,v])=>`${Number(v)>=0?'+':''}${v210FormatNumber(v)} ${v210AttrName(k)}`)
        .join(' · ');

      const upgrades=[];

      if(it.gem){
        const gemText=typeof it.gem==='string'
          ?it.gem
          :(it.gem.name||it.gem.label||'Edelstein');
        upgrades.push(`💎 ${gemText}`);
      }

      if(it.enchant){
        const enchText=typeof it.enchant==='string'
          ?it.enchant
          :(it.enchant.name||it.enchant.label||'Verzauberung');
        upgrades.push(`📜 ${enchText}`);
      }

      if(it.setName)upgrades.push(`🧩 ${it.setName}-Set`); const mysticSpecial=v299PublicMysticSpecial(it);

      return `
        <div class="v210-profile-item ${q.cls}">
          <div class="v210-profile-slot">${v073Escape(labels[slot]||slot)}</div>

          <div class="v210-profile-item-head">
            <div class="v210-profile-icon">${v073Escape(v210PublicItemIcon(slot,it))}</div>

            <div>
              <div class="v210-profile-item-name">${v073Escape(it.name||'Gegenstand')}</div>
              <div class="v210-profile-rarity">${q.label}</div>
            </div>
          </div>

          <div class="v210-profile-bonus">${v073Escape(bonus||'Keine Attributboni')}</div> ${mysticSpecial?`<div class="v298-profile-mystic">✨ Spezialeffekt: ${v073Escape(mysticSpecial)}</div>`:''}

          ${upgrades.length
            ?`<div class="v210-profile-upgrades">${
                upgrades.map(x=>`<span class="v210-profile-upgrade">${v073Escape(x)}</span>`).join('')
              }</div>`
            :''
          }
        </div>`;
    }).join('')
  }</div>`;
};

/* ===== V4.02 clean attribute formatting ===== */

function v210FormatNumber(value){
  const n=Number(value);
  if(!Number.isFinite(n))return '0';
  return String(Math.round(n));
}

function v210FormatCharacterAttributes(){
  const root=document.querySelector('#attrs');
  if(!root)return;

  root.querySelectorAll('.attr b').forEach(el=>{
    const raw=String(el.textContent||'').replace(',','.');
    const n=Number(raw);
    if(Number.isFinite(n))el.textContent=v210FormatNumber(n);
  });
}

/* ===== V4.02 timer / completion notifications ===== */

const V210_NOTIFY_KEY='growLegendsV210Notifications';
let v210NotifyState={
  initialized:false,
  dungeonReady:null,
  pvpRemaining:null,
  pvpKnown:false,
  questKey:null,
  plantKeys:new Set(),
  pvpChecking:false
};

function v210LoadSeen(){
  try{
    const data=JSON.parse(localStorage.getItem(V210_NOTIFY_KEY)||'{}');
    return data&&typeof data==='object'?data:{};
  }catch(e){
    return {};
  }
}
let v210Seen=v210LoadSeen();

function v210SaveSeen(){
  try{
    localStorage.setItem(V210_NOTIFY_KEY,JSON.stringify(v210Seen));
  }catch(e){}
}

function v210NotifyOnce(key,title,detail,icon='🔔'){
  if(!v141Settings?.notifications)return;
  if(v210Seen[key])return;

  v210Seen[key]=Date.now();
  v210SaveSeen();

  if(typeof v063Toast==='function'){
    v063Toast(`${icon} ${title}`,'success',detail);
  }

  if(
    (typeof window.glPushEnabled!=='function'||window.glPushEnabled()) &&
    typeof Notification!=='undefined' &&
    Notification.permission==='granted' &&
    document.hidden
  ){
    try{
      new Notification(`Grow Legends – ${title}`,{
        body:detail
      });
    }catch(e){}
  }
}

async function v210AskNotificationPermission(){
  if(typeof Notification==='undefined')return;

  if(Notification.permission==='default'){
    try{
      await Notification.requestPermission();
    }catch(e){}
  }
}

function v210BindNotificationPermission(){
  const toggle=document.querySelector('#v141PushNotifications');
  if(!toggle || toggle.dataset.v210PermissionBound==='1')return;

  toggle.dataset.v210PermissionBound='1';

  toggle.addEventListener('change',()=>{
    if(toggle.checked){
      v210AskNotificationPermission();
    }
  });
}

function v210QuestCheck(now){
  const q=s.quests?.active;
  if(!q?.ends)return;

  const key=`quest:${q.id||q.name||'quest'}:${q.ends}`;

  if(now>=Number(q.ends)){
    v210NotifyOnce(
      key,
      'Quest abgeschlossen',
      `${q.name||'Dein Auftrag'} ist fertig. Die Belohnung kann abgeholt werden.`,
      '📜'
    );
  }
}

function v210PlantCheck(now){
  const plants=Array.isArray(s.grow?.plants)?s.grow.plants:[];

  plants.forEach(p=>{
    if(!p)return;

    const readyAt=(Number(p.start)||0)+(Number(p.duration)||0);
    if(!readyAt || now<readyAt)return;

    const key=`plant:${p.seed||'plant'}:${p.start}:${p.duration}`;
    const seed=seedTypes?.[p.seed];

    v210NotifyOnce(
      key,
      'Pflanze erntereif',
      `${seed?.name||'Eine Pflanze'} ist fertig und kann im Growroom geerntet werden.`,
      '🌱'
    );
  });
}

function v210DungeonCheck(){
  const last=Number(s.dungeonPass?.lastFree)||0;
  const ready=freeDungeonReady();

  /*
    lastFree=0 is the initial free attempt and should not create a notification
    immediately after every new character.
  */
  if(last>0 && ready){
    const key=`dungeon:${last}`;
    v210NotifyOnce(
      key,
      'Dungeon-Versuch bereit',
      'Dein kostenloser Dungeon-Versuch ist wieder verfügbar.',
      '👹'
    );
  }

  v210NotifyState.dungeonReady=ready;
}

async function v210PvpCheck(){
  if(v210NotifyState.pvpChecking || !v200DurableUser())return;
  const now=Date.now();
  const lastLocal=Number(v210NotifyState.pvpLocalAt)||now;
  const before=Math.max(0,Number(v210NotifyState.pvpRemaining)||0);
  if(v210NotifyState.pvpKnown){
    const localRemaining=Math.max(0,before-(now-lastLocal));
    v210NotifyState.pvpRemaining=localRemaining;
    v210NotifyState.pvpLocalAt=now;
    if(before>0&&localRemaining<=0){
      v210NotifyOnce(`pvp:${now-Math.floor(V204_COOLDOWN/1000)}`,'PvP wieder bereit','Dein 30-Minuten-PvP-Cooldown ist abgelaufen. Du kannst wieder kämpfen.','⚔️');
    }
    /* While a known cooldown is running, the local clock is exact enough.
       When ready, cross-device state is revalidated at most every 5 minutes. */
    if(localRemaining>0 || now-Number(v210NotifyState.pvpLastRemoteAt||0)<300000)return;
  }

  v210NotifyState.pvpChecking=true;
  try{
    const remaining=await v204LoadCooldown();
    if(v210NotifyState.pvpKnown&&Number(v210NotifyState.pvpRemaining)>0&&remaining<=0){
      v210NotifyOnce(`pvp:${now-Math.floor(V204_COOLDOWN/1000)}`,'PvP wieder bereit','Dein 30-Minuten-PvP-Cooldown ist abgelaufen. Du kannst wieder kämpfen.','⚔️');
    }
    v210NotifyState.pvpRemaining=remaining;
    v210NotifyState.pvpKnown=true;
    v210NotifyState.pvpLocalAt=Date.now();
    v210NotifyState.pvpLastRemoteAt=Date.now();
  }catch(e){
    console.warn('V4.02 PvP notification check',e);
  }finally{
    v210NotifyState.pvpChecking=false;
  }
}

function v210RunLocalNotifications(){
  if(!v141Settings?.notifications)return;

  const now=Date.now();

  try{v210QuestCheck(now)}catch(e){}
  try{v210PlantCheck(now)}catch(e){}
  try{v210DungeonCheck()}catch(e){}
}

/* Local timers are cheap; PvP needs a DB lookup and runs less frequently. */
/* V4.81: v231NotificationTick is the canonical local completion checker. */
setInterval(v210PvpCheck,60000);

/* ===== V4.02 hooks ===== */

const v210BaseBuildSettings=v141BuildSettings;
v141BuildSettings=function(){
  const r=v210BaseBuildSettings();
  v210BindNotificationPermission();
  return r;
};

const v210BaseRender=render;
render=function(){
  const r=v210BaseRender();

  requestAnimationFrame(()=>{
    v210FormatCharacterAttributes();
    v210BindNotificationPermission();

    /*
      Refreshing the public profile payload after this version will include
      icon/rarity details automatically through v074SafeEquipment().
    */
  });

  return r;
};

setTimeout(()=>{
  v210FormatCharacterAttributes();
  v210BindNotificationPermission();
  v210RunLocalNotifications();
  v210PvpCheck();
},350);
