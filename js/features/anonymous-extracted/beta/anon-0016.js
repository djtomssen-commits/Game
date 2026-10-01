
function v070PrimaryStatKey(){
  if((s.playerClass==='grower'||s.playerClass==='frost')) return 'staerke';
  if(s.playerClass==='bruiser'||s.playerClass==='summoner') return 'intelligenz';
  if(s.playerClass==='scout') return 'geschick';
  return null;
}

function v070HighlightPrimaryAttribute(){
  const attrs=document.querySelector('#attrs');
  if(!attrs)return;

  attrs.querySelectorAll('.attr').forEach(el=>{
    el.classList.remove('v070-primary','v070-strength','v070-intelligence','v070-dexterity');
  });

  const key=v070PrimaryStatKey();
  if(!key)return;

  const target=[...attrs.querySelectorAll('.attr')].find(el=>{
    const txt=(el.textContent||'').toLowerCase();
    if(key==='staerke')return txt.includes('stärke')||txt.includes('staerke');
    if(key==='intelligenz')return txt.includes('intelligenz');
    if(key==='geschick')return txt.includes('geschick');
    return false;
  });

  if(!target)return;

  target.classList.add('v070-primary');
  if(key==='staerke')target.classList.add('v070-strength');
  if(key==='intelligenz')target.classList.add('v070-intelligence');
  if(key==='geschick')target.classList.add('v070-dexterity');
}

const v070BaseRender=render;
render=function(){
  v070BaseRender();
  v070HighlightPrimaryAttribute();
  
};

try{
  v070HighlightPrimaryAttribute();
  render();
}catch(e){
  console.error('V4.02 primary attribute',e);
}
