(()=>{
'use strict';
if(window.__V7050_DUNGEON_PARITY_SHADOW__)return;
window.__V7050_DUNGEON_PARITY_SHADOW__=true;

const VERSION='V7.050';
const S={running:false,done:false,last:null,lastError:''};
const DI=2,RI=0;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const state=()=>{try{return typeof s!=='undefined'&&s?s:(window.s||null)}catch(_){return window.s||null}};
const num=(v,d=0)=>{v=Number(v);return Number.isFinite(v)?v:d};
const tape=()=>Array.from({length:500},(_,i)=>(((i+1)*37)%997)/997);

function clientSnapshot(di=DI,ri=RI){
 const st=state();
 if(!st)throw new Error('CLIENT_STATE_MISSING');
 if(String(st.playerClass||'')!=='summoner')throw new Error('V7050_SUMMONER_ONLY');
 if(typeof v025EnemyStats!=='function'||typeof v060PlayerDamageFactor!=='function'||typeof v060EnemyDamageFactor!=='function')throw new Error('DUNGEON_COMBAT_HELPERS_MISSING');
 const enemy={boss:Number(ri)===9};
 const bal=v025EnemyStats(Number(di),Number(ri),enemy)||{};
 const rec=Math.max(1,num(bal.rec,1));
 const attrs={};
 for(const k of ['staerke','geschick','intelligenz','ausdauer','glueck','ruestung']){
  try{attrs[k]=num(totalAttr(k),0)}catch(_){attrs[k]=0}
 }
 let primary=attrs.intelligenz;
 try{primary=num(v029PrimaryStat(),primary)}catch(_){}
 let hp=Math.max(1,80+attrs.ausdauer*8+Math.max(1,num(st.level,1))*5);
 try{hp=Math.max(1,Math.round(num(maxHp(),hp)))}catch(_){}
 let exact={};
 try{exact=clone(v319ExactTalentStats?.()||{})}catch(_){}
 let setCount=0;
 try{setCount=Math.max(0,num(equippedSetCount?.('summoner'),0))}catch(_){}
 return {
  version:VERSION,
  class:'summoner',
  level:Math.max(1,num(st.level,1)),
  attrs,
  primary_stat:primary,
  max_hp:hp,
  base_crit:Math.min(.30,.04+attrs.glueck*.012),
  exact_stats:exact,
  set_count:setCount,
  dungeon:{
   dungeon_index:Number(di),room_index:Number(ri),boss:Number(ri)===9,
   rec,enemy_hp:Math.max(1,Math.round(num(bal.hp,1))),enemy_attack:Math.max(1,Math.round(num(bal.attack,1))),
   player_factor:num(v060PlayerDamageFactor(rec),1),enemy_factor:num(v060EnemyDamageFactor(rec),1)
  }
 };
}

function simulateClient(di=DI,ri=RI,rng=tape()){
 const snap=clientSnapshot(di,ri),st=state();
 if(typeof v318NewCombatState!=='function'||typeof v318ResolvePlayerAttack!=='function'||typeof v318ResolveEnemyAttack!=='function')throw new Error('V318_RESOLVER_MISSING');
 const oldRandom=Math.random;
 let idx=0;
 Math.random=()=>{
  if(idx>=rng.length)throw new Error('RNG_TAPE_EXHAUSTED_AT_'+idx);
  const v=Number(rng[idx++]);
  if(!Number.isFinite(v)||v<0||v>=1)throw new Error('RNG_TAPE_INVALID_AT_'+(idx-1));
  return v;
 };
 try{
  const bal={rec:snap.dungeon.rec,hp:snap.dungeon.enemy_hp,attack:snap.dungeon.enemy_attack};
  const maxPlayer=snap.max_hp,maxEnemy=bal.hp;
  let playerHp=maxPlayer,enemyHp=maxEnemy,round=0,finished=false,won=false;
  const combatState=v318NewCombatState('dungeon',maxPlayer);
  const replay=[];
  while(!finished&&round<45){
   round++;
   const baseDamage=Math.max(3,Math.floor((snap.primary_stat*1.9+snap.level*1.55+Math.random()*7)*snap.dungeon.player_factor));
   const a=v318ResolvePlayerAttack(combatState,{
    baseDamage,enemyHp,enemyMax:maxEnemy,playerHp,playerMax:maxPlayer,
    baseCrit:snap.base_crit,
    setCrit:0,
    baseWucht:0,
    baseDouble:0,
    setDoubleDamage:0
   })||{};
   const damage=Math.max(1,Math.round(num(a.damage,baseDamage)));
   const heal=Math.max(0,Math.round(num(a.heal,0)));
   playerHp=Math.min(maxPlayer,playerHp+heal);
   enemyHp=Math.max(0,enemyHp-damage);
   replay.push({round,side:'player',base_damage:baseDamage,damage,heal,crit:!!a.crit,player_hp:playerHp,enemy_hp:enemyHp,rng_used:idx});
   if(enemyHp<=0){won=true;finished=true;break}

   let armor=0;try{armor=num(totalAttr('ruestung'),0)}catch(_){}
   const enemyBase=Math.max(3,Math.floor((bal.attack+Math.random()*7-armor*.34)*snap.dungeon.enemy_factor));
   const d=v318ResolveEnemyAttack(combatState,{damage:enemyBase,playerHp,playerMax:maxPlayer})||{};
   const enemyDamage=Math.max(0,Math.round(num(d.damage,0)));
   const enemyHeal=Math.max(0,Math.round(num(d.heal,0)));
   const counter=Math.max(0,Math.round(num(d.counterDamage,0)));
   const prevent=!!d.preventLethal;
   playerHp=Math.min(maxPlayer,playerHp+enemyHeal);
   playerHp=Math.max(0,playerHp-enemyDamage);
   if(prevent&&playerHp<=0)playerHp=1;
   if(counter)enemyHp=Math.max(0,enemyHp-counter);
   replay.push({round,side:'enemy',base_damage:enemyBase,damage:enemyDamage,heal:enemyHeal,counter,prevent,player_hp:playerHp,enemy_hp:enemyHp,rng_used:idx});
   if(enemyHp<=0){won=true;finished=true;break}
   if(playerHp<=0){won=false;finished=true;break}
   if(round>=45){won=(playerHp/maxPlayer)>(enemyHp/maxEnemy);finished=true;break}
  }
  if(!finished)won=(playerHp/maxPlayer)>(enemyHp/maxEnemy);
  return {version:VERSION,read_only:true,won,rounds:round,player_hp_start:maxPlayer,player_hp_end:playerHp,enemy_hp_start:maxEnemy,enemy_hp_end:enemyHp,rng_consumed:idx,replay,snapshot:snap};
 }finally{
  Math.random=oldRandom;
 }
}

function compare(client,server){
 const mismatches=[];
 const add=(path,a,b,tol=0)=>{
  const na=Number(a),nb=Number(b);
  const numeric=Number.isFinite(na)&&Number.isFinite(nb);
  const same=numeric?Math.abs(na-nb)<=tol:a===b;
  if(!same)mismatches.push({path,client:a,server:b});
 };
 add('won',!!client?.won,!!server?.won);
 add('rounds',client?.rounds,server?.rounds);
 add('player_hp_start',client?.player_hp_start,server?.player_hp_start);
 add('player_hp_end',client?.player_hp_end,server?.player_hp_end);
 add('enemy_hp_start',client?.enemy_hp_start,server?.enemy_hp_start);
 add('enemy_hp_end',client?.enemy_hp_end,server?.enemy_hp_end);
 add('rng_consumed',client?.rng_consumed,server?.rng_consumed);
 const cs=client?.snapshot||{},ss=server?.snapshot||{};
 add('snapshot.level',cs.level,ss.level);
 add('snapshot.primary_stat',cs.primary_stat,ss.primary_stat,.0001);
 add('snapshot.max_hp',cs.max_hp,ss.max_hp);
 add('snapshot.base_crit',cs.base_crit,ss.base_crit,.000001);
 add('snapshot.enemy_hp',cs?.dungeon?.enemy_hp,ss?.dungeon?.enemy_hp);
 add('snapshot.enemy_attack',cs?.dungeon?.enemy_attack,ss?.dungeon?.enemy_attack);
 add('snapshot.player_factor',cs?.dungeon?.player_factor,ss?.dungeon?.player_factor,.000001);
 add('snapshot.enemy_factor',cs?.dungeon?.enemy_factor,ss?.dungeon?.enemy_factor_after_scroll,.000001);
 for(const k of ['staerke','geschick','intelligenz','ausdauer','glueck','ruestung'])add('snapshot.attrs.'+k,cs?.attrs?.[k],ss?.attrs?.[k],.0001);
 const cr=Array.isArray(client?.replay)?client.replay:[],sr=Array.isArray(server?.replay)?server.replay:[];
 add('replay.length',cr.length,sr.length);
 const n=Math.min(cr.length,sr.length,20);
 for(let i=0;i<n;i++){
  add(`replay.${i}.side`,cr[i]?.side,sr[i]?.side);
  add(`replay.${i}.damage`,cr[i]?.damage,sr[i]?.damage);
  add(`replay.${i}.heal`,cr[i]?.heal||0,sr[i]?.heal||0);
  add(`replay.${i}.player_hp`,cr[i]?.player_hp,sr[i]?.player_hp);
  add(`replay.${i}.enemy_hp`,cr[i]?.enemy_hp,sr[i]?.enemy_hp);
  add(`replay.${i}.rng_used`,cr[i]?.rng_used,sr[i]?.rng_used);
  if(cr[i]?.side==='player')add(`replay.${i}.base_damage`,cr[i]?.base_damage,sr[i]?.handler_base);
  else add(`replay.${i}.base_damage`,cr[i]?.base_damage,sr[i]?.base_damage);
 }
 return {ok:mismatches.length===0,mismatch_count:mismatches.length,mismatches};
}

async function rpc(name,args){
 const x=db();if(!x)throw new Error('SERVER_OFFLINE');
 const {data,error}=await x.rpc(name,args);if(error)throw error;return Array.isArray(data)?data[0]:data;
}
async function run({submit=true}={}){
 if(S.running)return S.last;
 S.running=true;S.lastError='';
 try{
  const st=state();
  if(!st||String(st.playerClass||'')!=='summoner')return null;
  const rng=tape();
  const client=simulateClient(DI,RI,rng);
  const server=await rpc('v7050_summoner_shadow_reference',{p_dungeon_index:DI,p_room_index:RI,p_rng:rng});
  const cmp=compare(client,server);
  const report={
   version:VERSION,at:new Date().toISOString(),scope:'read-only-synthetic-dungeon',
   dungeon:{index:DI,room:RI},comparison:cmp,
   client:{won:client.won,rounds:client.rounds,player_hp_end:client.player_hp_end,enemy_hp_end:client.enemy_hp_end,rng_consumed:client.rng_consumed,snapshot:client.snapshot},
   server:{won:!!server?.won,rounds:Number(server?.rounds)||0,player_hp_end:Number(server?.player_hp_end)||0,enemy_hp_end:Number(server?.enemy_hp_end)||0,rng_consumed:Number(server?.rng_consumed)||0,snapshot:server?.snapshot||null}
  };
  if(submit){
   try{
    const ack=await rpc('v7050_submit_dungeon_parity',{
     p_client_version:VERSION,
     p_dungeon_index:DI,
     p_room_index:RI,
     p_ok:cmp.ok,
     p_mismatch_count:cmp.mismatch_count,
     p_report:report
    });
    report.report_id=ack?.report_id||null;
   }catch(e){report.submit_error=String(e?.message||e)}
  }
  S.last=report;S.done=true;
  console.info('[V7050] dungeon parity shadow',report);
  return report;
 }catch(e){
  S.lastError=String(e?.message||e);S.last={version:VERSION,ok:false,error:S.lastError,at:new Date().toISOString()};
  console.warn('[V7050] dungeon parity shadow failed',e);
  return S.last;
 }finally{S.running=false}
}

window.v7050DungeonParityDiagnostics=()=>clone({...S,version:VERSION});
window.v7050RunDungeonParity=opts=>run(opts||{});
/* V7.094 production: synthetic parity remains manual via v7050RunDungeonParity(). */
})();
