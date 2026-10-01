(function(){
  const VERSION='V4.68 Stable',SHORT='V4.68';
  const Q={
    gray:{rim:'#aeb7b2',glow:'#66736b'},green:{rim:'#7ee04f',glow:'#3e9c3b'},blue:{rim:'#43a7ff',glow:'#286ab0'},
    purple:{rim:'#c66cff',glow:'#763ca0'},orange:{rim:'#ff9a35',glow:'#aa5b1d'},cyan:{rim:'#42ece7',glow:'#168f8c'}
  };
  const C={
    grower:{metal:'#afb8ad',dark:'#4c5850',accent:'#76dd52',leather:'#795239'},
    bruiser:{metal:'#a89abd',dark:'#554a65',accent:'#a477ff',leather:'#553a55'},
    scout:{metal:'#9fb8ae',dark:'#486259',accent:'#53d6a0',leather:'#5a4b33'},
    generic:{metal:'#b0b8b2',dark:'#525f57',accent:'#79d760',leather:'#67503a'}
  };
  const SLOTS=new Set(['weapon','head','body','boots','ring','amulet']);
  const URI_CACHE=new Map();
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function hash(v){let h=2166136261;for(const ch of String(v||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function plain(it){return String(it?.name||'Item').replace(/^(Normal|Gewöhnlich|Rare|Selten|Episch|Legendär|Mystisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'').trim()}
  function key(it){return `${it?.classId||'generic'}|${it?.setName||it?.mysticSetId||''}|${it?.type||'gear'}|${it?.slot||''}|${plain(it)}`}
  function quality(it){const q=String(it?.quality||'').toLowerCase();if(Q[q])return q;const r=String(it?.rarity||'').toLowerCase();if(/myth|myst|cyan/.test(r))return'cyan';if(/legend|orange/.test(r))return'orange';if(/epic|purple/.test(r))return'purple';if(/rare|blue/.test(r))return'blue';if(/green|uncommon/.test(r))return'green';return'gray'}
  function clsId(it){
    if(C[it?.classId])return it.classId;
    const b=it?.bonus||{};
    if(Number(b.intelligenz)>0)return'bruiser';
    if(Number(b.geschick)>0)return'scout';
    if(Number(b.staerke)>0)return'grower';
    if(it?.stat==='intelligenz')return'bruiser';
    if(it?.stat==='geschick')return'scout';
    if(it?.stat==='staerke')return'grower';
    return'generic';
  }
  function defs(it){
    const h=hash(key(it)),id='v466'+(h%1000000),q=Q[quality(it)],c=C[clsId(it)]||C.generic;
    return {h,id,q,c,variant:h%7,defs:`<defs>
      <radialGradient id="${id}bg" cx="50%" cy="43%" r="72%"><stop offset="0" stop-color="${q.glow}" stop-opacity=".25"/><stop offset=".52" stop-color="#0d1812" stop-opacity=".72"/><stop offset="1" stop-color="#040806" stop-opacity=".98"/></radialGradient>
      <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edf0ec"/><stop offset=".28" stop-color="${c.metal}"/><stop offset=".72" stop-color="${c.dark}"/><stop offset="1" stop-color="#252d28"/></linearGradient>
      <linearGradient id="${id}wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a4794d"/><stop offset=".55" stop-color="${c.leather}"/><stop offset="1" stop-color="#2e2118"/></linearGradient>
      <linearGradient id="${id}accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2f8d8"/><stop offset=".32" stop-color="${c.accent}"/><stop offset="1" stop-color="${q.rim}"/></linearGradient>
      <filter id="${id}glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="${id}soft"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>`};
  }
  function frameStart(d,it){
    const stars=Array.from({length:5+(d.variant%3)},(_,i)=>{const x=24+((d.h>>(i+1))%207),y=22+((d.h>>(i+6))%207),r=1+(i%2);return `<circle cx="${x}" cy="${y}" r="${r}" fill="${d.q.rim}" opacity="${.13+i*.025}"/>`}).join('');
    return `${d.defs}<rect x="7" y="7" width="242" height="242" rx="32" fill="url(#${d.id}bg)"/><circle cx="128" cy="127" r="76" fill="${d.q.glow}" opacity=".09" filter="url(#${d.id}soft)"/>${stars}<rect x="12" y="12" width="232" height="232" rx="28" fill="none" stroke="${d.q.rim}" stroke-opacity=".26" stroke-width="2"/>`;
  }
  function specialOverlay(it,d){
    let out='';
    if(it?.setName||it?.setId||it?.mysticSetId)out+=`<path d="M37 198 C72 222 184 222 219 198" fill="none" stroke="${d.q.rim}" stroke-width="4" opacity=".72"/><path d="M54 205 C82 218 174 218 202 205" fill="none" stroke="${d.c.accent}" stroke-width="2" opacity=".55"/>`;
    if(quality(it)==='cyan')out+=`<circle cx="128" cy="128" r="91" fill="none" stroke="#70fff8" stroke-width="3" stroke-dasharray="6 8" opacity=".62"/><circle cx="128" cy="128" r="101" fill="none" stroke="#32bdb8" stroke-width="2" stroke-dasharray="2 11" opacity=".48"/>`;
    else if(quality(it)==='orange')out+=`<path d="M47 57 L64 41 L74 63 M182 63 L192 41 L209 57" fill="none" stroke="#ffc066" stroke-width="4" opacity=".7"/>`;
    return out;
  }
  function gearOverlay(it,d){
    const v=d.variant,id=d.id,slot=it?.slot,c=d.c,q=d.q;
    if(slot==='head'){
      const variants=[
        `<path d="M72 86 L51 53 L86 68 M184 86 L205 53 L170 68" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M92 58 L103 29 L117 61 M139 61 L153 29 L164 58" fill="url(#${id}accent)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M64 114 L34 97 L58 84 M192 114 L222 97 L198 84" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M128 38 L143 67 L128 81 L113 67Z" fill="url(#${id}accent)" filter="url(#${id}glow)"/><path d="M95 67 Q128 44 161 67" fill="none" stroke="${c.accent}" stroke-width="5"/>`,
        `<path d="M77 69 C62 45 53 44 45 52 C54 72 65 83 82 90 M179 69 C194 45 203 44 211 52 C202 72 191 83 174 90" fill="none" stroke="url(#${id}wood)" stroke-width="9"/>`,
        `<path d="M84 52 L96 33 L108 55 M148 55 L160 33 L172 52 M116 47 L128 23 L140 47" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M62 139 Q128 112 194 139" fill="none" stroke="url(#${id}accent)" stroke-width="8" opacity=".75"/><circle cx="128" cy="74" r="9" fill="${q.rim}"/>`
      ]; return variants[v];
    }
    if(slot==='weapon'){
      const variants=[
        `<path d="M79 173 L59 196 L85 189 M177 173 L197 196 L171 189" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<circle cx="128" cy="112" r="22" fill="none" stroke="${c.accent}" stroke-width="4" stroke-dasharray="5 6" opacity=".72"/><circle cx="128" cy="112" r="8" fill="${q.rim}" filter="url(#${id}glow)"/>`,
        `<path d="M92 87 L61 68 L72 101 M164 87 L195 68 L184 101" fill="url(#${id}accent)" stroke="${q.rim}" stroke-width="3" opacity=".82"/>`,
        `<path d="M104 48 L128 23 L152 48 L139 66 H117Z" fill="url(#${id}accent)" stroke="${q.rim}" stroke-width="3" filter="url(#${id}glow)"/>`,
        `<path d="M84 154 Q128 187 172 154" fill="none" stroke="url(#${id}accent)" stroke-width="6"/><circle cx="94" cy="160" r="6" fill="${q.rim}"/><circle cx="162" cy="160" r="6" fill="${q.rim}"/>`,
        `<path d="M64 128 L42 119 L57 104 M192 128 L214 119 L199 104" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M128 57 C103 80 99 107 128 128 C157 107 153 80 128 57Z" fill="none" stroke="${c.accent}" stroke-width="5" opacity=".62"/>`
      ]; return variants[v];
    }
    if(slot==='body'){
      const variants=[
        `<path d="M67 88 L35 103 L54 133 L82 113 M189 88 L221 103 L202 133 L174 113" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="4"/>`,
        `<path d="M89 103 H167 L154 151 H102Z" fill="none" stroke="url(#${id}accent)" stroke-width="6"/><circle cx="128" cy="126" r="10" fill="${q.rim}"/>`,
        `<path d="M87 74 Q128 48 169 74" fill="none" stroke="${c.accent}" stroke-width="7"/><path d="M72 181 L103 156 M184 181 L153 156" stroke="${q.rim}" stroke-width="5"/>`,
        `<path d="M65 100 L42 77 L58 65 L86 92 M191 100 L214 77 L198 65 L170 92" fill="url(#${id}wood)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M109 76 L128 49 L147 76 L140 103 H116Z" fill="url(#${id}accent)" filter="url(#${id}glow)"/><path d="M98 158 H158" stroke="${q.rim}" stroke-width="5"/>`,
        `<path d="M79 119 Q128 86 177 119 Q165 175 128 195 Q91 175 79 119Z" fill="none" stroke="${c.accent}" stroke-width="5" opacity=".65"/>`,
        `<path d="M75 70 L56 43 L91 61 M181 70 L200 43 L165 61" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`
      ]; return variants[v];
    }
    if(slot==='boots'){
      const variants=[
        `<path d="M55 168 L34 184 L59 190 M201 168 L222 184 L197 190" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M70 70 L86 43 L103 70 M153 70 L170 43 L186 70" fill="url(#${id}metal)" stroke="${q.rim}" stroke-width="3"/>`,
        `<path d="M62 114 H111 M145 114 H194" stroke="${c.accent}" stroke-width="8"/><circle cx="87" cy="114" r="6" fill="${q.rim}"/><circle cx="169" cy="114" r="6" fill="${q.rim}"/>`,
        `<path d="M75 146 L95 127 L111 145 M145 145 L161 127 L181 146" fill="none" stroke="url(#${id}accent)" stroke-width="6"/>`,
        `<path d="M46 183 Q84 204 120 180 M136 180 Q172 204 210 183" fill="none" stroke="${q.rim}" stroke-width="5"/>`,
        `<path d="M84 63 V144 M172 63 V144" stroke="${c.accent}" stroke-width="5" stroke-dasharray="7 7"/>`,
        `<path d="M63 92 L42 78 L57 113 M193 92 L214 78 L199 113" fill="url(#${id}wood)" stroke="${q.rim}" stroke-width="3"/>`
      ]; return variants[v];
    }
    return'';
  }
  function jewelryArt(it,d){
    const id=d.id,v=d.variant,slot=it.slot;
    if(slot==='ring'){
      const gems=[
        `<path d="M128 67 L151 92 L128 119 L105 92Z" fill="url(#${id}accent)"/>`,
        `<circle cx="128" cy="89" r="25" fill="url(#${id}accent)"/>`,
        `<path d="M103 91 L115 65 H141 L154 91 L128 119Z" fill="url(#${id}accent)"/>`,
        `<path d="M128 61 L159 83 L147 116 H109 L97 83Z" fill="url(#${id}accent)"/>`,
        `<path d="M128 58 C144 72 154 87 128 118 C102 87 112 72 128 58Z" fill="url(#${id}accent)"/>`,
        `<path d="M101 80 L128 58 L155 80 L145 112 L111 112Z" fill="url(#${id}accent)"/>`,
        `<path d="M106 79 L128 56 L150 79 L150 105 L128 122 L106 105Z" fill="url(#${id}accent)"/>`
      ];
      return `<ellipse cx="128" cy="151" rx="57" ry="50" fill="none" stroke="url(#${id}metal)" stroke-width="22"/><path d="M88 116 Q128 88 168 116" fill="none" stroke="${d.q.rim}" stroke-width="9"/>${gems[v]}<circle cx="128" cy="90" r="37" fill="none" stroke="${d.q.rim}" stroke-width="3" opacity=".55"/>`;
    }
    const pendants=[
      `<circle cx="128" cy="144" r="31" fill="url(#${id}accent)"/>`,
      `<path d="M128 110 L158 142 L128 180 L98 142Z" fill="url(#${id}accent)"/>`,
      `<path d="M128 105 C157 129 160 154 128 181 C96 154 99 129 128 105Z" fill="url(#${id}accent)"/>`,
      `<path d="M96 138 Q128 99 160 138 Q151 176 128 186 Q105 176 96 138Z" fill="url(#${id}metal)"/><circle cx="128" cy="145" r="14" fill="url(#${id}accent)"/>`,
      `<path d="M128 103 L166 130 L151 174 H105 L90 130Z" fill="url(#${id}accent)"/>`,
      `<ellipse cx="128" cy="145" rx="38" ry="27" fill="url(#${id}metal)"/><ellipse cx="128" cy="145" rx="19" ry="12" fill="url(#${id}accent)"/>`,
      `<path d="M128 104 L145 130 L174 137 L151 158 L156 187 L128 173 L100 187 L105 158 L82 137 L111 130Z" fill="url(#${id}accent)"/>`
    ];
    return `<path d="M68 68 Q128 20 188 68 Q177 108 151 128 M68 68 Q79 108 105 128" fill="none" stroke="url(#${id}metal)" stroke-width="8" stroke-dasharray="7 5"/>${pendants[v]}<circle cx="128" cy="145" r="42" fill="none" stroke="${d.q.rim}" stroke-width="3" opacity=".45"/>`;
  }
  function materialArt(it,d){
    const id=d.id,v=d.variant;
    if(it.type==='gem'){
      const shapes=[
        `<path d="M128 45 L170 94 L151 190 H105 L86 94Z"/>`,
        `<path d="M128 48 L180 118 L128 198 L76 118Z"/>`,
        `<path d="M94 67 L158 51 L187 112 L151 190 L85 166 L70 106Z"/>`,
        `<path d="M128 45 L164 78 L178 139 L142 194 L93 181 L73 120 L92 70Z"/>`,
        `<path d="M128 50 L151 90 L192 99 L160 132 L166 180 L128 158 L90 180 L96 132 L64 99 L105 90Z"/>`,
        `<path d="M100 60 L152 60 L181 108 L158 190 L99 190 L72 111Z"/>`,
        `<path d="M128 44 C159 76 179 107 165 145 C151 183 128 199 128 199 C128 199 105 183 91 145 C77 107 97 76 128 44Z"/>`
      ];
      return `<g fill="url(#${id}accent)" stroke="${d.q.rim}" stroke-width="4" filter="url(#${id}glow)">${shapes[v]}</g><path d="M128 58 L128 181 M96 102 L160 102" stroke="#effff9" stroke-width="3" opacity=".48"/>`;
    }
    const seals=['☘','✦','⚔','◈','☾','✧','♜'];
    return `<g><path d="M74 57 Q128 43 182 57 L171 197 Q128 211 85 197Z" fill="#d8c898" stroke="${d.q.rim}" stroke-width="4"/><path d="M82 72 H174 M91 96 H165 M91 116 H153 M92 137 H167" stroke="#6e6346" stroke-width="5" opacity=".72"/><path d="M64 57 Q76 42 93 57 V73 H64Z M163 57 Q180 42 192 57 V73 H163Z" fill="url(#${id}wood)"/><circle cx="128" cy="169" r="24" fill="url(#${id}accent)" stroke="${d.q.rim}" stroke-width="3" filter="url(#${id}glow)"/><text x="128" y="177" text-anchor="middle" font-size="24" fill="#102014" font-family="serif">${seals[v]}</text></g>`;
  }
  function fullSvg(it){
    if(!it)return'';
    const d=defs(it);let art='';
    if(it.type==='gem'||it.type==='scroll')art=materialArt(it,d);
    else if(it.slot==='ring'||it.slot==='amulet')art=jewelryArt(it,d);
    else if(SLOTS.has(it.slot)&&typeof window.v465ItemArtSvg==='function'){
      const base=window.v465ItemArtSvg(it)||'';
      if(base){const add=`<g filter="url(#${d.id}glow)">${gearOverlay(it,d)}</g>${specialOverlay(it,d)}`;const enriched=base.replace(/<svg([^>]*)>/,m=>m+d.defs);return enriched.replace('</svg>',add+'</svg>')}
    }
    if(!art)return'';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${esc(plain(it))}">${frameStart(d,it)}<g filter="url(#${d.id}glow)">${art}</g>${specialOverlay(it,d)}</svg>`;
  }
  function uri(it){
    if(!it)return'';
    try{
      if(window.__V6107_GLOBAL_ITEM_ART_AUTHORITY__&&typeof window.v6106RealItemArt==='function'){
        const current=window.v6106RealItemArt(it);if(current)return current;
      }
    }catch(e){}
    const ck=key(it)+'|'+quality(it)+'|'+clsId(it);
    const cached=URI_CACHE.get(ck);if(cached)return cached;
    const svg=fullSvg(it),u=svg?'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg):'';
    if(u){if(URI_CACHE.size>512)URI_CACHE.clear();URI_CACHE.set(ck,u)}
    return u;
  }
  function img(it){const u=uri(it);if(!u)return null;const el=document.createElement('img');el.className='v466-item-art';el.src=u;el.alt=plain(it);el.loading='lazy';el.decoding='async';return el}
  function replace(box,it){
    if(!box||!it)return false;const u=uri(it);if(!u)return false;
    const current=box.querySelector(':scope > img.v466-item-art');
    if(current&&current.getAttribute('src')===u&&box.childElementCount===1)return true;
    const el=document.createElement('img');el.className='v466-item-art';el.src=u;el.alt=plain(it);el.loading='lazy';el.decoding='async';
    box.replaceChildren(el);box.dataset.v466Art='1';return true;
  }
  window.v466ItemArtUri=uri;window.v466ItemArtSvg=fullSvg;

  function decorateShop(){
    [['#v057WeaponGrid .shop-item',s?.weaponShop||[]],['#v057MagicGrid .shop-item',s?.magicShop||[]]].forEach(([sel,arr])=>{
      document.querySelectorAll(sel).forEach((card,i)=>{const it=arr[i];if(it)replace(card.querySelector('.shop-icon,.v41-shop-icon'),it)});
    });
  }
  function decorateInventory(){
    document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((card,i)=>{
      const it=s?.inventory?.[i];if(!it)return;const box=card.querySelector('.v459-inv-icon');if(box)replace(box,it);
      let mark=card.querySelector('.v466-set-mark');if(mark)mark.remove();
      if(it.setName||it.setId||it.mysticSetId){mark=document.createElement('span');mark.className='v466-set-mark';mark.textContent=quality(it)==='cyan'?'MYTHIC SET':'SET';card.appendChild(mark)}
    });
  }
  function decorateEquipment(){
    ['head','weapon','ring','body','boots','amulet'].forEach(slot=>{const it=s?.equipment?.[slot];if(it)replace(document.querySelector('#slot-'+slot+' .slot-icon'),it)});
  }
  function decorateMaterials(){
    document.querySelectorAll('#character #v030Materials .inventory-grid > .inv-item').forEach((card,i)=>{
      const it=s?.materials?.[i];if(!it)return;let box=card.querySelector('.v466-material-artbox');if(!box){box=document.createElement('div');box.className='v466-material-artbox';card.insertBefore(box,card.firstChild)}replace(box,it);
    });
  }
  function decorateSheet(i){const it=s?.inventory?.[Number(i)];if(it)replace(document.querySelector('#v459InventorySheet .v459-sheet-icon'),it)}
  function decorateAll(){
    const shopActive=!!document.querySelector('#shop')?.classList.contains('active');
    const charActive=!!document.querySelector('#character')?.classList.contains('active');
    if(shopActive)decorateShop();
    /* Character/Inventory cleanup Phase 2: V468 owns inventory art and V470 owns
       equipment slot art. V466 stays responsible for materials/shop/purchase compatibility only. */
    if(charActive)decorateMaterials();
  }

  /* Reward cards use the same artwork as shop/inventory. */
  try{
    if(typeof v240ItemRewardHtml==='function'&&!window.__v466RewardHtmlWrapped){
      const base=v240ItemRewardHtml;
      v240ItemRewardHtml=function(it){
        const html=base.apply(this,arguments),u=uri(it);if(!u)return html;
        return html.replace(/<div class="v240-loot-icon">[\s\S]*?<\/div>/,`<div class="v240-loot-icon"><img class="v466-item-art" src="${u}" alt="${esc(plain(it))}"></div>`);
      };
      window.__v466RewardHtmlWrapped=true;
    }
  }catch(e){}

  /* ---------- purchase durability ---------- */
  function deepClone(v){try{return typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v))}catch(e){return {...v}}}
  function uniqueId(it,prefix){return `${prefix}_${it?.baseId||plain(it).replace(/\s+/g,'_').slice(0,28)||'item'}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}
  function accountCheckpoint(){
    try{
      const user=(typeof v073User!=='undefined')?v073User:null,uid=user&&!user.is_anonymous?String(user.id||''):'';
      if(uid&&typeof window.v452AccountVerified==='function'&&window.v452AccountVerified(uid)){
        try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
        try{if(typeof v145SaveScopedLocal==='function')v145SaveScopedLocal()}catch(e){}
        try{if(typeof v213LocalCheckpoint==='function')v213LocalCheckpoint('v466-purchase')}catch(e){}
        try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
      }
    }catch(e){}
  }
  function syncShopResources(){
    try{document.querySelectorAll('#shopGold').forEach(el=>el.textContent=Math.max(0,Number(s?.gold)||0).toLocaleString('de-DE'))}catch(e){}
    try{document.querySelectorAll('#shopHarz').forEach(el=>el.textContent=Math.max(0,Number(s?.harzTaler)||0).toLocaleString('de-DE'))}catch(e){}
    try{if(typeof window.v441PaintResources==='function')window.v441PaintResources()}catch(e){}
  }
  function refreshPurchasedSlot(kind,index){
    const i=Number(index);
    if(!Number.isInteger(i)||i<0)return false;
    const arr=kind==='weapon'?s?.weaponShop:s?.magicShop;
    const it=arr?.[i];
    const grid=document.querySelector(kind==='weapon'?'#v057WeaponGrid':'#v057MagicGrid');
    if(!it||!grid||typeof v057OfferHtml!=='function')return false;
    const cards=[...grid.children].filter(el=>el?.classList?.contains('shop-item'));
    const oldCard=cards[i];
    if(!oldCard)return false;
    const holder=document.createElement('div');
    holder.innerHTML=String(v057OfferHtml(it,i,kind)||'').trim();
    const fresh=holder.firstElementChild;
    if(!fresh)return false;
    oldCard.replaceWith(fresh);
    const btn=fresh.querySelector('.v057-buy');
    if(btn)btn.onclick=()=>kind==='weapon'?window.v030BuyWeapon(i):window.v030BuyMagic(i);
    syncShopResources();
    try{decorateShop()}catch(e){}
    return true;
  }
  function focusedRefresh(kind=null,index=null){
    /* Successful purchases update exactly one merchant card. Full rendering is only a recovery fallback. */
    if(kind&&(kind==='weapon'||kind==='magic')&&refreshPurchasedSlot(kind,index))return;
    try{if(typeof renderShop==='function')renderShop()}catch(e){console.warn('V4.68 shop refresh',e)}
    try{if(typeof renderInventory==='function')renderInventory()}catch(e){console.warn('V4.68 inventory refresh',e)}
    try{if(typeof v030Materials==='function')v030Materials()}catch(e){}
    try{if(typeof window.v459ArrangeCharacter==='function')window.v459ArrangeCharacter()}catch(e){}
    try{if(typeof window.v459CompactInventory==='function')window.v459CompactInventory()}catch(e){}
    syncShopResources();
    try{decorateAll()}catch(e){}
  }
  function successToast(item,dest){
    const count=dest==='Inventar'?(s.inventory||[]).length:(s.materials||[]).length;
    try{
      if(typeof v063Toast==='function')return v063Toast('✅ Kauf gespeichert','success',`${plain(item)} · ${dest}: ${count}`);
      if(typeof v054Purchased==='function')return v054Purchased(item,dest);
    }catch(e){}
  }
  function noGold(){try{if(typeof v054NotEnoughGold==='function')return v054NotEnoughGold();if(typeof v115Alert==='function')return v115Alert('Nicht genug Gold.')}catch(e){}}
  function commitPurchase(kind,i){
    const shop=kind==='weapon'?s?.weaponShop:s?.magicShop,it=shop?.[i];if(!it)return false;
    const price=Math.max(0,Number(it.price)||0);
    const currentGold=Math.max(0,Number(s.gold)||0);
    if(currentGold<price){noGold();return false}
    s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.materials=Array.isArray(s.materials)?s.materials:[];
    const before={gold:currentGold,inv:s.inventory.slice(),mat:s.materials.slice(),shop:shop.slice()};
    const isMaterial=kind==='magic'&&(it.type==='gem'||it.type==='scroll');
    const bought=deepClone(it);bought.id=uniqueId(it,isMaterial?'material':'purchase');bought.v466PurchasedAt=Date.now();bought.v466PurchaseSource=kind;
    try{
      s.gold=before.gold-price;
      const dest=isMaterial?s.materials:s.inventory;dest.push(bought);
      if(kind==='weapon')s.weaponShop[i]=typeof v057Replacement==='function'?v057Replacement(s.weaponShop,i,v057WeaponOffer):s.weaponShop[i];
      else if(isMaterial)s.magicShop[i]=typeof v057Replacement==='function'?v057Replacement(s.magicShop,i,v057MaterialOffer):s.magicShop[i];
      else s.magicShop[i]=typeof v057Replacement==='function'?v057Replacement(s.magicShop,i,()=>v057JewelryOffer(String(it.slot||'').toLowerCase()==='amulet'?'amulet':'ring')):s.magicShop[i];

      /* This is the critical difference from the old handler: use the current persist/checkpoint path. */
      if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s));
      accountCheckpoint();
      const live=(isMaterial?s.materials:s.inventory).some(x=>x&&String(x.id)===String(bought.id));
      if(!live)throw new Error('PURCHASE_NOT_IN_DESTINATION');
      window.__V466_LAST_PURCHASE__={ok:true,id:bought.id,name:bought.name,destination:isMaterial?'Materialien':'Inventar',at:Date.now()};
      focusedRefresh(kind,i);successToast(bought,isMaterial?'Materialien':'Inventar');
      return true;
    }catch(e){
      s.gold=before.gold;s.inventory=before.inv;s.materials=before.mat;
      if(kind==='weapon')s.weaponShop=before.shop;else s.magicShop=before.shop;
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
      focusedRefresh();
      window.__V466_LAST_PURCHASE__={ok:false,error:String(e?.message||e),at:Date.now()};
      try{if(typeof v063Toast==='function')v063Toast('Kauf nicht gespeichert','error','Gold wurde zurückerstattet. Bitte erneut versuchen.')}catch(_){}
      return false;
    }
  }
  window.v466CommitPurchase=commitPurchase;
  window.v030BuyWeapon=function(i){return commitPurchase('weapon',Number(i))};
  window.v030BuyMagic=function(i){return commitPurchase('magic',Number(i))};

  function rebindShopButtons(){
    document.querySelectorAll('#v057WeaponGrid .v057-buy').forEach((b,i)=>{b.onclick=()=>window.v030BuyWeapon(Number(b.dataset.index??i))});
    document.querySelectorAll('#v057MagicGrid .v057-buy').forEach((b,i)=>{b.onclick=()=>window.v030BuyMagic(Number(b.dataset.index??i))});
  }

  /* Final presentation owners. */
  try{if(typeof window.v459CompactInventory==='function'&&!window.__v466CompactWrapped){const base=window.v459CompactInventory;window.v459CompactInventory=function(){const r=base.apply(this,arguments);decorateInventory();decorateEquipment();return r};window.__v466CompactWrapped=true}}catch(e){}
  try{if(typeof window.v459OpenInventoryItem==='function'&&!window.__v466SheetWrapped){const base=window.v459OpenInventoryItem;window.v459OpenInventoryItem=function(i){const r=base.apply(this,arguments);decorateSheet(i);return r};window.__v466SheetWrapped=true}}catch(e){}
  try{if(typeof v030Materials==='function'&&!window.__v466MaterialsWrapped){const base=v030Materials;v030Materials=function(){const r=base.apply(this,arguments);decorateMaterials();return r};window.__v466MaterialsWrapped=true}}catch(e){}
  try{if(typeof renderShop==='function'&&!window.__v466ShopWrapped){const base=renderShop;renderShop=function(){const r=base.apply(this,arguments);rebindShopButtons();decorateShop();return r};window.renderShop=renderShop;window.__v466ShopWrapped=true}}catch(e){}
  /* Character/Inventory cleanup Phase 2: V466 inventory/equipment render hook retired.
     V468/V470 are the final visual owners. */
  /* V8.009: global render shop decoration hook retired.
     renderShop owns shop decoration; character/inventory have their later dedicated owners. */
  function stamp(){}
  function bootDecorate(){if(document.querySelector('#shop')?.classList.contains('active'))rebindShopButtons();decorateAll();stamp()}
  document.addEventListener('DOMContentLoaded',bootDecorate,{once:true});
  window.addEventListener('pageshow',bootDecorate,{passive:true});
  window.addEventListener('growlegends:account-ready',bootDecorate,{passive:true});
  bootDecorate();
})();
