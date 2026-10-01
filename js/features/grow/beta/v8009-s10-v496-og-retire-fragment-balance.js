(()=>{
 'use strict';
 const VERSION='V4.99 Stable',SHORT='V4.99',EPIC=['nebula','lemon','gorilla','greencrack','amnesia'];
 function stamp(){}
 function save(){try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}try{if(typeof v075WriteCloudSave==='function')setTimeout(()=>v075WriteCloudSave(false),0)}catch(e){}}
 function giveEpic(n){
  n=Math.max(0,Math.floor(Number(n)||0));if(!n)return[];
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.seeds=(s.grow.seeds&&typeof s.grow.seeds==='object')?s.grow.seeds:{};
  const got=[];for(let i=0;i<n;i++){const id=EPIC[Math.floor(Math.random()*EPIC.length)];s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;got.push(id)}return got;
 }
 function retireLegacyOg(showToast=true){
  try{
   s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};s.grow.v496=(s.grow.v496&&typeof s.grow.v496==='object')?s.grow.v496:{};
   const old=(s.v077&&typeof s.v077==='object')?s.v077:null;
   const seeds=Math.max(0,Math.floor(Number(old?.seeds)||0)),planted=old?.planted?1:0,total=seeds+planted;
   if(total>0){giveEpic(total);s.grow.v496.ogConverted=(Number(s.grow.v496.ogConverted)||0)+total}
   if(old){old.seeds=0;old.lastPlantAt=0;old.planted=null;old.buff=null;old.removed=true}else s.v077={seeds:0,lastPlantAt:0,planted:null,buff:null,removed:true};
   document.querySelector('#v077SeedPanel')?.remove();document.querySelectorAll('.v495-og-wrap').forEach(el=>el.remove());
   if(total>0){save();if(showToast&&typeof v063Toast==='function')v063Toast('🌰 Wundertüte OG ersetzt','success',`${total===1?'1 alter Samen / Pflanze':total+' alte Samen / Pflanzen'} → ${total} epische Grow-Samen`)}
   return total;
  }catch(e){console.warn('V4.96 OG migration',e);return 0}
 }
 function disabled(){try{retireLegacyOg(false)}catch(e){}return null}
 try{v077Buff=function(){return null};window.v077Buff=v077Buff}catch(e){window.v077Buff=()=>null}
 ['v077BuySeed','v077Plant','v077Harvest','v077QuestFind','v077InjectGrow'].forEach(name=>{try{window[name]=disabled;eval(name+'=window[name]')}catch(e){}});
 retireLegacyOg(true);stamp();
 document.addEventListener('DOMContentLoaded',()=>{retireLegacyOg(true);stamp()},{once:true});
 window.addEventListener('pageshow',()=>{retireLegacyOg(true);stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){retireLegacyOg(true);stamp()}},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{retireLegacyOg(true);stamp()},{passive:true});
})();
