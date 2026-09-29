import { chromium } from 'playwright';
import path from 'node:path';

const root=process.cwd();
const p=s=>path.join(root,s);
const assert=(x,m)=>{if(!x)throw new Error(m)};

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

await page.setContent(`<!doctype html><html><body>
<div class="app"><header style="height:60px"></header></div>
<div id="guild" class="active">
  <div class="v254-guild-shell">
    <div id="v254GuildNoGuild"></div>
    <div id="v254GuildOverview">
      <div id="v257RequestsCard"><span id="v257RequestCount">0</span><div id="v257GuildRequests"><div class="v257-search-empty">Keine offenen Beitrittsanfragen</div></div></div>
      <div class="v254-card v254-inner"><div id="v257GuildManagement"></div></div>
      <div id="v254GuildDashboard"><div class="v254-guild-head"></div></div>
    </div>
  </div>
</div>
<button id="v254CreateGuild"></button>
<button id="v4144GuildChatTab"></button>
<div id="v4144GuildChatPanel"><button id="v4144GuildChatClose"></button><div id="v4144GuildChatGuild"></div><div id="v4144GuildChatList"></div><textarea id="v4144GuildChatInput"></textarea><button id="v4144GuildChatSend"></button></div>
</body></html>`);

await page.evaluate(()=>{
  window.v073User={id:'qa-user',is_anonymous:false};
  window.__V200_AUTH_READY__=true;
  window.v254Guild={id:'g1',name:'QA Guild',tag:'QA',guild_buds:42,guild_xp:900};
  window.v254Membership={guild_id:'g1',role:'leader'};
  window.v254Members=[{user_id:'qa-user',role:'leader',profile:{character_name:'QA',class_id:'grower',class_name:'Bud-Barbar',level:100}}];
  window.v254GuildEsc=x=>String(x??'');
  window.v080AvatarFor=()=>'/qa.png';
  window.v329IsOnline=()=>true;
  window.v254MemberHtml=()=>''; window.v254RenderGuild=()=>{};
  window.v257RenderManagement=()=>{}; window.v257RenderRequests=()=>{};
  window.v257CanManage=()=>true; window.v257IsLeader=()=>true;
  window.v257SetRole=()=>{}; window.v257KickMember=()=>{};
  window.v032Go=()=>{}; window.s={guildLeaveLockUntil:0,characterName:'QA'};
  window.v6124PaintGuildLock=()=>{}; window.v6124GuildLockActive=()=>false; window.v6124GuildLockRemaining=()=>0;
  window.v073Db={
    from:()=>({
      select(){return this},eq(){return this},order(){return this},limit(){return Promise.resolve({data:[],error:null})},
      insert(){return Promise.resolve({error:null})}
    })
  };
});

await page.addScriptTag({path:p('js/features/guild/beta/v8008-c25-guildoverview-owner.js')});
await page.evaluate(()=>window.v8008C25InstallGuildLock?.());
await page.waitForTimeout(120);

const overview=await page.evaluate(()=>({
  hero:!!document.querySelector('#guild .v554-guild-hero'),
  progress:!!document.querySelector('#guild .v556-progress'),
  noVisibleLoader:!document.getElementById('v561GuildLoading'),
  lockInstaller:!!window.__V8008_C25_GUILD_LOCK_INSTALLER__,
  lockQa:typeof window.v6124GuildLockQA==='function'
}));
assert(Object.values(overview).every(Boolean),'Final Guild QA: overview/load-gate/lock owner incomplete');

await page.addScriptTag({path:p('js/features/guild/beta/v8008-c25-guildchat-owner.js')});
await page.evaluate(()=>{
  window.v8008C25InstallChatBootstrap?.();
  window.v8008C25InstallChatViewport?.();
  window.v4144SyncGuildChat?.();
});
await page.waitForTimeout(50);

const chat=await page.evaluate(()=>({
  open:typeof window.v4144OpenGuildChat==='function',
  close:typeof window.v4144CloseGuildChat==='function',
  sync:typeof window.v4144SyncGuildChat==='function',
  bootstrap:typeof window.v4146EnsureGuildChatIdentity==='function' && !!window.__V8008_C25_CHAT_BOOT_INSTALLER__,
  viewport:!!window.__V8008_C25_CHAT_VIEW_INSTALLER__,
  closeVisible:getComputedStyle(document.getElementById('v4144GuildChatClose')).visibility!=='hidden'
}));
assert(Object.values(chat).every(Boolean),'Final Guild QA: chat/bootstrap/viewport owner incomplete');

if(errors.length)throw new Error('Browser errors: '+errors.join(' | '));
console.log(JSON.stringify({ok:true,overview,chat},null,2));
await browser.close();
