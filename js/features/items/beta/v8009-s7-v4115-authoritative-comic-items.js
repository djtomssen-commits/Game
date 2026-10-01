(()=>{
 'use strict';
 const VERSION='V4.115 Stable',SHORT='V4.115';
 const A=window.v4106ComicAssets||{};
 const bootsFallback=typeof window.v4111ComicItemArtUri==='function'?window.v4111ComicItemArtUri:null;
 const original4106=typeof window.v4106ComicItemArtUri==='function'?window.v4106ComicItemArtUri:null;
 const text=it=>String(it?.name||'').toLowerCase();
 const prism=it=>!!(it?.v488Prismatic||String(it?.quality||'').toLowerCase()==='prismatic'||/prism/i.test(String(it?.rarity||'')));
 const mystic=it=>/cyan|myst|myth/i.test(String(it?.quality||'')+' '+String(it?.rarity||''));
 function cls(it){
  const cid=String(it?.classId||it?.class||'').toLowerCase();
  if(cid==='grower')return'warrior';
  if(cid==='bruiser')return'mage';
  if(cid==='scout')return'scout';
  const b=it?.bonus||{};
  if(Number(b.intelligenz)>0||String(it?.stat||'').toLowerCase()==='intelligenz')return'mage';
  if(Number(b.geschick)>0||String(it?.stat||'').toLowerCase()==='geschick')return'scout';
  if(Number(b.staerke)>0||String(it?.stat||'').toLowerCase()==='staerke')return'warrior';
  return'generic';
 }
 function weapon(it){
  if(prism(it)&&A.weapon_prismatic)return A.weapon_prismatic;
  if(mystic(it)&&A.weapon_cyan)return A.weapon_cyan;
  const n=text(it),c=cls(it),ic=String(it?.icon||'');
  if(c==='mage')return A.weapon_staff||A.weapon_sword||'';
  if(c==='scout')return A.weapon_blade||A.weapon_sword||'';
  if(/handschuh|faust|klaue/.test(n)||ic==='🧤')return A.weapon_glove||A.weapon_sickle||'';
  if(/stab|zepter|keule|hammer|kolben|bong/.test(n)||/[🪄🔮🔨]/u.test(ic))return A.weapon_staff||A.weapon_sword||'';
  if(/axt|sichel|schere|spalter/.test(n)||/[🪓✂️]/u.test(ic))return A.weapon_sickle||A.weapon_sword||'';
  if(/bogen|pfeil|klinge|dolch/.test(n)||ic==='🏹')return A.weapon_blade||A.weapon_sword||'';
  return c==='warrior'?(A.weapon_sickle||A.weapon_sword||''):(A.weapon_sword||'');
 }
 function comic(it){
  if(!it)return'';
  if(it.type==='gem')return A.gem||'';
  if(it.type==='scroll')return A.scroll||'';
  const slot=String(it.slot||'').toLowerCase();
  if(slot==='weapon')return weapon(it);
  if(slot==='head')return A.head||'';
  if(slot==='body'||slot==='chest')return A.body||'';
  if(slot==='ring'){try{return bootsFallback?bootsFallback(it):(original4106?original4106(it):'')}catch(e){return''}}
  if(slot==='amulet')return A.amulet||'';
  if(slot==='set'||it.type==='set')return A.set||'';
  if(slot==='boots'||slot==='feet'){
   try{return bootsFallback?bootsFallback(it):(original4106?original4106(it):'')}catch(e){return''}
  }
  try{return original4106?original4106(it):(bootsFallback?bootsFallback(it):'')}catch(e){return''}
 }
 /* Critical fix: all historical item systems now point at ONE resolver.
    This stops v466, v4106, v4108, v4111 and v4112 from repainting each other. */
 window.v4115ComicItemArtUri=comic;
 window.v466ItemArtUri=comic;
 window.v4106ComicItemArtUri=comic;
 window.v4111ComicItemArtUri=comic;

 function refresh(){
  try{window.v4103DecorateItemSurfaces?.()}catch(e){}
  try{window.v4108DecorateComicItems?.()}catch(e){}
  try{window.v4112RefreshAllItemArt?.()}catch(e){}
  try{window.v4111RefreshComicItems?.()}catch(e){}
  try{
   document.querySelectorAll('img.v466-item-art').forEach(img=>{
    const card=img.closest('.v4103-item-card,.inv-item,.shop-item,.slot,.v210-profile-item,.v240-loot-item,[data-v488-key]');
    if(!card)return;
    img.dataset.v4115Comic='1';
   });
  }catch(e){}
 }
 function qa(){
  const same=window.v466ItemArtUri===comic&&window.v4106ComicItemArtUri===comic&&window.v4111ComicItemArtUri===comic;
  const samples=[
   {name:'QA Krieger',slot:'weapon',classId:'grower',quality:'blue',bonus:{staerke:1}},
   {name:'QA Magier',slot:'weapon',classId:'bruiser',quality:'purple',bonus:{intelligenz:1}},
   {name:'QA Schütze',slot:'weapon',classId:'scout',quality:'green',bonus:{geschick:1}},
   {name:'QA Helm',slot:'head',classId:'grower',quality:'orange'},
   {name:'QA Rüstung',slot:'body',classId:'bruiser',quality:'blue'},
   {name:'QA Ring',slot:'ring',quality:'purple'},
   {name:'QA Amulett',slot:'amulet',quality:'purple'},
   {name:'QA Stein',type:'gem',quality:'green'},
   {name:'QA Rolle',type:'scroll',quality:'blue'}
  ];
  const resolved=samples.map(x=>comic(x));
  const ringArt=comic({name:'QA Ring',slot:'ring',quality:'purple'}),amuletArt=comic({name:'QA Amulett',slot:'amulet',quality:'purple'});
  return {same,resolved:resolved.every(Boolean),webp:resolved.every((u,i)=>i<3?/^(?:data:image\/webp;base64,|assets\/v71(?:95|98)-base64\/)/.test(String(u||'')):!!u),ringDistinct:!!ringArt&&!!amuletArt&&ringArt!==amuletArt};
 }
 window.v4115ItemArtQA=qa;
 function addQa(){
  try{
   const runner=window.v4107RunQA||window.v4102RunQA;if(typeof runner!=='function'||window.__v4115QaWrapped)return;
   const wrapped=function(){const r=runner.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;const q=qa();const rows=[
    {category:'Item-Art final',name:'Alle historischen Item-Resolver zeigen auf dieselbe Comic-Quelle',pass:q.same,severity:'error',detail:q.same?'V4.115 ist alleiniger Artwork-Owner':'Ein alter Renderer besitzt noch eine andere Quelle'},
    {category:'Item-Art final',name:'Krieger/Magier/Schütze + Ausrüstung/Materialien lösen Comic-Art auf',pass:q.resolved,severity:'error',detail:q.resolved?'Alle Testitems liefern Artwork':'Mindestens ein Itemtyp ohne Artwork'},
    {category:'Item-Art final',name:'Ring und Amulett besitzen unterschiedliche Grafiken',pass:q.ringDistinct,severity:'error',detail:q.ringDistinct?'Ring-Art ist eigenständig':'Ring verwendet fälschlich Amulett-Art'},
    {category:'Item-Art final',name:'V4.106 Comic-WebP-Set ist die aktive Hauptquelle',pass:q.webp,severity:'error',detail:q.webp?'Freigegebenes Comic-Set aktiv':'Artwork fällt auf eine falsche Quelle zurück'}
   ];r.results.push(...rows);r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r};
   window.v4107RunQA=wrapped;if(window.v4102RunQA===runner)window.v4102RunQA=wrapped;window.__v4115QaWrapped=true;
  }catch(e){}
 }
 function stamp(){}
 refresh();addQa();stamp();
 /* Existing render owners do the ongoing work. Refresh only on relevant screen opens/resume. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge'){refresh();addQa();stamp()}
 },{passive:true});
 window.addEventListener('pageshow',()=>{refresh();addQa();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();stamp()}},{passive:true});
})();
