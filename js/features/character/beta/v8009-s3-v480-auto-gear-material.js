(function(){
  const VERSION='V4.80',SHORT='V4.80';
  const SLOTS=['head','weapon','body','boots','ring','amulet'];
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const QUALITY={gray:0,green:1,blue:2,purple:3,orange:4,cyan:5};
  let busy=false;

  function stamp(){}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function qRank(x){return QUALITY[String(x?.quality||'gray').toLowerCase()]??0}
  function currentUid(){try{const u=typeof v073User!=='undefined'?v073User:null;return u?.id&&!u.is_anonymous?String(u.id):''}catch(e){return ''}}
  function accountVerified(){const id=currentUid();if(!id)return true;try{return typeof window.v452AccountVerified==='function'?!!window.v452AccountVerified(id):true}catch(e){return false}}
  function accountOwned(){
    const id=currentUid();if(!id)return true;
    try{return String(s?.__accountOwnerId||'')===id && String(s?.social?.playerId||'')===id}catch(e){return false}
  }
  function accountReady(){return accountVerified()||accountOwned()}
  const PENDING_PREFIX='growLegendsV486AutoPending:';
  function pendingKey(){const id=currentUid();return id?PENDING_PREFIX+id:''}
  function readPending(){
    const k=pendingKey();if(!k)return {};
    try{const x=JSON.parse(sessionStorage.getItem(k)||'{}');return x&&typeof x==='object'?x:{}}catch(e){return {}}
  }
  function queuePending(kind){
    const k=pendingKey();if(!k)return;
    const x=readPending();x[kind]=true;x.at=Date.now();
    try{sessionStorage.setItem(k,JSON.stringify(x))}catch(e){}
  }
  function clearPending(){const k=pendingKey();if(k)try{sessionStorage.removeItem(k)}catch(e){}}
  function isGear(it){return !!(it&&typeof it==='object'&&it.slot&&SLOTS.includes(it.slot)&&it.type!=='gem'&&it.type!=='scroll'&&it.type!=='material')}
  function classOk(it){return !it?.classId||!s?.playerClass||String(it.classId)===String(s.playerClass)}
  function normalize(it){
    if(!it||typeof it!=='object')return it;
    try{if(typeof v447ApplyItemCurve==='function')v447ApplyItemCurve(it)}catch(e){}
    try{if(typeof v122NormalizeSocketState==='function')v122NormalizeSocketState(it)}catch(e){}
    return it;
  }
  function pointTotal(it){normalize(it);return COMBAT.reduce((n,k)=>n+(Number(it?.bonus?.[k])||0),0)}
  function fallbackCompare(it){
    if(!isGear(it)||!classOk(it))return null;
    const old=s?.equipment?.[it.slot]||null,nt=pointTotal(it),ot=old?pointTotal(old):0,diff=nt-ot;
    return {state:!old?'free':diff>0?'better':diff<0?'worse':'same',newTotal:nt,oldTotal:ot,diff};
  }
  function compare(it){
    try{if(typeof window.v470CompareItem==='function')return window.v470CompareItem(it)}catch(e){}
    return fallbackCompare(it);
  }
  function betterTie(a,b){
    if(!b)return true;
    const ac=compare(a),bc=compare(b),as=Number(ac?.newTotal??pointTotal(a))||0,bs=Number(bc?.newTotal??pointTotal(b))||0;
    if(as!==bs)return as>bs;
    const aq=qRank(a),bq=qRank(b);if(aq!==bq)return aq>bq;
    return (Number(a?.dropLevel)||0)>(Number(b?.dropLevel)||0);
  }
  function gearValue(it){
    if(!it)return -1;
    normalize(it);
    try{
      const c=compare(it),v=Number(c?.newTotal);
      if(Number.isFinite(v))return v;
    }catch(e){}
    return pointTotal(it);
  }
  function gearRankCompare(a,b){
    const av=gearValue(a),bv=gearValue(b);if(av!==bv)return bv-av;
    const aq=qRank(a),bq=qRank(b);if(aq!==bq)return bq-aq;
    return (Number(b?.dropLevel)||0)-(Number(a?.dropLevel)||0);
  }
  function frostWeaponPairPlan(inv){
    if(String(s?.playerClass||'')!=='frost')return null;
    const eq=s?.equipment||{};
    const candidates=[eq.weapon,eq.weapon2,
      ...inv.filter(it=>it&&typeof it==='object'&&String(it.slot||'')==='weapon'&&it.type!=='gem'&&it.type!=='scroll'&&it.type!=='material'&&classOk(it))
    ].filter(Boolean);
    const unique=[];const seen=new Set();
    candidates.forEach(it=>{
      const key=String(it?.id||it?.uid||'');
      if(key){if(seen.has(key))return;seen.add(key)}
      else if(unique.includes(it))return;
      unique.push(it);
    });
    unique.forEach(normalize);
    unique.sort(gearRankCompare);
    const main=unique[0]||null,off=unique[1]||null;
    const changes=(eq.weapon!==main?1:0)+(eq.weapon2!==off?1:0);
    return changes?{kind:'frostWeapons',weapon:main,weapon2:off,currentWeapon:eq.weapon||null,currentWeapon2:eq.weapon2||null,changes}:null;
  }
  function autoEquipPlan(){
    const inv=Array.isArray(s?.inventory)?s.inventory:[];
    const plan=[];
    const frost=String(s?.playerClass||'')==='frost';

    SLOTS.forEach(slot=>{
      /* Frost weapons are planned together so Waffe II is never ignored. */
      if(frost&&slot==='weapon')return;
      const current=s?.equipment?.[slot]||null;
      let best=null,bestCmp=null;
      inv.forEach(it=>{
        if(!isGear(it)||it.slot!==slot||!classOk(it))return;
        normalize(it);const c=compare(it);if(!c)return;
        const eligible=!current?c.state==='free':c.state==='better';
        if(!eligible)return;
        if(!best||betterTie(it,best)){best=it;bestCmp=c}
      });
      if(best)plan.push({slot,item:best,comparison:bestCmp,current});
    });

    if(frost){
      const pair=frostWeaponPairPlan(inv);
      if(pair)plan.unshift(pair);
    }
    return plan;
  }
  function autoEquipCount(){
    return autoEquipPlan().reduce((n,p)=>n+(p?.kind==='frostWeapons'?Math.max(1,Number(p.changes)||1):1),0);
  }

  function primaryKey(){
    try{if(typeof v267PrimaryKey==='function')return v267PrimaryKey()}catch(e){}
    return s?.playerClass==='scout'?'geschick':(s?.playerClass==='bruiser'||s?.playerClass==='summoner')?'intelligenz':'staerke';
  }
  function gemScore(g){
    if(!g)return -1;
    const v=Math.max(0,Number(g.value)||0),stat=String(g.stat||''),pk=primaryKey();
    const w=stat===pk?6:stat==='ausdauer'?2:stat==='glueck'?1:.15;
    return v*w;
  }
  function scrollScore(r){
    if(!r)return -1;
    const v=Math.max(0,Number(r.value)||0),e=String(r.effect||'');
    const w=e==='primaryPct'?1.4:e==='damageReduce'?1.1:e==='crit'?1:e==='luck'?0.8:0.7;
    return v*w;
  }
  function materialTie(a,b,scoreFn){
    const as=scoreFn(a),bs=scoreFn(b);if(as!==bs)return bs-as;
    const aq=qRank(a),bq=qRank(b);if(aq!==bq)return bq-aq;
    return (Number(b?.value)||0)-(Number(a?.value)||0);
  }
  function currentEnchant(it){return (Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null}
  function materialPlan(){
    const equipped=SLOTS.map(slot=>({slot,it:s?.equipment?.[slot]})).filter(x=>x.it&&typeof x.it==='object');
    equipped.forEach(x=>normalize(x.it));
    const mats=Array.isArray(s?.materials)?s.materials:[];
    const gems=mats.filter(m=>m?.type==='gem'&&Number(m.value)>0&&m.stat).slice().sort((a,b)=>materialTie(a,b,gemScore));
    const scrolls=mats.filter(m=>m?.type==='scroll'&&Number(m.value)>0&&m.effect).slice().sort((a,b)=>materialTie(a,b,scrollScore));

    function assign(materials,existingFn,scoreFn){
      const targets=equipped.map(x=>({...x,current:existingFn(x.it)}));
      const out=[];
      materials.forEach(mat=>{
        let chosenIndex=-1,chosenPriority=Infinity;
        targets.forEach((t,i)=>{
          if(t.used)return;
          const cur=t.current,curScore=cur?scoreFn(cur):-1,newScore=scoreFn(mat);
          const eligible=!cur || newScore>curScore+1e-9;
          if(!eligible)return;
          /* Fill empty/weakest slots first. Strongest materials are processed first. */
          const priority=cur?curScore:-1000000;
          if(priority<chosenPriority){chosenPriority=priority;chosenIndex=i}
        });
        if(chosenIndex>=0){const t=targets[chosenIndex];t.used=true;out.push({slot:t.slot,it:t.it,material:mat,replaces:t.current||null})}
      });
      return out;
    }
    const gemAssignments=assign(gems,it=>it?.gem||null,gemScore);
    const scrollAssignments=assign(scrolls,currentEnchant,scrollScore);
    return {gemAssignments,scrollAssignments};
  }

  function removeGem(it){
    try{if(typeof v122RemoveGem==='function'){v122RemoveGem(it);return}}catch(e){}
    const g=it?.gem;if(!g)return;const v=Number(g.value)||0,stat=g.stat;
    if(stat&&v&&it?.bonus)it.bonus[stat]=Math.max(0,(Number(it.bonus[stat])||0)-v);
    it.gem=null;
  }
  function removeEnchant(it){
    try{if(typeof v122RemoveEnchant==='function'){v122RemoveEnchant(it);return}}catch(e){}
    const e=currentEnchant(it);if(e?.effect==='luck'&&Number(e.value)&&it?.bonus)it.bonus.glueck=Math.max(0,(Number(it.bonus.glueck)||0)-Number(e.value));
    it.enchant=null;it.enchants=[];
  }
  function applyGem(it,mat){
    it.bonus??={};removeGem(it);
    const value=Math.max(0,Number(mat.value)||0),stat=String(mat.stat||'');
    it.gem={name:mat.name,icon:mat.icon||'💎',stat,value,quality:mat.quality||'gray'};
    it.bonus[stat]=(Number(it.bonus[stat])||0)+value;
  }
  function applyScroll(it,mat){
    it.bonus??={};removeEnchant(it);
    const value=Math.max(0,Number(mat.value)||0),effect=String(mat.effect||'');
    const e={name:mat.name,icon:mat.icon||'📜',effect,value,quality:mat.quality||'gray'};
    it.enchant=e;it.enchants=[e];
    if(effect==='luck')it.bonus.glueck=(Number(it.bonus.glueck)||0)+value;
  }
  function paintImmediate(){
    try{if(typeof render==='function')render()}catch(e){console.warn('V4.86 render',e)}
    try{window.v470PaintEquipmentSlots?.()}catch(e){}
    try{window.v459CompactInventory?.()}catch(e){}
    try{window.v459ArrangeCharacter?.()}catch(e){}
    setTimeout(updateBars,20);
  }
  function persistBackground(){
    setTimeout(()=>{
      try{if(typeof persist==='function')persist(false);else localStorage.setItem(KEY,JSON.stringify(s))}catch(e){console.warn('V4.86 persist',e)}
      try{if(typeof v075ScheduleSave==='function')v075ScheduleSave()}catch(e){}
      try{if(typeof v106CheckAchievements==='function')v106CheckAchievements(true)}catch(e){}
    },0);
  }
  function saveAndRender(deferKind=''){
    /* V4.86: gameplay reacts first. Account/cloud persistence must never hold up the tap. */
    paintImmediate();
    if(deferKind&&!accountVerified()){queuePending(deferKind);setTimeout(flushPending,1000);return false}
    persistBackground();
    return true;
  }
  function toast(title,type,text){
    try{if(typeof v063Toast==='function')return v063Toast(title,type,text)}catch(e){}
    try{if(typeof v115Alert==='function')return v115Alert(text,title,type)}catch(e){}
  }

  function applyAutoEquipPlan(){
    const plan=autoEquipPlan();let done=0;

    /* Apply Frost weapon pair atomically: strongest -> Waffe I, second -> Waffe II. */
    const pair=plan.find(p=>p?.kind==='frostWeapons');
    if(pair){
      s.equipment=(s.equipment&&typeof s.equipment==='object')?s.equipment:{};
      const old=[s.equipment.weapon,s.equipment.weapon2].filter(Boolean);
      const wanted=[pair.weapon,pair.weapon2].filter(Boolean);
      s.inventory=(Array.isArray(s.inventory)?s.inventory:[]).filter(it=>!wanted.includes(it));
      s.equipment.weapon=pair.weapon||null;
      s.equipment.weapon2=pair.weapon2||null;
      old.forEach(it=>{if(!wanted.includes(it)&&!s.inventory.includes(it))s.inventory.push(it)});
      done+=Math.max(1,Number(pair.changes)||1);
    }

    plan.filter(p=>p?.kind!=='frostWeapons').forEach(p=>{
      const idx=s.inventory.indexOf(p.item);if(idx<0)return;
      const old=s.equipment?.[p.slot]||null;
      const next=s.inventory.splice(idx,1)[0];
      s.equipment[p.slot]=next;if(old)s.inventory.push(old);done++;
    });
    return done;
  }
  async function autoEquip(){
    if(busy)return;
    if(!accountReady())return toast('Accountwechsel läuft','info','Der sichtbare Spielstand gehört noch nicht eindeutig zu diesem Account. Bitte einen Moment warten.');
    const plan=autoEquipPlan();
    if(!plan.length)return toast('Ausrüstung bereits optimal','info','Im Inventar liegt aktuell kein Item, das laut Vergleich besser ist als deine angelegte Ausrüstung.');
    busy=true;
    try{
      const before=(()=>{try{return Number(combatPower())||0}catch(e){return 0}})();
      const done=applyAutoEquipPlan();
      const deferred=!accountVerified();
      saveAndRender(deferred?'equip':'');
      const after=(()=>{try{return Number(combatPower())||0}catch(e){return before}})();
      const delta=after-before;
      toast('⚡ Beste Ausrüstung angelegt','success',`${done} Gegenständ${done===1?'':'e'} automatisch angelegt${delta!==0?` · Kampfkraft ${delta>0?'+':''}${delta}`:''}${deferred?' · Speicherung läuft im Hintergrund':''}.`);
    }finally{busy=false;updateBars()}
  }
  window.v480AutoEquip=autoEquip;

  async function autoMaterials(){
    if(busy)return;if(!accountReady())return toast('Accountwechsel läuft','info','Der sichtbare Spielstand gehört noch nicht eindeutig zu diesem Account. Bitte einen Moment warten.');
    const plan=materialPlan(),g=plan.gemAssignments.length,r=plan.scrollAssignments.length;
    if(!g&&!r)return toast('Keine bessere automatische Verwendung','info','Alle ausgerüsteten Plätze haben bereits gleichwertige/bessere Materialien oder es sind keine passenden Steine/Rollen vorhanden.');
    const replacements=plan.gemAssignments.filter(x=>x.replaces).length+plan.scrollAssignments.filter(x=>x.replaces).length;
    let ok=true;
    if(typeof v115Confirm==='function'){
      ok=await v115Confirm(
        `Automatisch werden ${g} Edelstein${g===1?'':'e'} und ${r} Rolle${r===1?'':'n'} eingesetzt.\n\nDie stärksten Materialien werden zuerst verwendet.${replacements?` ${replacements} vorhandene schwächere Sockel/Verzauberung${replacements===1?' wird':'en werden'} ersetzt und dabei entfernt.`:''}\n\nSchwächere übrige Materialien bleiben im Inventar.`,
        {title:'✨ Auto-Sockeln & Rollen',type:'confirm',okText:'Automatisch einsetzen'}
      );
    }
    if(!ok)return;
    busy=true;
    try{
      const used=new Set();
      plan.gemAssignments.forEach(x=>{applyGem(x.it,x.material);used.add(x.material)});
      plan.scrollAssignments.forEach(x=>{applyScroll(x.it,x.material);used.add(x.material)});
      s.materials=(Array.isArray(s.materials)?s.materials:[]).filter(m=>!used.has(m));
      const deferred=!accountVerified();
      saveAndRender(deferred?'materials':'');
      toast('✨ Materialien automatisch eingesetzt','success',`${g} Edelstein${g===1?'':'e'} · ${r} Rolle${r===1?'':'n'} verwendet. Die stärksten wurden zuerst verteilt.${deferred?' Speicherung läuft im Hintergrund.':''}`);
    }finally{busy=false;updateBars()}
  }
  window.v480AutoMaterials=autoMaterials;

  function flushPending(){
    if(!accountVerified())return false;
    const pending=readPending();if(!pending.equip&&!pending.materials)return false;
    try{
      if(pending.equip)applyAutoEquipPlan();
      if(pending.materials){
        const p=materialPlan(),used=new Set();
        p.gemAssignments.forEach(x=>{applyGem(x.it,x.material);used.add(x.material)});
        p.scrollAssignments.forEach(x=>{applyScroll(x.it,x.material);used.add(x.material)});
        if(used.size)s.materials=(Array.isArray(s.materials)?s.materials:[]).filter(m=>!used.has(m));
      }
      clearPending();paintImmediate();persistBackground();
      return true;
    }catch(e){console.warn('V4.86 pending auto action',e);return false}
  }
  window.v486FlushPendingAuto=flushPending;

  function ensureBar(panel,id,title,sub,buttonText,onclick){
    if(!panel)return null;
    let bar=document.getElementById(id);
    if(!bar){
      bar=document.createElement('div');bar.id=id;bar.className='v480-auto-bar';
      bar.innerHTML=`<div class="v480-auto-copy"><b>${esc(title)}</b><span>${esc(sub)}</span></div><button type="button" class="btn v480-auto-btn"></button>`;
    }
    if(bar.parentElement!==panel)panel.insertBefore(bar,panel.firstChild);
    const btn=bar.querySelector('button');if(btn){btn.textContent=buttonText;btn.onclick=onclick;btn.disabled=busy}
    return bar;
  }
  function updateBars(){
    try{
      const character=document.getElementById('character');
      if(!character||!character.classList.contains('active')){stamp();return}
      const invPanel=document.getElementById('v459PanelInventory');
      const matPanel=document.getElementById('v459PanelMaterials');
      const improvements=autoEquipCount();
      const p=materialPlan(),uses=p.gemAssignments.length+p.scrollAssignments.length;
      const ib=ensureBar(invPanel,'v480EquipAutoBar','⚡ Automatische Ausrüstung',improvements?`${improvements} echte Verbesserung${improvements===1?'':'en'} im Inventar gefunden.`:'Keine bessere Ausrüstung gefunden.',improvements?'⚡ Beste Ausrüstung anlegen':'✓ Ausrüstung optimal',autoEquip);
      if(ib){const btn=ib.querySelector('button');if(btn)btn.disabled=busy||improvements===0}
      const mb=ensureBar(matPanel,'v480MaterialAutoBar','💎 Auto-Sockeln & Rollen',uses?`${p.gemAssignments.length} Stein${p.gemAssignments.length===1?'':'e'} + ${p.scrollAssignments.length} Rolle${p.scrollAssignments.length===1?'':'n'} sinnvoll einsetzbar.`:'Keine bessere automatische Belegung möglich.','✨ Beste Steine & Rollen einsetzen',autoMaterials);
      if(mb){const btn=mb.querySelector('button');if(btn)btn.disabled=busy||uses===0}
    }catch(e){console.warn('V4.80 bars',e)}
    stamp();
  }
  window.v480UpdateAutoBars=updateBars;

  /* V4.86: if the user taps while the same-account cloud handshake is still finishing,
     replay the intent once the verified state is final. This preserves account isolation
     without blocking inventory interaction. */
  try{if(typeof v200FinalizeUser==='function'&&!window.__v486AutoFinalizeWrapped){
    const base=v200FinalizeUser;v200FinalizeUser=async function(){const r=await base.apply(this,arguments);setTimeout(flushPending,0);return r};
    try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}window.__v486AutoFinalizeWrapped=true;
  }}catch(e){}

  /* Targeted hooks only; no permanent MutationObservers or fast intervals. */
  try{if(typeof window.v459ArrangeCharacter==='function'&&!window.__v480ArrangeWrapped){const base=window.v459ArrangeCharacter;window.v459ArrangeCharacter=function(){const x=base.apply(this,arguments);updateBars();return x};window.__v480ArrangeWrapped=true}}catch(e){}
  try{if(typeof renderInventory==='function'&&!window.__v480InventoryWrapped){const base=renderInventory;renderInventory=function(){const x=base.apply(this,arguments);updateBars();return x};window.renderInventory=renderInventory;window.__v480InventoryWrapped=true}}catch(e){}
  try{if(typeof v030RenderMaterials==='function'&&!window.__v480MaterialsWrapped){const base=v030RenderMaterials;v030RenderMaterials=function(){const x=base.apply(this,arguments);updateBars();return x};window.v030RenderMaterials=v030RenderMaterials;window.__v480MaterialsWrapped=true}}catch(e){}
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')updateBars()});window.__v480GoWrapped='v7119-event';

  stamp();updateBars();
  document.addEventListener('DOMContentLoaded',()=>{stamp();updateBars()},{once:true});
  window.addEventListener('pageshow',()=>{stamp();updateBars()},{passive:true});
  window.addEventListener('growlegends:account-ready',updateBars,{passive:true});[1000,3000,7000].forEach(ms=>setTimeout(flushPending,ms));
})();
