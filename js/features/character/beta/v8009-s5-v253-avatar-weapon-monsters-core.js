/* ===== V4.02 visuals only; combat math remains V4.02/V4.02 ===== */

function v253EquippedWeapon(){
  const it=s.equipment?.weapon || null;
  const fallback={
    grower:{icon:'🪓',name:'Barbarenwaffe',kind:'melee'},
    scout:{icon:'🏹',name:'Bogen',kind:'arrow'},
    bruiser:{icon:'🪄',name:'Magierstab',kind:'magic'},
    frost:{icon:'⚔️',name:'Frostklinge',kind:'melee'},
    summoner:{icon:'🪄',name:'Harzrufer-Stab',kind:'magic'}
  }[s.playerClass] || {icon:'⚔️',name:'Waffe',kind:'melee'};

  return {
    item:it,
    icon:String(it?.icon||fallback.icon),
    name:String(it?.name||fallback.name),
    kind:fallback.kind
  };
}

function v253AvatarSrc(){
  try{
    if(typeof v080AvatarFor==='function'){
      return v080AvatarFor(s.playerClass);
    }
  }catch(e){}
  return '';
}

function v253MonsterType(enemy,ri){
  const n=String(enemy?.name||'').toLowerCase();

  if(/milbe|spinne|mücke|insekt|käfer/.test(n))return 'spider';
  if(/pilz|spore|fung|schimmel/.test(n))return 'fungus';
  if(/drache|wyrm|schlange/.test(n))return 'dragon';
  if(/golem|stein|kristall|fels/.test(n))return 'golem';
  if(/nebel|geist|schatten|phantom/.test(n))return 'wraith';
  if(/pflanz|wurzel|blüte|kush|blatt|harz/.test(n))return 'plant';
  if(/ratte|wolf|bestie|tier/.test(n))return 'beast';

  return ['spider','fungus','plant','wraith','beast','golem','dragon'][ri%7];
}

function v253MonsterPalette(di,ri,boss){
  const palettes=[
    ['#6fdb4e','#23542b','#baf67b'],
    ['#a768e8','#3b214f','#e2a0ff'],
    ['#e58f35','#673718','#ffd06d'],
    ['#43c7c0','#164a4b','#8ff5ec'],
    ['#d95757','#5a2025','#ff9b82'],
    ['#8797e8','#293465','#d2d8ff']
  ];

  const p=palettes[(Number(di)+Number(ri))%palettes.length];
  return boss
    ?['#c457ef','#39154f','#f5a2ff']
    :p;
}

