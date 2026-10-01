(()=>{
  'use strict';
  const ART_W=941, ART_H=1672;
  const BAR={x:227,y:1421,w:474,h:39};
  let current=0;

  function layout(){
    const track=document.getElementById('v660BootTrack');
    if(!track)return;
    const vw=Math.max(1,window.innerWidth||document.documentElement.clientWidth||1);
    const vh=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);
    const scale=Math.max(vw/ART_W,vh/ART_H);
    const rw=ART_W*scale, rh=ART_H*scale;
    const ox=(vw-rw)/2, oy=(vh-rh)/2;
    track.style.left=(ox+(BAR.x+2)*scale)+'px';
    track.style.top=(oy+(BAR.y+2)*scale)+'px';
    track.style.width=Math.max(12,(BAR.w-4)*scale)+'px';
    track.style.height=Math.max(8,(BAR.h-4)*scale)+'px';
  }

  function setProgress(value){
    const n=Math.max(0,Math.min(100,Number(value)||0));
    current=Math.max(current,n);
    const fill=document.getElementById('v660BootFill');
    if(fill)fill.style.width=current+'%';
    layout();
  }

  function reset(){
    current=0;
    const fill=document.getElementById('v660BootFill');
    if(fill)fill.style.width='0%';
    layout();
  }

  window.v660LayoutBootProgress=layout;
  window.v660SetBootProgress=setProgress;
  window.v660ResetBootProgress=reset;

  requestAnimationFrame(()=>{layout();setProgress(7)});
  window.addEventListener('resize',layout,{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',layout,{passive:true});
})();
