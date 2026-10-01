/* ===== V4.02 Central Grow Legends dialog system ===== */
function v115EnsureUi(){
  if(document.querySelector('#v115UiOverlay'))return;
  const ov=document.createElement('div');
  ov.id='v115UiOverlay';ov.className='v115-ui-overlay';
  ov.innerHTML=`<div class="v115-ui-card" id="v115UiCard">
    <div class="v115-ui-icon" id="v115UiIcon">🌿</div>
    <div class="v115-ui-title" id="v115UiTitle">Grow Legends</div>
    <div class="v115-ui-text" id="v115UiText"></div>
    <div class="v115-ui-actions" id="v115UiActions">
      <button class="btn secondary" id="v115UiCancel">Abbrechen</button>
      <button class="btn gold" id="v115UiOk">Bestätigen</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}
function v115Icon(type){
  return type==='success'?'✅':type==='warn'?'⚠️':type==='error'?'❌':type==='confirm'?'❓':'🌿';
}
function v115Show({title='Grow Legends',text='',type='info',confirmMode=false,okText='OK',cancelText='Abbrechen'}={}){
  v115EnsureUi();
  return new Promise(resolve=>{
    const ov=document.querySelector('#v115UiOverlay');
    const card=document.querySelector('#v115UiCard');
    const actions=document.querySelector('#v115UiActions');
    const ok=document.querySelector('#v115UiOk');
    const cancel=document.querySelector('#v115UiCancel');

    card.className=`v115-ui-card ${type}`;
    document.querySelector('#v115UiIcon').textContent=v115Icon(type);
    document.querySelector('#v115UiTitle').textContent=title;
    document.querySelector('#v115UiText').textContent=String(text??'');
    ok.textContent=okText;
    cancel.textContent=cancelText;

    actions.classList.toggle('single',!confirmMode);
    cancel.style.display=confirmMode?'block':'none';
    ov.classList.add('show');

    const done=value=>{
      ov.classList.remove('show');
      ok.onclick=null;cancel.onclick=null;
      resolve(value);
    };
    ok.onclick=()=>done(true);
    cancel.onclick=()=>done(false);
  });
}
function v115Alert(message,title='Hinweis',type='info'){
  v115Show({title,text:String(message??''),type,confirmMode:false,okText:'OK'});
}
function v115Confirm(message,opts={}){
  return v115Show({
    title:opts.title||'Bestätigen',
    text:String(message??''),
    type:opts.type||'confirm',
    confirmMode:true,
    okText:opts.okText||'Bestätigen',
    cancelText:opts.cancelText||'Abbrechen'
  });
}

/* New global standard for future systems. */
window.GL_UI={
  info:(title,text)=>v115Show({title,text,type:'info'}),
  success:(title,text)=>v115Show({title,text,type:'success'}),
  warn:(title,text)=>v115Show({title,text,type:'warn'}),
  error:(title,text)=>v115Show({title,text,type:'error'}),
  confirm:(title,text,okText='Bestätigen')=>v115Confirm(text,{title,okText})
};

/* Current admin confirmations migrated to the global standard. */
window.v093DeleteEvent=async(id)=>{
  if(!v093IsAdmin)return;
  if(!(await v115Confirm('Dieses Event wirklich dauerhaft löschen?',{title:'Event löschen',type:'warn',okText:'Löschen'})))return;
  await v073Db.from('game_events').delete().eq('id',id);
  await v093AdminLoadLists();await v093LoadPublicContent();
};
window.v093DeleteNews=async(id)=>{
  if(!v093IsAdmin)return;
  if(!(await v115Confirm('Diese Update-News wirklich dauerhaft löschen?',{title:'News löschen',type:'warn',okText:'Löschen'})))return;
  await v073Db.from('game_news').delete().eq('id',id);
  await v093AdminLoadLists();await v093LoadPublicContent();
};

/* Player admin save migrated. */
const v115OldAdminSave=v103SavePlayer;
v103SavePlayer=async function(){
  if(!v093IsAdmin||!v103SelectedPlayer)return;
  const payload={
    target_user:v103SelectedPlayer.user_id,
    new_level:v103Number('#v103Level',1,999),
    new_xp:v103Number('#v103Xp',0,2000000000),
    new_gold:v103Number('#v103Gold',0,2000000000),
    new_harz_taler:v103Number('#v103Harz',0,2000000000),
    new_energy:v103Number('#v103Energy',0,300),
    new_points:v103Number('#v103Points',0,2000000000),
    new_skill_points:v103Number('#v103SkillPoints',0,2000000000)
  };
  const ok=await v115Confirm(
    `Level ${payload.new_level}\nGold ${payload.new_gold}\nHarz-Taler ${payload.new_harz_taler}`,
    {title:`Spielerwerte ändern – ${v103SelectedPlayer.character_name}`,type:'warn',okText:'Speichern'}
  );
  if(!ok)return;
  const {error}=await v073Db.rpc('admin_update_player_values',payload);
  if(error)return v063Toast('Änderung fehlgeschlagen','error',error.message);
  v063Toast('Spielerwerte gespeichert','success',`${v103SelectedPlayer.character_name} wurde aktualisiert.`);
  await v103LoadPlayer(v103SelectedPlayer.user_id);
};

/* Reward confirmation migrated. */
v105SendReward=async function(){
  if(!v093IsAdmin||!v103SelectedPlayer)return;
  const gold=v103Number('#v105RewardGold',0,2000000000);
  const harz=v103Number('#v105RewardHarz',0,2000000000);
  const seeds=v103Number('#v105RewardSeeds',0,1000000);
  if(gold===0&&harz===0&&seeds===0)return v063Toast('Keine Belohnung gewählt','warn','Trage mindestens einen Wert ein.');
  const ok=await v115Confirm(
    `Gold: +${gold}\nHarz-Taler: +${harz}\nLegendäre Samen: +${seeds}`,
    {title:`Belohnung an ${v103SelectedPlayer.character_name}`,okText:'Belohnung senden'}
  );
  if(!ok)return;
  const {error}=await v073Db.rpc('admin_grant_player_reward',{
    target_user:v103SelectedPlayer.user_id,add_gold:gold,add_harz_taler:harz,add_legendary_seeds:seeds
  });
  if(error)return v063Toast('Belohnung fehlgeschlagen','error',error.message);
  document.querySelector('#v105RewardGold').value=0;
  document.querySelector('#v105RewardHarz').value=0;
  document.querySelector('#v105RewardSeeds').value=0;
  v063Toast('🎁 Belohnung gesendet','success',`${v103SelectedPlayer.character_name} erhält die Belohnung.`);
  await v103LoadPlayer(v103SelectedPlayer.user_id);
};

/* Worldboss retry uses exactly the same global dialog now. */
v114AskRetry=function(){
  return v115Confirm(
    `Dein kostenloser Weltboss-Versuch für heute wurde bereits benutzt.\n\nAktuell: ${s.harzTaler||0} Harz-Taler`,
    {title:'Weiteren Versuch starten?',type:'warn',okText:'10 Harz-Taler nutzen'}
  );
};

document.addEventListener('DOMContentLoaded',v115EnsureUi,{once:true});
window.addEventListener('growlegends:account-ready',v115EnsureUi,{passive:true});
