
/* ===== V4.02 robust dungeon world-map interaction ===== */

function v066CanOpenDungeon(i){
  const d=dungeons[i];
  if(!d)return {ok:false,msg:'Dungeon nicht gefunden.'};
  if(dungeonCompleted(i))return {ok:false,msg:`${d.name} wurde bereits abgeschlossen.`};
  if(s.level<d.minLevel)return {ok:false,msg:`Benötigt Level ${d.minLevel}.`};
  if(!dungeonUnlocked(i))return {ok:false,msg:`${d.keyName} fehlt.`};
  return {ok:true};
}

function v066OpenDungeon(i){
  const check=v066CanOpenDungeon(i);

  if(!check.ok){
    if(typeof v063Toast==='function'){
      v063Toast(check.msg,'warn');
    }else{
      console.warn(check.msg);
    }
    return;
  }

  s.dungeon.selected=i;
  s.dungeon.room=Math.max(0,Math.min(9,Number(s.dungeon.progress?.[i]??0)));
  s.dungeon.layer='dungeon';
  s.dungeon.view='map';

  localStorage.setItem(KEY,JSON.stringify(s));

  /* Phase 2: route through the single canonical Dungeon owner. */
  try{
    renderDungeon();
    window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){
    console.error('V4.02 open dungeon',e);
  }
}

function v066BindWorldNodes(){
  const map=document.querySelector('.v065-worldmap-card');
  if(!map)return;

  map.querySelectorAll('[data-v065-dungeon]').forEach(btn=>{
    const i=Number(btn.dataset.v065Dungeon);

    /* Remove any stale handler from older versions. */
    btn.onclick=null;

    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      v066OpenDungeon(i);
    },{once:false});
  });
}

/* Replace the world-map renderer with the same markup but stable click binding. */
const v066BaseRenderWorld=v065RenderWorld;
v065RenderWorld=function(){
  v066BaseRenderWorld();
  v066BindWorldNodes();

  /* Ensure dungeon 1 is visibly interactive when available. */
  const first=document.querySelector('[data-v065-dungeon="0"]');
  if(first && !dungeonCompleted(0) && s.level>=dungeons[0].minLevel){
    first.classList.remove('locked');
    first.classList.add('current');
    first.disabled=false;
    first.setAttribute('aria-label','Dungeon 1 betreten');
  }
};

const v066BaseRender=render;
render=function(){
  return v066BaseRender();
};

try{
  render();
}catch(e){
  console.error('V4.02 init',e);
}
