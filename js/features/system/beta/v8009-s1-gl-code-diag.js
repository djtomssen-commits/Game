(()=>{
 'use strict';
 if(window.__GL_CODE_DIAG_READONLY__)return;
 window.__GL_CODE_DIAG_READONLY__=true;
 let last=null;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const unique=a=>[...new Set(a)];
 const stripPayload=s=>String(s||'').replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/ig,'data:image/base64,[PAYLOAD]');
 const compact=(s,n=170)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
 const lineNo=(code,idx)=>1+(code.slice(0,Math.max(0,idx)).match(/\n/g)||[]).length;
 function scriptInfo(){
  return [...document.scripts].filter(x=>x.id!=='gl-code-diag-script').map((el,i)=>({el,id:el.id||`script-${i+1}`,raw:el.textContent||'',i}));
 }
 function styleInfo(){return [...document.querySelectorAll('style')].filter(x=>x.id!=='gl-code-diag-style').map((el,i)=>({el,id:el.id||`style-${i+1}`,raw:el.textContent||'',i}))}
 function tokenCounts(code){
  const map=new Map(),re=/\b[A-Za-z_$][\w$]{2,}\b/g;let m;
  while((m=re.exec(code))){const n=m[0];map.set(n,(map.get(n)||0)+1)}
  return map;
 }
 function definitions(blocks){
  const defs=new Map();
  const add=(name,b,kind)=>{if(!name||name==='function')return;const a=defs.get(name)||[];a.push({block:b.id,kind});defs.set(name,a)};
  for(const b of blocks){
   const code=stripPayload(b.raw);let m;
   const pats=[
    ['function',/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g],
    ['assignment',/\b(?:window\.|globalThis\.)?([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b/g],
    ['window-arrow',/\b(?:window\.|globalThis\.)([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^\n;=]{0,160}\)|[A-Za-z_$][\w$]*)\s*=>/g],
    ['local-arrow',/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^\n;=]{0,160}\)|[A-Za-z_$][\w$]*)\s*=>/g]
   ];
   for(const [kind,re] of pats){while((m=re.exec(code)))add(m[1],b,kind)}
  }
  return defs;
 }
 function duplicateIds(){
  const m=new Map();
  document.querySelectorAll('[id]').forEach(el=>{if(el.closest?.('#glCodeDiag'))return;const id=el.id;if(!id)return;const a=m.get(id)||[];a.push(el.tagName.toLowerCase());m.set(id,a)});
  return [...m].filter(([,a])=>a.length>1).map(([id,a])=>({id,count:a.length,tags:a})).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));
 }
 function missingTargets(code){
  const ids=new Map();let m;
  const add=(id,kind)=>{if(!id||id.startsWith('glCodeDiag'))return;const x=ids.get(id)||{id,kinds:new Set(),refs:0};x.kinds.add(kind);x.refs++;ids.set(id,x)};
  const p1=/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g;while((m=p1.exec(code)))add(m[1],'getElementById');
  const p2=/querySelector(?:All)?\(\s*['"]#([A-Za-z][\w:.-]*)['"]\s*\)/g;while((m=p2.exec(code)))add(m[1],'querySelector');
  return [...ids.values()].filter(x=>!document.getElementById(x.id)).map(x=>({id:x.id,refs:x.refs,kinds:[...x.kinds]})).sort((a,b)=>b.refs-a.refs||a.id.localeCompare(b.id));
 }
 function timerStats(code){
  const count=re=>(code.match(re)||[]).length;
  const fast=[];let m;
  const re=/setInterval\s*\([\s\S]{0,260}?,\s*(\d{1,6})\s*\)/g;
  while((m=re.exec(code))){const ms=Number(m[1]);if(ms>0&&ms<500)fast.push(ms)}
  return {intervals:count(/\bsetInterval\s*\(/g),timeouts:count(/\bsetTimeout\s*\(/g),observers:count(/\bnew\s+MutationObserver\s*\(/g),listeners:count(/\.addEventListener\s*\(/g),raf:count(/\brequestAnimationFrame\s*\(/g),fast:fast.sort((a,b)=>a-b)};
 }
 function styleSuspects(blocks){
  const out=[];
  for(const b of blocks){
   const tokens=unique((b.raw.match(/#[A-Za-z_][\w-]*|\.[A-Za-z_][\w-]*/g)||[])).filter(x=>!/^(?:\.(?:png|jpg|jpeg|webp|gif))$/i.test(x)).slice(0,12);
   if(tokens.length<2)continue;
   let hit=false,tested=0;
   for(const t of tokens){try{tested++;if(document.querySelector(t)){hit=true;break}}catch(_){} }
   if(!hit&&tested>=2)out.push({id:b.id,tokens:tokens.slice(0,6),chars:b.raw.length});
  }
  return out.sort((a,b)=>b.chars-a.chars).slice(0,80);
 }
 function largeBlocks(scripts,styles){
  return [...scripts.map(x=>({type:'Script',id:x.id,chars:x.raw.length})).filter(x=>x.chars>120000),...styles.map(x=>({type:'Style',id:x.id,chars:x.raw.length})).filter(x=>x.chars>45000)].sort((a,b)=>b.chars-a.chars).slice(0,40);
 }
 function versionLayers(scripts,styles){
  const rows=[],groups=new Map();
  for(const x of [...scripts,...styles]){const m=String(x.id||'').match(/^v(\d{3,4})/i);if(!m)continue;const k='v'+m[1],a=groups.get(k)||[];a.push(x.id);groups.set(k,a)}
  for(const [prefix,ids] of groups)if(ids.length>1)rows.push({prefix,count:ids.length,ids:ids.slice(0,6)});
  return rows.sort((a,b)=>b.count-a.count||a.prefix.localeCompare(b.prefix)).slice(0,60);
 }

 /* Phase 1.5: exact, read-only hotspot locations. No timers/observers are wrapped or changed here. */
 function matchingParen(code,open){
  let depth=0,q='',escp=false,line=false,block=false;
  for(let i=open;i<code.length;i++){
   const c=code[i],n=code[i+1];
   if(line){if(c==='\n')line=false;continue}
   if(block){if(c==='*'&&n==='/'){block=false;i++}continue}
   if(q){if(escp){escp=false;continue}if(c==='\\'){escp=true;continue}if(c===q){q=''}continue}
   if(c==='/'&&n==='/'){line=true;i++;continue}
   if(c==='/'&&n==='*'){block=true;i++;continue}
   if(c==='"'||c==="'"||c==='`'){q=c;continue}
   if(c==='(')depth++;else if(c===')'){depth--;if(depth===0)return i}
  }
  return -1;
 }
 function splitArgs(txt){
  const out=[];let cur='',p=0,b=0,curl=0,q='',escp=false,line=false,block=false;
  for(let i=0;i<txt.length;i++){
   const ch=txt[i],n=txt[i+1];
   if(line){cur+=ch;if(ch==='\n')line=false;continue}
   if(block){cur+=ch;if(ch==='*'&&n==='/'){cur+=n;i++;block=false}continue}
   if(q){cur+=ch;if(escp){escp=false;continue}if(ch==='\\'){escp=true;continue}if(ch===q)q='';continue}
   if(ch==='/'&&n==='/'){cur+=ch+n;i++;line=true;continue}
   if(ch==='/'&&n==='*'){cur+=ch+n;i++;block=true;continue}
   if(ch==='"'||ch==="'"||ch==='`'){q=ch;cur+=ch;continue}
   if(ch==='(')p++;else if(ch===')')p--;else if(ch==='[')b++;else if(ch===']')b--;else if(ch==='{')curl++;else if(ch==='}')curl--;
   if(ch===','&&p===0&&b===0&&curl===0){out.push(cur.trim());cur='';continue}
   cur+=ch;
  }
  if(cur.trim()||out.length)out.push(cur.trim());return out;
 }
 function callAt(code,start,open){
  const o=open??code.indexOf('(',start);if(o<0)return null;const close=matchingParen(code,o);if(close<0)return null;
  return {open:o,close,args:splitArgs(code.slice(o+1,close)),text:code.slice(start,close+1)};
 }
 function intervalSites(blocks){
  const out=[];
  for(const b of blocks){
   const code=stripPayload(b.raw);let m;
   const re=/\bsetInterval\s*\(/g;
   while((m=re.exec(code))){
    const call=callAt(code,m.index,code.indexOf('(',m.index));if(!call)continue;
    const rawDelay=String(call.args[1]||'').trim(),numeric=/^\d+(?:\.\d+)?$/.test(rawDelay)?Number(rawDelay):null;
    out.push({script:b.id,line:lineNo(code,m.index),delay:numeric,delayRaw:compact(rawDelay,50)||'?',callback:compact(call.args[0]||'',150),native:false,governed:numeric!=null&&numeric>0&&numeric<800});
    re.lastIndex=Math.max(re.lastIndex,call.close+1);
   }
   const nr=/\(\s*window\.__V477_NATIVE_SET_INTERVAL__\s*\|\|\s*window\.setInterval\s*\)\s*\(/g;
   while((m=nr.exec(code))){
    const open=code.indexOf('(',m.index+m[0].lastIndexOf(')')+1);const call=callAt(code,m.index,open);if(!call)continue;
    const rawDelay=String(call.args[1]||'').trim(),numeric=/^\d+(?:\.\d+)?$/.test(rawDelay)?Number(rawDelay):null;
    out.push({script:b.id,line:lineNo(code,m.index),delay:numeric,delayRaw:compact(rawDelay,50)||'?',callback:compact(call.args[0]||'',150),native:true,governed:false});
    nr.lastIndex=Math.max(nr.lastIndex,call.close+1);
   }
  }
  return out.sort((a,b)=>(a.delay??1e12)-(b.delay??1e12)||a.script.localeCompare(b.script)||a.line-b.line);
 }
 function observerSites(blocks){
  const out=[];
  for(const b of blocks){const code=stripPayload(b.raw);let m;const re=/\bnew\s+MutationObserver\s*\(/g;while((m=re.exec(code))){const open=code.indexOf('(',m.index),call=callAt(code,m.index,open);out.push({script:b.id,line:lineNo(code,m.index),callback:compact(call?.args?.[0]||code.slice(m.index,m.index+170),150)});if(call)re.lastIndex=Math.max(re.lastIndex,call.close+1)}}
  return out;
 }
 function groupedSites(blocks,re){
  const rows=[];
  for(const b of blocks){const code=stripPayload(b.raw);let count=0,m;re.lastIndex=0;while((m=re.exec(code)))count++;if(count)rows.push({script:b.id,count})}
  return rows.sort((a,b)=>b.count-a.count||a.script.localeCompare(b.script));
 }
 function ownerChains(blocks){
  const names=['v032Go','renderInventory','renderQuests','renderDungeon','renderShop','v254RenderGuild','v073LoadRanking','v073ProfilePayload','v075WriteCloudSave','v075ApplyCloudSave','v110Fight','claimQuest','v233ClaimQuest','startQuest','v209FinishBattle','v200FinalizeUser'];
  const out=[];
  for(const name of names){
   const hits=[];const safe=name.replace(/[$]/g,'\\$&');
   const pats=[
    ['window/global',new RegExp('\\b(?:window|globalThis)\\.'+safe+'\\s*=','g')],
    ['assignment',new RegExp('(?:^|[^\\w$])'+safe+'\\s*=\\s*(?:async\\s*)?(?:function\\b|\\([^;=\\n]{0,180}\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)','gm')],
    ['function',new RegExp('\\bfunction\\s+'+safe+'\\s*\\(','g')]
   ];
   for(const b of blocks){const code=stripPayload(b.raw);for(const [kind,re] of pats){re.lastIndex=0;let m;while((m=re.exec(code)))hits.push({script:b.id,line:lineNo(code,m.index),kind,pos:b.i*10000000+m.index})}}
   hits.sort((a,b)=>a.pos-b.pos);const ded=[];const seen=new Set();for(const h of hits){const k=h.script+'|'+h.line;if(!seen.has(k)){seen.add(k);ded.push(h)}}
   if(ded.length)out.push({name,count:ded.length,hits:ded.map(({pos,...h})=>h),last:ded[ded.length-1]});
  }
  return out.sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 }
 function run(){
  const body=$('glCodeDiagBody'),copy=$('glCodeDiagCopy'),btn=$('glCodeDiagRun');if(!body)return;
  if(btn){btn.disabled=true;btn.textContent='Prüfung läuft…'}if(copy)copy.disabled=true;
  body.className='gl-code-diag-loading';body.innerHTML='<b>🔎 Code wird nur gelesen…</b>Zusätzlich werden jetzt die exakten Timer-, MutationObserver- und wichtigen Owner-Stellen mit Script-ID und Zeilennummer ermittelt.';
  setTimeout(()=>{
   const started=performance.now();
   try{
    const scripts=scriptInfo(),styles=styleInfo();
    const cleanParts=scripts.map(x=>stripPayload(x.raw));
    const eventAttrs=[...document.querySelectorAll('[onclick],[onchange],[oninput],[onsubmit],[onkeydown],[onkeyup]')].flatMap(el=>['onclick','onchange','oninput','onsubmit','onkeydown','onkeyup'].map(a=>el.getAttribute(a)||'')).filter(Boolean);
    const code=cleanParts.join('\n')+'\n'+eventAttrs.join('\n');
    const toks=tokenCounts(code),defs=definitions(scripts),dups=duplicateIds();
    const multi=[...defs].filter(([,a])=>a.length>1).map(([name,a])=>({name,count:a.length,blocks:unique(a.map(x=>x.block))})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
    const unused=[...defs].filter(([name,a])=>a.length===1&&(toks.get(name)||0)===1).map(([name,a])=>({name,block:a[0].block,kind:a[0].kind})).sort((a,b)=>a.name.localeCompare(b.name));
    const missing=missingTargets(code),timers=timerStats(code),css=styleSuspects(styles),large=largeBlocks(scripts,styles),layers=versionLayers(scripts,styles);
    const intervals=intervalSites(scripts),observers=observerSites(scripts),listenerGroups=groupedSites(scripts,/\.addEventListener\s*\(/g),rafGroups=groupedSites(scripts,/\brequestAnimationFrame\s*\(/g),owners=ownerChains(scripts);
    const runtimeTech=window.__V4106_TECH__||null;
    const runtime={intervals:runtimeTech?.intervals?.size??null,timeouts:runtimeTech?.timeouts?.size??null,longTasks:Array.isArray(runtimeTech?.longTasks)?runtimeTech.longTasks.filter(x=>Date.now()-Number(x?.at||0)<60000).length:null,dom:document.getElementsByTagName('*').length};
    last={phase:'1.5',at:new Date().toISOString(),ms:Math.round(performance.now()-started),scripts:scripts.length,scriptsTotal:document.scripts.length,styles:styles.length,duplicateIds:dups,multipleOwners:multi,likelyUnused:unused,missingTargets:missing,timers,intervalSites:intervals,observerSites:observers,listenerGroups,rafGroups,ownerChains:owners,cssSuspects:css,largeBlocks:large,versionLayers:layers,runtime};
    render(last);if(copy)copy.disabled=false;
   }catch(err){body.className='gl-code-diag-empty';body.innerHTML=`<b style="color:#ff9a91">❌ Diagnosefehler</b><br>${esc(err?.message||err)}`}
   finally{if(btn){btn.disabled=false;btn.textContent='Diagnose erneut starten'}}
  },40);
 }
 const row=(status,title,detail)=>`<div class="gl-code-diag-row"><em class="${status}">${status==='red'?'SICHER':status==='yellow'?'VERDACHT':'INFO'}</em><div><b>${esc(title)}</b>${detail?`<small>${esc(detail)}</small>`:''}</div></div>`;
 function section(title,sub,rows,empty='Keine Treffer.'){
  return `<div class="gl-code-diag-section"><div class="gl-code-diag-head"><b>${esc(title)}</b><span>${esc(sub)}</span></div><div class="gl-code-diag-list">${rows.length?rows.join(''):`<div class="gl-code-diag-clean">✅ ${esc(empty)}</div>`}</div></div>`;
 }
 function render(r){
  const body=$('glCodeDiagBody');if(!body)return;
  const red=r.duplicateIds.length;
  const yellow=r.multipleOwners.length+r.likelyUnused.length+r.missingTargets.length+r.cssSuspects.length+r.intervalSites.filter(x=>(x.delay!=null&&x.delay<500)||x.native).length;
  const dupRows=r.duplicateIds.slice(0,40).map(x=>row('red',`#${x.id} ist ${x.count}× im Live-DOM`,`Elemente: ${x.tags.join(', ')}`));
  const intervalRows=r.intervalSites.slice(0,80).map(x=>{
    const hot=x.delay!=null&&x.delay<500,st=hot||x.native?'yellow':'green';
    let d=`${x.script} · Zeile ${x.line} · Delay ${x.delay!=null?x.delay+' ms':x.delayRaw}`;
    if(x.native)d+=' · NATIVE BYPASS: wird nicht vom v477-Governor gedrosselt';else if(x.governed)d+=' · v477 drosselt <800 ms auf ca. 2200–3100 ms';
    if(x.callback)d+=` · Callback: ${x.callback}`;
    return row(st,x.native?'Native/ungefilterter setInterval':hot?'Schneller setInterval':'setInterval',d);
  });
  const observerRows=r.observerSites.slice(0,70).map(x=>row('yellow',`MutationObserver · ${x.script} · Zeile ${x.line}`,x.callback?`Callback: ${x.callback}`:'Callback nicht aufgelöst'));
  const ownerRowsExact=r.ownerChains.map(x=>row('yellow',`${x.name}: ${x.count} Owner-/Definitionstreffer`,`Letzter Treffer: ${x.last.script} · Zeile ${x.last.line} · ${x.last.kind} | Kette: ${x.hits.slice(-8).map(h=>h.script+':'+h.line).join(' → ')}`));
  const listenerRows=r.listenerGroups.slice(0,35).map(x=>row('green',`${x.script}`,`${x.count} addEventListener-Vorkommen im Block`));
  const rafRows=r.rafGroups.slice(0,35).map(x=>row('green',`${x.script}`,`${x.count} requestAnimationFrame-Vorkommen im Block`));
  const ownerRows=r.multipleOwners.slice(0,50).map(x=>row('yellow',`${x.name} wird ${x.count}× definiert`,`Blöcke: ${x.blocks.slice(0,8).join(' → ')}${x.blocks.length>8?' …':''}`));
  const unusedRows=r.likelyUnused.slice(0,50).map(x=>row('yellow',x.name,`Nur Definition gefunden · ${x.block} · ${x.kind}. Kann dynamisch benutzt werden.`));
  const missingRows=r.missingTargets.slice(0,50).map(x=>row('yellow',`#${x.id} fehlt aktuell im DOM`,`${x.refs} Code-Verweis${x.refs===1?'':'e'} · ${x.kinds.join('/')}. Kann ein später erzeugtes Popup/Ziel sein.`));
  const cssRows=r.cssSuspects.slice(0,40).map(x=>row('yellow',x.id,`Keines der geprüften Ziele aktuell im DOM: ${x.tokens.join(', ')} · ${(x.chars/1024).toFixed(1)} KB`));
  const timerRows=[row('green',`${r.timers.intervals} setInterval · ${r.timers.timeouts} setTimeout`,`Quelltext-Vorkommen. Die exakten setInterval-Stellen stehen jetzt direkt darunter.`),row(r.timers.fast.length?'yellow':'green',`${r.timers.fast.length} grob erkannte Intervalle unter 500 ms`,r.timers.fast.length?`Heuristikwerte: ${r.timers.fast.slice(0,20).join(', ')} ms${r.timers.fast.length>20?' …':''}`:'Keine per Heuristik gefunden.'),row('green',`${r.timers.observers} MutationObserver · ${r.timers.listeners} addEventListener · ${r.timers.raf} requestAnimationFrame`,`Quelltext-Vorkommen zur Orientierung.`)];
  const layerRows=r.versionLayers.slice(0,30).map(x=>row('yellow',`${x.prefix}: ${x.count} Script/Style-Blöcke`,`Beispiele: ${x.ids.join(', ')}. Mehrere Blöcke sind nicht automatisch tot.`));
  const largeRows=r.largeBlocks.slice(0,25).map(x=>row('green',`${x.type}: ${x.id}`,`${(x.chars/1024).toFixed(1)} KB Quelltext`));
  body.className='';
  body.innerHTML=`<div class="gl-code-diag-summary"><div class="gl-code-diag-stat ${red?'red':'green'}"><small>Sichere Konflikte</small><b>${red}</b></div><div class="gl-code-diag-stat yellow"><small>Verdachtsstellen</small><b>${yellow}</b></div><div class="gl-code-diag-stat"><small>Scripts / Styles</small><b>${r.scripts} / ${r.styles}</b></div><div class="gl-code-diag-stat"><small>Scan</small><b>${r.ms} ms</b></div></div><div class="gl-code-diag-note"><b>Phase 1.5 + 1.6:</b> Die statische Diagnose zeigt Timer/Observer/Owner-Ketten; darunter misst der 30-Sekunden-Profiler nur auf Knopfdruck, welche davon tatsächlich laufen. Es wird nichts gelöscht oder gestoppt.</div>${section('⏱️ EXAKTE setInterval-STELLEN',`${r.intervalSites.length} Fundstellen`,intervalRows,'Keine setInterval-Aufrufe erkannt.')}${section('👁️ EXAKTE MutationObserver-STELLEN',`${r.observerSites.length} Fundstellen`,observerRows,'Keine MutationObserver erkannt.')}${section('🧭 WICHTIGE OWNER-KETTEN',`${r.ownerChains.length} Kernfunktionen`,ownerRowsExact,'Keine der überwachten Kernfunktionen erkannt.')}${section('🎧 EVENT-LISTENER NACH SCRIPT',`${r.listenerGroups.length} Blöcke mit Listenern`,listenerRows,'Keine Listener erkannt.')}${section('🎞️ requestAnimationFrame NACH SCRIPT',`${r.rafGroups.length} Blöcke mit rAF`,rafRows,'Keine requestAnimationFrame-Aufrufe erkannt.')}${section('🔴 DOPPELTE LIVE-IDs',`${r.duplicateIds.length} sichere Treffer`,dupRows,'Keine doppelten IDs im aktuellen Live-DOM.')}${section('🟡 MEHRFACH DEFINIERTE FUNKTIONEN / OWNER',`${r.multipleOwners.length} allgemeine Kandidaten`,ownerRows,'Keine mehrfach erkannten Funktionsdefinitionen.')}${section('🟡 WAHRSCHEINLICH UNBENUTZTE FUNKTIONEN',`${r.likelyUnused.length} Kandidaten`,unusedRows,'Keine einfachen Totcode-Kandidaten nach dieser Heuristik.')}${section('🟡 CODE-ZIELE, DIE AKTUELL FEHLEN',`${r.missingTargets.length} Kandidaten`,missingRows,'Alle statisch erkannten ID-Ziele sind aktuell vorhanden.')}${section('🟡 CSS-BLÖCKE OHNE AKTUELLEN DOM-TREFFER',`${r.cssSuspects.length} Kandidaten`,cssRows,'Kein verdächtiger Style-Block nach dieser Heuristik.')}${section('⚙️ TIMER / OBSERVER / LISTENER SUMME',`DOM ${r.runtime.dom.toLocaleString('de-DE')}`,timerRows)}${section('🧱 HISTORISCHE PATCH-SCHICHTEN',`${r.versionLayers.length} Gruppen mit mehreren Blöcken`,layerRows,'Keine mehrfach gruppierten Versionsblöcke erkannt.')}${section('📦 GROSSE CODE-BLÖCKE',`${r.largeBlocks.length} auffällige Größen`,largeRows,'Keine besonders großen Script-/Style-Blöcke nach Grenzwert.')}<div class="gl-code-diag-foot">Wichtig: Gelb bleibt ein Prüfhinweis, kein Löschbefehl. Besonders Native-Intervalle können absichtlich für Kampftaktung verwendet werden. Wir entfernen erst etwas, wenn Quelle, Zweck und Ersatz eindeutig geklärt sind.</div>`;
 }
 function reportText(r){
  const lines=[];lines.push('GROW LEGENDS · CODE-DIAGNOSE PHASE 1.5 · NUR LESEN',`Zeit: ${r.at}`,`Scan: ${r.ms} ms`,`Scripts/Styles: ${r.scriptsTotal||r.scripts}/${r.styles} (${r.scripts} Scripts geprüft; Diagnose-Script ausgenommen)`,`DOM: ${r.runtime.dom}`,'');
  const add=(title,a,fmt,limit=100)=>{lines.push(`${title} (${a.length})`);a.slice(0,limit).forEach(x=>lines.push('- '+fmt(x)));if(a.length>limit)lines.push(`- … +${a.length-limit} weitere`);lines.push('')};
  add('EXAKT: setInterval-Fundstellen',r.intervalSites,x=>`${x.script}:${x.line} :: delay=${x.delay!=null?x.delay+'ms':x.delayRaw} :: ${x.native?'NATIVE-BYPASS':'governed='+x.governed} :: ${x.callback}`,120);
  add('EXAKT: MutationObserver-Fundstellen',r.observerSites,x=>`${x.script}:${x.line} :: ${x.callback}`,100);
  add('EXAKT: wichtige Owner-Ketten',r.ownerChains,x=>`${x.name} ×${x.count} :: last=${x.last.script}:${x.last.line} (${x.last.kind}) :: ${x.hits.map(h=>h.script+':'+h.line).join(' -> ')}`,50);
  add('INFO: addEventListener nach Script',r.listenerGroups,x=>`${x.script} :: ${x.count}`,60);
  add('INFO: requestAnimationFrame nach Script',r.rafGroups,x=>`${x.script} :: ${x.count}`,60);
  add('SICHER: doppelte Live-IDs',r.duplicateIds,x=>`#${x.id} ×${x.count} [${x.tags.join(', ')}]`);
  add('VERDACHT: mehrfach definierte Funktionen',r.multipleOwners,x=>`${x.name} ×${x.count} :: ${x.blocks.join(' -> ')}`);
  add('VERDACHT: wahrscheinlich unbenutzte Funktionen',r.likelyUnused,x=>`${x.name} :: ${x.block} :: ${x.kind}`);
  add('VERDACHT: fehlende aktuelle DOM-Ziele',r.missingTargets,x=>`#${x.id} :: ${x.refs} refs :: ${x.kinds.join('/')}`);
  add('VERDACHT: CSS ohne aktuellen DOM-Treffer',r.cssSuspects,x=>`${x.id} :: ${x.tokens.join(', ')}`);
  lines.push(`TIMER SUMME QUELLCODE: intervals=${r.timers.intervals}, timeouts=${r.timers.timeouts}, MutationObserver=${r.timers.observers}, addEventListener=${r.timers.listeners}, rAF=${r.timers.raf}, fast<500ms=${r.timers.fast.length}`,`TIMER LAUFZEIT AKTIV: intervals=${r.runtime.intervals??'—'}, timeouts=${r.runtime.timeouts??'—'}, longTasks60s=${r.runtime.longTasks??'—'}`,'');
  add('Historische Patch-Gruppen',r.versionLayers,x=>`${x.prefix} ×${x.count} :: ${x.ids.join(', ')}`);
  add('Große Code-Blöcke',r.largeBlocks,x=>`${x.type} ${x.id} :: ${(x.chars/1024).toFixed(1)} KB`);
  lines.push('HINWEIS: Die Phase-1.5-Diagnose ist nur lesend. Gelbe Treffer dürfen nicht blind gelöscht werden.');return lines.join('\n');
 }
 async function copy(){if(!last)return;const txt=reportText(last);try{await navigator.clipboard.writeText(txt)}catch(_){const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove()}const b=$('glCodeDiagCopy');if(b){const old=b.textContent;b.textContent='✅ Kopiert';setTimeout(()=>b.textContent=old,1200)}}
 document.addEventListener('click',e=>{if(e.target.closest?.('#glCodeDiagRun')){e.preventDefault();run()}else if(e.target.closest?.('#glCodeDiagCopy')){e.preventDefault();copy()}},true);
 window.glRunCodeDiagnosis=run;
 window.glGetCodeDiagnosis=()=>last;
})();
