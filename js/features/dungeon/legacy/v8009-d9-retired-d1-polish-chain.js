/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D9. DO NOT LOAD.
   Final visible D1 behavior migrated into v8009-d8-detail-decorator.js;
   canonical thumb ownership remains in v8009-d2-visual-owner.js. */

/* ===== RETIRED v454-d1-feinschliff-script ===== */
(function(){
  'use strict';
  if(window.__V454_D1_FEINSCHLIFF__)return;
  window.__V454_D1_FEINSCHLIFF__=true;
  const P=['assets/v7195-base64/4583d2c2217b99d15b91.jpg', 'assets/v7195-base64/ee919763875facf5b3b6.jpg', 'assets/v7195-base64/8712de00a158f959e38a.jpg', 'assets/v7195-base64/4f6fc6c1c7ccefde4135.jpg', 'assets/v7195-base64/bedd65f73777c8416b0c.jpg', 'assets/v7195-base64/f8536ecfcfdd643284f0.jpg', 'assets/v7195-base64/5bd000a5fade11346630.jpg', 'assets/v7195-base64/862f132710f1a1fdbefb.jpg', 'assets/v7195-base64/7f0b7b112e9c10916051.jpg', 'assets/v7195-base64/0f1a0253845b46d9a03d.jpg'];
  try{
    if(Array.isArray(window.V064_D1_NAMES)){}
  }catch(e){}
  try{
    /* const-Array ist selbst unveränderlich gebunden, seine Einträge aber schon. */
    if(typeof V064_D1_NAMES!=='undefined' && Array.isArray(V064_D1_NAMES)){
      V064_D1_NAMES[0]='Blattkriecher';
      V064_D1_NAMES[1]='Wurzelbeißer';
      V064_D1_NAMES[2]='Spinnmilben-Brut';
      V064_D1_NAMES[3]='Kleeblattkriecher';
      V064_D1_NAMES[4]='Netzjäger';
      V064_D1_NAMES[5]='Giftspringer';
      V064_D1_NAMES[6]='Brutwächter';
      V064_D1_NAMES[7]='Kellerweber';
      V064_D1_NAMES[8]='Kokonhüter';
      V064_D1_NAMES[9]='Milbenkönigin';
    }
    const icons=['🪰','🐛','🍄','🌿','🕷️','🐸','🐛','🕷️','🥚','🕷️'];
    dungeons?.[0]?.enemies?.forEach((e,i)=>{
      if(typeof V064_D1_NAMES!=='undefined'&&V064_D1_NAMES[i])e.name=V064_D1_NAMES[i];
      if(icons[i])e.icon=icons[i];
    });
  }catch(e){console.warn('V4.254 D1 data',e)}

  function decorate(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;
      const title=card.querySelector('.v261-title');
      if(title && title.innerHTML!=='DER VERSEUCHTE<br>KELLER')title.innerHTML='DER VERSEUCHTE<br>KELLER';
      let ri=0;
      try{ri=Math.max(0,Math.min(9,Number(v048RoomIndex?.(0))||0))}catch(e){}
      const thumb=card.querySelector('.v261-thumb');
      if(thumb){
        thumb.textContent='';
        const want=`url("${P[ri]}")`;
        if(thumb.style.backgroundImage!==want)thumb.style.backgroundImage=want;
      }
    }catch(e){}
  }

  /* Kein MutationObserver: nur nach echten Render-Aktionen dekorieren. */
  const funcs=['v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap'];
  funcs.forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn==='function'&&!fn.__v454D1Decor){
        const base=fn;
        const wrap=function(){const out=base.apply(this,arguments);requestAnimationFrame(decorate);return out};
        wrap.__v454D1Decor=true;
        window[name]=wrap;
        try{if(name==='v251RenderDetail')v251RenderDetail=wrap;if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrap}catch(e){}
      }
    }catch(e){}
  });
  requestAnimationFrame(decorate);
  document.addEventListener('click',()=>setTimeout(decorate,40),true);
})();

