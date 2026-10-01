(function(){
 const VERSION='V4.29 Stable';
 const CATS=[
  ['all','📚','Alle'],['level','⭐','Level'],['quest','📜','Quest'],['dungeon','⚔️','Dungeon'],
  ['grow','🌿','Growroom'],['pvp','🏆','PvP'],['boss','💀','Weltboss'],['gear','💎','Ausrüstung'],['wealth','🪙','Besitz']
 ];
 let active='all';
 function category(id){
  id=String(id||'');
  if(/^lvl|^power/.test(id))return 'level';
  if(/^quest/.test(id))return 'quest';
  if(/^d\d|^fight/.test(id))return 'dungeon';
  if(/^grow|^seed/.test(id))return 'grow';
  if(/^pvp/.test(id))return 'pvp';
  if(/^wb|myst/i.test(id))return 'boss';
  if(/^equip|^gem|^ench|^legend/.test(id))return 'gear';
  if(/^gold|^harz/.test(id))return 'wealth';
  return 'level';
 }
 function render(){
  const ov=document.getElementById('v106Overlay');
  const list=document.getElementById('v106BookList');
  if(!ov||!list||!ov.classList.contains('show'))return false;
  const rows=(typeof V106_ACH!=='undefined'&&Array.isArray(V106_ACH))?V106_ACH:[];
  const cards=[...list.querySelectorAll('.v106-ach')];
  if(!cards.length)return false;
  // V4.04 JS did not reliably execute on mobile. Rebuild the controls independently.
  ov.querySelectorAll('.v404-tabs,.v404-section-title,.v405-category-wrap,.v405-filter-title').forEach(x=>x.remove());
  let overall=ov.querySelector('.v404-overall');
  if(!overall){
    const done=(typeof v106CompletedCount==='function')?v106CompletedCount():cards.filter(c=>c.classList.contains('done')).length;
    const total=rows.length||cards.length,pct=total?Math.round(done/total*100):0;
    overall=document.createElement('div');overall.className='v404-overall';
    overall.innerHTML=`<div class="v404-overall-top"><span>GESAMTFORTSCHRITT</span><b>${done} / ${total} · ${pct}%</b></div><div class="v404-overall-bar"><i style="width:${pct}%"></i></div>`;
    ov.querySelector('.v106-summary')?.insertAdjacentElement('afterend',overall);
  }
  const wrap=document.createElement('div');wrap.className='v405-category-wrap';
  wrap.innerHTML='<div class="v405-category-label">Kategorien</div><div class="v405-category-tabs">'+CATS.map(c=>`<button type="button" class="v405-category-tab ${active===c[0]?'active':''}" data-v405-cat="${c[0]}">${c[1]} ${c[2]}</button>`).join('')+'</div>';
  overall.insertAdjacentElement('afterend',wrap);
  cards.forEach((card,i)=>{
    const row=rows[i]; const cat=category(row&&row[0]);
    card.dataset.v405Cat=cat;
    card.style.display=(active==='all'||active===cat)?'block':'none';
  });
  if(active!=='all'){
    const c=CATS.find(x=>x[0]===active), visible=cards.filter(x=>x.style.display!=='none');
    if(c&&visible.length){const h=document.createElement('div');h.className='v405-filter-title';h.textContent=`${c[1]} ${c[2]} · ${visible.length}`;list.insertAdjacentElement('beforebegin',h)}
  }
  wrap.querySelectorAll('[data-v405-cat]').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.v405Cat;render()}));
  return true;
 }
 /* V8.009: v6235 is the canonical Illegal-Book category/paging owner.
    Retire the old v405 open/click repaint retries; they rebuilt the same controls
    several times and visibly made Erfolge/Titel jump. */
 window.__V405_CATEGORY_OWNER__='retired-v6235';
 function ver(){document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver').forEach(el=>{if(el)el.textContent=VERSION})}
 ver();setTimeout(ver,600);setTimeout(ver,2000);
})();
