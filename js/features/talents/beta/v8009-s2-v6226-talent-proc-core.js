(()=>{
 'use strict';
 if(window.__V6226_TALENT_PROC_FX__)return;
 window.__V6226_TALENT_PROC_FX__=true;

 const cls=()=>String(s?.playerClass||'');
 const has=(b,i)=>{try{return typeof v318Has==='function'&&v318Has(b,i)}catch(_){return false}};
 const seg=(b,i)=>{try{return typeof v318Seg==='function'?Math.max(0,Number(v318Seg(b,i))||0):0}catch(_){return 0}};
 const pct=(a,b)=>Math.max(0,Math.min(1,(Number(a)||0)/Math.max(1,Number(b)||1)));
 function append(r,label){
   if(!r||!label)return;
   const raw=String(r.text||'');
   if(raw.toUpperCase().includes(String(label).toUpperCase()))return;
   r.text=(raw&&raw!=='TREFFER'&&raw!=='FROSTTREFFER'&&raw!=='Gegner trifft')?`${raw} + ${label}`:(raw==='Gegner trifft'?`${raw} · ${label}`:label);
 }
 function pending(st,label){
   if(!st||!label)return;
   st.__v6226NextAttackTags=Array.isArray(st.__v6226NextAttackTags)?st.__v6226NextAttackTags:[];
   if(!st.__v6226NextAttackTags.includes(label))st.__v6226NextAttackTags.push(label);
 }

 /* Text-only wrapper around the final attack resolver. No chance/damage/heal value is changed. */
 try{
   if(typeof v318ResolvePlayerAttack==='function'&&!window.__v6226AttackTags){
     const base=v318ResolvePlayerAttack;
     const wrapped=function(st,ctx){
       const id=cls(),preMarks=Number(st?.frostMarks)||0,preChaos=Number(st?.chaosCrit)||0;
       const r=base.apply(this,arguments)||{};
       const n=Math.max(0,Number(st?.attackCount)||0);
       const pr=pct(ctx?.playerHp,ctx?.playerMax),er=pct(ctx?.enemyHp,ctx?.enemyMax);

       if(Array.isArray(st?.__v6226NextAttackTags)&&st.__v6226NextAttackTags.length){
         st.__v6226NextAttackTags.splice(0).forEach(x=>append(r,x));
       }

       if(id==='grower'){
         if(has('wucht',0)&&n%6===0)append(r,'VOLLTREFFER');
         if(r.wucht&&has('wucht',1))append(r,'SCHÄDELBRECHER');
         if(has('wucht',2)&&pr<.35)append(r,'GRÜNE RASEREI');
         if(/ZUSATZTREFFER/i.test(r.text||'')&&has('rage',2))append(r,'KEINE GNADE+');
         if(/FOLGETREFFER/i.test(r.text||'')&&has('rage',4))append(r,'WAHNSINN+');
         if(has('rage',5)&&n%5===0&&Number(r.heal)>0)append(r,'EWIGER KAMPF+');
         if(has('rage',6)&&pr<.30)append(r,'EWIGE RASEREI');
       }else if(id==='scout'){
         if(has('precision',0)&&n%6===0&&r.crit)append(r,'PRÄZISER TREFFER');
         if(has('precision',1)&&r.crit)append(r,'GEZIELTER SCHUSS');
         if(has('precision',2)&&er<.30)append(r,'TÖDLICHE PRÄZISION');
         if(has('dodge',4)&&r.crit)append(r,'PHANTOM+');
         if(has('salvo',0)&&n%10===0&&r.multi)append(r,'DOPPELSCHUSS');
         if(/DRITTTREFFER/i.test(r.text||'')&&has('salvo',2))append(r,'DREIFACHSCHUSS+');
         if(/\bSALVE\b/i.test(r.text||'')&&has('salvo',3))append(r,'PFEILHAGEL+');
         if(/FOLGETREFFER/i.test(r.text||'')&&has('salvo',4))append(r,'BLÄTTERSTURM+');
         if(/KETTENTREFFER/i.test(r.text||'')&&has('salvo',5))append(r,'ENDLOSE SALVE+');
       }else if(id==='bruiser'){
         if(has('magic',0)&&n%6===0)append(r,'ÜBERLADUNG+');
         if(/DETONATION/i.test(r.text||'')&&has('magic',1))append(r,'RAUCHDETONATION+');
         if(has('magic',3)&&er>.70)append(r,'ÜBERMACHT');
         if(has('magic',5)&&n%5===0)append(r,'GRENZENLOSE MACHT+');
         if(r.crit&&has('critmagic',0))append(r,'FUNKENFLUG+');
         if(/KETTENFUNKE/i.test(r.text||'')&&has('critmagic',1))append(r,'KETTENFUNKE+');
         if(r.crit&&has('critmagic',2)&&Number(st?.crits)%2===0)append(r,'KRITISCHE ÜBERLADUNG+');
         if(/EXPLOSION/i.test(r.text||'')&&has('critmagic',3))append(r,'EXPLOSION+');
         if(!r.crit&&has('critmagic',4)&&(Number(st?.chaosCrit)||0)>preChaos)append(r,'CHAOSMAGIE+');
         if(/FOLGETREFFER/i.test(r.text||'')&&has('critmagic',5))append(r,'MEISTER DER INSTABILITÄT');
         if(/\bDOT\b/i.test(r.text||'')&&has('smoke',1))append(r,'VERGIFTUNG+');
         if(/\bDOT\b/i.test(r.text||'')&&has('smoke',2))append(r,'GIFTIGER NEBEL+');
         if(/\bDOT\b/i.test(r.text||'')&&has('smoke',4)&&Number(r.heal)>0)append(r,'SEELENRAUCH+');
         if(/\bDOT\b/i.test(r.text||'')&&has('smoke',5))append(r,'ENDLOSER NEBEL');
       }else if(id==='frost'){
         if(has('frostblade',0)&&n%6===0&&/KÄLTEMARKE|DOPPELREIF/i.test(r.text||''))append(r,'REIFSCHLAG');
         if(/DOPPELREIF/i.test(r.text||'')&&has('frostblade',1))append(r,'DOPPELTE RUNE');
         if(has('frostblade',3)&&preMarks>=2)append(r,'GEFRORENES HERZ');
         if(/FROSTSCHNITT/i.test(r.text||'')&&has('frostblade',4))append(r,'KLINGENSTURM');
         if(/EISBRUCH|ABSOLUTER NULLPUNKT/i.test(r.text||'')&&has('frostblade',5))append(r,'SCHWARZEIS+');
         if(seg('deathpact',2)>0&&n%2===0)append(r,'RUNENWECHSEL');
         if(has('deathpact',2)&&n%4===0)append(r,'RUNENKREUZ');
         if(has('deathpact',3)&&pr<.40&&Number(r.heal)>0)append(r,'PAKTBLUT');
         if(has('deathpact',4)&&er<.25)append(r,'TODESURTEIL+');
         if(seg('deathpact',5)>0&&n%6===0&&Number(r.heal)>0)append(r,'GRABGRIFF');
         if(has('deathpact',5)&&n%6===0&&Number(r.heal)>0)append(r,'GRABGRIFF+');
         if(/ZWILLINGSSCHNITT|SEELENSCHNITT/i.test(r.text||'')&&has('deathpact',1)&&Number(r.heal)>0)append(r,'SEELENDURST');
       }
       return r;
     };
     try{v318ResolvePlayerAttack=wrapped}catch(_){}
     window.v318ResolvePlayerAttack=wrapped;
     window.__v6226AttackTags=true;
   }
 }catch(e){console.error('V6.226 attack tags',e)}

 /* Text-only wrapper around the final defense resolver. It only names mechanics
    that the resolver has already activated. */
 try{
   if(typeof v318ResolveEnemyAttack==='function'&&!window.__v6226DefenseTags){
     const base=v318ResolveEnemyAttack;
     const wrapped=function(st,ctx){
       const id=cls(),preDodges=Number(st?.dodges)||0,preGuaranteed=!!st?.guaranteedDodge&&!!st?.nextGuaranteedCounter;
       const n0=Number(st?.enemyAttackCount)||0,raw=Math.max(0,Number(ctx?.damage)||0);
       const ratio=pct(ctx?.playerHp,ctx?.playerMax),lethal=raw>=Math.max(1,Number(ctx?.playerHp)||1);
       const r=base.apply(this,arguments)||{};
       const n=Math.max(n0+1,Number(st?.enemyAttackCount)||0);

       if(id==='grower'){
         if(has('tank',0)&&ratio<.50)append(r,'STANDHAFT');
         if(has('tank',3)&&raw>Math.max(1,Number(st?.maxHp)||1)*.20)append(r,'DICKES FELL');
         if(has('tank',4)&&n<=2)append(r,'UNERSCHÜTTERLICH+');
         if(seg('tank',3)>0&&n%3===0&&Number(r.heal)>0)append(r,'REGENERATION');
         if(seg('tank',4)>0&&Number(r.counterDamage)>0)append(r,'DORNENHAUT');
       }else if(id==='scout'&&Number(r.damage)===0){
         if(has('dodge',0)&&n===1)append(r,'SEITWÄRTSSCHRITT+');
         if(has('dodge',1)&&Number(r.counterDamage)>0)append(r,'KONTERSCHUSS+');
         if(has('dodge',2)&&preDodges>=1)pending(st,'SCHATTENLÄUFER+');
         if(has('dodge',3)&&Number(r.heal)>0)append(r,'AKROBAT');
         if(has('dodge',5)&&lethal)append(r,'MEISTERREFLEX+');
         if(has('dodge',6)&&preGuaranteed)append(r,'UNBERÜHRBAR');
       }else if(id==='bruiser'){
         if(has('smoke',0)&&n===1)append(r,'RAUCHWAND+');
         if(/RAUCHBARRIERE/i.test(r.text||'')&&has('smoke',3))append(r,'RAUCHBARRIERE+');
       }else if(id==='frost'){
         if(has('iceguard',1)&&n%4===0)append(r,'KNOCHENFROST');
         if(seg('iceguard',3)>0&&Number(r.counterDamage)>0)append(r,'EISRÜCKSTOSS');
         if(/REIFBARRIERE/i.test(r.text||'')&&has('iceguard',2)&&Number(r.counterDamage)>0)append(r,'SPLITTERPANZER');
         if(/REIFBARRIERE/i.test(r.text||'')&&has('iceguard',4))pending(st,'EISKERN');
         if(seg('iceguard',5)>0&&n%4===0&&Number(r.heal)>0)append(r,'EISBLUT');
         if(has('iceguard',5)&&n%6===0&&Number(r.heal)>0)append(r,'GRABWACHT');
       }
       return r;
     };
     try{v318ResolveEnemyAttack=wrapped}catch(_){}
     window.v318ResolveEnemyAttack=wrapped;
     window.__v6226DefenseTags=true;
   }
 }catch(e){console.error('V6.226 defense tags',e)}

 const FX=[
  ['VOLLTREFFER','💥 VOLLTREFFER','rage'],['SCHÄDELBRECHER','💥 SCHÄDELBRECHER','rage'],['GRÜNE RASEREI','🌿 GRÜNE RASEREI','rage'],
  ['BLUTBAD','🩸 BLUTBAD','rage'],['UNAUFHALTSAM','⚔️ UNAUFHALTSAM','rage'],['KEINE GNADE+','🔥 KEINE GNADE+','rage'],
  ['WAHNSINN+','🔥 WAHNSINN+','rage'],['EWIGER KAMPF+','💚 EWIGER KAMPF+','guard'],['EWIGE RASEREI','🔥 EWIGE RASEREI','rage'],
  ['STANDHAFT','🛡️ STANDHAFT','guard'],['DICKES FELL','🛡️ DICKES FELL','guard'],['UNERSCHÜTTERLICH+','🛡️ UNERSCHÜTTERLICH+','guard'],
  ['REGENERATION','💚 REGENERATION','guard'],['DORNENHAUT','🌵 DORNENHAUT','guard'],
  ['PRÄZISER TREFFER','🎯 PRÄZISER TREFFER','scout'],['GEZIELTER SCHUSS','🎯 GEZIELTER SCHUSS','scout'],['TÖDLICHE PRÄZISION','🎯 TÖDLICHE PRÄZISION','scout'],
  ['PHANTOM+','🍃 PHANTOM+','scout'],['DOPPELSCHUSS','🏹 DOPPELSCHUSS','scout'],['DREIFACHSCHUSS+','🏹 DREIFACHSCHUSS+','scout'],
  ['PFEILHAGEL+','🏹 PFEILHAGEL+','scout'],['BLÄTTERSTURM+','🍃 BLÄTTERSTURM+','scout'],['ENDLOSE SALVE+','🏹 ENDLOSE SALVE+','scout'],
  ['SEITWÄRTSSCHRITT+','💨 SEITWÄRTSSCHRITT+','scout'],['KONTERSCHUSS+','↩️ KONTERSCHUSS+','scout'],['SCHATTENLÄUFER+','🌑 SCHATTENLÄUFER+','scout'],
  ['AKROBAT','💨 AKROBAT','scout'],['MEISTERREFLEX+','💨 MEISTERREFLEX+','scout'],['UNBERÜHRBAR','✨ UNBERÜHRBAR','scout'],
  ['ÜBERLADUNG+','⚡ ÜBERLADUNG+','magic'],['RAUCHDETONATION+','💣 RAUCHDETONATION+','magic'],['ÜBERMACHT','🔮 ÜBERMACHT','magic'],
  ['GRENZENLOSE MACHT+','🔮 GRENZENLOSE MACHT+','magic'],['FUNKENFLUG+','⚡ FUNKENFLUG+','magic'],['KETTENFUNKE+','⚡ KETTENFUNKE+','magic'],
  ['KRITISCHE ÜBERLADUNG+','⚡ KRITISCHE ÜBERLADUNG+','magic'],['EXPLOSION+','💥 EXPLOSION+','magic'],['CHAOSMAGIE+','🌀 CHAOSMAGIE+','magic'],
  ['MEISTER DER INSTABILITÄT','🌀 MEISTER DER INSTABILITÄT','magic'],['VERGIFTUNG+','☁️ VERGIFTUNG+','magic'],['GIFTIGER NEBEL+','☁️ GIFTIGER NEBEL+','magic'],
  ['SEELENRAUCH+','💚 SEELENRAUCH+','magic'],['ENDLOSER NEBEL','🌫️ ENDLOSER NEBEL','magic'],['RAUCHWAND+','🌫️ RAUCHWAND+','guard'],['RAUCHBARRIERE+','🛡️ RAUCHBARRIERE+','guard'],
  ['REIFSCHLAG','❄️ REIFSCHLAG','frost'],['DOPPELTE RUNE','❄️ DOPPELTE RUNE','frost'],['GEFRORENES HERZ','🧊 GEFRORENES HERZ','frost'],
  ['KLINGENSTURM','⚔️ KLINGENSTURM','frost'],['SCHWARZEIS+','🧊 SCHWARZEIS+','frost'],['RUNENWECHSEL','❄️ RUNENWECHSEL','frost'],
  ['RUNENKREUZ','❄️ RUNENKREUZ','frost'],['PAKTBLUT','🩸 PAKTBLUT','frost'],['TODESURTEIL+','☠️ TODESURTEIL+','frost'],
  ['GRABGRIFF','☠️ GRABGRIFF','frost'],['GRABGRIFF+','☠️ GRABGRIFF+','frost'],['SEELENDURST','💚 SEELENDURST','frost'],
  ['KNOCHENFROST','🧊 KNOCHENFROST','guard'],['EISRÜCKSTOSS','❄️ EISRÜCKSTOSS','frost'],['SPLITTERPANZER','🧊 SPLITTERPANZER','guard'],
  ['EISKERN','🧊 EISKERN','frost'],['EISBLUT','💚 EISBLUT','frost'],['GRABWACHT','🛡️ GRABWACHT','guard'],
  ['SEELENRAUB','💚 SEELENRAUB','summoner'],
  ['FLUCHNEBEL','🌫️ FLUCHNEBEL','summoner'],
  ['FLUCHSCHADEN','☠️ FLUCHSCHADEN','summoner'],
  ['KNOCHENPAKT','💀 KNOCHENPAKT','summoner'],
  ['DOPPELRUF','👻 DOPPELRUF','summoner'],
  ['ZWEITER RUF','👻 ZWEITER RUF','summoner'],
  ['GEISTERCHOR','👻 GEISTERCHOR','summoner'],
  ['DIE TOTEN GÄRTNERN MIT','🌿 DIE TOTEN GÄRTNERN MIT','summoner'],
  ['NICHT GANZ TOT','💚 NICHT GANZ TOT','summoner'],
  ['ALLES WIRD KOMPOST','☠️ ALLES WIRD KOMPOST','summoner']
 ];
 const seen=new Map();
 function stage(mode,actor){
   const left=actor==='defender';
   const sel=mode==='dungeon'?'#battleStage':mode==='quest'?'#v636QuestBattleStage':mode==='pvp'?'#v209PvpBattleOverlay .v209-stage':mode==='pvpReplay'?'#v6200ReplayOverlay .v6200-replay-stage':mode==='tower'?'#tower .vT-battle-stage':mode==='worldboss'?'#v111BossScene':'';
   return sel?{el:document.querySelector(sel),left}:null;
 }
 function matches(raw){
   const u=String(raw||'').toUpperCase(),out=[];
   for(const [key,label,c] of FX)if(u.includes(key))out.push({key,label,c});
   return out.slice(0,3);
 }
 function spawn(mode,actor,raw,round){
   const sp=stage(mode,actor);if(!sp?.el)return false;
   const ev=matches(raw);if(!ev.length)return false;
   const now=Date.now();for(const [k,v] of seen)if(now-v>5000)seen.delete(k);
   let n=0;
   ev.forEach((x,i)=>{
     const key=`${mode}|${actor}|${round||0}|${x.key}`;
     if(seen.has(key))return;seen.set(key,now);n++;
     setTimeout(()=>{
       if(!sp.el?.isConnected)return;
       const f=document.createElement('i'),r=document.createElement('i'),b=document.createElement('b');
       f.className=`v6226-talent-flare ${sp.left?'left':'right'}`;
       r.className=`v6226-talent-ring ${sp.left?'left':'right'}`;
       b.className=`v6226-talent-label ${sp.left?'left':'right'} ${x.c}`;b.textContent=x.label;
       sp.el.append(f,r,b);
       setTimeout(()=>{f.remove();r.remove()},520);setTimeout(()=>b.remove(),1120);
     },140+(n-1)*155);
   });
   return n>0;
 }
 window.v6226TalentProcVisual=spawn;

 /* Reuse every V6.225 combat integration. The old extra-hit visuals still run;
    V6.226 adds only talent-name FX on top. */
 try{
   const old=window.v6225ExtraHitVisual;
   if(typeof old==='function'&&!old.__v6226Wrapped){
     const w=function(mode,raw,opt={}){
       const out=old.apply(this,arguments);
       let actor=String(opt?.actor||'attacker');
       if(mode==='dungeon'&&/Gegner:/i.test(String(raw||''))){
         const parts=String(raw||'').split(/Gegner:/i);
         spawn(mode,'attacker',parts[0],opt?.round);
         spawn(mode,'defender',parts.slice(1).join('Gegner:'),opt?.round);
       }else spawn(mode,actor,raw,opt?.round);
       return out;
     };
     w.__v6226Wrapped=true;window.v6225ExtraHitVisual=w;
   }
 }catch(e){console.error('V6.226 visual bridge',e)}

 window.v6226TalentFxAudit=()=>({
   version:'V6.226',
   rule:'Aktive/bedingte Kampfprocs erhalten sichtbare Talent-FX. Reine Dauerwerte wie Stärke, HP, Crit-Chance, Durchdringung oder permanente Schadensreduktion bleiben bewusst ohne Proc-Animation.',
   modes:['Dungeon','Quest','PvP','PvP-Replay','Anbauturm','Weltboss'],
   passiveWithoutProcFx:['Hauptattribut','maximale LP','dauerhafte Schadensreduktion','dauerhafte Crit-Chance/-Schaden','Durchdringung','reine Schadensmultiplikatoren ohne einzelnes Auslöseereignis']
 });
})();
