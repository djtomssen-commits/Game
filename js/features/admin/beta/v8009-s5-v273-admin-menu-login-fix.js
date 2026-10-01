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

function v273SyncAdminMenu(ok=v093IsAdmin){
  const uid=String(v073User?.id||'');
  if(!uid){
    v093IsAdmin=false;
    v273AdminCheckUserId='';
    v273RemoveAdminMenu();
    return false;
  }
  v273AdminCheckUserId=uid;
  if(ok)v273EnsureAdminMenu();
  else v273RemoveAdminMenu();
  return !!ok;
}
window.v273SyncAdminMenu=v273SyncAdminMenu;

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

/* Account/admin hydration is owned by the central boot controller.
   Menu rebuilding only reuses already-confirmed admin state. */
window.addEventListener('growlegends:account-ready',()=>{
  if(v093IsAdmin)v273EnsureAdminMenu();
},{passive:true});
window.addEventListener('pageshow',()=>{
  if(v093IsAdmin)v273EnsureAdminMenu();
},{passive:true});
