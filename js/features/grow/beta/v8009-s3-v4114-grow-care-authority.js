(()=>{
 'use strict';
 const VERSION='V4.114 Stable',SHORT='V4.114',PREFIX='growLegendsCareLedgerV4114:';
 const AT=[.20,.45,.70,.88];
 const LABELS=[['💧','Gießen'],['💡','Licht'],['✂️','Beschneiden'],['🧪','Nährstoffe']];
 let internal=false;
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(e){return null}};
 function owner(){try{return String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local')}catch(e){return'local'}}
 function key(){return PREFIX+owner()}
 function plants(){try{return Array.isArray(s?.grow?.plants)?s.grow.plants:[]}catch(e){return[]}}
 function shapePlant(p){
  if(!p||typeof p!=='object')return null;
  p.uid=String(p.uid||`v4114_${Number(p.start)||Date.now()}_${Math.random().toString(36).slice(2,7)}`);
  p.care=Array.isArray(p.care)?[0,1,2,3].map(i=>!!p.care[i]):[false,false,false,false];
  p.careDoneAt=Array.isArray(p.careDoneAt)?[0,1,2,3].map(i=>Math.max(0,Number(p.careDoneAt[i])||0)):[0,0,0,0];
  return p;
 }
 function embedded(){
  s.grow=(s.grow&&typeof s.grow==='object')?s.grow:{};
  s.grow.v492=(s.grow.v492&&typeof s.grow.v492==='object')?s.grow.v492:{};
  const z=s.grow.v492;
  z.careLedger=(z.careLedger&&typeof z.careLedger==='object')?z.careLedger:{};
  z.careRevision=Math.max(0,Number(z.careRevision)||0);
  return z.careLedger;
 }
 function readLocal(){try{const x=JSON.parse(localStorage.getItem(key())||'null');return x&&x.owner===owner()&&x.entries&&typeof x.entries==='object'?x:{owner:owner(),rev:0,entries:{}}}catch(e){return{owner:owner(),rev:0,entries:{}}}}
 function writeLocal(entries,rev){try{localStorage.setItem(key(),JSON.stringify({owner:owner(),rev:Math.max(0,Number(rev)||0),savedAt:Date.now(),entries}))}catch(e){}}
 function entryFromPlant(p){
  p=shapePlant(p); if(!p)return null;
  return {uid:p.uid,seed:String(p.seed||''),start:Number(p.start)||0,care:p.care.slice(0,4),doneAt:p.careDoneAt.slice(0,4),updatedAt:Date.now()};
 }
 function mergeEntry(a,b){
  const out={...(a||{}),...(b||{})};
  out.care=[0,1,2,3].map(i=>!!(a?.care?.[i]||b?.care?.[i]));
  out.doneAt=[0,1,2,3].map(i=>Math.max(Number(a?.doneAt?.[i])||0,Number(b?.doneAt?.[i])||0));
  out.updatedAt=Math.max(Number(a?.updatedAt)||0,Number(b?.updatedAt)||0,Date.now());
  return out;
 }
 function syncLedger(reason='sync'){
  /* V7.136: care state is canonical in player_seed_state. Retire the old
     browser care-ledger merge for authenticated server-authority accounts. */
  if(window.v7081UseAuthority?.('grow'))return false;
  if(internal)return false; internal=true;
  try{
   const z=s.grow?.v492||(s.grow.v492={}), emb=embedded(), loc=readLocal(), merged={...loc.entries};
   Object.entries(emb).forEach(([uid,e])=>merged[uid]=mergeEntry(merged[uid],e));
   plants().filter(Boolean).forEach(p=>{shapePlant(p);merged[p.uid]=mergeEntry(merged[p.uid],entryFromPlant(p))});
   let changed=false;
   plants().filter(Boolean).forEach(p=>{
    const e=merged[p.uid]; if(!e)return;
    for(let i=0;i<4;i++){
     if(e.care[i]&&!p.care[i]){p.care[i]=true;changed=true}
     const ts=Math.max(Number(p.careDoneAt[i])||0,Number(e.doneAt[i])||0);if(ts!==p.careDoneAt[i]){p.careDoneAt[i]=ts;changed=true}
    }
    merged[p.uid]=mergeEntry(e,entryFromPlant(p));
   });
   /* Keep active/recent plant ledgers only. Unique UIDs make stale entries harmless, but prune old noise. */
   const live=new Set(plants().filter(Boolean).map(p=>String(p.uid))),now=Date.now();
   Object.keys(merged).forEach(uid=>{if(!live.has(uid)&&now-Number(merged[uid]?.updatedAt||0)>72*3600000)delete merged[uid]});
   const rev=Math.max(Number(z.careRevision)||0,Number(loc.rev)||0)+(changed?1:0);
   z.careLedger=merged;z.careRevision=rev;writeLocal(merged,rev);
   return changed;
  }finally{internal=false}
 }
 function commit(p,idx){
  p=shapePlant(p);if(!p||idx<0||idx>3)return false;
  const now=Date.now();p.care[idx]=true;p.careDoneAt[idx]=Math.max(now,Number(p.careDoneAt[idx])||0);
  const led=embedded(),loc=readLocal(),e=mergeEntry(mergeEntry(loc.entries[p.uid],led[p.uid]),entryFromPlant(p));
  led[p.uid]=e;const rev=Math.max(Number(s.grow.v492.careRevision)||0,Number(loc.rev)||0)+1;s.grow.v492.careRevision=rev;
  loc.entries[p.uid]=e;writeLocal(loc.entries,rev);
  return true;
 }
 function progress(p){const wm=Math.max(.80,Math.min(1.30,Number(window.GL_WEATHER?.bonus?.growMul)||1));return Math.max(0,Math.min(1,((Date.now()-Number(p?.start||0))*wm)/Math.max(1,Number(p?.duration)||1)))}
 function careState(p){shapePlant(p);const x=progress(p);let available=-1,missed=0;for(let i=0;i<4;i++){const end=i===3?1:AT[i+1];if(p.care[i])continue;if(x>=end){missed++;continue}if(x>=AT[i]&&x<end){available=i;break}}return{available,missed,x}}
 function persistCare(){
  syncLedger('before-save');
  try{if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s))}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){} }
  syncLedger('after-save');
  try{if(typeof v075WriteCloudSave==='function')setTimeout(()=>v075WriteCloudSave(false),0)}catch(e){}
 }
 function toast(title,detail){try{if(typeof v063Toast==='function')return v063Toast(title,'success',detail)}catch(e){} }
 function doCare(uid,intended){
  if(typeof window.v7067ServerCare==='function')return window.v7067ServerCare(uid,intended);
  syncLedger('action-start');
  const p=plants().find(x=>x&&String(x.uid)===String(uid));if(!p)return false;
  const st=careState(p),raw=Number(intended);let idx=Number.isInteger(raw)&&raw>=0&&raw<4?raw:st.available;
  if(idx<0||idx>3)return false;
  if(p.care[idx])return true;
  const x=progress(p),end=idx===3?1:AT[idx+1],endAt=Number(p.start||0)+Number(p.duration||0)*end;
  /* Generous tap grace for mobile boundary transitions. */
  if(x>=end&&Date.now()-endAt>15000){idx=careState(p).available;if(idx<0)return false}
  if(!commit(p,idx))return false;
  persistCare();
  try{if(typeof renderGrow==='function')renderGrow()}catch(e){}
  setTimeout(()=>{syncLedger('post-action');decorateSlots()},30);
  
  return true;
 }
 window.v4114CarePlant=doCare;window.v4114SyncCare=syncLedger;

 function decorateSlots(){
  try{
   syncLedger('decorate');
   document.querySelectorAll('#grow .v492-plant[data-v492-detail]').forEach(card=>{
    const uid=String(card.dataset.v492Detail||''),p=plants().find(x=>x&&String(x.uid)===uid);if(!p)return;
    shapePlant(p);const st=careState(p),done=p.care.filter(Boolean).length;
    let mini=card.querySelector(':scope > .v4114-care-mini');
    if(!mini){mini=document.createElement('span');mini.className='v4114-care-mini';card.prepend(mini)}
    const miniHtml=[0,1,2,3].map(i=>{const end=i===3?1:AT[i+1],miss=!p.care[i]&&st.x>=end,avail=!p.care[i]&&!miss&&st.available===i;return `<i class="${p.care[i]?'done':miss?'missed':avail?'available':''}"></i>`}).join('');
    if(mini.innerHTML!==miniHtml)mini.innerHTML=miniHtml;
    const aria=`Pflege ${done} von 4`;if(mini.getAttribute('aria-label')!==aria)mini.setAttribute('aria-label',aria);
    let b=card.querySelector(':scope > .v4114-slot-care');
    if(!b){b=document.createElement('span');b.className='v4114-slot-care';card.appendChild(b)}
    let txt,title,active=st.available>=0;
    if(active){const [ico,name]=LABELS[st.available];txt=`${ico} ${name} · ${done}/4`;title=`${name} jetzt durchführen`;b.setAttribute('role','button');b.setAttribute('tabindex','0');b.dataset.v4114Care=uid;b.dataset.v4114CareIndex=String(st.available)}
    else{txt=`🌿 Pflege ${done}/4`;title='Aktuell keine Pflegeaktion verfügbar';b.removeAttribute('role');b.removeAttribute('tabindex');delete b.dataset.v4114Care;delete b.dataset.v4114CareIndex}
    b.classList.toggle('done',!active);
    if(b.textContent!==txt)b.textContent=txt;
    if(b.title!==title)b.title=title;
   });
  }catch(e){}
 }
 window.v4114DecorateCareSlots=decorateSlots;
 /* Window capture fires before the historical document capture listener. */
 window.addEventListener('click',e=>{
  const t=e.target instanceof Element?e.target.closest('[data-v4114-care]'):null;if(!t)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();doCare(t.dataset.v4114Care,Number(t.dataset.v4114CareIndex));
 },true);
 window.addEventListener('keydown',e=>{const t=e.target instanceof Element?e.target.closest('[data-v4114-care]'):null;if(!t||!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();doCare(t.dataset.v4114Care,Number(t.dataset.v4114CareIndex))},true);

 /* Make care monotonic across every legacy normalizer/save/cloud/navigation path. */
 try{if(typeof normalizeState==='function'&&!window.__v4114Normalize){const base=normalizeState;normalizeState=function(){syncLedger('normalize-before');const r=base.apply(this,arguments);syncLedger('normalize-after');return r};try{window.normalizeState=normalizeState}catch(e){}window.__v4114Normalize=true}}catch(e){}
 try{if(typeof persist==='function'&&!window.__v4114Persist){const base=persist;persist=function(){syncLedger('persist-before');return base.apply(this,arguments)};try{window.persist=persist}catch(e){}window.__v4114Persist=true}}catch(e){}
 try{if(typeof v075ApplyCloudSave==='function'&&!window.__v4114CloudApply){const base=v075ApplyCloudSave;v075ApplyCloudSave=async function(){syncLedger('cloud-before');const r=await base.apply(this,arguments);const changed=syncLedger('cloud-after');if(changed){try{if(typeof persist==='function')persist(false)}catch(e){}}return r};try{window.v075ApplyCloudSave=v075ApplyCloudSave}catch(e){}window.__v4114CloudApply=true}}catch(e){}
 try{if(!window.__v4114Go){window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')!=='grow')return;const changed=syncLedger('grow-open');if(changed)try{persist(false)}catch(_){};decorateSlots()},{passive:true});window.__v4114Go=true}}catch(e){}

 function addQaTests(){
  try{
   const runner=window.v4107RunQA||window.v4102RunQA;if(typeof runner!=='function'||window.__v4114QaWrapped)return;
   const wrapped=function(){
    syncLedger('qa');const r=runner.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;
    const tests=[];const T=(name,fn)=>{let pass=false,detail='';try{const x=fn();pass=typeof x==='object'?!!x.pass:!!x;detail=typeof x==='object'?String(x.detail||''):''}catch(e){detail=e.message||String(e)}tests.push({category:'Growroom Pflege',name,pass,severity:'error',detail})};
    T('Pflege-Ledger accountgebunden aktiv',()=>typeof window.v4114SyncCare==='function'&&!!embedded());
    T('Erledigte Pflege ist monoton (true kann nicht zurück auf false)',()=>{const p={uid:'qa_care_monotonic',seed:'moss',start:Date.now()-30000,duration:100000,care:[false,false,false,false],careDoneAt:[0,0,0,0]};const z=embedded(),old=z[p.uid];z[p.uid]={uid:p.uid,care:[false,true,false,false],doneAt:[0,123456,0,0],updatedAt:Date.now()};const oldPlants=s.grow.plants;try{s.grow.plants=[p];syncLedger('qa-monotonic');return p.care[1]===true&&p.careDoneAt[1]>=123456}finally{s.grow.plants=oldPlants;if(old)z[p.uid]=old;else delete z[p.uid]}});
    T('Pflegebutton direkt im Pflanzenslot implementiert',()=>typeof window.v4114DecorateCareSlots==='function'&&document.getElementById('v4114-grow-care-css'));
    r.results.push(...tests);r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;
   };
   window.v4107RunQA=wrapped;if(window.v4102RunQA===runner)window.v4102RunQA=wrapped;window.__v4114QaWrapped=true;
  }catch(e){}
 }
 function stamp(){}
 syncLedger('startup');decorateSlots();addQaTests();stamp();
 /* V6.97: body-wide grow-care observer retired. */
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){const c=syncLedger('visible');if(c)try{persist(false)}catch(e){};decorateSlots();stamp()}},{passive:true});
 window.addEventListener('pageshow',()=>{const c=syncLedger('pageshow');if(c)try{persist(false)}catch(e){};decorateSlots();stamp()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{syncLedger('account-ready');decorateSlots();addQaTests();stamp()},{passive:true});
})();
