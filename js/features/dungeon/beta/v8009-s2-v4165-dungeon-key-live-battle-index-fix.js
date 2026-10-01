(()=>{
 'use strict';
 if(window.__V4165_DUNGEON_KEY_BATTLE_FIX__)return;
 window.__V4165_DUNGEON_KEY_BATTLE_FIX__=true;

 const clampDungeon=i=>{
   const max=Math.max(0,Number((typeof dungeons!=='undefined'&&dungeons?.length)||20)-1);
   return Math.max(0,Math.min(max,Math.floor(Number(i)||0)));
 };
 const clampRoom=i=>Math.max(0,Math.min(9,Math.floor(Number(i)||0)));
 let liveIndex=null,liveUid='';
 const accountUid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return''}};
 function syncAccountScope(reason='account'){
   const u=accountUid();
   if(u===liveUid)return false;
   liveUid=u;liveIndex=null;
   try{window.__GL_LIVE_DUNGEON_INDEX__=null;window.__GL_LIVE_DUNGEON_ROOM_INDEX__=null}catch(_){}
   try{const card=document.getElementById('dungeonMapCard');if(card?.dataset)delete card.dataset.v4165DungeonIndex}catch(_){}
   try{window.__V4165_LAST_DUNGEON_SYNC__={i:null,reason,at:Date.now(),uid:u}}catch(_){}
   return true;
 }

 function ensure(){
   syncAccountScope('ensure');
   if(typeof s==='undefined'||!s)return null;
   s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
   s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};
   s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number).filter(Number.isInteger):[];
   s.dungeon.completed=Array.isArray(s.dungeon.completed)?s.dungeon.completed.map(Number).filter(Number.isInteger):[];
   s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
   if(!s.dungeon.unlocked.includes(0))s.dungeon.unlocked.push(0);
   const count=Math.max(1,Number((typeof dungeons!=='undefined'&&dungeons?.length)||20));
   for(let i=1;i<count;i++){
     const key=!!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)];
     const unlocked=s.dungeon.unlocked.includes(i);
     if(key&&!unlocked)s.dungeon.unlocked.push(i);
     if(unlocked&&!key)s.dungeon.keys[i]=true;
     if((key||unlocked)&&s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
   }
   s.dungeon.unlocked=[...new Set(s.dungeon.unlocked.map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
   s.dungeon.completed=[...new Set(s.dungeon.completed.map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
   s.dungeon.selected=clampDungeon(s.dungeon.selected);
   return s.dungeon;
 }

 function hasKey(i){
   i=clampDungeon(i);ensure();
   if(i===0)return true;
   return !!s.dungeon.keys[i]||!!s.dungeon.keys[String(i)]||s.dungeon.unlocked.includes(i);
 }
 function completed(i){
   i=clampDungeon(i);ensure();
   /* Keep the existing completion invariant: a dungeon is sealed only after boss progress exists. */
   return s.dungeon.completed.includes(i)&&Number(s.dungeon.progress?.[i])>=9;
 }
 function available(i){
   i=clampDungeon(i);ensure();
   const d=(typeof dungeons!=='undefined'?dungeons?.[i]:null);
   return !!d&&Number(s.level||1)>=Number(d.minLevel||1)&&hasKey(i)&&!completed(i);
 }
 function saveLocal(){
   try{if(typeof KEY!=='undefined')localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
 }

 function setLiveIndex(i,reason='live'){
   syncAccountScope(reason);
   i=clampDungeon(i);ensure();
   if(!hasKey(i)||completed(i))return false;
   liveIndex=i;
   window.__GL_LIVE_DUNGEON_INDEX__=i;
   s.dungeon.selected=i;
   s.dungeon.room=clampRoom(s.dungeon.progress?.[i]??0);
   try{const card=document.getElementById('dungeonMapCard');if(card?.classList?.contains('v261-detail-card'))card.dataset.v4165DungeonIndex=String(i)}catch(_){}
   saveLocal();
   try{window.__V4165_LAST_DUNGEON_SYNC__={i,reason,at:Date.now()}}catch(_){}
   return true;
 }
 function visibleIndex(){
   syncAccountScope('visible');
   /* V7.214: the explicit live selection is newer than any DOM stamp.
      The old order could reopen a stale dungeon from the previous account/map. */
   if(Number.isInteger(liveIndex)&&hasKey(liveIndex)&&!completed(liveIndex))return liveIndex;
   const card=document.getElementById('dungeonMapCard');
   const raw=card?.dataset?.v4165DungeonIndex;
   if(raw!=null&&raw!==''){
     const i=clampDungeon(raw);
     if(hasKey(i)&&!completed(i))return i;
   }
   return clampDungeon(s?.dungeon?.selected||0);
 }

 /* The unlock state and the visible fight button used to have two different owners.
    The 20-dungeon map could already show the new dungeon as open while #fightBtn
    still carried disabled=true from the previously sealed dungeon. A disabled
    button never emits the click event, so V4.246 could not repair the state on click.
    Keep the DOM gate derived from the same live state as dungeonAvailable(). */
 function syncBattleGate(reason='battle-gate'){
   try{
     ensure();
     if(s.dungeon.layer!=='dungeon'||s.dungeon.view!=='battle')return false;
     const i=visibleIndex();
     if(!available(i))return false;

     setLiveIndex(i,reason);
     if(s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
     s.dungeon.room=clampRoom(s.dungeon.progress[i]);

     try{window.v246RefreshDungeonOpponent?.()}catch(_){ }

     const btn=document.getElementById('fightBtn');
     if(!btn)return false;
     let busy=!!window.__V446_FIGHTING__;
     try{busy=busy||!!battleBusy}catch(_){ }
     if(busy)return false;

     btn.disabled=false;
     const d=(typeof dungeons!=='undefined'?dungeons?.[i]:null);
     const ri=clampRoom(s.dungeon.progress?.[i]??s.dungeon.room??0);
     const e=d?.enemies?.[ri];
     let rec=Number(e?.requiredLevel)||Number(d?.minLevel)||1;
     try{if(typeof v025EnemyStats==='function'&&e)rec=Number(v025EnemyStats(i,ri,e)?.rec)||rec}catch(_){ }
     btn.textContent=`⚔️ Kampf versuchen · Empfohlen Lv. ${rec}`;
     btn.dataset.v4165LiveReady=String(i);
     return true;
   }catch(e){
     console.warn('V4.165 live battle gate',reason,e);
     return false;
   }
 }
 window.v4165SyncBattleGate=syncBattleGate;

 /* Final live truth. Old key arrays and keys{} may be updated by different historical layers;
    every availability check now reads both immediately. */
 try{dungeonUnlocked=hasKey;window.dungeonUnlocked=hasKey}catch(_){}
 try{dungeonAvailable=available;window.dungeonAvailable=available}catch(_){}
 try{if(typeof v243HasDungeonKey==='function'){v243HasDungeonKey=hasKey;window.v243HasDungeonKey=hasKey}}catch(_){}
 try{if(typeof v250HasKey==='function'){v250HasKey=hasKey;window.v250HasKey=hasKey}}catch(_){}

 /* This is the important part of the fix: combat's v048DungeonIndex must use the dungeon
    that was actually opened, not a stale selected value left by the previously sealed dungeon. */
 try{
   const base=(typeof v048DungeonIndex==='function'?v048DungeonIndex:null);
   if(typeof base==='function'&&!base.__v4165LiveIndex){
     const wrapped=function(){
       ensure();
       if(s.dungeon.layer==='dungeon'){
         const i=visibleIndex();
         if(hasKey(i)&&!completed(i))return i;
       }
       return clampDungeon(base.apply(this,arguments));
     };
     wrapped.__v4165LiveIndex=true;
     v048DungeonIndex=wrapped;window.v048DungeonIndex=wrapped;
   }
 }catch(e){console.warn('V4.165 v048 index',e)}

 /* When a key is granted, the newly opened dungeon becomes the canonical selection immediately.
    No reload/login is needed to replace the previously completed selected dungeon. */
 try{
   const base=window.v250GrantKey||(typeof v250GrantKey==='function'?v250GrantKey:null);
   if(typeof base==='function'&&!base.__v4165FreshSelection){
     const wrapped=function(i){
       const r=base.apply(this,arguments);
       if(r){
         setLiveIndex(Number(i),'key-grant');
         s.dungeon.layer='world';s.dungeon.view='map';saveLocal();
       }
       return r;
     };
     wrapped.__v4165FreshSelection=true;
     window.v250GrantKey=wrapped;try{v250GrantKey=wrapped}catch(_){}
   }
 }catch(e){console.warn('V4.165 key grant',e)}

 function stampDetail(){
   try{
     ensure();
     const card=document.getElementById('dungeonMapCard');
     if(!card||!card.classList.contains('v261-detail-card'))return;
     const i=clampDungeon(s.dungeon.selected);
     if(hasKey(i)&&!completed(i)){
       liveIndex=i;window.__GL_LIVE_DUNGEON_INDEX__=i;
       card.dataset.v4165DungeonIndex=String(i);
     }
   }catch(_){}
 }

 /* Sprint 2: expose the detail stamp directly. The canonical D2 map path calls
    this after v261 renders, so four historical detail wrappers are unnecessary. */
 window.v4165StampDetail=stampDetail;

 /* Final battle entry owner. Do not hand control back to the historical entry guard:
    it could return early while the map already showed the freshly found key. */
 try{
   const base=window.v251StartCurrentDungeonFight||(typeof v251StartCurrentDungeonFight==='function'?v251StartCurrentDungeonFight:null);
   if(typeof base==='function'&&!base.__v4165BattleSync){
     const wrapped=function(i){
       i=clampDungeon(i);
       ensure();
       if(!available(i)){
         try{window.v063Toast?.('Dieser Dungeon ist noch nicht betretbar.','warn')}catch(_){ }
         return false;
       }

       setLiveIndex(i,'enter-fight');
       if(s.dungeon.progress[i]==null)s.dungeon.progress[i]=0;
       s.dungeon.room=clampRoom(s.dungeon.progress[i]);
       s.dungeon.layer='dungeon';
       s.dungeon.view='battle';
       saveLocal();
       try{if(typeof persist==='function')persist(false)}catch(_){ }

       try{if(typeof renderDungeon==='function')renderDungeon()}catch(e){console.warn('V4.165 battle render',e)}
       requestAnimationFrame(()=>syncBattleGate('enter-fight-raf'));
       try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){ }
       return true;
     };
     wrapped.__v4165BattleSync=true;
     window.v251StartCurrentDungeonFight=wrapped;try{v251StartCurrentDungeonFight=wrapped}catch(_){}
   }
 }catch(e){console.warn('V4.165 fight entry',e)}

 /* Sprint 2: renderDungeon battle-gate wrapper retired.
    The canonical D2 battle path already calls v4165SyncBattleGate directly. */

 /* Capture the dungeon tile before its target listener. This makes the clicked dungeon authoritative
    even if an older async painter is still finishing after a freshly claimed quest reward. */
 document.addEventListener('click',ev=>{
   const target=ev.target instanceof Element?ev.target:null;if(!target)return;
   const tile=target.closest('[data-gl20g-dungeon],[data-v065-dungeon]');
   if(tile&&document.getElementById('dungeon')?.classList.contains('active')){
     const raw=tile.getAttribute('data-gl20g-dungeon')??tile.getAttribute('data-v065-dungeon');
     const i=clampDungeon(raw);
     if(available(i))setLiveIndex(i,'world-tile');
     return;
   }
   const enter=target.closest('#dungeonMapCard #v261EnterCurrent,#dungeonMapCard .v261-node.current');
   if(enter&&document.getElementById('dungeon')?.classList.contains('active')){
     const i=visibleIndex();
     if(available(i))setLiveIndex(i,'detail-enter');
   }
 },true);

 /* Any historical direct unlock path that bypasses v250GrantKey is normalized here. */
 let known=new Set();
 function snapshot(){ensure();known=new Set(s.dungeon.unlocked.filter(i=>i===0||hasKey(i)))}
 function detectNew(reason){
   ensure();
   const now=new Set(s.dungeon.unlocked.filter(i=>i===0||hasKey(i)));
   const added=[...now].filter(i=>!known.has(i)&&i>0).sort((a,b)=>a-b);
   known=now;
   if(added.length){
     const active=!!document.getElementById('dungeon')?.classList.contains('active');
     const inside=active&&String(s.dungeon?.layer||'world')==='dungeon';
     /* V7.214: a canonical unlock discovered while the player is already inside
        a dungeon is recorded silently; it must not hijack the current 10er map. */
     if(inside){saveLocal();return}
     const i=added[added.length-1];setLiveIndex(i,reason);s.dungeon.layer='world';s.dungeon.view='map';saveLocal()
   }
 }
 snapshot();
 window.addEventListener('growlegends:account-ready',()=>{
   syncAccountScope('account-ready');
   try{snapshot()}catch(_){}
 },{passive:true});
 ['growlegends:dungeon-key-changed','growlegends:dungeon-key-live','growlegends:dungeon-key-live-unlocked'].forEach(name=>{
   document.addEventListener(name,()=>detectNew(name));
 });

 window.v4165DungeonKeyBattleDiagnostics=()=>{
   ensure();const i=visibleIndex();const btn=document.getElementById('fightBtn');
   let busy=!!window.__V446_FIGHTING__;try{busy=busy||!!battleBusy}catch(_){ }
   return{selected:s.dungeon.selected,liveIndex,visibleIndex:i,layer:s.dungeon.layer,view:s.dungeon.view,hasKey:hasKey(i),completed:completed(i),available:available(i),progress:Number(s.dungeon.progress?.[i]??0),room:Number(s.dungeon.room??0),fightBusy:busy,fightDisabled:btn?.disabled??null,fightText:btn?.textContent||null,liveReady:btn?.dataset?.v4165LiveReady||null,unlocked:[...s.dungeon.unlocked],keys:{...s.dungeon.keys}};
 };
})();
