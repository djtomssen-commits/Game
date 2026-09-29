/* === v414-guild-boss-longterm === */
(function(){
 const VERSION='V4.29 Stable', SHORT='V4.29';
 let meta={stage:1,wins:0,next_hp:12000,reward_buds:20};
 let warned=false;
 function fmt(n){return Math.max(0,Math.round(Number(n)||0)).toLocaleString('de-DE')}
 function roundStage(){
   const next=Math.max(1,Number(meta.stage)||1);
   return v255BossRound?.status==='won'?Math.max(1,next-1):next;
 }
 function paint(){
   const live=document.querySelector('#v255BossLive'); if(!live)return;
   let box=document.querySelector('#v414BossStageBox');
   if(!box){box=document.createElement('div');box.id='v414BossStageBox';box.className='v414-boss-stagebox';live.prepend(box)}
   const stage=roundStage(), next=Math.max(1,Number(meta.stage)||1), won=v255BossRound?.status==='won';
   let hp=Number(meta.next_hp)||12000;
   if(won&&stage<next)hp=Math.max(12000,Math.round(hp/1.28));
   box.innerHTML=`<div class="v414-boss-stage-top"><span>☣ LANGZEIT-GILDENBOSS</span><b>Boss-Stufe ${stage}</b></div><small>${won?`Besiegt · nächste Herausforderung: <strong>Stufe ${next}</strong> mit ca. ${fmt(meta.next_hp)} HP.`:`Ziel: ca. <strong>${fmt(hp)} HP</strong> · ${Number(meta.wins)||0} Titan${Number(meta.wins)===1?'':'e'} dauerhaft besiegt.`}<br>Stärker werden zählt: Boss-HP skaliert nicht mehr automatisch mit eurer aktuellen Kampfkraft.</small>`;
   const hpText=document.querySelector('#v255BossHpText');
   if(hpText&&v255BossRound){const max=Math.max(1,Number(v255BossRound.boss_max_hp)||1),hpNow=Math.max(0,Number(v255BossRound.boss_hp)||0);hpText.textContent=`Verseuchter Titan · Stufe ${stage} · ${fmt(hpNow)} / ${fmt(max)} HP`}
   document.querySelectorAll('#v260DailyBossArena .v259-boss-title b,#v258BossArena .v259-boss-title b').forEach(el=>el.textContent=`☣ Verseuchter Titan · Stufe ${stage}`);
 }
 async function loadMeta(){
   try{
     if(typeof v073Db==='undefined'||!v073Db||typeof v254Membership==='undefined'||!v254Membership)return paint();
     const {data,error}=await v073Db.rpc('v414_get_guild_boss_stage');
     if(error)throw error;
     const r=Array.isArray(data)?data[0]:data; if(r)meta={...meta,...r};
   }catch(e){if(!warned&&/v414_get_guild_boss_stage|does not exist|schema cache/i.test(String(e?.message||''))){warned=true;console.warn('V4.14 Guild Boss SQL fehlt')}}
   paint();
 }
 if(typeof v255RenderBoss==='function'){
   const base=v255RenderBoss;v255RenderBoss=function(){const r=base.apply(this,arguments);paint();return r};window.v255RenderBoss=v255RenderBoss;
 }
 if(typeof v255LoadBoss==='function'){
   const base=v255LoadBoss;v255LoadBoss=async function(){const r=await base.apply(this,arguments);await loadMeta();paint();return r};window.v255LoadBoss=v255LoadBoss;
 }
 function stamp(){}
 stamp();loadMeta();setTimeout(()=>{stamp();paint()},800);
})();

