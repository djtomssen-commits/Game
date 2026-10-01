(()=>{
 'use strict';
 const VERSION='V4.106 Stable',SHORT='V4.106';
 const ASSETS={"body":"assets/v7198-base64/e0373e53cc3dee7f05c3.webp","head":"assets/v7198-base64/1254005511b7b225536d.webp","amulet":"assets/v7198-base64/bd761be96f6c00d8f19d.webp","gem":"assets/v7198-base64/d9f42bb5aaf25b749a85.webp","scroll":"assets/v7198-base64/4b5467d60370b635b16f.webp","set":"assets/v7198-base64/74ee1739cf274cc30fed.webp","weapon_sickle":"assets/v7198-base64/ab5ad3d53d3020654496.webp","weapon_sword":"assets/v7198-base64/9bb79de392d3ca8b259e.webp","weapon_blade":"assets/v7198-base64/d5bd7e8e142a30c6b3a6.webp","weapon_staff":"assets/v7198-base64/c854168d05b963d69239.webp","weapon_glove":"assets/v7198-base64/e7284d34f2e8a8b9f863.webp","weapon_prismatic":"assets/v7198-base64/d0fc60117faa3fcf3bc4.webp","weapon_cyan":"assets/v7198-base64/76831131c17d802c01e5.webp"};
 const oldUri=typeof window.v466ItemArtUri==='function'?window.v466ItemArtUri:null;
 function text(it){return String(it?.name||'').toLowerCase()}
 function isPrism(it){return !!(it?.v488Prismatic||String(it?.quality||'').toLowerCase()==='prismatic'||/prism/.test(String(it?.rarity||'')))}
 function q(it){if(isPrism(it))return'prismatic';const x=String(it?.quality||it?.rarity||'').toLowerCase();if(/cyan|myst/.test(x))return'cyan';if(/orange|legend/.test(x))return'orange';if(/purple|epic/.test(x))return'purple';if(/blue|rare/.test(x))return'blue';if(/green|uncommon/.test(x))return'green';return'gray'}
 function weaponKey(it){if(isPrism(it))return'weapon_prismatic';if(q(it)==='cyan')return'weapon_cyan';const n=text(it),ic=String(it?.icon||'');if(/handschuh|faust|klaue/.test(n)||ic==='🧤')return'weapon_glove';if(/stab|zepter|keule|hammer|kolben|bong/.test(n)||/[🪄🔮🔨]/u.test(ic))return'weapon_staff';if(/axt|sichel|schere|spalter/.test(n)||/[🪓✂️]/u.test(ic))return'weapon_sickle';if(/bogen|pfeil|klinge|dolch/.test(n)||ic==='🏹')return'weapon_blade';return'weapon_sword'}
 function uri(it){if(!it)return'';if(it.type==='gem')return ASSETS.gem;if(it.type==='scroll')return ASSETS.scroll;const slot=String(it.slot||'');if(slot==='weapon')return ASSETS[weaponKey(it)]||ASSETS.weapon_sword;if(slot==='head')return ASSETS.head;if(slot==='body')return ASSETS.body;if(slot==='ring')return oldUri?oldUri(it):ASSETS.amulet;if(slot==='amulet')return ASSETS.amulet;if(slot==='set'||it.type==='set')return ASSETS.set;/* Boots retain semantic procedural boot art rather than showing the wrong object. */return oldUri?oldUri(it):''}
 window.v4106ComicItemArtUri=uri;window.v4106ComicAssets=ASSETS;window.v466ItemArtUri=uri;
 function tag(){document.querySelectorAll('img.v466-item-art').forEach(img=>{try{if(Object.values(ASSETS).includes(img.src)||/\/assets\/v71(?:95|98)-base64\//.test(img.src)||img.src.startsWith('data:image/webp;base64,')){img.dataset.v4106Comic='1';img.classList.add('v4106-comic-art')}}catch(e){}})}
 function redecorate(){try{window.v4103DecorateItemSurfaces?.()}catch(e){}tag()}
 /* V6.97: body-wide comic-item observer retired; render hook remains. */
 try{if(typeof render==='function'&&!render.__v4106Items){const b=render;render=function(){const r=b.apply(this,arguments);requestAnimationFrame(redecorate);return r};render.__v4106Items=true;window.render=render}}catch(e){}
 document.addEventListener('DOMContentLoaded',redecorate,{once:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop')redecorate()},{passive:true});
 function stamp(){}
 stamp();window.addEventListener('pageshow',()=>{stamp();redecorate()},{passive:true});
})();
