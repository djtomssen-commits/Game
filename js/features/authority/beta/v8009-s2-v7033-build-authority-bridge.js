/* ===== V7.033 staged server-authoritative build bridge =====
   - Server authority is enabled only for accounts explicitly flagged by the backend.
   - Other accounts keep the existing V6.347 local behavior unchanged.
   - Attributes, legacy class skills and talent spending become server-first.
   - Item authority remains shadow-only for now; no item/equipment path is changed here.
*/
(function(){
 'use strict';
 if(window.__V7033_BUILD_AUTHORITY_BRIDGE__)return;
 window.__V7033_BUILD_AUTHORITY_BRIDGE__=true;

 const bridge={
  version:'V7.033',
  uid:'',
  ready:false,
  enabled:false,
  confirmedEnabled:false,
  gate:null,
  lastError:'',
  hydratedAt:0,
  actionCount:0
 };
 let gatePromise=null,gateUid='';
 let actionChain=Promise.resolve();

 function currentUid(){
  try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}
 }
 function db(){
  try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}
 }
 function deep(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return v}}
 function notify(title,type='info',detail=''){
  try{if(typeof v063Toast==='function')return v063Toast(title,type,detail)}catch(_){ }
  try{if(type==='error'&&typeof v115Alert==='function')return v115Alert(detail||title,title,'error')}catch(_){ }
  if(type==='error')console.error('[V7033]',title,detail);else console.log('[V7033]',title,detail);
 }
 function reasonText(reason){
  const map={
   NO_ATTRIBUTE_POINTS:'Keine Attributpunkte verfügbar.',
   INVALID_ATTRIBUTE:'Ungültiges Attribut.',
   NO_SKILL_POINTS:'Keine Skillpunkte verfügbar.',
   SKILL_MAXED:'Dieser Skill ist bereits maximal.',
   SKILL_LOCKED_OR_INVALID:'Dieser Skill ist noch gesperrt oder ungültig.',
   NO_TALENT_POINTS:'Keine Talentpunkte verfügbar.',
   TALENT_MAXED:'Dieses Talent ist bereits maximal.',
   TALENT_LOCKED_OR_INVALID:'Dieses Talent ist noch gesperrt oder erfüllt die Voraussetzungen nicht.',
   NO_TALENTS_SPENT:'Es wurden noch keine Talentpunkte verteilt.',
   INSUFFICIENT_GOLD:'Nicht genug Gold für den Talent-Reset.',
   CLASS_REQUIRED:'Für diese Aktion muss zuerst eine Klasse gewählt sein.',
   BUILD_GUARD_NOT_ENABLED:'Server-Buildschutz ist für diesen Account noch nicht aktiviert.',
   GOLD_GUARD_NOT_ENABLED:'Server-Goldschutz ist für diesen Account noch nicht aktiviert.'
  };
  return map[String(reason||'')]||String(reason||'Server hat die Änderung abgelehnt.');
 }
 function persistServerBuild(){
  /* V7.091: the server RPC already committed the canonical build state.
     Keep only a local account mirror here. A second full player_saves write would
     run every legacy save trigger again and made attribute/talent clicks stall. */
  try{
   if(typeof KEY!=='undefined'&&KEY)localStorage.setItem(KEY,JSON.stringify(s));
   if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal();
   /* If there was no unrelated unsaved local change, teach the legacy save
      monitor that this server-applied state is already durable. */
   if(typeof v213Comparable==='function'&&typeof v213Dirty!=='undefined'&&!v213Dirty){
    v213LastComparable=v213Comparable(s);
   }
   return true;
  }catch(e){console.warn('[V7033] local authority mirror',e);return false}
 }
 function repaint(kind='full'){
  if(window.v7206StartupBusy?.())return;
  /* Attribute/talent clicks must never rebuild the entire character/inventory tree.
     Paint only the owner that changed, then update the hamburger badge immediately. */
  if(kind==='attribute'){
   try{window.v4140PaintAttributes?.()}catch(_){}
   try{window.v434PaintAttributePoints?.()}catch(_){}
   try{window.v446PaintCombatPower?.()}catch(_){}
   try{window.v069SyncCurrencies?.()}catch(_){}
   try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}
   return;
  }
  if(kind==='build'){
   try{renderSkillTree?.()}catch(_){}
   try{window.v434PaintAttributePoints?.()}catch(_){}
   try{window.v446PaintCombatPower?.()}catch(_){}
   try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}
   return;
  }
  if(kind==='hydrate'){
   try{window.v4140PaintAttributes?.()}catch(_){}
   try{renderSkillTree?.()}catch(_){}
   try{window.v434PaintAttributePoints?.()}catch(_){}
   try{window.v446PaintCombatPower?.()}catch(_){}
   try{window.v4162PaintMenuAttentionLocal?.()}catch(_){}
   return;
  }
 }
 function selectedBuildSnapshot(){
  try{return JSON.stringify({
   playerClass:s?.playerClass||null,
   attrs:s?.attrs||{},
   points:Number(s?.points)||0,
   classSkills:s?.classSkills||{},
   skillPoints:Number(s?.skillPoints)||0,
   talents:s?.v314Talents||{}
  })}catch(_){return ''}
 }
 function applyAuthorityState(row,{persist=true,includeGold=false}={}){
  if(!row||!row.build_guard)return false;
  const before=selectedBuildSnapshot();
  try{
   if(row.player_class){s.playerClass=String(row.player_class);s.classLocked=true}
   if(row.attrs&&typeof row.attrs==='object')s.attrs=deep(row.attrs);
   if(Number.isFinite(Number(row.points)))s.points=Math.max(0,Number(row.points));
   if(row.class_skills&&typeof row.class_skills==='object')s.classSkills=deep(row.class_skills);
   if(Number.isFinite(Number(row.skill_points)))s.skillPoints=Math.max(0,Number(row.skill_points));
   if(row.talents&&typeof row.talents==='object')s.v314Talents=deep(row.talents);
   if(includeGold&&Number.isFinite(Number(row.gold)))s.gold=Math.max(0,Number(row.gold));
  }catch(e){console.warn('[V7033] apply state',e);return false}
  const changed=before!==selectedBuildSnapshot();
  bridge.hydratedAt=Date.now();
  if(changed)repaint('hydrate');
  if(changed&&persist)persistServerBuild();
  return changed;
 }
 function resetGate(){
  bridge.uid=currentUid();
  bridge.ready=false;
  bridge.enabled=false;
  bridge.confirmedEnabled=false;
  bridge.gate=null;
  bridge.lastError='';
  gatePromise=null;
  gateUid='';
 }
 async function loadGate(force=false){
  const id=currentUid(),client=db();
  if(!id||!client)return null;
  if(bridge.uid!==id)resetGate();
  if(!force&&bridge.ready&&bridge.uid===id&&bridge.gate)return bridge.gate;
  if(gatePromise&&gateUid===id)return gatePromise;

  const requestUid=id;
  gateUid=requestUid;
  const p=(async()=>{
   try{
    const {data,error}=await client.rpc('v7033_client_authority_state');
    if(error)throw error;
    /* Account changed while this RPC was in flight: never apply the old build. */
    if(currentUid()!==requestUid)return null;
    const row=Array.isArray(data)?data[0]:data;
    if(!row?.ok)throw new Error('Authority state unavailable');
    bridge.uid=requestUid;
    bridge.ready=true;
    bridge.gate=row;
    bridge.enabled=!!row.build_bridge_enabled;
    bridge.confirmedEnabled=bridge.enabled;
    bridge.lastError='';
    if(bridge.enabled)applyAuthorityState(row,{persist:true,includeGold:false});
    return row;
   }catch(e){
    if(currentUid()!==requestUid)return null;
    bridge.lastError=String(e?.message||e||'');
    console.warn('[V7033] authority gate',e);
    return bridge.confirmedEnabled?bridge.gate:null;
   }finally{
    if(gatePromise===p){gatePromise=null;gateUid=''}
   }
  })();
  gatePromise=p;
  return p;
 }
 function enqueue(fn){
  const task=()=>Promise.resolve().then(fn);
  actionChain=actionChain.then(task,task);
  return actionChain;
 }
 async function rpc(name,args){
  const client=db();
  if(!client)throw new Error('SERVER_NOT_READY');
  const wd=window.__GL_RUNTIME_WATCHDOG__?.begin?.(
    name==='v6357_spend_attribute'?'attribute_point':'build_rpc',
    {rpc:name,screen:'character'},
    {slowMs:name==='v6357_spend_attribute'?900:1400,stallMs:4500}
  );
  try{
   const {data,error}=await client.rpc(name,args||{});
   if(error)throw error;
   wd?.end?.({ok:true});
   return Array.isArray(data)?data[0]:data;
  }catch(e){wd?.fail?.(e);throw e}
 }
 async function useAuthorityOrFallback(base,ctx,args,serverFn){
  const gate=await loadGate(false);
  if(!gate?.build_bridge_enabled){
   return typeof base==='function'?base.apply(ctx,args):false;
  }
  try{
   const out=await serverFn();
   bridge.actionCount++;
   return out;
  }catch(e){
   bridge.lastError=String(e?.message||e||'');
   console.error('[V7033] authoritative build action failed',e);
   notify('Server-Änderung nicht gespeichert','error','Die Änderung wurde nicht lokal ausgeführt, damit dein Build nicht auseinanderläuft. '+bridge.lastError);
   try{await loadGate(true)}catch(_){ }
   return false;
  }
 }
 function rejectRow(row){
  if(row?.ok!==false)return false;
  notify('Änderung abgelehnt','warn',reasonText(row.reason));
  return true;
 }

 /* Attribute */
 try{
  const base=window.incAttr;
  if(typeof base==='function'){
   window.incAttr=function(k){
    const ctx=this,args=arguments,attr=String(k||'');
    return enqueue(()=>useAuthorityOrFallback(base,ctx,args,async()=>{
     const row=await rpc('v6357_spend_attribute',{p_attr:attr});
     if(rejectRow(row)){
      if(row?.attrs)s.attrs=deep(row.attrs);
      if(Number.isFinite(Number(row?.points)))s.points=Math.max(0,Number(row.points));
      repaint('attribute');
      return false;
     }
     if(row?.attrs)s.attrs=deep(row.attrs);
     if(Number.isFinite(Number(row?.points)))s.points=Math.max(0,Number(row.points));
     persistServerBuild();repaint('attribute');
     return true;
    }));
   };
   try{incAttr=window.incAttr}catch(_){ }
  }
 }catch(e){console.warn('[V7033] incAttr wrap',e)}

 /* Legacy class skill */
 try{
  const base=window.upgradeSkill;
  if(typeof base==='function'){
   window.upgradeSkill=function(id){
    const ctx=this,args=arguments,skill=String(id||'');
    return enqueue(()=>useAuthorityOrFallback(base,ctx,args,async()=>{
     const row=await rpc('v6357_upgrade_legacy_skill',{p_skill:skill});
     if(rejectRow(row)){
      if(row?.class_skills)s.classSkills=deep(row.class_skills);
      if(Number.isFinite(Number(row?.skill_points)))s.skillPoints=Math.max(0,Number(row.skill_points));
      repaint('build');
      return false;
     }
     if(row?.class_skills)s.classSkills=deep(row.class_skills);
     if(Number.isFinite(Number(row?.skill_points)))s.skillPoints=Math.max(0,Number(row.skill_points));
     persistServerBuild();repaint('build');
     return true;
    }));
   };
   try{upgradeSkill=window.upgradeSkill}catch(_){ }
  }
 }catch(e){console.warn('[V7033] upgradeSkill wrap',e)}

 /* Talent point */
 try{
  const base=window.v314Upgrade;
  if(typeof base==='function'){
   window.v314Upgrade=function(branch,kind,i){
    const ctx=this,args=arguments,b=String(branch||''),k=String(kind||''),idx=Number(i);
    return enqueue(()=>useAuthorityOrFallback(base,ctx,args,async()=>{
     const row=await rpc('v6357_upgrade_talent',{p_branch:b,p_kind:k,p_index:idx});
     if(rejectRow(row)){
      if(row?.talents)s.v314Talents=deep(row.talents);
      repaint('build');
      return false;
     }
     if(row?.talents)s.v314Talents=deep(row.talents);
     persistServerBuild();repaint('build');
     return true;
    }));
   };
   try{v314Upgrade=window.v314Upgrade}catch(_){ }
  }
 }catch(e){console.warn('[V7033] talent wrap',e)}

 /* Talent reset + server-authoritative gold debit. */
 try{
  const base=window.v314Reset;
  if(typeof base==='function'){
   window.v314Reset=function(){
    const ctx=this,args=arguments;
    return enqueue(async()=>{
     const gate=await loadGate(false);
     if(!gate?.build_bridge_enabled)return base.apply(ctx,args);
     if(!gate.gold_guard){
      notify('Talent-Reset noch lokal','info','Der Server-Goldschutz ist für diesen Account noch nicht freigeschaltet.');
      return base.apply(ctx,args);
     }
     const cost=Math.max(500,Math.round((Number(s?.level)||1)*500));
     let yes=false;
     try{
      yes=typeof v115Confirm==='function'
       ? await v115Confirm(`Talentbaum für ${cost.toLocaleString('de-DE')} Gold zurücksetzen?`,{title:'Talentbaum zurücksetzen',type:'confirm',okText:'Zurücksetzen'})
       : window.confirm(`Talentbaum für ${cost.toLocaleString('de-DE')} Gold zurücksetzen?`);
     }catch(_){yes=false}
     if(!yes)return false;
     try{
      const row=await rpc('v6357_reset_talents',{});
      if(rejectRow(row))return false;
      if(row?.talents)s.v314Talents=deep(row.talents);
      if(Number.isFinite(Number(row?.gold)))s.gold=Math.max(0,Number(row.gold));
      persistServerBuild();repaint('build');bridge.actionCount++;
      return true;
     }catch(e){
      bridge.lastError=String(e?.message||e||'');
      notify('Talent-Reset nicht gespeichert','error','Der Reset wurde nicht lokal ausgeführt. '+bridge.lastError);
      return false;
     }
    });
   };
   try{v314Reset=window.v314Reset}catch(_){ }
  }
 }catch(e){console.warn('[V7033] reset wrap',e)}

 window.v7033BuildAuthorityRefresh=(force=false)=>loadGate(!!force);
 window.v7033BuildAuthorityDiagnostics=()=>({
  version:bridge.version,
  uid:bridge.uid,
  ready:bridge.ready,
  enabled:bridge.enabled,
  confirmedEnabled:bridge.confirmedEnabled,
  mode:bridge.gate?.mode||null,
  buildGuard:!!bridge.gate?.build_guard,
  goldGuard:!!bridge.gate?.gold_guard,
  buildRevision:Number(bridge.gate?.build_revision)||0,
  actionCount:bridge.actionCount,
  hydratedAt:bridge.hydratedAt,
  lastError:bridge.lastError
 });

 function boot(){
  const id=currentUid();
  if(bridge.uid&&bridge.uid!==id)resetGate();
  if(id&&db()&&!window.v7206StartupBusy?.())void loadGate(false);
 }
 window.addEventListener('growlegends:account-ready',()=>boot());
 window.addEventListener('growlegends:foreground-ready',()=>setTimeout(()=>void loadGate(true),120),{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')void loadGate(false)},{passive:true});
 window.addEventListener('pageshow',()=>setTimeout(boot,350),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(boot,350)},{passive:true});
 setTimeout(boot,1800);
})();
