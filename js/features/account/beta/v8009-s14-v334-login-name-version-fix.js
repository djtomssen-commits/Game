(function(){
  const V334_VERSION='V4.29 Stable';

  function v334ApplyVersion(){ /* V4.123: current release owns version UI. */ }

  async function v334OwnProfile(){
    try{
      if(!(await v073Init()))return null;
      if(!v073Db||!v073User?.id)return null;
      const {data,error}=await v073Db
        .from('profiles')
        .select('id,character_name,class_id,class_name,level')
        .eq('id',v073User.id)
        .maybeSingle();
      if(error)throw error;
      return data||null;
    }catch(e){
      console.warn('V4.02 own profile lookup',e);
      return null;
    }
  }

  window.v334CharacterNameAvailableForCurrentUser=async function(name){
    const wanted=String(name||'').trim();
    if(!wanted)return false;
    try{
      if(!(await v073Init()))return false;
      const {data,error}=await v073Db
        .from('profiles')
        .select('id,character_name')
        .eq('character_name',wanted);
      if(error)throw error;
      const rows=data||[];
      return rows.length===0 || rows.every(r=>r.id===v073User?.id);
    }catch(e){
      console.warn('V4.02 name availability',e);
      return false;
    }
  };

  const candidateNames=[
    'v073CheckCharacterName',
    'checkCharacterName',
    'checkCharacterNameAvailable',
    'isCharacterNameAvailable',
    'validateCharacterName'
  ];

  candidateNames.forEach(fn=>{
    const old=window[fn];
    if(typeof old!=='function')return;
    window[fn]=async function(name){
      const own=await v334OwnProfile();
      if(
        own &&
        String(own.character_name||'').trim().toLowerCase()===
        String(name||'').trim().toLowerCase()
      ){
        return true;
      }
      return old.apply(this,arguments);
    };
  });

  async function v334RepairReturningLogin(){
    /* V4.159: delayed login helpers may repaint UI, but may not copy profile
       name/class into s. The account save owns character identity. */
    return false;
  }


  const originalToast=window.v063Toast;
  if(typeof originalToast==='function'){
    window.v063Toast=function(msg){
      const text=String(msg||'');
      if(/charaktername.*vergeben|name.*bereits.*vergeben/i.test(text)){
        const localName=String(s.characterName||s.playerName||s.name||'').trim();
        if(localName){
          const args=arguments;
          v334CharacterNameAvailableForCurrentUser(localName).then(ok=>{
            if(!ok)originalToast.apply(window,args);
          });
          return;
        }
      }
      return originalToast.apply(this,arguments);
    };
  }

  setTimeout(v334RepairReturningLogin,500);
  setTimeout(v334RepairReturningLogin,1800);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(v334RepairReturningLogin,300);
  });
  /* V4.123: obsolete delayed version writes removed. */
})();
