/* Root cause fix: old resource CSS sets the Harz <b> wrapper to font-size:0.
   The number is now a standalone DIV, so no inherited legacy wrapper can hide it. */
function v282PaintHarzCard(){
  let source=document.querySelector('#topHarz');
  let card=source?.closest('.stat') || document.querySelector('.harz-stat');
  if(!card)return;

  const amount=Math.max(0,Number(s?.harzTaler)||0);
  card.classList.add('v277-harz-card','v279-harz-card','v280-harz-card','v282-harz-card');

  /* Rebuild this tiny display card deterministically. #topHarz stays the canonical public id. */
  if(!card.querySelector('.v282-harz-count')){
    card.innerHTML=`
      <div class="v282-harz-label">HARZ-TALER</div>
      <div id="topHarz" class="v282-harz-count">${amount}</div>
      <div class="v282-harz-sub">Premium-Währung</div>`;
  }else{
    source=card.querySelector('#topHarz');
    if(source)source.textContent=amount;
  }
}

/* Stop older Harz painters from rebuilding the old hidden wrapper structure. */
v279BuildHarzCard=v282PaintHarzCard;
v281PaintHarzAmount=v282PaintHarzCard;

const v282BaseRender=render;
render=function(){
  const r=v282BaseRender();
  requestAnimationFrame(v282PaintHarzCard);
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(v282PaintHarzCard,100);
setTimeout(v282PaintHarzCard,500);
setTimeout(v282PaintHarzCard,1500);
