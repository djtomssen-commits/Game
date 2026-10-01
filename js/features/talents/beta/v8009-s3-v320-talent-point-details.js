/* ===== V4.02 Exact per-point display =====
   Shows what ONE next talent point changes and the exact current accumulated
   effect for every normal talent node. Mechanics are sourced from V4.02.
*/
const V320_POINT_INFO={
 wucht:[
  ['Direkter Schaden',.6,'%'],['Stärke',.6,'%'],['Wuchtschlag-Schaden',2,'%'],
  ['Schaden des nächsten Angriffs nach Wucht',.6,'%'],['Schaden gegen Gegner unter 30 % LP',1,'%'],
  ['Stärke',.5,'%'],['Widerstandskraft-Durchdringung',.55,'%']
 ],
 tank:[
  ['Maximale Lebenspunkte',1,'%'],['Schadensreduktion',.5,'%'],['Maximale Lebenspunkte',.7,'%'],
  ['Regeneration alle 3 Gegnerangriffe',.2,'% der max. LP'],['Reflektierter erlittener Schaden',.4,'%'],
  ['Schadensreduktion',.3,'%'],['Maximale Lebenspunkte',.6,'%']
 ],
 rage:[
  ['Chance auf zusätzlichen Angriff',.5,'%'],['Lebensraub',.3,'%'],
  ['Schaden pro Kampfrunde',.15,'% pro Runde'],['Schaden gegen Gegner unter 30 % LP',.4,'%'],
  ['Lebensraub unter 50 % LP',.2,'%'],['Chance auf 40-%-Folgetreffer nach Crit/Wucht',.3,'%'],
  ['Heilung bei jedem 5. Angriff',.15,'% der max. LP']
 ],
 precision:[
  ['Geschick',.6,'%'],['Crit-Chance',.5,'%'],['Crit-Schaden',2,'%'],
  ['Verteidigungsdurchdringung',.6,'%'],['Chance auf +50 % Zusatzschaden bei Crit',.4,'%'],
  ['Crit-Chance',.3,'%'],['Schaden gegen Gegner unter 30 % LP',.4,'%']
 ],
 dodge:[
  ['Ausweichchance',.5,'%'],['Schaden des nächsten Angriffs nach Ausweichen',.4,'%'],
  ['Ausweichchance beim ersten Gegnerangriff',.3,'%'],['Konterchance nach Ausweichen',.3,'%'],
  ['Schaden nach mehreren Ausweichmanövern',.3,'%'],['Ausweichchance nach eigenem Crit',.3,'%'],
  ['Dauerhafte Ausweichchance',.2,'%']
 ],
 salvo:[
  ['Doppeltreffer-Chance',.5,'%'],['Grundschaden des zweiten Treffers',2,'%'],
  ['Crit-Chance von Folgetreffern',.4,'%'],['Chance auf dritten Treffer',.4,'%'],
  ['Stärke weiterer Treffer',.3,'%'],['Chance auf 40-%-Zusatztreffer bei Crit',.3,'%'],
  ['Chance auf weiteren Kettentreffer',.2,'%']
 ],
 magic:[
  ['Intelligenz',.6,'%'],['Zauberschaden',.6,'%'],['Zusatzschaden jedes 6. Zaubers',.4,'%'],
  ['Chance auf Rauchdetonation',.3,'%'],['Zauberschaden',.3,'%'],['Intelligenz',.3,'%'],
  ['Magische Durchdringung',.4,'%']
 ],
 critmagic:[
  ['Crit-Chance',.5,'%'],['Crit-Schaden',2,'%'],['Schaden des nächsten Zaubers nach Crit',.4,'%'],
  ['Chance auf Kettenfunken',.3,'%'],['Crit-Aufladung nach Nicht-Crit',.15,'%'],
  ['Chance auf zusätzliche Explosion',.3,'%'],['Zusätzliche Chaos-Crit-Aufladung',.1,'%']
 ],
 smoke:[
  ['Schadensreduktion',.5,'%'],['Chance auf Rauch-DOT',.3,'%'],
  ['Zusätzliche Reduktion des ersten Gegnerangriffs',.3,'%'],['Zusätzliche DOT-Chance',.2,'%'],
  ['Rauch-DOT-Schaden',.3,'% Grundschaden'],['Stärke der Rauchbarriere',.3,'% der max. LP'],
  ['Zusätzliche Heilung aus DOT-Schaden',.25,'%']
 ],
 summon:[
  ['Beschwörungschance',.3,' Prozentpunkte'],
  ['Begleiterschaden',.8,'%'],
  ['Begleiter-Crit-Chance',.4,' Prozentpunkte'],
  ['Begleiterschaden',.5,'%'],
  ['Chance auf zweiten Begleiter',.25,' Prozentpunkte'],
  ['Beschwörungschance',.25,' Prozentpunkte · zusätzlich +0,2 % Intelligenz pro Rang'],
  ['Begleiterschaden',.5,'%']
 ],
 soul:[
  ['Lebensraub',.2,'%'],
  ['Maximale Lebenspunkte',.6,'%'],
  ['Schadensreduktion',.3,'%'],
  ['Lebensraub',.15,'%'],
  ['Begleiterschaden',.25,'%'],
  ['Schadensreduktion',.25,'%'],
  ['Maximale Lebenspunkte',.5,'%']
 ],
 curse:[
  ['Fluch-/DOT-Chance',.3,' Prozentpunkte'],
  ['DOT-Schaden',.4,'%'],
  ['Rüstungsdurchdringung',.25,'%'],
  ['Direkter Schaden',.25,'%'],
  ['Fluchchance',.2,' Prozentpunkte · zusätzlich +0,2 % Fluchverstärkung pro Rang'],
  ['DOT-Schaden',.3,'%'],
  ['Direkter Schaden',.25,'%']
 ]
};

