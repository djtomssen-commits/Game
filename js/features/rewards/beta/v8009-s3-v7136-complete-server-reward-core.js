(()=>{
'use strict';
if(window.__V7136_COMPLETE_REWARDS__)return;
window.__V7136_COMPLETE_REWARDS__=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Math.max(0,Math.floor(Number(v)||0));
const nice=v=>String(v||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const seedName=id=>{try{return seedTypes?.[id]?.name||window.SEEDS?.[id]?.name||nice(id)}catch(_){return nice(id)}};
const itemHtml=it=>{
 if(!it||typeof it!=='object')return'';
 try{if(typeof v240ItemRewardHtml==='function')return v240ItemRewardHtml(it)}catch(_){}
 return `<div class="v7136-reward-line v7136-material">${esc(it.icon||'🎁')} <strong>${esc(it.name||'Gegenstand')}</strong>${it.quality?` · ${esc(nice(it.quality))}`:''}</div>`;
};
const materialHtml=it=>{
 if(!it||typeof it!=='object')return'';
 const type=String(it.type||'').toLowerCase();
 const icon=it.icon||(type==='scroll'?'📜':'💎');
 return `<div class="v7136-reward-line v7136-material">${esc(icon)} <strong>${esc(it.name||(type==='scroll'?'Verzauberungsrolle':'Edelstein'))}</strong>${it.quality?` · ${esc(nice(it.quality))}`:''}</div>`;
};
function petLines(pets){
 const list=Array.isArray(pets)?pets:[pets];
 return list.filter(p=>p&&p.drop&&p.pet_id).map(p=>`<div class="v7136-reward-line v7136-pet">🐾 Pet gefunden: <strong>${esc(nice(p.pet_id))}</strong>${p.quality?` · ${esc(nice(p.quality))}`:''}</div>`);
}
function seedLines(sr){
 const out=[];if(!sr||typeof sr!=='object')return out;
 if(n(sr.time_amount)>0)out.push(`<div class="v7136-reward-line">⏳ <strong>+${n(sr.time_amount)} Zeit-Samen</strong></div>`);
 if(n(sr.grow_amount)>0)out.push(`<div class="v7136-reward-line">🌰 <strong>+${n(sr.grow_amount)} ${esc(seedName(sr.grow_seed||'Samen'))}</strong></div>`);
 return out;
}
function directExtras(b,{showNoLoot=true}={}){
 const rows=[];
 if(n(b?.harz_awarded)>0)rows.push(`<div class="v7136-reward-line">🟢 <strong>+${n(b.harz_awarded)} Harz-Taler</strong></div>`);
 if(n(b?.fragments_awarded)>0)rows.push(`<div class="v7136-reward-line">🧩 <strong>+${n(b.fragments_awarded)} Fragmente</strong></div>`);
 rows.push(...seedLines(b?.seed_reward));
 const mats=Array.isArray(b?.materials)?b.materials:[];mats.forEach(m=>rows.push(materialHtml(m)));
 if(b?.item)rows.push(itemHtml(b.item));
 rows.push(...petLines(b?.pet));
 const du=b?.dungeon_unlock;
 if(du&&du.won&&Number.isInteger(Number(du.target)))rows.push(`<div class="v7136-reward-line v7136-special">🗝️ <strong>Dungeon ${Number(du.target)+1} freigeschaltet</strong></div>`);
 if(!rows.length&&showNoLoot)rows.push('<div class="v7136-reward-line">Keine zusätzliche Beute gefunden.</div>');
 return rows;
}
function showQuest(b,ctx={}){
 let ov=null;try{ov=v231EnsureQuestReward?.()}catch(_){};if(!ov)return false;
 try{window.v6111Sfx?.('reward')}catch(_){}
 const q=ctx.quest||{};
 const name=ov.querySelector('#v231QuestRewardName'),xp=ov.querySelector('#v231QuestRewardXp'),gold=ov.querySelector('#v231QuestRewardGold'),extra=ov.querySelector('#v231QuestRewardExtra');
 if(name)name.textContent=q.name||(ctx.recovered?'Quest-Belohnung wiederhergestellt':'Auftrag abgeschlossen');
 if(xp)xp.textContent=`+${n(b?.xp_awarded)}`;
 if(gold)gold.textContent=`+${n(b?.gold_awarded)}`;
 const rows=directExtras(b,{showNoLoot:true});
 if(b?.xp_event_x2)rows.unshift('<div class="v7136-reward-line v7136-special">⭐ Erfahrungs-Event ×2 bereits eingerechnet</div>');
 if(b?.gold_event_x2)rows.unshift('<div class="v7136-reward-line v7136-special">💰 Gold-Event ×2 bereits eingerechnet</div>');
 if(extra){extra.style.display='';extra.innerHTML=`<div class="v7136-reward-list">${rows.join('')}</div>`;}
 ov.classList.add('show');requestAnimationFrame(()=>ov.classList.add('show'));return true;
}
function showDungeon(b,ctx={}){
 let ov=null;try{ov=v247EnsureDungeonReward?.()}catch(_){};if(!ov)return false;
 try{window.v6111Sfx?.('reward')}catch(_){}
 const di=n(b?.dungeon_index),ri=n(b?.room_index);let enemy=null,dungeon=null;try{enemy=dungeons?.[di]?.enemies?.[ri]||null;dungeon=dungeons?.[di]||null}catch(_){}
 const icon=ov.querySelector('.v231-quest-icon'),title=ov.querySelector('.v231-quest-title'),name=ov.querySelector('#v247DungeonRewardName'),xp=ov.querySelector('#v247DungeonRewardXp'),gold=ov.querySelector('#v247DungeonRewardGold'),extra=ov.querySelector('#v247DungeonRewardExtra'),ok=ov.querySelector('#v247DungeonRewardOk');
 if(icon)icon.textContent=b?.boss?'👑':'⚔️';
 if(title)title.textContent=b?.boss?'DUNGEON ABGESCHLOSSEN':(ctx.recovered?'BELOHNUNG WIEDERHERGESTELLT':'GEGNER BESIEGT');
 if(name)name.textContent=b?.boss?`${dungeon?.name||'Dungeon'} · ${enemy?.name||'Boss'}`:`${enemy?.name||'Gegner'} · Dungeon ${di+1}`;
 if(xp)xp.textContent=`+${n(b?.xp_awarded)}`;if(gold)gold.textContent=`+${n(b?.gold_awarded)}`;
 const rows=[];
 if(b?.boss)rows.push('<div class="v7136-reward-line v7136-special">👑 Boss-Belohnung</div>');
 rows.push(...directExtras(b,{showNoLoot:!b?.boss}));
 if(b?.boss)rows.push('<div class="v7136-reward-line v7136-special">⛓️ Dungeon abgeschlossen · Fortschritt serverseitig gespeichert</div>');
 if(extra)extra.innerHTML=`<div class="v7136-reward-list">${rows.join('')}</div>`;
 if(ok){ok.textContent=b?.boss?'Belohnung bestätigen · Zur Dungeon-Karte':'Belohnung bestätigen · Zur 10er-Karte';ok.onclick=()=>{try{v247ReturnAfterDungeonReward?.({dungeonIndex:di,roomIndex:ri,enemy,boss:!!b?.boss})}catch(_){ov.classList.remove('show')}};}
 ov.classList.add('show');requestAnimationFrame(()=>ov.classList.add('show'));return true;
}
function harvestPlantRows(b){
 const rows=Array.isArray(b?.rows)?b.rows:[];const grouped=new Map();
 for(const r of rows){
  const key=[r?.seed||'',r?.quality||'',r?.mutation||''].join('|');
  const g=grouped.get(key)||{count:0,seed:r?.seed,quality:r?.quality,mutation:r?.mutation,fragments:0,material:[]};g.count++;g.fragments+=n(r?.fragments);if(r?.material)g.material.push(r.material);grouped.set(key,g);
 }
 const out=[];
 for(const g of grouped.values()){
  const mut=g.mutation?` · Mutation: ${esc(nice(g.mutation))}`:'';
  out.push(`<div class="v7136-reward-line">🌿 <strong>${g.count}× ${esc(seedName(g.seed))}</strong> · Qualität ${esc(g.quality||'?')}${mut}</div>`);
  g.material.forEach(m=>out.push(materialHtml(m)));
 }
 return out;
}
function growOrderRewardRows(contract){
 const rows=[];
 for(const r of (Array.isArray(contract?.reward)?contract.reward:[])){
  const amt=n(r?.amount);
  if(r?.type==='gold'&&amt)rows.push(`<div class="v7136-reward-line">🪙 <strong>+${amt.toLocaleString('de-DE')} Gold</strong></div>`);
  else if(r?.type==='xp'&&amt)rows.push(`<div class="v7136-reward-line">⭐ <strong>+${amt.toLocaleString('de-DE')} EXP</strong></div>`);
  else if(r?.type==='fragments'&&amt)rows.push(`<div class="v7136-reward-line">🧩 <strong>+${amt.toLocaleString('de-DE')} Fragmente</strong></div>`);
  else if(r?.type==='time'&&amt)rows.push(`<div class="v7136-reward-line">⏳ <strong>+${amt} Zeit-Samen</strong></div>`);
  else if(r?.type==='harz'&&amt)rows.push(`<div class="v7136-reward-line">🟢 <strong>+${amt} Harz-Taler</strong></div>`);
  else if(r?.type==='seed'&&amt)rows.push(`<div class="v7136-reward-line">🌰 <strong>+${amt}× ${esc(seedName(r?.seed||'Samen'))}</strong></div>`);
 }
 return rows;
}
function ensureGrowOrderReward(){
 let ov=document.getElementById('v7136GrowOrderReward');if(ov)return ov;
 ov=document.createElement('div');ov.id='v7136GrowOrderReward';ov.innerHTML=`
  <div class="v7136-grow-order-card" role="dialog" aria-modal="true" aria-label="Grow-Auftrag Belohnung">
   <div class="v7136-grow-order-icon">📋</div>
   <div class="v7136-grow-order-kicker">GROW-AUFTRAG</div>
   <h2 id="v7136GrowOrderTitle">Auftrag abgeschlossen</h2>
   <div id="v7136GrowOrderName" class="v7136-grow-order-name"></div>
   <div id="v7136GrowOrderState" class="v7136-grow-order-state"></div>
   <div id="v7136GrowOrderLines" class="v7136-reward-list"></div>
   <button type="button" class="btn" id="v7136GrowOrderOk">OK</button>
  </div>`;
 document.body.appendChild(ov);
 const close=()=>ov.classList.remove('show');
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ov.querySelector('#v7136GrowOrderOk')?.addEventListener('click',close);
 return ov;
}
function showGrowOrder(b,ctx={}){
 const contracts=Array.isArray(b?.contracts)?b.contracts:Array.isArray(b?.orders?.contracts)?b.orders.contracts:Array.isArray(s?.grow?.v6160?.contracts)?s.grow.v6160.contracts:[];
 const id=String(ctx.contractId||'');
 const contract=contracts.find(c=>String(c?.id||'')===id)||ctx.contract||null;
 if(!contract)return false;
 const claimed=ctx.claimed!==false&&!!contract.claimed;
 const ov=ensureGrowOrderReward();
 const title=ov.querySelector('#v7136GrowOrderTitle'),name=ov.querySelector('#v7136GrowOrderName'),state=ov.querySelector('#v7136GrowOrderState'),lines=ov.querySelector('#v7136GrowOrderLines'),ok=ov.querySelector('#v7136GrowOrderOk');
 if(title)title.textContent=claimed?'Belohnung erhalten':'Auftrag abgeschlossen';
 if(name)name.textContent=String(contract.title||'Grow-Auftrag');
 if(state)state.textContent=claimed?'Die Belohnung wurde gutgeschrieben.':'Belohnung ist jetzt abholbereit.';
 const rows=growOrderRewardRows(contract);
 if(lines)lines.innerHTML=rows.length?rows.join(''):'<div class="v7136-reward-line">Belohnung verfügbar.</div>';
 if(ok)ok.textContent=claimed?'Belohnung bestätigen':'OK';
 try{window.v6111Sfx?.('reward')}catch(_){}
 ov.classList.add('show');requestAnimationFrame(()=>ov.classList.add('show'));return true;
}
function ensureGuildBossReward(){
 let ov=document.getElementById('v7136GuildBossReward');if(ov)return ov;
 ov=document.createElement('div');ov.id='v7136GuildBossReward';ov.innerHTML=`
  <div class="v7136-grow-order-card v7136-guildboss-card" role="dialog" aria-modal="true" aria-label="Gildenboss Belohnung">
   <div class="v7136-grow-order-icon">🏆</div>
   <div class="v7136-grow-order-kicker">GILDENBOSS</div>
   <h2 id="v7136GuildBossTitle">Belohnung erhalten</h2>
   <div id="v7136GuildBossName" class="v7136-grow-order-name"></div>
   <div id="v7136GuildBossState" class="v7136-grow-order-state">Die Belohnung wurde gutgeschrieben.</div>
   <div id="v7136GuildBossLines" class="v7136-reward-list"></div>
   <button type="button" class="btn" id="v7136GuildBossOk">Belohnung bestätigen</button>
  </div>`;
 document.body.appendChild(ov);
 const close=()=>ov.classList.remove('show');
 ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ov.querySelector('#v7136GuildBossOk')?.addEventListener('click',close);
 return ov;
}
function showGuildBoss(b){
 const ov=ensureGuildBossReward();
 const title=ov.querySelector('#v7136GuildBossTitle'),name=ov.querySelector('#v7136GuildBossName'),lines=ov.querySelector('#v7136GuildBossLines');
 if(title)title.textContent=b?.won?'Gildenboss besiegt!':'Gildenboss-Belohnung';
 if(name)name.textContent=b?.won?'Gemeinsamer Sieg der Gilde':'Belohnung der Bossrunde';
 const rows=[];
 if(n(b?.xp)>0)rows.push(`<div class="v7136-reward-line">⭐ <strong>+${n(b.xp).toLocaleString('de-DE')} EXP</strong></div>`);
 if(n(b?.gold)>0)rows.push(`<div class="v7136-reward-line">🪙 <strong>+${n(b.gold).toLocaleString('de-DE')} Gold</strong></div>`);
 if(n(b?.harz)>0)rows.push(`<div class="v7136-reward-line">🟢 <strong>+${n(b.harz)} Harz-Taler</strong></div>`);
 if(b?.seed)rows.push(`<div class="v7136-reward-line">🌰 <strong>+${esc(seedName(b.seed))}</strong></div>`);
 if(lines)lines.innerHTML=rows.length?rows.join(''):'<div class="v7136-reward-line">Belohnung erfolgreich gutgeschrieben.</div>';
 try{window.v6111Sfx?.('reward')}catch(_){}
 ov.classList.add('show');requestAnimationFrame(()=>ov.classList.add('show'));return true;
}
function showHarvest(b){
 let ov=null;try{ov=v237EnsureHarvestReward?.()}catch(_){};if(!ov)return false;
 try{window.v6111Sfx?.('reward')}catch(_){}
 const gold=ov.querySelector('#v237HarvestGold'),lines=ov.querySelector('#v237HarvestLines'),box=ov.querySelector('.v237-box');
 if(gold)gold.textContent=`+${n(b?.gold_awarded)} Gold`;
 let xp=ov.querySelector('#v241HarvestXp');if(!xp&&box){xp=document.createElement('div');xp.id='v241HarvestXp';xp.className='v241-xp';(lines||box).insertAdjacentElement?.(lines?'afterend':'beforeend',xp)}
 if(xp)xp.textContent=`⭐ +${n(b?.xp_awarded)} EXP`;
 const rows=harvestPlantRows(b);
 if(n(b?.fragments_awarded)>0)rows.push(`<div class="v7136-reward-line">🧩 <strong>+${n(b.fragments_awarded)} Fragmente</strong></div>`);
 if(b?.extra_seed)rows.push(`<div class="v7136-reward-line">🌰 Bonus-Samen: <strong>${esc(seedName(b.extra_seed))}</strong></div>`);
 if(b?.rare_seed)rows.push(`<div class="v7136-reward-line v7136-special">🌟 Seltener Samen: <strong>${esc(seedName(b.rare_seed))}</strong></div>`);
 rows.push(...petLines(b?.pets));
 if(lines)lines.innerHTML=`<div class="v7136-reward-list">${rows.length?rows.join(''):'<div class="v7136-reward-line">Ernte erfolgreich.</div>'}</div>`;
 ov.classList.add('show');requestAnimationFrame(()=>ov.classList.add('show'));return true;
}
window.v7136ShowServerReward=(kind,bundle,ctx={})=>{
 if(!bundle||typeof bundle!=='object')return false;
 if(kind==='quest')return showQuest(bundle,ctx);
 if(kind==='dungeon')return showDungeon(bundle,ctx);
 if(kind==='harvest')return showHarvest(bundle,ctx);
 if(kind==='growOrder')return showGrowOrder(bundle,ctx);
 if(kind==='guildBoss')return showGuildBoss(bundle,ctx);
 return false;
};
window.v7136RewardDiagnostics=()=>({version:String(window.GROW_LEGENDS_VERSION?.short||'V7.136'),serverRewardSource:true,quest:true,dungeon:true,harvest:true,growOrder:true,guildBoss:true});
})();
