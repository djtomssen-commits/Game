(()=>{
 'use strict';
 const VERSION='V4.117 Stable',SHORT='V4.117';
 const prev=typeof window.v4115ComicItemArtUri==='function'?window.v4115ComicItemArtUri:(typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri:null);
 const cache=new Map();
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const cls=(it)=>{
   const cid=String(it?.classId||it?.class||'').toLowerCase();
   if(cid==='grower')return'warrior';
   if(cid==='bruiser')return'mage';
   if(cid==='scout')return'scout';
   const b=it?.bonus||{};
   if(Number(b.intelligenz)>0||String(it?.stat||'').toLowerCase()==='intelligenz')return'mage';
   if(Number(b.geschick)>0||String(it?.stat||'').toLowerCase()==='geschick')return'scout';
   if(Number(b.staerke)>0||String(it?.stat||'').toLowerCase()==='staerke')return'warrior';
   return'generic';
 };
 const quality=(it)=>{
   const x=(String(it?.quality||'')+' '+String(it?.rarity||'')).toLowerCase();
   if(it?.v488Prismatic||/prism/.test(x))return'prismatic';
   if(/cyan|myst|myth/.test(x))return'cyan';
   if(/orange|legend/.test(x))return'orange';
   if(/purple|epic/.test(x))return'purple';
   if(/blue|rare/.test(x))return'blue';
   if(/green|uncommon/.test(x))return'green';
   return'gray';
 };
 const slotOf=it=>String(it?.slot||it?.type||'').toLowerCase();
 function hash(v){let h=2166136261;for(const ch of String(v||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0)}
 function palette(q,c){
   const rims={gray:['#b6beb9','#6d776f','#eff4f0'],green:['#79ea5d','#2e8f3d','#f1ffe8'],blue:['#59bbff','#275c9e','#e8f7ff'],purple:['#d07bff','#7e43b1','#fbeaff'],orange:['#ffae42','#b95f1f','#fff1da'],cyan:['#53f3ed','#148d86','#e8fffe'],prismatic:['#ff66d8','#7f70ff','#ffffff']};
   const p=rims[q]||rims.gray;
   const base={warrior:{main:'#cfd7df',dark:'#435160',trim:'#8add62',leather:'#8d603c',sub:'#ffe07a'},mage:{main:'#d8d7f5',dark:'#4b446d',trim:'#7c72ff',leather:'#66498a',sub:'#a9eeff'},scout:{main:'#ccd8bf',dark:'#445a42',trim:'#67df98',leather:'#7f6636',sub:'#ffe27d'},generic:{main:'#c7d0ca',dark:'#4e5a52',trim:'#7dd35d',leather:'#79573e',sub:'#d8f0a5'}}[c]||{main:'#c7d0ca',dark:'#4e5a52',trim:'#7dd35d',leather:'#79573e',sub:'#d8f0a5'};
   return {rim1:p[0],rim2:p[1],shine:p[2],...base};
 }
 function bootsSvg(it){
   const c=cls(it), q=quality(it), h=hash((it?.name||'')+'|'+c+'|'+q), id='v4117'+(h%1000000), p=palette(q,c), prismatic=q==='prismatic';
   const defs=`<defs>
     ${prismatic?`<linearGradient id="${id}rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6bd7"/><stop offset=".2" stop-color="#8f6cff"/><stop offset=".42" stop-color="#46bcff"/><stop offset=".64" stop-color="#63ea76"/><stop offset=".82" stop-color="#ffe467"/><stop offset="1" stop-color="#ff8a5f"/></linearGradient>`:`<linearGradient id="${id}rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.shine}"/><stop offset=".35" stop-color="${p.rim1}"/><stop offset="1" stop-color="${p.rim2}"/></linearGradient>`}
     <radialGradient id="${id}bg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${p.rim2}" stop-opacity=".28"/><stop offset=".6" stop-color="#132018" stop-opacity=".88"/><stop offset="1" stop-color="#060907"/></radialGradient>
     <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8fbfb"/><stop offset=".28" stop-color="${p.main}"/><stop offset=".7" stop-color="${p.dark}"/><stop offset="1" stop-color="#1d2421"/></linearGradient>
     <linearGradient id="${id}leather" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c08f58"/><stop offset=".38" stop-color="${p.leather}"/><stop offset="1" stop-color="#2d1f17"/></linearGradient>
     <linearGradient id="${id}accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffef3"/><stop offset=".22" stop-color="${p.sub}"/><stop offset=".62" stop-color="${p.trim}"/><stop offset="1" stop-color="${p.rim1}"/></linearGradient>
     <filter id="${id}g"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
     <filter id="${id}s"><feGaussianBlur stdDeviation="10"/></filter>
   </defs>`;
   let art='';
   if(c==='mage'){
     art=`<g>
       <path d="M78 56 V154 Q78 181 54 192 H114 Q126 192 126 175 V56 Z" fill="url(#${id}accent)" stroke="#2d2541" stroke-width="4"/>
       <path d="M178 56 V154 Q178 181 202 192 H142 Q130 192 130 175 V56 Z" fill="url(#${id}accent)" stroke="#2d2541" stroke-width="4"/>
       <path d="M91 72 H113 M143 72 H165 M90 95 H114 M142 95 H166" stroke="#ffffff88" stroke-width="4" stroke-linecap="round"/>
       <path d="M63 189 Q84 164 113 168 Q115 186 99 194 Z" fill="url(#${id}leather)" stroke="#241913" stroke-width="4"/>
       <path d="M193 189 Q172 164 143 168 Q141 186 157 194 Z" fill="url(#${id}leather)" stroke="#241913" stroke-width="4"/>
       <circle cx="102" cy="128" r="10" fill="url(#${id}accent)" filter="url(#${id}g)"/>
       <circle cx="154" cy="128" r="10" fill="url(#${id}accent)" filter="url(#${id}g)"/>
     </g>`;
   }else if(c==='scout'){
     art=`<g>
       <path d="M75 52 V148 Q75 173 56 191 H120 Q127 191 129 175 L132 52 Z" fill="url(#${id}leather)" stroke="#281c15" stroke-width="4"/>
       <path d="M181 52 V148 Q181 173 200 191 H136 Q129 191 127 175 L124 52 Z" fill="url(#${id}leather)" stroke="#281c15" stroke-width="4"/>
       <path d="M87 66 L116 66 M86 88 L116 88 M140 66 L169 66 M140 88 L170 88" stroke="${p.rim1}" stroke-width="5" stroke-linecap="round"/>
       <path d="M59 189 Q82 162 116 168 L119 191 Z" fill="url(#${id}accent)" stroke="#264123" stroke-width="4"/>
       <path d="M197 189 Q174 162 140 168 L137 191 Z" fill="url(#${id}accent)" stroke="#264123" stroke-width="4"/>
       <path d="M96 118 L118 102 L140 118 L160 102" fill="none" stroke="#f9ecb9" stroke-width="4" opacity=".75"/>
     </g>`;
   }else{
     art=`<g>
       <path d="M73 50 V149 Q73 176 50 191 H116 Q127 191 127 174 V50 Z" fill="url(#${id}metal)" stroke="#253038" stroke-width="4"/>
       <path d="M183 50 V149 Q183 176 206 191 H140 Q129 191 129 174 V50 Z" fill="url(#${id}metal)" stroke="#253038" stroke-width="4"/>
       <path d="M88 66 H112 M88 89 H112 M144 66 H168 M144 89 H168" stroke="#ffffff7a" stroke-width="4" stroke-linecap="round"/>
       <path d="M53 188 Q79 160 118 166 Q118 186 100 194 H71 Q58 194 53 188 Z" fill="url(#${id}accent)" stroke="#264123" stroke-width="4"/>
       <path d="M203 188 Q177 160 138 166 Q138 186 156 194 H185 Q198 194 203 188 Z" fill="url(#${id}accent)" stroke="#264123" stroke-width="4"/>
       <path d="M82 115 H118 M138 115 H174" stroke="${p.rim1}" stroke-width="6"/>
       <circle cx="102" cy="143" r="7" fill="${p.trim}"/><circle cx="154" cy="143" r="7" fill="${p.trim}"/>
     </g>`;
   }
   const extras = q==='cyan' ? `<circle cx="128" cy="128" r="92" fill="none" stroke="#72f8f3" stroke-dasharray="7 8" stroke-width="3" opacity=".78"/>` : (q==='orange' ? `<path d="M47 60 L60 44 L72 60 M184 60 L196 44 L209 60" fill="none" stroke="#ffd085" stroke-width="4"/>` : (q==='prismatic' ? `<path d="M205 47 L210 59 L222 64 L210 69 L205 81 L200 69 L188 64 L200 59 Z" fill="url(#${id}accent)"/><path d="M52 183 L56 193 L66 197 L56 201 L52 211 L48 201 L38 197 L48 193 Z" fill="url(#${id}accent)"/>` : ''));
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${esc(it?.name||'Stiefel')}">${defs}<rect x="8" y="8" width="240" height="240" rx="34" fill="url(#${id}bg)"/><circle cx="128" cy="128" r="88" fill="${p.rim2}" opacity=".12" filter="url(#${id}s)"/><rect x="13" y="13" width="230" height="230" rx="29" fill="none" stroke="url(#${id}rim)" stroke-width="8"/><rect x="24" y="24" width="208" height="208" rx="22" fill="none" stroke="#ffffff20" stroke-width="2"/>${art}${extras}</svg>`;
  }
 function bootsUri(it){
   if(!it) return '';
   const key=[it?.name||'',cls(it),quality(it),it?.slot||''].join('|');
   if(cache.has(key)) return cache.get(key);
   const out='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(bootsSvg(it));
   if(cache.size>200) cache.clear(); cache.set(key,out); return out;
 }
 function comic(it){
   const slot=slotOf(it);
   if(slot==='boots'||slot==='feet') return bootsUri(it);
   return prev?prev(it):'';
 }
 window.v4117BootArtUri=bootsUri;
 window.v4117ComicItemArtUri=comic;
 window.v4115ComicItemArtUri=comic;
 window.v466ItemArtUri=comic;
 window.v4106ComicItemArtUri=comic;
 window.v4111ComicItemArtUri=comic;
 function refresh(){
   if(!document.querySelector('#character.active,#shop.active,#forge.active,#harzForge.active,#v488Forge.active,#v074ProfileContent:not(:empty)'))return;
   try{window.v4103DecorateItemSurfaces?.()}catch(e){}
   try{window.v4108DecorateComicItems?.()}catch(e){}
   try{window.v4112RefreshAllItemArt?.()}catch(e){}
   try{window.v4111RefreshComicItems?.()}catch(e){}
   try{document.querySelectorAll('img.v466-item-art').forEach(img=>{ if(/boots|stiefel|schuh|feet/i.test(String(img.alt||''))) img.dataset.v4117Boots='1'; });}catch(e){}
 }
 function stamp(){}
 refresh();stamp();
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   const id=String(e?.detail?.id||'');
   if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge'){refresh();stamp()}
 },{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{refresh();stamp()},{once:true});
 window.addEventListener('pageshow',()=>{refresh();stamp()},{passive:true});
})();
