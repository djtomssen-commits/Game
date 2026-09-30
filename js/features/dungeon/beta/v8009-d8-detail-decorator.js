(()=>{
'use strict';
if(window.__V8009_DUNGEON_D8_DETAIL_DECORATOR__)return;
window.__V8009_DUNGEON_D8_DETAIL_DECORATOR__=true;

const D1_BG='assets/v7198-base64/29f985c0f598ee45e47a.webp';
const D1_NAMES=['Blattkriecher','Wurzelbeißer','Spinnmilben-Brut','Kleeblattkriecher','Netzjäger','Giftspringer','Brutwächter','Kellerweber','Kokonhüter','Milbenkönigin'];
const D1_ICONS=['🪰','🐛','🍄','🌿','🕷️','🐸','🐛','🕷️','🥚','🕷️'];
const D1_ROAD='14,15 28,17 43,19 56,21 67,23 77,26 83,31 71,35 56,39 37,43 19,49 30,54 40,61 49,68 57,75 66,70 74,64 81,58 89,50 86,62 83,74 80,85';
/* Sprint 2: preserve the former v426-pos-fix default geometry without wrapping
   v261RenderDetail. D1/D6/D7 special layouts override these defaults below. */
const DEFAULT_POS=[[11,18],[35,20],[60,25],[84,31],[11,46],[31,58],[51,68],[70,59],[86,47],[82,78]];
const D6_POS=[[12,17],[37,21],[63,25],[86,31],[12,45],[34,58],[53,68],[71,59],[88,47],[83,80]];
const D7_POS=[[13,16],[38,20],[63,25],[86,30],[13,46],[35,59],[53,70],[70,61],[87,48],[83,82]];

function index(){
  try{if(typeof window.v048DungeonIndex==='function')return Math.max(0,Math.min(19,Number(window.v048DungeonIndex())||0))}catch(_){}
  try{return Math.max(0,Math.min(19,Number(window.s?.dungeon?.selected??s?.dungeon?.selected)||0))}catch(_){return 0}
}
function cleanName(value){
  return String(value||'')
    .replace(/\s+\d+\.\d+\s*$/,'')
    .replace(/\s*[–—-]\s*BOSS\s*$/i,'')
    .trim();
}
function applyPositions(card,pos){
  card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
    const p=pos[i];if(!p)return;
    node.style.setProperty('--x',String(p[0]));
    node.style.setProperty('--y',String(p[1]));
  });
}
function normalizeD1Data(card){
  try{
    if(typeof V064_D1_NAMES!=='undefined'&&Array.isArray(V064_D1_NAMES)){
      D1_NAMES.forEach((name,i)=>{V064_D1_NAMES[i]=name});
    }
  }catch(_){}
  try{
    const list=window.dungeons?.[0]?.enemies??dungeons?.[0]?.enemies;
    list?.forEach((enemy,i)=>{
      if(D1_NAMES[i])enemy.name=D1_NAMES[i];
      if(D1_ICONS[i])enemy.icon=D1_ICONS[i];
    });
  }catch(_){}
  card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
    const name=node.querySelector('.v261-name');
    if(name&&D1_NAMES[i])name.textContent=D1_NAMES[i];
  });
  try{
    const line1=card.querySelector('.v261-line1');
    if(line1&&!/DUNGEON ABGESCHLOSSEN/i.test(String(line1.textContent||''))){
      let ri=Math.max(0,Math.min(9,Number(window.v048RoomIndex?.(0))||0));
      line1.textContent=`${ri+1} · ${D1_NAMES[ri]||''}${ri===9?' – BOSS':''}`;
    }
  }catch(_){}
}
function cleanRoomNames(card){
  card.querySelectorAll('.v261-name').forEach(el=>{el.textContent=cleanName(el.textContent)});
  const line1=card.querySelector('.v261-line1');
  if(line1){
    const t=String(line1.textContent||'').replace(/\s*[–—-]\s*BOSS\s*[–—-]\s*BOSS\s*$/i,' – BOSS');
    line1.textContent=t.replace(
      /(\d+\s*·\s*)(.*?)(\s*[–—-]\s*BOSS)?$/i,
      (m,a,b,c)=>a+cleanName(b)+(c?' – BOSS':'')
    );
  }
}
function decorate(){
  const card=document.getElementById('dungeonMapCard');
  if(!card)return false;
  const di=index();

  card.classList.toggle('v426-ref-d1',di===0);
  card.classList.toggle('v427-d6',di===5);
  card.classList.toggle('v432-d7',di===6);

  const title=card.querySelector('.v261-title');
  const sign=card.querySelector('.v261-signboard');

  applyPositions(card,DEFAULT_POS);

  if(di===0){
    normalizeD1Data(card);
    if(title)title.innerHTML='DER<br>VERSEUCHTE<br>KELLER';
    const bg=card.querySelector('.v261-bg');
    if(bg&&!bg.style.backgroundImage)bg.style.backgroundImage=`url("${D1_BG}")`;
    card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points',D1_ROAD));
    if(sign)sign.innerHTML='ACHTUNG<br>VERSEUCHTER KELLER<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
    /* D1 thumb ownership stays canonical in v8009-d2-visual-owner.js.
       Historical v454/v459/v460 thumb repaint races are intentionally retired. */
  }else if(di===5){
    if(title)title.textContent='DIE SCHIMMELMINEN';
    applyPositions(card,D6_POS);
    cleanRoomNames(card);
    if(sign)sign.innerHTML='ACHTUNG<br>SCHIMMELGEFAHR<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
  }else if(di===6){
    if(title)title.innerHTML='DER VERBOTENE<br>GEWÄCHSHAUSTRAKT';
    applyPositions(card,D7_POS);
    cleanRoomNames(card);
    if(sign)sign.innerHTML='ACHTUNG<br>VERBOTENES<br>GEWÄCHSHAUS<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
  }
  return true;
}
window.v8009DungeonDetailDecorate=decorate;

})();