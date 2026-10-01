(function(){
  const VERSION='V4.99 Stable', SHORT='V4.99';
  const selected=new Set();
  let listScroll=0,lastCraft=null,busy=false,forgeTab='dismantle';
  const YIELD={gray:1,green:3,blue:7,purple:15,orange:30};
  const COLORS={gray:'#9aa29e',green:'#66d24c',blue:'#3f9df4',purple:'#ba65ef',orange:'#f19a34',cyan:'#45ddd7',prism:'#e77bff'};
  const SLOT_META={
    head:{icon:'🪖',label:'Kopfschutz'},weapon:{icon:'⚔️',label:'Waffe'},body:{icon:'🛡️',label:'Rüstung'},
    boots:{icon:'🥾',label:'Stiefel'},ring:{icon:'💍',label:'Ring'},amulet:{icon:'📿',label:'Amulett'}
  };
  const PATTERN={
    grower:{head:{ausdauer:4,staerke:2},weapon:{staerke:6},body:{ausdauer:6},boots:{staerke:3,ausdauer:2},ring:{staerke:4},amulet:{ausdauer:3,staerke:2}},
    scout:{head:{geschick:4,glueck:2},weapon:{geschick:6},body:{ausdauer:3,geschick:3},boots:{geschick:5},ring:{geschick:3,glueck:2},amulet:{geschick:3,glueck:2}},
    bruiser:{head:{intelligenz:4,glueck:2},weapon:{intelligenz:6},body:{intelligenz:4,ausdauer:2},boots:{intelligenz:3,glueck:2},ring:{intelligenz:5},amulet:{intelligenz:3,glueck:2}},
    frost:{head:{ausdauer:4,staerke:2},weapon:{staerke:6},body:{ausdauer:6},boots:{staerke:3,ausdauer:2},ring:{staerke:4},amulet:{ausdauer:3,staerke:2}},
    summoner:{head:{intelligenz:4,ausdauer:2},weapon:{intelligenz:6},body:{ausdauer:5,intelligenz:2},boots:{intelligenz:3,ausdauer:2},ring:{intelligenz:4,glueck:1},amulet:{intelligenz:3,ausdauer:2}}
  };
  const NAMES={
    grower:{head:['Prisma-Kriegshelm','Aurora-Helm'],weapon:['Spektralspalter','Prisma-Harzaxt'],body:['Chroma-Harzpanzer','Aurora-Rüstung'],boots:['Regenbogenstampfer','Spektralstiefel'],ring:['Chromaring','Prismaring'],amulet:['Aurora-Amulett','Spektraltalisman']},
    scout:{head:['Prisma-Blattkapuze','Aurora-Kapuze'],weapon:['Spektralbogen','Prisma-Grünpfeil'],body:['Chroma-Rankenleder','Aurora-Leder'],boots:['Spektral-Leisetreter','Prismastiefel'],ring:['Prisma-Zielring','Chromaring'],amulet:['Aurora-Talisman','Spektralamulett']},
    bruiser:{head:['Prisma-Nebelkapuze','Aurora-Haube'],weapon:['Spektral-Nebelstab','Prisma-Bongstab'],body:['Chroma-Nebelrobe','Aurora-Robe'],boots:['Spektral-Schwebeschuhe','Prismastiefel'],ring:['Prisma-Fokusring','Chromaring'],amulet:['Aurora-Nebelamulett','Spektraltalisman']},
    frost:{head:['Prisma-Eiskrone','Aurora-Frosthelm'],weapon:['Spektral-Frostklinge','Prisma-Nebelreifklinge'],body:['Chroma-Frostpanzer','Aurora-Eisrüstung'],boots:['Spektral-Reifstiefel','Prisma-Eisstiefel'],ring:['Prisma-Frostring','Eisring'],amulet:['Aurora-Frostamulett','Nebelreif-Talisman']},
    summoner:{head:['Prisma-Nebelkapuze','Aurora-Knochenkranz'],weapon:['Spektral-Harzstab','Prisma-Schädelzepter'],body:['Chroma-Sargrobe','Aurora-Geistergewand'],boots:['Spektral-Wurzelstiefel','Prisma-Grabtreter'],ring:['Prisma-Bud-Geister-Ring','Seelenring'],amulet:['Aurora-Seelen-Amulett','Grabnebel-Talisman']}
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>Math.max(0,Math.round(Number(v)||0)).toLocaleString('de-DE');
  const forged=it=>!!(it&&it.v488Prismatic===true);
  /* Migration: alte prismatische Items waren als gebunden markiert. Sie bleiben nicht zerlegbar, sind aber ab jetzt für 0 Gold verkaufbar. */
  try{(s.inventory||[]).forEach(it=>{if(forged(it))it.v488Bound=false});Object.values(s.equipment||{}).forEach(it=>{if(forged(it))it.v488Bound=false})}catch(e){}
  /* Edelsteine und Verzauberungsrollen sind reine Veredelungsmaterialien und nie Schmiede-Schrott.
     Der Check ist absichtlich redundant, damit auch ältere/verschobene Saves geschützt bleiben. */
  function forgeMaterialExcluded(it){
    if(!it||typeof it!=='object')return false;
    const type=String(it.type||'').toLowerCase();
    const baseId=String(it.baseId||'').toLowerCase();
    const id=String(it.id||it.uid||'').toLowerCase();
    return type==='gem'||type==='scroll'||/^gem[_-]/.test(baseId)||/^scroll[_-]/.test(baseId)||(!it.slot&&(/^gem[_-]/.test(id)||/^scroll[_-]/.test(id)));
  }
  function state(){
    s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
    s.v488Forge.fragments=Math.max(0,Math.floor(Number(s.v488Forge.fragments)||0));
    s.v488Forge.crafted=Math.max(0,Math.floor(Number(s.v488Forge.crafted)||0));
    s.v488Forge.dismantled=Math.max(0,Math.floor(Number(s.v488Forge.dismantled)||0));
    return s.v488Forge;
  }
  function q(it){
    if(forged(it)||String(it?.quality||'').toLowerCase()==='prismatic')return'prism';
    const x=(String(it?.quality||'')+' '+String(it?.rarity||'')).toLowerCase();
    if(/cyan|myth|myst/.test(x))return'cyan';
    if(/orange|legend/.test(x))return'orange';
    if(/purple|epic|lila/.test(x))return'purple';
    if(/blue|rare/.test(x))return'blue';
    if(/green|uncommon|gewöhn/.test(x))return'green';
    return'gray';
  }
  function isShopItem(it){return !!(it&&(it.shopItem===true||String(it.source||'').toLowerCase()==='shop'))}
  function isClassSet(it){return !!(it&&(it.setId||it.v6130Crafted===true))}
  function shopRefund(it){
    if(!isShopItem(it))return 0;
    const paid=Math.max(0,Number(it?.shopPaidPrice ?? it?.price)||0);
    return paid>0?Math.max(1,Math.round(paid*.12)):0;
  }
  function yieldOf(it){
    /* Händlerware can be destroyed, but can never convert Gold into Samenfragmente.
       Class-set, mystic and prismatic gear stays protected. */
    if(!it||forgeMaterialExcluded(it)||forged(it)||q(it)==='cyan'||isClassSet(it)||isShopItem(it))return 0;
    return YIELD[q(it)]||0;
  }
  function canDismantle(it){
    if(!it||forgeMaterialExcluded(it)||forged(it)||q(it)==='cyan'||isClassSet(it))return false;
    if(isShopItem(it))return true;
    return yieldOf(it)>0;
  }
  function level(){return Math.max(1,Math.min(300,Math.floor(Number(s?.level)||1)))}
  function cost(){
    /* Stable 25-level recipe bands: fast levelling no longer moves the goal every level.
       The created prism item still uses the exact current character level. */
    const l=level(),tier=Math.floor((l-1)/25),minLevel=tier*25+1,maxLevel=Math.min(300,(tier+1)*25);
    return{tier,minLevel,maxLevel,fragments:150+tier*40,gold:Math.max(1000,Math.round(typeof window.v6168PrismGoldCost==='function'?window.v6168PrismGoldCost(l):(100000+tier*75000)))};
  }
  function ensureItemId(it,i){if(it&&!it.id)it.id=`v488_legacy_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`;return String(it?.id||i)}
  function eligibleRows(){
    return (Array.isArray(s.inventory)?s.inventory:[]).map((it,i)=>({it,i,key:ensureItemId(it,i)})).filter(x=>canDismantle(x.it));
  }
  function selectedRows(){
    return eligibleRows().filter(x=>selected.has(x.key));
  }
  function selectedFragments(){return selectedRows().reduce((n,x)=>n+yieldOf(x.it),0)}
  function selectedGoldRefund(){return selectedRows().reduce((n,x)=>n+shopRefund(x.it),0)}
  function confirmBox(text,opt={}){
    try{if(typeof v115Confirm==='function')return v115Confirm(text,opt)}catch(e){}
    return Promise.resolve(window.confirm(text));
  }
  function alertBox(text,title='Harzschmiede',type='info'){
    try{if(typeof v115Alert==='function')return v115Alert(text,title,type)}catch(e){}
    window.alert(text);
  }
  function save(draw=false){
    try{if(typeof persist==='function')persist(draw);else localStorage.setItem(KEY,JSON.stringify(s))}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
    try{if(typeof v075WriteCloudSave==='function')setTimeout(()=>v075WriteCloudSave(false),0)}catch(e){}
  }
  function ensureScreen(){
    let sec=document.getElementById('forge');if(sec)return sec;
    sec=document.createElement('section');sec.id='forge';sec.className='screen';
    const main=document.querySelector('main')||document.querySelector('.app')||document.body;main.appendChild(sec);return sec;
  }
  function ensureMenu(){
    const panel=document.querySelector('.top-menu-panel');if(!panel)return;
    let b=panel.querySelector('[data-screen="forge"]');
    if(!b){b=document.createElement('button');b.className='top-menu-item';b.dataset.screen='forge';b.innerHTML='<span>🔨</span>Harzschmiede';const shop=panel.querySelector('[data-screen="shop"]');if(shop)shop.insertAdjacentElement('afterend',b);else panel.appendChild(b);b.onclick=()=>v032Go('forge')}
    b.classList.toggle('active',document.getElementById('forge')?.classList.contains('active'));
  }
  function ensureHomeLink(){
    const home=document.querySelector('#world .v366-world');if(!home)return;
    home.querySelectorAll('.v488-home-link').forEach(x=>x.remove());
    let card=home.querySelector('.vForge-home-card');if(card)return;
    const lower=home.querySelector('.v366-lower');if(!lower)return;
    card=document.createElement('article');
    card.className='v366-panel v366-feature forge vForge-home-card';
    card.innerHTML='<h2>Harzschmiede</h2><div class="v366-feature-art vForge-home-art"><span class="vForge-home-icon">🔨🌿</span></div><div class="v690-mini-status">Ausrüstung zerlegen · prismatisch schmieden</div><button class="v366-go" data-go="forge">Öffnen</button>';
    card.querySelector('[data-go="forge"]')?.addEventListener('click',()=>v032Go('forge'));
    const book=lower.querySelector('.v366-feature.book');
    if(book)book.insertAdjacentElement('afterend',card);else lower.appendChild(card);
  }
  function forgeItemArt(it){
    if(!it)return '<span class="v6236-forge-fallback">🎁</span>';
    try{
      /* Final V6.107/V6.108 artwork authority, fed with the EXACT inventory object. */
      if(typeof window.v6107ItemImgHtml==='function'){
        const h=window.v6107ItemImgHtml(it,'v6236-forge-item-art');
        if(h)return h;
      }
    }catch(e){}
    try{
      const u=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri(it):'';
      if(u){
        const alt=esc(String(it?.name||'Item').replace(/["<>]/g,''));
        return `<img class="v466-item-art v6107-item-art v6236-forge-item-art" data-v6107="1" src="${u}" alt="${alt}">`;
      }
    }catch(e){}
    return `<span class="v6236-forge-fallback">${esc(it?.icon||SLOT_META[it?.slot]?.icon||'🎁')}</span>`;
  }

  function renderItems(){
    const inv=(Array.isArray(s.inventory)?s.inventory:[]).map((it,i)=>({it,i})).filter(x=>!forgeMaterialExcluded(x.it));
    if(!inv.length)return '<div class="empty" style="grid-column:1/-1;font-size:8px;padding:16px">Keine Ausrüstung im Inventar.</div>';
    return inv.map(({it,i})=>{
      const key=ensureItemId(it,i),qq=q(it),y=yieldOf(it),refund=shopRefund(it),blocked=!canDismantle(it),sel=selected.has(key);
      const reason=forged(it)?'Prismatisch geschützt':qq==='cyan'?'Mystisch geschützt':isClassSet(it)?'Klassenset geschützt':'';
      const gain=isShopItem(it)?`Händlerware · 0 Frag.${refund?` · +${fmt(refund)} Gold`:''}`:`+${y} Frag.`;
      return `<button type="button" class="v488-item ${qq} ${blocked?'blocked':''} ${sel?'selected':''}" data-v488-key="${esc(key)}" data-v6236-inv-index="${i}" ${blocked?'disabled':''}><span class="ico v4103-forge-art v6236-forge-art">${forgeItemArt(it)}</span><div class="nm">${esc(String(it?.name||'Item').replace(/^\w+\s*:\s*/,'').replace(/\s*\[Lv\.\d+\]\s*$/i,''))}</div><div class="yield">${blocked?esc(reason):gain}</div>${blocked?'<span class="lock">🔒</span>':''}</button>`;
    }).join('');
  }
  function renderForge(){
    /* V7.273 Beta: while Nebelschmied owns the forge, the legacy renderer
       must not rebuild the entire forge DOM. Those rebuilds caused flicker. */
    if(document.getElementById('forge')?.classList.contains('v7240-nebel-open'))return;
    const sec=ensureScreen(),z=state(),c=cost(),rows=selectedRows(),sum=selectedFragments(),refund=selectedGoldRefund(),eligible=eligibleRows(),allEligibleSelected=eligible.length>0&&eligible.every(x=>selected.has(x.key)),can=z.fragments>=c.fragments&&(Number(s.gold)||0)>=c.gold&&!busy;
    const dismantleView=()=>`<div class="v667-view v667-view-dismantle">
      <div class="v667-hero-wrap">
        <section class="v667-hero v490-center" id="v488Stage" aria-label="Amboss der Harzschmiede"><div class="v490-live-hammer">🔨</div></section>
        <div class="v667-hero-title">Wähle Ausrüstung zum Zerlegen</div>
      </div>
      <div class="v667-content">
        <div class="v667-section-title">Ausrüstung zerlegen</div>
        <div class="v667-select-tools"><button type="button" class="v667-select-all ${allEligibleSelected?'active':''}" id="v667SelectAll" ${eligible.length&&!busy?'':'disabled'}>${allEligibleSelected?'✖ AUSWAHL AUFHEBEN':'✓ ALLE AUSWÄHLEN'}</button></div>
        <div class="v667-inventory v490-inventory" id="v488ForgeInventory">${renderItems()}</div>
        <div class="v667-summary"><div class="v667-count"><b>${rows.length}</b>&nbsp; ausgewählt</div><div class="v667-frags">💠 +${fmt(sum)} Samenfragmente${refund?` · 🪙 +${fmt(refund)} Gold`:''}</div></div>
        <button type="button" class="v488-btn v667-action v667-dismantle" id="v488Dismantle" ${rows.length&&!busy?'':'disabled'}>🔨 ${rows.length?rows.length+' Item'+(rows.length===1?'':'s')+' ZERLEGEN':'ITEMS AUSWÄHLEN'}</button>
        <div class="v667-note">🛒 Händlerware: <b>0 Samenfragmente</b>, nur 12 % des Kaufpreises als Gold zurück. 💎 Edelsteine, 📜 Rollen, Klassensets sowie mystische und prismatische Gegenstände sind geschützt.</div>
      </div>
    </div>`;
    const craftView=()=>`<div class="v667-view v667-view-craft">
      <div class="v667-hero-wrap">
        <section class="v667-hero v667-craft-hero v490-center" id="v488Stage" aria-label="Prismatisches Schmieden"><div class="v490-prism-art" aria-label="Prismatisches Beispielitem"></div></section>
        <div class="v667-hero-title">Aus Ausrüstung wächst Legendäres</div>
      </div>
      <div class="v667-recipe">
        <div class="v667-recipe-head">Rezeptkosten · Level ${c.minLevel}–${c.maxLevel}</div>
        <div class="v667-cost-grid">
          <div class="v667-cost ${z.fragments>=c.fragments?'ok':'bad'}"><div class="ico">💠</div><b>Samenfragmente</b><span>${fmt(z.fragments)} / ${fmt(c.fragments)}</span></div>
          <div class="v667-cost ${(Number(s.gold)||0)>=c.gold?'ok':'bad'}"><div class="ico">🪙</div><b>Gold</b><span>${fmt(s.gold)} / ${fmt(c.gold)}</span></div>
          <div class="v667-result"><div class="ico">🌈❓</div><b>1 zufälliges prismatisches Item</b><small>Item = aktuelles Level · Kosten steigen nur alle 25 Level</small></div>
        </div>
        <button type="button" class="v488-btn v667-action v667-craft" id="v488Craft" ${can?'':'disabled'}>🔨 PRISMATISCHES ITEM SCHMIEDEN</button>
        ${lastCraft?`<div class="v667-last"><b>✨ Geschmiedet:</b><br>${esc(lastCraft.icon)} ${esc(lastCraft.name)}<br>${esc(typeof itemBonus==='function'?itemBonus(lastCraft):'')}</div>`:''}
        <div class="v667-rules">
          <div class="v667-rule"><strong>💰 Verkaufbar</strong>0 Gold</div>
          <div class="v667-rule"><strong>🔨 Nicht zerlegbar</strong>Keine Endlosschleife</div>
          <div class="v667-rule"><strong>🌈 Über Legendär</strong>Stärkere Grundwerte</div>
          <div class="v667-rule"><strong>💠 Unter Mystisch</strong>Kein Weltboss-Spezialeffekt</div>
        </div>
      </div>
    </div>`;
    sec.innerHTML=`<div class="v488-shell v490-shell">
      <div class="v490-titlebar">
        <div><h2>Harzschmiede</h2><p>ZERLEGEN · VERWANDELN · PRISMATISCH SCHMIEDEN</p></div>
        <div class="v490-frag-pill"><span class="v488-frag-gem">💠</span><span><small>Samenfragmente</small><b>${fmt(z.fragments)}</b></span></div>
      </div>
      <div class="v667-forge-body">
        <div class="v667-tabs" role="tablist" aria-label="Harzschmiede Bereiche">
          <button type="button" class="v667-tab ${forgeTab==='dismantle'?'active':''}" data-v667-tab="dismantle"><span class="ic">🔨</span><span>ZERLEGEN<small>Ausrüstung in Samenfragmente</small></span></button>
          <button type="button" class="v667-tab ${forgeTab==='craft'?'active':''}" data-v667-tab="craft"><span class="ic">⚒️</span><span>SCHMIEDEN<small>Zufälliger Slot · deine Klasse</small></span></button>
        </div>
        ${forgeTab==='craft'?craftView():dismantleView()}
        <div class="v490-legend v667-legend">
          <div class="v490-legend-title">✦ FRAGMENTE PRO SELTENHEIT ✦</div>
          <div class="v488-leg"><i style="--c:#9aa29e"></i><span>Normal</span><b>+1</b></div>
          <div class="v488-leg"><i style="--c:#66d24c"></i><span>Gewöhnlich</span><b>+3</b></div>
          <div class="v488-leg"><i style="--c:#3f9df4"></i><span>Selten</span><b>+7</b></div>
          <div class="v488-leg"><i style="--c:#ba65ef"></i><span>Episch</span><b>+15</b></div>
          <div class="v488-leg"><i style="--c:#f19a34"></i><span>Legendär</span><b>+30</b></div>
        </div>
      </div>
    </div>`;
    sec.querySelectorAll('[data-v667-tab]').forEach(btn=>btn.addEventListener('click',()=>{const next=btn.dataset.v667Tab;if(next!=='dismantle'&&next!=='craft')return;if(next===forgeTab)return;forgeTab=next;renderForge()}));
    const list=sec.querySelector('#v488ForgeInventory');if(list){list.scrollTop=listScroll;list.addEventListener('scroll',()=>listScroll=list.scrollTop,{passive:true})}
    sec.querySelector('#v667SelectAll')?.addEventListener('click',()=>{if(busy)return;listScroll=list?.scrollTop||0;const rows=eligibleRows(),all=rows.length>0&&rows.every(x=>selected.has(x.key));if(all)rows.forEach(x=>selected.delete(x.key));else rows.forEach(x=>selected.add(x.key));renderForge()});
    sec.querySelectorAll('[data-v488-key]').forEach(card=>card.onclick=()=>{const k=card.dataset.v488Key;if(!k)return;listScroll=list?.scrollTop||0;selected.has(k)?selected.delete(k):selected.add(k);renderForge()});
    sec.querySelector('#v488Dismantle')?.addEventListener('click',dismantle);
    sec.querySelector('#v488Craft')?.addEventListener('click',craft);
    try{if(typeof window.v4103DecorateItemSurfaces==='function')setTimeout(()=>window.v4103DecorateItemSurfaces(),0)}catch(e){}
    try{if(typeof window.v4112RefreshAllItemArt==='function')setTimeout(()=>window.v4112RefreshAllItemArt(sec),0)}catch(e){}
  }
  function burst(kind='dismantle',quality='green'){
    const st=document.getElementById('v488Stage');if(!st)return;
    st.classList.remove('hit','crafting');void st.offsetWidth;st.classList.add(kind==='craft'?'crafting':'hit');
    const palette=kind==='craft'?['#ff69ce','#886cff','#45b5ff','#5ae676','#ffd65a','#ff7c58']:[COLORS[quality]||'#71d958'];
    for(let i=0;i<22;i++){
      const x=document.createElement('i');x.className='v488-shard';x.style.setProperty('--c',palette[i%palette.length]);x.style.setProperty('--x',`${Math.round((Math.random()-.5)*250)}px`);x.style.setProperty('--y',`${-35-Math.round(Math.random()*155)}px`);x.style.setProperty('--r',`${Math.round(Math.random()*360)}deg`);x.style.setProperty('--d',`${Math.round(Math.random()*90)}ms`);st.appendChild(x);setTimeout(()=>x.remove(),900)
    }
    setTimeout(()=>st.classList.remove('hit','crafting'),1050);
  }
  async function dismantle(){
    if(busy)return;const rows=selectedRows();if(!rows.length)return;
    const total=rows.reduce((n,x)=>n+yieldOf(x.it),0),refund=rows.reduce((n,x)=>n+shopRefund(x.it),0),valuable=rows.filter(x=>['purple','orange'].includes(q(x.it)));
    const warning=valuable.length?`\n\n⚠️ ${valuable.length} epische/legendäre Gegenstände sind ausgewählt.`:'';
    const gains=[`${total} Samenfragmente`,refund?`${fmt(refund)} Gold Händler-Rückgewinnung`:null].filter(Boolean).join(' + ');
    const ok=await confirmBox(`${rows.length} Gegenstand${rows.length===1?'':'e'} wirklich zerlegen?\n\nDu erhältst ${gains}.${warning}`,{title:'In der Harzschmiede zerlegen?',type:valuable.length?'error':'warn',okText:`Zerlegen · ${total} Frag.${refund?` + ${fmt(refund)} Gold`:''}`});
    if(!ok)return;busy=true;
    burst('dismantle',q(rows[0].it));await new Promise(r=>setTimeout(r,430));
    const ids=new Set(rows.map(x=>x.key));s.inventory=(s.inventory||[]).filter((it,i)=>!ids.has(ensureItemId(it,i)));const z=state();z.fragments+=total;s.gold=Math.max(0,Number(s.gold)||0)+refund;z.dismantled+=rows.length;selected.clear();save(false);busy=false;renderForge();
    try{if(typeof render==='function')render()}catch(e){}
    try{if(typeof v063Toast==='function')v063Toast(total?`+${total} Samenfragmente`:`🛒 Händlerware zerlegt`,'success',`${rows.length} Item${rows.length===1?'':'s'} zerlegt${refund?` · +${fmt(refund)} Gold`:''}`)}catch(e){}
  }
  function createPrismatic(){
    const cls=['grower','scout','bruiser','frost','summoner'].includes(String(s.playerClass))?String(s.playerClass):'grower';const slots=Object.keys(SLOT_META),slot=slots[Math.floor(Math.random()*slots.length)],names=NAMES[cls][slot],name=names[Math.floor(Math.random()*names.length)],lvl=level(),pat={...(PATTERN[cls][slot]||{})};
    const item={id:`prism_${cls}_${slot}_${Date.now()}_${Math.random().toString(36).slice(2)}`,classId:cls,slot,icon:SLOT_META[slot].icon,name:`Prismatisch: ${name} [Lv.${lvl}]`,price:0,quality:'prismatic',rarity:'prismatic-orange',dropLevel:lvl,bonus:{...pat},baseBonusV055:{...pat},source:'forge_prismatic',v488Prismatic:true,v488Bound:false,v488EssencePct:.08,v488CreatedAt:Date.now()};
    try{if(typeof window.v447ApplyItemCurve==='function')window.v447ApplyItemCurve(item)}catch(e){console.warn('Harzschmiede Itemkurve',e)}
    return item;
  }
  async function craft(){
    if(busy)return;const z=state(),c=cost();if(z.fragments<c.fragments)return alertBox(`Dir fehlen ${fmt(c.fragments-z.fragments)} Samenfragmente.`,'Zu wenig Fragmente','warn');if((Number(s.gold)||0)<c.gold)return alertBox(`Dir fehlen ${fmt(c.gold-(Number(s.gold)||0))} Gold.`,'Zu wenig Gold','warn');
    const ok=await confirmBox(`Prismatisches Item schmieden?\n\nKosten:\n${fmt(c.fragments)} Samenfragmente\n${fmt(c.gold)} Gold\n\nDer Slot wird zufällig bestimmt. Das Item gehört immer zu deiner aktuellen Klasse.`,{title:'🌈 Prismatisches Item schmieden',type:'confirm',okText:'Jetzt schmieden'});if(!ok)return;
    busy=true;z.fragments-=c.fragments;s.gold=(Number(s.gold)||0)-c.gold;const item=createPrismatic();s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.inventory.push(item);z.crafted++;lastCraft=item;save(false);burst('craft','prism');busy=false;renderForge();try{if(typeof render==='function')render()}catch(e){}setTimeout(()=>{if(document.getElementById('forge')?.classList.contains('active')){renderForge();burst('craft','prism')}},30);try{if(typeof v063Toast==='function')v063Toast('🌈 Prismatisches Item geschmiedet!','success',item.name)}catch(e){}
  }

  /* UI rarity support. The save quality remains "prismatic", so mystic-only achievements/drops stay isolated. */
  try{
    if(typeof qualityMeta==='function'&&!window.__v488QualityMeta){const base=qualityMeta;qualityMeta=function(x){if(String(x).toLowerCase()==='prismatic')return{label:'Prismatisch',cls:'prismatic-orange',color:'q-prismatic',mult:6};return base.apply(this,arguments)};window.__v488QualityMeta=true}
  }catch(e){}
  try{
    if(typeof v123RarityLabel==='function'&&!window.__v488RarityLabel){const base=v123RarityLabel;v123RarityLabel=function(it){return forged(it)?'Prismatisch':base.apply(this,arguments)};window.__v488RarityLabel=true}
  }catch(e){}

  /* Prismatische Ausrüstung gets +8% effective item stats while equipped. This is a combat/stat bonus,
     not a mystic special effect, and leaves the unified V4.47 item curve untouched. */
  try{
    if(typeof totalAttr==='function'&&!window.__v488TotalAttr){const base=totalAttr;totalAttr=function(k){const raw=Number(base.apply(this,arguments))||0;let p=0;Object.values(s?.equipment||{}).forEach(it=>{if(forged(it))p+=Number(it?.v429StatLock?.native?.[k] ?? it?.bonus?.[k])||0});return Math.round(raw+p*.08)};window.__v488TotalAttr=true}
  }catch(e){}

  /* Prismatische Schmiede-Items bleiben 0-Gold-Items und nicht zerlegbar, dürfen aber aus dem Inventar verkauft/entfernt werden. */
  try{
    if(typeof sellValue==='function'&&!window.__v488SellValue){const base=sellValue;sellValue=function(it){return forged(it)?0:base.apply(this,arguments)};window.__v488SellValue=true}
  }catch(e){}
  try{
    if(typeof window.sellItem==='function'&&!window.__v488SellItem){const base=window.sellItem;window.sellItem=async function(i){return base.apply(this,arguments)};window.__v488SellItem=true}
  }catch(e){}
  try{
    if(typeof window.sellEquipped==='function'&&!window.__v488SellEquipped){const base=window.sellEquipped;window.sellEquipped=async function(slot){return base.apply(this,arguments)};window.__v488SellEquipped=true}
  }catch(e){}
  try{
    if(typeof v268SellSelected==='function'&&!window.__v488MultiSell){const base=v268SellSelected;v268SellSelected=async function(){return base.apply(this,arguments)};window.__v488MultiSell=true}
  }catch(e){}

  function paintPrismaticInventory(){
    const cards=[...document.querySelectorAll('#character #inventory .inventory-grid .inv-item')];cards.forEach((card,i)=>{const it=s.inventory?.[i];if(!forged(it))return;card.classList.add('prismatic-orange','v488-prismatic-card');const price=card.querySelector('.sell-price');if(price)price.textContent='Verkaufswert: 💰 0 Gold';const sell=card.querySelector('.sell-btn');if(sell){sell.disabled=false;sell.textContent='Verkaufen · 0 Gold'}const pick=card.querySelector('.v268-pick input');if(pick){pick.disabled=false}if(!card.querySelector('.v488-bound-tag')){const t=document.createElement('div');t.className='v488-bound-tag';t.textContent='🌈 PRISMATISCH · Verkauf 0 Gold · nicht zerlegbar';const actions=card.querySelector('.inv-actions');if(actions)card.insertBefore(t,actions);else card.appendChild(t)}});
    Object.entries(s.equipment||{}).forEach(([slot,it])=>{if(!forged(it))return;const el=document.getElementById('slot-'+slot);if(!el)return;el.classList.add('prismatic-orange');const buttons=[...el.querySelectorAll('button')];buttons.forEach(b=>{if(/💰|verkauf/i.test(b.textContent||'')){b.disabled=false;b.textContent='💰 0'}});el.querySelectorAll('.v488-bound-tag').forEach(t=>t.remove())});
  }
  try{
    if(typeof renderInventory==='function'&&!window.__v488InventoryRender){const base=renderInventory;renderInventory=function(){const r=base.apply(this,arguments);paintPrismaticInventory();return r};try{window.renderInventory=renderInventory}catch(e){}window.__v488InventoryRender=true}
  }catch(e){}
  try{
    if(typeof v123OpenItem==='function'&&!window.__v488ItemOverlay){const base=v123OpenItem;v123OpenItem=function(slot){const r=base.apply(this,arguments);setTimeout(()=>{const it=s.equipment?.[slot];if(forged(it)){const ov=document.getElementById('v123ItemOverlay');ov?.querySelectorAll('button').forEach(b=>{if(/💰|verkauf/i.test(b.textContent||'')){b.disabled=false;b.textContent='💰 Verkaufen · 0 Gold'}})}},0);return r};window.__v488ItemOverlay=true}
  }catch(e){}

  function stamp(){}

  ensureScreen();state();ensureMenu();ensureHomeLink();
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    ensureScreen();ensureMenu();
    if(id==='forge')renderForge();
    if(id==='world')ensureHomeLink();
    paintPrismaticInventory();stamp();
  },{passive:true});
  window.__v488Go='v7119-event';
  try{
    if(typeof render==='function'&&!window.__v488Render){const base=render;render=function(){const r=base.apply(this,arguments);ensureScreen();ensureMenu();ensureHomeLink();paintPrismaticInventory();if(document.getElementById('forge')?.classList.contains('active'))renderForge();stamp();return r};try{window.render=render}catch(e){}window.__v488Render=true}
  }catch(e){}
  try{
    if(typeof persist==='function'&&!window.__v488Persist){const base=persist;persist=function(){const r=base.apply(this,arguments);try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return r};try{window.persist=persist}catch(e){}window.__v488Persist=true}
  }catch(e){}

  if(document.getElementById('forge')?.classList.contains('active'))renderForge();paintPrismaticInventory();stamp();
  document.addEventListener('DOMContentLoaded',()=>{ensureScreen();ensureMenu();ensureHomeLink();paintPrismaticInventory();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{ensureMenu();ensureHomeLink();paintPrismaticInventory();stamp()},{passive:true});
  /* V8.009: delayed startup repair train retired; direct lifecycle owns UI. */
  window.v488OpenForge=()=>v032Go('forge');window.v488ForgeState=state;window.v488ForgeRender=renderForge;
})();
