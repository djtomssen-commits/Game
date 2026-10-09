/* Grow Legends V8.330 - passive, Beta-only, server-confirmed consistency watch.
   No RPC, no persist/write, no automatic repair, no account/token disclosure.
   Canonical owners submit values only after a successful server response. */
(()=>{
'use strict';
if(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()!=='beta'||window.__V8330_DATA_CONSISTENCY_WATCH__)return;
window.__V8330_DATA_CONSISTENCY_WATCH__=true;
const S={version:'V8.330',seen:0,checks:0,accountSwitches:0,issues:[],history:[],lastError:'',latest:{},pending:new Map(),owner:'',generation:0};
let firstTimer=0,secondTimer=0,paintTimer=0,observer=null,observed=[],lastPower=null;
const currentUid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
const state=()=>{try{return typeof s==='undefined'?null:s}catch(_){return null}};
const finite=v=>v!==undefined&&v!==null&&v!==''&&Number.isFinite(Number(v));
const amount=v=>Math.max(0,Math.floor(Number(v)||0));
const itemId=x=>String(x?.id||x?.uid||'');
const itemSig=arr=>JSON.stringify((Array.isArray(arr)?arr:[]).map(it=>[
 itemId(it),Number(it?.level)||0,Number(it?.upgradeLevel)||0,
 JSON.stringify(it?.bonus||it?.stats||it?.attributes||{}),
 JSON.stringify(it?.gem||null),JSON.stringify(it?.enchants||it?.enchant||null)
]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
const equipmentSig=eq=>JSON.stringify(Object.entries(eq&&typeof eq==='object'?eq:{})
 .map(([slot,it])=>[slot,it?itemId(it):'',it?JSON.stringify(it?.bonus||it?.stats||it?.attributes||{}):'',
 it?JSON.stringify(it?.gem||null):'',it?JSON.stringify(it?.enchants||it?.enchant||null):''])
 .sort((a,b)=>a[0].localeCompare(b[0])));
const trim=(x,n)=>{if(x.length>n)x.splice(0,x.length-n)};
function notify(){try{window.dispatchEvent(new Event('growlegends:consistency-report'))}catch(_){}}
function resetAccount(id){
 if(S.owner===id)return;
 if(S.owner)S.accountSwitches++;
 S.owner=id;S.generation++;S.latest={};S.pending.clear();lastPower=null;
 clearTimeout(firstTimer);clearTimeout(secondTimer);
 S.history.push({at:Date.now(),source:'account-boundary'});trim(S.history,30);
 notify();
}
function accept(source,data){
 if(!['progress','quest','refill','items','shop'].includes(source))return false;
 const id=currentUid();if(!id||!data||typeof data!=='object')return false;
 resetAccount(id);
 const patch={};
 for(const [field,raw] of [
  ['gold',data.gold],['harz',data.harz??data.harzTaler],['energy',data.energy],
  ['level',data.level],['xp',data.xp]
 ]){
  if(finite(raw))patch[field]=amount(raw);
 }
 if(Array.isArray(data.inventory))patch.inventory={sig:itemSig(data.inventory),count:data.inventory.length};
 if(data.equipment&&typeof data.equipment==='object')patch.equipment={
  sig:equipmentSig(data.equipment),count:Object.values(data.equipment).filter(Boolean).length};
 if(!Object.keys(patch).length)return false;
 const now=Date.now(),gen=++S.generation;
 for(const [field,value] of Object.entries(patch))S.latest[field]={value,at:now,source,gen};
 S.seen++;S.pending.clear();
 S.history.push({at:now,source,fields:Object.keys(patch)});trim(S.history,30);
 clearTimeout(firstTimer);clearTimeout(secondTimer);
 firstTimer=setTimeout(()=>check('settle'),450);
 secondTimer=setTimeout(()=>check('persistent'),1450);
 notify();
 return true;
}
function check(reason='manual'){
 const id=currentUid(),live=state();if(!id||!live)return {checked:false,reason:'not-authenticated'};
 if(S.owner!==id){resetAccount(id);return {checked:false,reason:'account-transition'};}
 if(window.v7206StartupBusy?.())return {checked:false,reason:'login-in-progress'};
 if(document.hidden)return {checked:false,reason:'not-visible'};
 const now=Date.now(),differences=[],cache=readCache();
 for(const [field,rec] of Object.entries(S.latest)){
  if(now-rec.at>6500)continue; // old server values may be legitimately superseded.
  const expected=rec.value;
  let actual;
  if(field==='inventory')actual={sig:itemSig(live.inventory),count:Array.isArray(live.inventory)?live.inventory.length:0};
  else if(field==='equipment')actual={sig:equipmentSig(live.equipment),count:Object.values(live.equipment||{}).filter(Boolean).length};
  else actual=field==='harz'?live.harzTaler:live[field];
  if(field==='inventory'||field==='equipment'){
   if(expected.sig!==actual.sig)differences.push({key:field+':runtime',source:rec.source,
     detail:field==='inventory'?'Inventar stimmt nicht mit letztem Serverstand überein':'Ausrüstung weicht vom bestätigten Serverstand ab',
     expected:expected.count,actual:actual.count});
  }else if(finite(actual)&&amount(actual)!==expected){
   differences.push({key:field+':runtime',source:rec.source,detail:field+' im Spielzustand abweichend',expected,actual:amount(actual)});
  }
  const domId={gold:'v372Gold',harz:'v372Harz',energy:'v372Dampf'}[field];
  if(domId){
   const el=document.getElementById(domId);
   if(el&&el.getClientRects().length){
    const shown=String(el.textContent||'').split('/')[0].match(/[0-9][0-9.,\s]*/)?.[0];
    if(shown!=null){
     const v=Number(shown.replace(/[^0-9]/g,''));
     if(Number.isFinite(v)&&v!==expected)differences.push({key:field+':topbar',source:rec.source,
      detail:field+' in der Topbar weicht vom bestätigten Serverstand ab',expected,actual:v});
    }
   }
  }
  if(cache&&Object.prototype.hasOwnProperty.call(cache,field==='harz'?'harzTaler':field)){
   const stored=cache[field==='harz'?'harzTaler':field];
   if(field!=='inventory'&&field!=='equipment'&&finite(stored)&&amount(stored)!==expected){
    differences.push({key:field+':localStorage',source:rec.source,
      detail:field+' im lokalen Speicher abweichend',expected,actual:amount(stored)});
   }
  }
 }
 if(cache){
  const cacheOwner=String(cache.__accountOwnerId||cache.social?.playerId||'');
  if(cacheOwner&&cacheOwner!==id&&Object.values(S.latest).some(x=>now-x.at<5000))
   differences.push({key:'account:localStorage',source:'localStorage',
    detail:'Lokaler Cache gehört zu einem anderen Account (keine IDs protokolliert)',expected:'aktiver Account',actual:'anderer Account'});
 }
 S.checks++;
 const present=new Set();
 for(const d of differences){
  const signature=d.key+'|'+d.expected+'|'+d.actual;
  present.add(d.key);
  const previous=S.pending.get(d.key);
  if(previous&&previous.signature===signature&&(reason==='persistent'||now-previous.at>=550)){
   const last=S.issues.at(-1);
   if(!last||last.signature!==signature||now-last.at>15000){
    S.issues.push({at:now,key:d.key,source:d.source,detail:d.detail,
      expected:d.expected,actual:d.actual,level:'verdacht',signature});
    trim(S.issues,25);notify();
   }
  }else S.pending.set(d.key,{signature,at:now});
 }
 for(const key of [...S.pending.keys()])if(!present.has(key))S.pending.delete(key);
 if(reason==='manual')notify();
 return {checked:true,differences:differences.length,confirmedSuspicions:S.issues.length};
}
function readCache(){
 try{
  const key=typeof KEY!=='undefined'?String(KEY||''):'';
  if(!key)return null;
  const raw=localStorage.getItem(key);
  if(!raw||raw.length>2500000)return null;
  const v=JSON.parse(raw);return v&&typeof v==='object'?v:null;
 }catch(_){return null}
}
function scheduleCheck(){clearTimeout(paintTimer);paintTimer=setTimeout(()=>check('ui'),350)}
function connectUiObserver(){
 try{
  const elements=['v372Gold','v372Harz','v372Dampf','charPower'].map(id=>document.getElementById(id)).filter(Boolean);
  if(elements.length===observed.length&&elements.every((el,i)=>el===observed[i]))return;
  observer?.disconnect();observed=elements;
  if(!elements.length)return;
  observer??=new MutationObserver(()=>{
   const el=document.getElementById('charPower');
   if(el&&el.getClientRects().length){
    const m=String(el.textContent||'').match(/[0-9][0-9.,\s]*/);
    if(m){const numeric=Number(m[0].replace(/[^0-9]/g,''));
     const previous=lastPower;
     lastPower={value:numeric,at:Date.now()};
     if(previous&&Number.isFinite(numeric)&&numeric!==previous.value&&Date.now()-previous.at<3000){
      S.history.push({at:Date.now(),source:'power-value-changed',fields:['charPower']});trim(S.history,30);
     }
    }
   }
   scheduleCheck();
  });
  for(const el of elements)observer.observe(el,{subtree:true,childList:true,characterData:true});
 }catch(e){S.lastError=String(e?.message||e)}
}
function report(){
 const id=currentUid();if(S.owner&&id&&id!==S.owner)resetAccount(id);
 const latest={};for(const [field,r] of Object.entries(S.latest))
   latest[field]={value:typeof r.value==='object'?r.value.count:r.value,ageMs:Math.max(0,Date.now()-r.at),source:r.source};
 return {version:S.version,mode:'read-only, no extra RPCs',active:!!id,observations:S.seen,checks:S.checks,
  accountSwitches:S.accountSwitches,issues:S.issues.map(({signature,...rest})=>({...rest})),
  lastConfirmed:latest,history:S.history.map(x=>({...x})),lastError:S.lastError};
}
function reportText(){
 const r=report();
 return ['GROW LEGENDS | DATENKONSISTENZ | '+r.version,
  'Nur bestätigte Serverantworten; keine Datenkorrektur oder zusätzliche RPC.',
  'Bestätigungen: '+r.observations+' | Prüfungen: '+r.checks+
   ' | Accountwechsel: '+r.accountSwitches+' | Verdachtsfälle: '+r.issues.length,
  ...Object.entries(r.lastConfirmed).map(([k,v])=>'SERVER '+k+': '+v.value+' | vor '+v.ageMs+' ms | '+v.source),
  'VERDACHTSFÄLLE:',
  ...(r.issues.length?r.issues.map(x=>new Date(x.at).toLocaleTimeString('de-DE')+' | '+x.key+
    ' | erwartet '+x.expected+', gesehen '+x.actual+' | '+x.detail):['Keine belegte, anhaltende Abweichung in den beobachteten Daten.']),
  'BESTÄTIGUNGEN: '+r.history.length,
  ...r.history.slice(-20).map(x=>new Date(x.at).toLocaleTimeString('de-DE')+' | '+x.source+' | '+(x.fields||[]).join(',')),
  'HINWEIS: Ein fehlender Verdachtsfall garantiert keine vollständige Fehlerfreiheit.'
 ].join('\n');
}
window.v8330ObserveCanonical=accept;
window.v8330DataConsistencyCheck=()=>check('manual');
window.v8330DataConsistencyReport=report;
window.v8330DataConsistencyText=reportText;
window.addEventListener('growlegends:account-ready',()=>{resetAccount(currentUid());setTimeout(connectUiObserver,0)},{passive:true});
window.addEventListener('growlegends:first-playable',()=>setTimeout(connectUiObserver,0),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>setTimeout(()=>{connectUiObserver();scheduleCheck()},80),{passive:true});
window.addEventListener('growlegends:resources-changed',scheduleCheck,{passive:true});
window.addEventListener('growlegends:home-rendered-v8009',scheduleCheck,{passive:true});
window.addEventListener('pageshow',()=>setTimeout(connectUiObserver,120),{passive:true});
if(document.readyState!=='loading')connectUiObserver();
else document.addEventListener('DOMContentLoaded',connectUiObserver,{once:true});
})();