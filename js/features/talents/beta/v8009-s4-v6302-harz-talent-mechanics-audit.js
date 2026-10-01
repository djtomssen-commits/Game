(()=>{
'use strict';
if(window.__V6302_HARZ_TALENT_MECHANICS__)return;
window.__V6302_HARZ_TALENT_MECHANICS__=true;

const FX=[
 ['DIE TOTEN GÄRTNERN MIT','🌿 DIE TOTEN GÄRTNERN MIT'],
 ['ALLES WIRD KOMPOST','☠️ ALLES WIRD KOMPOST'],
 ['NICHT GANZ TOT','💚 NICHT GANZ TOT'],
 ['KNOCHENPAKT','💀 KNOCHENPAKT'],
 ['ZWEITER RUF','👻 ZWEITER RUF'],
 ['DOPPELRUF','👻 DOPPELRUF'],
 ['GEISTERCHOR','👻 GEISTERCHOR'],
 ['SEELENRAUB','💚 SEELENRAUB'],
 ['FLUCHNEBEL','🌫️ FLUCHNEBEL'],
 ['FLUCHSCHADEN','☠️ FLUCHSCHADEN']
];

const seen=new Map();
function stage(mode){
 if(mode==='dungeon')return document.querySelector('#battleStage');
 if(mode==='quest')return document.querySelector('#v636QuestBattleStage')||document.querySelector('#v636QuestDungeonCard');
 if(mode==='pvp')return document.querySelector('#v209PvpBattleOverlay .v209-stage');
 if(mode==='pvpReplay')return document.querySelector('#v6200ReplayOverlay .v6200-replay-stage');
 if(mode==='tower')return document.querySelector('#tower .vT-battle-stage');
 if(mode==='worldboss')return document.querySelector('#v111BossScene');
 return null;
}
function show(mode,raw,opt={}){
 const root=stage(mode);if(!root)return false;
 if(getComputedStyle(root).position==='static')root.style.position='relative';
 const text=String(raw||'').toUpperCase();
 const hits=FX.filter(([key])=>text.includes(key)).slice(0,3);
 if(!hits.length)return false;
 const now=Date.now();
 for(const [k,v] of seen)if(now-v>4500)seen.delete(k);
 hits.forEach(([key,label],i)=>{
   const token=[mode,opt.actor||'attacker',Number(opt.round)||0,key].join('|');
   if(seen.has(token))return;
   seen.set(token,now);
   setTimeout(()=>{
     if(!root.isConnected)return;
     const chip=document.createElement('b');
     chip.className='v6302-harz-chip';chip.textContent=label;
     const aura=document.createElement('i');
     aura.className='v6302-harz-aura '+(opt.actor==='defender'?'def':'');
     root.append(aura,chip);
     setTimeout(()=>aura.remove(),560);
     setTimeout(()=>chip.remove(),1550);
   },i*145);
 });
 return true;
}

/* Existing combat modes already call v6225ExtraHitVisual with the final combat
   label. Extend that single bridge instead of adding timers/DOM observers. */
try{
 const old=window.v6225ExtraHitVisual;
 if(typeof old==='function'&&!old.__v6302HarzFx){
   const wrapped=function(mode,raw,opt={}){
     const r=old.apply(this,arguments);
     try{show(String(mode||''),raw,opt)}catch(_){}
     return r;
   };
   wrapped.__v6302HarzFx=true;
   window.v6225ExtraHitVisual=wrapped;
 }
}catch(e){console.warn('V6.302 Harz talent FX bridge',e)}

const NORMAL=Object.freeze({
 summon:[
  'Beschwörungschance','Begleiterschaden','Begleiter-Crit','Begleiterschaden',
  'Zweiter Begleiter','Beschwörungschance + Intelligenz','Begleiterschaden'
 ],
 soul:[
  'Lebensraub','Maximale LP','Schadensreduktion','Lebensraub',
  'Begleiterschaden','Schadensreduktion','Maximale LP'
 ],
 curse:[
  'Fluch-/DOT-Chance','DOT-Schaden','Rüstungsdurchdringung','Direktschaden',
  'Fluchchance + Fluchverstärkung','DOT-Schaden','Direktschaden'
 ]
});
const MILE=Object.freeze({
 summon:['passiver Rufbonus','passiver Rufbonus','zweiter Ruf','passiver Rufbonus','passiver Rufbonus','passiver Rufbonus','zweiter Ruf + starker Begleiterbonus'],
 soul:['passive Seelenwerte','passive Seelenwerte','passive Seelenwerte','passive Seelenwerte','passive Seelenwerte','passive Seelenwerte','tödlichen Treffer einmal überleben'],
 curse:['passive Fluchwerte','passive Fluchwerte','passive Fluchwerte','passive Fluchwerte','passive Fluchwerte','passive Fluchwerte','Fluchverstärkung gegen verfluchte Ziele']
});

window.v6302HarzTalentAudit=()=>({
 version:'V6.302',
 normalNodes:{
  summon:NORMAL.summon.length,
  soul:NORMAL.soul.length,
  curse:NORMAL.curse.length,
  total:NORMAL.summon.length+NORMAL.soul.length+NORMAL.curse.length
 },
 milestoneNodes:{
  summon:MILE.summon.length,
  soul:MILE.soul.length,
  curse:MILE.curse.length,
  total:MILE.summon.length+MILE.soul.length+MILE.curse.length
 },
 mechanics:{
  summon:'Rufchance, Begleiterschaden, Begleiter-Crit und Zweitbeschwörung laufen im Harzruferin-Resolver.',
  soul:'Lebensraub, LP, Schadensreduktion und NICHT GANZ TOT laufen über V319 + Harzruferin-Defense-Wrapper.',
  curse:'DOT-Chance, DOT-Schaden, Rüstungsdurchdringung, Direktschaden und Fluchverstärkung laufen jetzt vollständig.'
 },
 visibleActiveFx:[
  'Begleiterbilder','SEELENRAUB','FLUCHNEBEL','FLUCHSCHADEN','KNOCHENPAKT',
  'DOPPELRUF','ZWEITER RUF','GEISTERCHOR','DIE TOTEN GÄRTNERN MIT',
  'NICHT GANZ TOT','ALLES WIRD KOMPOST'
 ],
 modes:['Dungeon','Quest','PvP','PvP-Replay','Anbauturm','Weltboss'],
 note:'Reine passive Dauerwerte werden absichtlich nicht bei jedem Treffer eingeblendet.'
});
})();
