(()=>{
 'use strict';
 if(window.__V6230_TOWER_DUNGEON_FX__)return;
 window.__V6230_TOWER_DUNGEON_FX__=true;
 const timers=new Map();
 const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
 const EFFECTS=[
  [/ABSOLUTER NULLPUNKT/i,'❄️ ABSOLUTER NULLPUNKT','frost','power'],
  [/PERFEKTER SCHUSS/i,'🎯 PERFEKTER SCHUSS','scout','power'],
  [/GRÜNER HAGEL/i,'🌿 GRÜNER HAGEL','scout','power'],
  [/BRUTALE ERNTE/i,'⚔️ BRUTALE ERNTE','wucht','power'],
  [/KETTENREAKTION/i,'⚡ KETTENREAKTION','magic','power'],
  [/SUPERNOVA/i,'✨ SUPERNOVA','magic','power'],
  [/TODESNEBEL/i,'☁️ TODESNEBEL','magic','power'],
  [/SEELENERNTE/i,'💀 SEELENERNTE','frost','power'],
  [/ZWILLINGSSCHNITT/i,'⚔️ ZWILLINGSSCHNITT','frost','power'],
  [/SEELENSCHNITT/i,'❄️ SEELENSCHNITT','frost','power'],
  [/FROSTSCHNITT/i,'❄️ FROSTSCHNITT','frost','power'],
  [/DOPPELREIF/i,'❄️ DOPPELREIF','frost','power'],
  [/KÄLTEMARKE/i,'❄️ KÄLTEMARKE','frost','power'],
  [/EISBRUCH/i,'🧊 EISBRUCH','frost','power'],
  [/NEBENHAND/i,'⚔️ NEBENHAND','frost','power'],
  [/HINRICHTUNG/i,'🎯 HINRICHTUNG','scout','power'],
  [/SALVE/i,'🏹 SALVE','scout','power'],
  [/DETONATION/i,'💣 DETONATION','magic','power'],
  [/RASEREI/i,'🔥 RASEREI','rage','power'],
  [/WUCHT/i,'⚔️ WUCHT','wucht','power'],
  [/\bKRIT\b|KRITISCH/i,'💥 KRITISCHER TREFFER','crit','power'],
  [/AUSGEWICHEN/i,'💨 AUSGEWICHEN','dodge','dodge'],
  [/RAUCHBARRIERE/i,'🛡️ RAUCHBARRIERE','guard','guard'],
  [/REIFBARRIERE/i,'🧊 REIFBARRIERE','guard','guard'],
  [/EWIGES EIS/i,'🧊 EWIGES EIS','frost','guard'],
  [/TOTENSTARRE/i,'❄️ TOTENSTARRE','frost','guard'],
  [/ZWEITE LUFT/i,'❤️ ZWEITE LUFT','heal','heal'],
  [/UNKRAUT VERGEHT NICHT/i,'🌿 UNKRAUT VERGEHT NICHT','guard','guard'],
  [/GEBLOCKT|\bBLOCK\b|\bSCHILD\b|REDUZIERT/i,'🛡️ GEBLOCKT','guard','guard'],
  [/\bDOT\b/i,'☠️ RAUCHSCHADEN','magic','power']
 ];
 function stage(){return document.querySelector('#tower .vT-battle-stage')}
 function strip(){const s=stage();if(!s)return null;let x=s.querySelector('.vT-proc-strip');if(!x){x=document.createElement('div');x.className='vT-proc-strip';s.appendChild(x)}return x}
 function restart(sel,cl,ms=620){const el=document.querySelector(sel);if(!el)return;const k=sel+'|'+cl;clearTimeout(timers.get(k));el.classList.remove(cl);void el.offsetWidth;el.classList.add(cl);timers.set(k,setTimeout(()=>{try{el.classList.remove(cl)}catch(_){}timers.delete(k)},ms))}
 function impact(side='enemy'){const s=stage();if(!s)return;const el=document.createElement('i');el.className='v6230-impact '+side;s.appendChild(el);setTimeout(()=>el.remove(),450)}
 function flash(kind,side='enemy'){
  if(kind==='heal')restart('#vTPlayerFighter','v6230-heal',680);
  else if(kind==='dodge')restart(side==='player'?'#vTPlayerFighter':'#vTEnemyFighter',side==='player'?'v6230-dodge':'v6230-dodge',560);
  else if(kind==='guard')restart('#vTPlayerFighter','v6230-guard',680);
  else if(kind==='power'){restart('#vTPlayerFighter','v6230-power',560);restart('#vTEnemyFighter','v6230-power',520)}
 }
 function chip(label,cls='',kind='',side='enemy'){
  const box=strip();if(!box)return;const key=clean(label).toUpperCase();const old=[...box.querySelectorAll('.v604-skill-chip')].find(x=>clean(x.textContent).toUpperCase()===key);
  if(old){old.remove();}
  const el=document.createElement('span');el.className='v604-skill-chip '+cls;el.textContent=label;box.appendChild(el);flash(kind,side);setTimeout(()=>{try{el.remove()}catch(_){}},1700);while(box.querySelectorAll('.v604-skill-chip').length>3)box.querySelector('.v604-skill-chip')?.remove();
 }
 function showRaw(raw,side){for(const [re,label,cls,kind] of EFFECTS){re.lastIndex=0;if(re.test(String(raw||'')))chip(label,cls,kind,side)}}
 window.v6230TowerCombatFx=function(ev={}){
  if(!document.querySelector('#tower.active')||!stage())return false;
  const phase=String(ev.phase||''),raw=String(ev.raw||'');
  if(phase==='enemyDodge'){chip('💨 AUSGEWICHEN','dodge','dodge','enemy');impact('enemy');return true}
  if(phase==='playerDodge'){chip('💨 AUSGEWICHEN','dodge','dodge','player');impact('player');return true}
  if(phase==='player'){
   impact('enemy');showRaw(raw,'enemy');
   if(ev.crit&&!/KRIT/i.test(raw))chip('💥 KRITISCHER TREFFER','crit','power','enemy');
   if(Number(ev.heal)>0)chip(`💚 LEBENSRAUB +${Math.round(Number(ev.heal)||0)} LP`,'heal','heal','player');
   return true;
  }
  if(phase==='enemy'){
   impact('player');showRaw(raw,'player');
   if(Number(ev.damage)===0&&!/AUSGEWICHEN/i.test(raw)&&!/BLOCK|SCHILD|BARRIERE|REDUZIERT/i.test(raw))chip('🛡️ GEBLOCKT','guard','guard','player');
   if(Number(ev.heal)>0)chip(`💚 HEILUNG +${Math.round(Number(ev.heal)||0)} LP`,'heal','heal','player');
   if(Number(ev.counter)>0){chip(`↩️ KONTER ${Math.round(Number(ev.counter)||0)}`,'scout','power','enemy');impact('enemy')}
   return true;
  }
  return false;
 };
 window.v6230TowerFxDiagnostics=()=>({enabled:true,stage:!!stage(),strip:!!stage()?.querySelector?.('.vT-proc-strip'),chips:stage()?.querySelectorAll?.('.v604-skill-chip')?.length||0,mode:'visual-only'});
})();
