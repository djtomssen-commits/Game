
/* ===== V4.02 scene and art integration ===== */

/* Use vector item art in equipped slots too */
function v043EquipSlotArt(){
  const slots=['head','weapon','ring','body','boots','amulet'];
  slots.forEach(slot=>{
    const el=document.querySelector('#slot-'+slot);
    if(!el)return;
    const it=s.equipment?.[slot];
    const icon=el.querySelector('.slot-icon');
    if(icon){
      /* V7.127: V6.102/V4.70 own final slot art. Do not repaint the same icon
         inside the old V4.02 render chain; that was visible churn before the
         canonical painter ran. Keep legacy fallback only during very early boot. */
      if(typeof window.v6102PaintEquipmentSlots==='function'||typeof window.v470PaintEquipmentSlots==='function')return;
      const html=v41ItemArt(it||{slot});
      if(icon.innerHTML!==html)icon.innerHTML=html;
    }
  });
}

/* Replace player battle emoji with class portrait */
function v043BattlePlayerArt(){
  /* V6.216: canonical dungeon owner exclusively owns player artwork.
     The old V4.02 portrait container caused the small duplicate character. */
  if(window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__)return;
  const avatar=document.querySelector('#playerFighter .fighter-avatar');
  if(!avatar)return;
  avatar.innerHTML=`<div class="v41-enemy-art">${v41ClassPortrait()}</div>`;
}

/* Add scene title bars to key content cards */
function v043SceneLabels(){
  const labels=[
    ['#character .hero-card','HELDENQUARTIER'],
    ['#grow .hero-card','DEIN GROWROOM'],
    ['#dungeon .card:first-child','VERSEUCHTE GEBIETE'],
    ['#shop .card:not(#v030MagicShop)','BORKS AUSRÜSTUNG'],
    ['#v030MagicShop','SCHMUCK & VERZAUBERUNG']
  ];
  labels.forEach(([sel,title])=>{
    const el=document.querySelector(sel);
    if(!el || el.querySelector(':scope > .v043-scene-title'))return;
    const tag=document.createElement('div');
    tag.className='v043-scene-title';
    tag.style.cssText='position:absolute;right:12px;top:10px;z-index:3;font-size:8px;font-weight:1000;letter-spacing:.12em;color:#7f927f;background:#0c140e;border:1px solid #2d422f;border-radius:999px;padding:4px 7px';
    tag.textContent=title;
    el.appendChild(tag);
  });
}

/* Stronger empty state copy */
function v043EmptyStates(){
  document.querySelectorAll('.empty').forEach(el=>{
    if(el.textContent.includes('Noch keine Ausrüstung gefunden')){
      el.innerHTML='🎒 <b>Noch keine Ausrüstung</b><br><span class="tiny">Besiege Gegner oder besuche den Händler.</span>';
    }
  });
}

const v043BaseRender=render;
render=function(){
  v043BaseRender();
  
  v043EquipSlotArt();
  v043BattlePlayerArt();
  v043SceneLabels();
  v043EmptyStates();
};

try{
  render();
}catch(e){console.error('V4.02 scene layer',e);}
