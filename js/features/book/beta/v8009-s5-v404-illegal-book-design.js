(function(){
 const V404_VERSION='V4.29 Stable';
 if(typeof V106_ACH==='undefined'||typeof v106OpenBook!=='function')return;
 const cats=[
  ['all','📚','Alle',()=>true],
  ['level','⭐','Level',id=>/^lvl|^power/.test(id)],
  ['quest','📜','Quest',id=>/^quest/.test(id)],
  ['dungeon','⚔️','Dungeon',id=>/^d\d|^fight/.test(id)],
  ['grow','🌿','Growroom',id=>/^grow|^seed/.test(id)],
  ['pvp','🏆','PvP',id=>/^pvp/.test(id)],
  ['boss','💀','Weltboss',id=>/^wb|myst/i.test(id)],
  ['gear','💎','Ausrüstung',id=>/^equip|^gem|^ench|^legend/.test(id)],
  ['wealth','🪙','Besitz',id=>/^gold|^harz/.test(id)]
 ];
 let active='all';
 function catFor(id){for(const c of cats.slice(1))if(c[3](id))return c[0];return 'level'}
 function decorate(){
  const ov=document.querySelector('#v106Overlay'),list=document.querySelector('#v106BookList');if(!ov||!list)return;
  const done=v106CompletedCount(),total=V106_ACH.length,pct=total?Math.round(done/total*100):0;
  let overall=ov.querySelector('.v404-overall');
  if(!overall){overall=document.createElement('div');overall.className='v404-overall';document.querySelector('.v106-summary')?.insertAdjacentElement('afterend',overall)}
  overall.innerHTML=`<div class="v404-overall-top"><span>GESAMTFORTSCHRITT</span><b>${done} / ${total} · ${pct}%</b></div><div class="v404-overall-bar"><i style="width:${pct}%"></i></div>`;
  let tabs=ov.querySelector('.v404-tabs');
  if(!tabs){tabs=document.createElement('div');tabs.className='v404-tabs';overall.insertAdjacentElement('afterend',tabs)}
  tabs.innerHTML=cats.map(c=>`<button class="v404-tab ${active===c[0]?'active':''}" data-cat="${c[0]}">${c[1]} ${c[2]}</button>`).join('');
  tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.cat;decorate()});
  const cards=[...list.querySelectorAll('.v106-ach')];
  cards.forEach((card,i)=>{const row=V106_ACH[i];if(!row)return;card.dataset.cat=catFor(row[0]);card.style.display=(active==='all'||active===card.dataset.cat)?'block':'none'});
  list.querySelectorAll('.v404-section-title').forEach(x=>x.remove());
  if(active!=='all'){
    const c=cats.find(x=>x[0]===active);const visible=cards.filter(x=>x.style.display!=='none');
    if(c&&visible.length){const h=document.createElement('div');h.className='v404-section-title';h.textContent=`${c[1]} ${c[2]} · ${visible.length}`;list.insertBefore(h,visible[0])}
  }
 }
 const base=v106OpenBook;
 v106OpenBook=function(){const r=base.apply(this,arguments);decorate();return r};
 function version(){document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{if(el)el.textContent=V404_VERSION})}
 version();setTimeout(version,600);setTimeout(version,2000);
})();
