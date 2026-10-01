/* ===== V4.02 inline vector game art ===== */

function v41Svg(type){
  const baseStart = `<svg class="v41-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">`;
  const end = `</svg>`;
  const arts = {
    barbar: `${baseStart}
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7dc85d"/><stop offset="1" stop-color="#244624"/></linearGradient></defs>
      <circle cx="60" cy="60" r="56" fill="#17251a" stroke="#49684b" stroke-width="4"/>
      <path d="M28 92 Q34 66 47 60 L73 60 Q87 66 92 92" fill="#263329" stroke="#0b100b" stroke-width="4"/>
      <circle cx="60" cy="42" r="20" fill="#cf9367"/>
      <path d="M40 37 Q44 17 62 18 Q79 19 82 36 Q73 29 60 30 Q48 30 40 37" fill="#30231d"/>
      <path d="M37 28 Q59 13 82 27 L79 36 Q59 25 40 36 Z" fill="url(#g1)" stroke="#1d2d1e" stroke-width="3"/>
      <path d="M78 30 L100 34 L80 39 Z" fill="#6eb854"/>
      <circle cx="53" cy="42" r="2.5" fill="#151515"/><circle cx="67" cy="42" r="2.5" fill="#151515"/>
      <path d="M51 51 Q60 57 69 51" fill="none" stroke="#6f3f2c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 95 L42 58" stroke="#7c5c34" stroke-width="9" stroke-linecap="round"/>
      <path d="M16 95 L34 70 L48 78 L31 103 Z" fill="#9d743f" stroke="#342719" stroke-width="3"/>
      <path d="M58 68 l8 8 -8 9 -8-9z" fill="#7dc85d" opacity=".85"/>
    ${end}`,
    scout: `${baseStart}
      <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4f8a4d"/><stop offset="1" stop-color="#17331f"/></linearGradient></defs>
      <circle cx="60" cy="60" r="56" fill="#142018" stroke="#456649" stroke-width="4"/>
      <path d="M28 95 Q32 67 49 60 H72 Q88 68 93 95" fill="#1e3827"/>
      <circle cx="60" cy="42" r="19" fill="#c78f67"/>
      <path d="M39 38 Q44 18 60 18 Q78 18 82 39 Q72 30 59 29 Q48 30 39 38" fill="url(#g2)"/>
      <path d="M38 34 Q57 16 80 33 L75 47 Q61 37 44 47 Z" fill="#284f31" opacity=".9"/>
      <circle cx="52" cy="42" r="2.4" fill="#121212"/><circle cx="67" cy="42" r="2.4" fill="#121212"/>
      <path d="M51 51 Q60 55 69 51" fill="none" stroke="#6e3f2c" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M92 18 Q103 60 88 103" fill="none" stroke="#9b6a37" stroke-width="5"/>
      <path d="M88 26 L65 62" stroke="#c7a15e" stroke-width="2.8"/>
      <path d="M66 61 l8 -2 -4 8z" fill="#c7a15e"/>
      <path d="M54 67 l7 7 -7 8 -7-8z" fill="#76c85b"/>
    ${end}`,
    mage: `${baseStart}
      <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7350a8"/><stop offset="1" stop-color="#22304d"/></linearGradient></defs>
      <circle cx="60" cy="60" r="56" fill="#151921" stroke="#54517a" stroke-width="4"/>
      <path d="M26 96 Q31 66 47 59 H73 Q88 67 94 96" fill="url(#g3)"/>
      <circle cx="60" cy="43" r="19" fill="#c68c66"/>
      <path d="M38 39 Q42 20 60 18 Q77 20 83 39 Q72 29 60 29 Q48 29 38 39" fill="#2d2335"/>
      <path d="M41 28 Q58 5 76 27 L84 44 Q61 34 37 44 Z" fill="#543a79" stroke="#251a35" stroke-width="3"/>
      <circle cx="52" cy="43" r="2.4" fill="#111"/><circle cx="68" cy="43" r="2.4" fill="#111"/>
      <path d="M52 52 Q60 56 68 52" fill="none" stroke="#6e3f2c" stroke-width="2.3" stroke-linecap="round"/>
      <circle cx="94" cy="64" r="15" fill="#6b4eb2" opacity=".9"/>
      <circle cx="94" cy="64" r="8" fill="#b798ff"/>
      <path d="M80 100 L90 71" stroke="#7a5a36" stroke-width="6" stroke-linecap="round"/>
      <path d="M54 68 l8 8 -8 9 -8-9z" fill="#a97be5"/>
    ${end}`,
    merchant: `${baseStart}
      <circle cx="60" cy="60" r="57" fill="#1a241a" stroke="#75613f" stroke-width="4"/>
      <path d="M28 101 Q34 69 48 62 H73 Q88 70 93 101" fill="#4a3823"/>
      <circle cx="60" cy="42" r="21" fill="#c99768"/>
      <path d="M39 36 Q45 18 60 19 Q79 19 83 39 Q70 31 59 31 Q48 31 39 36" fill="#c0b6a7"/>
      <path d="M42 50 Q60 69 79 50 Q72 67 60 70 Q48 67 42 50" fill="#e0d7ca"/>
      <circle cx="53" cy="42" r="2.4"/><circle cx="68" cy="42" r="2.4"/>
      <path d="M47 34 Q53 31 57 34M64 34 Q69 31 74 34" stroke="#73685b" stroke-width="2.5" fill="none"/>
      <circle cx="89" cy="24" r="11" fill="#d4a83f"/><path d="M84 24h10M89 19v10" stroke="#6b5420" stroke-width="2"/>
    ${end}`,
    tavern: `${baseStart}
      <circle cx="60" cy="60" r="57" fill="#241a12" stroke="#7a5a38" stroke-width="4"/>
      <path d="M28 101 Q35 70 49 62 H72 Q87 70 92 101" fill="#3e2c1e"/>
      <circle cx="60" cy="43" r="20" fill="#c89168"/>
      <path d="M39 37 Q43 20 61 19 Q77 20 82 38 Q73 30 61 30 Q49 30 39 37" fill="#4a2f20"/>
      <circle cx="52" cy="43" r="2.5"/><circle cx="68" cy="43" r="2.5"/>
      <path d="M51 53 Q60 59 69 53" fill="none" stroke="#6a3b2b" stroke-width="2.5"/>
      <path d="M90 67 h16 v24 q-8 7-16 0z" fill="#d89b3d" stroke="#5f3b18" stroke-width="3"/>
      <path d="M106 72 q10 0 10 8 q0 8-10 8" fill="none" stroke="#d89b3d" stroke-width="4"/>
    ${end}`,
    sword: `${baseStart}<path d="M70 15 L87 31 L54 64 L61 71 L49 83 L38 72 L49 61 L56 68 L89 35 Z" fill="#cdd8d2" stroke="#4d5d58" stroke-width="3"/><path d="M34 77 L43 86 L26 103 L17 94 Z" fill="#7a5432"/><path d="M39 70 L58 89" stroke="#d4a34b" stroke-width="7"/><circle cx="60" cy="60" r="54" fill="none" stroke="#3c5640" stroke-width="4"/>${end}`,
    armor: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#3c5640" stroke-width="4"/><path d="M34 27 L48 20 H72 L86 27 L92 51 L78 58 L76 99 H44 L42 58 L28 51 Z" fill="#53665a" stroke="#252f29" stroke-width="4"/><path d="M48 20 Q60 34 72 20" fill="none" stroke="#9aaf9d" stroke-width="4"/><path d="M44 45 H76" stroke="#2e3a31" stroke-width="4"/>${end}`,
    helmet: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#3c5640" stroke-width="4"/><path d="M31 63 Q30 27 60 21 Q91 28 89 65 L75 76 H45 Z" fill="#5c6d62" stroke="#29332d" stroke-width="4"/><path d="M45 57 H75" stroke="#1c241f" stroke-width="6"/><path d="M60 23 V82" stroke="#8ea394" stroke-width="3"/>${end}`,
    boots: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#3c5640" stroke-width="4"/><path d="M26 25 H51 V67 Q47 80 29 93 H15 V79 Q28 74 28 62 Z" fill="#5d432d" stroke="#2c2018" stroke-width="4"/><path d="M69 25 H94 V67 Q90 80 72 93 H58 V79 Q71 74 71 62 Z" fill="#6a4a31" stroke="#2c2018" stroke-width="4"/>${end}`,
    ring: `${baseStart}<circle cx="60" cy="68" r="27" fill="none" stroke="#d6b457" stroke-width="10"/><path d="M48 42 L60 25 L72 42 L65 51 H55 Z" fill="#73b8e7" stroke="#2e536d" stroke-width="3"/><circle cx="60" cy="60" r="54" fill="none" stroke="#55482e" stroke-width="4"/>${end}`,
    amulet: `${baseStart}<path d="M31 20 Q60 51 89 20" fill="none" stroke="#c7a85a" stroke-width="5"/><path d="M60 44 L77 64 L60 92 L43 64 Z" fill="#6cb26d" stroke="#2d5932" stroke-width="4"/><circle cx="60" cy="60" r="54" fill="none" stroke="#55482e" stroke-width="4"/>${end}`,
    gem: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#43584a" stroke-width="4"/><path d="M60 18 L88 43 L78 84 L60 103 L42 84 L32 43 Z" fill="#6ac7cf" stroke="#2d7074" stroke-width="4"/><path d="M60 18 L60 103 M32 43 H88 M42 84 L60 43 L78 84" stroke="#b9f2f4" stroke-width="2.5" opacity=".65"/>${end}`,
    scroll: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#55482e" stroke-width="4"/><path d="M35 27 H84 Q92 30 88 39 V91 H39 Q30 86 36 78 Z" fill="#d8c38f" stroke="#6a5937" stroke-width="4"/><path d="M42 43 H78 M42 55 H74 M42 67 H69" stroke="#7c6841" stroke-width="3"/><circle cx="39" cy="82" r="9" fill="#c9ae72" stroke="#6a5937" stroke-width="3"/>${end}`,
    insect: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#533c3c" stroke-width="4"/><ellipse cx="60" cy="61" rx="18" ry="28" fill="#4d6542" stroke="#1f2c1d" stroke-width="4"/><circle cx="60" cy="31" r="12" fill="#657c54"/><path d="M43 50 L20 35 M77 50 L101 35 M43 63 L18 63 M77 63 L103 63 M44 77 L22 94 M76 77 L99 94" stroke="#2c3c29" stroke-width="5" stroke-linecap="round"/><circle cx="56" cy="29" r="2.5" fill="#d85b58"/><circle cx="64" cy="29" r="2.5" fill="#d85b58"/>${end}`,
    boss: `${baseStart}<circle cx="60" cy="60" r="54" fill="none" stroke="#7b4f45" stroke-width="4"/><path d="M31 47 Q38 22 60 24 Q84 23 91 47 L82 82 Q73 100 60 101 Q47 100 38 82 Z" fill="#5a4b42" stroke="#241c1a" stroke-width="4"/><path d="M38 29 L47 13 L55 29 M65 29 L74 13 L83 29" fill="#b68b3f" stroke="#5d431b" stroke-width="3"/><circle cx="49" cy="53" r="4" fill="#e4544e"/><circle cx="71" cy="53" r="4" fill="#e4544e"/><path d="M46 75 Q60 64 74 75" fill="none" stroke="#211716" stroke-width="4"/>${end}`
  };
  return arts[type] || arts.gem;
}

