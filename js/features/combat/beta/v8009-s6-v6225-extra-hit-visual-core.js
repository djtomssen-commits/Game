(()=>{
 'use strict';
 if(window.__V6225_EXTRA_HIT_VISUAL__)return;
 window.__V6225_EXTRA_HIT_VISUAL__=true;
 const seen=new Map();
 const TYPES=[
  {id:'offhand',rx:/NEBENHAND/ig,label:'⚔️ NEBENHAND',cls:'frost'},
  {id:'twin',rx:/ZWILLINGSSCHNITT/ig,label:'⚔️ ZWILLINGSSCHNITT',cls:'frost'},
  {id:'soul',rx:/SEELENSCHNITT/ig,label:'❄️ SEELENSCHNITT',cls:'frost'},
  {id:'frostcut',rx:/FROSTSCHNITT/ig,label:'❄️ FROSTSCHNITT',cls:'frost'},
  {id:'rage',rx:/RASEREI/ig,label:'🔥 RASEREI',cls:'rage'},
  {id:'extra',rx:/ZUSATZTREFFER/ig,label:'💥 ZUSATZTREFFER',cls:'rage'},
  {id:'follow',rx:/FOLGETREFFER/ig,label:'🔥 FOLGETREFFER',cls:'rage'},
  {id:'salvo',rx:/\bSALVE\b/ig,label:'🏹 SALVE',cls:'scout'},
  {id:'third',rx:/DRITTTREFFER/ig,label:'🏹 DRITTTREFFER',cls:'scout'},
  {id:'chainhit',rx:/KETTENTREFFER/ig,label:'🏹 KETTENTREFFER',cls:'scout'},
  {id:'headshot',rx:/KOPFSCHUSS/ig,label:'🎯 KOPFSCHUSS',cls:'scout'},
  {id:'spark',rx:/KETTENFUNKE/ig,label:'⚡ KETTENFUNKE',cls:'magic'},
  {id:'explosion',rx:/\bEXPLOSION\b/ig,label:'💥 EXPLOSION',cls:'magic'},
  {id:'chain',rx:/KETTENREAKTION/ig,label:'⚡ KETTENREAKTION',cls:'magic'}
 ];
 function spec(mode,actor){
  const left=actor==='defender';
  if(mode==='dungeon')return{stage:'#battleStage',left:false};
  if(mode==='quest')return{stage:'#v636QuestBattleStage',left:false};
  if(mode==='pvp')return{stage:'#v209PvpBattleOverlay .v209-stage',left};
  if(mode==='tower')return{stage:'#tower .vT-battle-stage',left:false};
  if(mode==='pvpReplay')return{stage:'#v6200ReplayOverlay .v6200-replay-stage',left};
  if(mode==='worldboss')return{stage:'#v111BossScene',left:false,boss:true};
  return null;
 }
 function prune(now){for(const [k,v] of seen)if(now-v>5000)seen.delete(k)}
 function spawn(stage,ev,left,delay,boss){
  setTimeout(()=>{
   if(!stage?.isConnected)return;
   const slash=document.createElement('i');slash.className='v6225-extra-slash '+(left?'to-left':'to-right');
   const impact=document.createElement('i');impact.className='v6225-extra-impact '+(left?'left':'right');
   const label=document.createElement('b');label.className=`v6225-extra-label ${left?'left':'right'} ${ev.cls||''}`;label.textContent=ev.label;
   stage.append(slash,impact,label);
   try{window.v6111Sfx?.(ev.cls==='magic'?'crit':'hit')}catch(_){}
   setTimeout(()=>{slash.remove();impact.remove()},430);setTimeout(()=>label.remove(),980);
  },delay);
 }
 function parse(raw){
  const s=String(raw||'').toUpperCase(),out=[];
  for(const t of TYPES){t.rx.lastIndex=0;let m,n=0;while((m=t.rx.exec(s))&&n<3){out.push({...t,n:n++});if(m[0].length===0)t.rx.lastIndex++}}
  return out.slice(0,5);
 }
 window.v6225ExtraHitVisual=function(mode,raw,opt={}){
  const sp=spec(String(mode||''),String(opt.actor||'attacker'));if(!sp)return false;
  const stage=document.querySelector(sp.stage);if(!stage)return false;
  const events=parse(raw);if(!events.length)return false;
  const now=Date.now();prune(now);
  const r=Number(opt.round)||Number(String(raw||'').match(/Runde\s+(\d+)/i)?.[1])||0;
  let shown=0;
  events.forEach((ev,i)=>{
   const key=`${mode}|${opt.actor||'attacker'}|${r}|${ev.id}|${ev.n}`;
   if(seen.has(key))return;seen.set(key,now);shown++;
   spawn(stage,ev,!!sp.left,120+(shown-1)*135,!!sp.boss);
  });
  return shown>0;
 };
 window.v6225ExtraHitDiagnostics=()=>({enabled:true,seen:[...seen.keys()].slice(-20),modes:['dungeon','quest','pvp','tower','worldboss','pvpReplay']});
})();
