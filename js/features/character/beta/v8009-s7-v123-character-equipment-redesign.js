window.__V7126_CHARACTER_CHURN__=window.__V7126_CHARACTER_CHURN__||{slotWrites:0,effectWrites:0,summaryWrites:0};
/* ===== V4.02 Equipment presentation ===== */
const V123_SLOT_META={head:['','Kopf'],weapon:['','Waffe'],weapon2:['','Waffe II'],ring:['','Ring'],body:['','Rüstung'],boots:['','Schuhe'],amulet:['','Amulett']};
function v123QualityKey(it){
  const q=String(it?.quality||'').toLowerCase();
  const r=String(it?.rarity||'').toLowerCase();
  if(q.includes('cyan')||q.includes('myst')||r.includes('cyan')||r.includes('myst'))return 'cyan';
  if(q.includes('orange')||q.includes('legend')||r.includes('orange')||r.includes('legend'))return 'orange';
  if(q.includes('purple')||q.includes('epic')||q.includes('episch')||r.includes('epic'))return 'purple';
  if(q.includes('blue')||q.includes('rare')||r.includes('rare'))return 'blue';
  if(q.includes('green')||q.includes('gewöhn')||r.includes('green'))return 'green';
  return 'gray';
}
function v123RarityLabel(it){
  const k=v123QualityKey(it);
  return {gray:'Normal',green:'Gewöhnlich',blue:'Rare',purple:'Episch',orange:'Legendär',cyan:'Mystisch'}[k];
}
function v123BaseBonusText(it){
  if(!it?.bonus)return 'Keine Grundwerte';
  const map={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück',growSkill:'Grow-Skill'};
  return Object.entries(it.bonus)
    .filter(([k,v])=>Number(v) && !['gem','enchant'].includes(k))
    .map(([k,v])=>`+${v} ${map[k]||k}`)
    .join(' · ') || 'Keine Grundwerte';
}
function v123EffectHtml(it){
  let h='<div class="v123-item-effects">';
  if(it?.gem)h+=`<div class="v123-effect v123-gem">💎 ${it.gem.name}: +${it.gem.value} ${String(it.gem.stat||'')}</div>`;
  const e=it?.enchant || (Array.isArray(it?.enchants)?it.enchants[0]:null);
  if(e)h+=`<div class="v123-effect v123-enchant">📜 ${e.name}: ${String(e.effect||'')}</div>`;
  if(it?.setName)h+=`<div class="v123-effect v123-set">◆ ${it.setName}-Set</div>`;
  h+='</div>';
  return h;
}
function v123GearTotals(){
  const total={staerke:0,geschick:0,intelligenz:0,ausdauer:0,glueck:0};
  Object.values(s.equipment||{}).filter(Boolean).forEach(it=>{
    Object.keys(total).forEach(k=>total[k]+=Number(it?.bonus?.[k])||0);
  });
  return total;
}
function v123InstallSummary(){
  const hero=document.querySelector('#character .center-hero');
  if(!hero)return;
  let box=hero.querySelector('.v123-gear-summary');
  if(!box){
    box=document.createElement('div');
    box.className='v123-gear-summary';
    hero.prepend(box);
  }
  const t=v123GearTotals();
  const html=`<span class="v123-gear-chip">💪 <b>+${t.staerke}</b></span><span class="v123-gear-chip">❤️ <b>+${t.ausdauer}</b></span><span class="v123-gear-chip">🎯 <b>+${t.geschick}</b></span><span class="v123-gear-chip">🍀 <b>+${t.glueck}</b></span>`;
  if(box.innerHTML!==html){box.innerHTML=html;window.__V7126_CHARACTER_CHURN__.summaryWrites++;}
}
function v123EnsureDetail(){
  if(document.querySelector('#v123ItemOverlay'))return;
  const ov=document.createElement('div');
  ov.id='v123ItemOverlay';
  ov.innerHTML='<div class="v123-detail" id="v123ItemDetail"></div>';
  ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};
  document.body.appendChild(ov);
}
function v123OpenItem(slot){
  const it=s.equipment?.[slot];if(!it)return;
  v123EnsureDetail();
  const ov=document.querySelector('#v123ItemOverlay');
  const box=document.querySelector('#v123ItemDetail');
  const e=it.enchant || (Array.isArray(it.enchants)?it.enchants[0]:null);
  box.innerHTML=`
    <div class="v123-detail-head">
      <div class="v123-detail-icon">${window.v6107ItemImgHtml?.(it,'v123-detail-art')||it.icon||'🎁'}</div>
      <div class="v123-detail-name">${it.name}</div>
      <div class="v123-detail-rarity">${v123RarityLabel(it)} · ${V123_SLOT_META[slot]?.[1]||slot}</div>
    </div>
    <div class="v123-detail-section"><b>Attribute</b><div>${v123BaseBonusText(it)}</div></div>
    ${it.gem?`<div class="v123-detail-section"><b>💎 Sockelstein</b><div>${it.gem.name} · +${it.gem.value} ${String(it.gem.stat||'')}</div></div>`:''}
    ${e?`<div class="v123-detail-section"><b>📜 Verzauberung</b><div>${e.name} · ${String(e.effect||'')}</div></div>`:''} ${it.mysticSpecial?`<div class="v123-detail-section v297-mystic-detail"><b>✨ Mystischer Spezialeffekt</b><div>${String(it.mysticSpecial?.label||'Spezialeffekt')}</div></div>`:''}
    ${it.setName?`<div class="v123-detail-section"><b>◆ Set</b><div>${it.setName}-Set</div></div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:11px">
      <button class="btn secondary" onclick="document.querySelector('#v123ItemOverlay').classList.remove('show');unequip('${slot}')">Ablegen</button>
      <button class="btn gold" onclick="document.querySelector('#v123ItemOverlay').classList.remove('show');sellEquipped('${slot}')">💰 ${sellValue(it)}</button>
    </div>
    <button class="btn secondary" style="width:100%;margin-top:7px" onclick="document.querySelector('#v123ItemOverlay').classList.remove('show')">Schließen</button>`;
  ov.classList.add('show');
}
window.v123OpenItem=v123OpenItem;

function v123InstallDelegatedSlotDetails(){
  if(window.__V123_SLOT_DETAIL_DELEGATE__)return;
  window.__V123_SLOT_DETAIL_DELEGATE__=true;
  const slots=new Set(['head','weapon','weapon2','ring','body','boots','amulet']);
  document.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target.closest('#character [id^="slot-"]'):null;
    if(!target)return;
    if(e.target instanceof Element&&e.target.closest('button,a,input,select,textarea'))return;
    const slot=String(target.id||'').replace(/^slot-/,'');
    if(!slots.has(slot))return;
    if(!s?.equipment?.[slot])return;
    e.preventDefault();
    e.stopPropagation();
    v123OpenItem(slot);
  },true);
}

function v123PolishEquipment(){
  Object.keys(V123_SLOT_META).forEach(sl=>{
    const el=document.querySelector('#slot-'+sl);
    const it=s.equipment?.[sl];
    if(!el)return;

    ['v123-gray','v123-green','v123-blue','v123-purple','v123-orange','v123-cyan'].forEach(c=>el.classList.remove(c));
    el.classList.add('v123-'+v123QualityKey(it));

    if(!it)return;

    const tiny=el.querySelector('.tiny');
    if(tiny)tiny.textContent=v123BaseBonusText(it);

    const effectsHtml=v123EffectHtml(it);
    const existingEffects=el.querySelector('.v123-item-effects');
    const effectsSig=[
      it?.gem?.name||'',it?.gem?.stat||'',Number(it?.gem?.value)||0,
      ((Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant))?.name||'',
      ((Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant))?.effect||'',
      Number(((Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant))?.value)||0,
      it?.setName||''
    ].join('|');
    if(el.dataset.v7126EffectsSig!==effectsSig||!existingEffects){
      existingEffects?.remove();
      const actions=el.querySelector('.slot-actions');
      if(actions)actions.insertAdjacentHTML('beforebegin',effectsHtml);
      el.dataset.v7126EffectsSig=effectsSig;
      window.__V7126_CHARACTER_CHURN__.effectWrites++;
    }

    el.onclick=e=>{
      if(e.target.closest('button'))return;
      v123OpenItem(sl);
    };
    el.title='Antippen für Item-Details';
  });
  v123InstallSummary();
}
window.v123PolishEquipment=v123PolishEquipment;
try{v123InstallDelegatedSlotDetails()}catch(e){}
try{v123EnsureDetail()}catch(e){}
