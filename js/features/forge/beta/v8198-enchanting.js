(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'stable').toLowerCase()!=='beta')return;
if(window.__V8198_ENCHANTING__)return;
window.__V8198_ENCHANTING__=true;

const VERSION='V8.198';
const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
const LABEL={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};
const S={state:null,selected:'',busy:false,last:null,lastError:'',refreshes:0,attempts:0};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const one=v=>Array.isArray(v)?v[0]:v;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const itemId=it=>String(it?.id||it?.uid||'');

function requestId(prefix){
 let r='';
 try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}
 return prefix+'_'+Date.now()+'_'+r.slice(0,24);
}
async function rpc(name,args={}){
 const x=db();if(!x||!uid())throw new Error('SERVER_NOT_READY');
 const {data,error}=await x.rpc(name,args);if(error)throw error;
 return one(data);
}
function levelOf(it){return Math.max(0,Math.min(10,Number(it?.v8198Enchant?.level)||0))}
function chanceOf(target){
 const v=Number(S.state?.chances?.[String(target)]);
 if(Number.isFinite(v))return v;
 return target===1?100:target===2?70:target===3?50:target===4?30:target===5?15:target===6?5:6;
}
function fxClass(it){
 const n=levelOf(it);
 if(!n)return '';
 return 'v8198-e'+n+(n>=2?' v8198-e-glow':'')+(n>=5?' v8198-e-flash':'');
}
function applyItemFx(root,it){
 if(!root)return;
 [...root.classList].forEach(c=>{if(/^v8198-e\d+$/.test(c)||c==='v8198-e-glow'||c==='v8198-e-flash')root.classList.remove(c)});
 root.querySelectorAll(':scope > .v8198-plus-badge,:scope > .v8198-item-fx').forEach(x=>x.remove());
 delete root.dataset.v8198Enchant;
 const n=levelOf(it);if(!n)return;
 root.dataset.v8198Enchant=String(n);
 fxClass(it).split(/\s+/).filter(Boolean).forEach(c=>root.classList.add(c));
 const fx=document.createElement('span');fx.className='v8198-item-fx';fx.setAttribute('aria-hidden','true');root.appendChild(fx);
 const badge=document.createElement('span');badge.className='v8198-plus-badge';badge.textContent='+'+n;root.appendChild(badge);
}
function itemRows(){
 const out=[];
 (Array.isArray(s?.inventory)?s.inventory:[]).forEach((it,i)=>{if(it?.slot&&itemId(it))out.push({it,id:itemId(it),place:'Inventar',slot:'',index:i})});
 Object.entries(s?.equipment||{}).forEach(([slot,it])=>{if(it?.slot&&itemId(it))out.push({it,id:itemId(it),place:'Angelegt',slot,index:null})});
 return out;
}
function itemArt(it){
 try{
  const u=window.v466ItemArtUri?.(it);
  if(u)return '<img src="'+esc(u)+'" alt="" class="v8198-enchant-art">';
 }catch(_){}
 return '<span class="v8198-enchant-fallback">'+esc(it?.icon||'◆')+'</span>';
}
function selectedRow(){
 const all=itemRows();
 if(!all.length){S.selected='';return null}
 let row=all.find(x=>x.id===S.selected);
 if(!row){row=all[0];S.selected=row.id}
 return row;
}
function statRows(it){
 const b=it?.bonus||{};
 const rows=COMBAT.filter(k=>Number(b[k])!==0).map(k=>'<span><small>'+LABEL[k]+'</small><b>'+Number(b[k]).toLocaleString('de-DE',{maximumFractionDigits:2})+'</b></span>');
 return rows.length?rows.join(''):'<span><small>Werte</small><b>—</b></span>';
}
function resultHtml(){
 if(!S.last)return '';
 const ok=S.last.success===true;
 const title=ok?'Verzauberung +'+(Number(S.last.level)||0)+' gelungen':'Verzauberung fehlgeschlagen';
 const detail=ok?'Item-Grundwerte jetzt +'+(Number(S.last.stat_pct)||0)+'%':'Rune verbraucht · Itemstufe bleibt erhalten.';
 return '<div class="v8198-enchant-result '+(ok?'success':'fail')+'"><i>'+(ok?'✦':'×')+'</i><div><b>'+esc(title)+'</b><small>'+esc(detail)+'</small></div></div>';
}
function html(){
 const all=itemRows(),row=selectedRow(),it=row?.it||null,n=levelOf(it),target=Math.min(10,n+1),ch=n>=10?0:chanceOf(target);
 const runes=Math.max(0,Number(S.state?.runes)||0),shards=Math.max(0,Number(S.state?.rune_shards)||0);
 let list='';
 if(all.length){
  list=all.map(x=>{
   const l=levelOf(x.it),sel=x.id===S.selected?' selected':'',fx=fxClass(x.it);
   return '<button type="button" class="v8198-enchant-item '+fx+sel+'" data-v8198-item="'+esc(x.id)+'"><span class="v8198-item-fx"></span><span class="v8198-enchant-item-art">'+itemArt(x.it)+'</span><span class="v8198-enchant-item-copy"><b>'+esc(String(x.it.name||'Item').replace(/\s*\[Lv\.\d+\]\s*$/i,''))+'</b><small>'+esc(x.place)+(x.slot?' · '+esc(x.slot):'')+'</small></span><em>'+(l?'+'+l:'—')+'</em></button>';
  }).join('');
 }else list='<div class="v8198-enchant-empty">Keine verzauberbaren Items vorhanden.</div>';

 let focus='<div class="v8198-enchant-empty focus">Wähle ein Item aus.</div>';
 if(it){
  const mainName=esc(String(it.name||'Item').replace(/\s*\[Lv\.\d+\]\s*$/i,''));
  const nextText=n>=10?'MAX':'+'+target;
  const chanceText=n>=10?'—':ch+'%';
  const statText='+'+((n>=10?n:target)*1.5).toFixed(1)+'%';
  let buttonText=S.busy?'RUNEN WERDEN GEBUNDEN …':n>=10?'MAXIMALE VERZAUBERUNG':runes<1?'KEINE VERZAUBERUNGSRUNE':'VERZAUBERN AUF +'+target+' · 1 RUNE';
  focus='<div class="v8198-enchant-altar '+fxClass(it)+'"><span class="v8198-item-fx"></span><div class="v8198-enchant-rune-ring"><i>ᚱ</i></div><div class="v8198-enchant-main-art">'+itemArt(it)+'</div><strong>'+(n?'+'+n:'UNVERZAUBERT')+'</strong></div>'+
    '<div class="v8198-enchant-title"><b>'+mainName+'</b><small>'+esc(it.quality||it.rarity||'Item')+' · Lv.'+Math.max(1,Number(it.dropLevel)||Number(s?.level)||1)+'</small></div>'+
    '<div class="v8198-enchant-stats">'+statRows(it)+'</div>'+
    '<div class="v8198-enchant-next"><div><small>Nächste Stufe</small><b>'+nextText+'</b></div><div><small>Erfolgschance</small><b>'+chanceText+'</b></div><div><small>Item-Grundwerte</small><b>'+statText+'</b></div></div>'+
    '<button type="button" class="v8198-enchant-button" data-v8198-enchant '+(S.busy||n>=10||runes<1?'disabled':'')+'>'+esc(buttonText)+'</button>'+
    '<small class="v8198-enchant-rule">Fehlschlag: Rune verbraucht, Item bleibt auf seiner aktuellen +Stufe. Maximal +10.</small>';
 }

 return '<section class="v8198-enchant-shell">'+
  '<header class="v8198-enchant-head"><div><small>HARZSCHMIEDE · RUNENKAMMER</small><h3>VERZAUBERN</h3><p>Seltene Runen verstärken die Grundwerte eines Items dauerhaft.</p></div><div class="v8198-enchant-wallet"><span><i>ᚱ</i><b>'+runes+'</b><small>Runen</small></span><span><i>✦</i><b>'+shards+'</b><small>Splitter</small></span></div></header>'+
  resultHtml()+
  '<div class="v8198-enchant-grid"><div class="v8198-enchant-list"><div class="v8198-enchant-list-head"><b>Items</b><small>Inventar + angelegt</small></div><div class="v8198-enchant-items">'+list+'</div></div><div class="v8198-enchant-focus">'+focus+'</div></div>'+
  '<footer class="v8198-enchant-fuse"><div><i>✦</i><span><b>Runensplitter verschmelzen</b><small>10 Splitter ergeben 1 Verzauberungsrune.</small></span></div><button type="button" data-v8198-fuse '+(S.busy||shards<10?'disabled':'')+'>10 ✦ → 1 ᚱ</button></footer>'+
 '</section>';
}
function repaintForge(){try{window.v488ForgeRender?.()}catch(_){}}
function applyServer(r){
 if(!r||r.ok!==true)return;
 if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
 if(r.equipment&&typeof r.equipment==='object')s.equipment=clone(r.equipment);
 if(Array.isArray(r.materials))s.materials=clone(r.materials);
 if(Number.isFinite(Number(r.fragments))){
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  s.v488Forge.fragments=Math.max(0,Number(r.fragments));
 }
 if(!S.state)S.state={};
 if(Number.isFinite(Number(r.runes)))S.state.runes=Math.max(0,Number(r.runes));
 if(Number.isFinite(Number(r.rune_shards)))S.state.rune_shards=Math.max(0,Number(r.rune_shards));
 try{if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 try{renderInventory?.()}catch(_){}
 try{window.v459CompactInventory?.()}catch(_){}
 try{window.v470PaintEquipmentSlots?.()}catch(_){}
 try{window.v448PaintPower?.()}catch(_){}
 try{window.v446PaintCombatPower?.()}catch(_){}
 try{window.v4140PaintAttributes?.()}catch(_){}
 try{window.v537ApplyAttributes?.()}catch(_){}
}
async function refreshState({rerender=true}={}){
 if(!uid()||!db())return null;
 try{
  const r=await rpc('v8198_enchant_state');
  if(r?.ok){S.state=r;S.lastError='';S.refreshes++;if(rerender)repaintForge()}
  return r;
 }catch(e){S.lastError=String(e?.message||e);console.warn('[V8198] enchant state',e);return null}
}
async function enchant(){
 if(S.busy)return;
 const row=selectedRow();if(!row)return;
 S.busy=true;S.last=null;repaintForge();
 try{
  const r=await rpc('v8198_enchant_item',{p_item_id:row.id,p_request_id:requestId('v8198_enchant')});
  if(!r?.ok)throw new Error(String(r?.reason||'ENCHANT_REJECTED'));
  S.last=r;S.attempts++;applyServer(r);
  try{window.v063Toast?.(r.success?'+'+(Number(r.level)||0)+' gelungen':'Verzauberung fehlgeschlagen',r.success?'success':'warn',r.success?'Grundwerte +'+(Number(r.stat_pct)||0)+'%':'Rune verbraucht · Item unverändert')}catch(_){}
 }catch(e){
  S.lastError=String(e?.message||e);
  try{window.v063Toast?.('Verzaubern abgelehnt','error',S.lastError)}catch(_){}
 }finally{
  S.busy=false;
  await refreshState({rerender:false});
  repaintForge();
 }
}
async function fuse(){
 if(S.busy)return;
 S.busy=true;repaintForge();
 try{
  const r=await rpc('v8198_fuse_rune',{p_request_id:requestId('v8198_fuse')});
  if(!r?.ok)throw new Error(String(r?.reason||'FUSE_REJECTED'));
  if(!S.state)S.state={};
  S.state.runes=Math.max(0,Number(r.runes)||0);
  S.state.rune_shards=Math.max(0,Number(r.rune_shards)||0);
  try{window.v063Toast?.('ᚱ Rune erschaffen','success','10 Runensplitter wurden verschmolzen.')}catch(_){}
 }catch(e){
  S.lastError=String(e?.message||e);
  try{window.v063Toast?.('Verschmelzen fehlgeschlagen','error',S.lastError)}catch(_){}
 }finally{S.busy=false;repaintForge()}
}
function bind(root){
 const host=root?.querySelector?.('.v8198-enchant-shell')||root;if(!host)return;
 host.querySelectorAll('[data-v8198-item]').forEach(b=>b.onclick=()=>{S.selected=String(b.dataset.v8198Item||'');S.last=null;repaintForge()});
 host.querySelector('[data-v8198-enchant]')?.addEventListener('click',enchant);
 host.querySelector('[data-v8198-fuse]')?.addEventListener('click',fuse);
 if(!S.state&&!S.busy)void refreshState({rerender:true});
}
function decorateCharacter(){
 const cards=[...document.querySelectorAll('#character #inventory .inventory-grid > .inv-item')];
 cards.forEach((card,i)=>applyItemFx(card,s?.inventory?.[i]||null));
 Object.entries(s?.equipment||{}).forEach(([slot,it])=>applyItemFx(document.getElementById('slot-'+slot),it||null));
}

window.v8198EnchantForgeHtml=html;
window.v8198BindEnchantForge=bind;
window.v8198EnchantStateRefresh=refreshState;
window.v8198EnchantLevel=levelOf;
window.v8198EnchantFxClass=fxClass;
window.v8198ApplyItemFx=applyItemFx;
window.v8198DecorateCharacterItems=decorateCharacter;
window.v8198EnchantDiagnostics=()=>({version:VERSION,busy:S.busy,selected:S.selected,refreshes:S.refreshes,attempts:S.attempts,lastError:S.lastError,state:S.state,last:S.last});

window.addEventListener('growlegends:account-ready',()=>{S.state=null;S.selected='';S.last=null;void refreshState({rerender:false})},{passive:true});
window.addEventListener('growlegends:runehunt-state',e=>{
 const d=e?.detail||{};if(!S.state)S.state={};
 if(Number.isFinite(Number(d.runes)))S.state.runes=Math.max(0,Number(d.runes));
 if(Number.isFinite(Number(d.rune_shards)))S.state.rune_shards=Math.max(0,Number(d.rune_shards));
 if(document.getElementById('forge')?.classList.contains('active'))repaintForge();
},{passive:true});
})();