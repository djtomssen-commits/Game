(()=>{
  'use strict';
  if(window.__V6288_DELETE_FIX__)return;
  window.__V6288_DELETE_FIX__=true;

  function hardCloseSettings(){
    const menu=document.querySelector('#v141SettingsMenu');
    if(!menu)return;
    menu.classList.remove('open','v377-open');
    menu.setAttribute('aria-hidden','true');
  }

  function prepareDeleteOverlay(){
    const ov=document.querySelector('#v141DeleteOverlay');
    const input=document.querySelector('#v141DeleteInput');
    const confirm=document.querySelector('#v141DeleteConfirm');
    if(!ov)return;

    /* Keep the modal in the body top layer, outside header/dropdown stacking contexts. */
    if(ov.parentElement!==document.body)document.body.appendChild(ov);

    hardCloseSettings();
    document.body.classList.add('v6288-delete-open');

    ov.classList.add('show');
    ov.setAttribute('aria-hidden','false');

    if(input){
      input.disabled=false;
      input.readOnly=false;
      input.value='';
      input.setAttribute('inputmode','text');
      input.setAttribute('autocapitalize','characters');
      input.setAttribute('spellcheck','false');
    }
    if(confirm)confirm.disabled=true;

    requestAnimationFrame(()=>{
      try{input?.focus({preventScroll:true})}catch(_){input?.focus()}
      setTimeout(()=>{
        try{input?.focus({preventScroll:true})}catch(_){input?.focus()}
      },120);
    });
  }

  const oldOpen=typeof window.v141OpenDelete==='function'?window.v141OpenDelete:null;
  window.v141OpenDelete=function(){
    hardCloseSettings();
    try{oldOpen?.apply(this,arguments)}catch(e){console.warn('V6.288 delete open base',e)}
    prepareDeleteOverlay();
  };
  try{v141OpenDelete=window.v141OpenDelete}catch(_){}

  const oldClose=typeof window.v141CloseDelete==='function'?window.v141CloseDelete:null;
  window.v141CloseDelete=function(){
    try{oldClose?.apply(this,arguments)}catch(e){}
    document.body.classList.remove('v6288-delete-open');
    const ov=document.querySelector('#v141DeleteOverlay');
    ov?.classList.remove('show');
    ov?.setAttribute('aria-hidden','true');
  };
  try{v141CloseDelete=window.v141CloseDelete}catch(_){}

  /* Late capture guarantees that every Account-löschen button closes both
     historical settings-open classes before the modal opens. */
  document.addEventListener('click',e=>{
    const btn=e.target instanceof Element?e.target.closest('#v141Delete'):null;
    if(!btn)return;
    hardCloseSettings();
    setTimeout(()=>{
      const ov=document.querySelector('#v141DeleteOverlay');
      if(!ov?.classList.contains('show'))window.v141OpenDelete();
      else prepareDeleteOverlay();
    },0);
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.body.classList.contains('v6288-delete-open')){
      window.v141CloseDelete();
    }
  });

  /* If an old build left the settings dropdown open while the delete modal is
     already visible, repair it immediately. */
  const repair=()=>{
    const ov=document.querySelector('#v141DeleteOverlay');
    if(ov?.classList.contains('show')){
      hardCloseSettings();
      document.body.classList.add('v6288-delete-open');
    }
  };
  const v7291DeleteOverlay=document.getElementById('v141DeleteOverlay');if(v7291DeleteOverlay)new MutationObserver(repair).observe(v7291DeleteOverlay,{attributes:true,attributeFilter:['class']});
  setTimeout(repair,50);

  window.v6288DeleteDiagnostics=()=>({
    version:'V6.288',
    settingsOpen:!!document.querySelector('#v141SettingsMenu.open,#v141SettingsMenu.v377-open'),
    deleteVisible:!!document.querySelector('#v141DeleteOverlay.show'),
    inputEnabled:!document.querySelector('#v141DeleteInput')?.disabled,
    bodyLock:document.body.classList.contains('v6288-delete-open')
  });
})();
