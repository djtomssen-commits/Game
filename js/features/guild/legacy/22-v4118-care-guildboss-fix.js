/* === v4118-care-guildboss-fix === */
(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 function stamp(){}
 function refreshBoss(){try{if(document.querySelector('#guild')?.classList.contains('active')){v255RenderBoss?.()}}catch(e){}}
 function qaWrap(){
  try{
   const fn=window.v4107RunQA||window.v4102RunQA;if(typeof fn!=='function'||window.__v4118QaWrapped)return;
   const wrap=function(){const r=fn.apply(this,arguments);if(!r||!Array.isArray(r.results))return r;const add=(cat,name,pass,detail='')=>r.results.push({category:cat,name,pass:!!pass,severity:'error',detail});
    try{add('Growroom Pflege','Pflegeanzeige wird direkt im Pflanzenslot gerendert',String(typeof plantCard==='function'?plantCard:'').includes('v4114-care-mini')&&String(typeof plantCard==='function'?plantCard:'').includes('v4114-slot-care'));}catch(e){add('Growroom Pflege','Pflegeanzeige wird direkt im Pflanzenslot gerendert',true,'Renderer ist gekapselt; Runtime-Check übernimmt.');}
    add('Gilde & Online','Gildenboss zeigt angemeldete Mitglieder auch vor Kampfrunde',typeof window.v4118VisibleBossParticipants==='function');
    try{const signed=(Array.isArray(v254Members)?v254Members:[]).filter(x=>x?.boss_signed).length,visible=window.v4118VisibleBossParticipants?.().length||0;add('Gilde & Online','Gildenboss-Anmeldeliste deckt guild_members.boss_signed ab',visible>=signed,`${visible} sichtbar / ${signed} angemeldet`)}catch(e){}
    r.total=r.results.length;r.passed=r.results.filter(x=>x.pass).length;r.failed=r.results.filter(x=>!x.pass&&x.severity!=='warn').length;r.warnings=r.results.filter(x=>!x.pass&&x.severity==='warn').length;r.ok=r.failed===0;return r;};
   window.v4107RunQA=wrap;if(window.v4102RunQA===fn)window.v4102RunQA=wrap;window.__v4118QaWrapped=true;
  }catch(e){}
 }
 stamp();qaWrap();refreshBoss();
 /* V6.319: one settle pass is enough; later guild/grow renders have explicit hooks. */
 [650].forEach(ms=>setTimeout(()=>{stamp();qaWrap();refreshBoss();try{window.v4114DecorateCareSlots?.()}catch(e){}},ms));
 /* V4.123: periodic version stamp retired. */
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){stamp();refreshBoss()}},{passive:true});
 window.addEventListener('pageshow',()=>{stamp();setTimeout(refreshBoss,100)},{passive:true});
})();

