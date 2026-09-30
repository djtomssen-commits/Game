(()=>{
'use strict';
if(window.__V8009_DUNGEON_D8_DETAIL_DECORATOR__)return;
window.__V8009_DUNGEON_D8_DETAIL_DECORATOR__=true;

const D1_BG='assets/v7198-base64/29f985c0f598ee45e47a.webp';
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
function balancedTitle(text){
  const words=String(text||'').trim().split(/\s+/).filter(Boolean);
  if(words.length<3)return words.map(w=>w.toUpperCase()).join(' ');
  let best=1,score=Infinity;
  for(let i=1;i<words.length;i++){
    const a=words.slice(0,i).join(' ').length,b=words.slice(i).join(' ').length;
    const next=Math.abs(a-b)+(Math.max(a,b)>18?8:0);
    if(next<score){score=next;best=i}
  }
  return `${words.slice(0,best).join(' ').toUpperCase()}<br>${words.slice(best).join(' ').toUpperCase()}`;
}
function applyPositions(card,pos){
  card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
    const p=pos[i];if(!p)return;
    node.style.setProperty('--x',String(p[0]));
    node.style.setProperty('--y',String(p[1]));
  });
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

  if(di===0){
    if(title){
      let name='';
      try{name=window.dungeons?.[di]?.name??dungeons?.[di]?.name??title.textContent}catch(_){name=title.textContent}
      title.innerHTML=balancedTitle(name);
    }
    const bg=card.querySelector('.v261-bg');
    if(bg&&!bg.style.backgroundImage)bg.style.backgroundImage=`url("${D1_BG}")`;
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

/* Compatibility only for surviving D1 polish scripts. These aliases do not
   own renderDungeon and do not replace the canonical v261 owner. */
const base=window.v261RenderDetail;
if(typeof base==='function'){
  const compat=function(){
    const out=base.apply(this,arguments);
    try{decorate()}catch(_){}
    return out;
  };
  compat.__v8009DetailDecoratorCompat=true;
  window.v426RenderDetail=compat;
  window.v427RenderDetail=compat;
  try{v426RenderDetail=compat}catch(_){}
  try{v427RenderDetail=compat}catch(_){}
}
})();