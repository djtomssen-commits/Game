/* === v408-guild-upgrade-audit-fix === */
(function(){
  const VERSION='V4.29 Stable';
  const MAX_LEVEL=8;

  /* Existing guild upgrades: 2% per level, max 8 => max +16%. */
  window.v408GuildLevel=function(kind){
    try{
      if(!v254Guild || !v254Membership)return 0;
      const key=kind==='xp'?'xp_level':'gold_level';
      return Math.max(0,Math.min(MAX_LEVEL,Math.floor(Number(v254Guild[key])||0)));
    }catch(e){return 0}
  };
  window.v408GuildPct=function(kind){return v408GuildLevel(kind)*2};
  window.v408GuildGold=function(base){
    base=Math.max(0,Number(base)||0);
    return Math.round(base*(1+v408GuildPct('gold')/100));
  };

  /* XP has one central payout function, so the guild XP bonus can be applied
     consistently without changing quest/dungeon/boss formulas themselves. */
  if(typeof addXp==='function' && !window.__v408GuildXpWrapped){
    const baseAddXp=addXp;
    addXp=function(n){
      const base=Math.max(0,Number(n)||0);
      const boosted=Math.round(base*(1+v408GuildPct('xp')/100));
      return baseAddXp.call(this,boosted);
    };
    window.addXp=addXp;
    window.__v408GuildXpWrapped=true;
  }

  /* Keep the existing two upgrades, but make their limit/cost state explicit.
     Guild cleanup Phase 2: exposed as a direct paint owner instead of wrapping v254RenderGuild. */
  window.v408PaintGuildUpgrades=function(){
    try{
      [['xp','v254UpgradeXp','v254XpBonus'],['gold','v254UpgradeGold','v254GoldBonus']].forEach(([kind,btnId,labelId])=>{
        const lvl=v408GuildLevel(kind), btn=document.getElementById(btnId), label=document.getElementById(labelId);
        if(label)label.textContent=`Stufe ${lvl}/${MAX_LEVEL} · +${lvl*2}%`;
        if(btn){
          if(lvl>=MAX_LEVEL){btn.textContent='MAX';btn.disabled=true;btn.title='Maximalstufe erreicht';}
          else{btn.disabled=false;btn.textContent=`${v254UpgradeCost(lvl)} 🌿`;btn.title=`Nächste Stufe: +${(lvl+1)*2}%`;}
        }
      });
    }catch(e){console.warn('V4.08 guild upgrade paint',e)}
  };

  const baseBuy=typeof v254BuyUpgrade==='function'?v254BuyUpgrade:null;
  if(baseBuy){
    v254BuyUpgrade=async function(kind){
      if((kind==='xp'||kind==='gold') && v408GuildLevel(kind)>=MAX_LEVEL){
        return typeof v063Toast==='function'&&v063Toast('Maximalstufe erreicht','info','Dieses Gildenupgrade ist bereits auf Stufe 8.');
      }
      return baseBuy.apply(this,arguments);
    };
    window.v254BuyUpgrade=v254BuyUpgrade;
  }

  /* Existing backend remains authoritative for Bud balance and purchases. */
  setTimeout(()=>{
    try{v254RenderGuild()}catch(e){}
    if(String(window.GROW_RELEASE_CHANNEL||'stable')!=='beta'){
      document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(el=>el.textContent=VERSION);
      document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
    }else window.__V8009_HOME10_V408_VERSION_RETIRED__=true;
  },750);
})();

