// V8.312: static performance integrity test for BOTH shipped entrypoints.
// It does not simulate real mobile GPU/WebView, network, or authenticated gameplay.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const failures=[];
const reports=[];
const entries=['beta.html','server1.html'];
const text=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const assert=(ok,label)=>{if(!ok)failures.push(label)};
const attr=(tag,name)=>{
  const m=tag.match(new RegExp('\\b'+name+'=["\\\']([^"\\\']+)["\\\']','i'));
  return m?.[1]||'';
};
const normalize=ref=>decodeURIComponent(ref.split('?')[0].split('#')[0]).replace(/^\\.\\//,'');
const scripts=new Set(),styles=new Set();
const entryMetrics=[];
for(const entry of entries){
  const html=text(entry);
  const tags=[...html.matchAll(/<(?:script|link)\\b[^>]*>/gi)].map(m=>m[0]);
  const js=[],css=[];
  for(const tag of tags){
    if(/^<script\\b/i.test(tag)){
      const src=attr(tag,'src');
      if(src&&!/^https?:|^data:/i.test(src))js.push(normalize(src));
    }else if(attr(tag,'rel').toLowerCase()==='stylesheet'){
      const href=attr(tag,'href');
      if(href&&!/^https?:|^data:/i.test(href))css.push(normalize(href));
    }
  }
  const countDuplicates=items=>items.length-new Set(items).size;
  assert(countDuplicates(js)===0,entry+': duplicate JS');
  assert(countDuplicates(css)===0,entry+': duplicate CSS');
  for(const file of js)scripts.add(file);
  for(const file of css)styles.add(file);
  assert(html.includes('v8009-home-renderer.js?v=8312-home-perf1'),entry+': home performance version missing');
  assert(html.includes('v6118-event-x2-worldboss-design-css.css?v=8312-home-perf1'),entry+': boss performance version missing');
  entryMetrics.push({entry,js:js.length,css:css.length,jsDuplicates:countDuplicates(js),cssDuplicates:countDuplicates(css)});
}
const missing=[];
let jsBytes=0,cssBytes=0;
const areas=new Map();
for(const file of [...scripts].sort()){
  const abs=path.join(root,file);
  if(!fs.existsSync(abs)){missing.push(file);continue}
  const source=fs.readFileSync(abs,'utf8');jsBytes+=Buffer.byteLength(source);
  const area=file.match(/(?:^|\\/)features\\/([^/]+)/)?.[1]||'other';
  const current=areas.get(area)||{scripts:0,bytes:0};current.scripts++;current.bytes+=Buffer.byteLength(source);areas.set(area,current);
  try{new vm.Script(source,{filename:file,displayErrors:true})}
  catch(e){failures.push('JS parse '+file+': '+String(e.message||e).slice(0,170))}
}
for(const file of [...styles].sort()){
  const abs=path.join(root,file);
  if(!fs.existsSync(abs)){missing.push(file);continue}
  cssBytes+=fs.statSync(abs).size;
}
assert(missing.length===0,'Missing assets: '+missing.slice(0,12).join(', '));
const home=text('js/features/home/beta/v8009-home-renderer.js');
const homeFit=text('js/system/performance/v7288-home-adaptive-fit-script.js');
const boss=text('v8009-extracted-v6118-event-x2-worldboss-design-css.css');
const bossCard=text('v8009-extracted-v6123-worldboss-slot-feinschliff-css.css');
assert(home.includes("s?.energy,'wallet-header','wallet-header'"),'Wallet-only home full repaint not eliminated');
assert(home.includes('diagnostics.energyDirectPatches++'),'Energy-only direct update absent');
assert(home.includes('i===17||i===18'),'Event signature indices must remain stable');
assert(home.includes('previous[17]'),'Boss signature index must remain stable');
assert(homeFit.includes('parts[24]=weekly')&&homeFit.includes('parts[25]'),'Weekly/weather signature compatibility');
assert((home.match(/setTimeout\\(\\(\\)=>repairHomeTitles\\(\\),450\\)/g)||[]).length===1,'Duplicate 450ms title scan');
assert(home.includes('v366-panel v8310-cup-results-slot'),'Grow Cup panel class missing');
assert(boss.includes('animation:none!important')&&boss.includes('animation:v6118LiveDot'),'Worldboss visual optimization regressed');
assert(bossCard.includes('flex:0 0 32px!important'),'Worldboss CTA size regressed');
assert(home.includes('if(!force&&!world.classList.contains(\'active\'))'),'Inactive screen guard lost');
const expensiveAreas=[...areas].map(([name,data])=>({name,...data})).sort((a,b)=>b.bytes-a.bytes);
const out={
  version:'V8.312',checkedAt:new Date().toISOString(),entries:entryMetrics,
  uniqueJs:scripts.size,uniqueCss:styles.size,jsBytes,cssBytes,
  largestJsAreas:expensiveAreas.slice(0,12),assetsMissing:missing.length,
  failures,pass:failures.length===0
};
console.log(JSON.stringify(out,null,2));
if(failures.length)process.exitCode=1;
