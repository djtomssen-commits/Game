(()=>{
'use strict';
if(window.__V7097_RELEASE__)return;window.__V7097_RELEASE__=true;
const VERSION='V7.097';
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return v}};
const db=()=>{try{return (typeof v073Db!=='undefined'&&v073Db)||null}catch(_){return null}};
const uid=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||'')}catch(_){return''}};
const row=d=>Array.isArray(d)?d[0]:d;
const iid=it=>String(it?.id||it?.uid||'');
const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function req(prefix){let r='';try{r=crypto.randomUUID().replaceAll('-','')}catch(_){r=Math.random().toString(36).slice(2)+Date.now().toString(36)}return `${prefix}_${Date.now()}_${r.slice(0,24)}`}
async function rpc(name,args={}){const x=db();if(!x)throw new Error('SERVER_NOT_READY');const {data,error}=await x.rpc(name,args);if(error)throw error;return row(data)}
function equipmentIds(eq=s?.equipment||{}){const out={};['head','body','boots','ring','amulet','weapon','weapon2'].forEach(sl=>out[sl]=iid(eq?.[sl])||null);return out}
function repaintItems(){try{renderInventory?.()}catch(_){}try{window.v470PaintEquipmentSlots?.()}catch(_){}try{window.v448PaintPower?.()}catch(_){}try{window.v069SyncCurrencies?.()}catch(_){}try{window.v488ForgeRender?.()}catch(_){}try{render?.()}catch(_){}}
function applyItems(r){if(!r?.ok)return false;if(Array.isArray(r.inventory))s.inventory=clone(r.inventory);if(r.equipment&&typeof r.equipment==='object')s.equipment=clone(r.equipment);if(Array.isArray(r.materials))s.materials=clone(r.materials);s.v488Forge=(s.v488Forge&&typeof s.v488Forge==='object')?s.v488Forge:{};if(Number.isFinite(Number(r.fragments)))s.v488Forge.fragments=Math.max(0,Number(r.fragments));try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}repaintItems();return true}
async function equipItemId(itemId,slot){const ids=equipmentIds();if(!slot)throw new Error('ITEM_SLOT_MISSING');if(slot==='weapon'&&String(s?.playerClass)==='frost'&&ids.weapon&&ids.weapon2){try{const a=s.equipment.weapon,b=s.equipment.weapon2,sa=Number(window.v470CompareItem?.(a)?.newTotal)||0,sb=Number(window.v470CompareItem?.(b)?.newTotal)||0;slot=sb<sa?'weapon2':'weapon'}catch(_){}}ids[slot]=itemId;const r=await rpc('v7097_rearrange_item_ids',{p_event_id:req('v7097_equip'),p_equipment_ids:ids});if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));applyItems(r);return r}
function signed(n){n=Math.round((Number(n)||0)*100)/100;return n>0?`+${n}`:String(n)}

/* Prismatisch: the equipped +8% item-stat essence must count in every V7.097
   comparison, including Auto-Ausrüsten and post-purchase/forge popups. */
try{
 if(typeof window.v470CompareItem==='function'&&!window.__v7097PrismCompare){
  const baseCompare=window.v470CompareItem;
  const combatKeys=['staerke','ausdauer','geschick','intelligenz','glueck'];
  const prismExtra=it=>{if(!it||!(it.v488Prismatic===true||String(it.quality||'').toLowerCase()==='prismatic'))return 0;const src=it?.v429StatLock?.native&&typeof it.v429StatLock.native==='object'?it.v429StatLock.native:(it.bonus||{});const pct=Math.max(0,Number(it.v488EssencePct)||.08);return combatKeys.reduce((n,k)=>n+Math.max(0,Number(src?.[k])||0),0)*pct};
  const oldFor=it=>{const slot=String(it?.slot||'');if(slot==='weapon'&&String(s?.playerClass||'')==='frost'){const a=s?.equipment?.weapon,b=s?.equipment?.weapon2;if(!a)return b||null;if(!b)return a||null;try{return (Number(baseCompare(a)?.newTotal)||0)<=(Number(baseCompare(b)?.newTotal)||0)?a:b}catch(_){return a}}return s?.equipment?.[slot]||null};
  window.v470CompareItem=function(it){const c=baseCompare.apply(this,arguments);if(!c||!it?.slot)return c;const old=oldFor(it),ne=prismExtra(it),oe=prismExtra(old);if(!ne&&!oe)return c;const nt=(Number(c.newTotal)||0)+ne,ot=(Number(c.oldTotal)||0)+oe,d=Math.round((nt-ot)*100)/100;const out={...c,newTotal:nt,oldTotal:ot,diff:c.diff==null&&c.state==='free'?null:d};if(c.state!=='free'&&c.label!=='FALSCHE KLASSE'){out.state=d>0?'better':d<0?'worse':'same';out.mark=d>0?'▲':d<0?'▼':'◆';out.label=d>0?'BESSER':d<0?'SCHLECHTER':'GLEICH'}out.reason=`${c.reason||'Itemvergleich'} · Prismatisch +8 % eingerechnet`;return out};
  window.__v7097PrismCompare=true;
 }
}catch(e){console.warn('[V7097] prism compare',e)}

