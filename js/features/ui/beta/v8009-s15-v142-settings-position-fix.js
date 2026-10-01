function v142PositionSettings(){
  const btn=document.querySelector('#v141SettingsBtn');
  const menu=document.querySelector('#v141SettingsMenu');
  if(!btn||!menu||!menu.classList.contains('open'))return;

  const b=btn.getBoundingClientRect();
  const margin=8;
  const w=Math.min(330,window.innerWidth-margin*2);

  /* bevorzugt rechts am Zahnrad ausrichten, aber niemals aus dem Bildschirm */
  let left=b.right-w;
  left=Math.max(margin,Math.min(left,window.innerWidth-w-margin));

  let top=b.bottom+8;
  const estimated=Math.min(menu.scrollHeight||430,window.innerHeight-margin*2);
  if(top+estimated>window.innerHeight-margin){
    top=Math.max(margin,b.top-estimated-8);
  }

  menu.style.left=left+'px';
  menu.style.top=top+'px';
  menu.style.right='auto';
  menu.style.maxHeight=(window.innerHeight-top-margin)+'px';
  menu.style.overflowY='auto';
}

const v142OldBuild=v141BuildSettings;
v141BuildSettings=function(){
  const r=v142OldBuild();
  const btn=document.querySelector('#v141SettingsBtn');
  if(btn && !btn.dataset.v142bound){
    btn.dataset.v142bound='1';
    btn.addEventListener('click',()=>requestAnimationFrame(v142PositionSettings));
  }
  return r;
};

window.addEventListener('resize',v142PositionSettings,{passive:true});
window.addEventListener('scroll',v142PositionSettings,{passive:true});

const v142BaseRender=render;
render=function(){
  const r=v142BaseRender();
  
  requestAnimationFrame(v142PositionSettings);
  return r;
};
setTimeout(v142PositionSettings,250);
