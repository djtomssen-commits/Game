(()=>{
'use strict';
if(window.__V6109_BACKGROUND_MUSIC__)return;
window.__V6109_BACKGROUND_MUSIC__=true;

const SETTINGS_KEY=(typeof V141_SETTINGS_KEY==='string'?V141_SETTINGS_KEY:'growLegendsSettingsV141');
let ctx=null;
let master=null;
let source=null;
let loopBuffer=null;
let unlocked=false;
let building=false;

/* Background music defaults ON, but Android/WebView still requires the first
   user interaction before audio is allowed to start. */
try{
  if(typeof v141Settings==='object'){
    if(typeof v141Settings.music!=='boolean')v141Settings.music=true;
    if(!Number.isFinite(Number(v141Settings.musicVolume)))v141Settings.musicVolume=.70;
    if(!Number.isFinite(Number(v141Settings.sfxVolume)))v141Settings.sfxVolume=.72;
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(v141Settings));
  }
}catch(e){}

function enabled(){
  try{
    return typeof v141Settings==='object'
      ? (v141Settings.sound!==false && v141Settings.music!==false)
      : true;
  }catch(e){return true}
}

function mtof(m){return 440*Math.pow(2,(m-69)/12)}

function makeLoop(audioCtx){
  const sr=22050;
  const bpm=80;
  const beat=60/bpm;          // .75 s
  const bars=8;
  const seconds=bars*4*beat;  // exact 24 s loop
  const len=Math.floor(sr*seconds);
  const b=audioCtx.createBuffer(2,len,sr);
  const L=b.getChannelData(0),R=b.getChannelData(1);

  /* Dark, relaxed Grow-Legends fantasy progression.
     Two bars per chord, with a small pentatonic lead. */
  const roots=[45,45,41,41,48,48,43,43];
  const chordType=[
    [0,3,7,10], [0,3,7,10],
    [0,4,7,11], [0,4,7,11],
    [0,3,7,10], [0,3,7,10],
    [0,3,7,10], [0,3,7,10]
  ];
  const leadPattern=[12,15,19,22,19,15,10,12, 12,10,7,10,12,15,19,15];

  let seed=420710;
  const rnd=()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
  };
  const noise=()=>rnd()*2-1;
  const soft=(x)=>Math.tanh(x);

  for(let i=0;i<len;i++){
    const t=i/sr;
    const bar=Math.min(bars-1,Math.floor(t/(beat*4)));
    const beatInBar=(t%(beat*4))/beat;
    const beatIndex=Math.floor(t/beat);
    const root=roots[bar];
    const chord=chordType[bar].map(x=>root+x);

    /* warm low fantasy pad */
    const swell=.62+.38*(.5-.5*Math.cos(2*Math.PI*(t%(beat*4))/(beat*4)));
    let pad=0;
    chord.forEach((m,idx)=>{
      const f=mtof(m+12);
      pad += Math.sin(2*Math.PI*f*t + idx*.72)*(.012/(1+idx*.18));
      pad += Math.sin(2*Math.PI*(f*.5)*t + idx*.31)*(.006/(1+idx*.25));
    });
    pad*=swell;

    /* round bass, root + occasional fifth */
    const bp=t%beat;
    const bassMidi=root-12+(beatIndex%4===3?7:0);
    const bassEnv=Math.exp(-bp*3.15);
    const bass=(
      Math.sin(2*Math.PI*mtof(bassMidi)*t) +
      .22*Math.sin(2*Math.PI*mtof(bassMidi)*2*t)
    )*.043*bassEnv;

    /* soft kick on 1/3, quieter ghost on 4 */
    let kick=0;
    const beatPos=beatIndex%4;
    if((beatPos===0||beatPos===2||beatPos===3)&&bp<.18){
      const strength=beatPos===3?.35:1;
      const e=Math.exp(-bp*20);
      const phase=2*Math.PI*(54*bp + 22*(1-Math.exp(-bp*18)));
      kick=Math.sin(phase)*.062*e*strength;
    }

    /* brushed/snappy hit on 2 and 4 */
    let snare=0;
    if((beatPos===1||beatPos===3)&&bp<.17){
      const e=Math.exp(-bp*24);
      snare=(noise()*.018 + Math.sin(2*Math.PI*168*bp)*.010)*e;
    }

    /* sleepy closed hats, intentionally sparse */
    const eighth=beat/2;
    const ep=t%eighth;
    let hat=0;
    if(ep<.035 && ((Math.floor(t/eighth)%4)!==3)){
      const e=Math.exp(-ep*78);
      hat=noise()*.0065*e;
    }

    /* woody/plucked fantasy motif */
    const sixteenth=beat/2;
    const step=Math.floor(t/sixteenth);
    const local=t-step*sixteenth;
    const degree=leadPattern[step%leadPattern.length];
    const leadMidi=root+degree;
    const leadEnv=Math.exp(-local*8.7);
    const lf=mtof(leadMidi);
    const lead=(
      Math.sin(2*Math.PI*lf*local) +
      .32*Math.sin(2*Math.PI*lf*2*local) +
      .10*Math.sin(2*Math.PI*lf*3*local)
    )*.0145*leadEnv*(step%2===0?1:.72);

    /* subtle high bell every two bars */
    let bell=0;
    const barT=t%(beat*8);
    if(barT<1.5){
      const e=Math.exp(-barT*2.5);
      const bf=mtof(root+31);
      bell=(Math.sin(2*Math.PI*bf*barT)+.4*Math.sin(2*Math.PI*bf*2.01*barT))*.006*e;
    }

    /* a very quiet smoky texture, stereo opposed */
    const smoke=Math.sin(2*Math.PI*.083*t)*.004;
    const common=pad+bass+kick+snare+hat+lead+bell;
    L[i]=soft((common+smoke)*1.12);
    R[i]=soft((common-smoke)*1.12);
  }

  /* seam crossfade */
  const fade=Math.floor(sr*.22);
  for(let i=0;i<fade;i++){
    const a=i/fade;
    const j=len-fade+i;
    const l0=L[i],r0=R[i],l1=L[j],r1=R[j];
    L[i]=l0*a+l1*(1-a);
    R[i]=r0*a+r1*(1-a);
    L[j]=l1*a+l0*(1-a);
    R[j]=r1*a+r0*(1-a);
  }
  return b;
}
function ensureAudio(){
  if(ctx)return true;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try{
    ctx=new AC({latencyHint:'playback'});
    master=ctx.createGain();
    master.gain.value=.10*Math.max(0,Math.min(1,Number(v141Settings?.musicVolume??.70)));
    master.connect(ctx.destination);
    building=true;
    loopBuffer=makeLoop(ctx);
    building=false;
    return true;
  }catch(e){
    building=false;
    console.warn('V6.109 music init',e);
    return false;
  }
}

