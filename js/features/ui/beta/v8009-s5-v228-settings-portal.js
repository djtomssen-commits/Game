/* ===== V4.02 true top-layer settings dropdown ===== */

function v228PortalSettingsMenu(){
  const menu=document.querySelector('#v141SettingsMenu');
  if(!menu)return null;

  /*
    Move the dropdown OUT of #v141SettingsWrap/header.
    This breaks the header stacking-context restriction.
  */
  if(menu.parentElement!==document.body){
    document.body.appendChild(menu);
  }

  return menu;
}


function v228PositionSettings(){
  const menu=v228PortalSettingsMenu();
  const btn=document.querySelector('#v141SettingsBtn');

  if(!menu || !btn || !menu.classList.contains('open'))return;

  const margin=8;
  const br=btn.getBoundingClientRect();

  /*
    First place it directly below the Settings button.
  */
  let top=br.bottom+8;

  if(window.innerWidth<=700){
    const width=Math.min(330,window.innerWidth-margin*2);

    menu.style.width=width+'px';
    menu.style.maxWidth=width+'px';
    menu.style.left='auto';
    menu.style.right=margin+'px';
    menu.style.bottom='auto';
    menu.style.maxHeight='none';
    menu.style.height='auto';
    menu.style.overflow='visible';
    menu.style.overflowY='visible';
    menu.style.top=top+'px';

    /*
      Measure the COMPLETE dropdown and move the WHOLE thing upward
      if it would leave the viewport. No inner scrolling.
    */
    requestAnimationFrame(()=>{
      const rect=menu.getBoundingClientRect();

      if(rect.bottom>window.innerHeight-margin){
        const overflow=rect.bottom-(window.innerHeight-margin);
        top=Math.max(margin,top-overflow);
        menu.style.top=top+'px';
      }

      /*
        If the complete menu is taller than the viewport, scale only its
        vertical spacing slightly rather than introducing a scroll pane.
      */
      const finalRect=menu.getBoundingClientRect();
      if(finalRect.height>window.innerHeight-margin*2){
        menu.classList.add('v228-ultra-compact');
        menu.style.top=margin+'px';
      }else{
        menu.classList.remove('v228-ultra-compact');
      }
    });

    return;
  }

  /* Desktop: anchor to the settings button and keep within viewport. */
  const width=Math.min(330,window.innerWidth-margin*2);
  let left=br.right-width;
  left=Math.max(margin,Math.min(left,window.innerWidth-width-margin));

  menu.style.width=width+'px';
  menu.style.left=left+'px';
  menu.style.right='auto';
  menu.style.top=top+'px';
  menu.style.bottom='auto';
  menu.style.maxHeight='none';
  menu.style.overflow='visible';
}


/*
  Extra compact fallback for exceptionally short mobile viewports.
  Still shows the full menu at once.
*/
const v228CompactStyle=document.createElement('style');
v228CompactStyle.id='v228-settings-ultra-compact-style';
v228CompactStyle.textContent=`
  body > #v141SettingsMenu.v228-ultra-compact .v141-settings-head{
    padding:6px 9px!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact .v141-setting-row{
    padding:5px 9px!important;
    min-height:36px!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact .v141-setting-copy span{
    display:none!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact .v141-account-box{
    margin:5px 8px!important;
    padding:5px 8px!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact .v141-settings-actions{
    margin:5px 8px!important;
    gap:5px!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact #v141Logout,
  body > #v141SettingsMenu.v228-ultra-compact #v141Delete{
    min-height:34px!important;
    padding:5px!important;
  }
  body > #v141SettingsMenu.v228-ultra-compact .v141-version-line{
    padding:3px 8px 5px!important;
  }
`;
document.head.appendChild(v228CompactStyle);


function v228BindSettings(){
  const btn=document.querySelector('#v141SettingsBtn');
  if(!btn || btn.dataset.v228Bound==='1')return;

  btn.dataset.v228Bound='1';

  /*
    Existing v141 onclick still toggles .open.
    This second listener only portals/positions AFTER that toggle.
  */
  btn.addEventListener('click',()=>{
    requestAnimationFrame(()=>{
      try{v225EnsureSettingsAccountActions()}catch(e){}
      v228PortalSettingsMenu();
      v228PositionSettings();
    });
  });
}


const v228BaseBuildSettings=v141BuildSettings;
v141BuildSettings=function(){
  const r=v228BaseBuildSettings();

  try{v225EnsureSettingsAccountActions()}catch(e){}

  v228PortalSettingsMenu();
  v228BindSettings();

  requestAnimationFrame(v228PositionSettings);

  return r;
};


/*
  Keep dropdown correctly anchored if orientation/viewport changes.
*/
window.addEventListener('resize',()=>{
  requestAnimationFrame(v228PositionSettings);
},{passive:true});


/*
  On page scroll the menu remains attached visually to the button.
*/
window.addEventListener('scroll',()=>{
  const menu=document.querySelector('#v141SettingsMenu');
  if(menu?.classList.contains('open')){
    requestAnimationFrame(v228PositionSettings);
  }
},{passive:true});


setTimeout(()=>{
  try{
    v141BuildSettings();
    v225EnsureSettingsAccountActions();
    v228PortalSettingsMenu();
    v228BindSettings();
  }catch(e){
    console.warn('V4.02 settings portal',e);
  }
},220);


setTimeout(()=>{
  document.querySelectorAll('.version')
    .forEach(el=>el.textContent='V4.29 Stable');
},300);
