(function(){
  'use strict';
  let running=false;

  function move(parent,node){
    if(parent&&node&&node.parentElement!==parent) parent.appendChild(node);
  }
  function rarityColor(it){
    const q=String(it?.quality||it?.rarity||it?.grade||'').toLowerCase();
    if(/myst|cyan|türkis|tuerkis/.test(q)) return '#31e7e2';
    if(/legend|orange/.test(q)) return '#f0a13a';
    if(/epic|episch|purple|lila/.test(q)) return '#b75be8';
    if(/rare|selten|blue|blau/.test(q)) return '#36a7ef';
    if(/gewöhn|gewoehn|green|grün|gruen/.test(q)) return '#64c969';
    return '#8b9790';
  }
  function itemLevel(it){
    if(!it) return 0;
    const n=Number(it.level??it.dropLevel??it.itemLevel??it.reqLevel??it.sourceLevel??0);
    return Number.isFinite(n)&&n>0?Math.round(n):Math.max(1,Number(s?.level)||1);
  }
  function decorateSlots(){
    const map={head:'slot-head',weapon:'slot-weapon',weapon2:'slot-weapon2',ring:'slot-ring',body:'slot-body',boots:'slot-boots',amulet:'slot-amulet'};
    Object.entries(map).forEach(([key,id])=>{
      const el=document.getElementById(id); if(!el)return;
      const it=s?.equipment?.[key]||null;
      el.style.setProperty('--v514-rarity',rarityColor(it));
      let lvl=el.querySelector('.v514-slot-level');
      if(!it){lvl?.remove();return}
      if(!lvl){lvl=document.createElement('div');lvl.className='v514-slot-level';el.appendChild(lvl)}
      lvl.textContent=`Lv.${itemLevel(it)}`;
    });
  }
  function setData(box){
    if(!box)return;
    if(window.__V7124_CHARACTER_SUMMARY_OWNER__){
      try{window.v7124PaintCharacterSummary?.()}catch(e){}
      return;
    }
    const cls=String(s?.playerClass||'');
    let count=0;
    try{count=typeof equippedSetCount==='function'?Number(equippedSetCount(cls))||0:Object.values(s?.equipment||{}).filter(x=>x?.setId===cls).length}catch(e){}
    let setName='Klassen-Set';
    try{setName=classSets?.[cls]?.name||setName}catch(e){}
    let talents=Math.max(0,Number(s?.skillPoints)||0);
    try{if(typeof v314Available==='function')talents=Math.max(0,Number(v314Available())||0)}catch(e){}
    if(!cls){
      box.innerHTML='<span class="v514-set-cell">🧬 Klasse wählen</span><span class="v514-talent-cell">🌳 Talentpunkte <b>'+talents+'</b></span>';
      return;
    }
    box.innerHTML='<span class="v514-set-cell">🧩 '+String(setName).replace(/[<>]/g,'')+' <b>'+count+'/6</b></span><span class="v514-talent-cell">🌳 Talentpunkte <b>'+talents+'</b></span>';
  }
  function syncTabs(){
    const proxy=document.getElementById('v514HeroTabs'); if(!proxy)return;
    let active='inventory';
    const activePanel=document.querySelector('#v459CharacterShell .v459-panel.active');
    if(activePanel?.dataset?.panel) active=activePanel.dataset.panel;
    else{
      const real=document.querySelector('#v459CharacterShell > #v459CharacterTabs button.active');
      if(real?.dataset?.tab) active=real.dataset.tab;
    }
    proxy.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===active));
  }
  function openSetDetails(){
    try{window.v459CharacterTab?.('attributes',true)}catch(e){
      const tab=document.querySelector('#v459CharacterShell > #v459CharacterTabs [data-tab="attributes"]');
      if(tab) tab.click();
    }
    syncTabs();
    requestAnimationFrame(()=>{
      const d=document.getElementById('v459SetDetails');
      if(d){d.open=true;try{d.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}
    });
  }
  function apply(){
    if(running)return;
    running=true;
    try{
      const character=document.getElementById('character');
      const root=document.getElementById('v510HeroRoot');
      if(!character||!root)return;
      character.classList.add('v514-reference-hero');

      const title=root.querySelector('.v510-titlebar');
      let kicker=root.querySelector('.v514-kicker');
      if(!kicker){
        kicker=document.createElement('div');kicker.className='v514-kicker';
        kicker.textContent='AUSRÜSTUNG · ATTRIBUTE · SKILLS · DEINE KAMPFKRAFT';
        title?.insertAdjacentElement('afterend',kicker);
      }

      const stage=root.querySelector('.v510-stage');
      let bookHost=root.querySelector('.v514-book-host');
      if(!bookHost){bookHost=document.createElement('div');bookHost.className='v514-book-host';stage?.insertAdjacentElement('afterend',bookHost)}
      const bookBtn=document.getElementById('v106BookBtn');
      const petBtn=document.getElementById('v686PetAlbumBtn');
      if(bookBtn){
        if(bookBtn.parentElement!==bookHost || bookHost.firstElementChild!==bookBtn){
          bookHost.insertBefore(bookBtn,bookHost.firstElementChild||null);
        }
        if(petBtn && (petBtn.parentElement!==bookHost || petBtn.previousElementSibling!==bookBtn)){
          bookBtn.insertAdjacentElement('afterend',petBtn);
        }
      }

      const footer=root.querySelector('.v510-footer');
      const stats=root.querySelector('.v510-stats');
      const setSummary=document.getElementById('v459SetSummary');
      if(footer&&stats&&stats.parentElement!==footer)footer.prepend(stats);
      move(footer,setSummary);
      setData(setSummary);

      let passiveRow=root.querySelector('.v514-passive-row');
      if(!passiveRow){
        passiveRow=document.createElement('div');passiveRow.className='v514-passive-row';
        passiveRow.innerHTML='<div class="v514-passive-host"></div><button type="button" class="v514-set-btn">Set-Boni ansehen ›</button>';
        footer?.appendChild(passiveRow);
        passiveRow.querySelector('.v514-set-btn')?.addEventListener('click',openSetDetails);
      }
      move(passiveRow.querySelector('.v514-passive-host'),document.getElementById('v4156ClassPassive'));

      let navHost=root.querySelector('.v514-nav-host');
      if(!navHost){navHost=document.createElement('div');navHost.className='v514-nav-host';footer?.appendChild(navHost)}
      let proxy=navHost.querySelector('#v514HeroTabs');
      if(!proxy){
        proxy=document.createElement('nav');proxy.id='v514HeroTabs';proxy.setAttribute('aria-label','Charakterbereiche');
        proxy.innerHTML='<button type="button" data-tab="inventory"><span>🎒</span><em>Inventar</em></button><button type="button" data-tab="attributes"><span>💪</span><em>Attribute</em></button><button type="button" data-tab="talents"><span>🌳</span><em>Talente</em></button><button type="button" data-tab="materials"><span>💎</span><em>Materialien</em></button>';
        navHost.appendChild(proxy);
        proxy.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
          const name=btn.dataset.tab;
          const real=document.querySelector('#v459CharacterShell > #v459CharacterTabs [data-tab="'+name+'"]');
          if(real) real.click();
          else try{window.v459CharacterTab?.(name,true)}catch(e){}
          requestAnimationFrame(syncTabs);
        }));
      }
      syncTabs();

      decorateSlots();
    }catch(e){console.warn('V5.14 Heldenquartier rebuild',e)}
    finally{running=false}
  }

  window.v514ApplyHeroReference=apply;

  window.__v514RenderWrapped='retired';
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()});
  window.__v514GoWrapped='v7119-event';

  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))apply()},{passive:true});
})();