window.v7097ShowItemResult=async function(it,title='Neues Item'){
 if(!it||!it.slot)return false;
 let c=null;try{c=window.v470CompareItem?.(it)||null}catch(_){}
 const label=c?.label||'VERGLEICH';const diff=c?.diff==null?'':` · ${signed(c.diff)} Effektivwert`;
 const reason=c?.reason||'Vergleich mit deinem aktuell getragenen Gegenstand.';
 const text=`${it.icon||'🎁'} ${it.name||'Neues Item'}

${label}${diff}
${reason}

Möchtest du es direkt anlegen?`;
 let yes=false;try{yes=typeof v115Confirm==='function'?!!(await v115Confirm(text,{title,type:'confirm',okText:'✅ Anlegen',cancelText:'Nicht anlegen'})):confirm(text)}catch(_){yes=false}
 if(!yes)return false;
 try{await equipItemId(iid(it),String(it.slot));window.v063Toast?.('✅ Item angelegt','success',String(it.name||''));return true}catch(e){window.v063Toast?.('Item konnte nicht angelegt werden','error',String(e?.message||e));return false}
};

/* The old V4.80 button kept a closure to local autoEquip. Capture it before that
   handler and route it through the V7.097 authoritative implementation. */
document.addEventListener('click',e=>{const b=e.target?.closest?.('#v480EquipAutoBar button');if(!b||window.__V7097_PLAYER_BLOCKED__||!window.v7081UseAuthority?.('items'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();void window.v480AutoEquip?.()},true);

window.v7097ShowWednesdayReward=async function(r){
 const w=r?.reward||{};if(!w||typeof w!=='object')return;
 const seedNames={moss:'Moos',lime:'Lime',jack:'Jack',violet:'Violet',blue:'Blue Dream',critical:'Critical',white:'White Widow',amnesia:'Amnesia',northern:'Northern Lights'};
 const seeds=w.seedDrops&&typeof w.seedDrops==='object'?Object.entries(w.seedDrops).map(([k,v])=>`${seedNames[k]||k}: ${v}`).join(' · '):'';
 const text=[`🏆 Platz ${Number(r.rank)||0}`,`+${Number(w.xp)||0} EXP`,`+${Number(w.gold)||0} Gold`,`+${Number(w.harz)||0} Harz-Taler`,`+${Number(w.time)||0} Zeit-Samen`,`+${Number(w.fragments)||0} Fragmente`,seeds?`🌰 Samen: ${seeds}`:`🌰 ${Number(w.seeds)||0} Samen`].join('\n');
 try{if(typeof v115Alert==='function')await v115Alert(text,'🎁 Mittwochs-Rangbelohnung','success');else alert(text)}catch(_){}
};

/* Profile is only a public/social mirror. Collapse historical forced sync bursts. */
try{
 const base=window.v073SyncProfile||v073SyncProfile;let last=0,pending=0;
 const wrapped=async function(force=false){const now=Date.now();if(last&&now-last<8000){if(force&&!pending){pending=setTimeout(()=>{pending=0;void wrapped(true)},8200-(now-last))}return true}last=now;return await base.call(this,force)};
 v073SyncProfile=wrapped;window.v073SyncProfile=wrapped;
}catch(_){}

/* Event-start popup: one server-recorded display per player/event. */
let eventCheckedUid='';
function remain(end){const ms=Math.max(0,new Date(end).getTime()-Date.now());const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);return d>0?`${d} T ${h} Std.`:h>0?`${h} Std. ${m} Min.`:`${m} Min.`}
async function showNewEvents(){const id=uid();if(!id||eventCheckedUid===id||window.__V200_AUTH_READY__!==true)return;eventCheckedUid=id;try{const r=await rpc('v7097_unseen_active_events');const evs=Array.isArray(r?.events)?r.events:[];if(!evs.length)return;const ov=document.createElement('div');ov.className='v7097-event-overlay';ov.innerHTML=`<div class="v7097-event-modal"><h2>🎪 Neues Event aktiv!</h2><p>${evs.length>1?'Mehrere neue Events sind gestartet.':'Dieses Event ist jetzt für dich aktiv.'}</p>${evs.map(x=>`<div class="v7097-event-card"><b>${esc(x.name)}</b><span>${esc(x.description||'Zeitlich begrenztes Event.')}</span><span class="v7097-event-time">⏱ Noch ${esc(remain(x.ends_at))} aktiv</span></div>`).join('')}<button class="btn" data-v7097-event-ok style="width:100%;margin-top:7px">Los geht's</button></div>`;document.body.appendChild(ov);ov.querySelector('[data-v7097-event-ok]')?.addEventListener('click',async()=>{const ids=evs.map(x=>x.id).filter(Boolean);try{await rpc('v7097_ack_event_popup',{p_event_ids:ids})}catch(e){console.warn('[V7097] event ack',e)}ov.remove()},{once:true})}catch(e){console.warn('[V7097] event popup',e)}}
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void showNewEvents(),1000),{passive:true});

