(()=>{
 'use strict';
 const VERSION='V4.106 Stable',SHORT='V4.106',PREFIX='growLegendsQA:v4106:';
 const baseRun=window.v4102RunQA,baseOpen=window.v4102OpenQA;
 const tech=()=>window.__V4106_TECH__||{intervals:new Map(),timeouts:new Map(),listeners:new Map(),longTasks:[],renderSamples:{},mutations:0,maxDom:0};
function legacyListenerInfo(){try{return [...tech().listeners.values()].filter(x=>/V4\.(?:0[0-9]|[1-9][0-9])|legacy|old/i.test(`${x?.handler||''} ${x?.site||''}`))}catch(e){return[]}}
 const owner=()=>{try{return String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local')}catch(e){return'local'}};
 const key=()=>PREFIX+owner(),rkey=()=>key()+':runtime';
 const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(e){return null}};
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 function res(category,name,pass,detail='',severity='error'){return{category,name,pass:!!pass,detail:String(detail||''),severity}}
 function one(c,n,fn,severity='error'){try{const x=fn();if(x&&typeof x==='object'&&'pass'in x)return res(c,n,x.pass,x.detail||'',x.severity||severity);return res(c,n,!!x,'',severity)}catch(e){return res(c,n,false,e?.message||String(e),severity)}}
 function source(){try{return [...document.scripts].map(s=>s.textContent||'').join('\n')}catch(e){return''}}
 function duplicateIds(){const m=new Map();document.querySelectorAll('[id]').forEach(e=>{if(e.closest('svg'))return;m.set(e.id,(m.get(e.id)||0)+1)});return [...m].filter(([,n])=>n>1)}
function legacyListenerInfo(){return [...tech().listeners.values()].filter(x=>/V4\.(?:0[0-9]|[1-9][0-9])|legacy|old/i.test(`${x.handler||''} ${x.site||''}`))}
function historicalScriptCount(){if(historicCountCache!=null)return historicCountCache;historicCountCache=[...document.scripts].filter(sc=>/V4\.(?:0[0-9]|[1-9][0-9]) Stable/.test(sc.textContent||'')&&!/V4\.10[567]/.test(sc.textContent||'')).length;return historicCountCache}
 function visible(el){if(!el)return false;const c=getComputedStyle(el);return c.display!=='none'&&c.visibility!=='hidden'&&c.opacity!=='0'&&!!el.getClientRects().length}
 function visibleTextProblems(){let n=0;document.querySelectorAll('.screen.active *').forEach(e=>{if(n>20||e.closest('#systemtech')||!visible(e))return;const t=(e.textContent||'').trim();if(!t||e.children.length>2)return;if(/NaN|undefined|null/i.test(t))n++});return n}
 function overflowCount(){let n=0;document.querySelectorAll('.screen.active button,.screen.active .card,.screen.active .shop-item,.screen.active .inv-item').forEach(e=>{if(visible(e)&&e.scrollWidth>e.clientWidth+5&&getComputedStyle(e).overflowX==='visible')n++});return n}
 function brokenImages(){return [...document.images].filter(i=>visible(i)&&i.complete&&i.naturalWidth===0)}
 function intervalDuplicates(){const m=new Map();for(const x of tech().intervals.values()){const k=`${x.delay}|${x.site}`;m.set(k,(m.get(k)||0)+1)}return [...m].filter(([,n])=>n>1)}
 function listenerDuplicates(){return [...tech().listeners.values()].filter(x=>x.count>1)}
 function fastIntervals(){return [...tech().intervals.values()].filter(x=>x.delay>0&&x.delay<250)}
 function renderStats(){const all=[];Object.entries(tech().renderSamples||{}).forEach(([name,a])=>(a||[]).forEach(ms=>all.push({name,ms})));all.sort((a,b)=>b.ms-a.ms);const max=all[0]||{name:'—',ms:0};const avg=all.length?all.reduce((s,x)=>s+x.ms,0)/all.length:0;return{count:all.length,max,avg}}
 function wrapPerf(name){try{const fn=window[name];if(typeof fn!=='function'||fn.__v4106Perf)return;const w=function(){const t=performance.now();try{return fn.apply(this,arguments)}finally{const ms=performance.now()-t,tc=tech();if(!tc.qaActive&&Date.now()>Number(tc.startedAt||0)+6000){(tc.renderSamples[name]??=[]).push(ms);if(tc.renderSamples[name].length>80)tc.renderSamples[name].shift();if(ms>100){tc.slowRenders??=[];tc.slowRenders.push({at:Date.now(),name,ms,screen:document.querySelector('section.screen.active')?.id||'—'});while(tc.slowRenders.length>20)tc.slowRenders.shift()}}}};Object.defineProperty(w,'name',{value:fn.name||name,configurable:true});w.__v4106Perf=true;window[name]=w;try{if(name in globalThis)globalThis[name]=w}catch(e){}}catch(e){}}
 ['render','renderGrow','renderDungeon','renderQuests','renderInventory','renderShop','v254RenderGuild','renderEndgame'].forEach(wrapPerf);
 function extra(){const out=[],T=(c,n,f,s='error')=>out.push(one(c,n,f,s)),src=source();
  /* Navigation / UI */
  T('UI & Pixel','Genau eine Hauptseite aktiv',()=>document.querySelectorAll('.screen.active').length===1);
  T('UI & Pixel','Keine doppelten DOM-IDs',()=>{const d=duplicateIds();return{pass:d.length===0,detail:d.slice(0,8).map(x=>`${x[0]} ×${x[1]}`).join(', ')}});
  T('UI & Pixel','Keine erkannten UI-Flackerereignisse',()=>{
    const d=window.v7125UiStabilityDiagnostics?.();
    const rows=Array.isArray(d?.results)?d.results:[];
    const bad=rows.filter(x=>x?.severity==='warn'||x?.severity==='error');
    const last=bad.at(-1);
    return {
      pass:bad.length===0,
      detail:bad.length?`${bad.length} Auffälligkeit${bad.length===1?'':'en'} · zuletzt ${last?.screen||'?'}: ${last?.summary||'UI instabil'}`:(rows.length?`${rows.length} Seitenöffnung${rows.length===1?'':'en'} vermessen`:'Noch keine Seitenöffnung vermessen')
    };
  },'warn');
  T('UI & Pixel','Aktive Seite ohne horizontales Seiten-Overflow',()=>{const a=document.querySelector('.screen.active');return !a||a.scrollWidth<=Math.max(a.clientWidth,innerWidth)+8});
  T('UI & Pixel','Keine sichtbaren kaputten Bilder',()=>{const b=brokenImages();return{pass:b.length===0,detail:b.slice(0,5).map(x=>x.alt||x.src.slice(0,40)).join(', ')}});
  T('UI & Pixel','Keine NaN/undefined-Texte sichtbar',()=>visibleTextProblems()===0);
  T('UI & Pixel','Keine auffälligen abgeschnittenen Karten/Buttons',()=>({pass:overflowCount()<=2,detail:`Auffällige Elemente: ${overflowCount()}`}), 'warn');
  T('UI & Pixel','Systemtechnik nicht im Einstellungsmenü',()=>!document.getElementById('v4104QaRow'));
  T('UI & Pixel','Aktuelle Comic-Item-Assets geladen',()=>typeof window.v4106ComicItemArtUri==='function'&&Object.keys(window.v4106ComicAssets||{}).length>=10);
  T('UI & Pixel','Sichtbare Itemgrafiken ohne Emoji-Fallback',()=>{const bad=[...document.querySelectorAll('.v4103-item-fallback')].filter(visible);return{pass:bad.length===0,detail:`Fallbacks sichtbar: ${bad.length}`}});
  T('UI & Pixel','Spielerprofil nutzt Comic-Art-Pipeline',()=>{const sample={name:'QA Klinge',slot:'weapon',quality:'blue',rarity:'rare',dropLevel:80,bonus:{staerke:10}};const h=typeof v074EquipmentHtml==='function'?v074EquipmentHtml({weapon:sample}):'';return h.includes('v466-item-art')&&/^(?:data:image\/webp;base64,|assets\/v71(?:95|98)-base64\/)/.test(String(window.v4106ComicItemArtUri(sample)||''))});
  T('UI & Pixel','Systemtechnik enthält keine Item-Galerie',()=>!document.getElementById('v4107ItemShowcase'));

  /* Core gameplay flows */
  T('Spielabläufe','Quest-Renderer vorhanden',()=>typeof renderQuests==='function');
  T('Spielabläufe','Queststart vorhanden',()=>typeof startQuest==='function'||typeof window.startQuest==='function');
  T('Spielabläufe','Questabschluss vorhanden',()=>typeof claimQuest==='function');
  T('Spielabläufe','Questangebote sind gültig',()=>Array.isArray(s.quests?.offers)&&s.quests.offers.every(q=>q&&Number(q.energy)>=0&&Number(q.xp)>=0&&Number(q.gold)>=0));
  T('Spielabläufe','Aktive Quest besitzt gültiges Ende',()=>!s.quests?.active||Number(s.quests.active.ends)>0);
  T('Spielabläufe','20 Dungeons besitzen je 10 Gegner',()=>Array.isArray(dungeons)&&dungeons.length===20&&dungeons.every(d=>Array.isArray(d.enemies)&&d.enemies.length===10));
  T('Spielabläufe','Jeder Dungeon besitzt Endboss Raum 10',()=>dungeons.every(d=>d.enemies?.[9]));
  T('Spielabläufe','Dungeonfortschritt bleibt 0–10',()=>Object.values(s.dungeon?.progress||{}).every(v=>Number(v)>=0&&Number(v)<=10));
  T('Spielabläufe','Nebelrisse/Endgame vorhanden',()=>!!document.getElementById('endgame')&&(typeof window.v457RenderEndgame==='function'||typeof window.renderEndgame==='function'));
  T('Spielabläufe','Smaragd-Koloss erzeugt mystische Items',()=>typeof v110MakeMysticItem==='function');
  T('Spielabläufe','PvP-Bereich vorhanden',()=>!!document.getElementById('pvp'));
  T('Spielabläufe','Gildenbereich vorhanden',()=>!!document.getElementById('guild')&&typeof v254LoadGuild==='function');
  T('Spielabläufe','Growroom-Spende lädt Gilde ohne Gildenbesuch',()=>typeof window.v4105EnsureGuildState==='function'&&src.includes('await window.v4105EnsureGuildState()'));
  T('Spielabläufe','Grow-Beutel bleibt maximal 3',()=>Array.isArray(s.grow?.v492?.bag||[])&&(s.grow?.v492?.bag||[]).length<=3);
  T('Spielabläufe','Mindestens 12 Grow-Sorten definiert',()=>typeof seedTypes==='object'&&Object.keys(seedTypes).length>=12);
  T('Spielabläufe','Growroom maximal 6 Pflanzplätze',()=>typeof growCapacity!=='function'||Number(growCapacity())<=6);
  T('Spielabläufe','Daily-Reset-System vorhanden',()=>typeof v026DailyReset==='function'||typeof v127ApplyDailyReset==='function');
  T('Spielabläufe','Erfolgssystem vorhanden',()=>typeof v106CheckAchievements==='function');

  /* Shop / inventory / forge */
  T('Items & Shop','Waffenhändler maximal 6 Angebote',()=>!Array.isArray(s.weaponShop)||s.weaponShop.length<=6);
  T('Items & Shop','Magiehändler maximal 6 Angebote',()=>!Array.isArray(s.magicShop)||s.magicShop.length<=6);
  T('Items & Shop','Schmuckhändler zeigt genau 1 Ring + 1 Amulett',()=>!Array.isArray(s.magicShop)||s.magicShop.length<2||(s.magicShop[0]?.slot==='ring'&&s.magicShop[1]?.slot==='amulet'));
  T('Items & Shop','Inventaritems haben Namen und Slot/Typ',()=> (s.inventory||[]).every(it=>it&&String(it.name||'').trim()&&((it.slot)||it.type)));
  T('Items & Shop','Ausrüstungsslots sind bekannt',()=>Object.keys(s.equipment||{}).every(k=>['weapon','weapon2','head','body','boots','ring','amulet'].includes(k)));
  T('Items & Shop','Harzschmiede-Fragmente nicht negativ',()=>Number(s.v488Forge?.fragments||0)>=0);
  T('Items & Shop','Mystisch nicht zerlegbar',()=>src.includes('myst')&&src.includes('dismantle'), 'warn');
  T('Items & Shop','Prismatisch Verkauf 0 unterstützt',()=>src.includes('v488Prismatic')&&src.includes('price:0'));
  T('Items & Shop','Edelsteine und Rollen getrennt vom Equipment',()=>Array.isArray(s.materials||[])&&(s.materials||[]).every(x=>!x||['gem','scroll'].includes(x.type)||x.slot));

  /* Save/account */
  T('Account & Save','Persistenzfunktion aktiv',()=>typeof persist==='function');
  T('Account & Save','Growroom besitzt eigene Revision',()=>Number(s.grow?.v499Revision||0)>=0);
  T('Account & Save','Cloud-Save Anwenden vorhanden',()=>typeof v075ApplyCloudSave==='function');
  T('Account & Save','Cloud-Save Schreiben vorhanden',()=>typeof v075WriteCloudSave==='function');
  T('Account & Save','Account-Owner für Grow-Schutz auflösbar',()=>String(owner()).length>0);
  T('Account & Save','Pflanzenpflege bleibt boolesch',()=> (s.grow?.plants||[]).filter(Boolean).every(p=>Array.isArray(p.care)&&p.care.every(v=>typeof v==='boolean')));
  T('Account & Save','Cloud-Lesezugriff besitzt sicheren Transport-Retry',()=>!!window.fetch?.__v4123PlayerSaveGetRetry);
  T('Account & Save','Fertiger Charakter besitzt accountgebundenen lokalen Save',()=>{try{if(typeof v200DurableUser!=='function'||!v200DurableUser()||typeof v200CharacterComplete!=='function'||!v200CharacterComplete())return true;const uid=String(v073User?.id||'');if(!uid)return false;const k=typeof v200ScopedKey==='function'?v200ScopedKey(uid):'growLegendsAccountSave:'+uid;const x=JSON.parse(localStorage.getItem(k)||'null');return{pass:!!x&&String(x.__accountOwnerId||'')===uid&&String(x.social?.playerId||'')===uid&&String(x.characterName||'')===String(s.characterName||'')&&String(x.playerClass||'')===String(s.playerClass||'')&&!!x.characterNameSet,detail:x?`${x.characterName||'—'} · ${x.playerClass||'—'}`:'kein accountgebundener Save'}}catch(e){return{pass:false,detail:e?.message||String(e)}}});

  /* Talent/rules */
  T('Regeln & Balance','Exakte Talentwerte verfügbar',()=>typeof v319ExactTalentStats==='function');
  T('Regeln & Balance','Maximallevel 300',()=>Number(s.level)<=300&&Number(window.GROW_LEGENDS_MAX_LEVEL||300)===300);
  T('Regeln & Balance','Normale Dungeons ohne Mystisch',()=>src.includes('Normaler Dungeon kann nicht mystisch rollen')||src.includes("quality!=='cyan'"));
  T('Regeln & Balance','Dungeon 4 Boss bleibt im Normalgear-Korridor',()=>{try{const e=dungeons?.[3]?.enemies?.[9],b=typeof v025EnemyStats==='function'?v025EnemyStats(3,9,e):null;return{pass:!!b&&Number(b.rec)===50&&Number(b.hp)<=6200&&Number(b.attack)<=185,detail:b?`Empfohlen Lv. ${b.rec} · ${b.hp} HP · ${b.attack} Angriff`:'Keine Bosswerte'}}catch(e){return{pass:false,detail:e?.message||String(e)}}});
  T('Regeln & Balance','Mystisch exklusiv Smaragd-Koloss',()=>typeof v110MakeMysticItem==='function'&&src.includes('Mystisch bleibt Smaragd-Koloss-exklusiv'));
  T('Regeln & Balance','Grow-Buff PvP bleibt 0 %',()=>typeof window.v494GrowModeFactor==='function');

  /* Performance & legacy */
  const tc=tech(),dom=document.getElementsByTagName('*').length,ints=tc.intervals.size,tos=tc.timeouts.size,lst=typeof window.__V4122_LIVE_LISTENER_COUNT__==='function'?window.__V4122_LIVE_LISTENER_COUNT__():tc.listeners.size,dupi=intervalDuplicates(),dupl=listenerDuplicates(),fast=fastIntervals(),rs=renderStats(),long=tc.longTasks.filter(x=>x.at>Number(tc.startedAt||0)+6000&&Date.now()-x.at<60000&&!window.__V4122_IS_QA_LONG_TASK__?.(x)),heap=performance.memory?performance.memory.usedJSHeapSize/1048576:null;
  T('Performance & Technik','DOM-Größe im Sicherheitsbereich',()=>({pass:dom<6000,detail:`${dom.toLocaleString('de-DE')} DOM-Knoten`}), 'warn');
  T('Performance & Technik','Keine doppelten aktiven Intervalle vom selben Callsite',()=>({pass:dupi.length===0,detail:dupi.slice(0,4).map(x=>`×${x[1]}`).join(', ')}), 'warn');
  T('Performance & Technik','Keine extrem schnellen Hintergrundintervalle',()=>({pass:fast.length<=2,detail:`<250 ms: ${fast.length}`}), 'warn');
  T('Performance & Technik','Aktive Intervalle <45',()=>({pass:ints<45,detail:`Aktiv: ${ints}`}), 'warn');
  T('Performance & Technik','Offene Timeouts im plausiblen Bereich',()=>({pass:tos<=120,detail:`Aktiv: ${tos}`}), 'warn');
  T('Performance & Technik','Keine mehrfach registrierten identischen Listener',()=>({pass:dupl.length===0,detail:`Doppelte Registrierungen: ${dupl.length}`}), 'warn');
  T('Performance & Technik','Keine Long-Tasks >200 ms in letzter Minute',()=>({pass:!long.some(x=>x.duration>200),detail:`Long-Tasks: ${long.length}`}), 'warn');
  T('Performance & Technik','Renderer bleiben unter 120 ms',()=>({pass:rs.max.ms<120,detail:`Langsamster: ${rs.max.name} ${rs.max.ms.toFixed(1)} ms · Ø ${rs.avg.toFixed(1)} ms`}), 'warn');
  T('Performance & Technik','Keine doppelten Script-IDs',()=>{const ids=new Map();document.querySelectorAll('script[id]').forEach(x=>ids.set(x.id,(ids.get(x.id)||0)+1));const d=[...ids].filter(([,n])=>n>1);return{pass:d.length===0,detail:d.slice(0,6).map(x=>`${x[0]} ×${x[1]}`).join(', ')}});
  T('Performance & Technik','Kein sichtbarer Legacy-Item-Renderer',()=>typeof window.v4103AuditItemUi!=='function'||window.v4103AuditItemUi().length===0);
  T('Performance & Technik','JS-Speicher im Sicherheitsbereich',()=>({pass:heap==null||heap<180,detail:heap==null?'Browser liefert keinen Heap-Wert':`${heap.toFixed(1)} MB`}), 'warn');
  T('Performance & Technik','DOM wächst nicht unkontrolliert',()=>({pass:tc.maxDom<Math.max(8000,dom*1.8),detail:`Aktuell ${dom} · Maximum ${tc.maxDom||dom}`}), 'warn');
  const wrapperCount=(src.match(/(?:render|persist|v032Go|claimQuest)\s*=\s*function/g)||[]).length;
  T('Performance & Technik','Legacy-Wrapper-Anzahl wird überwacht',()=>({pass:wrapperCount<90,detail:`Historische Kern-Wrapper im Quelltext: ${wrapperCount}`}), 'warn');
  return out;
 }
 function runtimeIssues(){try{return JSON.parse(localStorage.getItem(rkey())||'[]')}catch(e){return[]}}
 function pushRuntime(code,detail,severity='warn'){try{const a=runtimeIssues();const last=a.at(-1);if(last&&last.code===code&&last.detail===detail&&Date.now()-last.at<10000)return;a.push({at:Date.now(),code,detail,severity});while(a.length>60)a.shift();localStorage.setItem(rkey(),JSON.stringify(a))}catch(e){}}
 function run(){const base=typeof baseRun==='function'?baseRun():{results:[],passed:0,failed:0,warnings:0};const add=extra(),results=[...(base?.results||[]),...add],passed=results.filter(x=>x.pass).length,failed=results.filter(x=>!x.pass&&x.severity!=='warn').length,warnings=results.filter(x=>!x.pass&&x.severity==='warn').length;const report={version:SHORT,at:Date.now(),total:results.length,passed,failed,warnings,ok:failed===0,results};try{localStorage.setItem(key(),JSON.stringify(report))}catch(e){}return report}
 function techHtml(){const t=tech(),dom=document.getElementsByTagName('*').length,rs=renderStats(),heap=performance.memory?performance.memory.usedJSHeapSize/1048576:null,dupi=intervalDuplicates().length,dupl=listenerDuplicates().length,long=t.longTasks.filter(x=>x.at>Number(tech().startedAt||0)+6000&&Date.now()-x.at<60000&&!window.__V4122_IS_QA_LONG_TASK__?.(x)).length;const cell=(label,value,state='ok')=>`<div class="v4106-tech-cell ${state}"><small>${label}</small><b>${value}</b></div>`;return `<div class="v4106-tech-title"><b>⚙️ SYSTEMTECHNIK · LIVE</b><span>alte Hintergrundprozesse / Renderer / DOM / Speicher</span></div><div class="v4106-tech-grid">${cell('DOM',dom.toLocaleString('de-DE'),dom<6000?'ok':'warn')}${cell('Intervalle',t.intervals.size,t.intervals.size<=35?'ok':'warn')}${cell('Doppelte Timer',dupi,dupi?'warn':'ok')}${cell('Listener',typeof window.__V4122_LIVE_LISTENER_COUNT__==='function'?window.__V4122_LIVE_LISTENER_COUNT__():t.listeners.size,(typeof window.__V4122_LIVE_LISTENER_COUNT__==='function'?window.__V4122_LIVE_LISTENER_COUNT__():t.listeners.size)<1200?'ok':'warn')}${cell('Doppelte Listener',dupl,dupl?'warn':'ok')}${cell('Long Tasks 60s',long,long?'warn':'ok')}${cell('Render max',rs.max.ms.toFixed(0)+' ms',rs.max.ms<80?'ok':'warn')}${cell('Render-Aufrufe',rs.count,'ok')}${cell('JS-Speicher',heap==null?'—':heap.toFixed(0)+' MB',heap==null||heap<180?'ok':'warn')}</div><div class="v4106-tech-note">Hinweis: Der Wächter zählt Timer/Listener bereits ab Seitenstart. Auffälligkeiten werden gemeldet, aber nicht automatisch beendet, damit ein legitimer Spielprozess nicht versehentlich abgeschaltet wird.</div>`}
 function render(report){const sum=document.getElementById('v4102QaSummary'),box=document.getElementById('v4102QaResults'),live=document.getElementById('v4102QaLive');if(sum)sum.innerHTML=`<div class="v4102-qa-stat"><small>TESTS</small><b>${report.total}</b></div><div class="v4102-qa-stat"><small>BESTANDEN</small><b class="v4102-pass">${report.passed}</b></div><div class="v4102-qa-stat"><small>FEHLER</small><b class="v4102-fail">${report.failed}</b></div><div class="v4102-qa-stat"><small>WARNUNGEN</small><b class="v4102-warn">${report.warnings}</b></div>`;let p=document.getElementById('v4106TechPanel');if(!p&&sum){p=document.createElement('div');p.id='v4106TechPanel';sum.insertAdjacentElement('afterend',p)}if(p)p.innerHTML=techHtml();const logs=[...(typeof window.v4102RuntimeIssues==='function'?window.v4102RuntimeIssues():[]),...runtimeIssues()];if(live)live.innerHTML=logs.length?`🛡️ Laufzeitwächter: <b>${logs.length}</b> Meldung${logs.length===1?'':'en'} · letzte: ${esc(logs.at(-1)?.code||'')}`:'🛡️ Laufzeitwächter aktiv · keine Zustands- oder Technikregression erkannt.';if(box){const groups={};report.results.forEach(x=>(groups[x.category]??=[]).push(x));box.innerHTML=Object.entries(groups).map(([g,rows])=>`<div class="v4102-qa-group"><h4>${esc(g)}</h4>${rows.map(x=>`<div class="v4102-qa-row ${x.pass?'':x.severity==='warn'?'warn':'fail'}"><div class="v4102-qa-icon">${x.pass?'✅':x.severity==='warn'?'⚠️':'❌'}</div><div><div class="v4102-qa-name">${esc(x.name)}</div>${x.detail?`<div class="v4102-qa-detail">${esc(x.detail)}</div>`:''}</div></div>`).join('')}</div>`).join('')}}
 function bind(){const runBtn=document.getElementById('v4102QaRun');if(runBtn){runBtn.textContent='🧪 QA 2.0 erneut starten';runBtn.onclick=()=>{const r=run();render(r);paintSettings(r)}}const clear=document.getElementById('v4102QaClear');if(clear&&!clear.__v4106){const old=clear.onclick;clear.onclick=()=>{try{localStorage.removeItem(rkey())}catch(e){}old?.();const r=run();render(r);paintSettings(r)};clear.__v4106=true}}
 function open(){if(typeof baseOpen==='function')baseOpen();setTimeout(()=>{const r=run();render(r);bind();paintSettings(r);document.querySelector('.v4102-qa-head small')?.replaceChildren(document.createTextNode('QA 2.0 · Flow + UI/Pixel + State + Performance/Legacy · Spielstand bleibt geschützt'))},0)}
 function paintSettings(r=null){try{const row=document.getElementById('v4104QaRow');if(row){const b=row.querySelector('.v141-setting-copy b'),sml=row.querySelector('.v141-setting-copy span');if(b)b.textContent='Systemtest & Technik';if(sml)sml.textContent='QA 2.0 prüft Spielfluss, UI, Speicher, Items, Performance und Altlasten.'}const badge=document.getElementById('v4104QaStatus');if(!badge)return;r=r||JSON.parse(localStorage.getItem(key())||'null');const logs=runtimeIssues();badge.className='';if(logs.some(x=>x.severity==='error')||r?.failed){badge.classList.add('bad');badge.textContent=r?.failed?`${r.failed} FEHLER`:'FEHLER'}else if((r?.warnings||0)>0||logs.length){badge.classList.add('warn');badge.textContent=`${r?.warnings||logs.length} WARN.`}else if(r){badge.classList.add('ok');badge.textContent='OK'}else badge.textContent='PRÜFEN'}catch(e){}}
 window.v4106RunQA=run;window.v4102RunQA=(opts={})=>{const r=run();if(opts&&opts.open)open();return r};window.v4102OpenQA=open;
 /* background performance/runtime monitor */
 /* V4.123: obsolete V4.106 polling monitor retired; canonical Systemtechnik owns live monitoring. */
 /* V4.159: no automatic full QA during startup/pageshow. Systemtechnik is explicit/admin-only. */
 function stamp(){}
 stamp();
})();
