(()=>{
'use strict';
if(window.__V7229_SERVER1_CHARACTER_BOOTSTRAP__)return;
window.__V7229_SERVER1_CHARACTER_BOOTSTRAP__=true;

const VERSION=Object.freeze({short:'V7.273',label:(String(window.GROW_RELEASE_CHANNEL||'stable')==='beta'?'V7.273 Beta':'V7.273 Servergebundene Käufe'),number:'7.273'});
window.GROW_LEGENDS_VERSION=VERSION;
window.__GROW_LEGENDS_RELEASE__=VERSION.short;
window.__GL_CURRENT_BUILD__=VERSION.short;

const serverId=()=>{try{return String(window.v343CurrentServer||s?.__serverId||'beta')}catch(_){return'beta'}};
const uid=()=>{try{return String(v073User?.id||'')}catch(_){return''}};
const clean=x=>{try{return typeof v071CleanName==='function'?v071CleanName(x):String(x||'').trim()}catch(_){return String(x||'').trim()}};
const valid=x=>{try{return typeof v071NameValid==='function'?v071NameValid(x):clean(x).length>=2}catch(_){return clean(x).length>=2}};
const complete=()=>{try{return !!(s?.playerClass&&s?.characterNameSet&&valid(s?.characterName))}catch(_){return false}};
const verified=id=>{
  if(!id||window.__V200_AUTH_READY__!==true)return false;
  try{if(String(v075CloudLoadedFor||'')!==id)return false}catch(_){return false}
  try{if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return false}catch(_){return false}
  return true;
};
function closeModals(){try{v200ClearCharacterModals?.()}catch(_){try{document.querySelectorAll('#v200CharacterModal,.v029-class-overlay').forEach(x=>x.remove())}catch(__){}}}
function statusReason(reason){
  const r=String(reason||'');
  if(r==='NAME_TAKEN')return'Dieser Charaktername ist bereits vergeben.';
  if(r==='INVALID_NAME')return'Bitte einen Namen mit 2–18 Zeichen eingeben.';
  if(r==='INVALID_CLASS')return'Diese Klasse ist nicht zulässig.';
  if(r==='CHARACTER_ALREADY_EXISTS')return'Für diesen Server existiert bereits ein Charakter.';
  if(r==='CHARACTER_NAME_ALREADY_LOCKED')return'Der Charaktername ist bereits festgelegt.';
  if(r==='CLASS_ALREADY_LOCKED')return'Die Klasse ist bereits festgelegt.';
  return r||'Charakter konnte nicht erstellt werden.';
}

const previousCreator=(typeof window.v029ShowClassChoice==='function'?window.v029ShowClassChoice:(typeof v029ShowClassChoice==='function'?v029ShowClassChoice:null));
let opening=false,retryTimer=0,lastAttempt=0;
function schedule(delay=80){
  clearTimeout(retryTimer);
  retryTimer=setTimeout(()=>{retryTimer=0;try{showServer1Creator()}catch(e){console.warn('[V7.229] onboarding retry',e)}},Math.max(0,delay));
}

async function postCreateHydrate(){
  try{await window.v7040AuthorityRefresh?.(false)}catch(_){ }
  try{await window.v7081CapabilitiesRefresh?.(false)}catch(_){ }
  try{
    if(typeof window.v7133HydrateAllCore==='function'){
      await Promise.race([
        Promise.resolve(window.v7133HydrateAllCore()),
        new Promise(resolve=>setTimeout(()=>resolve({ok:false,reason:'hydrate-timeout'}),9000))
      ]);
    }
  }catch(_){ }
  try{await window.v7101SyncPublicProfile?.(true)}catch(_){ }
  try{window.v7101SchedulePublicProfileSync?.(true,120)}catch(_){ }
}

function showServer1Creator(){
  if(serverId()!=='server1'){
    if(typeof previousCreator==='function')return previousCreator.apply(this,arguments);
    return false;
  }
  const id=uid();
  if(!id||v073User?.is_anonymous)return false;
  if(complete()){
    closeModals();
    return true;
  }
  if(!verified(id)){
    /* The historical finalizer used to call the creator before V4.52 marked the
       account transition ready. Keep retrying instead of silently discarding it. */
    if(Date.now()-lastAttempt>30)lastAttempt=Date.now();
    schedule(120);
    return false;
  }
  if(opening||document.getElementById('v200CharacterModal'))return true;
  opening=true;
  try{
    closeModals();
    const modal=document.createElement('div');
    modal.id='v200CharacterModal';
    const classRows=Object.entries(classes||{}).map(([cid,c])=>`<button type="button" class="v200-class" data-v4135-class="${v073Escape(cid)}"><img src="${v080AvatarFor(cid)}" alt="${v073Escape(c?.name||cid)}"><div class="v200-class-copy"><b>${v073Escape(c?.name||cid)}</b><span>${v073Escape(c?.text||'')}</span></div></button>`).join('');
    modal.innerHTML=`<div class="v200-character-card"><h2>Erstelle deine Legende</h2><div class="v200-character-sub">Server 1 beginnt für diesen Account mit einem komplett neuen Charakter.</div><div class="v7229-server-note"><b>Server 1</b> · Beta-Charakter, Inventar, Gilde und Fortschritt werden nicht übernommen.</div><div class="v200-character-name"><label>Charaktername</label><input id="v200CharacterName" maxlength="18" autocomplete="off" placeholder="Deinen Namen eingeben"><div id="v200CharacterNameStatus">2–18 Zeichen · muss einzigartig sein</div></div><div class="v200-class-grid">${classRows}</div></div>`;
    document.body.appendChild(modal);
    try{window.v6289HarzruferinLockDiagnostics?.()}catch(_){ }
    /* The V6.289 lock decorator also runs on its own timers; force its known
       account-ready path once more so Harzruferin immediately reflects early access. */
    try{window.dispatchEvent(new CustomEvent('growlegends:account-ready',{detail:{uid:id,source:'v7229-character-modal'}}))}catch(_){ }
    const input=modal.querySelector('#v200CharacterName');
    const status=modal.querySelector('#v200CharacterNameStatus');
    const buttons=[...modal.querySelectorAll('[data-v4135-class]')];
    const setButtons=on=>buttons.forEach(x=>x.disabled=!on);
    buttons.forEach(btn=>btn.onclick=async()=>{
      const name=clean(input?.value);
      if(!valid(name)){status.className='error';status.textContent='Bitte einen Namen mit 2–18 Zeichen eingeben.';input?.focus();return}
      const moderation=window.v7185Moderation?.check?.(name,'character_name');
      if(moderation?.blocked){status.className='error';status.textContent=moderation.message||'Dieser Charaktername ist nicht zulässig.';input?.focus();return}
      const classId=String(btn.dataset.v4135Class||'');
      if(classId==='summoner'&&btn.classList.contains('v6289-beta-locked'))return;
      if(!verified(id)||uid()!==id){status.className='error';status.textContent='Account-Prüfung noch nicht abgeschlossen. Bitte kurz erneut versuchen.';schedule(200);return}
      setButtons(false);status.className='';status.textContent='Name wird geprüft …';
      try{
        if(typeof v200NameAvailable==='function'&&!(await v200NameAvailable(name))){status.className='error';status.textContent='Dieser Charaktername ist bereits vergeben.';setButtons(true);input?.focus();return}
      }catch(e){status.className='error';status.textContent='Namensprüfung nicht erreichbar. Bitte erneut versuchen.';setButtons(true);return}
      const className=classes?.[classId]?.name||classId;
      const ok=await v115Confirm(`${className} als Klasse für ${name} wählen?\n\nName und Klasse sind auf Server 1 danach festgelegt.`,{title:'Charakter erstellen',type:'warn',okText:'Charakter erstellen'});
      if(!ok){status.textContent='2–18 Zeichen · muss einzigartig sein';setButtons(true);return}
      if(!verified(id)||uid()!==id){status.className='error';status.textContent='Account-Prüfung hat sich geändert. Bitte neu anmelden.';return}
      const db=(typeof v073Db!=='undefined'&&v073Db)||null;
      if(!db){status.className='error';status.textContent='Server ist nicht bereit. Bitte erneut versuchen.';setButtons(true);return}
      status.className='';status.textContent='Charakter wird auf Server 1 angelegt …';
      try{
        const {data,error}=await db.rpc('gl_create_character',{p_name:name,p_class:classId});
        if(error)throw error;
        const r=Array.isArray(data)?(data[0]||{}):(data||{});
        if(!r.ok){status.className='error';status.textContent=statusReason(r.reason);setButtons(true);return}
        if(uid()!==id)throw new Error('ACCOUNT_CHANGED');
        s.playerClass=classId;s.classLocked=true;s.characterName=name;s.characterNameSet=true;
        s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;s.__accountOwnerId=id;s.__serverId='server1';
        try{v075CloudLoadedFor=id}catch(_){ }
        try{v200SaveScopedLocal?.()}catch(_){ }
        try{v145SaveScopedLocal?.()}catch(_){ }
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){ }
        status.textContent='Server-Spielstand wird vorbereitet …';
        await postCreateHydrate();
        if(uid()!==id)return;
        /* Canonical hydrators may repaint class/identity; restore immutable server identity
           from the successful RPC before the first playable frame. */
        s.playerClass=classId;s.classLocked=true;s.characterName=name;s.characterNameSet=true;s.__accountOwnerId=id;s.__serverId='server1';
        s.social=(s.social&&typeof s.social==='object')?s.social:{};s.social.playerId=id;
        try{v200SaveScopedLocal?.()}catch(_){ }
        closeModals();
        try{v071ApplyNameToUi?.()}catch(_){ }
        try{render?.()}catch(_){ }
        try{window.v069SyncCurrencies?.()}catch(_){ }
        try{v200OpenHome?.()}catch(_){ }
        try{v063Toast?.(`${name} wurde erstellt`,'success',`${className} · Server 1`)}catch(_){ }
      }catch(e){
        console.error('[V7.229] server1 character create',e);
        status.className='error';
        const msg=String(e?.message||e||'');
        status.textContent=/HARZRUFERIN_LOCKED/i.test(msg)?'Die Harzruferin ist für diesen Account noch gesperrt.':(/duplicate|23505/i.test(msg)?'Dieser Charaktername ist bereits vergeben.':'Charakter konnte nicht gespeichert werden. Bitte erneut versuchen.');
        setButtons(true);
      }
    });
    setTimeout(()=>input?.focus(),60);
    return true;
  }finally{opening=false}
}

window.v7229ShowServer1Creator=showServer1Creator;
window.v029ShowClassChoice=function(){return showServer1Creator.apply(this,arguments)};
try{v029ShowClassChoice=window.v029ShowClassChoice}catch(_){ }

/* Absolute last finalizer wrapper: only after every account-isolation owner has
   returned may the Server-1 character bootstrap be shown. */
try{
  const base=window.v200FinalizeUser||((typeof v200FinalizeUser==='function')?v200FinalizeUser:null);
  if(typeof base==='function'&&!base.__v7229Onboarding){
    const wrapped=async function(user){
      const r=await base.apply(this,arguments);
      if(r&&serverId()==='server1')schedule(0);
      return r;
    };
    wrapped.__v7229Onboarding=true;wrapped.__v7229Base=base;
    window.v200FinalizeUser=wrapped;try{v200FinalizeUser=wrapped}catch(_){ }
  }
}catch(e){console.warn('[V7.229] finalizer install',e)}

window.addEventListener('growlegends:account-ready',()=>{if(serverId()==='server1')schedule(80)},{passive:true});
window.addEventListener('growlegends:first-playable',()=>{if(serverId()==='server1')schedule(80)},{passive:true});
window.addEventListener('pageshow',()=>{if(serverId()==='server1')schedule(140)},{passive:true});
[0,120,400,1000,2200].forEach(ms=>setTimeout(()=>{if(serverId()==='server1')schedule(0)},ms));

window.v7229CharacterBootstrapDiagnostics=()=>({
 version:VERSION.short,server:serverId(),uid:uid(),authReady:window.__V200_AUTH_READY__===true,
 verified:verified(uid()),cloudLoaded:String((typeof v075CloudLoadedFor!=='undefined'&&v075CloudLoadedFor)||''),
 complete:complete(),modal:!!document.getElementById('v200CharacterModal')
});
})();
