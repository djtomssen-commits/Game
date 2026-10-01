(function(){
'use strict';
if(window.__V686_PET_ALBUM__)return;
window.__V686_PET_ALBUM__=true;

const PETS=[
{id:'bud_hase',name:'Bud-Hase',emoji:'🐰',desc:'Schnell, flauschig, legendär.',bonus:{type:'gold',value:3,label:'% Gold'},title:'Nebeljäger'},
{id:'rauch_fuchs',name:'Rauch-Fuchs',emoji:'🦊',desc:'Schlau wie der Nebel.',bonus:{type:'xp',value:3,label:'% EXP'},title:'Erntewächter'},
{id:'hash_igel',name:'Hash-Igel',emoji:'🦔',desc:'Klein, stachelig, harzig.',bonus:{type:'hp',value:150,label:' HP'},title:'Harzpanzer'},
{id:'blatt_eule',name:'Blatt-Eule',emoji:'🦉',desc:'Sie sieht, was andere nicht sehen.',bonus:{type:'strength',value:8,label:' Stärke'},title:'Blattseher'},
{id:'trichom_frosch',name:'Trichom-Frosch',emoji:'🐸',desc:'Klein, klebrig, macht high.',bonus:{type:'crit',value:1.5,label:'% Krit'},title:'Trichommeister'},
{id:'bud_buddy',name:'Bud-Buddy',emoji:'🌿',desc:'Ein kleiner Bud mit großem Ego.',bonus:{type:'dampf',value:5,label:' max. Dampf'},title:'Bud-Baron'},
{id:'haze_hase',name:'Haze-Hase',emoji:'🐇',desc:'Immer einen Sprung voraus.',bonus:{type:'quest_xp',value:2,label:'% Quest-EXP'},title:'Dunstläufer'},
{id:'og_katze',name:'OG-Katze',emoji:'🐱',desc:'Neun Leben, eine OG-Seele.',bonus:{type:'dungeon_gold',value:2,label:'% Dungeon-Gold'},title:'OG-Legende'},
{id:'ganja_gecko',name:'Ganja-Gecko',emoji:'🦎',desc:'Klebt an jeder guten Wand.',bonus:{type:'dex',value:4,label:' Geschick'},title:'Wandkrabbler'},
{id:'skunkster',name:'Skunkster',emoji:'🦨',desc:'Man riecht ihn vor dem Drop.',bonus:{type:'stamina',value:4,label:' Ausdauer'},title:'Stinkekönig'},
{id:'chill_kraehe',name:'Chill-Krähe',emoji:'🐦\u200d⬛',desc:'Sie weiß, wo die Beute liegt.',bonus:{type:'int',value:4,label:' Intelligenz'},title:'Nebelrufer'},
{id:'bong_schildkroete',name:'Bong-Schildkröte',emoji:'🐢',desc:'Langsam. Aber niemals nüchtern.',bonus:{type:'hp',value:100,label:' HP'},title:'Panzerbud'},
{id:'nebel_fuchs',name:'Nebel-Fuchs',emoji:'🦊',desc:'Verschwindet zwischen zwei Zügen.',bonus:{type:'dodge',value:1,label:'% Ausweichen'},title:'Schattenpfote'},
{id:'harz_baer',name:'Harz-Bär',emoji:'🐻',desc:'Groß, klebrig und schlecht gelaunt.',bonus:{type:'harvest',value:2,label:'% Ernte'},title:'Harzkoloss'},
{id:'kush_waschbaer',name:'Kush-Waschbär',emoji:'🦝',desc:'Findet selbst im Müll noch Loot.',bonus:{type:'gold',value:2,label:'% Gold'},title:'Mülltonnen-Mogul'},
{id:'bud_dachs',name:'Bud-Dachs',emoji:'🦡',desc:'Gräbt sich bis zum Endgame durch.',bonus:{type:'strength',value:4,label:' Stärke'},title:'Bud-Brecher'},
{id:'sporen_luchs',name:'Sporen-Luchs',emoji:'🐆',desc:'Leise Pfoten, harter Treffer.',bonus:{type:'crit',value:1,label:'% Krit'},title:'Sporenjäger'},
{id:'kief_maulwurf',name:'Kief-Maulwurf',emoji:'🐹',desc:'Unter Tage kennt er jeden Schatz.',bonus:{type:'xp',value:2,label:'% EXP'},title:'Kiefgräber'},
{id:'shatter_wolf',name:'Shatter-Wolf',emoji:'🐺',desc:'Heult nur bei legendären Drops.',bonus:{type:'damage',value:1.5,label:'% Schaden'},title:'Glasfang'},
{id:'nebel_otter',name:'Nebel-Otter',emoji:'🦦',desc:'Entspannt selbst im Weltboss.',bonus:{type:'hp',value:75,label:' HP'},title:'Dampfgleiter'}
];
const ART={
'bud_hase':'assets/v7198-base64/fe602a0044db66c28ee3.webp',
'rauch_fuchs':'assets/v7198-base64/83c5eac969d9b2279662.webp',
'hash_igel':'assets/v7198-base64/7fcebb58568ac39058eb.webp',
'blatt_eule':'assets/v7198-base64/bc27bf2b37a0df2bb71c.webp',
'trichom_frosch':'assets/v7198-base64/44500c794fff83650542.webp',
'bud_buddy':'assets/v7198-base64/a6204564c986f85e1e8e.webp',
'haze_hase':'assets/v7198-base64/caf3f17a199141759856.webp',
'og_katze':'assets/v7198-base64/a5c1159cd78d0cfb9979.webp',
'ganja_gecko':'assets/v7198-base64/d98a360e4d6bbf6551a8.webp',
'skunkster':'assets/v7198-base64/ba74ea4fc77f9b7e12d0.webp',
'chill_kraehe':'assets/v7198-base64/b67a5a095fd06e150d26.webp',
'bong_schildkroete':'assets/v7198-base64/3eff74a3fbee5f4589ef.webp',
'nebel_fuchs':'assets/v7198-base64/cddb7a34c27506c039b2.webp'
};

const Q=[
  {id:'normal',label:'Normal',color:'#aeb6b2'},
  {id:'green',label:'Grün',color:'#47d45b'},
  {id:'blue',label:'Blau',color:'#36a8ff'},
  {id:'purple',label:'Lila',color:'#c65cff'},
  {id:'orange',label:'Legendär',color:'#ffb020'},
  {id:'cyan',label:'Mythisch',color:'#31e7e2'}
];
const Q_ORDER=Q.map(x=>x.id);
const LEGENDARY_SET=['normal','green','blue','purple','orange'];

let page=0;
let cacheToken=1;
let cache=null;
let lastSummaryToken=0;
let lastPageKey='';
const ART_URL=new Map();

function esc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function state(){
  if(typeof s==='undefined'||!s)return null;
  s.v686PetAlbum=(s.v686PetAlbum&&typeof s.v686PetAlbum==='object')?s.v686PetAlbum:{};
  s.v686PetAlbum.found=(s.v686PetAlbum.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
  s.v686PetAlbum.activeTitle=String(s.v686PetAlbum.activeTitle||'');
  return s.v686PetAlbum;
}
function save(){
  try{persist(false)}catch(e){
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){console.warn('Pet album save failed',e)}
  }
}
function invalidate(){
  cacheToken++;
  cache=null;
  lastSummaryToken=0;
  lastPageKey='';
}
window.v686InvalidatePetCache=invalidate;

function foundRef(){return s?.v686PetAlbum?.found||null}
function hasFast(found,petId,q){return !!found?.[petId]?.[q]}
function has(petId,q){return hasFast(foundRef(),petId,q)}
function completeLegendary(p,found=foundRef()){
  return LEGENDARY_SET.every(q=>hasFast(found,p.id,q));
}
function hasMythic(p,found=foundRef()){
  return Q_ORDER.every(q=>hasFast(found,p.id,q));
}
function buildCache(force=false){
  const currentState=typeof s!=='undefined'?s:null;
  const currentFound=currentState?.v686PetAlbum?.found||null;
  if(!force&&cache&&cache.stateRef===currentState&&cache.foundRef===currentFound&&cache.token===cacheToken)return cache;
  const z=state();
  const found=z?.found||{};
  const bonuses=Object.create(null),completed=[],titles=[];
  let qualities=0;
  for(const p of PETS){
    let legendary=true,allSix=true;
    for(const q of Q_ORDER){
      const owned=hasFast(found,p.id,q);
      if(owned)qualities++;
      if(q!=='cyan'&&!owned)legendary=false;
      if(!owned)allSix=false;
    }
    if(legendary){
      completed.push(p.id);
      const b=p.bonus||{};
      bonuses[b.type]=(Number(bonuses[b.type])||0)+(Number(b.value)||0);
    }
    if(allSix)titles.push(p.id);
  }
  cache={
    token:cacheToken,stateRef:currentState,foundRef:found,
    bonuses,completed,titles,
    stats:{legendary:completed.length,mythic:titles.length,qualities}
  };
  return cache;
}
window.v686GetPetBonusCache=()=>buildCache().bonuses;
window.v686PetBonus=function(type){
  const b=buildCache().bonuses;
  return Number(b[String(type||'')])||0;
};

function artUrl(id){
  if(ART_URL.has(id))return ART_URL.get(id);
  const raw=ART[id];
  if(!raw){ART_URL.set(id,'');return ''}
  /* V7.199: extracted artwork is already a normal URL. Keep the legacy
     data-URI decoder only as a compatibility fallback for old saves/builds. */
  if(!String(raw).startsWith('data:')){ART_URL.set(id,raw);return raw}
  try{
    const comma=raw.indexOf(',');
    const meta=raw.slice(0,comma),data=raw.slice(comma+1);
    const mime=(meta.match(/^data:([^;]+)/)||[])[1]||'image/webp';
    const bin=atob(data),bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:mime}));
    ART_URL.set(id,url);return url;
  }catch(_){ART_URL.set(id,raw);return raw}
}
function portrait(p){
  const uri=artUrl(p.id);
  return uri
    ? `<img src="${uri}" alt="${esc(p.name)}" loading="lazy" decoding="async">`
    : `<span class="emoji" aria-hidden="true">${p.emoji}</span>`;
}
function bonusText(p){const b=p.bonus||{};return `+${Number(b.value)||0}${b.label||''}`}
function activeBonusSummary(){
  const done=new Set(buildCache().completed);
  const arr=PETS.filter(p=>done.has(p.id));
  if(!arr.length)return '<span class="v686-bonus-chip">Noch keine Sammel-Boni aktiv</span>';
  return arr.slice(0,8).map(p=>`<span class="v686-bonus-chip">${p.emoji} ${esc(bonusText(p))}</span>`).join('');
}
function qualityHint(q){
  if(q==='cyan')return 'Mythisch: ausschließlich beim mystischen Boss-Event und mit extrem niedriger Chance.';
  return ({normal:'Normal: häufigste Pet-Qualität.',green:'Grün: seltener als Normal.',blue:'Blau: selten.',purple:'Lila: sehr selten.',orange:'Legendär: extrem selten.'})[q]||'Seltene Pet-Qualität.';
}
function row(p,found){
  const pic=portrait(p);
  const qhtml=Q.map(q=>{
    const owned=hasFast(found,p.id,q.id);
    return `<div class="v686-qslot ${owned?'found':'locked'}" style="--qc:${q.color}" data-pet="${p.id}" data-q="${q.id}"><div class="qlabel" style="color:${q.color}">${q.label}</div><div class="v686-qbox">${pic}</div></div>`;
  }).join('');
  const bonus=completeLegendary(p,found),myth=hasMythic(p,found);
  return `<article class="v686-pet-row"><div class="v686-pet-id"><b class="v686-pet-name">${esc(p.name)}</b><div class="v686-pet-pic">${pic}</div><small class="v686-pet-desc">${esc(p.desc)}</small></div><div class="v686-qgrid">${qhtml}</div><div class="v686-reward"><div class="v686-reward-box ${bonus?'unlocked':'locked'}"><span>Sammel-Bonus<br>(bis Legendär)</span><b>${bonus?'✅':'🔒'} ${esc(bonusText(p))}</b></div><div class="v686-reward-box ${myth?'unlocked v686-title-unlocked':'locked'}"><span>Titel<br>(alle 6 Qualitäten)</span><b>${myth?'👑 '+esc(p.title):'🔒 ???'}</b></div></div></article>`;
}
function ensureOverlay(){
  let ov=document.getElementById('v686PetAlbumOverlay');
  if(ov)return ov;
  ov=document.createElement('div');
  ov.id='v686PetAlbumOverlay';
  ov.innerHTML=`<button type="button" class="v686-close" aria-label="Schließen">×</button><div class="v686-shell"><header class="v686-head v6113-pet-head"><div class="v6113-pet-cover" aria-hidden="true"><span>🐾</span></div><div class="v6113-pet-headcopy"><h2>Pet Sammelalbum</h2><p>Finde seltene Pets, sammle alle Qualitäten und sichere dir Boni + Titel.</p></div></header><section class="v686-summary" id="v686Summary"></section><section class="v686-book"><div class="v686-page" id="v686Page"></div><div class="v686-pager"><button type="button" id="v686Prev">‹</button><div class="v686-page-num" id="v686PageNum">1 / 4</div><button type="button" id="v686Next">›</button></div></section><section class="v686-info"><b>ℹ️ Sammelregeln:</b><br>Jede Pet-Qualität ist pro Tier nur <b>einmal</b> sammelbar. Hast du Normal, Grün, Blau, Lila und Legendär komplett, wird der dauerhafte Reihen-Bonus freigeschaltet. Der einzigartige Titel wird erst freigeschaltet, wenn auch Mythisch gesammelt wurde und damit alle sechs Qualitätsstufen komplett sind.<br>💎 <b>Mythische Pets:</b> nur beim mystischen Boss-Event und später mit sehr niedriger Dropchance.</section><footer class="v686-footer">🌿 SAMMELN · ZÜCHTEN · STÄRKER WERDEN 🌿</footer></div>`;
  document.body.appendChild(ov);
  ov.querySelector('.v686-close').onclick=close;
  ov.querySelector('#v686Prev').onclick=()=>{page=(page+3)%4;renderPage(true)};
  ov.querySelector('#v686Next').onclick=()=>{page=(page+1)%4;renderPage(true)};
  ov.addEventListener('click',e=>{
    const slot=e.target.closest('.v686-qslot');if(!slot)return;
    const p=PETS.find(x=>x.id===slot.dataset.pet),q=slot.dataset.q;if(!p)return;
    const owned=has(p.id,q),msg=owned?`${p.name} · ${Q.find(x=>x.id===q)?.label||q} bereits gesammelt.`:qualityHint(q);
    try{v063Toast(owned?'Bereits gesammelt':'Fundhinweis',owned?'success':'info',msg)}catch(_){alert(msg)}
  });
  return ov;
}
function summaryHtml(){
  const c=buildCache(),st=c.stats;
  return `<div class="v686-summary-card"><b>🐾 Gesammelte Pet-Reihen: ${st.legendary} / ${PETS.length}</b><div class="v686-bar"><i style="width:${Math.round(st.legendary/PETS.length*100)}%"></i></div><small>${st.qualities} / ${PETS.length*Q.length} Qualitätsstufen gefunden · ${st.mythic} mythische Titel freigeschaltet</small></div><div class="v686-summary-card"><b>✨ Aktive Sammel-Boni</b><div class="v686-active-bonuses">${activeBonusSummary()}</div><small>Bonus wird nach kompletter Reihe bis Legendär freigeschaltet.</small></div>`;
}
function renderSummary(force=false){
  const ov=ensureOverlay(),c=buildCache();
  if(!force&&lastSummaryToken===c.token)return;
  ov.querySelector('#v686Summary').innerHTML=summaryHtml();
  lastSummaryToken=c.token;
}
function renderPage(force=false){
  const ov=ensureOverlay(),c=buildCache(),found=c.foundRef||{};
  const key=`${page}|${c.token}`;
  if(!force&&lastPageKey===key)return;
  const start=page*5;
  ov.querySelector('#v686Page').innerHTML=PETS.slice(start,start+5).map(p=>row(p,found)).join('');
  ov.querySelector('#v686PageNum').textContent=`${page+1} / 4`;
  lastPageKey=key;
  try{window.v688DecoratePetAlbum?.()}catch(_){ }
}
function render(force=false){renderSummary(force);renderPage(force)}
function open(){
  state();
  /* Rebuild once on open so cloud-loaded collections are always current. */
  invalidate();
  const ov=ensureOverlay();
  render(true);
  ov.classList.add('show');
  document.documentElement.style.overflow='hidden';
}
function close(){document.getElementById('v686PetAlbumOverlay')?.classList.remove('show');document.documentElement.style.overflow=''}
function ensureButton(){
  const book=document.getElementById('v106BookBtn');if(!book)return;
  let btn=document.getElementById('v686PetAlbumBtn');
  if(!btn){
    btn=document.createElement('button');btn.type='button';btn.id='v686PetAlbumBtn';
    btn.innerHTML='<span class="paw">🐾</span><span class="copy"><span class="title">Pet Sammelalbum</span><span class="info">20 Begleiter · 6 Qualitäten · Boni + Titel</span></span>';
    btn.onclick=()=>window.v686OpenPetAlbum?.();
  }
  const host=book.closest('.v514-book-host');
  if(host){
    host.appendChild(book);
    host.appendChild(btn);
  }else if(book.nextElementSibling!==btn){
    book.insertAdjacentElement('afterend',btn);
  }
  /* Pet indicator reliability: the button may be created long after a drop. */
  queueMicrotask(()=>{try{window.v6104UpdatePetIndicators?.()}catch(_){}});
}

