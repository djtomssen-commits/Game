
(()=>{
 'use strict';
 if(window.__V6299_CLASS_IMAGE_SIZE__)return;
 window.__V6299_CLASS_IMAGE_SIZE__=true;
 window.v6299ClassImageDiagnostics=()=>({
   version:'V6.299',
   cards:[...document.querySelectorAll('#v200CharacterModal .v200-class')].map(c=>({
     classId:c.dataset.v200Class||c.dataset.v4135Class||c.dataset.v4136Class||'',
     fit:c.querySelector('img')?getComputedStyle(c.querySelector('img')).objectFit:'',
     position:c.querySelector('img')?getComputedStyle(c.querySelector('img')).objectPosition:''
   }))
 });
})();
