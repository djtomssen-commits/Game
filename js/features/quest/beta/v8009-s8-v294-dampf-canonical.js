/* V4.02: one Dampf card owner, one heading, numeric value only. */
/* V8.099: canonical server-authoritative Dampf refill.
   Event: 200 free daily, Harz refill allowed up to 300.
   Normal days keep the 100 cap. */
/* V8.303: authenticated Dampf purchases are server-only, including during
   authority boot. Never show a speculative local Harz debit or Dampf credit. */
let v294RefillPending=false;
async function v294CanonicalDampfRefill(){
  if(v294RefillPending)return false;
  v294RefillPending=true;
  try{
    if(typeof v073User==='undefined'||!v073User?.id||typeof v073Db==='undefined'||!v073Db){
      v115Alert?.('Dampf-Kauf erst nach vollständiger Anmeldung möglich. Bitte erneut versuchen.');
      return false;
    }
    /* A prior quest/cloud hydration may still display an outdated balance.
       Check both canonical domains before offering a paid purchase. */
    try{
      await Promise.allSettled([
        typeof window.v7110SyncQuestAuthority==='function'?window.v7110SyncQuestAuthority(true,false):Promise.resolve(),
        typeof window.v7077ProgressRefresh==='function'?window.v7077ProgressRefresh(false):Promise.resolve()
      ]);
    }catch(_){}
    v271EnsureRefillState();
    const active=!!v271DampfEventActive();
    const cap=active?300:100;
    const current=Math.max(0,Math.floor(Number(s?.energy)||0));
    const used=Math.max(0,Math.min(10,Number(s?.v271DampfRefill?.count)||0));
    if(used>=10)return v115Alert?.('Du hast heute bereits 10× Dampf aufgefüllt.');
    if(current>=cap)return v115Alert?.(`Dein Dampf ist bereits voll: ${cap}/${cap}.`);
    if((Number(s?.harzTaler)||0)<1)return v115Alert?.('Du hast keinen Harz-Taler mehr.');

    const add=Math.min(20,cap-current);
    const ok=typeof v115Confirm==='function'
      ? await v115Confirm(`1 Harz-Taler einsetzen und +${add} Dampf erhalten?`,{title:'Dampf auffüllen',okText:'Auffüllen'})
      : confirm(`1 Harz-Taler einsetzen und +${add} Dampf erhalten?`);
    if(!ok)return false;

    const requestId='dampf_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
    const {data,error}=await v073Db.rpc('v7044_refill_dampf',{p_request_id:requestId});
    if(error)throw error;
    const q=Array.isArray(data)?(data[0]||null):data;
    if(!q?.ok){
      const reason=String(q?.reason||'REFILL_REJECTED');
      const msg={
        REFILL_LIMIT:'Du hast heute bereits 10× Dampf aufgefüllt.',
        DAMPF_FULL:`Dein Dampf ist bereits voll: ${cap}/${cap}.`,
        INSUFFICIENT_HARZ:'Du hast keinen Harz-Taler mehr.',
        QUEST_RECEIPT_PENDING:'Bitte zuerst die offene Quest-Belohnung abschließen.'
      }[reason]||'Dampf konnte nicht aufgefüllt werden.';
      v115Alert?.(msg);
      return false;
    }
    if(q.energy!=null&&Number.isFinite(Number(q.energy)))s.energy=Math.max(0,Number(q.energy));
    if(q.harz!=null&&Number.isFinite(Number(q.harz)))s.harzTaler=Math.max(0,Number(q.harz));
    s.v271DampfRefill??={day:typeof v271DayKey==='function'?v271DayKey():'',count:0};
    if(q.refills!=null&&Number.isFinite(Number(q.refills)))s.v271DampfRefill.count=Math.max(0,Number(q.refills));
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
    try{v271PaintDampf();window.v069SyncCurrencies?.();window.v441PaintResources?.();window.v085InstallWorld?.(false)}catch(_){}
    return true;
  }catch(e){
    console.warn('[V8.303] server Dampf refill',e);
    try{window.v063Toast?.('Dampf-Kauf nicht bestätigt','error','Serverstand wird erneut abgeglichen. Bitte den Bestand prüfen.')}catch(_){}
    try{await Promise.allSettled([
      typeof window.v7110SyncQuestAuthority==='function'?window.v7110SyncQuestAuthority(true,true):Promise.resolve(),
      typeof window.v7077ProgressRefresh==='function'?window.v7077ProgressRefresh(true):Promise.resolve()
    ])}catch(_){}
    return false;
  }finally{
    v294RefillPending=false;
    try{v271PaintDampf();window.v069SyncCurrencies?.()}catch(_){}
  }
}
try{v271RefillDampf=v294CanonicalDampfRefill;window.v271RefillDampf=v294CanonicalDampfRefill;v026Refill=v294CanonicalDampfRefill;window.v026Refill=v294CanonicalDampfRefill}catch(_){}

v271PaintDampf=function(){
  v271EnsureRefillState();

  const card=v284BuildDampfCard();
  if(!card)return;

  const active=v271DampfEventActive();
  const cap=active?300:100;
  let current=Math.max(0,Math.floor(Number(s.energy)||0));
  if(current>cap)current=cap;
  if(Number(s.energy)!==current)s.energy=current;

  card.classList.toggle('v288-dampf-event-active',active);

  const energyEl=card.querySelector('#energy');
  if(energyEl)energyEl.textContent=`${current}/${cap}`;

  const eventEl=card.querySelector('#v284DampfEvent');
  if(eventEl){
    eventEl.style.display=active?'inline-flex':'none';
    if(active)eventEl.textContent='💨 DAMPF-EVENT AKTIV';
  }

  const used=Math.max(0,Math.min(10,Number(s.v271DampfRefill?.count)||0));
  const refillText=card.querySelector('#v284DampfRefills');
  if(refillText){
    refillText.textContent=`Auffüllungen: ${used}/10`;
    refillText.style.display='block';
  }

  const btn=card.querySelector('#v026RefillBtn');
  if(btn){
    btn.textContent='+20 Dampf kaufen · 1 Harz';
    btn.style.display='inline-flex';
    btn.disabled=v294RefillPending || used>=10 || current>=cap;
    btn.onclick=v294CanonicalDampfRefill;
  }
};
v026PaintDampf=v271PaintDampf;

const v294BaseRender=render;
render=function(){
  const r=v294BaseRender.apply(this,arguments);
  v271PaintDampf();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

try{v271PaintDampf();}catch(e){}


const v294Line=document.querySelector('#v141VersionLine');
