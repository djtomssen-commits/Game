
(function(){
  function paint(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;
      const title=card.querySelector('.v261-title');
      if(title)title.innerHTML='DER<br>VERSEUCHTE<br>KELLER';
    }catch(e){}
  }
  requestAnimationFrame(paint);
  document.addEventListener('click',()=>setTimeout(paint,35),true);
})();
