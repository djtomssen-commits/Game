(()=>{
'use strict';
if(window.__V7103_SHARED_COMBAT_PRESENTATION__)return;
window.__V7103_SHARED_COMBAT_PRESENTATION__=true;

function isSummoner(){
  try{return String(s?.playerClass||'')==='summoner'}catch(_){return false}
}
function chance(){
  let bonus=0;
  try{
    const t=window.v314TalentSummary?.()||{};
    bonus=Math.max(0,Number(t.summonChance)||0);
  }catch(_){}
  return Math.max(.10,Math.min(.40,.10+bonus));
}
function begin(mode='combat'){
  if(!isSummoner()){
    try{window.v6287ClearSummonerVisuals?.()}catch(_){}
    return null;
  }
  const t={mode,state:{v6287NoSummon:0},chance:chance(),attacks:0};
  try{
    window.v6287EnsureRoster?.();
    window.v6287UpdateRosterState?.(t.state,t.chance,null,'Ruf aus dem Dunst bereit');
  }catch(_){}
  return t;
}
function playerEvent(e){
  return String(e?.side||'')==='player'||String(e?.actor||'')==='attacker';
}
function step(t,e){
  if(!t||!playerEvent(e))return;
  t.attacks++;
  const comp=String(e?.companion||'').toLowerCase();
  const comp2=String(e?.second_companion||'').toLowerCase();
  const forced=!!e?.forced_summon || (!comp ? false : t.state.v6287NoSummon>=4);

  if(comp){
    const before=t.state.v6287NoSummon;
    t.state.v6287NoSummon=0;
    const action=forced||before>=4
      ?`${comp.toUpperCase()} · GARANTIERTER 5. RUF`
      :`${comp.toUpperCase()}${comp2?' + 2. RUF':''}`;
    try{window.v6287UpdateRosterState?.(t.state,t.chance,comp,action)}catch(_){}
  }else{
    t.state.v6287NoSummon=Math.min(4,Math.max(0,Number(t.state.v6287NoSummon)||0)+1);
    const left=Math.max(1,5-t.state.v6287NoSummon);
    const action=t.state.v6287NoSummon>=4?'Nächster Angriff garantiert':`Kein Ruf · Garantie in ${left}`;
    try{window.v6287UpdateRosterState?.(t.state,t.chance,null,action)}catch(_){}
  }
}
function finish(t){
  if(!t)return;
  try{
    window.v6287UpdateRosterState?.(
      t.state,t.chance,null,
      `Kampf beendet · ${t.attacks} eigene Angriffe`
    );
  }catch(_){}
}
window.v7103CompanionReplay=Object.freeze({begin,step,finish});
window.v7103CombatPresentationDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  summoner:isSummoner(),
  roster:!!document.querySelector('.v6287-summon-roster'),
  battleStage:!!document.querySelector('.battle-stage'),
  pvpStage:!!document.querySelector('#v209PvpBattleOverlay .battle-stage')
});
})();