function v320Num(n){
 return Number(n).toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:2});
}
function v320PointInfo(branch,i,rank,max){
 const x=V320_POINT_INFO[branch]?.[i];
 if(!x)return '';
 const [label,per,unit]=x;
 const current=per*rank,total=per*max;
 const next=rank<max
  ?`<div class="v320-next">➡️ Nächster Punkt: +${v320Num(per)}${unit}</div>`
  :`<div class="v320-max">✅ Maximale Stufe erreicht</div>`;
 return `<div class="v320-point-info">
   <b>${label}</b><br>
   Aktuell durch dieses Talent: <b>+${v320Num(current)}${unit}</b><br>
   Maximum (${max} Punkte): <b>+${v320Num(total)}${unit}</b>
   ${next}
  </div>`;
}
window.v320PointInfo=v320PointInfo;

/* Rebuild only the talent UI. Combat logic remains untouched. */
renderSkillTree=function(){
 const box=document.querySelector('#skillTree');if(!box)return;
 const pill=document.querySelector('#skillPoints');
 if(pill)pill.textContent=v314Available();
 if(!s.playerClass){box.innerHTML='<div class="empty">Wähle zuerst deine Klasse.</div>';return}
 const branches=V314_BRANCHES[s.playerClass]||[];
 const cost=Math.max(500,(Number(s.level)||1)*500);
 box.innerHTML=`<div class="v314-top">
   <div class="tiny">Verfügbar: <b>${v314Available()}</b> · Verteilt: <b>${v314Spent()}</b> / ${v314Earned()} verdient</div>
   <button class="btn secondary v314-reset" onclick="v314Reset()">↩️ Reset · ${cost.toLocaleString('de-DE')} Gold</button>
  </div><div class="v314-tree">`+
  branches.map(b=>`<section class="v314-branch">
   <div class="v314-branch-head"><div class="v314-branch-title">${b.title}</div><div class="v314-branch-points">${b.theme} · ${v314BranchSpent(b.id)}/100 Punkte</div></div>
   ${Array.from({length:7},(_,i)=>{
    const sr=v314Rank(b.id,'s',i),sm=V314_SEG_RANKS[i],su=v314NodeUnlocked(b.id,'s',i);
    const mr=v314Rank(b.id,'m',i),mu=v314NodeUnlocked(b.id,'m',i),master=i===6;
    return `<div class="v314-node ${su?'':'locked'} ${sr?'on':''}">
      <div class="v314-node-head"><span class="v314-node-icon">${b.icon}</span><span class="v314-node-name">${b.seg[i]}</span><span class="v314-node-rank">${sr}/${sm}</span></div>
      <div class="v314-node-desc v6226-normal-desc">${v314Desc(b.id,'s',i)}</div>
      ${v320PointInfo(b.id,i,sr,sm)}
      ${!su?`<div class="v314-lock v6257-prereq">${v6257NormalTalentPrerequisite(b.id,i)}</div>`:''}
      <button class="btn secondary" onclick="v314Upgrade('${b.id}','s',${i})" ${!su||sr>=sm||v314Available()<1?'disabled':''}>${su?'+ Talentpunkt':'Gesperrt'}</button>
     </div>
     <div class="v314-node milestone ${master?'master':''} ${mu?'':'locked'} ${mr?'on':''}">
      <div class="v314-node-head"><span class="v314-node-icon">${master?'👑':'⭐'}</span><span class="v314-node-name">${b.mile[i]}</span><span class="v314-node-rank">${mr}/1</span></div>
      <div class="v314-node-desc">${v314Desc(b.id,'m',i)}</div>
      <button class="btn ${master?'gold':'secondary'}" onclick="v314Upgrade('${b.id}','m',${i})" ${!mu||mr||v314Available()<1?'disabled':''}>${master?'Meistertalent lernen':'Freischalten'}</button>
      ${!mu?`<div class="v314-lock">🔒 Level ${V314_LEVELS[i]} · ${V314_REQ[i]} Astpunkte</div>`:''}
     </div>`;
   }).join('')}
  </section>`).join('')+`</div>`;
};

const v320BaseRender=render;
render=function(){
 const r=v320BaseRender();
 try{renderSkillTree()}catch(e){console.error('V4.02 talent point detail render',e)}
 
 const line=document.querySelector('#v141VersionLine');
 return r;
};
