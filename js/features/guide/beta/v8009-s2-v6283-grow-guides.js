(()=>{
'use strict';
if(window.__V6283_GROW_GUIDES__)return;window.__V6283_GROW_GUIDES__=true;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ctx(){
  const tab=window.v6163GrowTabs?.active||'grow';
  if(tab==='stock'){
    const v=window.v6282GrowEconomy?.state?.()?.view||'stock';
    return v==='dealer'?'dealer':'stock';
  }
  return tab;
}
function cards(rows){return `<div class="v6283-guide-grid">${rows.map(x=>`<div class="v6283-guide-card"><i>${x[0]}</i><div><b>${esc(x[1])}</b><span>${esc(x[2])}</span></div></div>`).join('')}</div>`}
function content(which){
  if(which==='grow')return {
    title:'🌱 Growroom',
    intro:'Hier pflanzt, pflegst und erntest du. Die Ernte erzeugt echte Blüten für dein Blütenlager.',
    rows:[
      ['🌰','Samen & Sorten','Wähle eine Sorte aus dem Samenlager und bepflanze freie Töpfe.'],
      ['💧','Pflege','Pflegeaktionen verbessern den Grow und helfen bei Qualität und Ertrag.'],
      ['🏷️','Qualität','Blüten nutzen die Grow-Stufen C, B, A, S und S+. S+ ist die höchste Qualitätsstufe.'],
      ['✂️','Ernte','Fertige Pflanzen liefern Gold, EXP, Samenfragmente und eine Blüte für das Lager.'],
      ['🧙','Buffs','Blüten werden nicht mehr auf drei Plätze begrenzt. Buffs aktivierst du später aus dem Blütenlager.'],
      ['💡','Ausbau','Lampe, Töpfe und Raum bleiben die permanenten Growroom-Upgrades.']
    ],
    note:'Grow-Aufträge und Genetik haben eigene Tabs. Das hält die eigentliche Pflanzenansicht übersichtlich.'
  };
  if(which==='stock')return {
    title:'🎒 Blütenlager & Veredelung',
    intro:'Alle geernteten Blüten werden dauerhaft gesammelt und nach Sorte, Qualität, Mutation und Veredelung gestapelt.',
    rows:[
      ['📦','Keine 3er-Grenze','Das alte Limit von drei Blüten ist entfernt. Gleiche Blüten erscheinen als Stapel.'],
      ['🔥','Buff aktivieren','Normale Blüten können weiterhin den zeitlich begrenzten Grow-Buff aktivieren bzw. ersetzen.'],
      ['🌬️','Veredeln','Zwei Trocknungsplätze veredeln jeweils eine Blüte in 6 Stunden.'],
      ['✨','Veredelter Wert','Eine veredelte Blüte bekommt beim Dealer +2 Punkte, kann danach aber nicht mehr als Buff genutzt werden.'],
      ['🏰','Gilde','Blüten können weiterhin für das Gilden-System gespendet werden.'],
      ['🏷️','Dealerwert','C = 1 · B = 2 · A = 3 · S = 4 · S+ = 5 Punkte. Mutation gibt +1 Punkt, Veredelung +2 Punkte.']
    ],
    note:'Die Entscheidung ist bewusst: Blüte für einen Buff behalten oder veredeln und später wertvoller beim Dealer einsetzen.'
  };
  if(which==='dealer')return {
    title:'🕶️ Blüten-Dealer',
    intro:'Der Dealer macht angesparte Blüten zu einer langfristigen Wirtschaftsressource. Seine Angebote wechseln täglich.',
    rows:[
      ['🕛','Täglicher Reset','Es gibt sechs Angebote pro Tag. Der Dealer setzt seine Auswahl um 00:00 Uhr zurück.'],
      ['🎯','Anforderungen','Angebote können Mindestqualität oder eine bestimmte Sorte verlangen. Dadurch ist nicht jede Blüte gleich geeignet.'],
      ['🪙','Belohnungen','Mögliche Tauschwaren sind Gold, Samenfragmente, Verzauberungsrollen, Edelsteine, Zeit-Samen und ein seltenes Zufalls-Item.'],
      ['💰','Hohe Preise','Wertvolle Angebote sind absichtlich teuer, damit Dungeon, Quest und normale Händler relevant bleiben.'],
      ['✨','Veredelte Blüten','Veredelte Ware bekommt +2 Dealer-Punkte. Mutierte Blüten bekommen +1 Punkt.'],
      ['📉','Verbrauch','Beim Tausch werden passende Blüten aus dem Lager verbraucht. Prüfe deshalb vor dem Tausch, was du für Buffs behalten willst.']
    ],
    note:'Das Zufalls-Item ist kein sicherer High-End-Drop: überwiegend Blau, nur selten Epic. Legendär/Mystisch kommt nicht aus dem Blüten-Dealer.'
  };
  if(which==='genetics')return {
    title:'🧬 Genetik',
    intro:'Das Genetik-Labor bleibt der Bereich für Kreuzungen, Hybride und Essenzen.',
    rows:[
      ['🧬','Kreuzungen','Kombiniere geeignete Genetik und arbeite auf neue Kreuzungen hin.'],
      ['🌿','Hybride','Hybride sind besondere Sorten und Teil des langfristigen Grow-Fortschritts.'],
      ['⚗️','Essenzen','Essenzen gehören zum Genetik-Fortschritt und werden in diesem Tab verwaltet.'],
      ['📗','Sortenfortschritt','Entdeckte Sorten und Mutationen ergänzen weiterhin dein Sortenbuch.']
    ],
    note:'Der Blüten-Dealer ersetzt das Genetik-System nicht. Genetik bleibt ein eigener Fortschrittsweg.'
  };
  return {
    title:'📋 Grow-Aufträge',
    intro:'Die vorhandenen Grow-Aufträge bleiben das tägliche Zielsystem. Der Dealer ist bewusst davon getrennt.',
    rows:[
      ['📅','Täglich neu','Die Aufträge werden regelmäßig erneuert und bieten sechs Aufgaben.'],
      ['🎚️','Unterschiedliche Schwierigkeit','Die Aufgaben reichen von leicht bis zum Meisterauftrag.'],
      ['🌱','Abwechslung','Aufträge können Ernten, Pflege, Qualitätsstufen, Sorten, Mutationen, Hybride oder andere Grow-Aktivitäten verlangen.'],
      ['🎁','Belohnungen','Erledigte Aufträge werden direkt im Aufträge-Tab abgeschlossen und abgeholt.']
    ],
    note:'Aufträge sagen dir, was du tun sollst. Der Dealer entscheidet dagegen, wofür du deine angesparte Ernte ausgibst.'
  };
}
function open(){
  document.querySelector('.v6283-guide-overlay')?.remove();
  const c=content(ctx());
  const ov=document.createElement('div');
  ov.className='v6283-guide-overlay';
  ov.innerHTML=`<div class="v6283-guide-modal" role="dialog" aria-modal="true">
    <div class="v6283-guide-head"><div><small>INFORMATIONEN</small><h2>❓ ${esc(c.title)}</h2></div><button class="v6283-guide-close" data-v6283-close>✕</button></div>
    <div class="v6283-guide-body">
      <div class="v6283-guide-intro"><b>${esc(c.intro)}</b><span>Der Guide passt sich automatisch an den gerade geöffneten Growroom-Bereich an.</span></div>
      ${cards(c.rows)}
      <div class="v6283-guide-note">${esc(c.note)}</div>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-v6283-close]').forEach(b=>b.onclick=()=>ov.remove());
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
}
function makeBtn(){
  const b=document.createElement('button');
  b.type='button';b.className='v6283-guide-btn';b.dataset.v6283Guide='1';b.textContent='?';
  b.setAttribute('aria-label','Informationen zu diesem Growroom-Bereich');
  b.title='Informationen / Guide';
  return b;
}
function ensureButtons(){
  const root=document.querySelector('#grow .v492-grow');if(!root)return;
  const sign=root.querySelector(':scope > .v492-sign');
  if(sign&&!sign.querySelector(':scope > [data-v6283-guide]'))sign.appendChild(makeBtn());
  const inline=root.querySelector('#v6163Inline');
  const head=inline?.querySelector('.v6163-inline-head,.v6282-econ-head');
  if(head&&!head.querySelector(':scope > [data-v6283-guide]'))head.appendChild(makeBtn());
}
document.addEventListener('click',e=>{
  const b=e.target instanceof Element?e.target.closest('[data-v6283-guide]'):null;
  if(!b)return;
  e.preventDefault();e.stopPropagation();open();
},true);
/* V8.009: broad Grow subtree observer retired.
   v6163 owns tab/view rebuilds and calls this guide refresh directly. */
ensureButtons();
document.addEventListener('DOMContentLoaded',ensureButtons,{once:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='grow')ensureButtons()},{passive:true});
window.v6283GrowGuide={open,context:ctx,refresh:ensureButtons};
window.v6283GrowGuideDiagnostics=()=>({
  version:'V6.283',
  context:ctx(),
  headerGuide:!!document.querySelector('#grow .v492-sign [data-v6283-guide]'),
  inlineGuide:!!document.querySelector('#grow #v6163Inline [data-v6283-guide]')
});
})();