/* ===== RETIRED v458-d1-road-and-sign-final ===== */
(function(){
  'use strict';
  function paintD1(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;
      const pts='15,12 26,14 40,17 54,19 67,22 77,25 84,31 72,36 56,39 36,40 15,42 24,47 36,52 47,57 57,61 67,57 76,53 83,48 86,43 83,55 81,68 80,82';
      card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points',pts));
      const sign=card.querySelector('.v261-signboard');
      if(sign)sign.innerHTML='ACHTUNG<br>VERSEUCHTER KELLER<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
      const title=card.querySelector('.v261-title');
      if(title)title.innerHTML='DER<br>VERSEUCHTE<br>KELLER';
    }catch(e){}
  }
  requestAnimationFrame(paintD1);
  document.addEventListener('click',()=>setTimeout(paintD1,35),true);
  window.addEventListener('pageshow',()=>setTimeout(paintD1,60),{passive:true});
  try{
    const fn=window.v426RenderDetail;
    if(typeof fn==='function'&&!fn.__v458D1Paint){
      const base=fn;
      const wrap=function(){const out=base.apply(this,arguments);requestAnimationFrame(paintD1);return out};
      wrap.__v458D1Paint=true;
      window.v426RenderDetail=wrap;
    }
  }catch(e){}
})();

/* ===== RETIRED v459-d1-right-side-thumb-final-script ===== */
(function(){
  'use strict';
  if(window.__V459_D1_FINAL__)return;
  window.__V459_D1_FINAL__=true;

  function paint(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;

      /* Pfad exakt durch die jetzt entzerrten Knoten führen. */
      const pts='15,12 27,14 40,17 54,19 67,22 76,24 82,28 71,35 55,39 34,40 15,42 25,47 36,52 46,57 56,62 65,59 73,55 80,50 84,46 82,58 81,70 80,83';
      card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points',pts));

      /* Untere aktuelle Gegner-Kachel wieder sichtbar. */
      let ri=0;
      try{ri=Math.max(0,Math.min(9,Number(v048RoomIndex?.(0))||0))}catch(e){}
      const thumb=card.querySelector('.v261-thumb');
      if(thumb){
        const icon=dungeons?.[0]?.enemies?.[ri]?.icon||'👹';
        if(thumb.textContent!==icon)thumb.textContent=icon;
        thumb.style.setProperty('background-image','none','important');
        thumb.style.setProperty('color','#fff','important');
      }

      /* langer Name ohne unnötigen Bindestrich */
      try{
        if(dungeons?.[0]?.enemies?.[3])dungeons[0].enemies[3].name='Kleeblattkriecher';
      }catch(e){}
      const n4=card.querySelector('[data-v261-room="3"] .v261-name');
      if(n4)n4.textContent='Kleeblattkriecher';
    }catch(e){}
  }

  requestAnimationFrame(paint);
  document.addEventListener('click',()=>setTimeout(paint,35),true);
  window.addEventListener('pageshow',()=>setTimeout(paint,60),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(paint,50)},{passive:true});

  /* Nur nach echten D1-Rendern nachmalen; kein MutationObserver. */
  ['v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap'].forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn==='function'&&!fn.__v459D1Paint){
        const base=fn;
        const wrap=function(){const out=base.apply(this,arguments);requestAnimationFrame(paint);return out};
        wrap.__v459D1Paint=true;
        window[name]=wrap;
        try{if(name==='v251RenderDetail')v251RenderDetail=wrap;if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrap}catch(e){}
      }
    }catch(e){}
  });
})();

