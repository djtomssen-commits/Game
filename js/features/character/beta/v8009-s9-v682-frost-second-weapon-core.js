(function(){
'use strict';
if(window.__V682_FROST_SECOND_WEAPON__)return;
window.__V682_FROST_SECOND_WEAPON__=true;

function rarityColor(it){
  const q=String(it?.quality||it?.rarity||it?.grade||'').toLowerCase();
  if(/myst|cyan|türkis|tuerkis/.test(q))return'#31e7e2';
  if(/legend|orange/.test(q))return'#f0a13a';
  if(/epic|episch|purple|lila/.test(q))return'#b75be8';
  if(/rare|selten|blue|blau/.test(q))return'#36a7ef';
  if(/gewöhn|gewoehn|green|grün|gruen/.test(q))return'#64c969';
  return'#8b9790';
}
function itemLevel(it){
  if(!it)return 0;
  const n=Number(it.level??it.dropLevel??it.itemLevel??it.reqLevel??it.sourceLevel??0);
  return Number.isFinite(n)&&n>0?Math.round(n):Math.max(1,Number(s?.level)||1);
}

function paintFallback(slot){
  const it=s?.equipment?.weapon2||null;
  let art=it?.icon||'⚔️';
  try{
    const u=window.v466ItemArtUri?.(it)||'';
    if(u)art=`<img class="v466-item-art v470-slot-art" src="${u}" alt="${String(it?.name||'Waffe II').replace(/["<>]/g,'')}">`;
  }catch(e){}
  slot.className='slot'+(it?.rarity?(' '+it.rarity):'');
  slot.innerHTML=`<div class="slot-icon">${art}</div><div class="slot-label">Waffe II · 10 % Attribute</div><div class="slot-name">${it?it.name:'Leer'}</div>${it?`<div class="tiny">${typeof itemBonus==='function'?itemBonus(it):''}</div><div class="slot-actions"><button class="mini-btn" onclick="unequip('weapon2')">Ablegen</button><button class="mini-btn" onclick="sellEquipped('weapon2')">💰 ${typeof sellValue==='function'?sellValue(it):0}</button></div>`:''}`;
  slot.onclick=e=>{if(e.target.closest('button'))return;try{v123OpenItem('weapon2')}catch(_){}};
}

function sync(){
  const ch=document.getElementById('character');
  if(!ch)return;
  const frost=String(s?.playerClass||'')==='frost';
  ch.classList.toggle('v4153-frost',frost);

  if(!frost){
    document.getElementById('slot-weapon2')?.remove();
    return;
  }

  s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
  if(!Object.prototype.hasOwnProperty.call(s.equipment,'weapon2'))s.equipment.weapon2=null;

  let slot=document.getElementById('slot-weapon2');

  /* Erst den bereits vorhandenen Frost-Renderer nutzen, damit Item, Buttons
     und bestehende Zweiklingen-Regeln nicht dupliziert werden. */
  if(!slot){
    try{window.v4153RefreshFrostUi?.('v6.82-slot-create')}catch(e){}
    slot=document.getElementById('slot-weapon2');
  }

  if(!slot){
    slot=document.createElement('div');
    slot.id='slot-weapon2';
    slot.className='slot';
    paintFallback(slot);
  }else if(!slot.querySelector('.slot-icon')){
    paintFallback(slot);
  }

  /* Entscheidender Fix: V5.10 hatte nur Kopf/Waffe/Ring ins neue sichtbare
     Heldenquartier verschoben. Waffe II blieb im ausgeblendeten alten Grid. */
  const left=document.querySelector('#v510HeroRoot .v510-left');
  const main=document.getElementById('slot-weapon');
  if(left){
    if(main&&main.parentElement===left){
      if(slot.parentElement!==left || slot.previousElementSibling!==main){
        main.insertAdjacentElement('afterend',slot);
      }
    }else if(slot.parentElement!==left){
      left.appendChild(slot);
    }
  }

  const it=s?.equipment?.weapon2||null;
  slot.style.setProperty('--v514-rarity',rarityColor(it));

  let lvl=slot.querySelector('.v514-slot-level');
  if(it){
    if(!lvl){lvl=document.createElement('div');lvl.className='v514-slot-level';slot.appendChild(lvl)}
    lvl.textContent=`Lv.${itemLevel(it)}`;
  }else{
    lvl?.remove();
  }

  const mainLabel=document.getElementById('slot-weapon')?.querySelector('.slot-label');
  if(mainLabel)mainLabel.textContent='Waffe I · 100 %';
  const offLabel=slot.querySelector('.slot-label');
  if(offLabel)offLabel.textContent='Waffe II · 10 % Attribute';
}

let queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;sync()});
}

document.addEventListener('DOMContentLoaded',schedule,{once:true});
window.addEventListener('pageshow',schedule,{passive:true});
window.addEventListener('growlegends:account-ready',()=>{schedule();setTimeout(schedule,120);setTimeout(schedule,500)});
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-nav="character"],#character,#v514HeroTabs,#v459CharacterTabs'))setTimeout(schedule,0);
},true);

const ch=document.getElementById('character');
/* V7.308: no whole-character MutationObserver. Hero render/navigation hooks keep this current. */
window.v682SyncFrostWeapon=sync;

window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')schedule()},{passive:true});
})();
