function v302EnsureDungeonProgress(){
 s.dungeon=(s.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
 s.dungeon.progress=(s.dungeon.progress&&typeof s.dungeon.progress==='object')?s.dungeon.progress:{};
 s.dungeon.completed=Array.isArray(s.dungeon.completed)?s.dungeon.completed.map(Number):[];
 s.dungeon.unlocked=Array.isArray(s.dungeon.unlocked)?s.dungeon.unlocked.map(Number):[0];
 for(let i=0;i<dungeons.length;i++){
  s.dungeon.progress[i]=Math.max(0,Math.min(9,Number(s.dungeon.progress[i])||0));
 }
}
function v302RepairReportedDungeon3(){
 v302EnsureDungeonProgress();
 if(s.v302DungeonProgressRepaired)return false;
 const unlocked=!!s.dungeon.keys?.[2]||s.dungeon.unlocked.includes(2);
 const completed=s.dungeon.completed.includes(2);
 if(unlocked&&!completed&&Number(s.dungeon.progress[2])===9){
  s.dungeon.progress[2]=0;
  if(Number(s.dungeon.selected)===2)s.dungeon.room=0;
  s.v302DungeonProgressRepaired=true;
  try{persist(false)}catch(e){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
  try{v063Toast?.('Dungeon 3 korrigiert','success','Dungeon 3 startet jetzt bei Gegner 1/10.')}catch(e){}
  return true;
 }
 s.v302DungeonProgressRepaired=true;
 return false;
}
/* V8.009: v067OpenDungeon wrapper retired; final V467 opener syncs room from progress. */
const v302BaseGoBattle=v048GoBattle;
v048GoBattle=function(i){
 i=Number(i);v302EnsureDungeonProgress();
 s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon.progress[i])||0));
 return v302BaseGoBattle(i);
};
window.selectDungeon=v048GoBattle;
v302RepairReportedDungeon3();

const v302Line=document.querySelector('#v141VersionLine');
