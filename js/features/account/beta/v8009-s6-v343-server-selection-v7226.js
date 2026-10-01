(function(){
  const V343_SERVER_KEY='growLegendsSelectedServer';
  const V343_LAUNCH_AT=Date.parse('2026-10-02T16:00:00+02:00');
  const V343_RELEASE_CHANNEL=String(window.GROW_RELEASE_CHANNEL||'stable');
  const V343_EARLY_EMAIL='tomssen5@gmail.com';
  const launchOpen=()=>Date.now()>=V343_LAUNCH_AT;
  const defaultServer=()=>V343_RELEASE_CHANNEL==='beta'?'beta':(launchOpen()?'server1':'beta');

  window.V343_SERVERS=Object.freeze({
    beta:{id:'beta',name:'Beta Server',status:'online',label:'BETA',path:'beta.html'},
    server1:{id:'server1',name:'Server 1',status:launchOpen()?'online':'preview',label:'SERVER 1',path:'index.html'}
  });

  function v343Selected(){
    if(V343_RELEASE_CHANNEL==='beta')return 'beta';
    if(launchOpen()){
      if(localStorage.getItem(V343_SERVER_KEY)!=='server1')localStorage.setItem(V343_SERVER_KEY,'server1');
      return 'server1';
    }
    const raw=localStorage.getItem(V343_SERVER_KEY)||defaultServer();
    return window.V343_SERVERS[raw]?raw:defaultServer();
  }
  window.v343CurrentServer=v343Selected();

  function v343TargetPath(id){return id==='beta'?'beta.html':'index.html'}
  function v343BuildMatches(id){return (id==='beta'&&V343_RELEASE_CHANNEL==='beta')||(id==='server1'&&V343_RELEASE_CHANNEL!=='beta')}
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
    if(id==='server1'&&!launchOpen()){
      try{v063Toast?.('Server 1 · Vorabtest','info','Bis Freitag 16:00 Uhr ist nur dein freigeschaltetes Testkonto zugelassen.')}catch(_){}
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
    const live=launchOpen();
    return `<div class="v343-server-title"><span>🌐 Server wählen</span><small>Charaktere & Gilden sind getrennt</small></div>
      <div class="v343-server-grid">
        <button type="button" class="v343-server ${selected==='beta'?'active':''} ${live?'':'recommended'}" data-v343-server="beta">
          <div class="v343-server-name">🧪 Beta Server</div>
          <div class="v343-server-meta"><span class="v343-online">● ONLINE</span><span>Test-Build</span></div>
        </button>
        <button type="button" class="v343-server ${selected==='server1'?'active':''} ${live?'recommended':'preview'}" data-v343-server="server1">
          <div class="v343-server-name">${live?'🌍':'🔒'} Server 1</div>
          <div class="v343-server-meta">${live?'<span class="v343-online">● ONLINE</span><span>Live-Server</span>':'<span class="v343-preview">VORABTEST</span><span>Start Fr. 16:00</span>'}</div>
          ${live?'':'<div class="v343-launch-countdown" data-v343-launch-countdown>⏳ Start wird berechnet …</div>'}
        </button>
      </div>
      <div class="v343-server-note">Beta erhält neue Updates zuerst. Server 1 bleibt auf der letzten freigegebenen Version. Vor dem offiziellen Start ist Server 1 serverseitig nur für freigeschaltete Tester erreichbar.</div>`;
  }

  function v343RenderServerSelect(force){
    const card=document.querySelector('#v075AuthOverlay .v075-auth-card');if(!card)return false;
    let box=card.querySelector('.v343-server-select');
    if(!box){box=document.createElement('div');box.className='v343-server-select';const tabs=card.querySelector('.v075-auth-tabs');if(tabs)tabs.insertAdjacentElement('beforebegin',box);else{const brand=card.querySelector('.v200-auth-brand');if(brand)brand.insertAdjacentElement('afterend',box);else card.insertBefore(box,card.firstChild)}}
    const selected=v343Selected(),signature='servers-v7226:'+selected+':'+(launchOpen()?'live':'preview')+':'+V343_RELEASE_CHANNEL;
    if(force||box.dataset.v343Signature!==signature){box.dataset.v343Signature=signature;box.innerHTML=v343Markup(selected);box.querySelectorAll('[data-v343-server]').forEach(b=>b.onclick=()=>v343SetServer(String(b.dataset.v343Server||'beta')))}
    return true;
  }
  window.v343RenderServerSelect=v343RenderServerSelect;

  function v343CountdownText(){
    const left=Math.max(0,V343_LAUNCH_AT-Date.now());
    if(left<=0)return '🌍 SERVER 1 IST JETZT GEÖFFNET';
    const total=Math.floor(left/1000);
    const days=Math.floor(total/86400);
    const hours=Math.floor((total%86400)/3600);
    const mins=Math.floor((total%3600)/60);
    const secs=total%60;
    const pad=n=>String(n).padStart(2,'0');
    return `⏳ Start in ${days}T ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }
  function v343UpdateLaunchCountdown(){
    const nodes=document.querySelectorAll('[data-v343-launch-countdown]');
    const text=v343CountdownText();
    nodes.forEach(n=>{if(n.textContent!==text)n.textContent=text});
    if(launchOpen()&&nodes.length)v343RenderServerSelect(true);
  }
  window.v343UpdateLaunchCountdown=v343UpdateLaunchCountdown;

  const baseBuild=typeof v200BuildLogin==='function'?v200BuildLogin:null;
  if(baseBuild)v200BuildLogin=function(){const r=baseBuild.apply(this,arguments);v343RenderServerSelect(true);return r};

  const baseEmail=typeof v200EmailAuth==='function'?v200EmailAuth:null;
  if(baseEmail){
    v200EmailAuth=async function(){
      const selected=v343Selected();
      if(selected==='server1'&&!launchOpen()){
        const mail=String(document.querySelector('#v075Email')?.value||'').trim().toLowerCase();
        if(mail!==V343_EARLY_EMAIL){try{v063Toast?.('Server 1 noch geschlossen','warn','Offizieller Start: Freitag, 2. Oktober, 16:00 Uhr.')}catch(_){};return false}
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
      if(selected==='server1'&&!launchOpen()){
        try{v063Toast?.('Server 1 · Vorabzugang','info','Wähle jetzt dein freigeschaltetes Google-Konto Tomssen5@gmail.com. Andere Konten bleiben bis Freitag 16:00 Uhr gesperrt.')}catch(_){}
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
    const resolvedOAuthServer=V343_RELEASE_CHANNEL==='beta'?'beta':(launchOpen()?'server1':oauthServer);
    window.v343CurrentServer=resolvedOAuthServer;
    localStorage.setItem(V343_SERVER_KEY,resolvedOAuthServer);
  }

  const baseBind=typeof v075BindAuthUi==='function'?v075BindAuthUi:null;
  if(baseBind)v075BindAuthUi=function(){const r=baseBind.apply(this,arguments);const email=document.querySelector('#v075EmailAction'),google=document.querySelector('#v075GoogleAction');if(email&&typeof v200EmailAuth==='function')email.onclick=v200EmailAuth;if(google&&typeof v200GoogleAuth==='function')google.onclick=v200GoogleAuth;v343RenderServerSelect(false);return r};

  v343StampState();
  if(v343RouteBuild(v343Selected(),true))return;
  v343RenderServerSelect(false);
  v343UpdateLaunchCountdown();
  document.addEventListener('DOMContentLoaded',()=>{v343RenderServerSelect(false);v343UpdateLaunchCountdown()},{once:true});
  setTimeout(()=>{v343RenderServerSelect(false);v343UpdateLaunchCountdown()},250);setTimeout(()=>{v343RenderServerSelect(false);v343UpdateLaunchCountdown()},900);
  setInterval(v343UpdateLaunchCountdown,1000);
})();
