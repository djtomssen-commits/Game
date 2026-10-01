/* One canonical class-stat ownership layer:
   Barbar=grower -> Stärke, Schütze=scout -> Geschick, Magier=bruiser -> Intelligenz.
   Ausdauer=HP for all, Glück=crit for all. */
function v267PrimaryKey(cls=s.playerClass){
  return cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke';
}
function v267PrimaryStat(){
  return Number(totalAttr(v267PrimaryKey()))||0;
}
function v267CritChance(){
  return Math.min(60,5+(Number(totalAttr('glueck'))||0)*0.35);
}
function v267CritMultiplier(){
  return 1.5+Math.min(.75,(Number(totalAttr('glueck'))||0)*0.004);
}

/* Canonical combat power and HP used by current combat systems that call these globals. */
combatPower=function(){
  return Math.round(
    v267PrimaryStat()*6 +
    (Number(totalAttr('ausdauer'))||0)*2 +
    (Number(totalAttr('glueck'))||0) +
    (Number(s.level)||1)*6
  );
};
maxHp=function(){
  const base=80+(Number(totalAttr('ausdauer'))||0)*8+(Number(s.level)||1)*5;
  return Math.round(base*(1+(typeof setBonusValue==='function'?Number(setBonusValue('hpPct'))||0:0)));
};

/* Preserve old helper name so Dungeon/PvP/Guild systems relying on it get the same primary stat. */
try{window.v029PrimaryStat=v267PrimaryStat}catch(e){}

/* V8.009: attribute DOM ownership moved to v4140.
   Combat stat helpers above remain canonical. */

/* Combat/profile readers consume these helpers directly; no global render kick is required. */
