(()=>{
  'use strict';
  if(window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__)return;
  window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__=true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(v)||0)));
  const clean=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const assetRoot='v474_dungeon_assets';
  const ASSET_REV='v7162-exact-assets';
  /* V7.162: exact file contract. No cache-query aliases: the game uses the files
     that already exist in v474_dungeon_assets verbatim. */
  const plainAsset=path=>String(path||'').split('?')[0];
  const liveAsset=path=>plainAsset(path);
  const preloadCache=new Map();
  function preloadAsset(path){
    path=String(path||'');
    if(!path)return Promise.resolve(false);
    if(preloadCache.has(path))return preloadCache.get(path);
    const task=new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>resolve(true);
      img.onerror=()=>{
        const plain=plainAsset(path);
        if(plain&&plain!==path){
          const retry=new Image();retry.decoding='async';retry.onload=()=>resolve(true);retry.onerror=()=>resolve(false);retry.src=plain;
        }else resolve(false);
      };
      img.src=path;
    });
    preloadCache.set(path,task);
    return task;
  }

  function gameDungeon(di){
    try{return window.dungeons?.[di]||dungeons?.[di]||null}catch(_){return null}
  }
  function baseCfg(di){
    try{return window.__V468_CFG__?.[String(di+1)]||window.__V468_CFG__?.[di+1]||null}catch(_){return null}
  }
  function cfgFor(di){
    const number=clamp(di,0,19)+1;
    const raw=baseCfg(di)||{};
    const gd=gameDungeon(di);
    const enemyNames=Array.isArray(raw.enemy)&&raw.enemy.length?raw.enemy:(gd?.enemies||[]).slice(0,9).map(e=>clean(e?.short||e?.name));
    const bossName=clean(raw.boss||gd?.enemies?.[9]?.short||gd?.enemies?.[9]?.name||'Boss');
    return{
      ...raw,
      number,
      title:raw.title||gd?.name||gd?.title||`Dungeon ${number}`,
      enemy:enemyNames,
      boss:bossName,
      /* V7.160: one file contract for every Dungeon. The 10-room map and combat
         both use the images from v474_dungeon_assets; no embedded emoji/legacy boss
         art is allowed to win visually anymore. */
      bg:liveAsset(`${assetRoot}/d${number}_bg.jpg`),
      art:Array.from({length:9},(_,i)=>liveAsset(`${assetRoot}/d${number}_${i+1}.png`)),
      /* Packaged boss PNGs exist only for D10-D20. D1-D9 must not request
         missing files: use their existing bossArt when available. D2 has a
         repository-verified legacy SVG fallback. */
      bossFallback:raw.bossArt||(
        number===1?'assets/v7195-base64/0f1a0253845b46d9a03d.jpg':
        number===2?'assets/v7195-base64/10036d96d08155bdc84a.svg':''
      ),
      bossArt:number>=10
        ?liveAsset(`${assetRoot}/d${number}_boss.png`)
        :liveAsset(raw.bossArt||(
          number===1?'assets/v7195-base64/0f1a0253845b46d9a03d.jpg':
          number===2?'assets/v7195-base64/10036d96d08155bdc84a.svg':''
        ))
    };
  }
  function assetFor(c,ri){return c?(ri===9?c.bossArt:c.art?.[ri]):''}
  function fallbackFor(c,ri){return c&&ri===9?String(c.bossFallback||''):''}

  function setMapNodeArt(ring,art,fallback=''){
    if(!ring||!art)return false;
    /* V8.009 D5: preserve the already visible legacy art until the canonical
       image has actually loaded. The former code blanked the ring first and
       then hid the <img> on error, which produced the black/empty map seen on D2. */
    try{
      const legacy=getComputedStyle(ring).backgroundImage;
      if(legacy&&legacy!=='none'&&!ring.dataset.glLegacyBg)ring.dataset.glLegacyBg=legacy;
    }catch(_){}
    let img=ring.querySelector(':scope > .gl-dungeon-node-art');
    const activateCanonical=()=>{
      img.hidden=false;
      img.dataset.glPlainRetry='0';img.dataset.glFallbackRetry='0';
      delete ring.dataset.glAssetFallback;
      ring.style.setProperty('background-image','none','important');
      ring.querySelectorAll(':scope > .v261-bossart').forEach(n=>n.style.setProperty('display','none','important'));
      [...ring.childNodes].forEach(n=>{if(n!==img&&n.nodeType===Node.TEXT_NODE&&clean(n.nodeValue))n.remove()});
    };
    const restoreLegacy=()=>{
      img.hidden=true;
      ring.dataset.glAssetFallback='legacy';
      const legacy=String(ring.dataset.glLegacyBg||'');
      if(legacy&&legacy!=='none')ring.style.setProperty('background-image',legacy,'important');
      else ring.style.removeProperty('background-image');
      ring.querySelectorAll(':scope > .v261-bossart').forEach(n=>n.style.setProperty('display','block','important'));
    };
    if(!img){
      img=document.createElement('img');img.className='gl-dungeon-node-art';img.alt='Dungeon Gegner';img.decoding='async';img.draggable=false;img.hidden=true;
      img.addEventListener('load',activateCanonical);
      img.addEventListener('error',()=>{
        const current=img.getAttribute('src')||'';
        if(current.includes('?gl=')&&img.dataset.glPlainRetry!=='1'){
          img.dataset.glPlainRetry='1';img.setAttribute('src',plainAsset(current));return;
        }
        if(fallback&&img.dataset.glFallbackRetry!=='1'){
          img.dataset.glFallbackRetry='1';img.setAttribute('src',fallback);return;
        }
        restoreLegacy();
      });
      ring.insertBefore(img,ring.firstChild);
    }
    img.dataset.glPlainRetry='0';img.dataset.glFallbackRetry='0';
    if(img.getAttribute('src')!==art){img.hidden=true;img.setAttribute('src',art)}
    else if(img.complete&&img.naturalWidth>0)activateCanonical();
    else if(img.complete&&img.naturalWidth===0)restoreLegacy();
    return true;
  }

  function dungeonIndex(){
    try{const pv=window.__v453AllDungeonPreview;if(pv?.active)return clamp(pv.target,0,19)}catch(_){ }
    try{if(typeof window.v048DungeonIndex==='function')return clamp(window.v048DungeonIndex(),0,19)}catch(_){ }
    try{if(Number.isInteger(window.__GL_LIVE_DUNGEON_INDEX__))return clamp(window.__GL_LIVE_DUNGEON_INDEX__,0,19)}catch(_){ }
    try{return clamp(window.s?.dungeon?.selected??s?.dungeon?.selected??0,0,19)}catch(_){return 0}
  }
  function roomIndex(di){
    try{if(typeof window.v048RoomIndex==='function')return clamp(window.v048RoomIndex(di),0,9)}catch(_){ }
    try{return clamp(window.s?.dungeon?.progress?.[di]??s?.dungeon?.progress?.[di]??window.s?.dungeon?.room??s?.dungeon?.room??0,0,9)}catch(_){return 0}
  }
  function important(el,prop,val){if(el)el.style.setProperty(prop,val,'important')}

  function setCurrentThumbImage(thumb,art,fallback='👹'){
    if(!thumb)return false;
    art=String(art||'');
    fallback=String(fallback||'👹');
    important(thumb,'overflow','hidden');
    important(thumb,'padding','0');
    important(thumb,'background-color','#071008');
    important(thumb,'background-size','contain');
    important(thumb,'background-position','center center');
    important(thumb,'background-repeat','no-repeat');
    if(art)important(thumb,'background-image',`url("${plainAsset(art)}")`);

    let img=thumb.querySelector(':scope > .gl-dungeon-current-thumb-img');
    if(!img){
      [...thumb.childNodes].forEach(n=>n.remove());
      img=document.createElement('img');
      img.className='gl-dungeon-current-thumb-img';
      img.alt='Dungeon Gegner';
      img.decoding='async';
      img.draggable=false;
      img.style.cssText='display:block;width:100%;height:100%;object-fit:contain;object-position:center center;pointer-events:none;';
      img.addEventListener('load',()=>{
        img.hidden=false;img.dataset.glPlainRetry='0';
        thumb.querySelector(':scope > .gl-dungeon-current-thumb-fallback')?.remove();
      });
      img.addEventListener('error',()=>{
        const current=img.getAttribute('src')||'';
        if(current.includes('?gl=')&&img.dataset.glPlainRetry!=='1'){
          img.dataset.glPlainRetry='1';
          img.setAttribute('src',plainAsset(current));
          return;
        }
        img.hidden=true;
        let fb=thumb.querySelector(':scope > .gl-dungeon-current-thumb-fallback');
        if(!fb){fb=document.createElement('span');fb.className='gl-dungeon-current-thumb-fallback';fb.style.cssText='display:grid;width:100%;height:100%;place-items:center;font-size:24px;line-height:1;';thumb.appendChild(fb)}
        fb.textContent=img.dataset.glFallback||fallback;
      });
      thumb.appendChild(img);
    }
    img.dataset.glFallback=fallback;
    if(art&&img.getAttribute('src')!==art){img.hidden=false;img.dataset.glPlainRetry='0';img.setAttribute('src',art)}
    else if(img.complete&&img.naturalWidth>0)img.hidden=false;
    return true;
  }
  window.glSetDungeonThumbImage=setCurrentThumbImage;

  function playerMeta(){
    let cls='grower';
    try{cls=String(window.s?.playerClass??s?.playerClass??'grower').toLowerCase()}catch(_){ }
    if(cls==='barbar'||cls==='barbarian')cls='grower';
    const map={
      grower:{name:'Bud-Barbar',fallback:'🪓'},
      scout:{name:'Blatt-Schütze',fallback:'🏹'},
      bruiser:{name:'Bong-Magier',fallback:'🪄'},
      frost:{name:'Bekiffter Frost-Todesritter',fallback:'❄️'},
      summoner:{name:'Harzruferin',fallback:'🕯️'}
    };
    return{cls,...(map[cls]||map.grower)};
  }
  function playerAvatarSrc(cls){
    try{if(typeof window.v080AvatarFor==='function'){const u=window.v080AvatarFor(cls);if(u)return String(u)}}catch(_){ }
    try{if(typeof v080AvatarFor==='function'){const u=v080AvatarFor(cls);if(u)return String(u)}}catch(_){ }
    try{if(typeof V080_AVATARS!=='undefined'&&V080_AVATARS?.[cls])return String(V080_AVATARS[cls])}catch(_){ }
    return'';
  }
  function paintPlayer(){
    const player=document.getElementById('playerFighter');
    const avatar=player?.querySelector('.fighter-avatar');
    if(!player||!avatar)return false;
    const meta=playerMeta(),src=playerAvatarSrc(meta.cls);

    important(player,'display','block');important(player,'visibility','visible');important(player,'opacity','1');
    important(avatar,'visibility','visible');important(avatar,'opacity','1');
    player.classList.remove('v600-barbar');
    /* V6.216: remove every historical direct artwork node before canonical paint.
       This includes the ancient .v41-enemy-art portrait that caused the visible
       small second Barbar next to the current full-size player artwork. */
    let existingCanonical=avatar.querySelector(':scope > img.gl-dungeon-player-art,:scope > img.v253-player-avatar-img');
    let existingFallback=avatar.querySelector(':scope > .gl-dungeon-player-fallback');
    [...avatar.children].forEach(n=>{
      if(n===existingCanonical||n===existingFallback)return;
      n.remove();
    });
    [...avatar.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&clean(n.nodeValue))n.remove()});

    let fallback=existingFallback;
    const showFallback=()=>{
      if(!fallback){fallback=document.createElement('div');fallback.className='gl-dungeon-player-fallback';avatar.appendChild(fallback)}
      fallback.textContent=meta.fallback;fallback.hidden=false;
    };
    const hideFallback=()=>{if(fallback)fallback.hidden=true};

    let img=avatar.querySelector(':scope > .v253-player-avatar-img');
    if(src&&!img){
      img=document.createElement('img');img.className='v253-player-avatar-img gl-dungeon-player-art';
      img.alt=meta.name;img.decoding='async';img.draggable=false;avatar.prepend(img);
    }
    if(img){
      img.classList.add('gl-dungeon-player-art');img.alt=meta.name;img.hidden=false;
      img.style.removeProperty('display');img.style.removeProperty('visibility');img.style.removeProperty('opacity');
      img.onload=()=>{img.hidden=false;hideFallback()};
      img.onerror=()=>{img.hidden=true;showFallback()};
      if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src);
      else if(img.complete&&img.naturalWidth>0)hideFallback();
    }
    if(!src)showFallback();
    try{window.v253EnsureWeaponNode?.(player)}catch(_){ }
    return true;
  }

  function paintDungeonOneBattle(card,stage,ri){
    const enemy=document.getElementById('enemyFighter');
    const avatar=enemy?.querySelector('.fighter-avatar');
    if(!enemy||!avatar)return false;
    card.classList.add('gl-dungeon-real-visual');
    /* Dungeon 1 already contains approved embedded enemy pictures in its map
       nodes. Reuse the current room picture instead of deleting the legacy art. */
    const node=document.querySelector(`#dungeonMapCard .v261-node[data-v261-room="${ri}"]`);
    const artSource=ri===9
      ?(node?.querySelector('.v261-bossart')||node?.querySelector('.v261-ring'))
      :node?.querySelector('.v261-ring');
    let bg='';
    try{bg=artSource?getComputedStyle(artSource).backgroundImage:''}catch(_){bg=''}
    if(bg&&bg!=='none'){
      let art=avatar.querySelector(':scope > .gl-dungeon-d1-art');
      if(!art){art=document.createElement('div');art.className='gl-dungeon-d1-art';avatar.appendChild(art)}
      art.style.setProperty('background-image',bg,'important');
      enemy.classList.add('gl-dungeon-enemy-ready');
      return true;
    }
    /* Never leave the opponent completely blank even if a historical D1
       renderer did not create its art yet. */
    if(!avatar.querySelector('img,.v253-monster,.v573-enemy-art,.v574-enemy-art,.v599-treant-art,.v600-treant-art,.gl-dungeon-d1-art')){
      let fb=avatar.querySelector(':scope > .gl-dungeon-enemy-fallback-icon');
      if(!fb){fb=document.createElement('div');fb.className='gl-dungeon-enemy-fallback-icon';fb.textContent='👹';fb.style.cssText='display:grid;place-items:center;width:100%;height:100%;font-size:92px;filter:drop-shadow(0 14px 10px #000)';avatar.appendChild(fb)}
    }
    return false;
  }

  function paintMap(){
    const card=document.getElementById('dungeonMapCard');
    if(!card)return;
    const di=dungeonIndex(),ri=roomIndex(di),c=cfgFor(di);
    if(!c)return;
    card.classList.add('gl-dungeon-canonical-map');
    card.dataset.glDungeonVisual=String(di+1);

    const stage=card.querySelector('.v261-stage');
    const oldBg=stage?.querySelector(':scope > .v261-bg');
    if(stage){
      /* V8.009 D5: capture the already working background before any later
         cleanup/style layer can hide it. It becomes the hard fallback when
         v474_dungeon_assets is unavailable on the served Beta route. */
      try{
        const legacy=oldBg?getComputedStyle(oldBg).backgroundImage:getComputedStyle(stage).backgroundImage;
        if(legacy&&legacy!=='none'&&!stage.dataset.glLegacyMapBg)stage.dataset.glLegacyMapBg=legacy;
      }catch(_){}
      important(stage,'background-size','cover');
      important(stage,'background-position','center center');
      important(stage,'background-repeat','no-repeat');
      preloadAsset(c.bg);
      let bgImg=stage.querySelector(':scope > .gl-dungeon-map-bg-img');
      const activateCanonicalBg=()=>{
        bgImg.hidden=false;bgImg.dataset.glPlainRetry='0';
        delete stage.dataset.glMapBgError;delete stage.dataset.glMapFallback;
        important(stage,'background-image','none');
        if(oldBg){important(oldBg,'display','none');important(oldBg,'background-image','none')}
      };
      const restoreLegacyBg=()=>{
        bgImg.hidden=true;
        stage.dataset.glMapFallback='legacy';
        const legacy=String(stage.dataset.glLegacyMapBg||'');
        if(legacy&&legacy!=='none')important(stage,'background-image',legacy);
        if(oldBg)important(oldBg,'display','block');
      };
      if(!bgImg){
        bgImg=document.createElement('img');
        bgImg.className='gl-dungeon-map-bg-img';
        bgImg.alt='';
        bgImg.decoding='async';
        bgImg.draggable=false;
        bgImg.hidden=true;
        bgImg.addEventListener('error',()=>{
          const current=bgImg.getAttribute('src')||'';
          if(current.includes('?gl=')&&bgImg.dataset.glPlainRetry!=='1'){
            bgImg.dataset.glPlainRetry='1';
            bgImg.setAttribute('src',plainAsset(current));
            return;
          }
          stage.dataset.glMapBgError=current;
          restoreLegacyBg();
        });
        bgImg.addEventListener('load',activateCanonicalBg);
        stage.insertBefore(bgImg,stage.firstChild);
      }
      if(bgImg.getAttribute('src')!==c.bg){bgImg.dataset.glPlainRetry='0';bgImg.hidden=true;bgImg.setAttribute('src',c.bg)}
      else if(bgImg.complete&&bgImg.naturalWidth>0)activateCanonicalBg();
      else if(bgImg.complete&&bgImg.naturalWidth===0)restoreLegacyBg();
      /* Preload the room opponent while the player is on the 10-room map so
         entering combat does not expose a legacy emoji or a blank frame. */
      preloadAsset(assetFor(c,ri));
    }

    for(let room=0;room<10;room++){
      const node=card.querySelector(`.v261-node[data-v261-room="${room}"]`);
      const ring=node?.querySelector('.v261-ring');
      if(!ring)continue;
      const art=room===9?c.bossArt:c.art[room];
      const fallback=fallbackFor(c,room);
      preloadAsset(art);
      if(fallback)preloadAsset(fallback);
      setMapNodeArt(ring,art,fallback);
      node.dataset.glDungeonAsset=plainAsset(art);
      if(fallback)node.dataset.glDungeonFallback=plainAsset(fallback);
    }

    const thumb=card.querySelector('.v261-thumb');
    if(thumb){
      let fallback='👹';
      try{fallback=clean(gameDungeon(di)?.enemies?.[ri]?.icon)||fallback}catch(_){ }
      setCurrentThumbImage(thumb,assetFor(c,ri),fallback);
    }

    /* Phase 2.3: the V4.251 detail panel has its own small opponent portrait.
       It was not part of the v261 thumbnail path, so the canonical visual owner
       left that box empty after the old render wrappers were retired. */
    const detailThumb=card.querySelector('.v251-current-icon');
    if(detailThumb){
      const art=assetFor(c,ri);
      let fallback='👹';
      try{fallback=clean(gameDungeon(di)?.enemies?.[ri]?.icon)||fallback}catch(_){ }
      detailThumb.textContent='';
      important(detailThumb,'overflow','hidden');
      important(detailThumb,'padding','0');
      important(detailThumb,'background-image',`url("${plainAsset(art)}")`);
      important(detailThumb,'background-size','contain');
      important(detailThumb,'background-position','center center');
      important(detailThumb,'background-repeat','no-repeat');
      preloadAsset(art);
      let img=detailThumb.querySelector(':scope > .gl-dungeon-detail-thumb-img');
      if(!img){
        img=document.createElement('img');
        img.className='gl-dungeon-detail-thumb-img';
        img.alt=ri===9?'Dungeon Boss':'Dungeon Gegner';
        img.decoding='async';
        img.draggable=false;
        img.style.cssText='display:block;width:100%;height:100%;object-fit:contain;object-position:center center;pointer-events:none;';
        img.addEventListener('load',()=>{img.hidden=false;img.dataset.glPlainRetry='0';detailThumb.textContent='';detailThumb.appendChild(img)});
        img.addEventListener('error',()=>{
          const current=img.getAttribute('src')||'';
          if(current.includes('?gl=')&&img.dataset.glPlainRetry!=='1'){
            img.dataset.glPlainRetry='1';
            img.setAttribute('src',plainAsset(current));
            return;
          }
          img.remove();
          detailThumb.style.removeProperty('background-image');
          detailThumb.textContent=fallback;
        });
        detailThumb.appendChild(img);
      }
      if(img.getAttribute('src')!==art){img.dataset.glPlainRetry='0';img.hidden=false;img.setAttribute('src',art)}
    }

    /* V8.009 D8: one canonical post-render decorator owns the remaining
       D1/D6/D7 map-specific title/sign/position polish. */
    try{window.v8009DungeonDetailDecorate?.()}catch(e){console.warn('[V8.009 D8] detail decorate',e)}
  }

  function removeLegacyBattleVisuals(stage,avatar,enemy){
    stage.querySelectorAll(':scope > .v599-template-bg,:scope > .v600-bg,:scope > .v602-duel-panel,:scope > .v602-side-decor').forEach(n=>n.remove());
    /* D2-D20 have audited assets. Legacy generated monsters/emoji are not a
       fallback anymore because they cause the visible old-art flash. */
    avatar?.querySelectorAll(':scope > .v253-monster,:scope > .v573-enemy-art,:scope > .v574-enemy-art,:scope > .v599-treant-art,:scope > .v600-treant-art,:scope > .gl-dungeon-enemy-fallback-icon').forEach(n=>n.remove());
  }

  function paintBattle(){
    const card=document.getElementById('dungeonBattleCard');
    const stage=document.getElementById('battleStage');
    if(!card||!stage||card.style.display==='none')return;
    const di=dungeonIndex(),ri=roomIndex(di);
    card.classList.add('gl-dungeon-canonical-battle','gl-dungeon-real-visual');
    card.dataset.glDungeonVisual=String(di+1);
    card.dataset.glDungeonRoom=String(ri+1);
    paintPlayer();
    /* V7.160: no dedicated D1/legacy fight branch. Every Dungeon uses the same
       external background + opponent asset contract. */
    const c=cfgFor(di);
    if(!c)return;
    const art=assetFor(c,ri);
    const enemy=document.getElementById('enemyFighter');
    const avatar=enemy?.querySelector('.fighter-avatar');

    removeLegacyBattleVisuals(stage,avatar,enemy);

    /* Direct image element owns the arena background. This bypasses every old
       background-image/blur rule on .battle-stage and its legacy canvases. */
    important(stage,'background-image','none');
    let bgImg=stage.querySelector(':scope > .gl-dungeon-battle-bg-img');
    if(!bgImg){
      bgImg=document.createElement('img');
      bgImg.className='gl-dungeon-battle-bg-img';
      bgImg.alt='';
      bgImg.decoding='async';
      bgImg.draggable=false;
      bgImg.addEventListener('error',()=>{stage.dataset.glBattleBgError=bgImg.getAttribute('src')||''});
      bgImg.addEventListener('load',()=>{delete stage.dataset.glBattleBgError});
      stage.insertBefore(bgImg,stage.firstChild);
    }
    if(bgImg.getAttribute('src')!==c.bg)bgImg.setAttribute('src',c.bg);

    if(enemy&&avatar){
      /* The canonical image is the only visual source inside the enemy avatar.
         This prevents a surviving legacy background-image from showing an old monster. */
      important(avatar,'background-image','none');
      important(avatar,'background-color','transparent');
      [...avatar.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&clean(n.nodeValue))n.remove()});
      let img=avatar.querySelector(':scope > .gl-dungeon-enemy-art');
      if(!img){
        img=document.createElement('img');
        img.className='gl-dungeon-enemy-art';
        img.alt='Dungeon Gegner';
        img.decoding='async';
        img.draggable=false;
        img.addEventListener('error',()=>{
          const current=img.getAttribute('src')||'';
          /* Some worker/static routes dislike the cache query. Retry the exact
             packaged asset path once before falling back to the old visual. */
          if(current.includes('?gl=')&&img.dataset.glPlainRetry!=='1'){
            img.dataset.glPlainRetry='1';
            img.hidden=false;
            img.setAttribute('src',current.split('?')[0]);
            return;
          }
          const fallback=fallbackFor(c,ri);
          if(fallback&&img.dataset.glFallbackRetry!=='1'){
            img.dataset.glFallbackRetry='1';img.hidden=false;img.setAttribute('src',fallback);return;
          }
          img.hidden=true;
          enemy.classList.remove('gl-dungeon-enemy-ready');
          enemy.classList.add('gl-dungeon-enemy-fallback');
          avatar.dataset.glAssetError=current;
        });
        img.addEventListener('load',()=>{
          img.hidden=false;
          img.dataset.glPlainRetry='0';
          enemy.classList.add('gl-dungeon-enemy-ready');
          enemy.classList.remove('gl-dungeon-enemy-fallback');
          delete avatar.dataset.glAssetError;
        });
        avatar.appendChild(img);
      }
      if(img.getAttribute('src')!==art){
        enemy.classList.remove('gl-dungeon-enemy-fallback');
        const wantedArt=art;
        /* Do not blank a healthy current image while a new room asset is being
           decoded. The map preloader normally makes this immediate. */
        preloadAsset(wantedArt).then(ok=>{
          if(!ok)return;
          const liveDi=dungeonIndex(),liveRi=roomIndex(liveDi),liveCfg=cfgFor(liveDi);
          if(!liveCfg||assetFor(liveCfg,liveRi)!==wantedArt)return;
          img.hidden=false;
          img.dataset.glPlainRetry='0';
          if(img.getAttribute('src')!==wantedArt)img.setAttribute('src',wantedArt);
        });
        if(!img.getAttribute('src')){
          img.hidden=false;
          img.dataset.glPlainRetry='0';
          img.setAttribute('src',wantedArt);
        }
      }else if(img.complete&&img.naturalWidth>0){
        enemy.classList.add('gl-dungeon-enemy-ready');
      }
      enemy.classList.add('gl-dungeon-real-enemy');
    }

    const wanted=clean(ri===9?c.boss:c.enemy?.[ri]);
    const enemyName=document.getElementById('enemyBattleName');
    if(enemyName&&wanted&&clean(enemyName.textContent)!==wanted)enemyName.textContent=wanted;
    const heading=document.getElementById('enemyName');
    if(heading&&wanted&&clean(heading.textContent)!==wanted)heading.textContent=wanted;
  }

  let raf=0,timer=0;
  function sync(){raf=0;paintMap();paintBattle()}
  window.glDungeonVisualRefresh=sync;
  function queue(settle=true){
    if(!raf)raf=requestAnimationFrame(sync);
    if(settle){clearTimeout(timer);timer=setTimeout(sync,80)}
  }

  /* ===== Phase 2: ONE ACTIVE DUNGEON RENDER OWNER =====
     The historic renderDungeon chain still exists in the file for compatibility,
     but it is no longer executed during normal play. This dispatcher calls the
     current world-map, detail-map and battle owners directly. */
  const legacyRenderDungeon=(()=>{try{return window.renderDungeon||renderDungeon}catch(_){return null}})();
  window.__GL_LEGACY_RENDER_DUNGEON_CHAIN__=legacyRenderDungeon;
  const renderStats={calls:0,world:0,map:0,battle:0,reward:0,deduped:0,fallbacks:0,errors:0,last:''};
  let renderBusy=false,lastRenderSig='',lastRenderAt=0;

  function currentState(){
    try{
      const layer=s?.dungeon?.layer==='world'?'world':'dungeon';
      const view=String(s?.dungeon?.view||'map');
      const di=Math.max(0,Math.min(19,Number(s?.dungeon?.selected)||0));
      const ri=Math.max(0,Math.min(9,Number(s?.dungeon?.progress?.[di]??s?.dungeon?.room??0)||0));
      return{layer,view,di,ri,sig:`${layer}|${view}|${di}|${ri}`};
    }catch(_){return{layer:'world',view:'map',di:0,ri:0,sig:'world|map|0|0'}}
  }

  function repairBeforeRender(){
    try{window.v4158RepairDungeonState?.('canonical-render',false)}catch(_){ }
    try{
      const changed=window.v433RepairDungeonState?.(true);
      if(changed&&typeof KEY!=='undefined')localStorage.setItem(KEY,JSON.stringify(s));
    }catch(_){ }
  }

  function renderWorldDirect(){
    renderStats.world++;
    const screen=document.getElementById('dungeon');
    /* v230-world-open is a WORLD-ONLY CSS state. It contains an !important rule
       that hides #dungeonBattleCard, so the canonical owner must manage it explicitly. */
    if(screen)screen.classList.add('v230-world-open');
    const fn=window.v251RenderWorld||window.gl20RenderWorld||window.v065RenderWorld;
    if(typeof fn!=='function')throw new Error('Aktueller 20er-Dungeon-Renderer fehlt');
    return fn();
  }

  function renderMapDirect(){
    renderStats.map++;
    const screen=document.getElementById('dungeon');
    if(screen)screen.classList.remove('v230-world-open');
    const fn=window.__V7166_CANONICAL_DETAIL__||window.v261RenderDetail||window.v251RenderDetail||window.v244RenderSelectedDungeonMap||window.v064RenderMap;
    if(typeof fn!=='function')throw new Error('Aktueller 10er-Dungeon-Renderer fehlt');
    const out=fn();
    /* Sprint 2: v4165 no longer wraps four historical detail renderers.
       Stamp the actually rendered Dungeon directly from the canonical path. */
    try{window.v4165StampDetail?.()}catch(_){ }
    /* V7.162: the canonical asset pass runs in the SAME turn as the map build.
       No historic delayed renderer gets a visible frame in between. */
    paintMap();
    /* Sprint 2: v7166 stays as a repair utility, not a renderer wrapper. */
    try{window.v7166DungeonDetailRepair?.('canonical-map')}catch(_){ }
    return out;
  }

  function renderBattleDirect(view){
    if(view==='reward')renderStats.reward++;else renderStats.battle++;
    const screen=document.getElementById('dungeon');
    /* Critical Phase 2.1 regression fix: leaving this class on the screen makes
       #dungeonBattleCard display:none!important via v230-stability-style. */
    if(screen)screen.classList.remove('v230-world-open');
    const mapCard=document.getElementById('dungeonMapCard');
    const battleCard=document.getElementById('dungeonBattleCard');
    if(mapCard)mapCard.style.display='none';
    if(battleCard)battleCard.style.display='';

    /* Phase 3 direct battle pipeline: state first, visuals second.
       No historic V252/V253 refresh wrappers remain in this path. Reward mode
       deliberately does not refresh the opponent because V4.246 clears #loot. */
    if(view!=='reward'){
      try{window.v246RefreshDungeonOpponent?.()}catch(_){try{v246RefreshDungeonOpponent?.()}catch(__){ }}
      /* V6.318: combat ownership is explicit. Historical V048/V060/V068 installers no
         longer race on global render; bind only the current v246 handler here. */
      try{window.v246InstallFight?.()}catch(_){try{v246InstallFight?.()}catch(__){ }}
      try{window.v4165SyncBattleGate?.('canonical-render')}catch(_){ }
    }
    try{window.v252ModernizeBattle?.()}catch(_){try{v252ModernizeBattle?.()}catch(__){ }}
    try{window.v253DecorateBattle?.()}catch(_){try{v253DecorateBattle?.()}catch(__){ }}
    /* V7.156: one visual normalization pass, owned by the canonical renderer. */
    try{window.v6210DungeonSinglePlayerArtClean?.()}catch(_){ }
    try{window.v6324DungeonEnemyPoseSync?.()}catch(_){ }
    try{window.v6306DungeonVisualSync?.()}catch(_){ }
    try{window.v7141CombatArenaRefresh?.()}catch(_){ }
    /* Phase 2.2: restore the canonical battle information shell that used to
       be reached only through a retired renderDungeon wrapper. It contains
       dungeon title, opponent position (x/10), recommended level and the
       visible combat log shell. */
    try{window.v585SyncDungeonBattle?.()}catch(_){ }
    try{window.v324Paint?.()}catch(_){ }
    return true;
  }

  function canonicalRenderDungeon(){
    renderStats.calls++;
    repairBeforeRender();
    const st=currentState(),now=performance.now();
    renderStats.last=st.sig;

    /* Old render() wrappers can call renderDungeon several times synchronously.
       Collapse identical same-frame calls instead of repainting the full map. */
    if(renderBusy||(st.sig===lastRenderSig&&now-lastRenderAt<14)){
      renderStats.deduped++;
      queue(false);
      return true;
    }
    lastRenderSig=st.sig;lastRenderAt=now;renderBusy=true;

    try{
      let out=true;
      if(st.layer==='world'){
        if(s?.dungeon)s.dungeon.view='map';
        out=renderWorldDirect();
      }else if(st.view==='map'){
        out=renderMapDirect();
      }else if(st.view==='battle'||st.view==='reward'){
        out=renderBattleDirect(st.view);
      }else{
        if(s?.dungeon)s.dungeon.view='map';
        out=renderMapDirect();
      }
      /* Sprint 2: production preview cleanup/live-control repair is invoked
         directly by the canonical owner; no v494 renderDungeon wrapper needed. */
      try{window.v494DungeonProductionSync?.()}catch(_){ }
      /* Sprint 2: server-authoritative fight button ownership is synced directly;
         v7051 no longer wraps global renderDungeon just to repaint the button. */
      try{window.v7051ClaimButtonSync?.()}catch(_){ }
      try{window.v433PaintResources?.()}catch(_){ }
      queue(true);
      requestAnimationFrame(()=>{try{window.v7144CleanDungeonMap?.()}catch(_){ }try{window.v7144PaintDungeonTimer?.(true)}catch(_){ }});
      return out;
    }catch(err){
      renderStats.errors++;
      console.error('[Dungeon canonical renderer]',err);
      /* Emergency compatibility path only. It is intentionally excluded from
         normal play and lets an older standalone asset bundle remain usable. */
      if(typeof legacyRenderDungeon==='function'&&legacyRenderDungeon!==canonicalRenderDungeon){
        renderStats.fallbacks++;
        try{const out=legacyRenderDungeon.apply(this,arguments);queue(true);return out}catch(e){console.error('[Dungeon legacy fallback]',e)}
      }
      return false;
    }finally{
      renderBusy=false;
    }
  }
  canonicalRenderDungeon.__glCanonicalDungeonOwner=true;
  canonicalRenderDungeon.__glDungeonPhase2=true;
  try{window.renderDungeon=canonicalRenderDungeon}catch(_){ }
  try{renderDungeon=canonicalRenderDungeon}catch(_){ }
  window.glDungeonRendererQA=()=>({phase:'2',activeOwner:window.renderDungeon===canonicalRenderDungeon,legacyChainBypassed:true,...renderStats,state:currentState()});


  document.addEventListener('click',ev=>{
    const el=ev.target instanceof Element?ev.target:null;
    const mapReturn=el?.closest?.('#v247DungeonRewardOk,#v246ReturnMap,#v068ReturnMap,#v048ReturnMap,#v446ReturnMap,#claimDungeonReward');
    /* Result overlays live outside #dungeon. They were the missing return path:
       V5.87 rebuilt the old v261 map, but the canonical background/thumbnail owner
       never got a post-render turn. Queue exactly the same final visual sync here. */
    if(el?.closest?.('#dungeon,#dungeonMapCard,#dungeonBattleCard,#fightBtn')||mapReturn)queue(true);
    if(mapReturn){
      requestAnimationFrame(()=>paintMap());
      setTimeout(paintMap,90);
      setTimeout(paintMap,240);
    }
  },true);
  window.addEventListener('pageshow',()=>queue(true),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue(true)},{passive:true});

  window.glDungeonVisualQA=()=>{
    const di=dungeonIndex(),ri=roomIndex(di),c=cfgFor(di);
    const stage=document.getElementById('battleStage');
    const img=document.querySelector('#enemyFighter .gl-dungeon-enemy-art');
    const playerImg=document.querySelector('#playerFighter .gl-dungeon-player-art');
    const mapStage=document.querySelector('#dungeonMapCard .v261-stage');
    const mapBg=document.querySelector('#dungeonMapCard .gl-dungeon-map-bg-img');
    const battleBg=document.querySelector('#battleStage>.gl-dungeon-battle-bg-img');
    return{
      phase:'V7.160',dungeon:di+1,room:ri+1,
      bg:c.bg,enemyArt:assetFor(c,ri),
      stageBackground:stage?.style?.backgroundImage||null,
      mapBgSrc:mapBg?.getAttribute('src')||null,
      battleBgSrc:battleBg?.getAttribute('src')||null,
      liveEnemySrc:img?.getAttribute('src')||null,
      livePlayerSrc:playerImg?.getAttribute('src')||null,
      oldBarbarArts:document.querySelectorAll('#playerFighter .v600-barbar-art').length,
      canonicalPlayerArts:document.querySelectorAll('#playerFighter .gl-dungeon-player-art').length,
      canonicalEnemyArts:document.querySelectorAll('#enemyFighter .gl-dungeon-enemy-art,#enemyFighter .gl-dungeon-d1-art').length,
      legacyBattleBackgroundLayers:document.querySelectorAll('#battleStage>.v599-template-bg,#battleStage>.v600-bg,#battleStage>.v602-duel-panel,#battleStage>.v602-side-decor').length,
      legacyDuelPanels:document.querySelectorAll('#battleStage>.v602-duel-panel').length,
      legacyEnemyArts:document.querySelectorAll('#enemyFighter .v253-monster,#enemyFighter .v573-enemy-art,#enemyFighter .v574-enemy-art,#enemyFighter .v599-treant-art,#enemyFighter .v600-treant-art').length,
      mapBgError:mapStage?.dataset?.glMapBgError||null,
      battleBgError:stage?.dataset?.glBattleBgError||null,
      assetError:document.querySelector('#enemyFighter .fighter-avatar')?.dataset?.glAssetError||null
    };
  };

  window.glDungeonPhase32QA=()=>{
    const thumb=document.querySelector('#dungeonMapCard .v261-thumb');
    const img=thumb?.querySelector(':scope > .gl-dungeon-current-thumb-img');
    return{
      phase:'3.2',
      thumbPresent:!!thumb,
      thumbImagePresent:!!img,
      thumbSrc:img?.getAttribute('src')||null,
      thumbNaturalWidth:Number(img?.naturalWidth)||0,
      skipButtonPresent:!!document.getElementById('v446SkipFight'),
      skipAvailable:typeof window.__GL_DUNGEON_SKIP_FIGHT__==='function'
    };
  };

  queue(true);
})();
