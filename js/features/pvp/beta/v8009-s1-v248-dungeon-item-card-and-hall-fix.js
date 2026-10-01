
/* ===== V4.02 two targeted fixes ===== */

/*
  Hall of Haze regression root cause:
  V4.02 replaced v073LoadRanking() after V4.02/V4.02 and forgot to call
  v074BindProfileRows(). Therefore newly rendered Hall rows had no profile
  click handler.

  Use one delegated click owner on the stable Hall container. This survives
  every ranking repaint and does not depend on which historical loader ran.
*/
function v248BindHallProfileDelegation(){
  const hall=document.querySelector('#v072HallRanking');
  if(!hall || hall.dataset.v248ProfileBound==='1')return;

  hall.dataset.v248ProfileBound='1';

  hall.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target:null;
    if(!target)return;

    /* Friend/action buttons keep their own behavior. */
    if(target.closest('button,a,input,select,textarea'))return;

    const row=target.closest(
      '.v072-player-row[data-profile-id]'
    );

    if(!row || !hall.contains(row))return;

    const id=String(row.dataset.profileId||'').trim();
    if(!id)return;

    e.preventDefault();
    e.stopPropagation();

    try{
      void v074OpenProfile(id);
    }catch(err){
      console.error('V4.02 Hall profile',err);
    }
  });
}


/*
  Repair V4.02 final Hall loader too, so both direct row handlers and the
  delegated safety handler are present.
*/
const v248BaseHallLoadRanking=v073LoadRanking;
v073LoadRanking=async function(){
  const result=await v248BaseHallLoadRanking();

  const hall=document.querySelector('#v072HallRanking');

  try{
    v248BindHallProfileDelegation();
    if(hall)v074BindProfileRows(hall);
  }catch(e){
    console.error('V4.02 Hall row binding',e);
  }

  return result;
};


/* Hall bindings follow the shared post-navigation event. */
window.addEventListener('growlegends:navigation-open-v7119',e=>{
  if(String(e?.detail?.id||'')!=='hall')return;
  try{
    v248BindHallProfileDelegation();
    const hall=document.querySelector('#v072HallRanking');
    if(hall)v074BindProfileRows(hall);
  }catch(_){}
},{passive:true});
