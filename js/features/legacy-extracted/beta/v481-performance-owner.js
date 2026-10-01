
(function(){
  const VERSION='V4.81',SHORT='V4.81';
  function stamp(){}
  function visibility(){try{document.documentElement.classList.toggle('v481-hidden',document.hidden)}catch(e){}}
  visibility();stamp();
  document.addEventListener('visibilitychange',()=>{visibility();if(!document.hidden){try{if(typeof v229UpdateQuestTimer==='function')v229UpdateQuestTimer()}catch(e){}try{if(typeof v239UpdateGrowLive==='function')v239UpdateGrowLive()}catch(e){}try{if(typeof v324Paint==='function')v324Paint()}catch(e){}stamp()}},{passive:true});
  document.addEventListener('DOMContentLoaded',()=>{visibility();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{visibility();stamp()},{passive:true});
  window.__V481_PERFORMANCE__={version:VERSION,itemArtCache:true,duplicateLiveTickRetired:true,fullGrowSecondRenderRetired:true,backgroundAnimationsPaused:true};
})();
