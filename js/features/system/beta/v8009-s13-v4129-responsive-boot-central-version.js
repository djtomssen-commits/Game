(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 function applyVersion(){
  try{if(document.title!=='Grow Legends '+V.short)document.title='Grow Legends '+V.short}catch(e){}
  try{
   document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version')
    .forEach(el=>{if(el&&el.textContent!==V.label)el.textContent=V.label});
   document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em,.v4107-version')
    .forEach(el=>{if(el&&el.textContent!==V.short)el.textContent=V.short});
  }catch(e){}
 }
 window.v4129ApplyVersion=applyVersion;
 function uidOf(user){try{const u=user||(typeof v073User!=='undefined'?v073User:null);return u&&u.id&&!u.is_anonymous?String(u.id):''}catch(e){return''}}
 function stateOwned(uid){if(!uid)return false;try{const owner=String(s?.__accountOwnerId||''),social=String(s?.social?.playerId||'');return owner===uid&&(!social||social===uid)}catch(e){return false}}
 function verified(uid){try{return !!(uid&&typeof window.v452AccountVerified==='function'&&window.v452AccountVerified(uid))}catch(e){return false}}
 function stablePower(){try{const fn=window.v4125StableCombatPower,n=typeof fn==='function'?Number(fn()):Number(typeof combatPower==='function'?combatPower():0);return Math.max(0,Math.round(Number.isFinite(n)?n:0))}catch(e){return 0}}
 function paintPower(cp){const value=String(Math.max(0,Math.round(Number(cp)||0)));try{['#power','#charPower','#v358Power','#v110Cp'].forEach(sel=>{const el=document.querySelector(sel);if(el&&el.textContent!==value)el.textContent=value});document.querySelectorAll('.v349-power b,.v366-power b,.v251-detail-bottom .v251-mini-stat:first-child b').forEach(el=>{if(el.textContent!==value)el.textContent=value})}catch(e){}}
 function releaseOwnedPreview(explicitUid=''){
  const uid=String(explicitUid||uidOf()||'');let safe=false;
  if(uid)safe=verified(uid)||stateOwned(uid);else{try{safe=window.__V200_AUTH_READY__===true&&!(typeof v073User!=='undefined'&&v073User&&!v073User.is_anonymous)}catch(e){safe=false}}
  if(!safe)return false;
  try{window.__V483_POWER_READY__=true;document.documentElement.classList.add('v483-power-ready')}catch(e){}
  paintPower(stablePower());return true;
 }
 window.v4129ReleaseOwnedPower=releaseOwnedPreview;
 try{
  if(typeof v200FinalizeUser==='function'&&!window.__v4129FinalizePower){
   const base=v200FinalizeUser;const wrapped=function(user){const uid=uidOf(user);try{releaseOwnedPreview(uid)}catch(e){}const r=base.apply(this,arguments);if(r&&typeof r.then==='function')return r.finally(()=>{try{releaseOwnedPreview(uid);applyVersion()}catch(e){}});try{releaseOwnedPreview(uid);applyVersion()}catch(e){}return r};
   wrapped.__v4129FastPower=true;v200FinalizeUser=wrapped;try{window.v200FinalizeUser=wrapped}catch(e){}window.__v4129FinalizePower=true;
  }
 }catch(e){}
 function kick(){applyVersion();releaseOwnedPreview()}
 kick();
 document.addEventListener('DOMContentLoaded',kick,{once:true});
 window.addEventListener('pageshow',kick,{passive:true});
 window.addEventListener('growlegends:account-ready',kick,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()},{passive:true});
 /* V8.009: delayed settle passes retired; account/finalizer lifecycle owns power release. */
 window.v4129Diagnostics=()=>({version:V.short,powerReady:window.__V483_POWER_READY__===true,uid:uidOf(),stateOwned:stateOwned(uidOf()),verified:verified(uidOf()),power:stablePower(),autoQaDisabled:true});
})();
