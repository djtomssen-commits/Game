
(()=>{
'use strict';
if(window.__V6200_PVP_BATTLELOG__)return;window.__V6200_PVP_BATTLELOG__=true;
const LOCAL_PREFIX='growLegendsV6200BattleLog:';
let rows=[],activeToken='',loading=false,serverReady=true,replayRun=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const fmt=v=>Math.max(0,Math.round(n(v))).toLocaleString('de-DE');
const uid=()=>{try{return String(v073User?.id||'')}catch(_){return''}};
const online=()=>{try{return !!(uid()&&v073Db)}catch(_){return false}};
const localKey=()=>LOCAL_PREFIX+(uid()||'guest');
function avatar(cls){try{return typeof v080AvatarFor==='function'?v080AvatarFor(cls||'grower'):''}catch(_){return''}}
function className(id,fallback=''){try{return fallback||classes?.[id]?.name||id||''}catch(_){return fallback||id||''}}
function when(d){try{return new Date(d).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'})}catch(_){return''}}
function localRead(){try{const a=JSON.parse(localStorage.getItem(localKey())||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function localWrite(list){try{localStorage.setItem(localKey(),JSON.stringify((Array.isArray(list)?list:[]).slice(0,50)))}catch(_){}}
function localAdd(row){const a=localRead().filter(x=>String(x.client_token)!==String(row.client_token));a.unshift(row);localWrite(a)}
function isAttacker(r){return uid()&&String(r.attacker_id)===uid()}
function relativeWin(r){return isAttacker(r)?!!r.attacker_won:!r.attacker_won}
function unseen(r){return !isAttacker(r)&&r.defender_seen===false}
function opponent(r){return isAttacker(r)?{id:r.defender_id,name:r.defender_name,level:r.defender_level,classId:r.defender_class,className:r.defender_class_name,power:r.defender_power,maxHp:r.defender_max_hp,hpAfter:r.defender_hp_after}:{id:r.attacker_id,name:r.attacker_name,level:r.attacker_level,classId:r.attacker_class,className:r.attacker_class_name,power:r.attacker_power,maxHp:r.attacker_max_hp,hpAfter:r.attacker_hp_after}}
function me(r){return isAttacker(r)?{id:r.attacker_id,name:r.attacker_name,level:r.attacker_level,classId:r.attacker_class,className:r.attacker_class_name,power:r.attacker_power,maxHp:r.attacker_max_hp,hpAfter:r.attacker_hp_after}:{id:r.defender_id,name:r.defender_name,level:r.defender_level,classId:r.defender_class,className:r.defender_class_name,power:r.defender_power,maxHp:r.defender_max_hp,hpAfter:r.defender_hp_after}}
function normalize(r){
 const replay=(r?.replay&&typeof r.replay==='object')?r.replay:{};
 return {...r,
  client_token:String(r?.client_token||r?.token||('legacy-'+r?.id||Date.now())),
  attacker_name:String(r?.attacker_name||replay?.attacker?.name||'Spieler'),defender_name:String(r?.defender_name||replay?.defender?.name||'Spieler'),
  attacker_class:String(r?.attacker_class||replay?.attacker?.classId||'grower'),defender_class:String(r?.defender_class||replay?.defender?.classId||'grower'),
  attacker_class_name:String(r?.attacker_class_name||replay?.attacker?.className||''),defender_class_name:String(r?.defender_class_name||replay?.defender?.className||''),
  attacker_level:Math.max(1,n(r?.attacker_level||replay?.attacker?.level)||1),defender_level:Math.max(1,n(r?.defender_level||replay?.defender?.level)||1),
  attacker_power:Math.max(1,n(r?.attacker_power||replay?.attacker?.power)||1),defender_power:Math.max(1,n(r?.defender_power||replay?.defender?.power)||1),
  attacker_max_hp:Math.max(1,n(r?.attacker_max_hp||replay?.attacker?.maxHp)||1),defender_max_hp:Math.max(1,n(r?.defender_max_hp||replay?.defender?.maxHp)||1),
  attacker_hp_after:Math.max(0,n(r?.attacker_hp_after??replay?.attacker?.hpAfter)),defender_hp_after:Math.max(0,n(r?.defender_hp_after??replay?.defender?.hpAfter)),
  rounds:Math.max(1,n(r?.rounds||replay?.rounds)||1),replay,created_at:r?.created_at||new Date().toISOString(),defender_seen:r?.defender_seen!==false
 };
}
function ensurePanel(){
 const p=document.getElementById('v6200BattleLogPanel');if(!p)return null;
 if(!p.dataset.v6200Built){
  p.dataset.v6200Built='1';
  p.innerHTML=`<div class="v6200-log-shell"><div class="v6200-log-list"><div class="v6200-log-head"><b>⚔️ Kampflog <span id="v6200Count">0 / 50</span></b><select id="v6200Filter"><option value="all">Alle Kämpfe</option><option value="incoming">Angriffe auf mich</option><option value="outgoing">Meine Angriffe</option><option value="wins">Nur Siege</option><option value="losses">Nur Niederlagen</option></select></div><div id="v6200ServerNote"></div><div id="v6200Rows" class="v6200-rows"></div><button class="btn secondary v6200-mark-all" id="v6200MarkAll">✓ Alle als gesehen markieren</button></div><div id="v6200Detail" class="v6200-log-detail v6200-detail-empty"><div class="v6200-empty">Wähle einen Kampf aus.</div></div></div>`;
  p.querySelector('#v6200Filter').onchange=renderList;
  p.querySelector('#v6200MarkAll').onclick=markAll;
 }
 return p;
}
function paintBadge(){const c=rows.filter(unseen).length,b=document.getElementById('v6200CombatBadge');if(b){b.textContent=c>99?'99+':String(c);b.hidden=!c}}
function serverNote(){const box=document.getElementById('v6200ServerNote');if(!box)return;box.innerHTML=serverReady?'':'<div class="v6200-server-note">⚠️ Kampflog-Server noch nicht eingerichtet. Eigene Kämpfe werden lokal angezeigt; Angriffe anderer Spieler erscheinen nach einmaligem Ausführen der mitgelieferten Supabase-SQL.</div>'}
function filtered(){const f=document.getElementById('v6200Filter')?.value||'all';return rows.filter(r=>f==='all'||(f==='incoming'&&!isAttacker(r))||(f==='outgoing'&&isAttacker(r))||(f==='wins'&&relativeWin(r))||(f==='losses'&&!relativeWin(r)))}
function renderList(){
 ensurePanel();serverNote();const box=document.getElementById('v6200Rows'),count=document.getElementById('v6200Count');if(!box)return;
 const list=filtered();if(count)count.textContent=`${rows.length} / 50`;
 box.innerHTML=list.length?list.map(r=>{const o=opponent(r),win=relativeWin(r),dir=isAttacker(r)?'Du hast angegriffen':'hat dich angegriffen',active=String(r.client_token)===activeToken?' active':'';return `<div class="v6200-row ${win?'win':'loss'}${active}" data-v6200-open="${esc(r.client_token)}"><img class="v6200-avatar" src="${esc(avatar(o.classId))}" alt=""><div class="v6200-row-copy"><b>${esc(o.name)}${unseen(r)?'<span class="v6200-unseen"></span>':''}</b><small>${isAttacker(r)?dir:`${esc(r.attacker_name)} ${dir}`} · Lv. ${o.level} · ${fmt(o.power)} KP</small></div><div class="v6200-row-result"><b>${win?'🏆 Sieg':'💀 Niederlage'}</b><small>${esc(when(r.created_at))}</small></div></div>`}).join(''):'<div class="v6200-empty">Noch keine PvP-Kämpfe gespeichert.</div>';
 box.querySelectorAll('[data-v6200-open]').forEach(el=>el.onclick=()=>openRow(el.dataset.v6200Open));paintBadge();
}
function detailHtml(r){
 const o=opponent(r),m=me(r),win=relativeWin(r),incoming=!isAttacker(r),events=Array.isArray(r.replay?.events)?r.replay.events:[];
 const reward=incoming?'<b>Verteidigung</b><br>Für eingehende Angriffe gibt es aktuell keine Gold-/EXP-Auszahlung.':`<b>Belohnung</b><br>🪙 +${fmt(r.gold)} Gold · ⭐ +${fmt(r.xp)} EXP · 🌿 +${fmt(r.buds)} PvP-Buds`;
 const excerpt=events.length?events.slice(0,12).map(e=>`<div class="v6200-round"><b>Runde ${Math.max(1,n(e.round)||1)}</b><span>${esc(e.text||((e.actor==='attacker'?r.attacker_name:r.defender_name)+' greift an.'))}</span></div>`).join(''):'<div class="v6200-empty">Für diesen älteren Kampf ist keine Rundenaufzeichnung vorhanden.</div>';
 return `<div class="v6200-log-head"><b>Kampfdetails</b><span>${esc(when(r.created_at))}</span></div><div class="v6200-detail-body"><div class="v6200-outcome ${win?'':'loss'}"><strong>${win?'🏆 Sieg!':'💀 Niederlage'}</strong><span>${incoming?(win?'Du hast den Angriff abgewehrt.':'Der Angreifer hat gewonnen.'):(win?'Du hast den Gegner besiegt.':'Der Gegner hat gewonnen.')}</span></div><div class="v6200-versus"><div class="v6200-fighter-card"><img src="${esc(avatar(o.classId))}" alt=""><div><b>${esc(o.name)}</b><small>Lv. ${o.level} · ${esc(className(o.classId,o.className))}</small><small>⚔️ ${fmt(o.power)} KP · ${fmt(o.hpAfter)} / ${fmt(o.maxHp)} HP</small></div></div><div class="v6200-vs">VS</div><div class="v6200-fighter-card me"><img src="${esc(avatar(m.classId))}" alt=""><div><b>Du · ${esc(m.name)}</b><small>Lv. ${m.level} · ${esc(className(m.classId,m.className))}</small><small>⚔️ ${fmt(m.power)} KP · ${fmt(m.hpAfter)} / ${fmt(m.maxHp)} HP</small></div></div></div><div class="v6200-detail-actions"><button class="btn secondary" data-v6200-profile="${esc(o.id)}">👤 Profil ansehen</button><button class="btn" data-v6200-replay="${esc(r.client_token)}" ${events.length?'':'disabled'}>▶ Kampf ansehen</button><button class="btn secondary" data-v6200-message="${esc(o.name)}">💬 Nachricht schreiben</button></div><div class="v6200-summary"><div><b>Kampfzusammenfassung</b><br>Runden: ${fmt(r.rounds)}<br>Deine HP: ${fmt(m.hpAfter)} / ${fmt(m.maxHp)}<br>Gegner HP: ${fmt(o.hpAfter)} / ${fmt(o.maxHp)}</div><div>${reward}</div></div><div class="v6200-rounds"><h4>Rundenverlauf</h4>${excerpt}</div></div>`;
}
async function openRow(token){
 const r=rows.find(x=>String(x.client_token)===String(token));if(!r)return;activeToken=String(token);
 if(unseen(r)){r.defender_seen=true;try{if(online()&&r.id)await v073Db.rpc('v6200_mark_pvp_battle_seen',{p_id:Number(r.id)})}catch(e){console.warn('V6.200 mark seen',e)}paintBadge()}
 renderList();const d=document.getElementById('v6200Detail');if(d){d.classList.remove('v6200-detail-empty');d.innerHTML=detailHtml(r)};
 d?.querySelector('[data-v6200-profile]')?.addEventListener('click',e=>{try{v074OpenProfile(e.currentTarget.dataset.v6200Profile)}catch(_){}});
 d?.querySelector('[data-v6200-replay]')?.addEventListener('click',e=>replay(String(e.currentTarget.dataset.v6200Replay)));
 d?.querySelector('[data-v6200-message]')?.addEventListener('click',e=>composeTo(String(e.currentTarget.dataset.v6200Message||'')));
}
function composeTo(name){const b=document.querySelector('[data-v381-tab="compose"]');b?.click();queueMicrotask(()=>{const i=document.getElementById('v381Recipient');if(i){i.value=name;i.focus()}})}
async function markAll(){rows.forEach(r=>{if(!isAttacker(r))r.defender_seen=true});paintBadge();renderList();try{if(online())await v073Db.rpc('v6200_mark_all_pvp_battles_seen')}catch(e){console.warn('V6.200 mark all',e)}}
async function load(){
 ensurePanel();if(loading)return;loading=true;
 try{
  let server=[];serverReady=true;
  if(online()){
   const id=uid();const {data,error}=await v073Db.from('pvp_battle_logs').select('*').or(`attacker_id.eq.${id},defender_id.eq.${id}`).order('created_at',{ascending:false}).limit(50);
   if(error){const msg=String(error.message||error);if(/pvp_battle_logs|relation|schema cache|does not exist|PGRST205/i.test(msg)){serverReady=false}else throw error}else server=(data||[]).map(normalize);
  }
  const local=localRead().map(normalize),map=new Map();[...server,...local].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).forEach(r=>{if(!map.has(r.client_token))map.set(r.client_token,r)});rows=[...map.values()].slice(0,50);
  renderList();if(activeToken&&rows.some(r=>r.client_token===activeToken))openRow(activeToken);else{const d=document.getElementById('v6200Detail');if(d){d.classList.add('v6200-detail-empty');d.innerHTML='<div class="v6200-empty">Wähle einen Kampf aus.</div>'}}
 }catch(e){console.error('V6.200 battle log load',e);serverReady=false;rows=localRead().map(normalize).slice(0,50);renderList()}finally{loading=false}
}
window.v6200LoadBattleLog=load;
function buildRecord(win,enemy,gold,xp,replay){
 if(!replay||typeof replay!=='object')return null;const a=replay.attacker||{},d=replay.defender||{};if(!d.id)return null;
 const token=`${uid()||a.id||'u'}:${d.id}:${Date.now()}:${Math.random().toString(36).slice(2,8)}`;
 return normalize({client_token:token,attacker_id:uid()||a.id,defender_id:d.id,attacker_name:a.name||s.characterName||'Spieler',defender_name:d.name||enemy?.character_name||'Gegner',attacker_level:a.level,defender_level:d.level,attacker_class:a.classId,defender_class:d.classId,attacker_class_name:a.className,defender_class_name:d.className,attacker_power:a.power,defender_power:d.power,attacker_max_hp:a.maxHp,defender_max_hp:d.maxHp,attacker_hp_after:a.hpAfter,defender_hp_after:d.hpAfter,attacker_won:!!win,gold:win?Math.max(0,Math.round(n(gold))):Math.max(0,Math.round(n(gold)*.35)),xp:win?Math.max(0,Math.round(n(xp))):Math.max(0,Math.round(n(xp)*.45)),buds:win?Math.max(0,Math.round(n(s?.v204Pvp?.lastBudReward))):0,rounds:replay.rounds,replay,defender_seen:false,created_at:new Date().toISOString()});
}
async function saveFight(win,enemy,gold,xp,replay){
 const r=buildRecord(win,enemy,gold,xp,replay);if(!r)return;localAdd({...r,defender_seen:true});
 try{
  if(online()){
   const p={p_client_token:r.client_token,p_defender_id:r.defender_id,p_attacker_name:r.attacker_name,p_defender_name:r.defender_name,p_attacker_level:r.attacker_level,p_defender_level:r.defender_level,p_attacker_class:r.attacker_class,p_defender_class:r.defender_class,p_attacker_class_name:r.attacker_class_name,p_defender_class_name:r.defender_class_name,p_attacker_power:r.attacker_power,p_defender_power:r.defender_power,p_attacker_max_hp:r.attacker_max_hp,p_defender_max_hp:r.defender_max_hp,p_attacker_hp_after:r.attacker_hp_after,p_defender_hp_after:r.defender_hp_after,p_attacker_won:r.attacker_won,p_gold:r.gold,p_xp:r.xp,p_buds:r.buds,p_rounds:r.rounds,p_replay:r.replay};
   const {error}=await v073Db.rpc('v6200_log_pvp_battle',p);if(error){if(/v6200_log_pvp_battle|function .* does not exist|schema cache/i.test(String(error.message||'')))serverReady=false;else console.warn('V6.200 server log',error)}
  }
 }catch(e){console.warn('V6.200 server log',e)}
 if(document.getElementById('mail')?.classList.contains('active'))void load();
}
function ensureReplay(){
 let ov=document.getElementById('v6200ReplayOverlay');if(ov)return ov;ov=document.createElement('div');ov.id='v6200ReplayOverlay';ov.innerHTML=`<div class="v6200-replay-card"><div class="v6200-replay-head"><h3>⚔️ Kampf-Wiederholung</h3><button class="btn secondary" data-v6200-close>✕</button></div><div class="v6200-replay-stage"><div class="v6200-rfighter" id="v6200ReplayA"><img alt=""><b></b><small></small><div class="v6200-rhp"><span></span></div><div class="v6200-rhptext"></div></div><div class="v6200-rvs">VS</div><div class="v6200-rfighter" id="v6200ReplayD"><img alt=""><b></b><small></small><div class="v6200-rhp"><span></span></div><div class="v6200-rhptext"></div></div></div><div class="v6200-replay-log" id="v6200ReplayLog">Kampf wird vorbereitet …</div><div class="v6200-replay-foot"><span id="v6200ReplayRound">RUNDE 1</span><button class="btn secondary" data-v6200-close>Wiederholung schließen</button></div></div>`;document.body.appendChild(ov);ov.querySelectorAll('[data-v6200-close]').forEach(b=>b.onclick=()=>{replayRun++;ov.classList.remove('show')});ov.onclick=e=>{if(e.target===ov){replayRun++;ov.classList.remove('show')}};return ov;
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function setReplayFighter(el,p){el.querySelector('img').src=avatar(p.classId);el.querySelector('b').textContent=p.name;el.querySelector('small').textContent=`Lv. ${p.level} · ${className(p.classId,p.className)} · ${fmt(p.power)} KP`;const bar=el.querySelector('.v6200-rhp>span'),t=el.querySelector('.v6200-rhptext');bar.style.width='100%';t.textContent=`${fmt(p.maxHp)} / ${fmt(p.maxHp)} HP`}
function replayHp(el,value,max){const v=Math.max(0,n(value)),m=Math.max(1,n(max));el.querySelector('.v6200-rhp>span').style.width=`${Math.max(0,Math.min(100,v/m*100))}%`;el.querySelector('.v6200-rhptext').textContent=`${fmt(v)} / ${fmt(m)} HP`}
async function replay(token){
 const r=rows.find(x=>String(x.client_token)===String(token));if(!r)return;const events=Array.isArray(r.replay?.events)?r.replay.events:[];if(!events.length)return;const ov=ensureReplay(),a=r.replay.attacker||{},d=r.replay.defender||{},ae=ov.querySelector('#v6200ReplayA'),de=ov.querySelector('#v6200ReplayD'),log=ov.querySelector('#v6200ReplayLog'),roundEl=ov.querySelector('#v6200ReplayRound');setReplayFighter(ae,a);setReplayFighter(de,d);ov.classList.add('show');const run=++replayRun;await sleep(450);
 for(const e of events){if(run!==replayRun||!ov.classList.contains('show'))return;roundEl.textContent=`RUNDE ${Math.max(1,n(e.round)||1)}`;const from=e.actor==='defender'?de:ae,to=e.actor==='defender'?ae:de;from.classList.remove('attack-right','attack-left');void from.offsetWidth;from.classList.add(e.actor==='defender'?'attack-left':'attack-right');await sleep(190);replayHp(ae,e.attackerHp,a.maxHp);replayHp(de,e.defenderHp,d.maxHp);to.classList.remove('hit');void to.offsetWidth;if(!e.dodge)to.classList.add('hit');log.textContent=e.text||`${e.actor==='defender'?d.name:a.name} greift an.`;try{window.v6225ExtraHitVisual?.('pvpReplay',String(e.label||e.text||''),{round:e.round,actor:e.actor})}catch(_){}await sleep(520)}
 if(run===replayRun)log.textContent=relativeWin(r)?'🏆 Kampf beendet – Sieg.':'💀 Kampf beendet – Niederlage.';
}
/* Final canonical PvP finish hook. All historic wrappers underneath preserve extra arguments via arguments/apply. */
try{
 const base=window.v209FinishBattle||(typeof v209FinishBattle==='function'?v209FinishBattle:null);
 if(typeof base==='function'&&!base.__v6200BattleLog){
  const wrapped=async function(win,enemy,gold,xp,replayData){const result=await base.apply(this,arguments);try{await saveFight(!!win,enemy,gold,xp,replayData)}catch(e){console.warn('V6.200 save fight',e)}return result};
  wrapped.__v6200BattleLog=true;window.v209FinishBattle=wrapped;try{v209FinishBattle=wrapped}catch(_){}
 }
}catch(e){console.warn('V6.200 finish hook',e)}
/* Mail opening and tab badge refresh. */
document.addEventListener('click',e=>{const t=e.target?.closest?.('[data-v381-tab="battlelog"]');if(t)void load()},true);
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='mail')void load()},{passive:true});
queueMicrotask(()=>{ensurePanel();if(document.getElementById('mail')?.classList.contains('active'))void load()});
setInterval(()=>{if(!document.hidden&&document.getElementById('mail')?.classList.contains('active'))load()},60000);
})();
