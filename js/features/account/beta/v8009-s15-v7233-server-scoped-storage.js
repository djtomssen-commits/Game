(()=>{
 'use strict';
 if(window.__V7233_SERVER_SCOPED_STORAGE__)return;
 window.__V7233_SERVER_SCOPED_STORAGE__=true;
 const P=Storage.prototype;
 const g=P.getItem, s=P.setItem, r=P.removeItem;
 const LAUNCH=Date.parse('2026-10-02T16:00:00+02:00');
 const exact=new Set([
  'growLegendsV020','growLegendsV016','growLegendsV015','growLegendsV014','growLegendsV013','growLegendsV0121','growLegendsV012','growLegendsV011','growLegendsV010','growLegendsV09','growLegendsV08','growLegendsV07','growLegendsV06','growLegendsV05','growLegendsV04','growLegendsV03','growLegendsV02','growLegendsV01',
  'grow_idle_save_v1','growLegendsSave','growlegends_quest_claim_locks_v496','growLegends_v7037_dungeonLootPending','growlegends_adbag_v1','growLegendsGrowPlantsV498','growLegendsV210Notifications'
 ]);
 const prefixes=[
  'growLegendsAccountSave:','growLegendsBestSave:','growLegendsProgressFloor:',
  'growLegendsCharacterIdentity:','growLegendsCharacterLockV4139:','growLegendsAccountTransitionBackup:',
  'growLegendsGrowPlantsV498:','growLegendsGrowStateV499:','growLegendsCareAuthorityV4120:',
  'growLegendsCareLedgerV4114:','growLegendsV210Notifications:','growLegendsLastVisit:',
  'growLegendsV486AutoPending:','growLegendsV6200BattleLog:'
 ];
 const raw=k=>{try{return g.call(localStorage,k)}catch(_){return null}};
 function sid(){
  if(String(window.GROW_RELEASE_CHANNEL||'stable')==='beta')return 'beta';
  if(Date.now()>=LAUNCH)return 'server1';
  const x=raw('growLegendsSelectedServer')||raw('growLegends:selectedServer')||raw('growLegends:server')||'beta';
  return String(x)==='server1'?'server1':'beta';
 }
 function scoped(k){
  k=String(k??'');
  if(sid()!=='server1')return k;
  if(/:server:(?:beta|server1)$/.test(k))return k;
  if(exact.has(k)||prefixes.some(p=>k.startsWith(p)))return k+':server:server1';
  return k;
 }
 P.getItem=function(k){return this===localStorage?g.call(this,scoped(k)):g.call(this,k)};
 P.setItem=function(k,v){return this===localStorage?s.call(this,scoped(k),v):s.call(this,k,v)};
 P.removeItem=function(k){return this===localStorage?r.call(this,scoped(k)):r.call(this,k)};
 window.v7233StorageDiagnostics=()=>({server:sid(),isolated:sid()==='server1',patterns:exact.size+prefixes.length,mainKey:scoped('growLegendsV020'),growKey:scoped('grow_idle_save_v1')});
})();
