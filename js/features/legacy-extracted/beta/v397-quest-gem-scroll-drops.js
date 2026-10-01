
(function(){
  const VERSION='V4.29 Stable';
  /*
    Normal quest extras, independent rolls:
    - Edelstein: 5%
    - Verzauberungsrolle: 5%
    These chances are intentionally NOT shown on the quest card.
    The existing 20% Zufalls-Item display remains the only item-loot chance shown there.
  */
  setTimeout(()=>{
    document.querySelectorAll(
      '.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version'
    ).forEach(el=>{if(el)el.textContent=VERSION});
    document.querySelectorAll('.v366-ver').forEach(el=>el.textContent='V4.11');
  },700);
})();
