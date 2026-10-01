/* ===== V4.02 single Harz amount + Dampf event wording ===== */

function v283CleanHarzAmount(){
  const card=document.querySelector('.harz-stat');
  if(!card)return;

  /* Remove all obsolete duplicate amount nodes created by older delayed timers. */
  card.querySelectorAll('.v281-harz-amount').forEach(x=>x.remove());

  /* Ensure there is exactly one canonical #topHarz node. */
  const all=[...card.querySelectorAll('#topHarz')];
  all.slice(1).forEach(x=>x.remove());

  let amount=card.querySelector('#topHarz');
  if(!amount || !amount.classList.contains('v282-harz-count')){
    const value=Math.max(0,Number(s?.harzTaler)||0);
    card.innerHTML=`
      <div class="v282-harz-label">HARZ-TALER</div>
      <div id="topHarz" class="v282-harz-count">${value}</div>
      <div class="v282-harz-sub">Premium-Währung</div>`;
    amount=card.querySelector('#topHarz');
  }

  if(amount)amount.textContent=Math.max(0,Number(s?.harzTaler)||0);
}

/* V8.009: Dampf DOM ownership moved fully to v284; v283 owns Harz only. */
/* Point every later Harz repair call to the same canonical cleaner. */
v282PaintHarzCard=v283CleanHarzAmount;
v279BuildHarzCard=v283CleanHarzAmount;
v281PaintHarzAmount=v283CleanHarzAmount;

const v283BaseRender=render;
render=function(){
  const r=v283BaseRender();
  requestAnimationFrame(v283CleanHarzAmount);
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

/* Run after all old delayed Harz callbacks have fired, then clean once more. */
setTimeout(v283CleanHarzAmount,250);
setTimeout(v283CleanHarzAmount,1100);
setTimeout(v283CleanHarzAmount,1800);


const v283Line=document.querySelector('#v141VersionLine');
