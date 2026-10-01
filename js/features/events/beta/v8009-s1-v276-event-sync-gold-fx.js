/* ===== V4.02 event synchronization + global Gold x2 visual =====
   New characters can finish cloud/auth initialization after public events were
   first loaded. Re-fetch public events after the durable user is finalized,
   then apply Dampf immediately to that newly created character.
*/

async function v276RefreshEventsForCurrentCharacter(){
  try{
    await v093LoadPublicContent();
    v271EventDataReady=true;

    /* Important for a brand-new character:
       event state is global, but its 300-Dampf grant key is character save state. */
    const changed=v271SyncDampfEvent();
    if(changed){
      try{persist(false)}catch(e){}
    }

    v271PaintDampf();
    try{renderQuests()}catch(e){}
    try{v276DecorateGold()}catch(e){}
    return true;
  }catch(e){
    console.error('V4.02 event refresh after character login',e);
    return false;
  }
}

/* V4.159: post-login event hydration is owned by the central boot controller. */

/* Also refresh immediately after the one-time character creation flow when
   the existing code syncs the new profile/save. */
if(typeof v073SyncProfile==='function'){
  const v276BaseSyncProfile=v073SyncProfile;
  v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
    const r=await v276BaseSyncProfile(force);
    if(r && v073User?.id && s.characterNameSet){
      /* Event data may already be fresh; this call is cheap and guarantees the
         new save receives an active Dampf grant rather than inheriting stale state. */
      if(!v271EventDataReady)await v276RefreshEventsForCurrentCharacter();
      else{
        v271SyncDampfEvent();
        v271PaintDampf();
      }
    }
    return r;
  };
}

function v276DecorateGold(){
  document.querySelectorAll('.v276-gold2').forEach(el=>el.remove());
  document.querySelectorAll('.v276-gold-text-active')
    .forEach(el=>el.classList.remove('v276-gold-text-active'));

  if(!v274GoldEventActive())return;

  const roots=[
    document.querySelector('header'),
    document.querySelector('main'),
    document.querySelector('#v063ToastLayer'),
    document.querySelector('#v231QuestReward')
  ].filter(Boolean);

  const found=[];
  roots.forEach(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent)continue;
      if(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(parent.tagName))continue;
      if(parent.closest('.v276-gold2,.v094-event-bonus,.v274-event-live'))continue;

      const text=(node.nodeValue||'').trim();
      if(!text)continue;

      /* GOLD label, Gold reward text and the top resource value (#gold). */
      if(/\bGold\b/i.test(text) || parent.id==='gold')found.push(parent);
    }
  });

  /* Top header value has no word "Gold" inside the <b>, so decorate its stat too. */
  const topGold=document.querySelector('#gold');
  if(topGold)found.push(topGold);

  [...new Set(found)].forEach(el=>{
    if(el.children.length>3)return;
    el.classList.add('v276-gold-text-active');
    if(!el.querySelector(':scope > .v276-gold2')){
      const badge=document.createElement('span');
      badge.className='v276-gold2';
      badge.textContent='×2';
      badge.title='2× Gold-Event aktiv';
      el.appendChild(badge);
    }
  });
}

/* Quest cards: make the doubled reward and event state explicit, matching EXP. */
function v276DecorateQuestGold(){
  if(!v274GoldEventActive())return;
  document.querySelectorAll('#questList .quest').forEach((card,i)=>{
    const q=s.quests?.offers?.[i];
    if(!q)return;
    const base=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
    q.v274BaseGold=base;
    const gold=[...card.querySelectorAll('.quest-meta span')]
      .find(el=>/💰|Gold/i.test(el.textContent||''));
    if(gold){
      gold.textContent=`💰 ${base*2} Gold`;
      gold.classList.add('v276-gold-text-active');
      if(!gold.querySelector('.v276-gold2')){
        const badge=document.createElement('span');
        badge.className='v276-gold2';
        badge.textContent='×2';
        gold.appendChild(badge);
      }
    }
  });
}

const v276BaseRenderQuests=renderQuests;
renderQuests=function(){
  const r=v276BaseRenderQuests();
  v276DecorateQuestGold();
  requestAnimationFrame(v276DecorateGold);
  return r;
};

const v276BaseRender=render;
render=function(){
  const r=v276BaseRender();
  requestAnimationFrame(()=>{
    v276DecorateQuestGold();
    v276DecorateGold();
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

/* Dynamic screens/modals can be opened without a full render. */
document.addEventListener('click',()=>{
  if(v274GoldEventActive())setTimeout(()=>{
    try{v276DecorateQuestGold();v276DecorateGold()}catch(e){}
  },30);
},true);

/* Existing open session: refresh once after all historical boot layers settle. */
setTimeout(async()=>{
  if(v073User?.id && !v073User.is_anonymous){
    await v276RefreshEventsForCurrentCharacter();
  }
  
  const line=document.querySelector('#v141VersionLine');
},2300);