function v41ItemArt(it){
  const id=(it?.id||'').toLowerCase();
  const slot=it?.slot||'';
  const type=it?.type||'';
  if(type==='gem')return v41Svg('gem');
  if(type==='scroll')return v41Svg('scroll');
  if(slot==='weapon'){
    if(id.includes('bow')||id.includes('crossbow'))return v41Svg('sword'); // stylized fallback
    return v41Svg('sword');
  }
  if(slot==='body')return v41Svg('armor');
  if(slot==='head')return v41Svg('helmet');
  if(slot==='boots')return v41Svg('boots');
  if(slot==='ring')return v41Svg('ring');
  if(slot==='amulet')return v41Svg('amulet');
  return v41Svg('gem');
}

function v41ClassPortrait(){
  if(s.playerClass==='summoner'){try{return `<img src="${v080AvatarFor('summoner')}" alt="Harzruferin" style="width:100%;height:100%;object-fit:contain">`}catch(_){}}
  if((s.playerClass==='grower'||s.playerClass==='frost'))return v41Svg('barbar');
  if(s.playerClass==='scout')return v41Svg('scout');
  if(s.playerClass==='bruiser')return v41Svg('mage');
  return v41Svg('barbar');
}

function v41InstallPortrait(){
  const scene=document.querySelector('.avatar-scene');
  if(!scene)return;
  scene.innerHTML=`<div class="v41-portrait">${v41ClassPortrait()}</div>`;
}

