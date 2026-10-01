(()=>{
 const syncToggle=()=>{const root=document.querySelector('.v492-grow'),btn=document.querySelector('[data-v493-seeds]');if(!root||!btn)return;btn.textContent=root.classList.contains('v493-seeds-open')?'🌰 Samenlager schließen':'🌰 Samenlager öffnen'};
 document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;const toggle=t.closest('[data-v493-seeds]');if(toggle){e.preventDefault();const root=document.querySelector('.v492-grow');if(root){root.classList.toggle('v493-seeds-open');syncToggle()}return}
   const seed=t.closest('[data-v492-seed]');if(seed&&!t.closest('[data-v492-buy]')&&window.matchMedia('(max-width:760px)').matches){setTimeout(()=>{const root=document.querySelector('.v492-grow');if(root){root.classList.remove('v493-seeds-open');syncToggle();document.querySelector('.v492-scene')?.scrollIntoView({block:'start',behavior:'smooth'})}},40)}
 },true);
 const keepVersion=()=>{try{const V=window.GROW_LEGENDS_VERSION||{short:'V7.111',label:'V7.111 Stable'};document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>{if(el)el.textContent=V.label});document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em').forEach(el=>{if(el)el.textContent=V.short})}catch(e){}};
 keepVersion();
 document.addEventListener('DOMContentLoaded',keepVersion,{once:true});
 window.addEventListener('pageshow',keepVersion,{passive:true});
 window.addEventListener('growlegends:account-ready',keepVersion,{passive:true});
})();
