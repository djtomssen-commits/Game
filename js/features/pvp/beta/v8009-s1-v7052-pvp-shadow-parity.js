
(()=>{
'use strict';
const VERSION='V7.057';
if(window.__V7052_PVP_SHADOW_PARITY__===VERSION)return;
window.__V7052_PVP_SHADOW_PARITY__=VERSION;
const S={busy:false,last:null,lastError:'',reportId:null,targetId:null};
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clone=v=>{try{return structuredClone(v)}catch(_){try{return JSON.parse(JSON.stringify(v))}catch(__){return v}}};
function online(){try{return typeof v073Db!=='undefined'&&v073Db&&typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous}catch(_){return false}}
function tape(){const a=[];for(let g=1;g<=500;g++)a.push(((g*37)%997)/997);return a}
async function rpc(name,args={}){const {data,error}=await v073Db.rpc(name,args);if(error)throw error;return Array.isArray(data)?(data[0]??null):data}
function classId(){return String(s?.playerClass||'grower')}
function setVal(name){try{return typeof setBonusValue==='function'?n(setBonusValue(name)):0}catch(_){return 0}}
function attr(name){try{return typeof totalAttr==='function'?n(totalAttr(name)):0}catch(_){return 0}}
function localSim(ref,rngTape){
 const def=ref?.defender||{};
 const myClass=classId();
 const enClass=String(def.classId||'grower');
 const myPower=Math.max(1,Math.round(n(typeof combatPower==='function'?combatPower():0)));
 const enPower=Math.max(1,Math.round(n(def.power)));
 let myHp=Math.max(120,Math.round(n(typeof maxHp==='function'?maxHp():120)));
 let enHp=Math.max(120,Math.round(n(def.maxHp)));
 const maxMy=myHp,maxEn=enHp;
 const myFrostOffhand=myClass==='frost'&&!!s?.equipment?.weapon&&!!s?.equipment?.weapon2;
 const enFrostOffhand=!!def.frostOffhand;
 let combatState=null;
 try{if(typeof v318NewCombatState==='function')combatState=v318NewCombatState('pvp',maxMy)}catch(e){}
 let round=0,idx=0,won=false,finished=false;
 const events=[];
 const oldRandom=Math.random;
 Math.random=()=>{if(idx>=rngTape.length)throw new Error('V7052_RNG_TAPE_EXHAUSTED');return rngTape[idx++]};
 try{
  while(!finished&&round<30){
   round++;
   const enemyDodged=enClass==='scout'&&Math.random()<.05;
   const myBase=Math.max(6,Math.round((myPower*.10+8)*(.84+Math.random()*.32)));
   let myDmg=myBase,myHeal=0,myCrit=false,myLabel='TREFFER',myOffhand=0;
   if(!enemyDodged){
    if(combatState&&typeof v318ResolvePlayerAttack==='function'){
     const a=v318ResolvePlayerAttack(combatState,{
      baseDamage:myBase,
      enemyHp:enHp,enemyMax:maxEn,
      playerHp:myHp,playerMax:maxMy,
      baseCrit:Math.min(.30,.04+attr('glueck')*.012),
      setCrit:myClass==='bruiser'?(.07+setVal('critChance')):0,
      baseWucht:(myClass==='grower'||myClass==='frost')?(.13+setVal('wuchtChance')):0,
      baseDouble:myClass==='scout'?(.15+setVal('doubleChance')):0,
      setDoubleDamage:setVal('doubleDamage')
     })||{};
     myDmg=Math.max(1,Math.round(n(a.damage)||myBase));
     myHeal=Math.max(0,Math.round(n(a.heal)));
     myCrit=!!a.crit;
     myLabel=String(a.text||'TREFFER');
    }else{
     myCrit=Math.random()<(.12+(myClass==='bruiser'?.05:0));
     if(myCrit){myDmg=Math.round(myDmg*1.55);myLabel='KRIT'}
    }
    if(myClass==='grower')myDmg=Math.round(myDmg*1.05);
    if(myFrostOffhand&&Math.random()<.08){myOffhand=Math.max(1,Math.round(myBase*.40));myDmg+=myOffhand;myLabel+=(myLabel?' + ':'')+'NEBENHAND'}
   }else{myDmg=0;myLabel='AUSGEWICHEN'}
   enHp=Math.max(0,enHp-myDmg);
   myHp=Math.min(maxMy,myHp+myHeal);
   events.push({round,actor:'attacker',damage:Math.max(0,Math.round(myDmg)),heal:Math.max(0,Math.round(myHeal)),crit:!!myCrit,dodge:!!enemyDodged,offhand:Math.max(0,Math.round(myOffhand)),counter:0,label:myLabel,attackerHp:Math.max(0,Math.round(myHp)),defenderHp:Math.max(0,Math.round(enHp)),rng_used:idx});
   if(enHp<=0){won=true;finished=true;break}

   const myBasicDodge=myClass==='scout'&&Math.random()<.05;
   const enCrit=!myBasicDodge&&Math.random()<(.08+(enClass==='bruiser'?.05:0));
   const enBase=Math.max(6,Math.round((enPower*.10+8)*(.84+Math.random()*.32)));
   let enRaw=enBase;
   if(enCrit)enRaw=Math.round(enRaw*1.45);
   if(enClass==='grower')enRaw=Math.round(enRaw*1.05);
   let enOffhand=0;
   if(!myBasicDodge&&enFrostOffhand&&Math.random()<.08){enOffhand=Math.max(1,Math.round(enBase*.40));enRaw+=enOffhand}
   let taken=enRaw,defHeal=0,counter=0,prevent=false,defLabel='Gegner trifft';
   if(myBasicDodge){taken=0;defLabel='AUSGEWICHEN'}
   else if(combatState&&typeof v318ResolveEnemyAttack==='function'){
    const d=v318ResolveEnemyAttack(combatState,{damage:enRaw,playerHp:myHp,playerMax:maxMy})||{};
    taken=Math.max(0,Math.round(n(d.damage)));
    defHeal=Math.max(0,Math.round(n(d.heal)));
    counter=Math.max(0,Math.round(n(d.counterDamage)));
    prevent=!!d.preventLethal;
    defLabel=String(d.text||'Gegner trifft');
   }
   myHp=Math.min(maxMy,myHp+defHeal);
   myHp=Math.max(0,myHp-taken);
   if(prevent&&myHp<=0)myHp=1;
   if(counter>0)enHp=Math.max(0,enHp-counter);
   events.push({round,actor:'defender',damage:Math.max(0,Math.round(taken)),heal:Math.max(0,Math.round(defHeal)),crit:!!enCrit,dodge:!!myBasicDodge,offhand:Math.max(0,Math.round(enOffhand)),counter:Math.max(0,Math.round(counter)),label:defLabel,attackerHp:Math.max(0,Math.round(myHp)),defenderHp:Math.max(0,Math.round(enHp)),rng_used:idx});
   if(enHp<=0){won=true;finished=true;break}
   if(myHp<=0){won=false;finished=true;break}
   if(round>=30){won=(myHp/maxMy)>=(enHp/maxEn);finished=true;break}
  }
 }finally{Math.random=oldRandom}
 return {version:VERSION,won,rounds:round,rng_consumed:idx,attacker:{power:myPower,maxHp:maxMy,hpAfter:myHp,classId:myClass},defender:{power:enPower,maxHp:maxEn,hpAfter:enHp,classId:enClass,frostOffhand:enFrostOffhand},events};
}
function coreEvent(e){return {round:Number(e?.round)||0,actor:String(e?.actor||''),damage:Math.max(0,Math.round(n(e?.damage))),heal:Math.max(0,Math.round(n(e?.heal))),crit:!!e?.crit,dodge:!!e?.dodge,offhand:Math.max(0,Math.round(n(e?.offhand))),counter:Math.max(0,Math.round(n(e?.counter))),attackerHp:Math.max(0,Math.round(n(e?.attackerHp))),defenderHp:Math.max(0,Math.round(n(e?.defenderHp))),rng_used:Math.max(0,Math.round(n(e?.rng_used)))} }
function compare(local,server){
 const mm=[];const ck=(k,a,b)=>{if(a!==b)mm.push({k,client:a,server:b})};
 ck('won',!!local.won,!!server.won);ck('rounds',Number(local.rounds),Number(server.rounds));ck('rng_consumed',Number(local.rng_consumed),Number(server.rng_consumed));
 ck('attacker.power',Number(local.attacker?.power),Number(server.attacker?.power));ck('attacker.maxHp',Number(local.attacker?.maxHp),Number(server.attacker?.maxHp));ck('attacker.hpAfter',Number(local.attacker?.hpAfter),Number(server.attacker?.hpAfter));
 ck('defender.power',Number(local.defender?.power),Number(server.defender?.power));ck('defender.maxHp',Number(local.defender?.maxHp),Number(server.defender?.maxHp));ck('defender.hpAfter',Number(local.defender?.hpAfter),Number(server.defender?.hpAfter));
 const le=Array.isArray(local.events)?local.events:[],se=Array.isArray(server.events)?server.events:[];ck('events.length',le.length,se.length);
 const m=Math.min(le.length,se.length);for(let i=0;i<m;i++){const a=coreEvent(le[i]),b=coreEvent(se[i]);for(const k of Object.keys(a))if(a[k]!==b[k]){mm.push({k:`event[${i}].${k}`,client:a[k],server:b[k]});if(mm.length>=30)return mm}}
 return mm;
}
async function run(){
 if(S.busy||!online()||!['summoner','bruiser','grower','scout','frost'].includes(classId()))return false;S.busy=true;
 try{
  let match=await rpc('v206_find_pvp_match',{});
  if(!match?.allowed||!match?.target_id){
   try{match=await rpc('v7056_find_pvp_shadow_target',{})}catch(_){ }
  }
  if(!match?.allowed||!match?.target_id){S.last={skipped:true,reason:'no-shadow-target',remaining_seconds:0};return false}
  const target=String(match.target_id);const rng=tape();
  const server=await rpc('v7052_pvp_shadow_reference',{p_target_user:target,p_rng:rng});
  const local=localSim(server,rng);
  const mismatches=compare(local,server);
  const report={target:{id:target,name:server?.defender?.name||match.character_name||'',classId:server?.defender?.classId||match.class_id||'',level:Number(server?.defender?.level)||Number(match.level)||0,power:Number(server?.defender?.power)||Number(match.combat_power)||0},client:{won:local.won,rounds:local.rounds,rng_consumed:local.rng_consumed,attacker:local.attacker,defender:local.defender,events:(local.events||[]).map(coreEvent)},server:{won:!!server?.won,rounds:Number(server?.rounds)||0,rng_consumed:Number(server?.rng_consumed)||0,attacker:server?.attacker||null,defender:server?.defender||null,events:(server?.events||[]).map(coreEvent),rewards_preview:server?.rewards_preview||null},mismatches};
  const out=await rpc('v7052_submit_pvp_parity',{p_client_version:VERSION,p_target_user:target,p_ok:mismatches.length===0,p_mismatch_count:mismatches.length,p_report:report});
  S.reportId=Number(out?.report_id)||null;S.targetId=target;S.last=report;S.lastError='';return mismatches.length===0;
 }catch(e){S.lastError=String(e?.message||e);console.warn('[V7052] PvP shadow parity',e);return false}
 finally{S.busy=false}
}
window.v7052PvpShadowDiagnostics=()=>clone({...S,version:VERSION});
window.v7052RunPvpShadowParity=()=>run();
/* V7.094 production: PvP synthetic parity is manual via v7052RunPvpShadowParity(). */
})();
