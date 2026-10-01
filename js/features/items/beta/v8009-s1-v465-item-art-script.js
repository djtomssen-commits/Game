(function(){
  const VERSION='V4.68 Stable',SHORT='V4.68';
  const GEAR_SLOTS=new Set(['weapon','head','body','boots']);
  const Q={
    gray:{rim:'#aeb7b2',glow:'#7d8881'},green:{rim:'#7ee04f',glow:'#49a63f'},blue:{rim:'#43a7ff',glow:'#266cc4'},
    purple:{rim:'#c66cff',glow:'#7d38a8'},orange:{rim:'#ff9a35',glow:'#b95f16'},cyan:{rim:'#42ece7',glow:'#169b98'}
  };
  const CLASS={
    grower:{metal:'#a9b3a9',metal2:'#5d685f',accent:'#6fd34f',leather:'#704a2f'},
    bruiser:{metal:'#9b91b7',metal2:'#514960',accent:'#8f67ff',leather:'#4f364f'},
    scout:{metal:'#9eb5ad',metal2:'#4c625b',accent:'#52d49f',leather:'#5a4931'},
    generic:{metal:'#aeb7b2',metal2:'#59635d',accent:'#7fd65f',leather:'#66503a'}
  };
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function hash(s){let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function qOf(it){const q=String(it?.quality||'').toLowerCase();if(Q[q])return q;const r=String(it?.rarity||'').toLowerCase();if(/myth|myst|cyan/.test(r))return'cyan';if(/legend|orange/.test(r))return'orange';if(/epic|purple/.test(r))return'purple';if(/rare|blue/.test(r))return'blue';if(/green|uncommon/.test(r))return'green';return'gray'}
  function clsOf(it){return CLASS[it?.classId]||CLASS.generic}
  function plainName(it){return String(it?.name||'Item').replace(/^(Normal|Gewöhnlich|Rare|Selten|Episch|Legendär|Mystisch):\s*/i,'').replace(/\s*\[Lv\.\d+\]\s*$/i,'')}
  function kindOf(it){
    const n=plainName(it).toLowerCase(),ic=String(it?.icon||'');
    if(it?.slot==='weapon'){
      if(/bogen|bow/.test(n)||ic==='🏹')return'bow';
      if(/stab|zepter|kristall|wand/.test(n)||/[🪄🔮]/u.test(ic))return'staff';
      if(/schere/.test(n)||ic==='✂️')return'shears';
      if(/handschuh/.test(n)||ic==='🧤')return'gloves';
      if(/hammer|kolben|keule/.test(n)||/[🔨]/u.test(ic))return'hammer';
      if(/axt|spalter|beißer|beisser/.test(n)||ic==='🪓')return'axe';
      return'sword';
    }
    if(it?.slot==='head'){
      if(/krone/.test(n)||ic==='👑')return'crown';
      if(/maske/.test(n)||/[🥽🎭]/u.test(ic))return'mask';
      if(/kapuze|kappe|hood/.test(n)||/[🧙🥷🧢]/u.test(ic))return'hood';
      return'helmet';
    }
    if(it?.slot==='body'){
      if(/robe|gewand|mantel/.test(n)||/[🥋🧥]/u.test(ic))return'robe';
      if(/hoodie/.test(n))return'hoodie';
      return'armor';
    }
    if(it?.slot==='boots')return'boots';
    return'generic';
  }
  function frameDefs(it){
    const q=Q[qOf(it)],c=clsOf(it),id='v'+(hash(plainName(it))%999999);
    return {q,c,id,defs:`
      <defs>
        <radialGradient id="${id}bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="${q.glow}" stop-opacity=".20"/><stop offset=".55" stop-color="#0c1711" stop-opacity=".58"/><stop offset="1" stop-color="#040806" stop-opacity=".96"/></radialGradient>
        <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e4e9e3"/><stop offset=".28" stop-color="${c.metal}"/><stop offset=".68" stop-color="${c.metal2}"/><stop offset="1" stop-color="#303733"/></linearGradient>
        <linearGradient id="${id}wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9b7146"/><stop offset=".55" stop-color="${c.leather}"/><stop offset="1" stop-color="#312216"/></linearGradient>
        <linearGradient id="${id}accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8f6c9"/><stop offset=".3" stop-color="${c.accent}"/><stop offset="1" stop-color="${q.rim}"/></linearGradient>
        <filter id="${id}glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>`};
  }
  function leaf(id,x,y,s=1,rot=0){return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C9-11 16-8 19-3 C12 0 8 4 3 10 C4 5 2 2 0 0Z" fill="url(#${id}accent)" opacity=".9"/><path d="M2 1 L14-4" stroke="#d9efcf" stroke-width="1.4" opacity=".65"/></g>`}
  function artWeapon(kind,d){const {id}=d;switch(kind){
    case'axe':return `<g transform="rotate(-24 128 128)"><rect x="118" y="66" width="18" height="132" rx="8" fill="url(#${id}wood)" stroke="#2b1d14" stroke-width="4"/><path d="M132 67 C164 50 192 60 202 83 C180 82 168 94 158 116 C145 109 133 100 124 91Z" fill="url(#${id}metal)" stroke="#d9ded8" stroke-width="3"/><path d="M130 67 C106 54 91 61 75 78 C95 81 109 91 120 108 C131 101 137 88 139 76Z" fill="url(#${id}metal)" opacity=".78"/><circle cx="127" cy="75" r="8" fill="url(#${id}accent)"/>${leaf(id,109,119,.9,-20)}</g>`;
    case'hammer':return `<g transform="rotate(-28 128 128)"><rect x="119" y="72" width="18" height="135" rx="8" fill="url(#${id}wood)" stroke="#2d2118" stroke-width="4"/><rect x="73" y="50" width="111" height="58" rx="13" fill="url(#${id}metal)" stroke="#d6dcd5" stroke-width="3"/><rect x="86" y="59" width="15" height="40" rx="4" fill="url(#${id}accent)" opacity=".8"/><circle cx="128" cy="79" r="10" fill="#253029" stroke="${d.q.rim}" stroke-width="3"/>${leaf(id,135,123,.8,22)}</g>`;
    case'staff':return `<g transform="rotate(18 128 128)"><path d="M121 51 C118 83 118 163 130 211" fill="none" stroke="url(#${id}wood)" stroke-width="18" stroke-linecap="round"/><circle cx="118" cy="51" r="31" fill="url(#${id}accent)" opacity=".3" filter="url(#${id}glow)"/><path d="M118 24 L135 48 L119 78 L98 49Z" fill="url(#${id}accent)" stroke="#d8f0e0" stroke-width="3"/><path d="M97 66 C76 61 72 48 78 38 C87 47 94 50 106 51" fill="none" stroke="${d.c.metal}" stroke-width="7" stroke-linecap="round"/></g>`;
    case'bow':return `<g transform="rotate(-10 128 128)"><path d="M80 38 C40 86 43 169 88 216" fill="none" stroke="url(#${id}wood)" stroke-width="15" stroke-linecap="round"/><path d="M80 38 L88 216" stroke="#dfe9dd" stroke-width="2" opacity=".85"/><path d="M83 125 L178 104" stroke="url(#${id}metal)" stroke-width="6" stroke-linecap="round"/><path d="M179 104 L160 93 L163 111Z" fill="url(#${id}accent)"/>${leaf(id,71,74,.75,-50)}${leaf(id,70,178,.75,45)}</g>`;
    case'shears':return `<g><g transform="rotate(34 128 128)"><path d="M120 50 L139 144 L126 149 L94 58Z" fill="url(#${id}metal)"/><circle cx="132" cy="163" r="24" fill="none" stroke="url(#${id}wood)" stroke-width="10"/></g><g transform="rotate(-34 128 128)"><path d="M136 50 L117 144 L130 149 L162 58Z" fill="url(#${id}metal)"/><circle cx="124" cy="163" r="24" fill="none" stroke="url(#${id}wood)" stroke-width="10"/></g><circle cx="128" cy="139" r="9" fill="url(#${id}accent)"/></g>`;
    case'gloves':return `<g><path d="M67 91 C77 72 96 71 106 88 L110 132 C103 156 91 175 73 180 C60 163 57 146 59 125Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="3"/><path d="M149 91 C159 72 178 71 188 88 L192 132 C185 156 173 175 155 180 C142 163 139 146 141 125Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="3"/>${leaf(id,90,117,.85,-25)}${leaf(id,171,117,.85,-25)}</g>`;
    default:return `<g transform="rotate(30 128 128)"><path d="M124 36 L145 55 L137 155 L119 155 L111 55Z" fill="url(#${id}metal)" stroke="#e2e6e0" stroke-width="3"/><path d="M97 153 H159" stroke="url(#${id}accent)" stroke-width="12" stroke-linecap="round"/><rect x="120" y="154" width="16" height="57" rx="7" fill="url(#${id}wood)"/><circle cx="128" cy="151" r="8" fill="${d.q.rim}"/>${leaf(id,137,102,.65,25)}</g>`;
  }}
  function artHead(kind,d){const {id}=d;switch(kind){
    case'crown':return `<g><path d="M54 146 L69 78 L105 112 L128 57 L153 113 L189 78 L202 146Z" fill="url(#${id}metal)" stroke="${d.q.rim}" stroke-width="5"/><rect x="61" y="139" width="134" height="38" rx="10" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="3"/><circle cx="128" cy="103" r="12" fill="url(#${id}accent)" filter="url(#${id}glow)"/>${leaf(id,92,133,.7,-20)}${leaf(id,156,133,.7,20)}</g>`;
    case'mask':return `<g><path d="M62 74 C87 49 169 49 194 74 L182 165 C162 192 95 192 74 165Z" fill="url(#${id}metal)" stroke="${d.q.rim}" stroke-width="4"/><path d="M85 111 L117 102 L109 127 L85 130Z M171 111 L139 102 L147 127 L171 130Z" fill="#071009" stroke="${d.c.accent}" stroke-width="3"/><path d="M128 126 L116 155 L140 155Z" fill="${d.c.metal2}"/>${leaf(id,126,76,.75,0)}</g>`;
    case'hood':return `<g><path d="M128 45 C76 47 54 86 61 145 C71 182 93 202 128 210 C164 202 185 180 195 145 C202 87 180 48 128 45Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="4"/><path d="M128 72 C95 72 79 99 84 139 C91 164 106 176 128 180 C150 176 165 164 172 139 C177 99 161 72 128 72Z" fill="#09100c"/><path d="M103 133 Q128 148 153 133" fill="none" stroke="${d.c.accent}" stroke-width="4" opacity=".65"/>${leaf(id,126,71,.8,0)}</g>`;
    default:return `<g><path d="M55 126 C60 74 91 48 128 48 C165 48 196 74 201 126 L186 176 L70 176Z" fill="url(#${id}metal)" stroke="${d.q.rim}" stroke-width="4"/><path d="M80 118 H176 V148 H80Z" fill="#071009" opacity=".9"/><path d="M128 55 V174" stroke="${d.c.accent}" stroke-width="5" opacity=".65"/>${leaf(id,128,84,.7,0)}</g>`;
  }}
  function artBody(kind,d){const {id}=d;if(kind==='robe'||kind==='hoodie')return `<g><path d="M85 48 L112 67 H144 L171 48 L207 83 L184 117 L170 104 L178 211 H78 L86 104 L72 117 L49 83Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="4"/><path d="M111 67 L128 96 L145 67" fill="none" stroke="${d.c.accent}" stroke-width="6"/><path d="M96 134 H160" stroke="${d.c.metal}" stroke-width="6" opacity=".7"/>${leaf(id,128,126,1.05,0)}</g>`;return `<g><path d="M82 54 L108 68 H148 L174 54 L211 92 L184 124 L169 110 L175 205 H81 L87 110 L72 124 L45 92Z" fill="url(#${id}metal)" stroke="${d.q.rim}" stroke-width="4"/><path d="M104 69 L128 93 L152 69 L166 112 L152 171 H104 L90 112Z" fill="${d.c.metal2}" opacity=".85"/><path d="M128 82 V182" stroke="url(#${id}accent)" stroke-width="6"/>${leaf(id,127,130,1.1,0)}</g>`}
  function artBoots(d){const {id}=d;return `<g><path d="M64 65 H112 V151 C108 171 94 186 66 190 C51 185 45 175 48 161 L66 143Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="4"/><path d="M144 65 H192 V151 C188 171 174 186 146 190 C131 185 125 175 128 161 L146 143Z" fill="url(#${id}wood)" stroke="${d.q.rim}" stroke-width="4"/><path d="M70 88 H106 M150 88 H186 M70 112 H106 M150 112 H186" stroke="${d.c.metal}" stroke-width="5"/><path d="M51 164 C76 160 100 162 118 178 C101 195 67 203 46 190Z M131 178 C149 162 173 160 198 164 L203 190 C182 203 148 195 131 178Z" fill="url(#${id}metal)"/>${leaf(id,88,132,.65,-25)}${leaf(id,168,132,.65,-25)}</g>`}
  function svg(it){
    if(!it||!GEAR_SLOTS.has(it.slot))return'';
    const d=frameDefs(it),kind=kindOf(it),h=hash(plainName(it)),spark=h%3;
    let art='';if(it.slot==='weapon')art=artWeapon(kind,d);else if(it.slot==='head')art=artHead(kind,d);else if(it.slot==='body')art=artBody(kind,d);else art=artBoots(d);
    const specks=Array.from({length:6+spark},(_,i)=>{const x=28+((h>>(i%16))%198),y=26+((h>>(i%13+3))%200),r=1+(i%3);return `<circle cx="${x}" cy="${y}" r="${r}" fill="${d.q.rim}" opacity="${.18+(i%3)*.08}"/>`}).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${esc(plainName(it))}">${d.defs}<rect x="7" y="7" width="242" height="242" rx="33" fill="url(#${d.id}bg)"/><rect x="12" y="12" width="232" height="232" rx="29" fill="none" stroke="${d.q.rim}" stroke-opacity=".24" stroke-width="2"/>${specks}<g filter="url(#${d.id}glow)">${art}</g></svg>`;
  }
  function uri(it){const s=svg(it);return s?'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s):''}
  function imageEl(it,cls='v465-item-art'){
    const u=uri(it);if(!u)return null;const img=document.createElement('img');img.className=cls;img.src=u;img.alt=plainName(it);img.loading='lazy';img.decoding='async';return img;
  }
  window.v465ItemArtUri=uri;window.v465ItemArtSvg=svg;

  function replaceBox(box,it){
    if(!box||!it||!GEAR_SLOTS.has(it.slot))return false;
    const img=imageEl(it);if(!img)return false;box.replaceChildren(img);box.dataset.v465Art='1';return true;
  }
  function decorateShop(){
    const groups=[['#v057WeaponGrid .shop-item',s?.weaponShop||[]],['#v057MagicGrid .shop-item',s?.magicShop||[]]];
    groups.forEach(([sel,arr])=>document.querySelectorAll(sel).forEach((card,i)=>{const it=arr[i];if(!it||!GEAR_SLOTS.has(it.slot))return;replaceBox(card.querySelector('.shop-icon,.v41-shop-icon'),it)}));
  }
  function decorateInventory(){
    document.querySelectorAll('#character #inventory .inventory-grid > .inv-item').forEach((card,i)=>{
      const it=s?.inventory?.[i];if(!it||!GEAR_SLOTS.has(it.slot))return;
      const box=card.querySelector('.v459-inv-icon');if(box)replaceBox(box,it);
    });
  }
  function decorateEquipment(){
    ['weapon','head','body','boots'].forEach(slot=>{const it=s?.equipment?.[slot];if(!it)return;replaceBox(document.querySelector('#slot-'+slot+' .slot-icon'),it)});
  }
  function decorateSheet(index){
    const it=s?.inventory?.[Number(index)];if(!it||!GEAR_SLOTS.has(it.slot))return;
    replaceBox(document.querySelector('#v459InventorySheet .v459-sheet-icon'),it);
  }
  function decorateAll(){decorateShop();decorateInventory();decorateEquipment();}

  /* V4.68: V4.65 is generator-only. The V4.66 canonical renderer below owns every visible item.
     This prevents old delayed V4.65 timers/wrappers from repainting cards with another appearance. */
  decorateShop=function(){};
  decorateInventory=function(){};
  decorateEquipment=function(){};
  decorateSheet=function(){};
  decorateAll=function(){};

  /* Shop cleanup Phase 1: V4.65 remains generator-only.
     Its visible decorators are intentionally disabled above; the old render/shop/inventory
     wrappers and delayed version-stamp passes were dead runtime work and are retired. */
})();
