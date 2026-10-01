
/* The Harz DOM is now static HTML. Do not rebuild its innerHTML at runtime. */
v279BuildHarzCard=function(){
  const value=document.querySelector('#topHarz');
  const card=value?.closest('.stat');
  if(!card)return;
  card.classList.add('v277-harz-card','v279-harz-card','v280-harz-card');
};

/* Final resource normalization: no DOM replacement, only stable classes/state. */
const v280BaseRender=render;
render=function(){
  const r=v280BaseRender();
  requestAnimationFrame(()=>{
    v279BuildHarzCard();
    v271PaintDampf();
  });
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{v279BuildHarzCard();v271PaintDampf()}catch(e){}
  
  const line=document.querySelector('#v141VersionLine');
},300);
