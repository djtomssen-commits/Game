(()=>{
'use strict';
if(window.__V6301_HARZ_TALENT_DESC__)return;
window.__V6301_HARZ_TALENT_DESC__=true;

const MILE={
 summon:[
  '+0,4 Prozentpunkte Beschwörungschance und +1,5 % Begleiterschaden.',
  '+0,4 Prozentpunkte Beschwörungschance und +1,5 % Begleiterschaden.',
  '+0,4 Prozentpunkte Beschwörungschance, +1,5 % Begleiterschaden und +4 Prozentpunkte Chance auf einen zweiten Begleiter.',
  '+0,4 Prozentpunkte Beschwörungschance und +1,5 % Begleiterschaden.',
  '+0,4 Prozentpunkte Beschwörungschance und +1,5 % Begleiterschaden.',
  '+0,4 Prozentpunkte Beschwörungschance und +1,5 % Begleiterschaden.',
  '+2,5 Prozentpunkte Beschwörungschance, +10 % Begleiterschaden und +12 Prozentpunkte Chance auf einen zweiten Begleiter.'
 ],
 soul:[
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+0,2 % Lebensraub, +0,8 % maximale LP und 0,4 % weniger erlittener Schaden.',
  '+1,5 % Lebensraub, +6 % maximale LP, 2,5 % weniger erlittener Schaden und einmal pro Kampf einen tödlichen Treffer mit 1 LP überleben.'
 ],
 curse:[
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+0,6 Prozentpunkte DOT-Chance, +1,2 % DOT-Schaden und +0,6 % Rüstungsdurchdringung.',
  '+4 Prozentpunkte DOT-Chance, +8 % DOT-Schaden, +4 % Rüstungsdurchdringung und +8 % Schaden gegen verfluchte Ziele.'
 ]
};

const old=typeof v314Desc==='function'?v314Desc:null;
if(old){
  const wrapped=function(branch,kind,i){
    if(kind==='m'&&MILE[branch]?.[i]){
      const lv=Number(V314_LEVELS?.[i])||0;
      const req=Number(V314_REQ?.[i])||0;
      const type=i===6?'👑 Meistertalent':'⭐ Schlüsseltalent';
      return `${MILE[branch][i]} · ${type} ab Level ${lv} · benötigt ${req} Punkte im Ast.`;
    }
    return old.apply(this,arguments);
  };
  try{v314Desc=wrapped}catch(_){}
  window.v314Desc=wrapped;
}

function rerender(){
  try{
    if(String(s?.playerClass||'')==='summoner'&&typeof renderSkillTree==='function'){
      renderSkillTree();
    }
  }catch(e){console.warn('V6.301 Talentbeschreibung render',e)}
}
window.addEventListener('growlegends:account-ready',()=>setTimeout(rerender,120));
document.addEventListener('click',e=>{
  const hit=e.target instanceof Element
    ? e.target.closest('[data-v543-branch],[onclick*="v543SelectTalentBranch"],[onclick*="v314Upgrade"]')
    : null;
  if(hit)setTimeout(rerender,0);
},true);
window.addEventListener('growlegends:foreground-ready',rerender,{passive:true});

window.v6301HarzTalentDiagnostics=()=>({
  version:'V6.301',
  pointInfo:{
    summon:Array.isArray(V320_POINT_INFO?.summon)?V320_POINT_INFO.summon.length:0,
    soul:Array.isArray(V320_POINT_INFO?.soul)?V320_POINT_INFO.soul.length:0,
    curse:Array.isArray(V320_POINT_INFO?.curse)?V320_POINT_INFO.curse.length:0
  },
  descriptions:{
    summon:Array.isArray(V319_SEG_DESC?.summon)?V319_SEG_DESC.summon.length:0,
    soul:Array.isArray(V319_SEG_DESC?.soul)?V319_SEG_DESC.soul.length:0,
    curse:Array.isArray(V319_SEG_DESC?.curse)?V319_SEG_DESC.curse.length:0
  }
});
})();
