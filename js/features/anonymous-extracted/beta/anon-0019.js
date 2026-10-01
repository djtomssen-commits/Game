

/* ===== V4.02 stable auth/cloud compatibility declarations ===== */
const V075_SITE_URL='https://gamenew.djtomssen.workers.dev';

let v075AuthMode='login';
let v075CloudLoadedFor=null;
let v075Saving=false;
let v075SaveTimer=null;
let v075ApplyingCloud=false;
let v075InitialAuthChecked=false;

function v075MeaningfulLocalSave(){
  return !!(
    s.characterNameSet ||
    (Number(s.level)||1)>1 ||
    (s.inventory?.length||0)>0 ||
    (s.gold||0)>100 ||
    (s.dungeon?.completed?.length||0)>0 ||
    (s.story?.bossesDefeated||0)>0
  );
}

function v075SanitizeSave(obj){
  if(!obj || typeof obj!=='object')return null;
  const clone=JSON.parse(JSON.stringify(obj));
  clone.social??={};
  if(v073User?.id)clone.social.playerId=v073User.id;
  return clone;
}

/* V4.02 provides the real implementations at the end of the document. */
function v075Overlay(show=true){
  document.querySelector('#v075AuthOverlay')?.classList.toggle('show',show);
}
function v075SetAuthMode(mode){ v075AuthMode=mode==='register'?'register':'login'; }
async function v075GetCloudSave(){ return null; }
async function v075WriteCloudSave(){ return false; }
function v075ScheduleSave(){ return; }
async function v075ApplyCloudSave(){ return false; }
async function v075ResolveCloudAfterLogin(){ return false; }
async function v075EmailLogin(){ return false; }
async function v075Google(){ return false; }
async function v075AfterAuthReady(){ return false; }
function v075BindAuthUi(){ return; }

