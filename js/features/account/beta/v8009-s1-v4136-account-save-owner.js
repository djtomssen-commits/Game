(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const ACCOUNT_PREFIX='growLegendsAccountSave:';
 const BEST_PREFIX='growLegendsBestSave:';
 const FLOOR_PREFIX='growLegendsProgressFloor:';
 const ID_PREFIX='growLegendsCharacterIdentity:';
 let flushPromise=null, profileGuardBusy=false, profileCache=null, profileCacheAt=0, lastWarn='', lastWarnAt=0;

 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
 function clean(x){try{return typeof v071CleanName==='function'?v071CleanName(x):String(x||'').trim()}catch(e){return String(x||'').trim()}}
 function validName(x){try{return typeof v071NameValid==='function'?v071NameValid(x):clean(x).length>=2}catch(e){return clean(x).length>=2}}
 function complete(x=s){try{return !!(x&&x.playerClass&&x.characterNameSet&&validName(x.characterName))}catch(e){return false}}
 function owner(x){return String(x?.__accountOwnerId||'')}
 function socialOwner(x){return String(x?.social?.playerId||'')}
 function owned(x,id,allowMissing=false){
  if(!x||!id)return false;const o=owner(x),so=socialOwner(x);
  if(o&&o!==id)return false;if(so&&so!==id)return false;
  return allowMissing?true:(o===id&&so===id);
 }
 function sameIdentity(a,b){
  if(!a||!b)return false;
  return clean(a.characterName).toLocaleLowerCase()===clean(b.characterName).toLocaleLowerCase() && String(a.playerClass||'')===String(b.playerClass||'');
 }
 function profileMatchesState(p,x=s){return !!p&&!!x&&clean(p.character_name).toLocaleLowerCase()===clean(x.characterName).toLocaleLowerCase()&&String(p.class_id||'')===String(x.playerClass||'')}
 function level(x){return Math.max(1,Math.floor(Number(x?.level)||1))}
 function savedAt(x){return Math.max(0,Number(x?.__savedAt)||0)}
 function rev(x){return Math.max(0,Number(x?.__saveRevision)||0)}
 function clone(x){try{return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))}catch(e){try{return JSON.parse(JSON.stringify(x))}catch(_){return null}}}
 function scopedKey(id){try{return typeof v200ScopedKey==='function'?v200ScopedKey(id):ACCOUNT_PREFIX+id}catch(e){return ACCOUNT_PREFIX+id}}
 function serverId(){try{return String(window.v343CurrentServer||s?.__serverId||'beta')}catch(e){return'beta'}}
 function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
 function warnOnce(title,detail){const k=title+'|'+detail,now=Date.now();if(k===lastWarn&&now-lastWarnAt<30000)return;lastWarn=k;lastWarnAt=now;try{v063Toast(title,'warn',detail)}catch(e){}}

 function stampOwnedSnapshot(x,id){
  const y=clone(x);if(!y||!id)return null;
  y.__accountOwnerId=id;y.social=(y.social&&typeof y.social==='object')?y.social:{};y.social.playerId=id;
  return y;
 }
 function writeLocalCanonical(id,x=s){
  if(!id||!complete(x)||!owned(x,id,false))return false;
  try{
   const snap=stampOwnedSnapshot(x,id);if(!snap)return false;
   const oldRev=Math.max(0,Number(snap.__saveRevision)||0);
   snap.__saveRevision=oldRev+1;snap.__savedAt=Date.now();
   Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,clone(snap));
   localStorage.setItem(KEY,JSON.stringify(snap));
   localStorage.setItem(scopedKey(id),JSON.stringify(snap));
   localStorage.setItem(ID_PREFIX+id,JSON.stringify({userId:id,name:clean(snap.characterName),classId:String(snap.playerClass||''),lockedAt:Date.now()}));
   return true;
  }catch(e){console.error('V4.159 canonical local save',e);return false}
 }

 async function initDb(){try{if(typeof v073Init==='function')await v073Init();return typeof v073Db!=='undefined'&&!!v073Db}catch(e){return false}}
 async function readCloud(id){
  try{if(!id||uid()!==id||!(await initDb()))return null;const {data,error}=await v073Db.from('player_saves').select('save_data,updated_at').eq('user_id',id).maybeSingle();if(error)throw error;return data||null}catch(e){console.warn('V4.159 cloud read',e);return null}
 }
 async function readProfile(id,force=false){
  try{
   if(!id||uid()!==id||!(await initDb()))return null;
   if(!force&&profileCache&&Date.now()-profileCacheAt<2500&&String(profileCache.id||'')===id)return profileCache;
   const {data,error}=await v073Db.from('profiles').select('id,character_name,class_id,class_name,level').eq('id',id).maybeSingle();if(error)throw error;
   profileCache=data||null;profileCacheAt=Date.now();return profileCache;
  }catch(e){console.warn('V4.159 profile read',e);return null}
 }

 function chooseSameIdentity(rows,anchor){
  const xs=rows.filter(r=>complete(r.data)&&sameIdentity(r.data,anchor));if(!xs.length)return null;
  xs.sort((a,b)=>level(b.data)-level(a.data)||savedAt(b.data)-savedAt(a.data)||rev(b.data)-rev(a.data)||(a.source==='cloud'?-1:b.source==='cloud'?1:0));
  return xs[0];
 }
 function finalPick(id,cloudData,scoped,current){
  id=String(id||'');const rows=[];
  const add=(source,data,containerTrusted=false)=>{if(!data||typeof data!=='object'||!owned(data,id,containerTrusted))return;const d=stampOwnedSnapshot(data,id);if(d)rows.push({source,data:d})};
  add('cloud',cloudData,true);add('local',scoped,true);add('current',current,false);
  const cloud=rows.find(r=>r.source==='cloud'&&complete(r.data));
  const local=rows.find(r=>r.source==='local'&&complete(r.data));
  const cur=rows.find(r=>r.source==='current'&&complete(r.data));
  const anchor=cloud?.data||local?.data||cur?.data||null;
  if(anchor){const best=chooseSameIdentity(rows,anchor);if(best)return best}
  const anyComplete=rows.filter(r=>complete(r.data)).sort((a,b)=>(a.source==='cloud'?-1:b.source==='cloud'?1:0)||savedAt(b.data)-savedAt(a.data)||rev(b.data)-rev(a.data));
  if(anyComplete.length)return anyComplete[0];
  return rows.find(r=>r.source==='cloud')||rows.find(r=>r.source==='local')||rows.find(r=>r.source==='current')||null;
 }
 try{
  v213PickNewestSave=finalPick;window.v213PickNewestSave=finalPick;window.__v4136Picker=true;
 }catch(e){window.v213PickNewestSave=finalPick}

 function recoveryCandidates(id,anchor){
  const rows=[];const seen=new Set();
  function add(source,x,containerTrusted=false){
   if(!x||typeof x!=='object'||!owned(x,id,containerTrusted)||!complete(x))return;
   const d=stampOwnedSnapshot(x,id);if(!d||!sameIdentity(d,anchor))return;
   const sig=[clean(d.characterName).toLowerCase(),d.playerClass,level(d),savedAt(d),rev(d)].join('|');if(seen.has(sig))return;seen.add(sig);rows.push({source,data:d});
  }
  add('current',s,false);add('scoped',readJson(scopedKey(id)),true);
  try{
   for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i)||'';
    if(k===BEST_PREFIX+id+':server:'+serverId())add('best',readJson(k),false);
    else if(k.startsWith(ACCOUNT_PREFIX+id+':server:'))add('account-server',readJson(k),true);
   }
  }catch(e){}
  rows.sort((a,b)=>level(b.data)-level(a.data)||savedAt(b.data)-savedAt(a.data)||rev(b.data)-rev(a.data));return rows;
 }
 async function restoreForMatchingProfile(id,p){
  if(!id||!p)return false;
  const anchor={characterName:clean(p.character_name),playerClass:String(p.class_id||'')};
  if(!validName(anchor.characterName)||!anchor.playerClass)return false;
  const cloud=await readCloud(id);const rows=[];
  if(cloud?.save_data&&owned(cloud.save_data,id,true)&&complete(cloud.save_data)&&sameIdentity(cloud.save_data,anchor))rows.push({source:'cloud',data:stampOwnedSnapshot(cloud.save_data,id)});
  rows.push(...recoveryCandidates(id,anchor));
  rows.sort((a,b)=>level(b.data)-level(a.data)||savedAt(b.data)-savedAt(a.data)||rev(b.data)-rev(a.data));
  const best=rows[0];if(!best||level(best.data)<Math.max(1,Number(p.level)||1))return false;
  try{
   if(typeof v075ApplyCloudSave==='function'){const ok=await v075ApplyCloudSave(clone(best.data));if(!ok)return false}
   else{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,clone(best.data));try{render()}catch(e){}}
   writeLocalCanonical(id,s);return true;
  }catch(e){console.warn('V4.159 recovery apply',e);return false}
 }

 async function directCloudWrite(id){
  if(!id||uid()!==id||!complete(s)||!owned(s,id,false)||!(await initDb()))return false;
  try{
   writeLocalCanonical(id,s);const snap=stampOwnedSnapshot(s,id),now=new Date().toISOString();
   const {error}=await v073Db.from('player_saves').upsert({user_id:id,save_data:snap,updated_at:now},{onConflict:'user_id'});if(error)throw error;
   try{v075CloudLoadedFor=id;v200LastCloudStamp=now}catch(e){}
   const row=await readCloud(id);return !!row?.save_data&&complete(row.save_data)&&owned(row.save_data,id,true)&&sameIdentity(row.save_data,snap);
  }catch(e){console.warn('V4.159 direct cloud write',e);return false}
 }

 function clearContaminatedHighWater(id){
  if(!id)return;
  try{
   localStorage.removeItem(BEST_PREFIX+id+':server:'+serverId());
   localStorage.removeItem(FLOOR_PREFIX+id+':server:'+serverId());
  }catch(e){}
 }

 async function resetOwnProfileForConfirmedNewCharacter(id){
  /* V4.159: profiles is ONLY a public mirror. Never delete the profile row from the
     client after saving a character. A delete can invalidate/cascade related account
     data depending on the database relation, and it is not required for player_saves. */
  if(!id||uid()!==id||!complete(s)||!owned(s,id,false))return false;
  try{
   const p=await readProfile(id,true),curLevel=level(s);
   if(!p)return true;
   if(!profileMatchesState(p,s)){
    warnOnce('Profil-Spiegel vorerst übersprungen','Der Account-Spielstand ist gespeichert. Eine alte Profilzeile wird nicht gelöscht und darf den Charakter nicht beeinflussen.');
    return true;
   }
   if(Math.max(1,Number(p.level)||1)>curLevel){
    warnOnce('Profil-Spiegel vorerst übersprungen',`Profil zeigt Level ${Math.max(1,Number(p.level)||1)}, Account-Spielstand Level ${curLevel}. player_saves bleibt maßgeblich.`);
    return true;
   }
   return true;
  }catch(e){console.warn('V4.159 profile mirror check',e);return true}
 }

 /* Final profile guard: never send a lower level into the integrity trigger. If the
    higher server profile belongs to THIS same identity, restore a full same-identity
    snapshot first. If it is a stale different identity, only the explicit fresh-character
    reset path may replace that mirror. */
 try{
  if(typeof v073SyncProfile==='function'){
   const baseSync=v073SyncProfile;
   v073SyncProfile=async function(force=false){
    const id=uid();if(!id||!complete(s)||!owned(s,id,false))return false;
    if(profileGuardBusy)return true;
    profileGuardBusy=true;
    try{
     const p=await readProfile(id,false),pl=Math.max(1,Number(p?.level)||1),ll=level(s);
     /* V4.159: profile mirror problems must NEVER block player_saves. The historical
        v075WriteCloudSave() aborts its real save when v073SyncProfile() returns false.
        Therefore a stale/higher/mismatching public profile is treated as "mirror skipped"
        while the account-owned player_saves continues. */
     if(p&&pl>ll){
      if(profileMatchesState(p,s))warnOnce('Profil-Spiegel übersprungen',`Profil Level ${pl}, Account-Spielstand Level ${ll}. Der vollständige player_saves-Spielstand bleibt maßgeblich.`);
      else warnOnce('Profil-Spiegel übersprungen','Die vorhandene Profilzeile gehört nicht zur geladenen Charakter-Identität. Sie wird weder übernommen noch gelöscht.');
      return true;
     }
     if(p&&!profileMatchesState(p,s)){
      warnOnce('Profil-Spiegel übersprungen','Die vorhandene Profilzeile gehört nicht zur geladenen Charakter-Identität. player_saves wird trotzdem normal gespeichert.');
      return true;
     }
     return await baseSync.apply(this,arguments);
    }finally{profileGuardBusy=false}
   };
   try{window.v073SyncProfile=v073SyncProfile}catch(e){}
  }
 }catch(e){console.warn('V4.159 profile guard install',e)}

 async function v7274EnsureCharacterReady(id){
  id=String(id||'');
  if(!id||uid()!==id)return false;
  try{if(typeof serverId==='function'&&serverId()!=='beta')return true}catch(_){}
  if(typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function')return false;
  try{
   const call=v073Db.rpc('v7274_ensure_character_ready',{});
   const {data,error}=await Promise.race([
    call,
    new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:v7274_ensure_character_ready')),12000))
   ]);
   if(error)throw error;
   const r=Array.isArray(data)?(data[0]??null):data;
   window.__V7275_CHARACTER_READY_RESULT__=r||null;
   if(r?.reason==='CHARACTER_NOT_CREATED')return false;
   if(!r?.ok||r?.ready!==true){console.warn('[V7.276] beta character authority incomplete',r);return false}
   window.__V7274_CHARACTER_READY_FOR__=id;
   return true;
  }catch(e){
   console.warn('[V7.276] ensure character ready',e);
   return false;
  }
 }
 try{window.v7274EnsureCharacterReady=v7274EnsureCharacterReady}catch(_){}

 async function v7275CreateCharacterServer(id,name,classId){
  id=String(id||'');name=clean(name);classId=String(classId||'');
  if(!id||uid()!==id||!validName(name)||!classId)return {ok:false,reason:'INVALID_CHARACTER'};
  if(!(await initDb()))return {ok:false,reason:'SERVER_NOT_READY'};
  try{
   const req=v073Db.rpc('gl_create_character',{p_name:name,p_class:classId});
   const {data,error}=await Promise.race([
    req,
    new Promise((_,rej)=>setTimeout(()=>rej(new Error('RPC_TIMEOUT:gl_create_character')),18000))
   ]);
   if(error)throw error;
   const r=Array.isArray(data)?(data[0]??null):data;
   if(!r||typeof r!=='object')return {ok:false,reason:'EMPTY_RESPONSE'};
   /* Beta returns ready=true; Server1 returns initialized=true for the same
      completed atomic creation contract. Normalize that transport detail here. */
   if(serverId()==='server1'&&r.ok===true&&r.initialized===true&&r.ready==null){
    return {...r,ready:true};
   }
   return r;
  }catch(e){
   console.warn('[V7.276] atomic character create',e);
   return {ok:false,reason:String(e?.message||e)};
  }
 }
 try{window.v7275CreateCharacterServer=v7275CreateCharacterServer}catch(_){}

 async function flushNewCharacter(id,name,classId){
  const r=await v7275CreateCharacterServer(id,name,classId);
  if(!r?.ok||r?.ready!==true)return false;
  try{
   /* The server owns creation. Once the transaction succeeds, resolve the account
      through the normal server-first login path so every canonical domain is hydrated
      before the world is shown. No player_saves retry/read-back loop is used. */
   v075CloudLoadedFor=null;
   const ok=typeof window.v075ResolveCloudAfterLogin==='function'?await window.v075ResolveCloudAfterLogin():false;
   if(!ok)return false;
   clearContaminatedHighWater(String(id||''));
   return complete(s)&&owned(s,String(id||''),false)&&sameIdentity(s,{characterName:name,playerClass:classId});
  }catch(e){console.warn('[V7.276] post-create resolve',e);return false}
 }
 window.v4136FlushNewCharacter=flushNewCharacter;

 function finishCreated(name,classId){
  const id=uid();
  try{v200ClearCharacterModals()}catch(e){}
  try{v071ApplyNameToUi()}catch(e){}
  try{v200OpenHome()}catch(e){}
  try{v063Toast(`${name} wurde erstellt`,'success',`${classes?.[classId]?.name||'Klasse'}`)}catch(e){}
  /* The account-ready event was intentionally suppressed while no character existed.
     Emit it now, after the atomic character create + canonical resolve completed. */
  setTimeout(()=>{
   try{window.dispatchEvent(new CustomEvent('growlegends:account-ready',{detail:{uid:id,phase:'account-ready',reason:'character-created'}}))}catch(_){ }
   try{window.v4147RunExtras?.()}catch(_){ }
  },220);
 }
 function creatorErrorText(reason){
  const r=String(reason||'');
  if(/NAME_TAKEN/i.test(r))return 'Dieser Charaktername ist bereits vergeben.';
  if(/CHARACTER_ALREADY_EXISTS|CLASS_ALREADY_LOCKED|CHARACTER_NAME_ALREADY_LOCKED/i.test(r))return 'Für diesen Account existiert bereits ein Charakter.';
  if(/INVALID_NAME/i.test(r))return 'Bitte einen Namen mit 2–18 Zeichen eingeben.';
  if(/INVALID_CLASS/i.test(r))return 'Diese Klasse ist nicht verfügbar.';
  if(/TIMEOUT|SERVER_NOT_READY|Failed to fetch|network/i.test(r))return 'Server kurz nicht erreichbar. Bitte noch einmal tippen.';
  return 'Charakter konnte nicht erstellt werden. Bitte erneut versuchen.';
 }
 function creator(){
  if(window.__V200_AUTH_READY__!==true)return;if(typeof v200DurableUser==='function'&&!v200DurableUser())return;
  const id=uid();if(!id)return;try{if(String(v075CloudLoadedFor||'')!==id)return}catch(e){return}
  if(!owned(s,id,false))return;
  if(complete(s)){try{v200ClearCharacterModals()}catch(e){};return}
  if(document.querySelector('#v200CharacterModal'))return;try{v200ClearCharacterModals()}catch(e){}
  const modal=document.createElement('div');modal.id='v200CharacterModal';
  modal.innerHTML=`<div class="v200-character-card"><h2>Erstelle deine Legende</h2><div class="v200-character-sub">Wähle Namen und Klasse. Danach geht es direkt in die Spielwelt.</div><div class="v200-character-name"><label>Charaktername</label><input id="v200CharacterName" maxlength="18" autocomplete="off" placeholder="Deinen Namen eingeben"><div id="v200CharacterNameStatus">2–18 Zeichen · muss einzigartig sein</div></div><div class="v200-class-grid">${Object.entries(classes).map(([cid,c])=>`<button type="button" class="v200-class" data-v4136-class="${cid}"><img src="${v080AvatarFor(cid)}" alt="${v073Escape(c.name)}"><div class="v200-class-copy"><b>${v073Escape(c.name)}</b><span>${v073Escape(c.text||'')}</span></div></button>`).join('')}</div></div>`;
  document.body.appendChild(modal);const input=modal.querySelector('#v200CharacterName'),status=modal.querySelector('#v200CharacterNameStatus'),buttons=[...modal.querySelectorAll('[data-v4136-class]')];
  buttons.forEach(btn=>btn.onclick=async()=>{
   const name=clean(input?.value);if(!validName(name)){status.className='error';status.textContent='Bitte einen Namen mit 2–18 Zeichen eingeben.';input?.focus();return}
   buttons.forEach(x=>x.disabled=true);status.className='';
   const classId=String(btn.dataset.v4136Class||'');const ok=await v115Confirm(`${classes[classId].name} als Klasse für ${name} wählen?\n\nDie Klasse kann später nicht gewechselt werden.`,{title:'Charakter erstellen',type:'warn',okText:'Charakter erstellen'});if(!ok){buttons.forEach(x=>x.disabled=false);return}
   if(uid()!==id||window.__V200_AUTH_READY__!==true){status.className='error';status.textContent='Account-Zuordnung hat sich geändert. Bitte neu anmelden.';buttons.forEach(x=>x.disabled=false);return}
   status.textContent='Charakter wird erstellt …';
   const r=await v7275CreateCharacterServer(id,name,classId);
   if(!modal.isConnected)return;
   if(!r?.ok||r?.ready!==true){status.className='error';status.textContent=creatorErrorText(r?.reason||r?.error);buttons.forEach(x=>x.disabled=false);return}
   try{
    v075CloudLoadedFor=null;
    const resolved=typeof window.v075ResolveCloudAfterLogin==='function'?await window.v075ResolveCloudAfterLogin():false;
    if(!resolved)throw new Error('POST_CREATE_LOGIN_FAILED');
    clearContaminatedHighWater(id);
    window.__V4136_NEW_CHARACTER_PENDING__=null;
    finishCreated(name,classId);
   }catch(e){
    console.warn('[V7.276] post-create login',e);
    status.className='error';status.textContent='Charakter ist erstellt. Verbindung wird neu aufgebaut …';
    buttons.forEach(x=>x.disabled=false);
    setTimeout(()=>{try{window.v075ResolveCloudAfterLogin?.().then(ok=>{if(ok)finishCreated(name,classId)})}catch(_){}},800);
   }
  });
  setTimeout(()=>input?.focus(),60);
 }
 try{v029ShowClassChoice=creator;window.v029ShowClassChoice=creator}catch(e){window.v029ShowClassChoice=creator}

 /* V4.159: the login resolver runs exactly once. No second cloud/local candidate
    is applied after finalize; that historical second pass was a source of account drift. */
 try{
  if(typeof v200FinalizeUser==='function'){
   const baseFinalize=v200FinalizeUser;
   v200FinalizeUser=async function(user){
    const r=await baseFinalize.apply(this,arguments);const id=uid();
    if(r&&id&&complete(s)&&owned(s,id,false)){
      writeLocalCanonical(id,s);
    }else if(r&&id&&!complete(s)){
      /* Account finalization is the single onboarding handoff for both Beta
         and Server1. The current v029 creator decides the active server UI. */
      queueMicrotask(()=>{try{window.v029ShowClassChoice?.()}catch(e){console.warn('V4.159 creator handoff',e)}});
    }
    return r;
   };
   try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}
  }
 }catch(e){console.warn('V4.159 finalize install',e)}

 /* Save player_saves directly before logout while auth is intact. Do not make character
    survival depend on the public profiles mirror. */
 try{
  if(typeof v136Logout==='function'){
   const baseLogout=v136Logout;
   let logoutPromise=null;
   v136Logout=function(reason='manual'){
    if(logoutPromise)return logoutPromise;
    const self=this,args=arguments;
    window.__V4136_LOGOUT_PREPARING__=true;
    try{v200AuthBusy=true}catch(_){}
    logoutPromise=(async()=>{
     try{
      const id=uid();if(id&&complete(s)&&owned(s,id,false)&&window.__V200_AUTH_READY__===true){
       const ok=await directCloudWrite(id);if(!ok){try{v063Toast('Abmelden gestoppt','error','Der Account-Spielstand konnte noch nicht bestätigt gespeichert werden.')}catch(e){};return false}
       window.__V4136_NEW_CHARACTER_PENDING__=null;
      }
      return await baseLogout.apply(self,args);
     }finally{
      window.__V4136_LOGOUT_PREPARING__=false;
      try{if(!window.__V301_LOGOUT_IN_PROGRESS__)v200AuthBusy=false}catch(_){}
     }
    })().finally(()=>{logoutPromise=null});
    return logoutPromise;
   };
   try{window.v136Logout=v136Logout}catch(e){}
  }
 }catch(e){console.warn('V4.159 logout install',e)}

 /* Final toast dedupe for legacy integrity errors. The final profile guard prevents new
    downward writes; this also stops already-scheduled historical attempts flooding mobile UI. */
 try{
  if(typeof v063Toast==='function'){
   const baseToast=v063Toast;let lastIntegrity='',lastIntegrityAt=0;
   v063Toast=function(title,type,detail){const all=[title,detail].map(x=>String(x||'')).join(' ');if(/ACCOUNT_INTEGRITY|character level cannot decrease/i.test(all)){const now=Date.now(),k=all.replace(/\s+/g,' ').trim();if(k===lastIntegrity&&now-lastIntegrityAt<30000)return;lastIntegrity=k;lastIntegrityAt=now}return baseToast.apply(this,arguments)};
   try{window.v063Toast=v063Toast}catch(e){}
  }
 }catch(e){}

 function stamp(){}
 stamp();
 window.v4136AccountSaveDiagnostics=async()=>{const id=uid(),cloud=await readCloud(id),p=await readProfile(id,true),scoped=readJson(scopedKey(id));return{version:V.short,uid:id,authReady:window.__V200_AUTH_READY__===true,stateOwned:owned(s,id,false),stateComplete:complete(s),stateLevel:level(s),stateName:clean(s?.characterName),cloudComplete:complete(cloud?.save_data),cloudLevel:level(cloud?.save_data),cloudName:clean(cloud?.save_data?.characterName),scopedComplete:complete(scoped),scopedLevel:level(scoped),profileLevel:Math.max(0,Number(p?.level)||0),profileName:clean(p?.character_name),pending:window.__V4136_NEW_CHARACTER_PENDING__||null}};
})();
