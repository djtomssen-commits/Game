const v266WarClassByName=new Map();

function v266NormName(x){return String(x||'').trim().toLowerCase()}

function v266WarClassForName(name){
  const key=v266NormName(name);
  if(v266WarClassByName.has(key))return v266WarClassByName.get(key);

  // Synthetic V4.02 test opponents get proper class artwork too.
  if(key==='kush-krusher')return 'grower';
  if(key==='bong-berserker')return 'bruiser';

  // Own current character always uses the real selected class.
  try{
    const ownNames=[
      s?.characterName,s?.character_name,
      window.v073Profile?.character_name,
      window.v073UserProfile?.character_name
    ].filter(Boolean).map(v266NormName);
    if(ownNames.includes(key))return s.playerClass||'grower';
  }catch(e){}

  return 'grower';
}

function v266WeaponFor(name,cls){
  const key=v266NormName(name);
  try{
    const ownNames=[
      s?.characterName,s?.character_name,
      window.v073Profile?.character_name,
      window.v073UserProfile?.character_name
    ].filter(Boolean).map(v266NormName);
    if(ownNames.includes(key) && typeof v253EquippedWeapon==='function'){
      return v253EquippedWeapon().icon||'';
    }
  }catch(e){}
  return cls==='scout'?'🏹':(cls==='bruiser'||cls==='summoner')?'🪄':cls==='frost'?'⚔️':'🪓';
}

const v266OldSetFighter=v265SetFighter;
v265SetFighter=function(el,name,level,power,hp,maxhp,side){
  v266OldSetFighter(el,name,level,power,hp,maxhp,side);
  const cls=v266WarClassForName(name);
  const src=typeof v080AvatarFor==='function'?v080AvatarFor(cls):'';
  const avatar=el.querySelector('.v265-avatar');
  if(avatar && src){
    const weapon=v266WeaponFor(name,cls);
    avatar.innerHTML=`<img src="${src}" alt="${v254GuildEsc(name||'Kämpfer')}">${weapon?`<span class="v266-weapon">${weapon}</span>`:''}`;
  }
};

const v266OldWatchWar=v262WatchWar;
v262WatchWar=async function(){
  // Real wars include user ids in duel records. Resolve their class ids before replay.
  try{
    const ids=[...new Set(v262WarDuels.flatMap(d=>[d.attacker_user_id,d.defender_user_id]).filter(Boolean))];
    if(ids.length && v073Db){
      const {data,error}=await v073Db.from('profiles').select('id,character_name,class_id').in('id',ids);
      if(!error && Array.isArray(data)){
        data.forEach(x=>{
          if(x?.character_name)v266WarClassByName.set(v266NormName(x.character_name),x.class_id||'grower');
        });
      }
    }
    // Always force the current character's real class by name where possible.
    const own=v262WarDuels.flatMap(d=>[
      {id:d.attacker_user_id,name:d.attacker_name},
      {id:d.defender_user_id,name:d.defender_name}
    ]).find(x=>x.id && window.v073User?.id && String(x.id)===String(v073User.id));
    if(own?.name)v266WarClassByName.set(v266NormName(own.name),s.playerClass||'grower');
  }catch(e){console.info('V4.02 avatar lookup fallback',e)}
  return v266OldWatchWar();
};