/* Moderation access check for normal clients. */
async function checkBlocked(){if(!uid()||window.__V200_AUTH_READY__!==true)return;try{const r=await rpc('v7097_account_access_state');let ov=document.getElementById('v7097BlockOverlay');if(!r?.blocked){ov?.remove();window.__V7097_PLAYER_BLOCKED__=false;return}window.__V7097_PLAYER_BLOCKED__=true;if(!ov){ov=document.createElement('div');ov.id='v7097BlockOverlay';ov.className='v7097-block-overlay';document.body.appendChild(ov)}ov.innerHTML=`<div class="v7097-block-modal"><h2>⛔ Account gesperrt</h2><p>${esc(r.reason||'Dieser Account wurde vom Administrator gesperrt.')}</p><p class="muted">Wenn du denkst, dass dies ein Fehler ist, wende dich an den Betreiber.</p></div>`}catch(e){console.warn('[V7097] block check',e)}}
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>void checkBlocked(),350),{passive:true});
setTimeout(()=>{if(window.__V200_AUTH_READY__===true){void showNewEvents();void checkBlocked()}},1800);
document.addEventListener('click',e=>{if(!window.__V7097_PLAYER_BLOCKED__)return;if(e.target?.closest?.('#v7097BlockOverlay'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()},true);

/* Admin UI: overview + player moderation while keeping the existing Events/News editors. */
function installAdmin(){const c=document.getElementById('v093AdminContent');if(!c||c.dataset.v7097)return;c.dataset.v7097='1';const old=[...c.children];const tabs=document.createElement('div');tabs.className='v7097-admin-tabs';tabs.innerHTML='<button class="btn active" data-v7097-admin-tab="overview">Übersicht</button><button class="btn secondary" data-v7097-admin-tab="players">Spieler</button><button class="btn secondary" data-v7097-admin-tab="content">Events & News</button>';const overview=document.createElement('div');overview.className='v7097-admin-pane active';overview.dataset.v7097AdminPane='overview';overview.innerHTML='<div class="v7097-admin-overview"><div class="v7097-admin-stat"><b id="v7097AdminEvents">–</b><span>EVENTS ANGELEGT</span></div><div class="v7097-admin-stat"><b id="v7097AdminNews">–</b><span>NEWS GELADEN</span></div><div class="v7097-admin-stat"><b>Spieler</b><span>SUCHEN · SPERREN · LÖSCHEN</span></div></div><div class="muted">Die bestehenden Event- und News-Werkzeuge liegen gesammelt unter „Events & News“.</div>';const players=document.createElement('div');players.className='v7097-admin-pane';players.dataset.v7097AdminPane='players';players.innerHTML='<div class="v7097-player-tools"><div class="section-title"><div><h3>👥 Spieler verwalten</h3><div class="muted">Name oder E-Mail suchen. Sperren ist reversibel; Löschen entfernt den Account dauerhaft.</div></div></div><div class="v7097-player-search"><input id="v7097PlayerSearch" class="v093-input" placeholder="Spielername oder E-Mail"><button class="btn" data-v7097-player-search>Suchen</button></div><div id="v7097PlayerList" class="v7097-player-list"></div></div>';const legacy=document.createElement('div');legacy.className='v7097-admin-pane';legacy.dataset.v7097AdminPane='content';old.forEach(x=>legacy.appendChild(x));c.append(tabs,overview,players,legacy);tabs.addEventListener('click',e=>{const b=e.target?.closest?.('[data-v7097-admin-tab]');if(!b)return;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));c.querySelectorAll('[data-v7097-admin-pane]').forEach(x=>x.classList.toggle('active',x.dataset.v7097AdminPane===b.dataset.v7097AdminTab));if(b.dataset.v7097AdminTab==='overview'){const a=document.getElementById('v7097AdminEvents'),n=document.getElementById('v7097AdminNews');if(a)a.textContent=String(window.v093Events?.length??v093Events?.length??0);if(n)n.textContent=String(window.v093News?.length??v093News?.length??0)}});players.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='v7097PlayerSearch')void adminSearch()});players.addEventListener('click',e=>{if(e.target?.closest?.('[data-v7097-player-search]'))void adminSearch();const b=e.target?.closest?.('[data-v7097-block]');if(b)void adminBlock(b.dataset.v7097Block,b.dataset.blocked!=='true',b.dataset.name||'Spieler');const d=e.target?.closest?.('[data-v7097-delete]');if(d)void adminDelete(d.dataset.v7097Delete,d.dataset.name||'Spieler')})}
async function adminSearch(){const q=document.getElementById('v7097PlayerSearch')?.value||'';const list=document.getElementById('v7097PlayerList');if(!list)return;list.innerHTML='<div class="empty">Suche …</div>';try{const r=await rpc('v7097_admin_search_players',{p_query:q});const ps=Array.isArray(r?.players)?r.players:[];list.innerHTML=ps.length?ps.map(p=>`<div class="v7097-player ${p.blocked?'blocked':''}"><div class="v7097-player-head"><b>${esc(p.character_name||'Spieler')}</b><span class="pill">Lv. ${Number(p.level)||1}</span></div><div class="v7097-player-meta">${esc(p.class_name||p.class_id||'')} · ${Number(p.combat_power)||0} KP · Gear ${Number(p.gear_score)||0}${p.email?`<br>${esc(p.email)}`:''}</div>${p.blocked?`<div class="v7097-player-reason">⛔ ${esc(p.block_reason||'Gesperrt')}</div>`:''}<div class="v7097-player-actions">${p.is_admin?' <span class="pill">ADMIN GESCHÜTZT</span>':`<button class="btn ${p.blocked?'secondary':'danger'}" data-v7097-block="${esc(p.id)}" data-blocked="${p.blocked?'true':'false'}" data-name="${esc(p.character_name)}">${p.blocked?'Entsperren':'Blockieren'}</button><button class="btn danger" data-v7097-delete="${esc(p.id)}" data-name="${esc(p.character_name)}">Löschen</button>`}</div></div>`).join(''):'<div class="empty">Kein Spieler gefunden.</div>'}catch(e){list.innerHTML=`<div class="empty">${esc(e?.message||e)}</div>`}}
async function adminBlock(id,block,name){let reason='';if(block){reason=prompt(`Blockgrund für ${name}:`,'Regelverstoß')||'';if(!reason)return}let ok=true;try{if(typeof v115Confirm==='function')ok=await v115Confirm(block?`${name} wirklich blockieren?`:`${name} entsperren?`,{title:block?'⛔ Spieler blockieren':'✅ Spieler entsperren',type:block?'warn':'confirm',okText:block?'Blockieren':'Entsperren'})}catch(_){}if(!ok)return;try{const r=await rpc('v7097_admin_set_player_block',{p_user:id,p_blocked:block,p_reason:reason});if(!r?.ok)throw new Error(String(r?.reason||'SERVER_REJECTED'));window.v063Toast?.(block?'Spieler blockiert':'Spieler entsperrt','success',name);await adminSearch()}catch(e){window.v063Toast?.('Admin-Aktion fehlgeschlagen','error',String(e?.message||e))}}
async function adminDelete(id,name){let ok=false;try{ok=typeof v115Confirm==='function'?!!(await v115Confirm(`${name} dauerhaft löschen?

Account und zugehörige Spielerdaten werden entfernt.`,{title:'⚠️ Spieler dauerhaft löschen',type:'warn',okText:'Weiter'})):confirm(`${name} dauerhaft löschen?`)}catch(_){}if(!ok)return;const word=prompt(`Zur endgültigen Bestätigung LÖSCHEN eingeben:`,'');if(String(word||'').trim().toUpperCase()!=='LÖSCHEN')return;try{const r=await rpc('v7097_admin_delete_player',{p_user:id,p_confirm:'LÖSCHEN'});if(!r?.ok){const why=String(r?.reason||'SERVER_REJECTED');if(why==='GUILD_LEADER_TRANSFER_REQUIRED')throw new Error('Der Spieler ist Gildenleiter. Zuerst die Gildenleitung übertragen.');throw new Error(why)}window.v063Toast?.('Spieler gelöscht','success',name);await adminSearch()}catch(e){window.v063Toast?.('Löschen fehlgeschlagen','error',String(e?.message||e))}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installAdmin,{once:true});else installAdmin();
window.addEventListener('growlegends:extras-ready',installAdmin,{passive:true});
window.v7097Diagnostics=()=>({version:VERSION,blocked:!!window.__V7097_PLAYER_BLOCKED__,caps:window.v7081CapabilitiesDiagnostics?.()||null});
})();