async function startMusic(){
  if(!unlocked||!enabled()||document.hidden)return;
  if(!ensureAudio()||building)return;
  try{
    if(ctx.state==='suspended')await ctx.resume();
    if(source)return;
    const s=ctx.createBufferSource();
    s.buffer=loopBuffer;
    s.loop=true;
    s.connect(master);
    s.onended=()=>{if(source===s)source=null};
    s.start();
    source=s;
  }catch(e){console.warn('V6.109 music start',e)}
}

function stopMusic(){
  if(source){
    try{source.stop()}catch(e){}
    try{source.disconnect()}catch(e){}
    source=null;
  }
}

async function syncMusic(){
  if(!enabled()){
    stopMusic();
    return;
  }
  if(document.hidden){
    try{if(ctx&&ctx.state==='running')await ctx.suspend()}catch(e){}
    return;
  }
  await startMusic();
}

function setMusic(on){
  try{
    if(typeof v141Settings==='object'){
      v141Settings.music=!!on;
      localStorage.setItem(SETTINGS_KEY,JSON.stringify(v141Settings));
    }
  }catch(e){}
  syncMusic();
  refreshToggle();
}
function setMusicVolume(v){
  const n=Math.max(0,Math.min(1,Number(v)||0));
  try{
    if(typeof v141Settings==='object'){
      v141Settings.musicVolume=n;
      localStorage.setItem(SETTINGS_KEY,JSON.stringify(v141Settings));
    }
  }catch(e){}
  try{if(master&&ctx)master.gain.setTargetAtTime(.10*n,ctx.currentTime,.025)}catch(e){}
}
window.v6109SetMusic=setMusic;
window.v6109SetMusicVolume=setMusicVolume;
window.v6109SyncMusic=syncMusic;

