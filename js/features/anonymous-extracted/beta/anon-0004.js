
/* V4.02 legacy display cleanup */
(function(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const t=n.nodeValue||'';
    if(/^\s*(?:\\n\s*)+$/.test(t)) n.nodeValue='';
  });
})();
