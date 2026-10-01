(()=>{
'use strict';
if(window.__V7093_UX_PARITY__)return;
window.__V7093_UX_PARITY__=true;
const VERSION='V7.096';
const CAP=6;
const clone=x=>{try{return structuredClone(x)}catch(_){try{return JSON.parse(JSON.stringify(x))}catch(__){return x}}};

function normalizeTowerCapLocal(){
 try{
  const r=window.s?.tower?.run;
  if(!r||!Array.isArray(r.buffs)||r.buffs.length<CAP)return false;
  if(r.mode==='mutation'){
   r.mutationChoices=[];
   r.geneticsComplete=true;
   r.pendingMutationAfterCheckpoint=false;
   r.mode='route';
   try{if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
   return true;
  }
 }catch(_){}
 return false;
}

/* The pre-authority V6.349 client already treated 6/6 as genetics complete.
   Keep exactly that visible behavior. The DB trigger v7093_tower_run_invariant_guard
   enforces the same invariant server-side. */
try{
 const base=window.vTowerRender;
 if(typeof base==='function'&&!base.__v7093Parity){
  const w=function(){normalizeTowerCapLocal();return base.apply(this,arguments)};
  w.__v7093Parity=true;w.__v7093Base=base;window.vTowerRender=w;
 }
}catch(_){}

/* Immediate tactile feedback. This does not mint state locally; the server stays
   authoritative. It only removes the dead-click feeling that the old client never had. */
document.addEventListener('pointerdown',e=>{
 try{
  const b=e.target?.closest?.('button,[role="button"]');
  if(!b)return;
  const authority=b.matches?.('[data-v7051-server-fight],[data-vt-start],[data-vt-recover],[data-vt-route],[data-vt-fight],[data-vt-mut],[data-vt-reroll],[data-vt-next],[data-vt-bank],[data-vt-continue],[data-vt-grow],[data-vt-lab],[data-vt-buy],[data-vt-shop-leave],[data-vt-event-next],[data-vt-secret],[data-vt-up],[data-v492-buy],[data-v492-plant],[data-v492-care],[data-v492-harvest],[data-v492-activate],[data-v492-week],[data-v492-upgrade],[data-v492-room]');
  if(!authority)return;
  b.dataset.v7093Pending='1';
  setTimeout(()=>{try{delete b.dataset.v7093Pending}catch(_){}},700);
 }catch(_){}
},{capture:true,passive:true});

/* If a stale server snapshot ever reaches 6/6 + mutation, surface it to telemetry
   and heal the local view immediately instead of presenting unusable choices. */
const capTimer=setInterval(()=>{
 try{
  const r=window.s?.tower?.run;
  if(r?.mode==='mutation'&&Array.isArray(r.buffs)&&r.buffs.length>=CAP){
   window.__GL_RUNTIME_WATCHDOG__?.report?.('tower_mutation_cap_state','error',{floor:Number(r.floor)||0,buffs:r.buffs.length},{screen:'tower',incidentKey:`floor:${Number(r.floor)||0}`});
   if(normalizeTowerCapLocal())window.vTowerRender?.();
  }
 }catch(_){}
},5000);

window.v7093UxParityDiagnostics=()=>{
 const r=window.s?.tower?.run||null;
 return{version:VERSION,authorityKept:true,baseline:'V6.349',tower:{active:!!r?.active,floor:Number(r?.floor)||0,mode:String(r?.mode||''),buffs:Array.isArray(r?.buffs)?r.buffs.length:0,cap:CAP},watchdog:window.__GL_RUNTIME_WATCHDOG__?.diagnostics?.()||null};
};
window.addEventListener('pagehide',()=>clearInterval(capTimer),{once:true});
})();
