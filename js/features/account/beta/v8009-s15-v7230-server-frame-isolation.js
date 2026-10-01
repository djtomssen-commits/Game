(()=>{
'use strict';
if(window.__V7230_SERVER_FRAME_ISOLATION__)return;
window.__V7230_SERVER_FRAME_ISOLATION__=true;
const serverId=()=>String(window.v343CurrentServer||localStorage.getItem('growLegends:selectedServer')||localStorage.getItem('growLegends:server')||'beta');
const isServer1=()=>serverId()==='server1';
function stripVisibleFrame(){
  try{
    document.querySelectorAll('#world .v366-avatar.v7137-frame-target,#character .avatar-scene.v7137-frame-target,#v072OwnProfile .v646-own-avatar.v7137-frame-target').forEach(el=>{
      el.querySelectorAll(':scope > .v7139-frame-art').forEach(n=>n.remove());
      delete el.dataset.v7137Frame;
    });
  }catch(_){}
}
function arm(){
  if(!isServer1())return;
  document.documentElement.classList.add('v7230-frame-server-sync');
  try{window.__V7137_FRAME_STATE__=null}catch(_){}
  stripVisibleFrame();
}
let flight=null;
async function sync(){
  if(!isServer1())return false;
  arm();
  if(flight)return flight;
  flight=(async()=>{
    try{
      const r=await window.v7137FrameRefresh?.();
      const st=(r&&typeof r==='object')?r:window.__V7137_FRAME_STATE__;
      if(!st?.ok){stripVisibleFrame();return false}
      if(!st.active_frame_id)stripVisibleFrame();
      else try{window.v7137ApplyOwnFrames?.()}catch(_){}
      return true;
    }catch(e){
      stripVisibleFrame();
      console.warn('[V7.230] server frame sync',e);
      return false;
    }finally{
      document.documentElement.classList.remove('v7230-frame-server-sync');
      flight=null;
    }
  })();
  return flight;
}
arm();
window.addEventListener('growlegends:account-ready',()=>{if(isServer1())void sync()},{passive:true});
window.addEventListener('growlegends:first-playable',()=>{if(isServer1())void sync()},{passive:true});
window.addEventListener('pageshow',()=>{if(isServer1())setTimeout(()=>void sync(),120)},{passive:true});
document.addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest?.('[data-v343-server]'):null;if(!b)return;if(String(b.dataset.v343Server||'')==='server1')setTimeout(arm,0)},true);
[0,250,900,2200].forEach(ms=>setTimeout(()=>{if(isServer1())void sync()},ms));
window.v7230FrameDiagnostics=()=>({server:serverId(),syncing:!!flight,state:window.__V7137_FRAME_STATE__||null,guard:document.documentElement.classList.contains('v7230-frame-server-sync')});
})();