function ensureMusicRow(){
  const menu=document.getElementById('v141SettingsMenu');
  if(!menu)return false;
  let row=document.getElementById('v6109MusicRow');
  if(!row){
    row=document.createElement('label');
    row.id='v6109MusicRow';
    row.className='v141-setting-row';
    row.innerHTML=`
      <span class="v141-setting-icon">🎵</span>
      <span class="v141-setting-copy">
        <b>Hintergrundmusik</b>
        <span>Dunkler, entspannter Grow-Legends-Fantasy-Beat, solange die App geöffnet ist.</span>
      </span>
      <input class="v141-switch" id="v6109MusicToggle" type="checkbox">
    `;
    const soundRow=document.getElementById('v141Sound')?.closest('.v141-setting-row');
    if(soundRow)soundRow.insertAdjacentElement('afterend',row);
    else menu.querySelector('.v141-settings-head')?.insertAdjacentElement('afterend',row);
  }
  const toggle=document.getElementById('v6109MusicToggle');
  if(toggle&&!toggle.dataset.bound){
    toggle.dataset.bound='1';
    toggle.addEventListener('change',()=>setMusic(toggle.checked));
  }
  refreshToggle();
  return true;
}

function refreshToggle(){
  const toggle=document.getElementById('v6109MusicToggle');
  if(toggle){
    try{toggle.checked=v141Settings?.music!==false}catch(e){toggle.checked=true}
  }
}

/* Respect the existing master Sound switch. */
try{
  if(typeof v141ApplySettings==='function'&&!window.__v6109ApplyWrapped){
    const base=v141ApplySettings;
    v141ApplySettings=function(){
      const r=base.apply(this,arguments);
      ensureMusicRow();
      syncMusic();
      return r;
    };
    try{window.v141ApplySettings=v141ApplySettings}catch(e){}
    window.__v6109ApplyWrapped=true;
  }
}catch(e){}

/* Keep the row present whenever settings are rebuilt. */
try{
  if(typeof v141BuildSettings==='function'&&!window.__v6109SettingsWrapped){
    const base=v141BuildSettings;
    v141BuildSettings=function(){
      const r=base.apply(this,arguments);
      ensureMusicRow();
      return r;
    };
    try{window.v141BuildSettings=v141BuildSettings}catch(e){}
    window.__v6109SettingsWrapped=true;
  }
}catch(e){}

function unlock(){
  if(unlocked)return;
  unlocked=true;
  ensureAudio();
  syncMusic();
}
document.addEventListener('pointerdown',unlock,{once:true,passive:true,capture:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});

document.addEventListener('visibilitychange',syncMusic,{passive:true});
window.addEventListener('pageshow',()=>{ensureMusicRow();syncMusic()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{ensureMusicRow();syncMusic()},120));

document.addEventListener('DOMContentLoaded',()=>{
  ensureMusicRow();
  refreshToggle();
},{once:true});

setTimeout(ensureMusicRow,220);

window.v6109MusicInfo=()=>({
  enabled:enabled(),
  unlocked,
  context:ctx?.state||'not-created',
  playing:!!source,
  hidden:document.hidden,
  loopSeconds:24,
  persistentIntervals:0
});
})();
