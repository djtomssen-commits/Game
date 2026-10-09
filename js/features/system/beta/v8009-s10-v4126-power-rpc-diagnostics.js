(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 let calculating=false;
 const BETA=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
 const paintStats={attempts:0,writes:0,coalesced:0,totalMs:0,maxMs:0};
 let powerFrame=0;
 /* V8.333 Beta: legacy renderer stacks can ask to repaint power 3-4 times
    within one frame. A single animation frame paints the latest live value.
    Direct v4125PaintStablePower calls remain synchronous. */
 function schedulePower(){
  if(!BETA){repaintPower();return}
  if(powerFrame){paintStats.coalesced++;return}
  powerFrame=requestAnimationFrame(()=>{powerFrame=0;repaintPower()});
 }
 function paintValue(el,val,legacyAlways=false){
  if(!el)return;
  const next=String(val);
  if(el.textContent===next&&(BETA||!legacyAlways))return;
  el.textContent=next;
  if(BETA)paintStats.writes++;
 }
 window.v4125PowerPaintDiagnostics=()=>({...paintStats,queued:!!powerFrame});


 /* Public/character Kampfkraft must never depend on which screen is open.
    Grow buffs may still be context-dampened inside combat, but the displayed/synced
    character power is measured with the full active character buff (factor 1). */
 function stablePower(){
  if(calculating){
   try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
  }
  calculating=true;
  const had=Object.prototype.hasOwnProperty.call(window,'__v494ModeFactorOverride');
  const old=window.__v494ModeFactorOverride;
  try{
   window.__v494ModeFactorOverride=1;
   return Math.max(0,Math.round(Number(combatPower())||0));
  }catch(e){
   return 0;
  }finally{
   if(had)window.__v494ModeFactorOverride=old;
   else try{delete window.__v494ModeFactorOverride}catch(e){window.__v494ModeFactorOverride=undefined}
   calculating=false;
  }
 }
 window.v4125StableCombatPower=stablePower;

 function repaintPower(){
  const begin=BETA?performance.now():0;
  if(BETA)paintStats.attempts++;
  const cp=stablePower();
  ['#power','#charPower','#v358Power','#v110Cp'].forEach(sel=>paintValue(document.querySelector(sel),cp,true));
  try{
   /* V8.325: canonical home V366 formats power with de-DE grouping.
      Keep Server 1's current presentation until separate approval. */
   document.querySelectorAll('.v349-power b').forEach(el=>paintValue(el,cp));
   const homePower=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'
    ?cp.toLocaleString('de-DE'):String(cp);
   document.querySelectorAll('.v366-power b').forEach(el=>paintValue(el,homePower));
   const own=typeof v073User!=='undefined'&&v073User?.id?String(v073User.id):'';
   if(own){
    document.querySelectorAll('.v072-player-row[data-profile-id]').forEach(row=>{
     if(String(row.dataset.profileId||'')!==own)return;
     const sub=row.querySelector('.v072-player-sub,.v4124-social-line');
     if(sub&&/Kampfkraft\s+\d+/i.test(sub.textContent||'')){
      const walker=document.createTreeWalker(sub,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()){
       const n=walker.currentNode;
       if(/Kampfkraft\s+\d+/i.test(n.nodeValue||'')){const next=(n.nodeValue||'').replace(/Kampfkraft\s+\d+/i,`Kampfkraft ${cp}`);if(!BETA||n.nodeValue!==next){n.nodeValue=next;if(BETA)paintStats.writes++}break}
      }
     }
    });
    document.querySelectorAll('#v072OwnProfile .v072-profile-stat').forEach(box=>{
     if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');paintValue(b,cp,true)}
    });
    const openProfile=document.querySelector('#v074ProfileContent');
    if(openProfile&&String(openProfile.dataset.profileId||'')===own){
     openProfile.querySelectorAll('.v326-profile-stat,.v072-profile-stat').forEach(box=>{
      if(/Kampf(?:kraft|wert)/i.test(box.textContent||'')){const b=box.querySelector('b');paintValue(b,cp,true)}
     });
    }
   }
  }catch(e){}
  finally{if(BETA){const ms=performance.now()-begin;paintStats.totalMs+=ms;paintStats.maxMs=Math.max(paintStats.maxMs,ms)}}
 }
 window.v4125PaintStablePower=repaintPower;

 /* Repaint after the existing render/navigation stack without replacing gameplay renderers. */
 try{
  if(typeof render==='function'&&!window.__v4125RenderPower){
   const base=render;render=function(){const r=base.apply(this,arguments);if(BETA)schedulePower();else{repaintPower();requestAnimationFrame(repaintPower)}return r};
   try{window.render=render}catch(e){}window.__v4125RenderPower=true;
  }
 }catch(e){}
 try{
  if(typeof v032Go==='function'&&!window.__v4125GoPower){
   const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(BETA)schedulePower();else{repaintPower();requestAnimationFrame(repaintPower);setTimeout(repaintPower,90)}return r};
   try{window.v032Go=v032Go}catch(e){}window.__v4125GoPower=true;
  }
 }catch(e){}

 /* Preserve the exact Supabase/PostgREST error body for guild RPC 4xx responses.
    This does not retry writes and does not alter request semantics. */
 try{
  const baseFetch=window.fetch;
  if(typeof baseFetch==='function'&&!baseFetch.__v4125RpcDetail){
   const wrapped=async function(){
    const input=arguments[0],url=String(input?.url||input||'');
    const response=await baseFetch.apply(this,arguments);
    if(response && response.status>=400 && /\/rest\/v1\/rpc\/(?:v254_(?:buy_guild_upgrade|set_guild_signup)|v255_claim_guild_boss_reward|v269_admin_ticket_action)(?:\?|$)/.test(url)){
     try{
      const body=(await response.clone().text()).slice(0,420);
      const detail=`${response.status} · ${url.split('/rpc/')[1]?.split('?')[0]||'Gilden-RPC'} · ${body||'keine Serverdetails'}`;
      window.__V4125_LAST_GUILD_RPC_ERROR__=detail;
      window.v4125QaPushErr?.(/v269_admin_ticket_action/.test(url)?'TICKET_RPC_DETAIL':'GUILD_RPC_DETAIL',detail,'warn');
     }catch(e){}
    }
    return response;
   };
   wrapped.__v4125RpcDetail=true;
   try{Object.assign(wrapped,baseFetch)}catch(e){}
   window.fetch=wrapped;
  }
 }catch(e){}

 function stamp(){}
 window.v4125Diagnostics=()=>({stablePower:stablePower(),rawPower:(()=>{try{return Number(combatPower())||0}catch(e){return 0}})(),activeScreen:document.querySelector('section.screen.active')?.id||'',lastGuildRpcError:window.__V4125_LAST_GUILD_RPC_ERROR__||''});
 repaintPower();stamp();
 window.addEventListener('pageshow',()=>{repaintPower();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){repaintPower();stamp()}},{passive:true});
})();