/* ===== RETIRED v460-d1-thumb-owner-fix-script ===== */
(function(){
  'use strict';
  if(window.__V460_D1_THUMB_OWNER__)return;
  window.__V460_D1_THUMB_OWNER__=true;

  function paintThumb(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;

      let ri=0;
      try{ri=Math.max(0,Math.min(9,Number(v048RoomIndex?.(0))||0))}catch(e){}

      const thumb=card.querySelector('.v261-thumb');
      const ring=card.querySelector(`[data-v261-room="${ri}"] .v261-ring`);
      if(!thumb||!ring)return;

      const bg=getComputedStyle(ring).backgroundImage;
      if(bg && bg!=='none'){
        thumb.textContent='';
        thumb.style.setProperty('background-image',bg,'important');
        thumb.style.setProperty('background-size','cover','important');
        thumb.style.setProperty('background-position','center center','important');
        thumb.style.setProperty('background-repeat','no-repeat','important');
      }else{
        const icon=dungeons?.[0]?.enemies?.[ri]?.icon||'👹';
        thumb.style.setProperty('background-image','none','important');
        thumb.style.setProperty('color','#fff','important');
        thumb.style.setProperty('font-size','30px','important');
        thumb.textContent=icon;
      }
    }catch(e){}
  }

  function schedule(){
    requestAnimationFrame(()=>{
      paintThumb();
      setTimeout(paintThumb,70); /* nach alten D1-Dekorierern final übernehmen */
    });
  }

  schedule();
  window.addEventListener('pageshow',()=>setTimeout(paintThumb,90),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(paintThumb,90)},{passive:true});
  document.addEventListener('click',()=>setTimeout(paintThumb,90),true);

  ['v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap'].forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn==='function'&&!fn.__v460D1Thumb){
        const base=fn;
        const wrap=function(){const out=base.apply(this,arguments);schedule();return out};
        wrap.__v460D1Thumb=true;
        window[name]=wrap;
        try{if(name==='v251RenderDetail')v251RenderDetail=wrap;if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrap}catch(e){}
      }
    }catch(e){}
  });
})();

/* ===== RETIRED v461-d1-node9-collision-fix-script ===== */
(function(){
  'use strict';
  if(window.__V461_D1_NODE9__)return;
  window.__V461_D1_NODE9__=true;

  function paint(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;
      /* Pfad durch die finalen D1-Positionen: 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> Boss. */
      const pts='15,12 27,14 40,17 54,19 67,22 76,24 82,27 70,34 53,38 33,40 15,42 25,47 36,52 46,57 56,62 64,59 72,55 80,53 90,49 87,60 83,71 80,83';
      card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points',pts));
    }catch(e){}
  }

  requestAnimationFrame(paint);
  document.addEventListener('click',()=>setTimeout(paint,45),true);
  window.addEventListener('pageshow',()=>setTimeout(paint,70),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(paint,60)},{passive:true});

  ['v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap'].forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn==='function'&&!fn.__v461D1Paint){
        const base=fn;
        const wrap=function(){const out=base.apply(this,arguments);requestAnimationFrame(paint);return out};
        wrap.__v461D1Paint=true;
        window[name]=wrap;
        try{if(name==='v251RenderDetail')v251RenderDetail=wrap;if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrap}catch(e){}
      }
    }catch(e){}
  });
})();

/* ===== RETIRED v463-d1-screenshot-polish-script ===== */
(function(){
  'use strict';
  if(window.__V463_D1_POLISH__)return;
  window.__V463_D1_POLISH__=true;

  function paint(){
    try{
      const card=document.getElementById('dungeonMapCard');
      if(!card?.classList.contains('v426-ref-d1'))return;
      /* Weg an die neuen D1-Screenshot-Positionen anpassen. */
      const pts='14,15 28,17 43,19 56,21 67,23 77,26 83,31 71,35 56,39 37,43 19,49 30,54 40,61 49,68 57,75 66,70 74,64 81,58 89,50 86,62 83,74 80,85';
      card.querySelectorAll('.v261-road polyline').forEach(el=>el.setAttribute('points',pts));
    }catch(e){}
  }

  requestAnimationFrame(paint);
  document.addEventListener('click',()=>setTimeout(paint,45),true);
  window.addEventListener('pageshow',()=>setTimeout(paint,70),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(paint,60)},{passive:true});

  ['v426RenderDetail','v251RenderDetail','v244RenderSelectedDungeonMap'].forEach(name=>{
    try{
      const fn=window[name];
      if(typeof fn==='function'&&!fn.__v463D1Paint){
        const base=fn;
        const wrap=function(){const out=base.apply(this,arguments);requestAnimationFrame(paint);return out};
        wrap.__v463D1Paint=true;
        window[name]=wrap;
        try{if(name==='v251RenderDetail')v251RenderDetail=wrap;if(name==='v244RenderSelectedDungeonMap')v244RenderSelectedDungeonMap=wrap}catch(e){}
      }
    }catch(e){}
  });
})();
