(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 const VERSION=V.label,SHORT=V.short,SCOPED_PREFIX='growLegendsAccountSave:',IDENTITY_PREFIX='growLegendsCharacterIdentity:';
 let serverSaveBusy=false;

 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
 function complete(){try{return !!(typeof v200CharacterComplete==='function'?v200CharacterComplete():(s?.playerClass&&s?.characterNameSet&&String(s?.characterName||'').trim().length>=2))}catch(e){return false}}
 function scopedKey(id){try{return typeof v200ScopedKey==='function'?v200ScopedKey(id):SCOPED_PREFIX+id}catch(e){return SCOPED_PREFIX+id}}
 function owned(id){try{return !!id&&String(s?.__accountOwnerId||'')===id&&String(s?.social?.playerId||'')===id}catch(e){return false}}
 function verified(id){try{return typeof window.v452AccountVerified==='function'?!!window.v452AccountVerified(id):(owned(id)&&String(v075CloudLoadedFor||'')===id)}catch(e){return false}}
 function cloneState(){try{return typeof structuredClone==='function'?structuredClone(s):JSON.parse(JSON.stringify(s))}catch(e){return JSON.parse(JSON.stringify(s||{}))}}

 /* The character creator used to write only generic localStorage first and then made
    cloud persistence conditional on profile sync succeeding. A transient/profile error
    could therefore show "created" while no account-scoped character save existed. */
 function checkpointCharacter(){
  const id=uid();if(!id||!complete()||!owned(id))return false;
  try{
   /* V4.159 HARD RULE: a checkpoint may persist an already-owned state, but it may
      never claim/relabel a foreign in-memory character for the currently signed-in account. */
   const prev=Math.max(0,Number(s.__saveRevision)||0);
   try{if(typeof v213StampState==='function')v213StampState()}catch(e){}
   if((Number(s.__saveRevision)||0)<=prev){s.__saveRevision=prev+1;s.__savedAt=Date.now()}
   else if(!Number(s.__savedAt))s.__savedAt=Date.now();
   const snap=cloneState();snap.__accountOwnerId=id;snap.social=(snap.social&&typeof snap.social==='object')?snap.social:{};snap.social.playerId=id;
   localStorage.setItem(KEY,JSON.stringify(snap));
   localStorage.setItem(scopedKey(id),JSON.stringify(snap));
   localStorage.setItem(IDENTITY_PREFIX+id,JSON.stringify({userId:id,name:String(s.characterName||''),classId:String(s.playerClass||''),lockedAt:Date.now()}));
   try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
   try{if(typeof v145SaveScopedLocal==='function')v145SaveScopedLocal()}catch(e){}
   return true;
  }catch(e){console.error('V4.159 character checkpoint',e);return false}
 }
 window.v4131CheckpointCharacter=checkpointCharacter;

 async function directCloudFallback(){
  const id=uid();if(!id||!complete()||!owned(id)||!verified(id))return false;
  try{
   if(typeof v073Init==='function')await v073Init();
   if(typeof v073Db==='undefined'||!v073Db)return false;
   checkpointCharacter();
   const snap=cloneState();snap.__accountOwnerId=id;snap.social=(snap.social&&typeof snap.social==='object')?snap.social:{};snap.social.playerId=id;
   const now=new Date().toISOString();
   const {error}=await v073Db.from('player_saves').upsert({user_id:id,save_data:snap,updated_at:now},{onConflict:'user_id'});
   if(error)throw error;
   try{v075CloudLoadedFor=id}catch(e){}
   try{v200LastCloudStamp=now}catch(e){}
   checkpointCharacter();
   return true;
  }catch(e){console.warn('V4.159 direct new-character cloud fallback',e);return false}
 }
 window.v4131DirectCharacterCloudSave=directCloudFallback;

 async function saveCharacterServer(){
  if(serverSaveBusy)return false;
  const id=uid();if(!id||!complete()||!owned(id)||!verified(id))return false;
  serverSaveBusy=true;
  try{
   checkpointCharacter();
   let profileOk=false,cloudOk=false;
   try{if(typeof v073SyncProfile==='function')profileOk=!!(await v073SyncProfile(true))}catch(e){console.warn('V4.159 initial profile save',e)}
   /* Always ask the normal cloud writer, even if the separate profile call above failed.
      It owns the usual save chain and remains the preferred path. */
   try{if(typeof v075WriteCloudSave==='function')cloudOk=!!(await v075WriteCloudSave(true))}catch(e){console.warn('V4.159 initial cloud save',e)}
   /* The old writer intentionally refuses player_saves when profile sync returns false.
      For a verified, account-owned NEW character only, preserve the character snapshot
      anyway so the next login cannot fall back to the empty creation state. */
   if(!cloudOk)cloudOk=await directCloudFallback();
   checkpointCharacter();
   if(!profileOk){setTimeout(()=>{try{if(uid()===id&&complete()&&typeof v073SyncProfile==='function')void v073SyncProfile(true)}catch(e){}},1200)}
   if(!cloudOk){setTimeout(async()=>{try{if(uid()!==id||!complete())return;let ok=false;if(typeof v075WriteCloudSave==='function')ok=!!(await v075WriteCloudSave(true));if(!ok)await directCloudFallback()}catch(e){}},1600)}
   return cloudOk||profileOk;
  }finally{serverSaveBusy=false}
 }
 window.v4131SaveCharacterServer=saveCharacterServer;

 function fixedCharacterCreator(){
  if(!window.__V200_AUTH_READY__)return;
  if(typeof v200DurableUser==='function'&&!v200DurableUser())return;
  if(!uid())return;
  try{if(String(v075CloudLoadedFor||'')!==uid())return}catch(e){return}
  /* The creator is allowed to operate only after the current save is proven to belong
     to this exact authenticated account. This blocks cross-account relabeling during login. */
  if(!owned(uid())||!verified(uid()))return;
  if(complete()){try{v200ClearCharacterModals()}catch(e){};checkpointCharacter();return}
  if(document.querySelector('#v200CharacterModal'))return;
  try{v200ClearCharacterModals()}catch(e){}

  const modal=document.createElement('div');modal.id='v200CharacterModal';
  modal.innerHTML=`<div class="v200-character-card"><h2>Erstelle deine Legende</h2><div class="v200-character-sub">Gib deinen Charakternamen ein und wähle deine Klasse. Dieser Schritt erscheint nur einmal.</div><div class="v200-character-name"><label>Charaktername</label><input id="v200CharacterName" maxlength="18" autocomplete="off" placeholder="Deinen Namen eingeben"><div id="v200CharacterNameStatus">2–18 Zeichen · muss einzigartig sein</div></div><div class="v200-class-grid">${Object.entries(classes).map(([id,c])=>`<button type="button" class="v200-class" data-v200-class="${id}"><img src="${v080AvatarFor(id)}" alt="${v073Escape(c.name)}"><div class="v200-class-copy"><b>${v073Escape(c.name)}</b><span>${v073Escape(c.text||'')}</span></div></button>`).join('')}</div></div>`;
  document.body.appendChild(modal);
  const input=modal.querySelector('#v200CharacterName'),status=modal.querySelector('#v200CharacterNameStatus');
  modal.querySelectorAll('[data-v200-class]').forEach(btn=>{btn.onclick=async()=>{
   const name=v071CleanName(input?.value);
   if(!v071NameValid(name)){status.className='error';status.textContent='Bitte einen Namen mit 2–18 Zeichen eingeben.';input?.focus();return}
   modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=true);status.className='';status.textContent='Name wird geprüft …';
   if(!(await v200NameAvailable(name))){modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=false);status.className='error';status.textContent='Dieser Charaktername ist bereits vergeben.';input?.focus();return}
   const classId=btn.dataset.v200Class;
   const ok=await v115Confirm(`${classes[classId].name} als Klasse für ${name} wählen?\n\nDie Klasse kann später nicht gewechselt werden.`,{title:'Charakter erstellen',type:'warn',okText:'Charakter erstellen'});
   if(!ok){modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=false);status.textContent='2–18 Zeichen · muss einzigartig sein';return}
   s.playerClass=classId;s.classLocked=true;s.characterName=name;s.characterNameSet=true;s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=uid();s.__accountOwnerId=uid();
   status.textContent='Charakter wird accountgebunden gespeichert …';
   if(!checkpointCharacter()){
    status.className='error';status.textContent='Spielstand konnte lokal nicht gesichert werden. Bitte erneut versuchen.';
    modal.querySelectorAll('[data-v200-class]').forEach(x=>x.disabled=false);return;
   }
   try{v200ClearCharacterModals()}catch(e){}
   try{v071ApplyNameToUi()}catch(e){}
   try{v200OpenHome()}catch(e){}
   try{v063Toast(`${name} wurde erstellt`,'success',`${classes[classId].name} · Account-Spielstand lokal gesichert`)}catch(e){}
   void saveCharacterServer().then(ok=>{try{if(ok)v063Toast('☁️ Charakter gespeichert','success','Account- und Cloud-Spielstand wurden gesichert.');else v063Toast('☁️ Cloud-Sync ausstehend','warn','Der Charakter ist lokal accountgebunden gesichert und wird erneut synchronisiert.')}catch(e){}});
  }});
  setTimeout(()=>input?.focus(),60);
 }
 try{v029ShowClassChoice=fixedCharacterCreator;window.v029ShowClassChoice=fixedCharacterCreator}catch(e){window.v029ShowClassChoice=fixedCharacterCreator}

 /* Repair existing complete characters only after account ownership is verified.
    V4.133 called checkpointCharacter() here without verification; during a Google-account
    switch that could relabel the previous account's character and save it under the new UID. */
 function safeBackgroundCheckpoint(){
  try{const id=uid();if(id&&complete()&&owned(id)&&verified(id))return checkpointCharacter()}catch(e){}
  return false;
 }
 try{safeBackgroundCheckpoint()}catch(e){}
 window.addEventListener('pageshow',()=>{try{safeBackgroundCheckpoint()}catch(e){}},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{safeBackgroundCheckpoint()}catch(e){}},{passive:true});

 function stamp(){}
 stamp();
 window.v4131CharacterSaveDiagnostics=()=>{const id=uid(),k=id?scopedKey(id):'',x=(()=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}})();return{uid:id,complete:complete(),owned:owned(id),verified:verified(id),cloudLoaded:String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||''),stateOwner:String(s?.__accountOwnerId||''),socialOwner:String(s?.social?.playerId||''),scopedOwner:String(x?.__accountOwnerId||''),scopedMatch:!!x&&String(x.characterName||'')===String(s?.characterName||'')&&String(x.playerClass||'')===String(s?.playerClass||'')&&String(x.__accountOwnerId||'')===id}};
})();
