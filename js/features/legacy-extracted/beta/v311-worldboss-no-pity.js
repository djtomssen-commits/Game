
/* ===== V4.02 Smaragd-Koloss: pity protection removed =====
   Gear/readiness balance remains. Losses no longer make the boss weaker. */
const v311BaseWorldBossModel=v290WorldBossModel;
v290WorldBossModel=function(){
 const m=v311BaseWorldBossModel();
 m.pitySteps=0;
 m.pityDamage=1;
 return m;
};
const v311BaseBossState=v290EnsureWorldBossState;
v290EnsureWorldBossState=function(){
 const wb=v311BaseBossState();
 if(wb)wb.lossStreak=0;
 return wb;
};
const v311BaseBossRefresh=v110Refresh;
v110Refresh=function(){
 const r=v311BaseBossRefresh();
 const box=document.querySelector('#v290BossBalance');
 if(box){
   box.innerHTML=box.innerHTML
    .replace(/<br><b>Der Koloss zeigt nach deinen Niederlagen erste Schwächen\.<\/b>/g,'');
 }
 return r;
};
/* V8.009 Worldboss powerblock: the global render hook is retired.
   v290EnsureWorldBossState is already wrapped above and zeroes the legacy streak
   whenever the worldboss state is actually accessed. */
window.addEventListener('growlegends:account-ready',()=>{
 try{v290EnsureWorldBossState()}catch(e){}
},{passive:true});
