(function(){
  const VERSION='V4.67 Stable',SHORT='V4.67';
  let layingOut=false;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function stamp(){}

  function activeTab(){
    try{return sessionStorage.getItem('growLegends:v459CharacterTab')||'inventory'}catch(e){return'inventory'}
  }
  function activate(name,scroll=false){
    const shell=document.getElementById('v459CharacterShell');if(!shell)return;
    if(!['inventory','attributes','talents','materials'].includes(name))name='inventory';
    shell.querySelectorAll('#v459CharacterTabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    shell.querySelectorAll('.v459-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
    try{sessionStorage.setItem('growLegends:v459CharacterTab',name)}catch(e){}
    if(scroll)try{shell.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}
  }
  window.v459CharacterTab=activate;

  function ensureShell(character,hero){
    let shell=document.getElementById('v459CharacterShell');
    if(shell)return shell;
    shell=document.createElement('div');shell.id='v459CharacterShell';
    shell.innerHTML=`
      <nav id="v459CharacterTabs" aria-label="Charakterbereiche">
        <button type="button" data-tab="inventory"><span>🎒</span><em>Inventar</em></button>
        <button type="button" data-tab="attributes"><span>💪</span><em>Attribute</em></button>
        <button type="button" data-tab="talents"><span>🌳</span><em>Talente</em></button>
        <button type="button" data-tab="materials"><span>💎</span><em>Materialien</em></button>
      </nav>
      <div class="v459-panel" id="v459PanelInventory" data-panel="inventory"></div>
      <div class="v459-panel" id="v459PanelAttributes" data-panel="attributes"></div>
      <div class="v459-panel" id="v459PanelTalents" data-panel="talents"></div>
      <div class="v459-panel" id="v459PanelMaterials" data-panel="materials"></div>`;
    if(hero.nextSibling)character.insertBefore(shell,hero.nextSibling);else character.appendChild(shell);
    shell.querySelectorAll('#v459CharacterTabs button').forEach(b=>b.onclick=()=>activate(b.dataset.tab,true));
    return shell;
  }

  function ensureAttrCard(panel){
    let card=document.getElementById('v459AttrCard');
    if(!card){
      card=document.createElement('div');card.id='v459AttrCard';
      card.innerHTML=`<div class="v459-panel-head"><h2>💪 Attribute</h2><span id="v459AttrPoints">0 Punkte</span></div>`;
      panel.prepend(card);
    }
    return card;
  }

  function detailsWrap(panel,id,label,card,open=false){
    if(!card)return null;
    let d=document.getElementById(id);
    if(!d){
      d=document.createElement('details');d.id=id;d.className='v459-extra';d.open=!!open;
      const sm=document.createElement('summary');sm.textContent=label;d.appendChild(sm);panel.appendChild(d);
    }
    if(card.parentElement!==d)d.appendChild(card);
    return d;
  }

  function updateHero(){
    const cls=s?.playerClass||'';
    let count=0;try{count=typeof equippedSetCount==='function'?Number(equippedSetCount(cls))||0:Object.values(s?.equipment||{}).filter(x=>x?.setId===cls).length}catch(e){}
    const setName=(()=>{try{return classSets?.[cls]?.name||''}catch(e){return''}})();
    let talents=Math.max(0,Number(s?.skillPoints)||0);try{if(typeof v314Available==='function')talents=Math.max(0,Number(v314Available())||0)}catch(e){}
    const box=document.getElementById('v459SetSummary');
    if(box && !window.__V7124_CHARACTER_SUMMARY_OWNER__)box.innerHTML=cls?`🧩 ${esc(setName||'Klassen-Set')} <b>${count}/6</b> · 🌳 Talentpunkte <b>${talents}</b>`:'🧬 Wähle zuerst deine Klasse';
    const ap=document.getElementById('v459AttrPoints');if(ap)ap.textContent=`${Math.max(0,Number(s?.points)||0)} Punkte`;
    const invBtn=document.querySelector('#v459CharacterTabs [data-tab="inventory"] em');if(invBtn)invBtn.textContent=`Inventar · ${(s?.inventory||[]).length}`;
    const talBtn=document.querySelector('#v459CharacterTabs [data-tab="talents"] em');if(talBtn)talBtn.textContent=`Talente · ${talents}`;
    const matBtn=document.querySelector('#v459CharacterTabs [data-tab="materials"] em');if(matBtn)matBtn.textContent=`Materialien · ${(s?.materials||[]).length}`;
  }

  function layout(){
    if(window.__V504_CHARACTER_OWNER__)return false;
    if(layingOut)return false;layingOut=true;
    try{
      const character=document.getElementById('character');
      const hero=character?.querySelector(':scope > .hero-card');
      if(!character||!hero)return false;
      character.classList.add('v459-character-hub');
      const shell=ensureShell(character,hero);
      const invPanel=document.getElementById('v459PanelInventory');
      const attrPanel=document.getElementById('v459PanelAttributes');
      const talentPanel=document.getElementById('v459PanelTalents');
      const materialPanel=document.getElementById('v459PanelMaterials');

      /* Disable the obsolete V4.42/V4.44 layout owner without touching its save logic. */
      const bottom=hero.querySelector('.char-bottom,.v459-hero-bottom');
      if(bottom){
        bottom.classList.remove('char-bottom');bottom.classList.add('v459-hero-bottom');
        const combat=bottom.querySelector('.combat-row');
        let setSummary=document.getElementById('v459SetSummary');
        if(!setSummary){setSummary=document.createElement('div');setSummary.id='v459SetSummary';bottom.appendChild(setSummary)}
        if(combat&&bottom.firstElementChild!==combat)bottom.insertBefore(combat,bottom.firstElementChild);
      }

      const inv=document.getElementById('inventory');const invCard=inv?.closest('.card');
      if(invCard&&invCard.parentElement!==invPanel)invPanel.appendChild(invCard);

      const attrs=document.getElementById('attrs');const attrCard=ensureAttrCard(attrPanel);
      if(attrs&&attrs.parentElement!==attrCard)attrCard.appendChild(attrs);

      const skill=document.getElementById('skillTree');const skillCard=skill?.closest('.card');
      if(skillCard&&skillCard.parentElement!==talentPanel)talentPanel.appendChild(skillCard);

      const set=document.getElementById('setPanel');const setCard=set?.closest('.card');
      detailsWrap(attrPanel,'v459SetDetails','🧩 Set-Boni ansehen',setCard,false);
      const classesEl=document.getElementById('classGrid');const classCard=classesEl?.closest('.card');
      detailsWrap(attrPanel,'v459ClassDetails','🧬 Klasse & Spezialisierung',classCard,!s?.playerClass);

      const materials=document.getElementById('v030Materials');
      if(materials&&materials.parentElement!==materialPanel)materialPanel.appendChild(materials);
      if(!materials && !materialPanel.querySelector('.v459-material-placeholder')){
        const e=document.createElement('div');e.className='empty v459-material-placeholder';e.textContent='Noch keine Edelsteine oder Rollen.';materialPanel.appendChild(e);
      }
      if(materials)materialPanel.querySelector('.v459-material-placeholder')?.remove();

      updateHero();activate(activeTab(),false);stamp();
      return true;
    }catch(e){console.warn('V4.67 character layout',e);return false}
    finally{layingOut=false}
  }
  window.v459ArrangeCharacter=layout;

  function ensureInventoryOverlay(){
    let ov=document.getElementById('v459InventoryOverlay');if(ov)return ov;
    ov=document.createElement('div');ov.id='v459InventoryOverlay';ov.innerHTML='<div id="v459InventorySheet"></div>';
    ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};document.body.appendChild(ov);return ov;
  }
  function closeInventory(){document.getElementById('v459InventoryOverlay')?.classList.remove('show')}
  window.v459CloseInventory=closeInventory;

  function openInventory(i){
    const it=s?.inventory?.[i];if(!it)return;
    const ov=ensureInventoryOverlay(),box=document.getElementById('v459InventorySheet');if(!box)return;
    let rarity=String(it.quality||it.rarity||'Normal');try{rarity=qualityMeta(it.quality||'gray')?.label||rarity}catch(e){}
    let bonus='Keine Werte';try{bonus=typeof v123BaseBonusText==='function'?(v123BaseBonusText(it)||bonus):(itemBonus(it)||bonus)}catch(e){}
    let cmp='';try{cmp=typeof comparison==='function'?comparison(it):''}catch(e){}
    let sv=0;try{sv=sellValue(it)}catch(e){}
    const ench=it.enchant||(Array.isArray(it.enchants)?it.enchants[0]:null);
    const extra=[
      it.gem?`<div class="v459-sheet-section"><b>💎 Edelstein</b>${esc(it.gem.name||'Edelstein')} · +${Number(it.gem.value)||0} ${esc(typeof v030StatLabel==='function'?v030StatLabel(it.gem.stat):it.gem.stat)}</div>`:'',
      ench?`<div class="v459-sheet-section"><b>📜 Verzauberung</b>${esc(ench.name||'Rolle')} · ${esc(typeof v030EffectLabel==='function'?v030EffectLabel(ench.effect,ench.value):ench.effect)}</div>`:'',
      it.setName?`<div class="v459-sheet-section"><b>🧩 Set</b>${esc(it.setName)}-Set</div>`:'',
      it.mysticSpecial?`<div class="v459-sheet-section"><b>✨ Mystischer Spezialeffekt</b>${esc(typeof v296MysticSpecialText==='function'?v296MysticSpecialText(it):it.mysticSpecial.label||'Spezialeffekt')}</div>`:''
    ].join('');
    box.innerHTML=`
      <div class="v459-sheet-head"><div class="v459-sheet-icon">${window.v6107ItemImgHtml?.(it,'v459-sheet-art')||esc(it.icon||'🎁')}</div><div class="v459-sheet-name">${esc(it.name||'Unbekanntes Item')}</div><div class="v459-sheet-rarity">${esc(rarity)} · Level ${Math.max(1,Number(it.dropLevel)||Number(s.level)||1)}</div></div>
      <div class="v459-sheet-section"><b>Attribute & Effekte</b>${esc(bonus)}</div>
      ${extra}
      ${cmp?`<div class="v459-sheet-section"><b>⚖️ Vergleich mit angelegt</b>${cmp}</div>`:''}
      <div class="v459-sheet-actions"><button class="btn" id="v459EquipItem">Anlegen</button><button class="btn gold" id="v459SellItem">💰 ${sv}</button></div>
      <button class="btn secondary" id="v459CloseItem" style="width:100%;margin-top:7px">Schließen</button>`;
    box.querySelector('#v459EquipItem').onclick=()=>{closeInventory();window.equip?.(i)};
    box.querySelector('#v459SellItem').onclick=()=>{closeInventory();window.sellItem?.(i)};
    box.querySelector('#v459CloseItem').onclick=closeInventory;
    ov.classList.add('show');
  }
  window.v459OpenInventoryItem=openInventory;

  function compactInventory(){
    const cards=[...document.querySelectorAll('#character #inventory .inventory-grid > .inv-item')];
    cards.forEach((card,i)=>{
      const it=s?.inventory?.[i];if(!it)return;
      card.dataset.v459Index=String(i);card.setAttribute('role','button');card.setAttribute('tabindex','0');
      const name=card.querySelector('.item-name');
      if(name){
        name.replaceChildren();
        const icon=document.createElement('span');icon.className='v459-inv-icon';
        try{
          const u=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):'';
          if(u){const im=document.createElement('img');im.className='v466-item-art';im.src=u;im.alt=String(it.name||'Item');im.decoding='async';icon.appendChild(im)}
          else icon.textContent=it.icon||'🎁';
        }catch(e){icon.textContent=it.icon||'🎁'};
        const txt=document.createElement('span');txt.className='v459-inv-name';
        txt.textContent=String(it.name||'Unbekanntes Item').replace(/^(Normal|Gewöhnlich|Rare|Episch|Legendär|Mystisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'');
        name.append(icon,txt);
      }
      let lv=card.querySelector('.v459-inv-level');if(!lv){lv=document.createElement('span');lv.className='v459-inv-level';card.appendChild(lv)}
      lv.textContent=`Lv.${Math.max(1,Number(it.dropLevel)||Number(s.level)||1)}`;
      const open=e=>{if(e.target.closest('.v268-pick,input,button,label'))return;openInventory(i)};
      card.onclick=open;card.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('input,button')){e.preventDefault();openInventory(i)}};
    });
    updateHero();
  }
  window.v459CompactInventory=compactInventory;

  /* Final UI owners only. Game mechanics and save functions are intentionally untouched. */
  try{if(typeof renderInventory==='function'&&!window.__v459InventoryWrapped){const base=renderInventory;renderInventory=function(){const r=base.apply(this,arguments);layout();compactInventory();return r};try{window.renderInventory=renderInventory}catch(e){}window.__v459InventoryWrapped=true}}catch(e){}
  try{if(typeof renderSkillTree==='function'&&!window.__v459TalentWrapped){const base=renderSkillTree;renderSkillTree=function(){const r=base.apply(this,arguments);layout();updateHero();return r};try{window.renderSkillTree=renderSkillTree}catch(e){}window.__v459TalentWrapped=true}}catch(e){}
  try{if(typeof v030Materials==='function'&&!window.__v459MaterialsWrapped){const base=v030Materials;v030Materials=function(){const r=base.apply(this,arguments);layout();updateHero();return r};try{window.v030Materials=v030Materials}catch(e){}window.__v459MaterialsWrapped=true}}catch(e){}
  try{if(typeof render==='function'&&!window.__v459RenderWrapped){const base=render;render=function(){const r=base.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active')){layout();compactInventory();updateHero()}stamp();return r};try{window.render=render}catch(e){}window.__v459RenderWrapped=true}}catch(e){}
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character'){layout();compactInventory();updateHero();stamp()}});window.__v459GoWrapped='v7119-event';

  layout();compactInventory();stamp();
  document.addEventListener('DOMContentLoaded',()=>{layout();compactInventory();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{layout();compactInventory();stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{layout();compactInventory();updateHero();stamp()},{passive:true});
  /* V6.217: obsolete V4.44 polling guard retired. Existing targeted layout retries remain. */
})();