function v41InstallNpcBanners(){
  const shop=document.querySelector('#shop');
  if(shop && !shop.querySelector('.v41-npc-banner')){
    const banner=document.createElement('div');
    banner.className='v41-npc-banner';
    banner.innerHTML=`<div class="v41-npc-face">${v41Svg('merchant')}</div><div><div class="v41-npc-title">Bork · Händler von Grünhain</div><div class="v41-npc-sub">„Wenn du Gold hast, habe ich vielleicht genau das Richtige.“</div></div>`;
    shop.insertBefore(banner,shop.firstChild);
  }
  const quests=document.querySelector('#quests');
  if(quests && !quests.querySelector('.v41-npc-banner')){
    const banner=document.createElement('div');
    banner.className='v41-npc-banner';
    banner.innerHTML=`<div class="v41-npc-face">${v41Svg('tavern')}</div><div><div class="v41-npc-title">Mira · Zur krummen Gießkanne</div><div class="v41-npc-sub">Gerüchte, Aufträge und Ärger gibt es hier immer genug.</div></div>`;
    quests.insertBefore(banner,quests.firstChild);
  }
}

function v41UpgradeShopIcons(){
  document.querySelectorAll('.shop-item').forEach(card=>{
    const h=card.querySelector('h3');
    const name=(h?.textContent||'').toLowerCase();
    let item=null;
    const all=[...(s.weaponShop||[]),...(s.magicShop||[]),...(s.inventory||[])];
    item=all.find(x=>(x?.name||'').toLowerCase()===name);
    let icon=card.querySelector('.shop-icon');
    if(icon){
      icon.classList.add('v41-shop-icon');
      icon.innerHTML=v41ItemArt(item||{});
    }
  });
}

