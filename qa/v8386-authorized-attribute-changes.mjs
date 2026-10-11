import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const owner=read('js/features/character/beta/v8009-s1-v4140-attribute-display-owner.js');
const bridge=read('js/features/authority/beta/v8009-s6-v7062-server-item-action-bridge.js');
const recorder=read('js/features/system/beta/v8383-unified-flight-recorder.js');
const beta=read('beta.html'),server1=read('server1.html');
new vm.Script(owner,{filename:'v4140.js'});
new vm.Script(bridge,{filename:'v7062.js'});
new vm.Script(recorder,{filename:'v8383.js'});
assert.equal(beta.split('v4140-attribute-display-owner.js?v=8386-attribute-provenance-beta').length-1,1);
assert.equal(beta.split('v7062-server-item-action-bridge.js?v=8386-confirmed-material-beta').length-1,1);
assert.equal(beta.split('v8383-unified-flight-recorder.js?v=8397-flight-recorder-beta').length-1,1);
assert.equal(server1.includes('8386-attribute-provenance-beta'),false);
assert.equal(server1.includes('8386-confirmed-material-beta'),false);
assert.equal(server1.includes('8386-attribute-report-beta'),false);
assert.ok(bridge.includes("r?.ok)throw")&&bridge.includes("window.__V8386_MATERIAL_APPLY_CONTEXT__"),'Only server-confirmed material update is marked');
assert.ok(owner.includes("window.GROW_RELEASE_CHANNEL||''")&&owner.includes("return 'spend'")&&owner.includes("return 'material'"));
assert.ok(recorder.includes("Attributänderung ungeklärt"),'Unexplained change reports show the changed numbers');

function buildApp(channel){
 let t=1000;
 const reports=[];
 const s={playerClass:'grower',attrs:{staerke:50,geschick:5,intelligenz:5,ausdauer:25,glueck:5},points:3,
  equipment:{weapon:{id:'weapon_1',bonus:{staerke:10,ausdauer:15}}}};
 const classes={grower:{bonus:{staerke:4,ausdauer:3}}};
 const box={dataset:{},innerHTML:'',querySelectorAll:()=>[]};
 const pLabel={textContent:''},active={classList:{contains:x=>x==='active'}};
 const document={getElementById:id=>({character:active,attrs:box,v459AttrPoints:pLabel})[id]||null,querySelectorAll:()=>[]};
 const window={GROW_RELEASE_CHANNEL:channel,GROW_LEGENDS_VERSION:{short:'V8.386'},v073User:{id:'local-test'},
  __GL_RUNTIME_WATCHDOG__:{report:(...args)=>reports.push(args)}};
 const totalAttr=k=>s.attrs[k]+(classes.grower.bonus[k]||0)+Object.values(s.equipment)
  .reduce((sum,it)=>sum+(Number(it?.bonus?.[k])||0),0);
 const fakeDate=class extends Date{static now(){return t}};
 const context={window,s,classes,document,Date:fakeDate,totalAttr,Math,JSON,Number,
  Object,String,Array,Map,Set,Promise,requestAnimationFrame:()=>{}};
 vm.runInNewContext(owner,context,{timeout:3000});
 return {window,s,reports,paint:()=>window.v4140PaintAttributes(),time:v=>{t=v}};
}

const app=buildApp('beta');
app.paint();app.time(1500);
app.s.attrs.staerke++;app.s.points--;
app.paint();
assert.equal(app.reports.length,0,'Server-confirmed +1 spend should not warn');
assert.equal(app.window.v4140AttributeDiagnostics().expectedSpendChanges,1);

app.time(1700);
app.window.__V8386_MATERIAL_APPLY_CONTEXT__={at:1700,slot:'weapon'};
app.s.equipment.weapon.bonus.staerke+=4;
app.s.equipment.weapon.bonus.ausdauer-=6;
app.paint();
assert.equal(app.reports.length,0,'Server-confirmed gem replacement should not warn');
assert.equal(app.window.v4140AttributeDiagnostics().expectedMaterialChanges,1);
assert.equal(app.window.__V8386_MATERIAL_APPLY_CONTEXT__,null,'Marker consumed exactly once');

app.time(2400);
app.s.equipment.weapon.bonus.staerke+=3;
app.paint();
assert.equal(app.reports.length,1,'Unexplained weapon mutation must warn');
assert.equal(app.reports[0][0],'attribute_value_changed');
assert.equal(app.reports[0][1],'warn');
assert.ok(!JSON.stringify(app.reports[0][2]).includes('weapon_1'),'No item identifiers in telemetry');
assert.ok(!JSON.stringify(app.reports[0][2]).includes('local-test'),'No account identifiers in telemetry');

app.time(2600);
app.s.attrs.ausdauer+=2;
app.paint();
assert.equal(app.reports.length,2,'Unconfirmed base stat jump must warn');
const product=buildApp('server1');
product.paint();product.time(1500);
product.s.attrs.staerke++;product.s.points--;product.paint();
assert.equal(product.reports.length,1,'Server1 original diagnostics stay intact');
console.log('V8.386 PASS: normal spend, canonical material application, unexpected mutations, privacy, Beta isolation');
