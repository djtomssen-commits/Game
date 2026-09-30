from pathlib import Path

# Patch beta.html: export the existing canonical V420 Level-Up presenter and
# expose a completion promise from its already-existing hide timer.
p=Path('beta.html')
s=p.read_text(encoding='utf-8')
old="""  let hideTimer=0;

  function stamp(){}

  function show(oldLevel,newLevel){
    if(!(newLevel>oldLevel))return;"""
new="""  let hideTimer=0;
  let levelDone=Promise.resolve();

  function stamp(){}

  function show(oldLevel,newLevel){
    if(!(newLevel>oldLevel))return Promise.resolve(false);"""
if old not in s: raise SystemExit('v420 head not found')
s=s.replace(old,new,1)
old2="""    document.body.appendChild(ov);
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>ov.remove(),3600);
    try{if(typeof v063Toast==='function')v063Toast('🎉 Level Up!','success',`Du bist jetzt Level ${newLevel}.`)}catch(e){}
  }

  /* Final owner:"""
new2="""    document.body.appendChild(ov);
    clearTimeout(hideTimer);
    levelDone=new Promise(resolve=>{
      hideTimer=setTimeout(()=>{ov.remove();resolve(true)},3600);
    });
    try{if(typeof v063Toast==='function')v063Toast('🎉 Level Up!','success',`Du bist jetzt Level ${newLevel}.`)}catch(e){}
    return levelDone;
  }
  window.v420ShowLevelUp=show;
  window.v420LevelUpDone=()=>levelDone;

  /* Final owner:"""
if old2 not in s: raise SystemExit('v420 body not found')
s=s.replace(old2,new2,1)
p.write_text(s,encoding='utf-8')

# Patch v7045: detect server-confirmed level increase before applyBundle,
# present level-up through V420, await its existing lifecycle, then show reward.
p=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js')
s=p.read_text(encoding='utf-8')
old3=""" const before=(()=>{try{return typeof v235RewardSnapshot==='function'?v235RewardSnapshot(q):{q:clone(q),gold:Number(s.gold)||0,harz:Number(s.harzTaler)||0,inventory:(s.inventory||[]).map(itemId)}}catch(_){return{q:clone(q)}}})();"""
new3=""" const before=(()=>{try{
  const snap=typeof v235RewardSnapshot==='function'?v235RewardSnapshot(q):{q:clone(q),gold:Number(s.gold)||0,harz:Number(s.harzTaler)||0,inventory:(s.inventory||[]).map(itemId)};
  snap.level=Math.max(1,Number(s.level)||1);
  return snap;
 }catch(_){return{q:clone(q),level:Math.max(1,Number(s?.level)||1)}}})();"""
if old3 not in s: raise SystemExit('v7045 before snapshot not found')
s=s.replace(old3,new3,1)
old4="""  const rewardOnly=clone(b)||{};delete rewardOnly.active;
  applyBundle(rewardOnly);
  try{await canonicalQuestState(true)}catch(_){}
  markQuestSideEffects(runId,q,b);"""
new4="""  const rewardOnly=clone(b)||{};delete rewardOnly.active;
  const oldLevel=Math.max(1,Number(before?.level)||Number(s.level)||1);
  const newLevel=Math.max(1,Number(rewardOnly.level)||oldLevel);
  applyBundle(rewardOnly);
  try{await canonicalQuestState(true)}catch(_){}
  if(newLevel>oldLevel){
   try{
    if(typeof window.v420ShowLevelUp==='function')await Promise.resolve(window.v420ShowLevelUp(oldLevel,newLevel));
   }catch(e){console.warn('[V7045] level-up presentation',e)}
  }
  markQuestSideEffects(runId,q,b);"""
if old4 not in s: raise SystemExit('v7045 claim apply block not found')
s=s.replace(old4,new4,1)
p.write_text(s,encoding='utf-8')