function v41UpgradeInventoryIcons(){
  document.querySelectorAll('.inv-item').forEach(card=>{
    const name=(card.querySelector('.item-name')?.textContent||'').trim();
    const item=(s.inventory||[]).find(x=>name.includes(x.name)) || (s.materials||[]).find(x=>name.includes(x.name));
    const title=card.querySelector('.item-name');
    if(title && item){
      title.innerHTML=`<span class="v41-badge-art">${v41ItemArt(item)}</span> ${item.name}`;
    }
  });
}

function v41UpgradeEnemy(){
  const avatar=document.querySelector('#enemyFighter .fighter-avatar');
  if(!avatar)return;
  const di=Math.max(0,Math.min(dungeons.length-1,s.dungeon?.selected||0));
  const ri=Math.max(0,Math.min(9,(s.dungeon?.progress?.[di] ?? s.dungeon?.room ?? 0)));
  const enemy=dungeons?.[di]?.enemies?.[ri];
  avatar.innerHTML=`<div class="v41-enemy-art">${v41Svg(enemy?.boss?'boss':'insect')}</div>`;
}

function v41UpgradeWorldPlaces(){
  const map={
    character:'barbar',
    shop:'merchant',
    grow:'gem',
    quests:'tavern',
    dungeon:'boss'
  };
  document.querySelectorAll('.world-map-place[data-v032-go]').forEach(btn=>{
    const id=btn.dataset.v032Go;
    const icon=btn.querySelector('.wicon');
    if(icon && map[id]){
      icon.innerHTML=`<div class="v41-place-art">${v41Svg(map[id])}</div>`;
    }
  });
}

const v41BaseRender=render;
render=function(){
  v41BaseRender();
  
  v41InstallPortrait();
  try{v4143RefreshBootArt()}catch(e){}
  v41InstallNpcBanners();
  v41UpgradeShopIcons();
  v41UpgradeInventoryIcons();
  v41UpgradeEnemy();
  v41UpgradeWorldPlaces();
};

try{
  render();
}catch(e){console.error('V4.02 art layer',e);}
