from pathlib import Path

p=Path("beta.html")
s=p.read_text(encoding="utf-8")
orig=s

def once(old,new,label):
    global s
    c=s.count(old)
    if c!=1:
        raise SystemExit(f"{label}: expected 1 match, got {c}")
    s=s.replace(old,new,1)

if "let v200EmailOwnsFinalize=false;" not in s:
    once(
        "let v200AuthBusy=false;\nlet v200CloudPromise=null;",
        "let v200AuthBusy=false;\nlet v200EmailOwnsFinalize=false;\nlet v200EmailFinalizeUid='';\nlet v200EmailFinalizeUntil=0;\nlet v200CloudPromise=null;",
        "email owner declarations"
    )

    once(
        "  v200AuthBusy=true;\n  const btn=document.querySelector('#v075EmailAction');",
        "  v200AuthBusy=true;\n  v200EmailOwnsFinalize=true;\n  let v200AuthSucceeded=false;\n  const btn=document.querySelector('#v075EmailAction');",
        "email owner start"
    )

    once(
        """      if(data?.session?.user){
        v200AuthStatus('Account erstellt. Charaktererstellung wird geöffnet …','success');
        await v200FinalizeUser(data.session.user);""",
        """      if(data?.session?.user){
        v200AuthSucceeded=true;
        v200EmailFinalizeUid=String(data.session.user.id||'');
        v200EmailFinalizeUntil=Date.now()+5000;
        v200AuthStatus('Account erstellt. Charaktererstellung wird geöffnet …','success');
        const finalized=await v200FinalizeUser(data.session.user);
        if(finalized===false)throw new Error('Spielstand konnte nach der Registrierung nicht geladen werden.');""",
        "registration finalize"
    )

    once(
        """      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeUser(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');""",
        """      v200AuthSucceeded=true;
      v200EmailFinalizeUid=String(data.user.id||'');
      v200EmailFinalizeUntil=Date.now()+5000;
      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeUser(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');""",
        "login finalize"
    )

    once(
        """    console.error('V4.02 email auth',e);
    v200AuthStatus(msg,'error');
    v063Toast(mode==='register'?'Registrierung fehlgeschlagen':'Anmeldung fehlgeschlagen','error',msg);
  }finally{
    v200AuthBusy=false;""",
        """    console.error('V4.02 email auth',e);
    if(v200AuthSucceeded){
      try{v4143SetAuthBoot(false)}catch(_){}
      try{v075SetAuthMode('login');v075Overlay(true)}catch(_){}
      v200AuthStatus(msg,'error');
      v063Toast('Spielstand konnte nicht geladen werden','error',msg);
    }else{
      v200AuthStatus(msg,'error');
      v063Toast(mode==='register'?'Registrierung fehlgeschlagen':'Anmeldung fehlgeschlagen','error',msg);
    }
  }finally{
    v200EmailOwnsFinalize=false;
    v200AuthBusy=false;""",
        "post auth error classification"
    )

    once(
        """    if(!user || user.is_anonymous)return;
    const nextId=String(user.id||'');
    const currentId=String(v073User?.id||'');

    /* V7.284: v200Boot / OAuth return owns initial-session resolution.""",
        """    if(!user || user.is_anonymous)return;
    const nextId=String(user.id||'');
    const currentId=String(v073User?.id||'');

    /* Password/email auth owns this finalize. Supabase also emits SIGNED_IN,
       so the listener must not launch a second finalizer for the same action. */
    if(event==='SIGNED_IN' && (
      v200EmailOwnsFinalize ||
      (nextId && nextId===v200EmailFinalizeUid && Date.now()<v200EmailFinalizeUntil)
    )){
      v073User=user;
      v073Ready=true;
      return;
    }

    /* V7.284: v200Boot / OAuth return owns initial-session resolution.""",
        "auth listener owner"
    )

required=[
    "let v200EmailOwnsFinalize=false;",
    "v200EmailFinalizeUid=String(data.user.id||'');",
    "event==='SIGNED_IN' && (",
    "v063Toast('Spielstand konnte nicht geladen werden','error',msg);"
]
for x in required:
    if x not in s:
        raise SystemExit("missing login fix signature: "+x)

if s==orig:
    print("email login fix already present")
else:
    p.write_text(s,encoding="utf-8")
    print("email login single-finalizer fix applied")
