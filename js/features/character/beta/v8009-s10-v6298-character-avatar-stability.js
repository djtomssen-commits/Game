(()=>{
'use strict';
if(window.__V6298_CHARACTER_AVATAR_STABILITY__)return;
window.__V6298_CHARACTER_AVATAR_STABILITY__=true;

const state=()=>{try{return typeof s!=='undefined'?s:window.s||null}catch(_){return window.s||null}};

function expectedAvatar(){
 const st=state();
 const cls=String(st?.playerClass||'');
 if(!cls)return '';
 try{
   const fn=window.v080AvatarFor || (typeof v080AvatarFor==='function'?v080AvatarFor:null);
   return typeof fn==='function' ? String(fn(cls)||'') : '';
 }catch(_){return ''}
}

function syncCharacterAvatar(reason='sync'){
 const page=document.getElementById('character');
 if(!page)return false;

 const expected=expectedAvatar();
 if(!expected)return false;

 const scene=page.querySelector('.avatar-scene');
 if(!scene)return false;

 let img=scene.querySelector('.v080-class-avatar-img');
 const cls=String(state()?.playerClass||'');
 const alt=(typeof classes!=='undefined'&&classes?.[cls]?.name)||'Grow Legends Charakter';

 if(!img){
   scene.innerHTML=`<div class="v41-portrait"><img class="v080-class-avatar-img" alt="${alt}"></div>`;
   img=scene.querySelector('.v080-class-avatar-img');
 }

 const current=String(img.getAttribute('src')||'');
 if(current!==expected){
   img.src=expected;
 }
 img.alt=alt;
 img.loading='eager';
 img.decoding='sync';
 try{img.fetchPriority='high'}catch(_){}
 img.style.setProperty('display','block','important');
 img.style.setProperty('visibility','visible','important');
 img.style.setProperty('opacity','1','important');

 page.dataset.v6298AvatarClass=cls;
 page.dataset.v6298AvatarReason=reason;
 return current!==expected;
}
window.v6298SyncCharacterAvatar=syncCharacterAvatar;

/* Put the live avatar repair AFTER the entire historical render stack.
   The V4.159 Frost layer queues its repaint during render(); this queue entry is
   added afterwards, so it is the final word without a MutationObserver. */
try{
 if(typeof render==='function'&&!window.__v6298RenderWrapped){
   const base=render;
   const wrapped=function(){
     const r=base.apply(this,arguments);
     requestAnimationFrame(()=>syncCharacterAvatar('render'));
     return r;
   };
   try{render=wrapped}catch(_){}
   window.render=wrapped;
   window.__v6298RenderWrapped=true;
 }
}catch(e){console.warn('V6.298 render avatar hook',e)}

/* Gear actions are the user-visible trigger that exposed the stale V4.159
   snapshot. Schedule one extra final repaint after those actions. */
for(const name of ['equip','unequip','sellEquipped']){
 try{
   const fn=window[name];
   if(typeof fn!=='function'||fn.__v6298AvatarWrapped)continue;
   const wrapped=function(){
     const r=fn.apply(this,arguments);
     requestAnimationFrame(()=>syncCharacterAvatar(name));
     return r;
   };
   wrapped.__v6298AvatarWrapped=true;
   window[name]=wrapped;
   try{
     if(name==='equip')equip=wrapped;
     if(name==='unequip')unequip=wrapped;
     if(name==='sellEquipped')sellEquipped=wrapped;
   }catch(_){}
 }catch(e){console.warn('V6.298 gear avatar hook',name,e)}
}

/* Character page navigation and account load. */
document.addEventListener('click',e=>{
 const hit=e.target instanceof Element
   ? e.target.closest('[data-screen="character"],[data-go="character"],[data-v085-go="character"]')
   : null;
 if(hit)setTimeout(()=>syncCharacterAvatar('open-character'),40);
},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>syncCharacterAvatar('account-ready'),100));
window.addEventListener('pageshow',()=>setTimeout(()=>syncCharacterAvatar('pageshow'),80),{passive:true});

window.addEventListener('growlegends:foreground-ready',()=>syncCharacterAvatar('foreground'),{passive:true});

window.v6298AvatarDiagnostics=()=>({
 version:'V6.298',
 classId:String(state()?.playerClass||''),
 expected:expectedAvatar().slice(0,40),
 actual:String(document.querySelector('#character .v080-class-avatar-img')?.getAttribute('src')||'').slice(0,40),
 matches:String(document.querySelector('#character .v080-class-avatar-img')?.getAttribute('src')||'')===expectedAvatar(),
 lastReason:document.getElementById('character')?.dataset.v6298AvatarReason||''
});
})();
