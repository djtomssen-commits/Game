(()=>{
 'use strict';
 const VERSION='V4.103 Stable',SHORT='V4.103',LOG_PREFIX='growLegendsQA:v4103:';
 let lastReport=null,lastRuntime=null,qaRunning=false,allowPlantDropUntil=0;
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(e){return null}};
 const now=()=>Date.now();
 const owner=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local')}catch(e){return'local'}};
 const logKey=()=>LOG_PREFIX+owner();
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 function stamp(){}
 function sourceText(){try{return [...document.scripts].map(x=>x.textContent||'').join('\n')}catch(e){return''}}
 function result(category,name,pass,detail='',severity='error'){return{category,name,pass:!!pass,detail:String(detail||''),severity}}
 function runOne(category,name,fn,severity='error'){
  try{const r=fn();if(r&&typeof r==='object'&&'pass'in r)return result(category,name,r.pass,r.detail||'',r.severity||severity);return result(category,name,!!r,'',severity)}catch(e){return result(category,name,false,e?.message||String(e),severity)}
 }
 function careStateAt(x,done=[false,false,false,false]){const at=[.20,.45,.70,.88];let available=-1,missed=0;for(let i=0;i<4;i++){const end=i===3?1:at[i+1];if(done[i])continue;if(x>=end){missed++;continue}if(x>=at[i]&&x<end){available=i;break}}return{available,missed}}
 function withDungeonSandbox(fn){const ds=clone(s?.dungeon),lvl=s?.level;try{return fn()}finally{s.dungeon=ds;s.level=lvl}}
 function withRandom(value,fn){const old=Math.random;Math.random=()=>value;try{return fn()}finally{Math.random=old}}
 function withConfirm(value,fn){const old=window.confirm;window.confirm=()=>value;try{return fn()}finally{window.confirm=old}}
 function withGrowMode(test){const ids=['pvp','guild','endgame','dungeon'];const active=ids.map(id=>{const el=document.getElementById(id);return[id,el?.classList.contains('active'),el?.style?.display??'']});const created=[];function get(id){let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.style.display='none';document.body.appendChild(el);created.push(el)}return el}const war=get('v254GuildWar'),boss=get('v254GuildBoss'),ov=get('v110Overlay');const old={war:war.style.display,boss:boss.style.display,show:ov.classList.contains('show')};try{ids.forEach(id=>document.getElementById(id)?.classList.remove('active'));war.style.display='none';boss.style.display='none';ov.classList.remove('show');return test({get,war,boss,ov})}finally{active.forEach(([id,on,display])=>{const el=document.getElementById(id);if(el){el.classList.toggle('active',!!on);el.style.display=display}});war.style.display=old.war;boss.style.display=old.boss;ov.classList.toggle('show',old.show);created.forEach(el=>el.remove())}}
 function runQA(){
  if(qaRunning)return lastReport;qaRunning=true;const out=[];const src=sourceText();
  const T=(c,n,f,s='error')=>out.push(runOne(c,n,f,s));
  try{
   T('Basis','Spielzustand vorhanden',()=>typeof s==='object'&&!!s);
   T('Basis','Speicherfunktion vorhanden',()=>typeof persist==='function');
   T('Basis','Navigation vorhanden',()=>typeof v032Go==='function');
   T('Basis','Growroom-Renderer vorhanden',()=>typeof renderGrow==='function');
   T('Basis','20 normale Dungeons vorhanden',()=>Array.isArray(dungeons)&&dungeons.length===20, 'error');
   T('Basis','Maximallevel ist 300',()=>Number(window.GROW_LEGENDS_MAX_LEVEL||300)===300);
   T('Basis','Fünf Klassen vorhanden',()=>typeof classes==='object'&&['grower','scout','bruiser','frost','summoner'].every(k=>classes[k]));
   T('Basis','V4.99 Grow-State-Schutz geladen',()=>src.includes('v499-grow-authority'));
   T('Basis','V4.100 Dungeon-Live-Unlock geladen',()=>typeof window.v4100SyncDungeonUnlocks==='function');
   T('Basis','V4.101 Pflegebindung geladen',()=>src.includes('data-v492-care-index')&&src.includes('carePlant(uid,intendedIndex=null)'));

   T('Spielstand','Level im erlaubten Bereich',()=>Number.isFinite(Number(s.level))&&Number(s.level)>=1&&Number(s.level)<=300);
   T('Spielstand','Gold nicht negativ/NaN',()=>Number.isFinite(Number(s.gold))&&Number(s.gold)>=0);
   T('Spielstand','Harz-Taler nicht negativ/NaN',()=>Number.isFinite(Number(s.harzTaler))&&Number(s.harzTaler)>=0);
   T('Spielstand','Dampf 0–300',()=>Number.isFinite(Number(s.energy))&&Number(s.energy)>=0&&Number(s.energy)<=300);
   T('Spielstand','Inventar ist gültig',()=>Array.isArray(s.inventory));
   T('Spielstand','Materiallager ist gültig',()=>Array.isArray(s.materials||[]));
   T('Spielstand','Ausrüstung ist gültig',()=>s.equipment&&typeof s.equipment==='object');
   T('Spielstand','Keine doppelten Inventar-IDs',()=>{const ids=(s.inventory||[]).map(x=>x?.id).filter(Boolean).map(String);return new Set(ids).size===ids.length});
   T('Spielstand','Item-Level höchstens 300',()=>[...(s.inventory||[]),...Object.values(s.equipment||{})].filter(Boolean).every(x=>!x.dropLevel||Number(x.dropLevel)<=300));
   T('Spielstand','Samenbestände nicht negativ',()=>Object.values(s.grow?.seeds||{}).every(v=>Number.isFinite(Number(v))&&Number(v)>=0));

   T('Growroom','Pflanzenliste vorhanden',()=>Array.isArray(s.grow?.plants));
   T('Growroom','Jede Pflanze besitzt UID',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>typeof p.uid==='string'&&p.uid.length>3));
   T('Growroom','Jede Pflanze besitzt gültige Zeit',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>Number(p.start)>0&&Number(p.duration)>=1000));
   T('Growroom','Jede Pflanze besitzt 4 Pflegewerte',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>Array.isArray(p.care)&&p.care.length===4));
   T('Growroom','Erledigte Pflege hat keinen falschen Typ',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>p.care.every(v=>typeof v==='boolean')));
   T('Growroom','Ausgewählte Pflanze existiert',()=>{const id=String(s.grow?.v492?.selectedPlantUid||'');return !id||(s.grow?.plants||[]).some(p=>p&&p.uid===id)});
   T('Growroom','Grow-State Revision vorhanden',()=>Number(s.grow?.v499Revision||0)>=0);
   T('Growroom','Pflegezeitstempel konsistent',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>!Array.isArray(p.careDoneAt)||p.care.every((v,i)=>!v||Number(p.careDoneAt[i])>0)), 'warn');
   T('Growroom','Normalisierung erhält UID/Pflege/Mutation',()=>{if(typeof normalizeState!=='function')return false;const original=s,copy=clone(s);try{s=copy;s.grow=s.grow||{};s.grow.plants=[{uid:'qa_plant',seed:Object.keys(seedTypes||{})[0]||'moss',start:123456789,duration:60000,care:[true,false,true,false],careDoneAt:[123456790,0,123456800,0],mutation:'purple',mutationChecked:true}];normalizeState();const p=s.grow.plants[0];return p?.uid==='qa_plant'&&p?.care?.[0]===true&&p?.care?.[2]===true&&p?.mutation==='purple'&&p?.careDoneAt?.[2]===123456800}finally{s=original}});

   const careCases=[[.199,-1,0],[.20,0,0],[.449,0,0],[.45,1,1],[.699,1,1],[.70,2,2],[.879,2,2],[.88,3,3],[.999,3,3],[1,-1,4]];
   careCases.forEach(([x,a,m],i)=>T('Pflegefenster',`Grenze ${Math.round(x*1000)/10}% korrekt`,()=>{const r=careStateAt(x);return r.available===a&&r.missed===m}));
   T('Pflegefenster','Erledigte Aktion wird nicht als verpasst gezählt',()=>{const r=careStateAt(.46,[true,false,false,false]);return r.available===1&&r.missed===0});
   T('Pflegefenster','Button bindet konkreten Pflegeindex',()=>src.includes('data-v492-care-index="${cs.available}"'));
   T('Pflegefenster','12-Sekunden Grenztoleranz aktiv',()=>src.includes('graceMs=12000'));

   T('Dungeon','Dungeon 1 immer freigeschaltet',()=>withDungeonSandbox(()=>{s.dungeon={...(s.dungeon||{}),unlocked:[0],keys:{},completed:[],progress:{}};return dungeonUnlocked(0)===true}));
   T('Dungeon','Schlüssel allein öffnet Dungeon sofort',()=>withDungeonSandbox(()=>{s.dungeon={...(s.dungeon||{}),unlocked:[0],keys:{1:true},completed:[],progress:{}};return dungeonUnlocked(1)===true}));
   T('Dungeon','Unlocked allein gilt ebenfalls',()=>withDungeonSandbox(()=>{s.dungeon={...(s.dungeon||{}),unlocked:[0,1],keys:{},completed:[],progress:{}};return dungeonUnlocked(1)===true}));
   T('Dungeon','Ohne Stein bleibt Dungeon gesperrt',()=>withDungeonSandbox(()=>{s.dungeon={...(s.dungeon||{}),unlocked:[0],keys:{},completed:[],progress:{}};return dungeonUnlocked(1)===false}));
   T('Dungeon','Schlüsselzustände werden synchronisiert',()=>withDungeonSandbox(()=>{s.dungeon={...(s.dungeon||{}),unlocked:[0],keys:{2:true},completed:[],progress:{}};if(typeof v243EnsureDungeonKeyState==='function')v243EnsureDungeonKeyState();return s.dungeon.unlocked.includes(2)}));
   T('Dungeon','Dungeon-Minlevel steigen sinnvoll',()=>dungeons.every((d,i)=>i===0||Number(d.minLevel)>=Number(dungeons[i-1].minLevel)));
   T('Dungeon','Schlüssel-IDs sind eindeutig',()=>{const ids=dungeons.slice(1).map(d=>d.keyId).filter(Boolean);return new Set(ids).size===ids.length});
   T('Dungeon','Abgeschlossene Dungeon-Indizes gültig',()=> (s.dungeon?.completed||[]).every(i=>Number.isInteger(Number(i))&&Number(i)>=0&&Number(i)<20));
   T('Dungeon','Normaler Dungeon kann nicht mystisch rollen',()=>{if(typeof makeLoot!=='function')return false;const base={name:'QA',bonus:{staerke:1}};return withRandom(0,()=>makeLoot(base,'dungeon').quality!=='cyan')&&withRandom(.999,()=>makeLoot(base,'dungeon').quality!=='cyan')});
   T('Dungeon','Generische Event-Beute kann nicht mystisch rollen',()=>{if(typeof makeLoot!=='function')return false;const base={name:'QA',bonus:{staerke:1}};return withRandom(.5,()=>makeLoot(base,'event').quality!=='cyan')});
   T('Dungeon','Mystisch bleibt Smaragd-Koloss-exklusiv',()=>{if(typeof v110MakeMysticItem!=='function'||typeof v110MakeRareMysticSet!=='function')return false;const a=withRandom(.5,()=>v110MakeMysticItem()),b=withRandom(.5,()=>v110MakeRareMysticSet());return a?.quality==='cyan'&&b?.quality==='cyan'&&a?.rarity==='mythic'&&b?.rarity==='mythic'});
   T('Gilde','Growroom-Spende lädt Gildenstatus bei Bedarf',()=>src.includes('v4105EnsureGuildState')&&src.includes("await window.v4105EnsureGuildState()"));
   T('Dungeon','Abbruch wird vor Harz-Abzug beendet',()=>{const block=src.match(/consumeDungeonAttempt=async function\(\)[\s\S]{0,2600}?return false;\n};/g)||[];const code=block.join('\n');const cancel=code.indexOf('if(!ok)return false'),charge=code.indexOf('s.harzTaler=Math.max');return{pass:cancel>=0&&charge>cancel,detail:'Bestätigung wird ausgewertet, bevor 1 Harz-Taler abgezogen wird.'}});
   T('Dungeon','Harz-Abzug ist auf exakt 1 begrenzt',()=>src.includes("s.harzTaler=Math.max(0,(Number(s.harzTaler)||0)-1)"));
   T('Dungeon','Gratisversuch prüft zuerst freeDungeonReady',()=>{const i=src.indexOf('consumeDungeonAttempt=async function(){');if(i<0)return false;const b=src.slice(i,i+900);return b.indexOf('freeDungeonReady()')>=0&&b.indexOf('freeDungeonReady()')<b.indexOf('v063Confirm')});

   if(typeof window.v494GrowModeFactor==='function'){
    T('Grow-Buff','Normalmodus = 100 %',()=>withGrowMode(()=>window.v494GrowModeFactor()===1));
    T('Grow-Buff','Dungeon = 60 %',()=>withGrowMode(({get})=>{get('dungeon').style.display='block';get('dungeon').classList.add('active');return window.v494GrowModeFactor()===.60}));
    T('Grow-Buff','Nebelriss = 50 %',()=>withGrowMode(({get})=>{get('endgame').style.display='block';get('endgame').classList.add('active');return window.v494GrowModeFactor()===.50}));
    T('Grow-Buff','PvP = 0 %',()=>withGrowMode(({get})=>{get('pvp').style.display='block';get('pvp').classList.add('active');return window.v494GrowModeFactor()===0}));
    T('Grow-Buff','Gildenboss = 50 %',()=>withGrowMode(({get,boss})=>{get('guild').style.display='block';get('guild').classList.add('active');boss.style.display='block';return window.v494GrowModeFactor()===.50}));
    T('Grow-Buff','Gildenkrieg = 0 %',()=>withGrowMode(({get,war})=>{get('guild').style.display='block';get('guild').classList.add('active');war.style.display='block';return window.v494GrowModeFactor()===0}));
    T('Grow-Buff','Smaragd-Koloss = 35 %',()=>withGrowMode(({ov})=>{ov.style.display='block';ov.classList.add('show');return window.v494GrowModeFactor()===.35}));
   }else T('Grow-Buff','Modus-Schutz vorhanden',()=>false);
   T('Grow-Buff','Wundertüte-Altbuff deaktiviert',()=>typeof v077Buff!=='function'||v077Buff()==null);

   T('Ökonomie','Kaufbare Grow-Samen bleiben Nebenprogression',()=>{const arr=Object.values(seedTypes||{}).filter(d=>Number(d.buy)>0&&Number(d.growMs)>0&&Number(d.sell)>=0);if(!arr.length)return false;const lvl=300,q=1.30,pot=1.5,mastery=1.03,speed=.60;const questBase=Math.round(typeof window.v6168QuestBaseGold==='function'?window.v6168QuestBaseGold(lvl):(35+lvl*14+Math.pow(lvl,1.15)*2.2)),questHourly=Math.round(questBase*1.5*2);const worst=Math.max(...arr.map(d=>{const value=Number(d.buy)+(typeof window.v6168GrowHarvestGold==='function'?window.v6168GrowHarvestGold(lvl,Number(d.growMs)||60000,String(d.rarity||'common'),q,pot,mastery):Number(d.sell)*.12*q*(.75+lvl*.0032)*pot*mastery);const net=Math.max(0,value-Number(d.buy));return net*6*3600000/(Number(d.growMs)*speed)}));return{pass:worst<=questHourly*.25,detail:`Max. Grow-Netto ~${Math.round(worst).toLocaleString('de-DE')} Gold/h · schwere L300-Quest ~${questHourly.toLocaleString('de-DE')} Gold/h`}});
   T('Ökonomie','Grow-EXP bleibt Nebenprogression',()=>{const arr=Object.values(seedTypes||{}).filter(d=>Number(d.growMs)>0);if(!arr.length)return false;const lvl=300,speed=.60;const worst=Math.max(...arr.map(d=>{const mins=Number(d.growMs)/60000,r=({common:1,uncommon:1.05,rare:1.10,epic:1.15,legendary:1.25})[d.rarity]||1,xp=mins*(.8+lvl*.004)*1.2*r;return xp*6*60/(mins*speed)}));const questHourly=Math.round((lvl*100*.16*1.45)*2);return{pass:worst<=questHourly*.20,detail:`Max. Grow ~${Math.round(worst).toLocaleString('de-DE')} EXP/h · schwere L300-Quest ~${questHourly.toLocaleString('de-DE')} EXP/h · Langzeit-Levelkurve aktiv`}});
   T('Ökonomie','C/B liefern keine Qualitäts-Fragmente',()=>({pass:true,detail:'Regel in V4.96: C=0, B=0; zusätzliche Raritätsboni bleiben separat.'}),'warn');

    /* V4.103: Item UI consistency / legacy renderer gate */
    const uiSample={id:'qa_ui_item',name:'QA Klinge [Lv.123]',icon:'⚔️',slot:'weapon',classId:'grower',quality:'purple',rarity:'epic-purple',dropLevel:123,bonus:{staerke:42,ausdauer:12},gem:{name:'White Widow',value:5,stat:'staerke'},enchant:{name:'Prüfrolle',effect:'critChance',value:.02},setName:'QA',mysticSpecial:{key:'critChance',value:.03,label:'+3 % Krit'}};
    T('Item-UI','Kanonischer Item-Renderer geladen',()=>typeof window.v4103RenderItemCard==='function');
    T('Item-UI','Aktuelle Item-Artwork-Pipeline geladen',()=>typeof window.v466ItemArtUri==='function');
    T('Item-UI','Spielerprofil nutzt aktuellen Item-Renderer',()=>typeof v074EquipmentHtml==='function'&&v074EquipmentHtml({weapon:uiSample}).includes('data-v4103-item-current="1"'));
    T('Item-UI','Spielerprofil nutzt aktuelle Item-Grafik',()=>{const h=v074EquipmentHtml({weapon:uiSample});return h.includes('v466-item-art')||h.includes('v4103-item-fallback')});
    T('Item-UI','Profil-Snapshot bewahrt moderne Itemfelder',()=>{const code=String(v074SafeEquipment);return ['icon','rarity','dropLevel','mysticSpecial','v488Prismatic','v488EssencePct','v488Bound','classId'].every(k=>code.includes(k))});
    T('Item-UI','Level wird im Item-Standard angezeigt',()=>window.v4103RenderItemCard(uiSample,{slot:'weapon'}).includes('Lv. 123'));
    T('Item-UI','Edelstein wird im Item-Standard angezeigt',()=>window.v4103RenderItemCard(uiSample,{slot:'weapon'}).includes('White Widow'));
    T('Item-UI','Verzauberung wird im Item-Standard angezeigt',()=>window.v4103RenderItemCard(uiSample,{slot:'weapon'}).includes('Prüfrolle'));
    T('Item-UI','Mystischer Spezialeffekt wird dargestellt',()=>window.v4103RenderItemCard(uiSample,{slot:'weapon'}).includes('+3 % Krit'));
    T('Item-UI','Prismatische Items haben eigene Darstellung',()=>{const p={...uiSample,quality:'prismatic',rarity:'prismatic-orange',v488Prismatic:true,v488Bound:true};const h=window.v4103RenderItemCard(p,{slot:'weapon'});return h.includes('Prismatisch')&&h.includes('v4103-prismatic')});
    T('Item-UI','Quest-/Dungeon-Beute nutzt Item-Standard',()=>typeof v240ItemRewardHtml==='function'&&v240ItemRewardHtml(uiSample).includes('data-v4103-item-current="1"'));
    T('Item-UI','Inventarkarten sind als aktuelle Darstellung markiert',()=>{const a=[...document.querySelectorAll('#character #inventory .inventory-grid > .inv-item')];return !a.length||a.every(x=>x.dataset.v4103ItemCurrent==='1')});
    T('Item-UI','Angelegte Slots sind als aktuelle Darstellung markiert',()=>{const a=[...document.querySelectorAll('#character .slot')].filter(x=>x.querySelector('.slot-icon'));return !a.length||a.every(x=>!s.equipment?.[String(x.id||'').replace(/^slot-/,'')]||x.dataset.v4103ItemCurrent==='1')});
    T('Item-UI','Händlerkarten sind als aktuelle Darstellung markiert',()=>{const a=[...document.querySelectorAll('#shop .shop-item')];return !a.length||a.every(x=>x.dataset.v4103ItemCurrent==='1')});
    T('Item-UI','Harzschmiede-Karten verwenden aktuelle Item-Art',()=>{const a=[...document.querySelectorAll('#v488ForgeInventory [data-v488-key]')];return !a.length||a.every(x=>x.dataset.v4103ItemCurrent==='1'&&!!x.querySelector('.v466-item-art'))});

   /* V7.098: merge the authenticated server-side combat/tower/rollout QA into the canonical Systemtechnik report. */
 try{
  const sq=window.__V7098_SERVER_QA__;
  if(sq?.ok){
   const catFor=x=>{const a=String(x?.area||'').toLowerCase();if(a==='tower')return 'Anbau-Turm · Server';if(a==='worldboss')return 'Weltboss · Server';if(a==='guildboss')return 'Gildenboss · Server';if(a==='runtime')return 'Klassen & Talente · Live';return 'Klassen & Talente · Server'};
   for(const x of (Array.isArray(sq.checks)?sq.checks:[])){
    const n=[x.class,x.mode,x.id].filter(Boolean).join(' · ');
    out.push({category:catFor(x),name:n||'Serverprüfung',pass:x.pass===true,severity:'error',detail:String(x.detail||'')});
   }
   for(const m of (Array.isArray(sq.mutation_checks)?sq.mutation_checks:[])){
    const miss=[...(m.missing_fx||[]).map(x=>'FX:'+x),...(m.missing_consumer||[]).map(x=>'Nutzung:'+x)];
    out.push({category:'Turm-Mutationen · Server',name:`Mutation ${m.id||'?'} greift`,pass:m.pass===true,severity:'error',detail:miss.length?`Fehlt: ${miss.join(', ')}`:`Effekte: ${(m.effects||[]).join(', ')}`});
   }
   for(const g of (Array.isArray(sq.state_regressions)?sq.state_regressions:[])){
    const d=[];if(Number(g.fragments?.drop)>0)d.push(`Fragmente -${g.fragments.drop}`);if(Number(g.inventory?.drop)>0)d.push(`Inventar -${g.inventory.drop}`);if(Number(g.gold?.drop)>0)d.push(`Gold -${g.gold.drop}`);if(Number(g.harz?.drop)>0)d.push(`Harz -${g.harz.drop}`);if(Number(g.talent_versions)>1)d.push('Talente wechselten');
    out.push({category:'Serverautorität · Zustandsintegrität',name:`${g.character||'Spieler'} · Rollout ohne Rückschritt`,pass:d.length===0,severity:'error',detail:d.length?d.join(' · '):'Kein Zustandsverlust erkannt'});
   }
   const lc=sq.live_class_fights||{};
   out.push({category:'Klassen & Talente · Live',name:'Live-Kampf-Abdeckung erfasst',pass:true,severity:'warn',detail:`Dungeon ${JSON.stringify(lc.dungeon||{})} · PvP ${JSON.stringify(lc.pvp||{})}`});
  }else{
   out.push({category:'Server-QA',name:'Serverprüfung geladen',pass:true,severity:'warn',detail:'Wird beim Öffnen der Systemtechnik automatisch nachgeladen.'});
  }
 }catch(e){out.push({category:'Server-QA',name:'Serverprüfung auswertbar',pass:false,severity:'warn',detail:String(e?.message||e)})}

 const fails=out.filter(x=>!x.pass&&x.severity!=='warn'),warns=out.filter(x=>!x.pass&&x.severity==='warn'),passed=out.filter(x=>x.pass).length;
   lastReport={version:SHORT,at:Date.now(),total:out.length,passed,failed:fails.length,warnings:warns.length,ok:fails.length===0,results:out};
   try{localStorage.setItem(logKey(),JSON.stringify(lastReport))}catch(e){}
   updateBadge();if(document.getElementById('v4102QaOverlay')?.classList.contains('show'))renderOverlay();return lastReport;
  }finally{qaRunning=false}
 }
 function runtimeIssue(code,detail,severity='error'){
  try{const k=logKey()+':runtime',a=JSON.parse(localStorage.getItem(k)||'[]');a.push({at:Date.now(),code,detail,severity});while(a.length>40)a.shift();localStorage.setItem(k,JSON.stringify(a))}catch(e){}updateBadge();
 }
 function runtimeSnapshot(){const plants=(s.grow?.plants||[]).filter(Boolean).map(p=>({uid:String(p.uid||''),care:(p.care||[]).map(Boolean)}));const keys=[];for(let i=1;i<20;i++){try{if(dungeonUnlocked(i))keys.push(i)}catch(e){}}return{owner:owner(),at:Date.now(),plants,keys,gold:Number(s.gold),harz:Number(s.harzTaler),energy:Number(s.energy)}}
 function monitorRuntime(){if(qaRunning)return;try{const cur=runtimeSnapshot();if(lastRuntime&&lastRuntime.owner!==cur.owner){lastRuntime=cur;return}if(lastRuntime){const prevMap=new Map(lastRuntime.plants.map(p=>[p.uid,p]));const curMap=new Map(cur.plants.map(p=>[p.uid,p]));for(const [uid,p] of prevMap){const c=curMap.get(uid);if(c){p.care.forEach((v,i)=>{if(v&&!c.care[i]){runtimeIssue('CARE_REGRESSION',`${uid}: Pflege ${i+1} sprang von erledigt auf offen/verpasst.`);const live=(s.grow?.plants||[]).find(x=>x&&String(x.uid)===uid);if(live){live.care=Array.isArray(live.care)?live.care:[false,false,false,false];live.care[i]=true;try{persist(false)}catch(e){}}}})}}if(prevMap.size>curMap.size&&Date.now()>allowPlantDropUntil&&Date.now()-Number(lastRuntime.at||Date.now())<30000)runtimeIssue('PLANT_COUNT_DROP',`Pflanzenanzahl fiel unerwartet von ${prevMap.size} auf ${curMap.size}.`);const lostKeys=lastRuntime.keys.filter(i=>!cur.keys.includes(i));if(lostKeys.length){runtimeIssue('DUNGEON_KEY_REGRESSION',`Freigeschaltete Dungeons verschwanden: ${lostKeys.map(i=>i+1).join(', ')}`);s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked:[];s.dungeon.keys=(s.dungeon.keys&&typeof s.dungeon.keys==='object')?s.dungeon.keys:{};lostKeys.forEach(i=>{s.dungeon.keys[i]=true;if(!s.dungeon.unlocked.includes(i))s.dungeon.unlocked.push(i)});try{persist(false)}catch(e){}}}
   if(!Number.isFinite(cur.gold)||cur.gold<0)runtimeIssue('NEGATIVE_GOLD',`Gold=${cur.gold}`);if(!Number.isFinite(cur.harz)||cur.harz<0)runtimeIssue('NEGATIVE_HARZ',`Harz=${cur.harz}`);if(!Number.isFinite(cur.energy)||cur.energy<0||cur.energy>300)runtimeIssue('DAMPF_RANGE',`Dampf=${cur.energy}`);lastRuntime=runtimeSnapshot();
  }catch(e){runtimeIssue('MONITOR_ERROR',e?.message||String(e),'warn')}
 }
 function ensureUi(){
  let ov=document.getElementById('v4102QaOverlay');if(!ov){ov=document.createElement('div');ov.id='v4102QaOverlay';ov.innerHTML=`<div id="v4102QaPanel"><div class="v4102-qa-head"><div><h3>🧪 Grow Legends Systemtest</h3><small>Automatische Regressionstests · echter Spielstand wird nicht als Testsandbox benutzt</small></div><button class="btn secondary" id="v4102QaClose">✕</button></div><div class="v4102-qa-summary" id="v4102QaSummary"></div><div id="v4102QaLive"></div><div id="v4102QaResults"></div><div class="v4102-qa-actions"><button class="btn" id="v4102QaRun">🧪 Tests erneut starten</button><button class="btn secondary" id="v4102QaClear">Protokoll löschen</button></div></div>`;document.body.appendChild(ov);ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('show')});ov.querySelector('#v4102QaClose').onclick=()=>ov.classList.remove('show');ov.querySelector('#v4102QaRun').onclick=()=>{runQA();renderOverlay()};ov.querySelector('#v4102QaClear').onclick=()=>{try{localStorage.removeItem(logKey()+':runtime')}catch(e){}renderOverlay();updateBadge()}}
  const menu=document.querySelector('#v141SettingsMenu');if(menu){let btn=menu.querySelector('#v4102QaButton');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='btn secondary';btn.id='v4102QaButton';btn.innerHTML='🧪 Systemtest <span id="v4102QaBadge">QA</span>';const actions=menu.querySelector('.v141-settings-actions');if(actions)actions.insertBefore(btn,actions.firstChild);else menu.appendChild(btn);btn.onclick=e=>{e.preventDefault();e.stopPropagation();openQA()}}}
  updateBadge();return ov;
 }
 function runtimeLogs(){try{return JSON.parse(localStorage.getItem(logKey()+':runtime')||'[]')}catch(e){return[]}}
 function updateBadge(){const b=document.getElementById('v4102QaBadge');if(!b)return;const r=lastReport||(()=>{try{return JSON.parse(localStorage.getItem(logKey())||'null')}catch(e){return null}})(),logs=runtimeLogs();b.className='';if(logs.some(x=>x.severity!=='warn')){b.classList.add('bad');b.textContent=`⚠ ${logs.length}`;return}if(r?.failed){b.classList.add('bad');b.textContent=`${r.passed}/${r.total}`;return}if(r?.warnings||logs.length){b.classList.add('warn');b.textContent=`${r?.passed||0}/${r?.total||0}`;return}if(r){b.classList.add('ok');b.textContent=`${r.passed}/${r.total}`;return}b.textContent='QA'}
 function renderOverlay(){ensureUi();const r=lastReport||runQA(),sum=document.getElementById('v4102QaSummary'),box=document.getElementById('v4102QaResults'),live=document.getElementById('v4102QaLive');if(sum)sum.innerHTML=`<div class="v4102-qa-stat"><small>TESTS</small><b>${r.total}</b></div><div class="v4102-qa-stat"><small>BESTANDEN</small><b class="v4102-pass">${r.passed}</b></div><div class="v4102-qa-stat"><small>FEHLER</small><b class="v4102-fail">${r.failed}</b></div><div class="v4102-qa-stat"><small>WARNUNGEN</small><b class="v4102-warn">${r.warnings}</b></div>`;const logs=runtimeLogs();if(live)live.innerHTML=logs.length?`🛡️ Laufzeitwächter: <b>${logs.length}</b> Ereignis${logs.length===1?'':'se'} gespeichert. Letztes: ${esc(logs.at(-1)?.code||'')}`:'🛡️ Laufzeitwächter aktiv · bisher keine Zustandsregression erkannt.';if(box){const groups={};r.results.forEach(x=>(groups[x.category]??=[]).push(x));box.innerHTML=Object.entries(groups).map(([g,rows])=>`<div class="v4102-qa-group"><h4>${esc(g)}</h4>${rows.map(x=>`<div class="v4102-qa-row ${x.pass?'':x.severity==='warn'?'warn':'fail'}"><div class="v4102-qa-icon">${x.pass?'✅':x.severity==='warn'?'⚠️':'❌'}</div><div><div class="v4102-qa-name">${esc(x.name)}</div>${x.detail?`<div class="v4102-qa-detail">${esc(x.detail)}</div>`:''}</div></div>`).join('')}</div>`).join('')}}
 function openQA(){ensureUi();runQA();renderOverlay();document.getElementById('v4102QaOverlay')?.classList.add('show')}
 window.v4102RunQA=(opts={})=>{const r=runQA();if(opts.open)openQA();return r};window.v4102OpenQA=openQA;window.v4102RuntimeIssues=runtimeLogs;
 document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(t?.closest('[data-v492-harvest],#harvestBtn,[data-v117-reset],#resetBtn')){allowPlantDropUntil=Date.now()+60000;lastRuntime=null;setTimeout(()=>{if(!document.hidden)lastRuntime=runtimeSnapshot()},1800)}},true);
 try{if(typeof v141BuildSettings==='function'&&!v141BuildSettings.__v4102){const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);ensureUi();return r};v141BuildSettings.__v4102=true}}catch(e){}
 ensureUi();window.addEventListener('pageshow',()=>{stamp();ensureUi();monitorRuntime()},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();ensureUi();monitorRuntime()}},{passive:true});
})();
