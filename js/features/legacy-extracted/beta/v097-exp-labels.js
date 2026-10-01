
/* V4.02: replace quest XP star icon with clear EXP label everywhere in quest UI. */
function v097ReplaceQuestStars(){
  const root=document.querySelector('#questList');
  if(!root)return;

  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node=>{
    if(node.parentElement?.closest('.v096-quest-xp2'))return;
    if(/[⭐★☆]/.test(node.nodeValue||'')){
      node.nodeValue=node.nodeValue.replace(/[⭐★☆]\s*/g,'EXP ');
    }
  });

  /* Also make the active/running quest reward clearer if it uses the star. */
  document.querySelectorAll('#quests *').forEach(el=>{
    if(el.children.length!==0 || el.closest('.v096-quest-xp2'))return;
    if(/[⭐★☆]/.test(el.textContent||'')){
      el.textContent=el.textContent.replace(/[⭐★☆]\s*/g,'EXP ');
    }
  });
}

const v097BaseRender=render;
render=function(){
  v097BaseRender();
  
  requestAnimationFrame(v097ReplaceQuestStars);
};

document.addEventListener('click',()=>setTimeout(v097ReplaceQuestStars,40),true);
try{v097ReplaceQuestStars()}catch(e){}
