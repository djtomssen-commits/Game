
function v205InstallBudScale(){
  const rules=document.querySelector('#pvp .v204-rules');
  if(!rules || document.querySelector('#v205BudScale'))return;

  const box=document.createElement('div');
  box.id='v205BudScale';
  box.className='v205-bud-scale';
  box.innerHTML=`
    <b>🌿 PvP-Bud-Belohnung bei einem Sieg</b>
    <div class="v205-bud-grid">
      <div class="v205-bud-tier"><strong>+1</strong><span>Gegner schwächer / bis 95 %</span></div>
      <div class="v205-bud-tier"><strong>+2</strong><span>96–105 % deiner Kraft</span></div>
      <div class="v205-bud-tier"><strong>+3</strong><span>106–120 % deiner Kraft</span></div>
      <div class="v205-bud-tier"><strong>+4</strong><span>121–140 % deiner Kraft</span></div>
      <div class="v205-bud-tier"><strong>+5</strong><span>über 140 % deiner Kraft</span></div>
    </div>`;
  rules.insertAdjacentElement('afterend',box);
}

const v205BaseRender=render;
render=function(){
  const r=v205BaseRender();
  
  requestAnimationFrame(v205InstallBudScale);
  return r;
};

setTimeout(v205InstallBudScale,200);
