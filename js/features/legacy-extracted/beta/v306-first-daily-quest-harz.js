
function v306PaintFirstDailyQuestHarz(){
 try{v109ResetDaily()}catch(e){}
 const due=!s.v109HarzDaily?.firstQuest;
 const cards=document.querySelectorAll('#questList .quest');
 if(!due){
  document.querySelectorAll('#questList .v306-first-daily-harz').forEach(el=>el.remove());
  return;
 }
 cards.forEach(card=>{
  if(card.querySelector('.v306-first-daily-harz'))return;
  const line=document.createElement('div');
  line.className='v306-first-daily-harz';
  line.textContent='🟢 Erste Quest heute: +2 Harz-Taler garantiert';
  card.appendChild(line);
 });
}
window.v306PaintFirstDailyQuestHarz=v306PaintFirstDailyQuestHarz;

const v306Line=document.querySelector('#v141VersionLine');
