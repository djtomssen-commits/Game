(()=>{
'use strict';
if(window.__V8159_I18N_AUDIT__)return;
window.__V8159_I18N_AUDIT__=true;

const germanHint=/[äöüÄÖÜß]|\b(und|oder|nicht|kein|keine|dein|deine|der|die|das|ein|eine|für|mit|ohne|bereit|geschlossen|öffnen|kaufen|verkaufen|belohnung|auftrag|gegner|gilde|turm|samen|pflanze|pflege|ernte|topf|raum|woche|heute|morgen|spieler|nachricht|freunde|ausrüstung|attribute|talente|materialien|schmiede|händler|versuch|rangliste|kampf|sieg|niederlage|fortschritt|kosten|bestand|auswählen|abholen|starten|abbrechen|bestätigen|zurück|weiter|laden|speichern)\b/i;
const ignored=/^(Grow Legends|V\d|XP|HP|PvP|PVP|EXP|GOLD|LEVEL|COMING SOON|ONLINE|OFFLINE|DELETE|Admin|Support|Google)$/i;
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();

function collect(){
 const lang=window.GrowI18n?.getLanguage?.()||document.documentElement.lang||'de';
 const roots=[...document.querySelectorAll('.screen,#v075AuthOverlay,[role="dialog"],.modal,.overlay')];
 const found=new Map();
 const push=(text,kind,el,attr)=>{
  const s=normalize(text);if(!s||s.length<2||s.length>240||ignored.test(s)||!germanHint.test(s))return;
  const key=kind+'|'+s;
  if(found.has(key))return;
  found.set(key,{text:s,kind,attr:attr||null,screen:el?.closest?.('.screen')?.id||null,tag:el?.tagName||null});
 };
 for(const root of roots){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode,el=node.parentElement;
   if(!el||el.closest('script,style,noscript,textarea'))continue;
   push(node.nodeValue,'text',el,null);
  }
  root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
   ['aria-label','title','placeholder'].forEach(a=>{if(el.hasAttribute(a))push(el.getAttribute(a),'attr',el,a)});
  });
 }
 const entries=[...found.values()].sort((a,b)=>(a.screen||'').localeCompare(b.screen||'')||a.text.localeCompare(b.text));
 const report={version:'V8159',lang,at:new Date().toISOString(),count:entries.length,entries};
 window.__V8159_I18N_AUDIT_LAST__=report;
 try{localStorage.setItem('growLegendsI18nAudit',JSON.stringify(report))}catch(_){}
 return report;
}
function audit(){
 const r=collect();
 try{console.groupCollapsed('[V8159 I18N] '+r.count+' German candidates @ '+r.lang);console.table(r.entries);console.groupEnd()}catch(_){}
 return r;
}
window.v8159I18nAudit=audit;
window.v8159I18nAuditGet=()=>window.__V8159_I18N_AUDIT_LAST__||collect();
window.addEventListener('growlegends:language-changed',()=>setTimeout(audit,120),{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',()=>setTimeout(audit,180),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(audit,500),{passive:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(audit,700),{once:true});
})();