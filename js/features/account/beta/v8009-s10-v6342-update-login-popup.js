(()=>{
'use strict';
if(window.__V6342_UPDATE_LOGIN_POPUP__)return;
window.__V6342_UPDATE_LOGIN_POPUP__=true;
let busy=false,shownNewsId='',bootTimer=0;

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(_){return''}}
function db(){try{return typeof v073Db!=='undefined'&&v073Db?v073Db:null}catch(_){return null}}
function localKey(userId,newsId){return `grow_legends_update_seen:${userId}:${newsId}`}
function locallySeen(userId,newsId){try{return localStorage.getItem(localKey(userId,newsId))==='1'}catch(_){return false}}
function markLocal(userId,newsId){try{localStorage.setItem(localKey(userId,newsId),'1')}catch(_){}}
function removePopup(){document.getElementById('v6342UpdatePopup')?.remove()}

function mount(news,userId){
  removePopup();
  const ov=document.createElement('div');
  ov.id='v6342UpdatePopup';
  ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  ov.innerHTML=`<section class="v6342-update-card">
    <button type="button" class="v6342-update-close" aria-label="Schließen">×</button>
    <div class="v6342-update-eyebrow">🌿 Neues Grow Legends Update <span class="v6342-update-version">${esc(news.version||'UPDATE')}</span></div>
    <h2>${esc(news.title||'Neues Update')}</h2>
    <div class="v6342-update-body">${esc(news.body||'Ein neues Grow Legends Update wurde veröffentlicht.')}</div>
    <div class="v6342-update-foot">
      <button type="button" class="v6342-update-confirm">✅ Verstanden · Weiterspielen</button>
      <div class="v6342-update-note">Diese Update-Meldung wird deinem Account nur einmal angezeigt.</div>
    </div>
  </section>`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('show'));
  const close=()=>{ov.classList.remove('show');setTimeout(()=>ov.remove(),170)};
  ov.querySelector('.v6342-update-confirm')?.addEventListener('click',close);
  ov.querySelector('.v6342-update-close')?.addEventListener('click',close);
  markLocal(userId,String(news.id));
  return true;
}

async function markServerSeen(userId,newsId){
  const x=db();if(!x)return false;
  try{
    const {error}=await x.from('player_update_reads').insert({user_id:userId,news_id:newsId});
    if(error && String(error.code||'')!=='23505')console.warn('V6.347 update seen',error);
    return !error || String(error.code||'')==='23505';
  }catch(e){console.warn('V6.347 update seen',e);return false}
}

async function checkUpdatePopup(){
  if(busy)return false;
  const userId=uid(),x=db();
  if(!userId||!x)return false;
  busy=true;
  try{
    const {data:news,error}=await x.from('game_news')
      .select('id,version,title,body,created_at,popup_on_login')
      .eq('is_published',true)
      .eq('popup_on_login',true)
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
    if(error){console.warn('V6.347 update lookup',error);return false}
    if(!news?.id)return false;
    const newsId=String(news.id);
    if(shownNewsId===newsId||locallySeen(userId,newsId))return false;

    const {data:read,error:readErr}=await x.from('player_update_reads')
      .select('news_id')
      .eq('user_id',userId)
      .eq('news_id',newsId)
      .maybeSingle();
    if(readErr){console.warn('V6.347 update read lookup',readErr);return false}
    if(read?.news_id){markLocal(userId,newsId);return false}

    shownNewsId=newsId;
    if(!mount(news,userId))return false;
    void markServerSeen(userId,newsId);
    return true;
  }catch(e){console.warn('V6.347 update popup',e);return false}
  finally{busy=false}
}
window.v6342CheckUpdatePopup=checkUpdatePopup;
window.v6342UpdatePopupDiagnostics=()=>({version:'V6.347',userId:uid(),busy,shownNewsId,mounted:!!document.getElementById('v6342UpdatePopup')});

function schedule(ms=850){clearTimeout(bootTimer);bootTimer=setTimeout(()=>void checkUpdatePopup(),ms)}
window.addEventListener('growlegends:account-ready',()=>schedule(850));
window.addEventListener('pageshow',()=>schedule(1600),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(1200)},{passive:true});
setTimeout(()=>schedule(0),2600);
})();
