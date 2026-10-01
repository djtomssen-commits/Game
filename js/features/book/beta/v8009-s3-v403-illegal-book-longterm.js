(function(){
  const V403_VERSION='V4.29 Stable';
  if(typeof V106_ACH==='undefined')return;

  const byId=()=>new Map(V106_ACH.map((row,i)=>[row[0],{row,i}]));
  const add=row=>{ if(!V106_ACH.some(x=>x[0]===row[0])) V106_ACH.push(row); };

  /* One old target could never be reached with 20 one-time dungeons x 10 rooms.
     Keep its id/save compatibility, but make the actual lifetime target reachable. */
  const map=byId();
  if(map.has('fight250')){
    const r=map.get('fight250').row;
    r[1]='Unterwelt-Säuberer';
    r[2]='Besiege alle 200 Dungeon-Gegner.';
    r[4]=200;
  }

  function v403OrangeOwned(){
    const inv=Array.isArray(s.inventory)?s.inventory:[];
    const eq=Object.values(s.equipment||{}).filter(Boolean);
    return [...inv,...eq].filter(it=>it?.quality==='orange').length;
  }

  /* Level milestones: the book now continues all the way to the current
     Level-300 talent endgame instead of effectively ending at level 100. */
  add(['lvl150','Unterwelt-Veteran','Erreiche Stufe 150.',()=>s.level,150]);
  add(['lvl200','Nebel-Legende','Erreiche Stufe 200.',()=>s.level,200]);
  add(['lvl250','Jenseits des Gesetzes','Erreiche Stufe 250.',()=>s.level,250]);
  add(['lvl300','Endstufe der Legende','Erreiche Stufe 300.',()=>s.level,300]);

  /* Dungeon milestones use the canonical repaired counters from V3.36/V4.02. */
  add(['d15','Tief in der Unterwelt','Schließe 15 Dungeons ab.',()=>s.dungeon?.completed?.length||0,15]);
  add(['fight50','Keller-Räumer','Besiege 50 Dungeon-Gegner.',()=>s.v106Achievements?.stats?.dungeonWins||0,50]);
  add(['fight100','Hundert unter der Erde','Besiege 100 Dungeon-Gegner.',()=>s.v106Achievements?.stats?.dungeonWins||0,100]);

  /* Quest ladder fills the large gaps 10 -> 100 -> 500 and adds a true
     long-term goal beyond the previous endpoint. */
  add(['quest50','Fester Auftragnehmer','Schließe 50 Quests ab.',()=>s.v106Achievements?.stats?.questsDone||0,50]);
  add(['quest250','Keine Pause im Nebel','Schließe 250 Quests ab.',()=>s.v106Achievements?.stats?.questsDone||0,250]);
  add(['quest1000','Tausend schmutzige Aufträge','Schließe 1.000 Quests ab.',()=>s.v106Achievements?.stats?.questsDone||0,1000]);

  /* Growroom milestones extend the existing planted-crop lifetime counter. */
  add(['grow50','Kleine Plantage','Growe 50 Pflanzen an.',()=>s.v106Achievements?.stats?.plantsGrown||0,50]);
  add(['grow250','Grünes Geschäft','Growe 250 Pflanzen an.',()=>s.v106Achievements?.stats?.plantsGrown||0,250]);
  add(['grow500','Halbtausend Ernten','Growe 500 Pflanzen an.',()=>s.v106Achievements?.stats?.plantsGrown||0,500]);
  add(['grow2500','Meister der Plantage','Growe 2.500 Pflanzen an.',()=>s.v106Achievements?.stats?.plantsGrown||0,2500]);

  /* Existing PvP/worldboss counters are already canonical and save-backed. */
  add(['pvp_win250','Nebel-Arenalegende','Gewinne 250 PvP-Kämpfe.',()=>s.v106Achievements?.stats?.pvpWins||0,250]);
  add(['wb25','Koloss-Albtraum','Besiege 25 mystische Weltbosse.',()=>s.v110WorldBoss?.wins||0,25]);

  /* Legendary gear gets its own collection goals. Mystic achievements remain
     untouched and still belong exclusively to the mystic worldboss loot path. */
  add(['legend1','Orange Versuchung','Besitze dein erstes legendäres Item.',()=>v403OrangeOwned(),1]);
  add(['legend6','Legendär ausgerüstet','Besitze 6 legendäre Gegenstände.',()=>v403OrangeOwned(),6]);

  /* Re-sort only the new milestone positions conceptually through the labels;
     existing ids/done-state and reward math stay untouched. */
  try{v106CheckAchievements(false)}catch(e){}

  const v403BaseOpen=v106OpenBook;
  v106OpenBook=function(){
    const r=v403BaseOpen.apply(this,arguments);
    const head=document.querySelector('#v106Overlay .v106-head p');
    if(head)head.textContent='Langzeit-Erfolge · Fortschritt wird automatisch gespeichert · Jeder Abschluss gibt dauerhaft +1 auf dein Hauptattribut.';
    return r;
  };

  function v403Version(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V403_VERSION;
    });
  }
  v403Version();
  setTimeout(v403Version,600);
  setTimeout(v403Version,2000);
})();
