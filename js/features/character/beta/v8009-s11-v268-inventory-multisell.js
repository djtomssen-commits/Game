/* V4.02 multi-select inventory sale. Selection is UI-only and never enters the save file. */
const v268SelectedItems=new Set();
function v268ItemKey(it,i){return String(it?.id||`idx_${i}`)}
function v268SelectedRows(){
 return (s.inventory||[]).map((it,i)=>({it,i,key:v268ItemKey(it,i)})).filter(x=>v268SelectedItems.has(x.key));
}
function v268PaintSellbar(){
 const bar=document.querySelector('#inventory .v268-sellbar');if(!bar)return;
 const rows=v268SelectedRows(), total=rows.reduce((n,x)=>n+(Number(sellValue(x.it))||0),0);
 const info=bar.querySelector('.v268-info');if(info)info.textContent=`${rows.length} ausgewählt · 💰 ${total} Gold`;
 const sell=bar.querySelector('.v268-sell-selected');if(sell)sell.disabled=!rows.length;
}
function v268ClearSelection(){v268SelectedItems.clear();try{renderInventory()}catch(e){render()}}
async function v268SellSelected(){
 const rows=v268SelectedRows();if(!rows.length)return;
 const total=rows.reduce((n,x)=>n+(Number(sellValue(x.it))||0),0);
 const valuable=rows.filter(x=>['purple','orange','cyan'].includes(String(x.it?.quality||'').toLowerCase())||x.it?.setName);
 const warning=valuable.length?`\n\n⚠️ Darunter sind ${valuable.length} Set-/epische/legendäre/mystische Items.`:'';
 const ok=await v115Confirm(`${rows.length} Items verkaufen?\n\nGesamtpreis: ${total} Gold${warning}`,{title:'Mehrfachverkauf',type:valuable.length?'error':'warn',okText:`${rows.length} Items verkaufen`});
 if(!ok)return;
 rows.sort((a,b)=>b.i-a.i).forEach(x=>s.inventory.splice(x.i,1));
 s.gold=(Number(s.gold)||0)+total;
 v268SelectedItems.clear();
 persist();
 try{if(typeof v115Alert==='function')v115Alert(`${rows.length} Items verkauft.\n+${total} Gold`,'Verkauf abgeschlossen','success')}catch(e){}
}
const v268BaseRenderInventory=renderInventory;
renderInventory=function(){
 const r=v268BaseRenderInventory();
 const box=document.querySelector('#inventory'),grid=box?.querySelector('.inventory-grid');if(!grid)return r;
 // Remove keys that no longer exist.
 const live=new Set((s.inventory||[]).map((it,i)=>v268ItemKey(it,i)));[...v268SelectedItems].forEach(k=>{if(!live.has(k))v268SelectedItems.delete(k)});
 const bar=document.createElement('div');bar.className='v268-sellbar';bar.innerHTML=`<b class="v268-info">0 ausgewählt · 💰 0 Gold</b><div class="v268-sellbar-actions"><button class="btn secondary v268-all">Alle wählen</button><button class="btn secondary v268-clear">Auswahl löschen</button><button class="btn gold v268-sell-selected">💰 Auswahl verkaufen</button></div>`;
 grid.insertBefore(bar,grid.firstChild);
 bar.querySelector('.v268-all').onclick=()=>{(s.inventory||[]).forEach((it,i)=>v268SelectedItems.add(v268ItemKey(it,i)));renderInventory()};
 bar.querySelector('.v268-clear').onclick=v268ClearSelection;
 bar.querySelector('.v268-sell-selected').onclick=v268SellSelected;
 [...grid.querySelectorAll('.inv-item')].forEach((card,i)=>{
   const it=s.inventory?.[i];if(!it)return;const key=v268ItemKey(it,i);
   const pick=document.createElement('label');pick.className='v268-pick';pick.title='Zum Mehrfachverkauf auswählen';
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=v268SelectedItems.has(key);pick.appendChild(cb);card.appendChild(pick);
   card.classList.toggle('v268-selected',cb.checked);
   cb.onchange=()=>{cb.checked?v268SelectedItems.add(key):v268SelectedItems.delete(key);card.classList.toggle('v268-selected',cb.checked);v268PaintSellbar()};
 });
 v268PaintSellbar();return r;
};
setTimeout(()=>{const x=document.querySelector('#v141VersionLine');try{renderInventory()}catch(e){}},350);
