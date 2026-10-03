(()=>{'use strict';
if(window.__V7287_DUNGEON_META_FIX__)return;
window.__V7287_DUNGEON_META_FIX__=true;

const cfgTable=()=>window.__V468_CFG__||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const dungeonIndex=()=>{try{return typeof v048DungeonIndex==='function'?v048DungeonIndex():Math.max(0,Math.min(19,Number(window.s?.dungeon?.selected||0)||0));}catch(_){return 0}};
const roomIndex=(di)=>{try{
  if(typeof dungeonCompleted==='function'&&dungeonCompleted(di))return 9;
  if(typeof v048RoomIndex==='function')return v048RoomIndex(di);
  return Math.max(0,Math.min(9,Number(window.s?.dungeon?.progress?.[di]??window.s?.dungeon?.room??0)||0));
}catch(_){return 0}};
const roomLevel=(di,ri)=>{try{
  if(typeof v025RecommendedLevel==='function')return Math.max(1,Number(v025RecommendedLevel(di,ri))||1);
  if(typeof v244DungeonRoomLevel==='function')return Math.max(1,Number(v244DungeonRoomLevel(di,ri))||1);
  return Math.max(1,(di+1)*10+(ri+1)-1);
}catch(_){return Math.max(1,(di+1)*10+(ri+1)-1)}};
const enemyHp=(di,ri)=>{try{
  const d=window.dungeons?.[di],e=d?.enemies?.[ri];
  if(typeof v025EnemyStats==='function'&&e){return Math.max(0,Number(v025EnemyStats(di,ri,e)?.hp)||0)}
}catch(_){}
return 0};

function cfgFor(di){
  return cfgTable()?.[String((Number(di)||0)+1)]||null;
}
function labelFor(di,ri){
  const cfg=cfgFor(di);
  if(!cfg)return '';
  return ri===9 ? String(cfg.boss||'Boss') : String((cfg.enemy||[])[ri]||`Gegner ${ri+1}`);
}
function artFor(di,ri){
  const cfg=cfgFor(di);
  if(!cfg)return '';
  return ri===9 ? String(cfg.bossArt||'') : String((cfg.art||[])[ri]||'');
}
function syncData(di){
  const cfg=cfgFor(di);
  const d=window.dungeons?.[di];
  if(!cfg||!d||!Array.isArray(d.enemies))return false;
  for(let ri=0;ri<Math.min(10,d.enemies.length);ri++){
    const e=d.enemies[ri];
    if(!e||typeof e!=='object')continue;
    const wanted=labelFor(di,ri);
    if(wanted&&e.name!==wanted)e.name=wanted;
    if(wanted&&!e.short)e.short=wanted;
  }
  return true;
}
function syncAllData(){
  try{
    const ds=window.dungeons||[];
    for(let di=0;di<ds.length;di++)syncData(di);
  }catch(_){}
}
function forceThumb(el,art,fallback){
  if(!el)return;
  try{
    if(typeof window.glSetDungeonThumbImage==='function'){
      window.glSetDungeonThumbImage(el,art,fallback||'👹');
      return;
    }
  }catch(_){}
  if(art){
    el.textContent='';
    el.style.setProperty('background-image',`url("${art}")`,'important');
    el.style.setProperty('background-size','contain','important');
    el.style.setProperty('background-position','center center','important');
    el.style.setProperty('background-repeat','no-repeat','important');
  }
}
function syncVisible(){
  const dungeonScreen=document.getElementById('dungeon');
  if(!dungeonScreen||!dungeonScreen.classList.contains('active'))return;
  const di=dungeonIndex();
  syncData(di);
  const ri=roomIndex(di);
  const wanted=labelFor(di,ri);
  const art=artFor(di,ri);
  const cfg=cfgFor(di);
  if(!cfg)return;

  const card=document.getElementById('dungeonMapCard');
  if(card){
    for(let room=0;room<10;room++){
      const node=card.querySelector(`.v261-node[data-v261-room="${room}"]`);
      if(!node)continue;
      const nameEl=node.querySelector('.v261-name');
      if(nameEl){
        const txt=labelFor(di,room);
        if(txt)nameEl.textContent=txt;
      }
      const lvEl=node.querySelector('.v261-lv');
      if(lvEl){
        lvEl.textContent = room===9 ? `BOSS · Lv. ${roomLevel(di,room)}` : `Lv. ${roomLevel(di,room)}`;
      }
    }

    const currentBold=card.querySelector('.v251-current-title b');
    if(currentBold && wanted){
      currentBold.textContent=(ri===9 ? `10 · ${wanted}` : `${ri+1} · ${wanted}`);
    }
    const currentSpan=card.querySelector('.v251-current-title span');
    if(currentSpan){
      const hp=enemyHp(di,ri);
      currentSpan.textContent = ri===9
        ? `BOSS · Empfohlen Level ${roomLevel(di,ri)} · ${hp} HP`
        : `Empfohlen Level ${roomLevel(di,ri)} · ${hp} HP`;
    }
    forceThumb(card.querySelector('.v251-current-icon'), art, '👹');
    forceThumb(card.querySelector('.v261-thumb'), art, '👹');

    const line1=card.querySelector('.v261-line1');
    if(line1 && wanted){
      line1.textContent = ri===9 ? `10 · ${wanted} – BOSS` : `${ri+1} · ${wanted}`;
    }
    const line2=card.querySelector('.v261-line2');
    if(line2){
      const hp=enemyHp(di,ri);
      line2.textContent = `${ri===9?'BOSS':'Gegner'} · Empfohlen Level ${roomLevel(di,ri)} · ${hp} HP`;
    }
  }

  const battleName=document.getElementById('enemyBattleName');
  if(battleName && wanted)battleName.textContent=wanted;
  const enemyName=document.getElementById('enemyName');
  if(enemyName && wanted)enemyName.textContent=wanted;
}
function kick(){
  syncAllData();
  syncVisible();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(kick,0),{once:true});
window.addEventListener('pageshow',()=>setTimeout(kick,50),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(kick,80),{passive:true});
document.addEventListener('click',e=>{
  const el=e.target instanceof Element?e.target.closest('#dungeon [data-v261-room], #dungeon #v251EnterCurrent, #dungeon .v251-enter, #dungeon .v261-node'):null;
  if(!el)return;
  setTimeout(kick,0);
  setTimeout(kick,120);
},true);
/* V7.308 performance: no permanent 900 ms dungeon repaint loop. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||e?.detail?.screen||'');
  if(id==='dungeon')setTimeout(kick,45);
},{passive:true});
})();
