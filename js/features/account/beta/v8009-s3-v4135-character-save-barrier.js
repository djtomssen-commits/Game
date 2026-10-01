(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 let flushPromise=null;

 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
 function clean(x){try{return typeof v071CleanName==='function'?v071CleanName(x):String(x||'').trim()}catch(e){return String(x||'').trim()}}
 function validName(x){try{return typeof v071NameValid==='function'?v071NameValid(x):clean(x).length>=2}catch(e){return clean(x).length>=2}}
 function completeState(x=s){try{return !!(x&&x.playerClass&&x.characterNameSet&&validName(x.characterName))}catch(e){return false}}
 function ownedState(x,id){try{return !!(x&&id&&String(x.__accountOwnerId||'')===id&&String(x.social?.playerId||'')===id)}catch(e){return false}}
 function verified(id){try{return !!id&&typeof window.v452AccountVerified==='function'&&window.v452AccountVerified(id)}catch(e){return false}}
 function scopedKey(id){try{return typeof v200ScopedKey==='function'?v200ScopedKey(id):'growLegendsAccountSave:'+id}catch(e){return 'growLegendsAccountSave:'+id}}
 function snapshot(){try{return typeof structuredClone==='function'?structuredClone(s):JSON.parse(JSON.stringify(s))}catch(e){return JSON.parse(JSON.stringify(s||{}))}}
 function exactCharacter(x,id,name,classId){return !!x&&ownedState(x,id)&&completeState(x)&&clean(x.characterName).toLocaleLowerCase()===clean(name).toLocaleLowerCase()&&String(x.playerClass||'')===String(classId||'')}

 function localCheckpoint(){
  const id=uid();if(!id||!completeState(s)||!ownedState(s,id)||!verified(id))return false;
  try{
   if(typeof window.v4131CheckpointCharacter==='function'&&window.v4131CheckpointCharacter())return true;
   const snap=snapshot();
   localStorage.setItem(KEY,JSON.stringify(snap));
   localStorage.setItem(scopedKey(id),JSON.stringify(snap));
   return true;
  }catch(e){console.error('V4.159 local character checkpoint',e);return false}
 }

 async function readCloud(id){
  try{
   if(!id||uid()!==id)return null;
   if(typeof v073Init==='function')await v073Init();
   if(typeof v073Db==='undefined'||!v073Db)return null;
   const {data,error}=await v073Db.from('player_saves').select('save_data,updated_at').eq('user_id',id).maybeSingle();
   if(error)throw error;
   return data||null;
  }catch(e){console.warn('V4.159 cloud verify read',e);return null}
 }

 async function forceOwnedCloudWrite(id){
  if(!id||uid()!==id||!verified(id)||!completeState(s)||!ownedState(s,id))return false;
  try{
   localCheckpoint();
   const snap=snapshot();
   if(!exactCharacter(snap,id,s.characterName,s.playerClass))return false;
   if(typeof v073Init==='function')await v073Init();
   if(typeof v073Db==='undefined'||!v073Db)return false;
   const now=new Date().toISOString();
   const {error}=await v073Db.from('player_saves').upsert({user_id:id,save_data:snap,updated_at:now},{onConflict:'user_id'});
   if(error)throw error;
   try{v075CloudLoadedFor=id;v200LastCloudStamp=now}catch(e){}
   return true;
  }catch(e){console.warn('V4.159 direct owned cloud write',e);return false}
 }

 async function verifyCharacterPersisted(id,name,classId){
  const row=await readCloud(id);
  return !!row&&exactCharacter(row.save_data,id,name,classId);
 }

 async function flushCharacter(id=uid(),name=s?.characterName,classId=s?.playerClass){
  id=String(id||'');name=clean(name);classId=String(classId||'');
  if(!id||uid()!==id||!validName(name)||!classId||!verified(id)||!ownedState(s,id)||!completeState(s))return false;
  if(flushPromise)return flushPromise;
  flushPromise=(async()=>{
   localCheckpoint();
   if(await verifyCharacterPersisted(id,name,classId))return true;
   try{if(typeof window.v4131SaveCharacterServer==='function')await window.v4131SaveCharacterServer()}catch(e){console.warn('V4.159 normal new-character save',e)}
   if(await verifyCharacterPersisted(id,name,classId))return true;
   try{if(typeof window.v4131DirectCharacterCloudSave==='function')await window.v4131DirectCharacterCloudSave()}catch(e){console.warn('V4.159 fallback new-character save',e)}
   if(await verifyCharacterPersisted(id,name,classId))return true;
   if(await forceOwnedCloudWrite(id))return await verifyCharacterPersisted(id,name,classId);
   return false;
  })().finally(()=>{flushPromise=null});
  return flushPromise;
 }
 window.v4135FlushCharacterSave=flushCharacter;

 /* Final resolver rule: a complete, explicitly account-owned scoped character must never
    lose against an empty/incomplete cloud placeholder for the same authenticated account. */
 try{
  if(typeof v213PickNewestSave==='function'&&!window.__v4135PickerGuard){
   const base=v213PickNewestSave;
   v213PickNewestSave=function(id,cloudData,scoped,current){
    id=String(id||'');
    const scopedComplete=exactCharacter(scoped,id,scoped?.characterName,scoped?.playerClass);
    const cloudComplete=exactCharacter(cloudData,id,cloudData?.characterName,cloudData?.playerClass);
    const currentComplete=exactCharacter(current,id,current?.characterName,current?.playerClass);
    if(scopedComplete&&!cloudComplete)return{source:'local',data:scoped};
    if(currentComplete&&!cloudComplete&&!scopedComplete)return{source:'current',data:current};
    return base.apply(this,arguments);
   };
   try{window.v213PickNewestSave=v213PickNewestSave}catch(e){}
   window.__v4135PickerGuard=true;
  }
 }catch(e){console.warn('V4.159 save picker guard',e)}

 function installRetry(modal,status,id,name,classId){
  if(!modal||!modal.isConnected)return;
  let b=modal.querySelector('#v4135RetrySave');
  if(!b){b=document.createElement('button');b.id='v4135RetrySave';b.className='btn';b.type='button';b.textContent='☁️ Speicherung erneut versuchen';modal.querySelector('.v200-character-card')?.appendChild(b)}
  b.disabled=false;
  b.onclick=async()=>{
   b.disabled=true;status.className='';status.textContent='Cloud-Spielstand wird erneut bestätigt …';
   const ok=await flushCharacter(id,name,classId);
   if(ok){window.__V4135_NEW_CHARACTER_PENDING__=null;finishCreated(name,classId)}
   else{status.className='error';status.textContent='Cloud-Speicherung noch nicht bestätigt. Bitte erneut versuchen; bis dahin nicht ausloggen.';b.disabled=false}
  };
 }

 function finishCreated(name,classId){
  try{v200ClearCharacterModals()}catch(e){}
  try{v071ApplyNameToUi()}catch(e){}
  try{v200OpenHome()}catch(e){}
  try{v063Toast(`${name} wurde erstellt`,'success',`${classes?.[classId]?.name||'Klasse'} · Cloud-Spielstand bestätigt`)}catch(e){}
 }

 function atomicCreator(){
  if(!window.__V200_AUTH_READY__)return;
  if(typeof v200DurableUser==='function'&&!v200DurableUser())return;
  const id=uid();if(!id||!verified(id)||!ownedState(s,id))return;
  try{if(String(v075CloudLoadedFor||'')!==id)return}catch(e){return}
  if(completeState(s)){
   try{v200ClearCharacterModals()}catch(e){}
   localCheckpoint();
   return;
  }
  if(document.querySelector('#v200CharacterModal'))return;
  try{v200ClearCharacterModals()}catch(e){}

  const modal=document.createElement('div');modal.id='v200CharacterModal';
  modal.innerHTML=`<div class="v200-character-card"><h2>Erstelle deine Legende</h2><div class="v200-character-sub">Gib deinen Charakternamen ein und wähle deine Klasse. Der Charakter wird erst freigegeben, wenn sein Account-Spielstand bestätigt gespeichert wurde.</div><div class="v200-character-name"><label>Charaktername</label><input id="v200CharacterName" maxlength="18" autocomplete="off" placeholder="Deinen Namen eingeben"><div id="v200CharacterNameStatus">2–18 Zeichen · muss einzigartig sein</div></div><div class="v200-class-grid">${Object.entries(classes).map(([cid,c])=>`<button type="button" class="v200-class" data-v4135-class="${cid}"><img src="${v080AvatarFor(cid)}" alt="${v073Escape(c.name)}"><div class="v200-class-copy"><b>${v073Escape(c.name)}</b><span>${v073Escape(c.text||'')}</span></div></button>`).join('')}</div></div>`;
  document.body.appendChild(modal);
  const input=modal.querySelector('#v200CharacterName'),status=modal.querySelector('#v200CharacterNameStatus'),buttons=[...modal.querySelectorAll('[data-v4135-class]')];
  buttons.forEach(btn=>{btn.onclick=async()=>{
   const name=clean(input?.value);if(!validName(name)){status.className='error';status.textContent='Bitte einen Namen mit 2–18 Zeichen eingeben.';input?.focus();return}
   buttons.forEach(x=>x.disabled=true);status.className='';status.textContent='Name wird geprüft …';
   if(!(await v200NameAvailable(name))){buttons.forEach(x=>x.disabled=false);status.className='error';status.textContent='Dieser Charaktername ist bereits vergeben.';input?.focus();return}
   const classId=String(btn.dataset.v4135Class||'');
   const ok=await v115Confirm(`${classes[classId].name} als Klasse für ${name} wählen?\n\nDie Klasse kann später nicht gewechselt werden.`,{title:'Charakter erstellen',type:'warn',okText:'Charakter erstellen'});
   if(!ok){buttons.forEach(x=>x.disabled=false);status.textContent='2–18 Zeichen · muss einzigartig sein';return}
   if(uid()!==id||!verified(id)||!ownedState(s,id)){status.className='error';status.textContent='Account-Prüfung hat sich geändert. Bitte neu anmelden.';return}
   s.playerClass=classId;s.classLocked=true;s.characterName=name;s.characterNameSet=true;s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;s.__accountOwnerId=id;
   window.__V4135_NEW_CHARACTER_PENDING__={uid:id,name,classId,startedAt:Date.now()};
   status.textContent='Charakter wird lokal und in der Cloud gespeichert …';
   if(!localCheckpoint()){status.className='error';status.textContent='Lokale Speicherung fehlgeschlagen. Bitte Seite nicht schließen.';installRetry(modal,status,id,name,classId);return}
   const cloudOk=await flushCharacter(id,name,classId);
   if(!modal.isConnected)return;
   if(!cloudOk){status.className='error';status.textContent='Cloud-Speicherung noch nicht bestätigt. Bitte erneut versuchen; bis dahin nicht ausloggen.';installRetry(modal,status,id,name,classId);return}
   window.__V4135_NEW_CHARACTER_PENDING__=null;
   finishCreated(name,classId);
  }});
  setTimeout(()=>input?.focus(),60);
 }
 try{v029ShowClassChoice=atomicCreator;window.v029ShowClassChoice=atomicCreator}catch(e){window.v029ShowClassChoice=atomicCreator}

 /* Pre-logout barrier. The historical logout sets __V200_AUTH_READY__=false BEFORE its
    own cloud write, so guarded profile/cloud writers can reject that final write. Save once
    while authentication is still fully ready; a newly created character may not log out
    until its player_saves row is verified by read-back. */
 try{
  if(typeof v136Logout==='function'&&!window.__v4135LogoutBarrier){
   const base=v136Logout;
   v136Logout=async function(reason='manual'){
    const id=uid();
    if(id&&completeState(s)&&ownedState(s,id)&&verified(id)&&window.__V200_AUTH_READY__===true){
     const pending=window.__V4135_NEW_CHARACTER_PENDING__;
     if(pending&&String(pending.uid||'')===id){
      const ok=await flushCharacter(id,pending.name,pending.classId);
      if(!ok){try{v063Toast('Abmelden gestoppt','error','Der neue Charakter ist noch nicht sicher in der Cloud gespeichert. Bitte die Speicherung erneut versuchen.')}catch(e){};return false}
      window.__V4135_NEW_CHARACTER_PENDING__=null;
     }
     try{if(typeof v075WriteCloudSave==='function')await v075WriteCloudSave(true)}catch(e){console.warn('V4.159 pre-logout save',e)}
    }
    return await base.apply(this,arguments);
   };
   try{window.v136Logout=v136Logout}catch(e){}
   window.__v4135LogoutBarrier=true;
  }
 }catch(e){console.warn('V4.159 logout barrier install',e)}

 function stamp(){}
 stamp();
 window.v4135CharacterPersistenceDiagnostics=()=>{const id=uid(),key=id?scopedKey(id):'',local=(()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}})();return{version:V.short,uid:id,authReady:window.__V200_AUTH_READY__===true,verified:verified(id),owned:ownedState(s,id),complete:completeState(s),pending:window.__V4135_NEW_CHARACTER_PENDING__||null,localComplete:exactCharacter(local,id,local?.characterName,local?.playerClass),scopedKey:key}};
})();
