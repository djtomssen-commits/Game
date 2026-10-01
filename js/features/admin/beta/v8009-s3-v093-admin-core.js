/* ===== V4.02 Supabase Admin Panel ===== */
let v093IsAdmin=false;
let v093Events=[];
let v093News=[];

function v093Esc(v){return v073Escape(String(v??''))}

async function v093CheckAdmin(){
  if(!(await v073Init()) || !v073User)return false;

  const {data,error}=await v073Db
    .from('game_admins')
    .select('user_id')
    .eq('user_id',v073User.id)
    .maybeSingle();

  v093IsAdmin=!error && !!data;

  const state=document.querySelector('#v093AdminState');
  const content=document.querySelector('#v093AdminContent');
  const denied=document.querySelector('#v093AdminDenied');

  if(state){
    state.textContent=v093IsAdmin?'ADMIN':'KEIN ZUGRIFF';
    state.style.color=v093IsAdmin?'#a9e893':'#ef9d98';
  }
  if(content)content.style.display=v093IsAdmin?'block':'none';
  if(denied)denied.style.display=v093IsAdmin?'none':'block';

  v093BuildMenu();
  return v093IsAdmin;
}

async function v093LoadPublicContent(){
  if(!(await v073Init()))return;
  if(!v073User?.id)return;

  try{
    const now=new Date().toISOString();

    const ev=await v073Db
      .from('game_events')
      .select('id,name,description,starts_at,ends_at,is_active,created_at')
      .order('created_at',{ascending:false});

    if(!ev.error)v093Events=ev.data||[];

    const nw=await v073Db
      .from('game_news')
      .select('id,version,title,body,is_published,created_at')
      .eq('is_published',true)
      .order('created_at',{ascending:false})
      .limit(8);

    if(!nw.error)v093News=nw.data||[];

    if(document.querySelector('#world')?.classList.contains('active')){
      v085InstallWorld();
    }
  }catch(e){
    console.error('V4.02 public content',e);
  }
}

v085ActiveEvents=function(){
  const now=Date.now();
  const active=(v093Events||[]).filter(ev=>{
    if(!ev.is_active)return false;
    const start=ev.starts_at?new Date(ev.starts_at).getTime():0;
    const end=ev.ends_at?new Date(ev.ends_at).getTime():Infinity;
    return now>=start && now<=end;
  });

  if(!active.length){
    return `
      <div class="v085-event-card">
        <div class="v085-event-title">Aktuell kein Event aktiv</div>
        <div class="v085-event-sub">Sobald ein Event startet, erscheint es hier direkt.</div>
        <div class="v085-event-status">KEIN EVENT</div>
      </div>`;
  }

  return active.map(ev=>`
    <div class="v085-event-card">
      <div class="v085-event-title">${v093Esc(ev.name)}</div>
      <div class="v085-event-sub">${v093Esc(ev.description||'Zeitlich begrenztes Event.')}</div>
      <div class="v085-event-status">AKTIV</div>
    </div>`).join('');
};

v085NewsHtml=function(){
  const source=(v093News||[]).length?v093News:[
    {version:'V4.02',title:'Dampf-System korrigiert',body:'Keine ungewollte Zeit-Regeneration mehr.'},
    {version:'V4.02',title:'Händler-Vergleich',body:'Shop-Items zeigen besser, schlechter oder gleichwertig.'},
    {version:'V4.02',title:'Neue Welt-Startseite',body:'Begrüßung, Events, Update-News und Schnellzugriffe.'}
  ];

  return source.map(n=>`
    <div class="v085-news">
      <div class="v085-news-top">
        <div class="v085-news-title">${v093Esc(n.title)}</div>
        <div class="v085-news-version">${v093Esc(n.version||'NEWS')}</div>
      </div>
      <div class="v085-news-text">${v093Esc(n.body||n.text||'')}</div>
    </div>`).join('');
};

