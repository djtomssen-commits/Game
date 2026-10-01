
function v281PaintHarzAmount(){
  const source=document.querySelector('#topHarz');
  const card=source?.closest('.stat');
  if(!card)return;

  const amount=Number(s.harzTaler)||0;
  source.textContent=amount;

  let visible=card.querySelector('.v281-harz-amount');
  if(!visible){
    visible=document.createElement('div');
    visible.className='v281-harz-amount';

    const label=card.querySelector('.v280-harz-label,.v279-resource-label');
    if(label)label.insertAdjacentElement('afterend',visible);
    else card.appendChild(visible);
  }
  visible.textContent=amount;
}

const v281BaseRender=render;
render=function(){
  const r=v281BaseRender();
  requestAnimationFrame(v281PaintHarzAmount);
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(v281PaintHarzAmount,200);
setTimeout(v281PaintHarzAmount,900);
