(function(){
  const V343_SERVER_KEY='growLegendsSelectedServer';
  const V343_RELEASE_CHANNEL=String(window.GROW_RELEASE_CHANNEL||'stable');
  const V343_EARLY_EMAIL='tomssen5@gmail.com';
  /* Server 1 public launch: 2026-10-07 20:00 Europe/Berlin = 18:00 UTC. */
  const V343_SERVER1_OPENS_AT=Date.parse('2026-10-07T18:00:00Z');
  const server1Open=()=>Date.now()>=V343_SERVER1_OPENS_AT;
  const defaultServer=()=>server1Open()?'server1':'beta';

  const T=(key,vars,fallback)=>window.GrowI18n?.t?.(key,vars)||fallback||key;

  function v343Countdown(){
    const ms=Math.max(0,V343_SERVER1_OPENS_AT-Date.now());
    if(ms<=0)return T('server.openNow',null,'JETZT GEÖFFNET');
    const total=Math.floor(ms/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  window.V343_SERVERS=Object.freeze({
    beta:{id:'beta',name:'Beta Server',status:'online',label:'BETA',path:'beta.html'},
    server1:{id:'server1',name:'Server 1',status:server1Open()?'online':'preview',label:'SERVER 1',path:'server1.html'}
  });

  function v343Selected(){
    if(V343_RELEASE_CHANNEL==='beta')return 'beta';
    if(V343_RELEASE_CHANNEL==='server1')return 'server1';
    const raw=localStorage.getItem(V343_SERVER_KEY)||defaultServer();
    return window.V343_SERVERS[raw]?raw:defaultServer();
  }
  window.v343CurrentServer=v343Selected();

  function v343TargetPath(id){return id==='beta'?'beta.html':'server1.html'}
  function v343BuildMatches(id){return (id==='beta'&&V343_RELEASE_CHANNEL==='beta')||(id==='server1'&&V343_RELEASE_CHANNEL==='server1')}
  function v343RouteBuild(id,replace=false){
    if(v343BuildMatches(id))return false;
    const target=v343TargetPath(id);
    try{replace?location.replace(target):location.assign(target)}catch(_){location.href=target}
    return true;
  }
  function v343ResetDb(){
    try{v073Db=null;v073InitPromise=null;v073Ready=false;v073User=null}catch(_){}
    try{window.__GROW_DB_SCHEMA__=null}catch(_){}
  }

  function v343SetServer(id){
    const cfg=window.V343_SERVERS[id];if(!cfg)return false;
    window.v343CurrentServer=id;
    localStorage.setItem(V343_SERVER_KEY,id);
    v343ResetDb();
    if(id==='server1'&&!server1Open()){
      try{v063Toast?.(T('server.previewTitle',null,'Server 1 · Vorabtest'),'info',T('server.previewText',null,'Server 1 ist noch geschlossen. Nur freigeschaltete Testkonten haben Zugang.'))}catch(_){}
    }
    if(v343RouteBuild(id,false))return true;
    v343RenderServerSelect(true);return true;
  }
  window.v343SetServer=v343SetServer;

  function v343StampState(){try{if(s&&typeof s==='object')s.__serverId=window.v343CurrentServer||defaultServer()}catch(_){}}

  if(typeof v200ScopedKey==='function'){
    const oldLoad=v200LoadScopedLocal;
    v200ScopedKey=function(uid){return V200_ACCOUNT_SAVE_PREFIX+String(uid||'')+':server:'+String(window.v343CurrentServer||defaultServer())};
    v200LoadScopedLocal=function(uid){
      let data=oldLoad.apply(this,arguments);if(data)return data;
      if((window.v343CurrentServer||defaultServer())==='beta'){
        try{const raw=localStorage.getItem(V200_ACCOUNT_SAVE_PREFIX+String(uid||''));if(raw){data=JSON.parse(raw);if(!data?.__accountOwnerId||data.__accountOwnerId===uid){data.__serverId='beta';return data}}}catch(_){}
      }
      return null;
    };
  }
  const baseSaveScoped=typeof v200SaveScopedLocal==='function'?v200SaveScopedLocal:null;
  if(baseSaveScoped)v200SaveScopedLocal=function(){v343StampState();return baseSaveScoped.apply(this,arguments)};
  const baseFresh=typeof v200FreshState==='function'?v200FreshState:null;
  if(baseFresh)v200FreshState=function(uid){const r=baseFresh.apply(this,arguments);v343StampState();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}return r};

  function v343Markup(selected){
    const live=server1Open(),time=v343Countdown();
    return `<div class="v343-server-title"><span>🌐 ${T('server.select',null,'Server wählen')}</span><small>${T('server.separate',null,'Charaktere & Gilden sind getrennt')}</small></div>
      <div class="v343-server-grid">
        <button type="button" class="v343-server ${selected==='beta'?'active':''} ${live?'':'recommended'}" data-v343-server="beta">
          <div class="v343-server-name">🧪 ${T('server.beta',null,'Beta Server')}</div>
          <div class="v343-server-meta"><span class="v343-online">● ${T('server.online',null,'ONLINE')}</span><span>${T('server.testBuild',null,'Test-Build')}</span></div>
        </button>
        <button type="button" class="v343-server ${selected==='server1'?'active':''} ${live?'recommended':'preview'}" data-v343-server="server1">
          <div class="v343-server-name">${live?'🌍':'🔒'} Server 1</div>
          <div class="v343-server-meta">${live?`<span class="v343-online">● ${T('server.online',null,'ONLINE')}</span><span>${T('server.live',null,'Live-Server')}</span>`:`<span class="v343-preview">${T('server.startIn',{time},'START IN '+time)}</span><span>${T('server.opensToday',null,'Heute · 20:00 Uhr')}</span>`}</div>
        </button>
      </div>
      <div class="v343-server-note">${live?T('server.noteOpen',null,'Server 1 ist jetzt für alle Spieler geöffnet. Beta erhält neue Updates weiterhin zuerst.'):T('server.noteCountdown',{time},`Server 1 öffnet heute automatisch um 20:00 Uhr für alle. Countdown: ${time}.`)}</div>`;
  }

  function v343RenderServerSelect(force){
    const card=document.querySelector('#v075AuthOverlay .v075-auth-card');if(!card)return false;
    let box=card.querySelector('.v343-server-select');
    if(!box){box=document.createElement('div');box.className='v343-server-select';const tabs=card.querySelector('.v075-auth-tabs');if(tabs)tabs.insertAdjacentElement('beforebegin',box);else{const brand=card.querySelector('.v200-auth-brand');if(brand)brand.insertAdjacentElement('afterend',box);else card.insertBefore(box,card.firstChild)}}
    const selected=v343Selected(),signature='servers-v7226:'+selected+':'+(server1Open()?'live':v343Countdown())+':'+V343_RELEASE_CHANNEL;
    if(force||box.dataset.v343Signature!==signature){box.dataset.v343Signature=signature;box.innerHTML=v343Markup(selected);box.querySelectorAll('[data-v343-server]').forEach(b=>b.onclick=()=>v343SetServer(String(b.dataset.v343Server||'beta')))}
    return true;
  }
  window.v343RenderServerSelect=v343RenderServerSelect;


  const baseBuild=typeof v200BuildLogin==='function'?v200BuildLogin:null;
  if(baseBuild)v200BuildLogin=function(){const r=baseBuild.apply(this,arguments);v343RenderServerSelect(true);return r};

  const baseEmail=typeof v200EmailAuth==='function'?v200EmailAuth:null;
  if(baseEmail){
    v200EmailAuth=async function(){
      const selected=v343Selected();
      if(selected==='server1'&&!server1Open()){
        const mail=String(document.querySelector('#v075Email')?.value||'').trim().toLowerCase();
        if(mail!==V343_EARLY_EMAIL){const time=v343Countdown();try{v063Toast?.(T('server.closedTitle',null,'Server 1 noch geschlossen'),'warn',T('server.closedText',{time},`Server 1 öffnet heute um 20:00 Uhr. Noch ${time}.`))}catch(_){};return false}
      }
      window.v343CurrentServer=selected;v343StampState();v343ResetDb();
      return await baseEmail.apply(this,arguments);
    };
    v075EmailLogin=v200EmailAuth;
  }

  const baseGoogle=typeof v200GoogleAuth==='function'?v200GoogleAuth:null;
  if(baseGoogle){
    v200GoogleAuth=async function(){
      const selected=v343Selected();
      if(selected==='server1'&&!server1Open()){
        const time=v343Countdown();try{v063Toast?.(T('server.earlyTitle',null,'Server 1 · Vorabzugang'),'info',T('server.earlyText',{time},`Server 1 öffnet heute um 20:00 Uhr für alle. Noch ${time}.`))}catch(_){}
      }
      window.v343CurrentServer=selected;
      sessionStorage.setItem('v343OAuthServer',selected);
      v343StampState();
      v343ResetDb();
      return await baseGoogle.apply(this,arguments);
    };
    v075Google=v200GoogleAuth;
  }

  const oauthServer=sessionStorage.getItem('v343OAuthServer');
  if(oauthServer&&window.V343_SERVERS[oauthServer]){
    const resolvedOAuthServer=V343_RELEASE_CHANNEL==='beta'?'beta':oauthServer;
    window.v343CurrentServer=resolvedOAuthServer;
    localStorage.setItem(V343_SERVER_KEY,resolvedOAuthServer);
  }

  const baseBind=typeof v075BindAuthUi==='function'?v075BindAuthUi:null;
  if(baseBind)v075BindAuthUi=function(){const r=baseBind.apply(this,arguments);const email=document.querySelector('#v075EmailAction'),google=document.querySelector('#v075GoogleAction');if(email&&typeof v200EmailAuth==='function')email.onclick=v200EmailAuth;if(google&&typeof v200GoogleAuth==='function')google.onclick=v200GoogleAuth;v343RenderServerSelect(false);return r};

  v343StampState();
  if(v343RouteBuild(v343Selected(),true))return;
  v343RenderServerSelect(false);
  
  document.addEventListener('DOMContentLoaded',()=>{v343RenderServerSelect(false)},{once:true});
  window.addEventListener('growlegends:language-changed',()=>v343RenderServerSelect(true),{passive:true});
  setTimeout(()=>{v343RenderServerSelect(false)},250);setTimeout(()=>{v343RenderServerSelect(false)},900);
  /* Keep the login countdown live and switch to ONLINE automatically at launch. */
  const v343CountdownTimer=setInterval(()=>{
    try{v343RenderServerSelect(true)}catch(_){}
    if(server1Open())clearInterval(v343CountdownTimer);
  },1000);
  
})();
