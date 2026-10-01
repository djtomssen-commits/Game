(function(){
'use strict';
if(window.__V683_MATERIAL_MULTI_SELL__)return;
window.__V683_MATERIAL_MULTI_SELL__=true;

let mode=false;
const selected=new Set(); // key = sichtbarer Material-Stapel; Mehrfachmodus verkauft jeweils den kompletten Stapel.
let scheduled=false;

function qNorm(m){
 const q=String(m?.quality||'').toLowerCase();
 if(['gray','green','blue','purple','orange','cyan'].includes(q))return q;
 const r=String(m?.rarity||'').toLowerCase();
 if(/myst|cyan/.test(r))return'cyan';if(/legend|orange/.test(r))return'orange';if(/epic|purple/.test(r))return'purple';if(/rare|blue/.test(r))return'blue';if(/green|uncommon/.test(r))return'green';return'gray';
}
function keyOf(m){return [m?.type||'',m?.name||'',qNorm(m),m?.stat||'',m?.effect||'',Number(m?.value)||0].join('|')}
function materialRows(){return (Array.isArray(s?.materials)?s.materials:[]).map((m,index)=>({m,index,key:keyOf(m)})).filter(x=>x.m&&['gem','scroll'].includes(x.m.type))}
function rowsForKey(key){return materialRows().filter(x=>x.key===key)}
function sellValue(m){
 try{if(typeof window.v681MaterialSellValue==='function')return Math.max(1,Number(window.v681MaterialSellValue(m))||1)}catch(e){}
 const p=Math.max(1,Number(m?.price)||10);return Math.max(1,Math.floor(p*.4));
}
function selectionStats(){
 let stacks=0,count=0,gems=0,scrolls=0,gold=0;
 selected.forEach(key=>{
  const rows=rowsForKey(key);if(!rows.length)return;
  stacks++;count+=rows.length;
  rows.forEach(({m})=>{gold+=sellValue(m);if(m.type==='gem')gems++;else if(m.type==='scroll')scrolls++});
 });
 return {stacks,count,gems,scrolls,gold};
}
function cleanSelection(){
 const keys=new Set(materialRows().map(x=>x.key));
 [...selected].forEach(k=>{if(!keys.has(k))selected.delete(k)});
}
function visibleCards(panel){return [...panel.querySelectorAll('.v546-material-item')].filter(card=>card.querySelector('.v546-use[data-index]'))}
function cardData(card){
 const use=card.querySelector('.v546-use[data-index]');if(!use)return null;
 const index=Number(use.dataset.index);if(!Number.isInteger(index)||index<0)return null;
 const m=s?.materials?.[index];if(!m||!['gem','scroll'].includes(m.type))return null;
 return {m,index,key:keyOf(m),count:rowsForKey(keyOf(m)).length};
}
function updateSummary(panel){
 cleanSelection();
 const st=selectionStats();
 const summary=panel.querySelector('.v683-multi-summary');
 if(summary)summary.innerHTML=mode
  ? `<b>${st.count} Material${st.count===1?'':'ien'} ausgewählt · 💰 ${st.gold} Gold</b>${st.gems} Edelstein${st.gems===1?'':'e'} · ${st.scrolls} Rolle${st.scrolls===1?'':'n'} · ${st.stacks} Stapel`
  : `<b>Mehrfachverkauf</b>Mehrere Edelsteine und Rollen gemeinsam markieren und in einem Schritt verkaufen.`;
 const sell=panel.querySelector('.v683-sell-selected');if(sell){sell.disabled=!mode||st.count===0;sell.textContent=st.count?`💰 Auswahl verkaufen (${st.gold})`:'💰 Auswahl verkaufen'}
 const clear=panel.querySelector('.v683-clear');if(clear)clear.disabled=selected.size===0;
}
function paintCards(panel){
 visibleCards(panel).forEach(card=>{
  const d=cardData(card);if(!d)return;
  card.dataset.v683Key=d.key;
  let check=card.querySelector('.v683-check');
  if(!check){check=document.createElement('button');check.type='button';check.className='v683-check';check.setAttribute('aria-label','Zum Mehrfachverkauf auswählen');check.textContent='✓';card.appendChild(check)}
  let note=card.querySelector('.v683-stack-note');
  if(!note){note=document.createElement('div');note.className='v683-stack-note';card.appendChild(note)}
  note.textContent=d.count>1?`Auswahl verkauft den ganzen Stapel (${d.count}×)`:'Dieses Material auswählen';
  const on=selected.has(d.key);card.classList.toggle('v683-selected',on);check.setAttribute('aria-pressed',on?'true':'false');
  check.onclick=e=>{e.preventDefault();e.stopPropagation();toggleKey(d.key,panel)};
  if(!card.__v683CardBound){
   card.__v683CardBound=true;
   card.addEventListener('click',e=>{
    if(!mode)return;
    if(e.target?.closest?.('button'))return;
    const key=card.dataset.v683Key;if(key)toggleKey(key,panel);
   });
  }
 });
}
function toggleKey(key,panel){
 if(!mode)return;
 if(selected.has(key))selected.delete(key);else selected.add(key);
 paintCards(panel);updateSummary(panel);
}
function insertToolbar(panel){
 let bar=panel.querySelector('.v683-multi-toolbar');
 if(!bar){
  bar=document.createElement('div');bar.className='v683-multi-toolbar';
  bar.innerHTML=`<button type="button" class="btn v683-toggle">☑ Mehrfach verkaufen</button><div class="v683-multi-summary"></div><button type="button" class="btn v683-all" style="display:none">Alle sichtbaren</button><button type="button" class="btn v683-clear" style="display:none">Auswahl löschen</button><button type="button" class="btn v683-sell-selected" style="display:none" disabled>💰 Auswahl verkaufen</button>`;
  const filters=panel.querySelector('.v546-quality-row');
  const head=panel.querySelector('.v546-material-section-head');
  if(filters)filters.insertAdjacentElement('afterend',bar);else if(head)head.insertAdjacentElement('afterend',bar);else panel.prepend(bar);
  bar.querySelector('.v683-toggle').onclick=()=>{mode=!mode;if(!mode)selected.clear();enhance()};
  bar.querySelector('.v683-all').onclick=()=>{
   if(!mode)return;
   visibleCards(panel).forEach(card=>{const d=cardData(card);if(d)selected.add(d.key)});paintCards(panel);updateSummary(panel);
  };
  bar.querySelector('.v683-clear').onclick=()=>{selected.clear();paintCards(panel);updateSummary(panel)};
  bar.querySelector('.v683-sell-selected').onclick=()=>sellSelected(panel);
 }
 bar.querySelector('.v683-toggle')?.classList.toggle('active',mode);
 bar.querySelector('.v683-toggle').textContent=mode?'✕ Mehrfachverkauf beenden':'☑ Mehrfach verkaufen';
 ['.v683-all','.v683-clear','.v683-sell-selected'].forEach(sel=>{const el=bar.querySelector(sel);if(el)el.style.display=mode?'inline-flex':'none'});
 return bar;
}
async function sellSelected(panel){
 cleanSelection();const st=selectionStats();if(!st.count)return;
 const ok=typeof v115Confirm==='function'
  ? await v115Confirm(`${st.count} Materialien verkaufen?\n\n💎 Edelsteine: ${st.gems}\n📜 Schriftrollen: ${st.scrolls}\n\nGesamter Verkaufspreis: ${st.gold} Gold\n\nIm Mehrfachverkauf wird jeweils der komplette markierte Stapel verkauft.`,{title:'Auswahl verkaufen?',type:'warn',okText:`Für ${st.gold} Gold verkaufen`})
  : confirm(`${st.count} Materialien für ${st.gold} Gold verkaufen?`);
 if(!ok)return;
 const keys=new Set(selected);const rows=materialRows().filter(x=>keys.has(x.key));
 if(!rows.length){selected.clear();enhance();return}
 let gold=0;rows.forEach(({m})=>gold+=sellValue(m));
 rows.map(x=>x.index).sort((a,b)=>b-a).forEach(i=>{if(s.materials?.[i])s.materials.splice(i,1)});
 s.gold=(Number(s.gold)||0)+gold;
 selected.clear();mode=false;
 try{persist()}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
 try{if(typeof v063Toast==='function')v063Toast('💰 Mehrfachverkauf','success',`${rows.length} Materialien · +${gold} Gold`)}catch(e){}
 requestAnimationFrame(()=>{try{window.v546RenderMaterials?.()}catch(e){};setTimeout(enhance,0)});
}
function enhance(){
 const panel=document.querySelector('#character #v030Materials');if(!panel)return false;
 insertToolbar(panel);panel.classList.toggle('v683-select-mode',mode);paintCards(panel);updateSummary(panel);return true;
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
function observe(){
 const panel=document.querySelector('#character #v030Materials');if(!panel)return false;
 /* V7.308: retired subtree MutationObserver. One post-render hook is authoritative. */
 enhance();return true;
}
/* v546RenderMaterials is the single post-render owner for multisell controls. */
document.addEventListener('DOMContentLoaded',observe,{once:true});
window.v683MaterialMultiSell={enhance,selected,stats:selectionStats};
})();