function v253MonsterSvg(enemy,boss,di,ri){
  const type=v253MonsterType(enemy,ri);
  const [main,dark,glow]=v253MonsterPalette(di,ri,boss);
  const gid=`v253g${di}_${ri}`;

  const commonHead=`
    <defs>
      <radialGradient id="${gid}" cx="45%" cy="35%">
        <stop offset="0" stop-color="${glow}"/>
        <stop offset=".34" stop-color="${main}"/>
        <stop offset="1" stop-color="${dark}"/>
      </radialGradient>
      <filter id="${gid}glow">
        <feGaussianBlur stdDeviation="3.4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  let body='';

  if(type==='spider'){
    body=`
      <g class="v253-monster-core">
        <g fill="none" stroke="${dark}" stroke-width="9" stroke-linecap="round">
          <path class="limb-a" d="M62 80 L27 55 L8 35"/>
          <path class="limb-b" d="M60 92 L24 92 L6 110"/>
          <path class="limb-a" d="M66 106 L37 131 L19 153"/>
          <path class="limb-b" d="M98 80 L133 55 L152 35"/>
          <path class="limb-a" d="M100 92 L136 92 L154 110"/>
          <path class="limb-b" d="M94 106 L123 131 L141 153"/>
        </g>
        <ellipse cx="80" cy="105" rx="40" ry="48" fill="url(#${gid})" stroke="${main}" stroke-width="4"/>
        <circle cx="80" cy="66" r="29" fill="url(#${gid})" stroke="${main}" stroke-width="4"/>
        <g fill="${glow}" filter="url(#${gid}glow)">
          <circle class="eye" cx="68" cy="61" r="5"/><circle class="eye" cx="82" cy="57" r="5"/><circle class="eye" cx="95" cy="62" r="5"/>
        </g>
        <path d="M65 78 Q80 92 97 77 Q88 104 80 105 Q71 102 65 78" fill="#100b11"/>
        <path d="M69 81 l6 16 5-12 6 12 7-17" fill="#f4e1c0"/>
      </g>`;
  }else if(type==='fungus'){
    body=`
      <g class="v253-monster-core">
        <path class="limb-a" d="M64 98 Q35 104 21 132" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>
        <path class="limb-b" d="M96 98 Q125 106 140 131" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>
        <path d="M55 72 Q80 41 106 72 L102 145 Q80 160 58 145 Z" fill="url(#${gid})" stroke="${main}" stroke-width="4"/>
        <path d="M20 71 Q39 18 80 20 Q123 18 145 73 Q111 55 80 62 Q49 55 20 71Z" fill="${main}" stroke="${glow}" stroke-width="4"/>
        <circle cx="53" cy="45" r="8" fill="${glow}"/><circle cx="102" cy="37" r="10" fill="${dark}"/><circle cx="126" cy="61" r="6" fill="${glow}"/>
        <circle class="eye" cx="69" cy="93" r="6" fill="${glow}"/><circle class="eye" cx="93" cy="93" r="6" fill="${glow}"/>
        <path d="M66 113 Q80 122 96 112" fill="none" stroke="#160c13" stroke-width="7" stroke-linecap="round"/>
        <circle class="smoke" cx="38" cy="25" r="8" fill="${main}" opacity=".35"/><circle class="smoke" cx="127" cy="22" r="11" fill="${main}" opacity=".24"/>
      </g>`;
  }else if(type==='dragon'){
    body=`
      <g class="v253-monster-core">
        <path class="limb-a" d="M60 105 Q20 88 16 49 Q45 65 65 72" fill="${dark}" stroke="${main}" stroke-width="3"/>
        <path class="limb-b" d="M99 104 Q140 86 148 47 Q117 63 96 72" fill="${dark}" stroke="${main}" stroke-width="3"/>
        <path d="M47 131 Q80 153 113 131 L105 81 Q80 61 55 81Z" fill="url(#${gid})" stroke="${main}" stroke-width="4"/>
        <path d="M50 70 Q80 36 111 70 L101 106 Q79 122 58 106Z" fill="url(#${gid})" stroke="${glow}" stroke-width="4"/>
        <path d="M57 57 L42 20 L70 49 M102 56 L121 19 L92 50" fill="${dark}" stroke="${main}" stroke-width="5"/>
        <circle class="eye" cx="68" cy="75" r="6" fill="${glow}"/><circle class="eye" cx="94" cy="75" r="6" fill="${glow}"/>
        <path d="M65 92 Q80 109 99 91 L94 109 L82 103 L71 110Z" fill="#150912" stroke="#eee0c2" stroke-width="2"/>
        <path d="M81 121 Q92 140 127 151" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>
      </g>`;
  }else if(type==='golem'){
    body=`
      <g class="v253-monster-core">
        <path class="limb-a" d="M56 86 L23 99 L16 132" fill="none" stroke="${dark}" stroke-width="22" stroke-linecap="round"/>
        <path class="limb-b" d="M104 86 L138 99 L145 132" fill="none" stroke="${dark}" stroke-width="22" stroke-linecap="round"/>
        <path d="M48 73 L66 53 L95 52 L114 76 L107 139 L80 155 L52 139Z" fill="url(#${gid})" stroke="${main}" stroke-width="5"/>
        <path d="M55 35 L78 21 L103 34 L108 68 L80 82 L52 66Z" fill="${dark}" stroke="${main}" stroke-width="5"/>
        <path d="M79 26 L71 54 L84 63 L76 88" fill="none" stroke="${glow}" stroke-width="4" filter="url(#${gid}glow)"/>
        <circle class="eye" cx="68" cy="49" r="5" fill="${glow}"/><circle class="eye" cx="91" cy="49" r="5" fill="${glow}"/>
      </g>`;
  }else if(type==='wraith'){
    body=`
      <g class="v253-monster-core">
        <path class="smoke" d="M41 148 Q23 116 45 97 Q25 61 56 44 Q66 17 81 20 Q104 20 111 49 Q139 71 116 100 Q139 127 118 151 Q98 135 80 153 Q61 134 41 148Z" fill="url(#${gid})" opacity=".9"/>
        <path d="M52 68 Q80 41 109 69 L102 117 Q80 134 58 117Z" fill="${dark}" stroke="${main}" stroke-width="4"/>
        <path d="M54 63 Q80 28 106 63" fill="none" stroke="${glow}" stroke-width="6"/>
        <circle class="eye" cx="68" cy="82" r="6" fill="${glow}"/><circle class="eye" cx="94" cy="82" r="6" fill="${glow}"/>
        <path d="M69 102 Q81 109 93 101" fill="none" stroke="${main}" stroke-width="5"/>
        <path class="limb-a" d="M55 99 Q27 105 17 124" fill="none" stroke="${main}" stroke-width="8" stroke-linecap="round"/>
        <path class="limb-b" d="M105 99 Q133 105 143 124" fill="none" stroke="${main}" stroke-width="8" stroke-linecap="round"/>
      </g>`;
  }else if(type==='plant'){
    body=`
      <g class="v253-monster-core">
        <path class="limb-a" d="M55 96 Q21 86 14 111 Q39 119 60 110" fill="${main}" stroke="${dark}" stroke-width="4"/>
        <path class="limb-b" d="M105 96 Q140 85 148 111 Q122 120 100 110" fill="${main}" stroke="${dark}" stroke-width="4"/>
        <path d="M48 75 Q80 48 113 76 L106 141 Q80 157 53 141Z" fill="url(#${gid})" stroke="${main}" stroke-width="4"/>
        <path d="M49 75 Q23 45 40 25 Q69 39 80 66 Q91 37 120 25 Q137 47 110 76" fill="${main}" stroke="${glow}" stroke-width="4"/>
        <path d="M58 64 Q80 38 103 64 L100 103 Q80 119 60 103Z" fill="${dark}" stroke="${main}" stroke-width="4"/>
        <circle class="eye" cx="70" cy="78" r="6" fill="${glow}"/><circle class="eye" cx="92" cy="78" r="6" fill="${glow}"/>
        <path d="M66 96 Q80 112 96 95" fill="#170b12" stroke="${glow}" stroke-width="3"/>
        <path d="M80 36 Q67 12 79 5 Q93 17 80 36" fill="${glow}"/>
      </g>`;
  }else{
    body=`
      <g class="v253-monster-core">
        <path class="limb-a" d="M54 101 Q30 100 19 127" fill="none" stroke="${dark}" stroke-width="16" stroke-linecap="round"/>
        <path class="limb-b" d="M106 101 Q130 99 142 127" fill="none" stroke="${dark}" stroke-width="16" stroke-linecap="round"/>
        <path d="M44 84 Q80 50 117 84 L109 139 Q80 158 51 139Z" fill="url(#${gid})" stroke="${main}" stroke-width="5"/>
        <path d="M48 69 Q80 33 112 69 L103 104 Q80 120 57 104Z" fill="${dark}" stroke="${main}" stroke-width="4"/>
        <path d="M52 64 L30 37 L62 50 M108 64 L132 37 L98 50" fill="${dark}" stroke="${main}" stroke-width="5"/>
        <circle class="eye" cx="68" cy="78" r="6" fill="${glow}"/><circle class="eye" cx="94" cy="78" r="6" fill="${glow}"/>
        <path d="M64 97 Q80 115 98 96" fill="#130a0d" stroke="#e7d6b6" stroke-width="3"/>
      </g>`;
  }

  if(boss){
    body+=`
      <path d="M34 27 L52 8 L67 27 L80 4 L94 27 L111 8 L128 29"
        fill="none" stroke="${glow}" stroke-width="5" filter="url(#${gid}glow)"/>
      <circle cx="80" cy="79" r="69" fill="none" stroke="${main}" stroke-width="2" opacity=".35" stroke-dasharray="7 7"/>
    `;
  }

  return `
    <svg class="v253-monster" viewBox="0 0 160 170" aria-hidden="true">
      ${commonHead}
      ${body}
    </svg>
  `;
}

function v253EnsureWeaponNode(player){
  if(!player)return null;

  const shell=player.querySelector('.v252-fighter-shell')||player;
  let w=shell.querySelector('.v253-equipped-weapon');

  if(!w){
    w=document.createElement('div');
    w.className='v253-equipped-weapon';
    shell.appendChild(w);
  }

  const eq=v253EquippedWeapon();
  w.textContent=eq.icon;
  w.dataset.name=eq.name;
  w.title=eq.name;

  let trail=shell.querySelector('.v253-weapon-trail');
  if(!trail){
    trail=document.createElement('div');
    trail.className='v253-weapon-trail';
    shell.appendChild(trail);
  }

  return w;
}

function v253DecoratePlayer(){
  const player=document.querySelector('#playerFighter');
  if(!player)return;

  const avatar=player.querySelector('.fighter-avatar');
  if(!avatar)return;

  const src=v253AvatarSrc();
  /* Phase 1.2 cleanup: V4.02 may still maintain fighter labels and weapon FX,
     but the late canonical dungeon owner exclusively owns the avatar DOM. */
  if(src&&!window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__){
    avatar.innerHTML=`
      <img class="v253-player-avatar-img"
           src="${v251Esc? v251Esc(src):src}"
           alt="Eigener Charakter-Avatar">
    `;
  }

  const cv=v252ClassVisual();
  const name=player.querySelector('.fighter-name');
  if(name){
    name.innerHTML=`
      ${v251Esc? v251Esc(s.characterName||cv.name):(s.characterName||cv.name)}
      · ${cv.name} · Lv. <span id="battleLevel">${Number(s.level)||1}</span>
    `;
  }

  /*
    Hide the old class-fallback weapon. V4.02 displays the actually
    equipped item instead.
  */
  const old=player.querySelector('.v252-weapon');
  if(old)old.style.display='none';

  v253EnsureWeaponNode(player);
}

function v253DecorateEnemy(){
  const enemyEl=document.querySelector('#enemyFighter');
  if(!enemyEl)return;

  const di=v048DungeonIndex();
  const ri=v048RoomIndex(di);
  const e=dungeons?.[di]?.enemies?.[ri]||{};
  const boss=!!e.boss||ri===9;

  const avatar=enemyEl.querySelector('.fighter-avatar');
  if(avatar&&!window.__GL_DUNGEON_VISUAL_OWNER_PHASE2F__){
    /* Retired visual fallback only. In the current build this generated SVG used
       to delete .gl-dungeon-enemy-art during opponent refreshes. */
    avatar.innerHTML=v253MonsterSvg(e,boss,di,ri);
  }

  const old=enemyEl.querySelector('.v252-weapon');
  if(old)old.style.display='none';

  enemyEl.classList.toggle('v252-boss',boss);
}

function v253DecorateBattle(){
  try{
    v253DecoratePlayer();
    v253DecorateEnemy();
  }catch(e){
    console.error('V4.02 battle decoration',e);
  }
}

function v253AnimateEquippedWeapon(){
  const player=document.querySelector('#playerFighter');
  const w=player?.querySelector('.v253-equipped-weapon');
  const trail=player?.querySelector('.v253-weapon-trail');
  if(!w)return;

  const kind=v253EquippedWeapon().kind;
  const cls=
    kind==='arrow'
      ?'v253-shoot'
      :kind==='magic'
        ?'v253-cast'
        :'v253-swing';

  w.classList.remove('v253-swing','v253-shoot','v253-cast');
  void w.offsetWidth;
  w.classList.add(cls);

  if(trail && kind==='melee'){
    trail.classList.remove('show');
    void trail.offsetWidth;
    trail.classList.add('show');
  }

  setTimeout(()=>{
    w.classList.remove(cls);
    if(trail)trail.classList.remove('show');
  },540);
}


/*
  V4.02 already owns attack effects. Add only weapon animation on the
  player's attack; enemy attacks keep their monster lunge.
*/
const v253BaseAttackFx=v252AttackFx;
v252AttackFx=function(attacker,cl){
  if(attacker?.id==='playerFighter'){
    try{v253AnimateEquippedWeapon()}catch(e){}
  }

  return v253BaseAttackFx(attacker,cl);
};


/* Phase 3: v252ModernizeBattle/v246RefreshDungeonOpponent wrappers retired.
   v253DecorateBattle remains a plain helper and is invoked only by the
   canonical Dungeon battle owner. Weapon attack animation stays on v252AttackFx. */
