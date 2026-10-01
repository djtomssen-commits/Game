(()=>{
 'use strict';
 if(window.__V6252_REGISTER_POPUP__)return;
 window.__V6252_REGISTER_POPUP__=true;

 let busy=false;
 const overlay=()=>document.getElementById('v6252RegisterOverlay');
 const q=id=>document.getElementById(id);

 function status(text='',type=''){
  const el=q('v6252RegisterStatus');if(!el)return;
  el.textContent=String(text||'');
  el.className=text?'show':'';
  if(text&&type)el.classList.add(type);
 }

 function forceMainLogin(){
  try{
   v075AuthMode='login';
   const login=q('v075LoginTab'),reg=q('v075RegisterTab'),action=q('v075EmailAction'),google=q('v075GoogleAction'),pass=q('v075Password');
   login?.classList.add('active');reg?.classList.remove('active');
   if(action)action.textContent='Anmelden';
   if(google)google.textContent='Mit Google anmelden';
   if(pass)pass.autocomplete='current-password';
   const note=q('v075AccountNote');
   if(note)note.textContent='Melde dich an und lade deinen persönlichen Cloud-Spielstand.';
   try{v200AuthStatus('')}catch(_){}
  }catch(e){}
 }

 function paintEntry(){
  const reg=q('v075RegisterTab');
  if(reg){
   reg.textContent='Account erstellen';
   reg.title='Öffnet die Registrierung in einem eigenen Fenster';
   reg.classList.remove('active');
  }
  forceMainLogin();
 }

 function close(prefill=false){
  if(prefill){
   const email=String(q('v6252RegisterEmail')?.value||'').trim();
   if(email&&q('v075Email'))q('v075Email').value=email;
  }
  overlay()?.classList.remove('show');
  overlay()?.setAttribute('aria-hidden','true');
  forceMainLogin();
 }

 function open(){
  try{
   if(typeof v343Selected==='function'&&v343Selected()!=='beta'){
    v063Toast?.('Server nicht verfügbar','warn','Wähle zuerst einen verfügbaren Server.');
    return;
   }
  }catch(_){}
  forceMainLogin();
  status('');
  const ov=overlay();if(!ov)return;
  ov.classList.add('show');ov.setAttribute('aria-hidden','false');
  const loginEmail=String(q('v075Email')?.value||'').trim();
  if(loginEmail&&!q('v6252RegisterEmail')?.value)q('v6252RegisterEmail').value=loginEmail;
  setTimeout(()=>q('v6252RegisterEmail')?.focus(),60);
 }

 function friendlyError(err){
  const raw=String(err?.message||err||'Unbekannter Fehler');
  if(/rate limit|too many|429/i.test(raw))
   return 'Zu viele Registrierungsversuche. Bitte etwas warten und anschließend erneut versuchen.';
  if(/already registered|already been registered|user already registered/i.test(raw))
   return 'Für diese E-Mail existiert bereits ein Account. Bitte zur Anmeldung wechseln.';
  if(/password/i.test(raw)&&/6|short|weak/i.test(raw))
   return 'Das Passwort ist zu kurz oder zu schwach. Verwende mindestens 6 Zeichen.';
  return raw;
 }

 async function v7276HandoffToCharacter(user){
  const id=String(user?.id||'');
  if(!id)return false;

  /* Signup itself succeeded. From this point the registration dialog must never
     cover the character creator again. Finalization may also be running from the
     Supabase auth-state callback, so treat that as the same transition instead of
     presenting a false save/load error. */
  close(true);
  try{v073User=user;v073Ready=true}catch(_){ }

  const ready=()=>{
   try{
    return String(v073User?.id||'')===id &&
      window.__V200_AUTH_READY__===true &&
      String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'')===id;
   }catch(_){return false}
  };
  const characterVisible=()=>!!document.querySelector('#v200CharacterModal');

  let ok=false;
  try{ok=!!(await v200FinalizeUser(user))}catch(e){console.warn('[V7.276] signup finalize handoff',e)}

  /* SIGNED_IN can race the explicit post-signup finalize. Give the existing owner
     a short chance to finish before doing one resolver fallback. */
  for(let i=0;i<18 && !ready() && !characterVisible();i++){
   await new Promise(r=>setTimeout(r,60));
  }

  if(!ok && !ready() && !characterVisible()){
   try{
    const resolved=!!(await window.v075ResolveCloudAfterLogin?.());
    if(resolved){window.__V200_AUTH_READY__=true;ok=true}
   }catch(e){console.warn('[V7.276] signup resolver fallback',e)}
  }

  if(ok||ready()||characterVisible()){
   try{v075Overlay(false)}catch(_){ }
   try{
    if(typeof v200CharacterComplete==='function'&&v200CharacterComplete())v200OpenHome?.();
    else{
     v200ClearCharacterModals?.();
     setTimeout(()=>{try{v029ShowClassChoice?.()}catch(_){ }},30);
    }
   }catch(_){ }
   return true;
  }

  /* Genuine network/session failure only. Keep the account created, return to the
     normal login instead of reopening the registration modal over the next screen. */
  try{forceMainLogin();v075Overlay(true);v200AuthStatus?.('Account erstellt. Bitte einmal anmelden.','success')}catch(_){ }
  return false;
 }

 async function register(){
  if(busy)return;
  const email=String(q('v6252RegisterEmail')?.value||'').trim();
  const password=String(q('v6252RegisterPassword')?.value||'');

  if(!email||!email.includes('@')){
   status('Bitte eine gültige E-Mail-Adresse eingeben.','error');
   q('v6252RegisterEmail')?.focus();return;
  }
  if(password.length<6){
   status('Das Passwort muss mindestens 6 Zeichen haben.','error');
   q('v6252RegisterPassword')?.focus();return;
  }

  busy=true;
  const btn=q('v6252RegisterAction');
  if(btn){btn.disabled=true;btn.textContent='Account wird erstellt …'}
  status('Registrierung wird gesendet …');

  try{
   if(!(await v073Init())||!v073Db)throw new Error('Supabase ist nicht erreichbar.');
   try{if(typeof v343StampState==='function')v343StampState()}catch(_){}

   /* Genau EIN Sign-up pro Klick – keine Retry-Schleife. */
   const {data,error}=await v073Db.auth.signUp({
    email,
    password,
    options:{data:{grow_legends_registration:true}}
   });
   if(error)throw error;

   if(data?.session?.user){
    status('Account erstellt. Charaktererstellung wird geöffnet …','success');
    await v7276HandoffToCharacter(data.session.user);
    return;
   }

   if(data?.user){
    status('Account erstellt. Bitte bestätige jetzt die E-Mail in deinem Postfach. Danach kannst du dich anmelden und direkt deinen Charakter erstellen.','success');
    if(q('v075Email'))q('v075Email').value=email;
    return;
   }

   throw new Error('Supabase hat keinen Benutzer zurückgegeben.');
  }catch(e){
   const msg=friendlyError(e);
   console.error('V6.252 register popup',e);
   status(msg,'error');
   try{v063Toast?.('Registrierung fehlgeschlagen','error',msg)}catch(_){}
  }finally{
   busy=false;
   if(btn){btn.disabled=false;btn.textContent='Account erstellen & Charakter wählen'}
  }
 }

 window.v6252OpenRegister=open;
 window.v6252CloseRegister=close;

 /* Finaler Modus-Owner: "Registrieren" ändert den Login nicht mehr unsichtbar. */
 const previousSetMode=typeof v075SetAuthMode==='function'?v075SetAuthMode:null;
 v075SetAuthMode=function(mode){
  if(String(mode)==='register'){open();return}
  if(previousSetMode){
   try{previousSetMode.call(this,'login')}catch(_){forceMainLogin()}
  }else forceMainLogin();
  paintEntry();
 };
 try{window.v075SetAuthMode=v075SetAuthMode}catch(_){}

 /* Erhalte alle bestehenden Bindings/Server-Wrapper und überschreibe nur Register. */
 const previousBind=typeof v075BindAuthUi==='function'?v075BindAuthUi:null;
 v075BindAuthUi=function(){
  const r=previousBind?.apply(this,arguments);
  const login=q('v075LoginTab'),reg=q('v075RegisterTab'),email=q('v075EmailAction');
  if(login)login.onclick=()=>v075SetAuthMode('login');
  if(reg)reg.onclick=open;
  if(email)email.onclick=()=>{forceMainLogin();return v200EmailAuth?.()};
  paintEntry();
  return r;
 };
 try{window.v075BindAuthUi=v075BindAuthUi}catch(_){}

 q('v6252RegisterClose')?.addEventListener('click',()=>close(false));
 q('v6252BackToLogin')?.addEventListener('click',()=>close(true));
 q('v6252RegisterAction')?.addEventListener('click',register);
 q('v6252RegisterPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')register()});
 overlay()?.addEventListener('click',e=>{if(e.target===overlay())close(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay()?.classList.contains('show'))close(false)});

 /* V347 "Neu hier?" nutzt den Register-Button. Dadurch landet auch dieser Weg im Popup. */
 paintEntry();
 try{v075BindAuthUi()}catch(_){}
 window.addEventListener('growlegends:account-ready',paintEntry,{passive:true});

 window.v6252RegistrationDiagnostics=()=>({
  popupPresent:!!overlay(),
  popupOpen:!!overlay()?.classList.contains('show'),
  mainMode:String(typeof v075AuthMode!=='undefined'?v075AuthMode:''),
  registerButton:q('v075RegisterTab')?.textContent||'',
  characterFlow:typeof v200FinalizeUser==='function'&&typeof v029ShowClassChoice==='function'
 });
})();
