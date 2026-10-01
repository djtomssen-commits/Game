
/* ===== V4.02 map labels and layout polish ===== */

function v044AddWorldRegions(){
  const map=document.querySelector('#v032WorldMap');
  if(!map || map.querySelector('.v044-region'))return;

  const regions=[
    ['Dorfkern',48,6],
    ['Tavernenviertel',14,22],
    ['Händlergasse',67,31],
    ['Grow-Bezirk',17,48],
    ['Verseuchte Grenze',62,57],
    ['Eventwiese',20,74],
    ['Schwarzes Brett',55,86]
  ];

  regions.forEach(([name,left,top])=>{
    const el=document.createElement('div');
    el.className='v044-region';
    el.style.left=left+'%';
    el.style.top=top+'%';
    el.textContent=name;
    map.appendChild(el);
  });
}

function v044AddDungeonRegions(){
  const map=document.querySelector('#dungeonSelect');
  if(!map || map.querySelector('.v044-dungeon-region'))return;

  const regions=[
    ['Grünhains Rand',10,5],
    ['Verlassene Keller',60,18],
    ['Verseuchte Felder',20,36],
    ['Sporenlande',62,53],
    ['Nebelgrenze',18,70],
    ['Schwarze Zitadelle',57,88]
  ];

  regions.forEach(([name,left,top])=>{
    const el=document.createElement('div');
    el.className='v044-dungeon-region';
    el.style.left=left+'%';
    el.style.top=top+'%';
    el.textContent=name;
    map.appendChild(el);
  });
}

/* Give map cards dedicated title strips */
function v044MapTitles(){
  const w=document.querySelector('#world .card');
  if(w && !w.querySelector('.v044-map-head')){
    const h=document.createElement('div');
    h.className='v044-map-head';
    h.style.cssText='margin:-6px -4px 10px;padding:9px 11px;border-radius:12px;background:linear-gradient(180deg,#1b2a1e,#101813);border:1px solid #354f37;font-size:11px;font-weight:1000;letter-spacing:.08em;color:#c8d9c3';
    h.textContent='🗺️ GRÜNHAIN · WELTKARTE';
    w.insertBefore(h,w.firstChild);
  }
}

const v044BaseRender=render;
render=function(){
  v044BaseRender();
  
  v044AddWorldRegions();
  v044AddDungeonRegions();
  v044MapTitles();
};

try{
  render();
}catch(e){console.error('V4.02 map overhaul',e);}
