/* ===== V4.02 Admin menu/login repair =====
   Admin status is account-specific and must be rechecked after auth/cloud boot.
   Do not let an early "no user yet" check permanently remove the menu entry.
*/
let v273AdminCheckUserId='';

function v273RemoveAdminMenu(){
  const panel=document.querySelector('#v032MenuPanel');
  if(!panel)return;
  const btn=panel.querySelector('[data-screen="admin"]');
  if(btn){
    const sep=btn.previousElementSibling;
    btn.remove();
    if(sep?.classList?.contains('v086-menu-separator'))sep.remove();
  }
}

function v273EnsureAdminMenu(){
  const panel=document.querySelector('#v032MenuPanel');
  if(!panel||!v093IsAdmin)return false;

  let btn=panel.querySelector('[data-screen="admin"]');
  if(!btn){
    const sep=document.createElement('div');
    sep.className='v086-menu-separator';
    sep.dataset.v273AdminSep='1';

    btn=document.createElement('button');
    btn.className='top-menu-item';
    btn.dataset.screen='admin';
    btn.innerHTML='<span>🛡️</span>Admin';
    panel.append(sep,btn);
  }

  btn.onclick=async()=>{
    v032Go('admin');
    const ok=await v093CheckAdmin();
    if(ok)await v093AdminLoadLists();
  };
  return true;
}

/* Replace menu builder with a deterministic version. */
v093BuildMenu=function(){
  if(v093IsAdmin)v273EnsureAdminMenu();
  else v273RemoveAdminMenu();
};

/* Keep the complete existing V4.02/V4.02 admin-check chain,
   but make its result account-aware and repaint the dropdown afterwards. */
const v273BaseAdminCheck=v093CheckAdmin;
v093CheckAdmin=async function(){
  const uid=String(v073User?.id||'');
  if(!uid){
    v093IsAdmin=false;
    v273AdminCheckUserId='';
    v273RemoveAdminMenu();
    return false;
  }

  const ok=await v273BaseAdminCheck();
  v273AdminCheckUserId=uid;

  if(ok)v273EnsureAdminMenu();
  else v273RemoveAdminMenu();

  return !!ok;
};

/* V4.159: post-login admin hydration is owned by the central boot controller. */

/* Menu panels can be rebuilt by older navigation code; repair on opening menu. */
const v273MenuToggle=document.querySelector('#v032MenuToggle');
if(v273MenuToggle){
  v273MenuToggle.addEventListener('click',()=>{
    requestAnimationFrame(()=>{
      if(v093IsAdmin)v273EnsureAdminMenu();
    });
  });
}

/* Existing restored session: one account-aware retry after boot. */
setTimeout(async()=>{
  try{
    const uid=String(v073User?.id||'');
    if(uid && uid!==v273AdminCheckUserId){
      await v093CheckAdmin();
      if(v093IsAdmin)await v093AdminLoadLists();
    }else if(v093IsAdmin){
      v273EnsureAdminMenu();
    }
  }catch(e){
    console.error('V4.02 admin boot repair',e);
  }
},1900);

/* Final render only preserves a confirmed admin menu; no database call per render. */
const v273BaseRender=render;
render=function(){
  const r=v273BaseRender();
  if(v093IsAdmin)v273EnsureAdminMenu();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};
