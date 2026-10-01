function v114EnsureConfirmModal(){
  if(document.querySelector('#v114ConfirmOverlay'))return;

  const ov=document.createElement('div');
  ov.id='v114ConfirmOverlay';
  ov.className='v114-confirm-overlay';
  ov.innerHTML=`
    <div class="v114-confirm-card">
      <div class="v114-confirm-icon">🟢</div>
      <div class="v114-confirm-title">Weiteren Versuch starten?</div>
      <div class="v114-confirm-text">
        Dein kostenloser Weltboss-Versuch für heute wurde bereits benutzt.
      </div>
      <div class="v114-confirm-cost">
        10 Harz-Taler verwenden?
        <div class="v114-confirm-current">
          Aktuell: <span id="v114CurrentHarz">0</span> Harz-Taler
        </div>
      </div>
      <div class="v114-confirm-actions">
        <button class="btn secondary" id="v114CancelRetry">Abbrechen</button>
        <button class="btn gold" id="v114ConfirmRetry">10 Harz-Taler nutzen</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}

function v114AskRetry(){
  v114EnsureConfirmModal();

  return new Promise(resolve=>{
    const ov=document.querySelector('#v114ConfirmOverlay');
    const current=document.querySelector('#v114CurrentHarz');
    const cancel=document.querySelector('#v114CancelRetry');
    const confirmBtn=document.querySelector('#v114ConfirmRetry');

    current.textContent=s.harzTaler||0;
    ov.classList.add('show');

    const done=(value)=>{
      ov.classList.remove('show');
      cancel.onclick=null;
      confirmBtn.onclick=null;
      resolve(value);
    };

    cancel.onclick=()=>done(false);
    confirmBtn.onclick=()=>done(true);
  });
}

/* Replace V4.02 browser confirm with the same polished in-game style as other notices. */
const v114BaseFight=v113OldWorldBossFight;

v110Fight=async function(){
  v112EnsureWorldBossState();
  v110ResetDay();

  if(s.v110WorldBoss.freeUsed){
    if((s.harzTaler||0)<10){
      if(typeof v063Toast==='function'){
        v063Toast('Zu wenig Harz-Taler','warn','Ein weiterer Weltboss-Versuch kostet 10 Harz-Taler.');
      }
      return;
    }

    const ok=await v114AskRetry();
    if(!ok)return;

    s.harzTaler-=10;
    const oldFree=s.v110WorldBoss.freeUsed;
    s.v110WorldBoss.freeUsed=false;

    try{
      const result=v114BaseFight();
      s.v110WorldBoss.freeUsed=true;
      persist(false);
      return result;
    }catch(e){
      s.v110WorldBoss.freeUsed=oldFree;
      s.harzTaler+=10;
      throw e;
    }
  }

  return v114BaseFight();
};

const v114BaseRender=render;
render=function(){
  const result=v114BaseRender();
  
  return result;
};

setTimeout(v114EnsureConfirmModal,200);