async function v093AdminLoadLists(){
  if(!v093IsAdmin)return;

  const ev=await v073Db.from('game_events')
    .select('*').order('created_at',{ascending:false});

  if(!ev.error)v093Events=ev.data||[];

  const nw=await v073Db.from('game_news')
    .select('*').order('created_at',{ascending:false}).limit(20);

  const eventList=document.querySelector('#v093EventList');
  if(eventList){
    eventList.innerHTML=(v093Events||[]).map(ev=>`
      <div class="v093-admin-item">
        <div class="v093-admin-item-top">
          <b>${v093Esc(ev.name)}</b>
          <span class="pill">${ev.is_active?'AKTIV':'AUS'}</span>
        </div>
        <div class="tiny">${v093Esc(ev.description||'')}</div>
        <div class="v093-admin-actions">
          <button class="btn secondary" onclick="v093ToggleEvent('${ev.id}',${!ev.is_active})">${ev.is_active?'Deaktivieren':'Aktivieren'}</button>
          <button class="btn danger" onclick="v093DeleteEvent('${ev.id}')">Löschen</button>
        </div>
      </div>`).join('') || '<div class="empty">Noch keine Events.</div>';
  }

  const newsList=document.querySelector('#v093NewsList');
  if(newsList && !nw.error){
    newsList.innerHTML=(nw.data||[]).map(n=>`
      <div class="v093-admin-item">
        <div class="v093-admin-item-top">
          <b>${v093Esc(n.title)}</b>
          <span class="pill">${v093Esc(n.version||'NEWS')}</span>
        </div>
        <div class="tiny">${v093Esc(n.body||'')}</div>
        <div class="v093-admin-actions">
          <button class="btn secondary" onclick="v093ToggleNews('${n.id}',${!n.is_published})">${n.is_published?'Ausblenden':'Veröffentlichen'}</button>
          <button class="btn danger" onclick="v093DeleteNews('${n.id}')">Löschen</button>
        </div>
      </div>`).join('') || '<div class="empty">Noch keine News.</div>';
  }
}

async function v093SaveEvent(){
  if(!v093IsAdmin)return;

  const name=document.querySelector('#v093EventName')?.value.trim();
  const description=document.querySelector('#v093EventDesc')?.value.trim();
  const start=document.querySelector('#v093EventStart')?.value;
  const end=document.querySelector('#v093EventEnd')?.value;
  const active=!!document.querySelector('#v093EventActive')?.checked;

  if(!name)return v063Toast('Event-Name fehlt','warn');

  const {error}=await v073Db.from('game_events').insert({
    name,
    description,
    starts_at:start?new Date(start).toISOString():new Date().toISOString(),
    ends_at:end?new Date(end).toISOString():new Date(Date.now()+7*86400000).toISOString(),
    is_active:active,
    created_by:v073User.id
  });

  if(error)return v063Toast('Event konnte nicht gespeichert werden','error',error.message);

  v063Toast('Event gespeichert','success',name);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
}

async function v093SaveNews(){
  if(!v093IsAdmin)return;

  const version=document.querySelector('#v093NewsVersion')?.value.trim()||'NEWS';
  const title=document.querySelector('#v093NewsTitle')?.value.trim();
  const body=document.querySelector('#v093NewsText')?.value.trim();

  if(!title||!body)return v063Toast('Titel und Text fehlen','warn');

  const {error}=await v073Db.from('game_news').insert({
    version,title,body,is_published:true,created_by:v073User.id
  });

  if(error)return v063Toast('News konnte nicht gespeichert werden','error',error.message);

  v063Toast('Update veröffentlicht · Login-Popup aktiv','success',title);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
}

window.v093ToggleEvent=async(id,state)=>{
  if(!v093IsAdmin)return;
  await v073Db.from('game_events').update({is_active:state}).eq('id',id);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
};

window.v093DeleteEvent=async(id)=>{
  if(!v093IsAdmin||!confirm('Event wirklich löschen?'))return;
  await v073Db.from('game_events').delete().eq('id',id);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
};

window.v093ToggleNews=async(id,state)=>{
  if(!v093IsAdmin)return;
  await v073Db.from('game_news').update({is_published:state}).eq('id',id);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
};

window.v093DeleteNews=async(id)=>{
  if(!v093IsAdmin||!confirm('News wirklich löschen?'))return;
  await v073Db.from('game_news').delete().eq('id',id);
  await v093AdminLoadLists();
  await v093LoadPublicContent();
};

function v093BuildMenu(){
  const panel=document.querySelector('#v032MenuPanel');
  if(!panel)return;

  const adminExisting=panel.querySelector('[data-screen="admin"]');

  if(v093IsAdmin && !adminExisting){
    const sep=document.createElement('div');
    sep.className='v086-menu-separator';
    const btn=document.createElement('button');
    btn.className='top-menu-item';
    btn.dataset.screen='admin';
    btn.innerHTML='<span>🛡️</span>Admin';
    btn.onclick=async()=>{
      v032Go('admin');
      await v093CheckAdmin();
      await v093AdminLoadLists();
    };
    panel.append(sep,btn);
  }

  if(!v093IsAdmin && adminExisting){
    adminExisting.previousElementSibling?.classList.contains('v086-menu-separator') && adminExisting.previousElementSibling.remove();
    adminExisting.remove();
  }
}

document.querySelector('#v093SaveEvent')?.addEventListener('click',v093SaveEvent);
document.querySelector('#v093SaveNews')?.addEventListener('click',v093SaveNews);

/* Admin menu ownership is driven by v093CheckAdmin / account lifecycle. */

(async()=>{
  try{
    await v093LoadPublicContent();
    await v093CheckAdmin();
    if(v093IsAdmin)await v093AdminLoadLists();
  }catch(e){console.error('V4.02 admin init',e)}
})();
