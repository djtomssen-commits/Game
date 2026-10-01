(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  const COMBAT=['staerke','geschick','intelligenz','ausdauer','glueck'];
  const PRICE_MULT={gray:1,green:1.45,blue:2.35,purple:4.6,orange:7.2,cyan:10};
  const RARITY_MAP={
    common:'gray','common-gray':'gray',uncommon:'green',rare:'blue',
    epic:'purple',legendary:'orange',mythic:'cyan','mystic-cyan':'cyan'
  };

  function quality(it){
    const q=String(it?.quality||'').toLowerCase();
    if(PRICE_MULT[q])return q;
    return RARITY_MAP[String(it?.rarity||'').toLowerCase()]||'gray';
  }
  function enchantOf(it){
    return it?.enchant || (Array.isArray(it?.enchants)?it.enchants[0]:null) || null;
  }
  function baseStatTotal(it){
    const locked=it?.v429StatLock?.native;
    if(locked&&typeof locked==='object'){
      return COMBAT.reduce((n,k)=>n+Math.max(0,Number(locked[k])||0),0);
    }
    let total=COMBAT.reduce((n,k)=>n+Math.max(0,Number(it?.bonus?.[k])||0),0);
    /* Sockets/stat scrolls improve combat, but should not become a Gold-printing loop. */
    if(it?.gem?.stat&&COMBAT.includes(it.gem.stat))total-=Math.max(0,Number(it.gem.value)||0);
    const e=enchantOf(it);
    if(e?.effect==='luck')total-=Math.max(0,Number(e.value)||0);
    return Math.max(0,total);
  }

  /* Sale economy: about 2% of an equivalent merchant price. The old formula paid
     several thousand Gold for high-level drops and made selling loot the dominant
     income source. Purchase prices, quest rewards and dungeon rewards stay untouched. */
  function saleValue(it){
    if(!it)return 0;
    const q=quality(it);
    const lvl=Math.max(1,Math.floor(Number(it.dropLevel)||Number(s?.level)||1));
    const stats=baseStatTotal(it);
    const knownPrice=Math.max(0,Number(it.price)||0);
    const estimatedPrice=Math.max(30,Math.round((35+lvl*12+stats*11)*(PRICE_MULT[q]||1)));
    const reference=knownPrice>0?knownPrice:estimatedPrice;
    return Math.max(5,Math.round(reference*0.02));
  }
  try{sellValue=saleValue}catch(e){}
  try{window.sellValue=saleValue}catch(e){}
  window.v442SellValue=saleValue;

  function moveInventory(){
    const inv=document.querySelector('#character #inventory');
    const card=inv?.closest('.card');
    const attrs=document.querySelector('#character #attrs');
    const bottom=attrs?.closest('.char-bottom');
    if(!card||!attrs||!bottom)return false;
    card.classList.add('v442-inventory-card');
    if(card.parentElement!==bottom || card.nextElementSibling!==attrs){
      bottom.insertBefore(card,attrs);
    }
    return true;
  }
  window.v442MoveInventory=moveInventory;

  /* Remove literal old patch artifacts such as "\\n" / "\\n\\n" or "n/n/"
     when they exist as standalone visible text nodes. Never touches script/style text. */
  function cleanArtifacts(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const bad=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent||['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName))continue;
      const t=String(node.nodeValue||'');
      if(/^\s*(?:\\n\s*)+$/i.test(t) || /^\s*\/?n\s*\/\s*n\s*\/?\s*$/i.test(t))bad.push(node);
    }
    bad.forEach(node=>{node.nodeValue=''});
  }
  window.v442CleanArtifacts=cleanArtifacts;

  function stamp(){}

  /* Keep the requested order after any historical render wrapper runs. */
  if(typeof render==='function'&&!window.__v442RenderWrapped){
    const baseRender=render;
    render=function(){
      const r=baseRender.apply(this,arguments);
      moveInventory();
      cleanArtifacts();
      stamp();
      return r;
    };
    try{window.render=render}catch(e){}
    window.__v442RenderWrapped=true;
  }

  function refreshVisiblePrices(){
    try{if(typeof renderInventory==='function')renderInventory()}catch(e){console.warn('V4.42 inventory price repaint',e)}
    /* Equipment price labels are rendered by the main render path; one safe boot pass
       updates them to the new sale formula as well. */
    try{if(typeof render==='function')render()}catch(e){console.warn('V4.42 character repaint',e)}
    moveInventory();cleanArtifacts();stamp();
  }

  moveInventory();cleanArtifacts();stamp();
  document.addEventListener('DOMContentLoaded',refreshVisiblePrices,{once:true});
  window.addEventListener('pageshow',()=>{moveInventory();cleanArtifacts();stamp()},{passive:true});
  setTimeout(refreshVisiblePrices,250);
  setTimeout(()=>{moveInventory();cleanArtifacts();stamp()},1600);
  setTimeout(()=>{moveInventory();cleanArtifacts();stamp()},5200); /* V4.123: removed useless late clear of already-fired one-shot timeout. */
})();
