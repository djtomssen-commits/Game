(()=>{
 'use strict';
 if(window.__V7063_SERVER_ITEM_STAGE__)return;
 window.__V7063_SERVER_ITEM_STAGE__=true;
 const VERSION='V7.091';
 const S={ready:false,enabled:false,busy:false,lastError:'',actions:0,last:null};
 let gateP=null,chain=Promise.resolve(),lastStageRefreshAt=0;
 const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
 const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return ''}};
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
 const row=d=>Array.isArray(d)?d[0]:d;
 const legacyBuyWeapon=typeof window.v030BuyWeapon==='function'?window.v030BuyWeapon:null;
 const legacyBuyMagic=typeof window.v030BuyMagic==='function'?window.v030BuyMagic:null;
 const legacySellSelected=typeof window.v268SellSelected==='function'?window.v268SellSelected:null;
 const legacyAutoEquip=typeof window.v480AutoEquip==='function'?window.v480AutoEquip:null;
 const legacyAutoMaterials=typeof window.v480AutoMaterials==='function'?window.v480AutoMaterials:null;
 const rawRenderShop=typeof window.renderShop==='function'?window.renderShop:null;
 let shopPaintCalls=0,shopPaintExec=0,lastShopPaint=0,lastShopViewSig='';
 const offerId=x=>String(x?.id||x?.uid||'');
 const offerViewSig=x=>JSON.stringify([
   offerId(x),x?.name||'',x?.quality||'',x?.rarity||'',Number(x?.price)||0,
   x?.type||'',x?.slot||'',x?.classId||'',x?.stat||'',Number(x?.value)||0,
   x?.effect||'',x?.bonus||null,x?.gem||null,x?.enchant||null,x?.enchants||null
 ]);
 const shopSig=()=>[
   ...(Array.isArray(s?.weaponShop)?s.weaponShop:[]).map(offerId),
   '|',
   ...(Array.isArray(s?.magicShop)?s.magicShop:[]).map(offerId)
 ].join('~');
 const shopViewSig=()=>JSON.stringify({
   weapon:(Array.isArray(s?.weaponShop)?s.weaponShop:[]).map(offerViewSig),
   magic:(Array.isArray(s?.magicShop)?s.magicShop:[]).map(offerViewSig),
   equipment:Object.fromEntries(Object.entries(s?.equipment||{}).map(([k,v])=>[k,offerViewSig(v)]))
 });
 function pruneLegacyShopTop(){
  const shop=document.getElementById('shop');if(!shop)return false;
  const hero=document.getElementById('v461ShopHero');
  if(hero){
   /* V8.009: the canonical Bork/Mira hero is the first visible shop block.
      Any legacy NPC/header/card inserted before it is obsolete. */
   let n=shop.firstElementChild;
   while(n&&n!==hero){
    const next=n.nextElementSibling;
    n.remove();
    n=next;
   }
  }
  shop.querySelectorAll('*').forEach(el=>{
   if(el.closest?.('#v461ShopHero'))return;
   const t=String(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(!t)return;
   if(t.startsWith('⚖️ werte steigen jetzt klar mit der seltenheit')||
      t.startsWith('werte steigen jetzt klar mit der seltenheit')){
    const box=el.closest?.('#v055RarityHint,.card,[class*="hint"],[class*="rarity"],div,p')||el;
    if(box!==shop&&!box.closest?.('#v461ShopHero'))box.remove();
   }
   if((t.includes('händler von grünhain')||t.includes('haendler von gruenhain'))&&
      !el.closest?.('#v461ShopHero')){
    const box=el.closest?.('.card,[class*="npc"],[class*="dealer"],[class*="merchant"],div')||el;
    if(box!==shop&&!box.closest?.('#v461ShopHero'))box.remove();
   }
  });
  return true;
 }
 function stableRenderShop(force=false){
  shopPaintCalls++;
  if(typeof rawRenderShop!=='function')return false;
  const shop=document.getElementById('shop');
  pruneLegacyShopTop();
  if(!window.v7081UseAuthority?.('items')){
   const r=rawRenderShop.apply(this,arguments);
   pruneLegacyShopTop();
   return r;
  }
  if(!force&&!shop?.classList.contains('active'))return false;
  const sig=shopViewSig();
  const domReady=!!(
    document.getElementById('v461ShopHero')&&
    document.getElementById('v057WeaponGrid')&&
    document.getElementById('v057MagicGrid')
  );
  if(!force&&domReady&&sig===lastShopViewSig)return false;
  lastShopPaint=performance.now();
  shopPaintExec++;
  const r=rawRenderShop.apply(this,arguments);
  pruneLegacyShopTop();
  lastShopViewSig=shopViewSig();
  return r;
 }
 if(rawRenderShop){
  stableRenderShop.__v7084=true;
  try{window.renderShop=stableRenderShop}catch(_){}
  try{renderShop=stableRenderShop}catch(_){}
 }
 const itemId=it=>String(it?.id||it?.uid||'');
 function req(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${r.slice(0,24)}`}
 function toast(title,type='info',detail=''){try{return window.v063Toast?.(title,type,detail)}catch(_){try{return window.v115Alert?.(detail||title,title,type)}catch(__){}}}
 async function confirmBox(text,opt={}){try{if(typeof v115Confirm==='function')return !!(await v115Confirm(text,opt))}catch(_){}return window.confirm(text)}
 function apply(r,{paint=true}={}){
  if(!r||r.ok!==true)return false;
  const beforeShop=shopSig();
  const beforeInv=JSON.stringify([
   (Array.isArray(s?.inventory)?s.inventory:[]).map(offerId),
   Object.values(s?.equipment||{}).filter(Boolean).map(offerId),
   (Array.isArray(s?.materials)?s.materials:[]).map(offerId)
  ]);
  if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);
  if(r.equipment&&typeof r.equipment==='object')s.equipment=clone(r.equipment);
  if(Array.isArray(r.materials))s.materials=clone(r.materials);
  if(Array.isArray(r.weaponShop))s.weaponShop=clone(r.weaponShop);
  if(Array.isArray(r.magicShop))s.magicShop=clone(r.magicShop);
  s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};
  if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));
  if(Number.isFinite(Number(r.gold)))s.gold=Math.max(0,Number(r.gold));
  if(Number.isFinite(Number(r.harz)))s.harzTaler=Math.max(0,Number(r.harz));
  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
  if(paint){
   const afterShop=shopSig();
   const afterInv=JSON.stringify([
    (Array.isArray(s?.inventory)?s.inventory:[]).map(offerId),
    Object.values(s?.equipment||{}).filter(Boolean).map(offerId),
    (Array.isArray(s?.materials)?s.materials:[]).map(offerId)
   ]);
   try{
    const shop=document.getElementById('shop');
    if(shop?.classList.contains('active')&&beforeShop!==afterShop)stableRenderShop();
   }catch(_){}
   try{
    const ch=document.getElementById('character');
    if(ch?.classList.contains('active')&&beforeInv!==afterInv)renderInventory?.();
   }catch(_){}
   try{window.v470PaintEquipmentSlots?.()}catch(_){}
   try{window.v448PaintPower?.()}catch(_){}
   try{window.v069SyncCurrencies?.()}catch(_){}
   try{window.v441PaintResources?.()}catch(_){}
   try{window.v488ForgeRender?.()}catch(_){}
  }
  S.actions++;S.last={at:Date.now(),revision:Number(r.revision)||0};return true;
 }
 function q(fn){const task=()=>Promise.resolve().then(fn);chain=chain.then(task,task);return chain}
 async function itemAuthorityActive(){
  try{
   if(window.v7081UseAuthority?.('items'))return true;
   const d=window.v7081CapabilitiesDiagnostics?.();
   if(!d?.ready)await window.v7081CapabilitiesRefresh?.();
   return !!window.v7081UseAuthority?.('items');
  }catch(_){return false}
 }
 async function loadStage(force=false){
  if(!window.v7081UseAuthority?.('items')){S.ready=true;S.enabled=false;return false;}
  if(!force&&S.ready)return S.enabled;
  if(gateP)return gateP;
  gateP=(async()=>{
   try{
    const x=db();if(!x||!uid()){S.ready=true;S.enabled=false;return false}
    const {data,error}=await x.rpc('v7063_shop_state');if(error)throw error;
    const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'ITEM_STAGE_NOT_READY'));
    S.ready=true;S.enabled=true;S.lastError='';apply(r,{paint:true});return true;
   }catch(e){
    S.ready=true;S.enabled=false;S.lastError=String(e?.message||e||'');
    if(!/ITEM_STAGE_NOT_ENABLED/i.test(S.lastError))console.warn('[V7063] stage gate',e);
    return false;
   }finally{gateP=null}
  })();return gateP;
 }
 async function rpc(name,args){const x=db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args||{});if(error)throw error;const r=row(data);if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));apply(r);return r}

 /* Server-owned Händler offers + purchases. */
 async function buy(kind,i,argsLike=null,ctx=null){
  const idx=Number(i);
  const visibleOffer=kind==='weapon'?s?.weaponShop?.[idx]:s?.magicShop?.[idx];
  const expectedItemId=offerId(visibleOffer);
  const active=await itemAuthorityActive();
  if(!active){
   const base=kind==='weapon'?legacyBuyWeapon:legacyBuyMagic;
   if(typeof base==='function')return base.apply(ctx,argsLike||[i]);
   return false;
  }
  if(!expectedItemId){
   toast('Kauf gestoppt','info','Das sichtbare Händlerangebot ist noch nicht vollständig geladen.');
   await loadStage(true);
   stableRenderShop(true);
   return false;
  }
  if(!(await loadStage()))return false;
  const currentOffer=kind==='weapon'?s?.weaponShop?.[idx]:s?.magicShop?.[idx];
  if(offerId(currentOffer)!==expectedItemId){
   stableRenderShop(true);
   toast('Händler aktualisiert','info','Das Angebot hat sich geändert. Bitte das jetzt sichtbare Item erneut kaufen.');
   return false;
  }
  return q(async()=>{try{
   const r=await rpc('v7097_buy_shop_item',{
    p_kind:kind,
    p_index:idx,
    p_request_id:req('v7097_buy'),
    p_expected_item_id:expectedItemId
   });
   toast('🛒 Server-Kauf bestätigt','success',`-${Number(r.price)||0} Gold`);
   if(r?.bought&&!['gem','scroll','material'].includes(String(r.bought?.type||'')))void window.v7097ShowItemResult?.(r.bought,'🛒 Händlerkauf');
   return true;
  }catch(e){
   S.lastError=String(e?.message||e);
   if(/SHOP_OFFER_CHANGED|EXPECTED_ITEM_ID_REQUIRED/i.test(S.lastError)){
    await loadStage(true);
    stableRenderShop(true);
    toast('Händler aktualisiert','info','Das Angebot war nicht mehr aktuell. Es wurde kein Gold abgezogen. Bitte erneut kaufen.');
    return false;
   }
   toast('Kauf abgelehnt','error',S.lastError);return false
  }})
 }
 try{
  const w=async function(i){return buy('weapon',i,arguments,this)};
  w.__v7063=true;window.v030BuyWeapon=w;try{v030BuyWeapon=w}catch(_){}
 }catch(e){console.warn('[V7063] weapon buy',e)}
 try{
  const w=async function(i){return buy('magic',i,arguments,this)};
  w.__v7063=true;window.v030BuyMagic=w;try{v030BuyMagic=w}catch(_){}
 }catch(e){console.warn('[V7063] magic buy',e)}
 document.addEventListener('click',ev=>{
  const b=ev.target?.closest?.('#v461RerollGear,#v461RerollMagic,#v057Reroll,#v030Refresh,#refreshShop');
  if(!b||!window.v7081UseAuthority?.('items'))return;

  /* Stop the historical local reroll synchronously. Waiting first lets the
     old onclick decrement Harz and generate a second shop before the RPC. */
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();

  const kind=b.matches('#v461RerollMagic')?'magic':'weapon';
  void q(async()=>{
   if(!(await loadStage()))return false;
   try{
    b.disabled=true;
    const r=await rpc('v7083_refresh_shop_section',{
      p_kind:kind,
      p_request_id:req('v7083_refresh')
    });
    if(r?.vip_free_reroll_used){
      try{
        if(window.v8195VipState&&typeof window.v8195VipState==='object'){
          window.v8195VipState={...window.v8195VipState,free_reroll_available:false};
          window.dispatchEvent(new CustomEvent('growlegends:vip-state',{detail:{state:window.v8195VipState}}));
        }else{window.renderShop?.()}
      }catch(_){}
      toast('👑 VIP-Freiwurf','success',kind==='weapon'?'Waffen & Rüstung gratis neu gewürfelt.':'Schmuck & Materialien gratis neu gewürfelt.');
    }else{
      toast(
        kind==='weapon'?'⚔️ Waffenhändler neu gewürfelt':'💎 Schmuckhändler neu gewürfelt',
        'success',
        `Harz-Taler: ${Number(r.harz)||0}`
      );
    }
    try{void window.v8195VipRefresh?.(true)}catch(_){}
    return true;
   }catch(e){
    S.lastError=String(e?.message||e);
    toast('Händler nicht neu gewürfelt','error',S.lastError);
    return false;
   }finally{b.disabled=false}
  });
 },true);

 /* Server-owned Harzschmiede. Authority clicks are captured synchronously,
    before any historical local handler can mutate inventory/currencies. */
 document.addEventListener('click',ev=>{
  const dismantleBtn=ev.target?.closest?.('#v488Dismantle');
  const craftBtn=ev.target?.closest?.('#v488Craft');
  if((!dismantleBtn&&!craftBtn)||!window.v7081UseAuthority?.('items'))return;

  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();

  if(dismantleBtn){
   void q(async()=>{
    if(!(await loadStage()))return false;
    const snap=window.v488ForgeSelectionSnapshot?.()||{};
    const ids=Array.isArray(snap.ids)?snap.ids.filter(Boolean):[];
    if(!ids.length)return false;
    const warning=Number(snap.valuable)>0?`\n\n⚠️ ${Number(snap.valuable)} epische/legendäre Gegenstände sind ausgewählt.`:'';
    const gains=[
      `${Number(snap.fragments)||0} Samenfragmente`,
      Number(snap.goldRefund)>0?`${Number(snap.goldRefund).toLocaleString('de-DE')} Gold Händler-Rückgewinnung`:null
    ].filter(Boolean).join(' + ');
    const ok=await confirmBox(
      `${ids.length} Gegenstand${ids.length===1?'':'e'} wirklich serverseitig zerlegen?\n\nVorschau: ${gains}.${warning}`,
      {title:'In der Harzschmiede zerlegen?',type:Number(snap.valuable)>0?'error':'warn',okText:`Zerlegen · ${ids.length} Item${ids.length===1?'':'s'}`}
    );
    if(!ok)return false;
    try{
      const r=await rpc('v7062_dismantle_items',{p_item_ids:ids,p_request_id:req('v7062_dismantle')});
      window.v488ForgeClearSelection?.();
      toast('🔨 Server-Zerlegung bestätigt','success',`${Number(r.removed)||ids.length} Item${(Number(r.removed)||ids.length)===1?'':'s'} · +${Number(r.fragments_awarded)||0} Fragmente${Number(r.gold_refund)>0?` · +${Number(r.gold_refund).toLocaleString('de-DE')} Gold`:''}`);
      return true;
    }catch(e){
      S.lastError=String(e?.message||e);
      toast('Zerlegen abgelehnt','error',S.lastError);
      return false;
    }
   });
   return;
  }

  void q(async()=>{
    if(!(await loadStage()))return false;
    const lv=Math.max(1,Math.min(300,Math.floor(Number(s?.level)||1))),tier=Math.floor((lv-1)/25),frag=150+tier*40;
    const gold=Math.max(1000,Math.round(typeof window.v6168PrismGoldCost==='function'?window.v6168PrismGoldCost(lv):(100000+tier*75000)));
    const ok=await confirmBox(`Prismatisches Item serverseitig schmieden?\n\n${frag} Samenfragmente\n${gold.toLocaleString('de-DE')} Gold`,{title:'🌈 Prismatisches Item schmieden',type:'confirm',okText:'Jetzt schmieden'});
    if(!ok)return false;
    try{
      const r=await rpc('v7097_forge_prismatic',{p_request_id:req('v7097_prism')});
      toast('🌈 Prismatisches Item geschmiedet!','success',String(r.item?.name||'Neues prismatisches Item'));
      if(r?.item)void window.v7097ShowItemResult?.(r.item,'🌈 Prismatisches Item geschmiedet');
      return true;
    }catch(e){
      S.lastError=String(e?.message||e);
      toast('Schmieden abgelehnt','error',S.lastError);
      return false;
    }
   });
 },true);

 /* Multi-Sell stays server-authoritative by selling each selected owned item through V7.062. */
 try{
  const w=async function(){
   if(!(await itemAuthorityActive())){
    if(typeof legacySellSelected==='function')return legacySellSelected.apply(this,arguments);
    return false;
   }
   if(!(await loadStage()))return false;
   let rows=[];try{rows=typeof v268SelectedRows==='function'?v268SelectedRows():[]}catch(_){}
   if(!rows.length)return false;
   const total=rows.reduce((n,x)=>n+(Number(typeof sellValue==='function'?sellValue(x.it):0)||0),0);
   const ok=await confirmBox(`${rows.length} Items serverseitig verkaufen?\n\nVoraussichtlich ${total} Gold`,{title:'Mehrfachverkauf',type:'warn',okText:`${rows.length} Items verkaufen`});if(!ok)return false;
   return q(async()=>{let got=0,n=0;try{for(const x of rows){const id=itemId(x.it);if(!id)continue;const r=await rpc('v7062_sell_item',{p_item_id:id,p_request_id:req('v7063_multisell')});got+=Number(r.sale_value)||0;n++}try{v268SelectedItems?.clear?.()}catch(_){};toast('💰 Mehrfachverkauf bestätigt','success',`${n} Items · +${got} Gold`);return true}catch(e){S.lastError=String(e?.message||e);toast('Mehrfachverkauf gestoppt','error',S.lastError);return false}})
  };w.__v7063=true;window.v268SellSelected=w;try{v268SellSelected=w}catch(_){}
 }catch(e){console.warn('[V7063] multi sell',e)}

 function classOk(it){return !it?.classId||String(it.classId)===String(s?.playerClass||'')}
 function qualityRank(it){const q=String(it?.quality||'').toLowerCase(),r=String(it?.rarity||'').toLowerCase();return /cyan|myth/.test(q+r)?7:/prism/.test(q+r)?6:/orange|legend/.test(q+r)?5:/purple|epic/.test(q+r)?4:/blue|rare/.test(q+r)?3:/green|uncommon/.test(q+r)?2:1}
 function rawScore(it){if(!it)return -1;try{const c=window.v470CompareItem?.(it);const v=Number(c?.newTotal);if(Number.isFinite(v))return v}catch(_){}let n=0;try{Object.values(it?.bonus||{}).forEach(v=>n+=Math.max(0,Number(v)||0));if(it?.v488Prismatic)n*=1.08}catch(_){}return n+qualityRank(it)*.0001+(Number(it?.dropLevel)||0)*.000001}
 function autoEquipProposal(){
  const inv=clone(Array.isArray(s?.inventory)?s.inventory:[]),eq=clone(s?.equipment&&typeof s.equipment==='object'?s.equipment:{}),cls=String(s?.playerClass||'');
  const id=x=>itemId(x);const gear=x=>x&&x.slot&&x.type!=='gem'&&x.type!=='scroll'&&x.type!=='material'&&classOk(x);
  function bestFor(slot){const pool=[eq[slot],...inv.filter(x=>gear(x)&&String(x.slot)===slot)].filter(Boolean);pool.sort((a,b)=>rawScore(b)-rawScore(a)||qualityRank(b)-qualityRank(a)||(Number(b?.dropLevel)||0)-(Number(a?.dropLevel)||0));return pool[0]||null}
  if(cls==='frost'){
   const pool=[eq.weapon,eq.weapon2,...inv.filter(x=>gear(x)&&String(x.slot)==='weapon')].filter(Boolean),seen=new Set(),u=[];
   pool.forEach(x=>{const k=id(x)||JSON.stringify(x);if(!seen.has(k)){seen.add(k);u.push(x)}});u.sort((a,b)=>rawScore(b)-rawScore(a)||qualityRank(b)-qualityRank(a));
   const w1=u[0]||null,w2=u[1]||null,keep=new Set([id(w1),id(w2)].filter(Boolean));
   const old=[eq.weapon,eq.weapon2].filter(Boolean);const nonWeapons=inv.filter(x=>String(x?.slot)!=='weapon'||!keep.has(id(x)));
   old.forEach(x=>{if(!keep.has(id(x))&&!nonWeapons.some(y=>id(y)===id(x)))nonWeapons.push(x)});
   eq.weapon=w1;eq.weapon2=w2;inv.splice(0,inv.length,...nonWeapons);
  }else{
   const b=bestFor('weapon');if(b&&id(eq.weapon)!==id(b)){const k=inv.findIndex(x=>id(x)===id(b));if(k>=0){const old=eq.weapon;eq.weapon=inv.splice(k,1)[0];if(old)inv.push(old)}}
  }
  ['head','body','boots','ring','amulet'].forEach(slot=>{const b=bestFor(slot);if(b&&id(eq[slot])!==id(b)){const k=inv.findIndex(x=>id(x)===id(b));if(k>=0){const old=eq[slot];eq[slot]=inv.splice(k,1)[0];if(old)inv.push(old)}}});
  const before=[...((s?.inventory)||[]).map(id),...Object.values(s?.equipment||{}).filter(Boolean).map(id)].sort().join('|');
  const after=[...inv.map(id),...Object.values(eq).filter(Boolean).map(id)].sort().join('|');
  const changed=before===after && JSON.stringify(eq)!==JSON.stringify(s?.equipment||{});
  return {inv,eq,changed};
 }
 window.v7097AutoEquipProposal=autoEquipProposal;
 function v7097EquipmentIds(eq){const out={};['head','body','boots','ring','amulet','weapon','weapon2'].forEach(sl=>out[sl]=itemId(eq?.[sl])||null);return out}
 try{
  const w=async function(){if(!(await itemAuthorityActive())){if(typeof legacyAutoEquip==='function')return legacyAutoEquip.apply(this,arguments);return false}if(!(await window.v7063ItemStageRefresh?.(true)))return false;const p=autoEquipProposal();if(!p.changed){toast('Ausrüstung bereits optimal','info','Keine bessere Ausrüstung gefunden.');return false}return q(async()=>{try{const r=await rpc('v7097_rearrange_item_ids',{p_event_id:req('v7097_autoequip'),p_equipment_ids:v7097EquipmentIds(p.eq)});toast('⚡ Server-Auto-Ausrüsten','success','Beste verfügbare Ausrüstung serverseitig angelegt.');try{window.v480UpdateAutoBars?.()}catch(_){}return true}catch(e){S.lastError=String(e?.message||e);toast('Auto-Ausrüsten abgelehnt','error',S.lastError);return false}})};w.__v7063=true;window.v480AutoEquip=w;
 }catch(e){console.warn('[V7063] auto equip',e)}

 function gemScore(g){if(!g)return-1;const v=Math.max(0,Number(g.value)||0),pk=String(s?.playerClass)==='scout'?'geschick':['bruiser','summoner'].includes(String(s?.playerClass))?'intelligenz':'staerke',st=String(g.stat||'');return v*(st===pk?6:st==='ausdauer'?2:st==='glueck'?1:.15)}
 function scrollScore(r){if(!r)return-1;const v=Math.max(0,Number(r.value)||0),e=String(r.effect||'');return v*(e==='primaryPct'?1.4:e==='damageReduce'?1.1:e==='crit'?1:e==='luck'?0.8:0.7)}
 function autoMaterialPlan(){
  const eq=Object.entries(s?.equipment||{}).filter(([,it])=>!!it),m=Array.isArray(s?.materials)?s.materials:[];
  function build(type,score,current){const targets=eq.map(([slot,it])=>({slot,it,current:current(it),used:false})),out=[];m.filter(x=>x?.type===type&&Number(x.value)>0).slice().sort((a,b)=>score(b)-score(a)||qualityRank(b)-qualityRank(a)).forEach(mat=>{let bi=-1,bp=Infinity;targets.forEach((t,i)=>{if(t.used)return;const cs=t.current?score(t.current):-1,ns=score(mat);if(t.current&&ns<=cs+1e-9)return;if(cs<bp){bp=cs;bi=i}});if(bi>=0){targets[bi].used=true;out.push({slot:targets[bi].slot,materialId:itemId(mat),name:mat.name})}});return out}
  return [
   ...build('gem',gemScore,it=>it?.gem||null),
   ...build('scroll',scrollScore,it=>(Array.isArray(it?.enchants)&&it.enchants.length?it.enchants[0]:it?.enchant)||null)
  ];
 }
 try{
  const w=async function(){if(!(await itemAuthorityActive())){if(typeof legacyAutoMaterials==='function')return legacyAutoMaterials.apply(this,arguments);return false}if(!(await loadStage()))return false;const plan=autoMaterialPlan();if(!plan.length){toast('Keine bessere automatische Verwendung','info','Materialien sind bereits optimal verteilt.');return false}const ok=await confirmBox(`${plan.length} Material${plan.length===1?'':'ien'} automatisch serverseitig einsetzen?`,{title:'✨ Auto-Sockeln & Rollen',type:'confirm',okText:'Automatisch einsetzen'});if(!ok)return false;return q(async()=>{let done=0;try{for(const p of plan){const r=await rpc('v7062_apply_material',{p_material_id:p.materialId,p_slot:p.slot,p_request_id:req('v7063_automaterial')});if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));apply(r,{paint:false});done++}try{renderInventory?.()}catch(_){}try{window.v470PaintEquipmentSlots?.()}catch(_){}try{window.v546RenderMaterials?.()}catch(_){}try{window.v480UpdateAutoBars?.()}catch(_){}toast('✨ Server-Automatik abgeschlossen','success',`${done} Material${done===1?'':'ien'} eingesetzt.`);return true}catch(e){S.lastError=String(e?.message||e);toast('Auto-Material gestoppt','error',S.lastError);return false}})};w.__v7063=true;window.v480AutoMaterials=w;
 }catch(e){console.warn('[V7063] auto materials',e)}

 window.v7063ItemStageDiagnostics=()=>clone({
  version:VERSION,...S,
  shopPaintCalls,shopPaintExec,
  shopSignature:shopSig()
 });
 window.v7063ItemStageRefresh=async(force=false)=>{
  if(!force&&S.ready&&Date.now()-lastStageRefreshAt<30000)return S.enabled;
  lastStageRefreshAt=Date.now();S.ready=false;
  const before=shopSig();
  const ok=await loadStage(true);
  const after=shopSig();
  try{
   if(ok){
    const shop=document.getElementById('shop');
    if(shop?.classList.contains('active')&&before!==after)stableRenderShop();
    window.v069SyncCurrencies?.();
    window.v441PaintResources?.();
   }
  }catch(_){}
  return ok
 };
 function boot(){
  if(window.v7206StartupBusy?.())return;
  S.ready=false;
  setTimeout(()=>void window.v7063ItemStageRefresh(),90);
 }
 window.addEventListener('growlegends:account-ready',boot,{passive:true});
 window.addEventListener('growlegends:first-playable',()=>setTimeout(()=>void window.v7063ItemStageRefresh(),1100),{passive:true});
 window.addEventListener('pageshow',()=>{if(!window.v7206StartupBusy?.())setTimeout(()=>void window.v7063ItemStageRefresh(),180)},{passive:true});
 window.addEventListener('growlegends:authority-capabilities-ready',e=>{
  if(e?.detail?.caps?.items&&!window.v7206StartupBusy?.())setTimeout(()=>void window.v7063ItemStageRefresh(),40);
 },{passive:true});
 setTimeout(()=>{if(!window.v7206StartupBusy?.())void window.v7063ItemStageRefresh()},850);
})();
