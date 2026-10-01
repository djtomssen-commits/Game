(()=>{
'use strict';
if(window.__V6201_WORLD_BOSS_REAL_ART__)return;
window.__V6201_WORLD_BOSS_REAL_ART__=true;

const ART="assets/v7198-base64/6dcb5b08e22d3bbdc409.webp";
let hpObserver=null,logObserver=null,setupTimer=null,deathLockUntil=0;

function bossArt(){
  return `<div class="v111-boss-scene v6201-real-scene" id="v111BossScene" aria-label="Smaragd-Koloss">
    <img class="v6201-boss-art" src="${ART}" alt="Smaragd-Koloss">
    <div class="v6201-boss-dark"></div>
    <div class="v6201-aura"></div>
    <div class="v6201-fog"></div>
    <div class="v6201-hitflash"></div>
    <div class="v6201-damage-layer" id="v6201DamageLayer"></div>
    <div class="v6201-phase-label" id="v6201ScenePhase">SMARAGD-KOLOSS</div>
  </div>`;
}
window.v6201WorldBossArt=bossArt;
try{v111BossArt=bossArt;window.v111BossArt=bossArt}catch(e){console.warn('V6.201 boss art owner',e)}

function parseHp(text){
  const m=String(text||'').replace(/\./g,'').match(/(\d+)\s*\/\s*(\d+)/);
  return m?{cur:Number(m[1])||0,max:Math.max(1,Number(m[2])||1)}:null;
}
function pulseClass(scene,cls,ms){
  if(!scene)return;
  scene.classList.remove(cls);void scene.offsetWidth;scene.classList.add(cls);
  setTimeout(()=>scene?.classList.remove(cls),ms);
}
function popup(text,type='normal',x=null,y=null){
  const layer=document.getElementById('v6201DamageLayer');
  if(!layer)return;
  const d=document.createElement('div');
  d.className='v6201-dmg '+type;d.textContent=text;
  d.style.left=(x??(43+Math.random()*17))+'%';d.style.top=(y??(35+Math.random()*20))+'%';
  layer.appendChild(d);setTimeout(()=>d.remove(),1200);
}
function impact(){
  const scene=document.getElementById('v111BossScene');if(!scene)return;
  const i=document.createElement('div');i.className='v6201-impact';
  i.style.left=(42+Math.random()*18)+'%';i.style.top=(35+Math.random()*24)+'%';
  scene.appendChild(i);i.style.animation='v6201Impact .55s ease-out forwards';setTimeout(()=>i.remove(),650);
}
function playerAttackFlavor(){
  const lines=String(document.getElementById('v110Log')?.textContent||'').split('\n').filter(Boolean);
  const line=[...lines].reverse().find(x=>!/Koloss trifft|Smaragd-Koloss hat dich/i.test(x))||'';
  const hm=line.match(/\+\s*(\d+)\s*LP/i);
  return {crit:/krit|kritisch|wucht|perfekt|supernova|kettenreaktion/i.test(line),heal:hm?Number(hm[1]):0};
}
function syncPhase(){
  const scene=document.getElementById('v111BossScene'),label=document.getElementById('v6201ScenePhase');
  const phase=String(document.getElementById('v110Phase')?.textContent||'');
  if(!scene)return;
  const p2=/RASEREI/i.test(phase),p3=/LETZTE/i.test(phase);
  scene.classList.toggle('phase2',p2);scene.classList.toggle('phase3',p3);
  if(label)label.textContent=p3?'LETZTE BLÜTE':p2?'SMARAGD-RASEREI':'SMARAGD-KOLOSS';
}
function install(){
  clearTimeout(setupTimer);
  const scene=document.getElementById('v111BossScene');
  const bossTxt=document.getElementById('v110BossHpTxt'),playerTxt=document.getElementById('v110PlayerHpTxt');
  const log=document.getElementById('v110Log');
  if(!scene||!bossTxt||!playerTxt){setupTimer=setTimeout(install,80);return}
  if(scene.dataset.v6201Fx==='1')return;
  scene.dataset.v6201Fx='1';

  try{hpObserver?.disconnect()}catch(_){}
  try{logObserver?.disconnect()}catch(_){}

  let prevBoss=parseHp(bossTxt.textContent),prevPlayer=parseHp(playerTxt.textContent);

  hpObserver=new MutationObserver(()=>{
    const b=parseHp(bossTxt.textContent),p=parseHp(playerTxt.textContent);
    syncPhase();

    if(b&&prevBoss){
      const dmg=Math.max(0,prevBoss.cur-b.cur);
      if(dmg>0){
        const f=playerAttackFlavor();pulseClass(scene,'v6201-hit',360);impact();
        popup(`${f.crit?'💥 ':''}-${Math.round(dmg).toLocaleString('de-DE')}`,f.crit?'crit':'normal');
        if(f.heal>0)popup(`+${Math.round(f.heal).toLocaleString('de-DE')} LP`,'heal',70,58);
      }
      const pct=b.cur/b.max;
      if(Date.now()>deathLockUntil){
        scene.classList.toggle('phase2',pct<=.60&&pct>.25);
        scene.classList.toggle('phase3',pct<=.25&&b.cur>0);
      }
    }
    if(p&&prevPlayer){
      const dmg=Math.max(0,prevPlayer.cur-p.cur);
      if(dmg>0){pulseClass(scene,'v6201-attacking',520);popup(`-${Math.round(dmg).toLocaleString('de-DE')} HP`,'boss-hit',50,77)}
    }
    prevBoss=b||prevBoss;prevPlayer=p||prevPlayer;
  });
  hpObserver.observe(bossTxt,{childList:true,subtree:true,characterData:true});
  hpObserver.observe(playerTxt,{childList:true,subtree:true,characterData:true});

  if(log){
    logObserver=new MutationObserver(()=>{
      const t=String(log.textContent||'');
      if(/IST GEFALLEN|MYSTISCHER SIEG/i.test(t)){
        deathLockUntil=Date.now()+2600;
        scene.classList.remove('v6201-victory','v6201-attacking','v6201-hit');scene.classList.add('v6201-dead');
        popup('🏆 BESIEGT','crit',50,28);
        setTimeout(()=>scene?.classList.remove('v6201-dead'),2800);
      }else if(/hat dich besiegt|nicht bezwungen/i.test(t)){
        scene.classList.remove('v6201-dead');pulseClass(scene,'v6201-victory',1650);
      }
      syncPhase();
    });
    logObserver.observe(log,{childList:true,subtree:true,characterData:true});
  }
  syncPhase();
}

const baseEnsure=(typeof window.v110EnsureOverlay==='function'?window.v110EnsureOverlay:(typeof v110EnsureOverlay==='function'?v110EnsureOverlay:null));
if(typeof baseEnsure==='function'&&!baseEnsure.__v6201Art){
  const wrapped=function(){
    const r=baseEnsure.apply(this,arguments);
    setTimeout(()=>{
      const scene=document.getElementById('v111BossScene');
      if(scene&&!scene.classList.contains('v6201-real-scene')){
        const holder=document.createElement('div');holder.innerHTML=bossArt();scene.replaceWith(holder.firstElementChild);
      }
      install();
    },0);
    return r;
  };
  wrapped.__v6201Art=true;
  try{v110EnsureOverlay=wrapped}catch(_){}
  window.v110EnsureOverlay=wrapped;
}

document.addEventListener('click',e=>{
  if(e.target?.closest?.('#v110Fight')){
    setTimeout(()=>{const scene=document.getElementById('v111BossScene');if(scene){scene.classList.remove('v6201-dead','v6201-victory');install()}},30);
  }
},true);

/* V7.308 performance: document-wide worldboss observer retired; ensure/click hooks above own installation. */
window.addEventListener('pageshow',()=>{if(document.getElementById('v110Overlay')?.classList.contains('show'))install()},{passive:true});

setTimeout(()=>{try{document.getElementById('v110Overlay')?.remove()}catch(_){}},50);
})();