window.v686GrantPet=function(petId,quality,source='',opts=null){
  const p=PETS.find(x=>x.id===petId);if(!p||!Q_ORDER.includes(quality))return false;
  const z=state();if(!z)return false;
  z.found[petId]=(z.found[petId]&&typeof z.found[petId]==='object')?z.found[petId]:{};
  if(z.found[petId][quality])return false;
  z.found[petId][quality]={foundAt:Date.now(),source:String(source||'')};
  invalidate();
  if(!opts?.deferSave)save();
  if(!opts?.deferRender&&document.getElementById('v686PetAlbumOverlay')?.classList.contains('show'))render(true);
  if(!opts?.silent){try{v063Toast('🐾 Neues Pet gefunden!','success',`${p.name} · ${Q.find(x=>x.id===quality)?.label||quality}`)}catch(_){}}
  return true;
};

/* Compatibility groundwork. V6.88 replaces this with source-specific rules. */
window.v686TryPetDrop=function(source=''){
  const z=state();if(!z)return null;
  const src=String(source||''),found=z.found,pool=[];
  for(const p of PETS)for(const q of Q_ORDER){
    if(hasFast(found,p.id,q))continue;
    if(q==='cyan'&&src!=='mythic_boss')continue;
    pool.push({p,q});
  }
  if(!pool.length)return null;
  const chances=src==='mythic_boss'?[['cyan',.0005],['orange',.0015],['purple',.004],['blue',.01],['green',.02],['normal',.04]]:[['orange',.001],['purple',.0035],['blue',.009],['green',.02],['normal',.045]];
  for(const [q,chance] of chances){
    if(Math.random()>=chance)continue;
    const choices=pool.filter(x=>x.q===q);if(!choices.length)continue;
    const pick=choices[Math.floor(Math.random()*choices.length)];
    if(window.v686GrantPet(pick.p.id,pick.q,src))return {petId:pick.p.id,quality:pick.q};
  }
  return null;
};

window.v686OpenPetAlbum=open;
window.v686RefreshPetAlbum=function(force=true){if(document.getElementById('v686PetAlbumOverlay')?.classList.contains('show'))render(!!force)};
window.v686PetDefinitions=PETS;
window.v686PetQualities=Q;

function sync(){state();ensureButton()}
/* Deterministic character hook instead of observing the entire character subtree. */
try{
  if(typeof v106InstallBook==='function'&&!v106InstallBook.__v686PetButton){
    const base=v106InstallBook;
    const wrapped=function(){const r=base.apply(this,arguments);queueMicrotask(ensureButton);return r};
    wrapped.__v686PetButton=true;v106InstallBook=wrapped;try{window.v106InstallBook=wrapped}catch(_){ }
  }
}catch(_){ }
document.addEventListener('DOMContentLoaded',sync,{once:true});
window.addEventListener('pageshow',()=>{invalidate();sync()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{invalidate();sync();setTimeout(sync,120)});
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-screen="character"],[data-go="character"],[data-nav="character"],#character'))setTimeout(sync,0);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
setTimeout(sync,120);
})();
