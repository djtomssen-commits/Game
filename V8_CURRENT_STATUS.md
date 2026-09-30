## 0. VERBINDLICHE ARCHITEKTURREGEL

- **Keine neuen Patch-Schichten über bestehende Renderer legen.**
- Änderungen immer direkt im aktuell kanonischen Owner/Renderer bzw. dessen bestehender CSS-/JS-Datei durchführen.
- Keine neuen `render...`-Wrapper, Monkey-Patches, nachträglichen `setTimeout`-/`requestAnimationFrame`-Painter oder `MutationObserver`, wenn derselbe Effekt direkt im Owner erzeugt werden kann.
- Wird ein alter Nachbearbeitungs-Wrapper durch die direkte Integration überflüssig, muss er im selben Durchgang entfernt bzw. aus der aktiven Beta-Ladekette genommen werden.
- Neue Hilfsfunktionen sind nur erlaubt, wenn sie reine gemeinsame Daten-/Utility-Logik sind und **keinen zweiten Render-Lifecycle** erzeugen.
- Ziel: pro Feature genau eine nachvollziehbare kanonische Render-/Lifecycle-Kette statt wieder hunderter übereinanderliegender Render-Fixes.

# Grow Legends – V8 Arbeitsstand

> **Diese Datei ist die zentrale Übergabe für neue Chats.**
> Bei einem neuen Chat zuerst diese Datei lesen und danach den aktuellen `main`-HEAD prüfen.
> Nicht aus Chat-Erinnerung raten, wenn Repo-Stand und Chat voneinander abweichen.

## 1. Aktueller Stand

- Projekt: **Grow Legends**
- Aktuelle Beta-Linie: **V8.009**
- Arbeitsbranch: **main**
- Letzter automatisiert geprüfter Code-Commit vor dieser Statusdatei:
  `b19b2d3b83006d1da7c65e002863f7aa27e03e25`
- Aktuelle Unterphase: **V8.009-PVP-SPRINT-1-HALL-AVATAR-FRAME-MANUAL-CHECK**
- Nutzer-Video bestätigt: betroffen ist konkret **Dungeon 2**.
- Sichtbares Fehlerbild:
  - zunächst korrekter D2-Hintergrund + korrekte Gegnergrafiken;
  - danach Umsprung auf alte/vereinfachte Darstellung.
- D5 allgemeiner Race-Audit: `d28127ed375259a0c40e2f418e1059299a1e8282`
- Frühere D5 Fixes:
  - Canonical Alias Lock: `6d869d91d91aa1352c16c231506e03860a1e2d2d`
  - D2 Dispatcher Priorität: `41f369a22d975dfae48f97b04ec7eb0a0686565e`
  - v251 1350-ms-Repaint entfernt: `07c4e371444fba487da6300394533a26a3c090a8`
  - v244 520-ms-Repaint entfernt: `ab87ae23091b7f6e0007cd35bc691f9fdcd69649`
- Dungeon-2-spezifischer Audit:
  - `v467-d2-direct-style` erzwingt alten D2-Hintergrund und alte Gegner-SVGs aus `assets/v7195-base64/` mit `!important`;
  - `v467-d2-direct-script` hängt `v467-d2` an die Karte, überschreibt D2-Nodes/Thumb und hängt sich nach `renderDungeon`;
  - gleichzeitig besitzt der kanonische D2-Owner bereits den vollständigen neuen D2-Asset-Vertrag:
    - `v474_dungeon_assets/d2_bg.jpg`
    - `v474_dungeon_assets/d2_1.png ... d2_9.png`
    - `v474_dungeon_assets/d2_boss.png`.
- D2-spezifischer Fix:
  - Commit `34d16bb351b81591b1a65025495f1d1d8bab5593`
  - `v467-d2-direct-style` aus aktiver Beta entfernt;
  - `v467-d2-direct-script` aus aktiver Beta entfernt;
  - beide nur noch archiviert unter:
    - `css/features/dungeon/legacy/v467-d2-direct-style.retired.css`
    - `js/features/dungeon/legacy/v467-d2-direct-script.retired.js`
  - Archive werden weder von Beta noch Stable geladen.
- QA: **vollständig grün**
  - Archiv-JS Syntax grün;
  - kanonische D2/D4 Owner Syntax grün;
  - keine aktiven v467-D2-Blöcke mehr in `beta.html`;
  - Stable unverändert.
- Gameplay/Combat-Math/Rewards/Serverautorität: **nicht verändert**
- Weitere Last-Writer-Analyse nach erneutem Nutzer-Repro:
  - nach dem kanonischen D2-Owner existieren noch spätere Legacy-/Cleanup-Schichten;
  - deshalb wurde zusätzlich ein **finaler post-legacy Detail-Seal** als letztes Script vor `</body>` installiert.
- Finaler D5 Seal:
  - Datei: `js/features/dungeon/beta/v8009-d5-final-detail-seal.js`
  - Commit: `44db5805762f2d111a0be284df6fd4474816eebb`
  - wird nach sämtlichen alten Inline-Dungeon-Patches geladen;
  - zwingt die historischen Detail-Aliase auf den kanonischen v261-Owner;
  - erkennt per eng begrenztem MutationObserver, wenn eine sichtbare 10er-Karte nachträglich durch Legacy-DOM ersetzt wird;
  - baut dann v261/D2 erneut kanonisch auf und stellt `v474_dungeon_assets` wieder her;
  - QA bestätigt: Seal ist exakt das letzte Script vor `</body>`, Syntax grün, Stable unverändert.
- Weitere D5 Ursachenanalyse anhand des Nutzer-Videos:
  - Nach dem Umsprung bleibt die 10er-DOM-Struktur erhalten;
  - nur Hintergrund und Gegnerbilder verschwinden;
  - Asset-Remover-Audit zeigt keinen fremden Entferner für `.gl-dungeon-node-art`;
  - der kanonische D2-Owner selbst blendete Legacy-Art vor erfolgreichem Laden aus und setzte bei Bildfehlern die neuen Gegnerbilder auf `hidden`;
  - gleichzeitig entfernte `v7144CleanDungeonMap` den alten Kartenhintergrund unabhängig davon, ob das kanonische Hintergrundbild erfolgreich geladen war.
- D5 Asset-Fallback-Fix:
  - `0d35d3cdd952b148b00bf45690a846bdb2067e8e`
    - vorhandene sichtbare Gegner-/Hintergrund-Art bleibt aktiv, bis das kanonische Bild wirklich geladen ist;
    - bei Asset-Fehler wird auf die bereits sichtbare Legacy-Art zurückgefallen statt auf schwarz/leer.
  - `e2def0ebcb4dc11fc01b53b80f3744f03924584a`
    - finaler Seal prüft nun echten Ladezustand (`naturalWidth`, `hidden`) statt nur DOM-Präsenz;
    - überwacht zusätzlich `class/style/src/hidden`-Änderungen.
  - `674cad87ffe5c49d1e7ee2f1dfe617c6a075bfb9`
    - `v7144CleanDungeonMap` entfernt den Legacy-Hintergrund nur noch, wenn das kanonische Hintergrundbild tatsächlich geladen ist.
- QA: **vollständig grün**
  - D2 Visual Owner Syntax grün;
  - finaler D5 Seal Syntax grün;
  - v7144 Load-State-Guard vorhanden;
  - Stable unverändert.
- Gameplay/Combat-Math/Rewards/Serverautorität: **nicht verändert**
- Manueller Repro nach Asset-Fallback-Fix:
  - Dungeon 2 Hintergrund bleibt korrekt;
  - Gegner 1–9 bleiben korrekt sichtbar;
  - der vorherige Umsprung auf schwarz/leer ist **behoben**;
  - einzig der Boss war noch ohne Bild.
- Boss-Ursache:
  - `v474_dungeon_assets/d2_boss.png` existiert nicht;
  - im Repo existieren Boss-PNGs im v474-Vertrag erst für D10–D20;
  - für D2 existiert der alte verifizierte Boss `assets/v7195-base64/10036d96d08155bdc84a.svg`;
  - die 10er-Karten-Schleife hatte `bossFallback` bisher nicht an `setMapNodeArt()` weitergegeben.
- Boss-Fix:
  - Commit `3cf52f01dd8bb7180c293824a784c2476c2793fd`;
  - Karten-Boss nutzt jetzt `fallbackFor(c, room)`;
  - D2 erhält explizit den verifizierten alten Boss-Assetpfad als Fallback;
  - vorhandene `raw.bossArt`-Fallbacks können damit auch für andere frühe Dungeons verwendet werden.
- QA für Boss-Fix: **grün**
  - D2 Visual Owner Syntax grün;
  - Canonical Detail Lock grün;
  - Diff-Check grün.
- Manueller D2-Boss-Repro: **erfolgreich**.
- Gesamt-Audit aller 20 Dungeon-Assetverträge:
  - D1–D20: Hintergrund vorhanden;
  - D1–D20: Gegner 1–9 vollständig vorhanden;
  - D1–D9: kein eigenes `v474_dungeon_assets/dN_boss.png`;
  - D10–D20: eigenes Boss-PNG vorhanden.
- Allgemeine Boss-Regel ab Commit `cfcc01e029459ec51ed5d40350b31dc4c6de4fb6`:
  - D10–D20 verwenden ihr echtes `dN_boss.png`;
  - D1–D9 fordern keine nicht existierenden Boss-PNGs mehr an;
  - D1–D9 verwenden vorhandenes `raw.bossArt`/Legacy-Bossbild;
  - D2 bleibt zusätzlich mit `assets/v7195-base64/10036d96d08155bdc84a.svg` abgesichert.
- QA der allgemeinen D1–D20 Boss-Regel: **grün**.
- D5 Status: **Dungeon-2 Umsprung + Boss behoben; technische Asset-Regel auf alle 20 Dungeons erweitert**
- D6 Dependency-Audit:
  - Manifest: `V8009_DUNGEON_D6_V260_DEPENDENCY_AUDIT.json`;
  - Beta hatte genau 1× v260 CSS + 1× v260 JS geladen;
  - außerhalb des v260-Pakets existieren in Beta nur Kompatibilitäts-Aliase in D2-Lock/D5-Seal;
  - diese Aliase benötigen die v260-Datei nicht und zeigen weiterhin auf v261;
  - Stable enthält seinen eigenen historischen inline-v260-Code und bleibt bewusst unangetastet.
- D6 Umsetzung:
  - Commit `64786125d0d7d53e8b9c62ace556df181674ccbe`;
  - `css/features/dungeon/beta/v8009-d4-v260-detail.css` nicht mehr in Beta geladen;
  - `js/features/dungeon/beta/v8009-d4-v260-detail.js` nicht mehr in Beta geladen;
  - beide Dateien bleiben im Repo für Rollback/Referenz;
  - kanonischer Detailowner bleibt `v261RenderDetail`;
  - World-Owner bleibt `v251RenderWorld`.
- D6 QA: **vollständig grün**
  - retained v260 JS Syntax grün;
  - v261/D2/D5 Owner Syntax grün;
  - Beta enthält keine aktiven v260-Datei-Includes mehr;
  - Stable unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- D6 Status: **abgeschlossen**
- D7 Audit:
  - Manifest: `V8009_DUNGEON_D7_BETA.json`;
  - `v426` enthält noch D1-Referenzdarstellung;
  - `v427/v429/v430` enthalten noch D6-Titel/Namen/Schild/Node-Positionen;
  - `v432` enthält noch D7-Titel/Schild/Node-Positionen;
  - daher kein blindes Unload in D7.
- D8 Konsolidierung:
  - Commit `5aa7c766972e4ed6efd46ba324fcfda2e35e4be3`;
  - neuer kanonischer Post-Render-Decorator:
    `js/features/dungeon/beta/v8009-d8-detail-decorator.js`;
  - D2 Visual Owner ruft den Decorator direkt aus `paintMap()` auf;
  - migriert:
    - D1 Referenzklasse/Titel/Fallback-Hintergrund;
    - D6 Titel/Namen/Schild/Node-Positionen;
    - D7 Titel/Namen/Schild/Node-Positionen;
  - aus aktiver Beta entfernt:
    - `v426-reference-owner`
    - `v427-d6-clean-script`
    - `v428-d6-final-owner`
    - `v429-d6-scenic-owner`
    - `v430-d6-10er-final-script`
    - `v432-d7-final-script`
  - alte Kette archiviert unter:
    `js/features/dungeon/legacy/v8009-d8-retired-detail-owner-chain.js`;
  - `v426RenderDetail` / `v427RenderDetail` bleiben nur als schlanke Kompatibilitätsaliases für spätere D1-Polish-Skripte;
  - die alten `renderDungeon`-Monkey-Patches dieser sechs Blöcke sind entfernt.
- D8 QA: **vollständig grün**
  - Decorator + Archiv + D2/D5 Owner Syntax grün;
  - alle sechs alten Owner-IDs aus aktiver Beta entfernt;
  - D1/D6/D7-Dekorationssignaturen im neuen Decorator vorhanden;
  - D5 Final Seal weiterhin letztes Script;
  - Stable unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- D8 Beta-Größe: **6.055.242 Byte** (vorher 6.069.032 Byte).
- D8 Status: **abgeschlossen**
- Manueller Meilenstein nach D8:
  - D1, D2, D6 und D7 wirken laut Gerätetest korrekt.
- D9 Audit:
  - `v454/v458/v459/v460/v461/v463` analysiert;
  - finale sichtbare D1-Endfassung stammt aus:
    - Namen/Icons: v454;
    - Titel/Schild: v458;
    - finaler Straßenverlauf: v463;
  - historische Thumb-Repaints aus v454/v459/v460 sind durch den kanonischen D2-Thumb-Owner überholt.
- D9 Konsolidierung:
  - Commit `56c829007685c763a368d66ddf12524ea1f95b15`;
  - finale D1-Namen/Icons, Titel, Schild, Straße und aktuelle Gegnerzeile in `v8009-d8-detail-decorator.js` übernommen;
  - aus aktiver Beta entfernt:
    - `v454-d1-feinschliff-script`
    - `v458-d1-road-and-sign-final`
    - `v459-d1-right-side-thumb-final-script`
    - `v460-d1-thumb-owner-fix-script`
    - `v461-d1-node9-collision-fix-script`
    - `v463-d1-screenshot-polish-script`
  - alte Kette archiviert unter:
    `js/features/dungeon/legacy/v8009-d9-retired-d1-polish-chain.js`;
  - kanonischer Thumb-Owner bleibt D2 Visual Owner.
- D9 entfernte Scheduling-Arbeit aus aktiver Beta:
  - 16× `setTimeout`
  - 11× `requestAnimationFrame`
  - 15× `addEventListener`
  aus den sechs D1-Polish-Blöcken.
- D9 QA: **vollständig grün**
  - Decorator + Archiv + D2/D5 Owner Syntax grün;
  - alle sechs D1-Polish-IDs aus aktiver Beta entfernt;
  - D1-Endsignaturen im Decorator vorhanden;
  - D5 Final Seal weiterhin letztes Script;
  - Stable unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- D9 Beta-Größe: **6.043.690 Byte** (vorher 6.055.242 Byte).
- D9 Status: **abgeschlossen**
- D10 Alias-/Style-Audit:
  - Manifest: `V8009_DUNGEON_D10_ALIAS_STYLE_AUDIT.json`;
  - aktive Aufrufe von `v426RenderDetail`: **0**;
  - aktive Aufrufe von `v427RenderDetail`: **0**;
  - verbleibende Treffer waren nur D8-Alias-Installer und D2-Lock-Guards.
- D10 Umsetzung:
  - `v426RenderDetail` / `v427RenderDetail` aus `v8009-d8-detail-decorator.js` entfernt;
  - dieselben Namen aus der Wrapper-Liste und `assign()`-Logik von `v8009-d2-detail-render-lock.js` entfernt;
  - kanonischer Detailowner bleibt `v261RenderDetail`.
- D10 CSS-Ergebnis:
  - `v426-ref-d1` bleibt als reine D1-Layoutklasse aktiv;
  - die D1-CSS-Blöcke v426/v454/v455/v456/v457/v458/v459/v460/v461/v463/v464 bilden weiterhin eine echte Cascade;
  - deshalb in D10 **keine blinde CSS-Stilllegung**.
- D10 QA: **grün**
  - D2-Lock/D8-Decorator/D2-Visual-Owner/D5-Seal Syntax grün;
  - keine v426/v427-JS-Aliase mehr in D2-Lock/D8-Decorator;
  - D1/D6/D7-Dekorationssignaturen unverändert;
  - Stable unverändert.
- D10 Status: **abgeschlossen**
- D11 CSS-Extraktion:
  - Commit `b697b7e7573c711af603302be6255151b722b22f`;
  - 11 aktive D1-Style-Blöcke aus `beta.html` ausgelagert;
  - jeder Block bleibt als eigene externe CSS-Datei an exakt derselben Position/Reihenfolge;
  - pro Block Bytezahl + SHA256 im Manifest `V8009_DUNGEON_D11_BETA.json` dokumentiert;
  - CSS-Regeln wurden **nicht verändert**.
- D11 ausgelagerte Blöcke:
  - v426 exact reference layout
  - v454/v455 D1 Feinschliff
  - v456 reference alignment
  - v457 clean overlay
  - v458 clean background
  - v459 right-side/thumb
  - v460 thumb owner CSS
  - v461 node9 collision
  - v463 screenshot polish
  - v464 boss micro-position
- D11 QA: **vollständig grün**
  - alle 11 Inline-Styles entfernt;
  - alle 11 externen Dateien Hash-genau zum Originalinhalt;
  - Source Order 1:1 erhalten;
  - Stable unverändert;
  - CSS-Regeln/Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- D11 Beta-Größe: **6.014.540 Byte** (vorher 6.043.690 Byte).
- D11 Status: **abgeschlossen**
- D1 Boss-Hotfix nach manuellem D1-Screenshot:
  - D1 Layout, Hintergrund und Gegner 1–9 visuell korrekt;
  - einzig Boss 10 ohne Bild.
- Ursache:
  - ursprüngliches D1-Bossbild: `assets/v7195-base64/0f1a0253845b46d9a03d.jpg`;
  - Datei existiert im Repo;
  - nach D11 lag die alte CSS-Regel in `css/features/dungeon/beta/...`;
  - dadurch wurde `url("assets/...")` relativ zum CSS-Dateipfad aufgelöst und traf nicht mehr das echte Asset.
- Hotfix:
  - Code-Commit `573f83edc6789c5e5dbae84cd01060913559bb90`;
  - D1-Bossbild jetzt direkt im kanonischen D2 Visual Owner als `bossArt` + `bossFallback` verdrahtet;
  - 10er-Karte, aktuelles Gegnerportrait und Bosskampf verwenden damit denselben dokumentrelativen D1-Bosspfad.
- QA-Commit `05ec33af1d1c3e5cf7ac9cd3f77d231e638cd590`:
  - JS-Syntax grün;
  - D1-Bossdatei existiert;
  - Assetpfad ist in `bossArt` und `bossFallback` vorhanden;
  - Beta lädt den Visual Owner genau einmal;
  - Stable lädt den Beta-Owner nicht.
- Manueller D1-Boss-Repro: **erfolgreich** – Milbenkönigin/Boss 10 hat wieder ein Bild.
- Hotfix-Status: **abgeschlossen**.
- D12 CSS-Cascade-Audit:
  - Audit-Commit `fcb8b11e58446e9b6939d77bfedd2097b2041b44`;
  - 563 D1-CSS-Deklarationen klassifiziert;
  - 253 davon konservativ als später überschrieben nachgewiesen;
  - 310 bleiben wirksam oder sind wegen Media/Spezifität bewusst nicht als redundant gewertet;
  - berücksichtigt: gleiche Selector-/At-Rule-Kontexte, `!important` und gängige Shorthand-Familien;
  - nur **eine komplette Datei** war belastbar zu 100 % redundant:
    `v8009-d11-v461-d1-node9-collision-fix.css` (11/11 Deklarationen).
- D12 Umsetzung:
  - Commit `02e01294083c9150329e15bc20dd99eb9ce22621`;
  - v461 D1 Node9-Collision-CSS aus aktiver Beta-Ladekette entfernt;
  - Datei bleibt für Rollback/Referenz im Repo;
  - v463 Screenshot-Polish und v464 Boss-Micro-Position bleiben aktiv;
  - keine anderen D1-CSS-Layer entfernt.
- D12 QA: **vollständig grün**
  - Redundanzbeweis 11/11;
  - spätere D1-Layer weiterhin geladen;
  - D8 Decorator/D2 Visual Owner/D5 Seal unverändert;
  - Stable unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- D12 Beta-Größe: **6.014.499 Byte**.
- D12 Status: **abgeschlossen**
- Arbeitsmodus ab jetzt: **Sprint-Modus**
  - keine Mikro-Unterphasen mehr für jeden einzelnen Legacy-Block;
  - pro System ein breiter Audit;
  - mehrere nachweislich sichere Bereinigungen in einem Batch;
  - eine gemeinsame QA;
  - manueller Test erst an sinnvollen System-Meilensteinen.
- Dungeon Sprint 1:
  - Commit `c0840d3faf513e85a131afe3c5a3c874eb3e55ea`;
  - v455/v456/v459 gleichzeitig auf Residual-CSS verkleinert;
  - 109 ursprüngliche Deklarationen → 9 verbleibende Deklarationen;
  - **100 nachweislich redundante CSS-Deklarationen in einem Batch entfernt**;
  - Ladeposition/Reihenfolge erhalten;
  - Originaldateien bleiben im Repo;
  - Stable unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert;
  - gemeinsame QA vollständig grün.
- Dungeon Sprint 2 – Owner-/Wrapper-Konsolidierung:
  - finaler Code-Commit `7be8c20c873f9ad169a91e791fc57bfe8983f827`;
  - vollständig retired:
    - `v4225-final-10er-owner`
    - `v447-d9-preview-button-restore`
    - `v426-pos-fix`;
  - v426-Standardpositionen 1:1 in `v8009-d8-detail-decorator.js` migriert;
  - redundante `renderDungeon`-/Detail-Wrapper entfernt aus:
    - v446 Preview-Postrender
    - v494 Production Sync
    - v585 Battle-HUD Sync
    - v4165 vier Detailrenderer + Battle-Gate
    - v7051 Button-Owner
    - v7166 Detail-/renderDungeon-Lock;
  - benötigte Aufgaben laufen jetzt als direkte Hooks aus dem kanonischen D2-Owner:
    - `v7166DungeonDetailRepair`
    - `v4165StampDetail`
    - `v4165SyncBattleGate`
    - `v494DungeonProductionSync`
    - `v585SyncDungeonBattle`
    - `v7051ClaimButtonSync`;
  - kritische Gameplay-/Server-Systeme bewusst erhalten:
    - v246 Fight/Reward
    - v4165 Key/Battle-Index + Battle Entry
    - v446 Timer/Combat
    - v458/v467/v497 Key Authority
    - v482 Paid/Free-Timer
    - v7051 Atomic Server Receipt/Authority.
- Dungeon Sprint 2 Abschluss-QA: **vollständig grün**
  - kanonischer Runtime-Owner: `js/features/dungeon/beta/v8009-d2-visual-owner.js`;
  - **0** spätere `renderDungeon`-Owner nach dem kanonischen Owner;
  - **0** spätere `v261RenderDetail`-Owner;
  - v7166 läuft nur noch im Direct-Repair-Modus, nicht als Renderer-Wrapper;
  - D5 Final Seal bleibt letztes Script;
  - D1–D20: Background + Gegner 1–9 Assetvertrag vollständig;
  - D10–D20: native Boss-PNGs geprüft;
  - D1/D2: verifizierte Boss-Fallbacks geprüft;
  - kritische Inline-Dungeon-Systeme per Node-Syntaxcheck grün;
  - Stable/Server 1 unverändert;
  - Gameplay/Combat-Math/Rewards/Serverautorität unverändert.
- Dungeon Beta-Größe nach Sprint 2: **6.005.343 Byte**.
- Dungeon Status: **abgeschlossen – automatisierte QA + gemeinsamer manueller Meilenstein-Test erfolgreich**.
- PvP / Hall of Haze Sprint 1 Bestand:
  - deterministischer Audit: `V8009_PVP_SPRINT1_INVENTORY.json`;
  - 113 PvP/Hall-relevante Inline-Script-Treffer, 55 Inline-Style-Treffer breit erfasst;
  - daraus 29 klar systemeigene PvP/Hall-JS-Blöcke und 21 klar systemeigene CSS-Blöcke für 1:1-Extraktion ausgewählt.
- PvP Sprint 1 JS/CSS-Extraktion:
  - Commit `ae1ea11bdd2832a4cd3e8f230c4910a3689ad2b8`;
  - **29/29 JS-Blöcke** extern unter `js/features/pvp/beta/`;
  - **18/21 CSS-Blöcke** direkt extern unter `css/features/pvp/beta/`;
  - JS-Reihenfolge 1:1 erhalten;
  - alle extrahierten JS-Dateien per `node --check` grün;
  - Inhalt Hash-genau zum Inline-Original.
- PvP assetbasiertes CSS:
  - Commit `8c3d3a44ec3c453c61f6798a798c99e2632ed602`;
  - verbleibende v549/v550/v611 CSS-Blöcke ebenfalls extern;
  - relative `assets/...`-URLs kontrolliert zu `../../../../assets/...` umgeschrieben;
  - alle referenzierten Assets existieren;
  - dadurch **21/21 PvP/Hall-CSS-Blöcke extern**.
- PvP Sprint 1 Beta-Größe:
  - vor PvP Sprint: **6.005.343 Byte**
  - nach kompletter PvP/Hall-Extraktion: **5.751.014 Byte**
  - Reduktion: **254.329 Byte** Inline-Code.
- PvP Sprint 1 Scope:
  - Gameplay unverändert;
  - Matchmaking unverändert;
  - Cooldown unverändert;
  - Rewards unverändert;
  - Serverautorität unverändert;
  - Stable/Server 1 unverändert.
- Kritische PvP-Systeme, die im Owner-Cleanup nicht blind stillgelegt werden dürfen:
  - `v204` Basissystem;
  - `v209` Kampfdarstellung;
  - `v211` Ergebnis-Modal;
  - `v216` Finish-Flow;
  - `v7052` Shadow-Parity;
  - `v7053` Atomic Server-PvP/Receipt Authority;
  - Reward-/Cooldown-/Achievement-/Guild-XP-Seiteneffekte.
- PvP Sprint 1 Owner-Cleanup:
  - Owner-Audit: `V8009_PVP_SPRINT1_OWNER_AUDIT.json`;
  - finaler Hall-Ranking-Owner: `js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js`;
  - zwei nachweislich überschriebene Ranking-Wrapper entfernt:
    - v424 Hall-Ranking-Wrapper;
    - PvP-Buds Hall-Ranking-Wrapper;
  - ihre eigentliche Profil-/Bud-Synchronisation bleibt aktiv und wird von v6145 direkt ausgelöst.
- Retired Marker-Cores:
  - v611 Stage-Fix Core
  - v619 Dungeon-Motion Core
  - v620 Dungeon-Parity Core
  - v672 Effect-Parity Core
  - v7155 Hall-Cleanup Marker
  - alle fünf Dateien bleiben im Repo, werden aber von Beta nicht mehr geladen.
- v6290 Performance-Hall-Wrapper:
  - alter Post-Render-Wrapper vollständig retired;
  - Ranking-Dekoration läuft jetzt direkt aus v6145;
  - Own-Profile-Dekoration läuft direkt aus v326;
  - `v646DecorateHall()` bleibt der gemeinsame sichtbare Hall-Decorator;
  - Archiv: `js/features/pvp/legacy/v8009-s1-retired-v6290-performance-hall-fix.js`.
- v437 UI-Cleanup:
  - doppelte 2000-/5000-ms-PvP-Bind-Retries entfernt;
  - die einmaligen 500/2000/5000-ms-Startup-Retries bleiben.
- PvP Sprint 1 Abschluss-QA:
  - Manifest: `V8009_PVP_SPRINT1_FINAL.json`;
  - Commit: `4d0c39fd351e51e4eab64ad27261515341fa3d02`;
  - **29 extrahierte JS-Dateien erhalten, 24 aktiv, 5 bewusst retired**;
  - **21/21 PvP/Hall-CSS-Dateien aktiv extern**;
  - alle 29 extrahierten JS-Dateien per `node --check` grün;
  - fünf assetbasierte CSS-Referenzen verifiziert;
  - finaler Hall-Ranking-Owner = v6145;
  - v7053 Atomic Server-PvP/Receipt Authority unverändert erhalten;
  - späterer globaler Gameplay-Authority-Lock bleibt in der bestehenden Owner-Kette erhalten;
  - Stable SHA256 unverändert:
    `e476eb4437df8c0763a36220f99fe5f14b09b3acd8f76e8ed4f5821962d9fbab`.
- PvP Sprint 1 aktueller Beta-Stand: **5.749.031 Byte**.
- PvP / Hall Status: **technisch grün; ein gemeinsamer manueller Meilenstein-Test offen**.
- Manueller Video-Test 30.09.2026: **2 sichtbare Hall-of-Haze-Fehler reproduziert**
  1. **Eigenes Profil oberhalb der Top 3**
     - beim ersten Hall-Aufruf erscheint das eigene Profil zunächst im alten/undekorierten Layout;
     - Avatar fehlt;
     - Level/Kampfkraft/Dungeon/Gegner stehen in extrem schmalen, mehrzeilig umgebrochenen Feldern;
     - großer leerer Bereich im Profil;
     - nach späterer Navigation/Dekoration erscheint das Profil korrekt.
     - Arbeitshypothese: ein späterer `v072RenderOwnProfile`-Owner oder eine Render-Reihenfolge umgeht den direkten v326→v646-Decorator-Hook beim ersten Paint.
  2. **Kampfkraft fremder Spieler**
     - bei einem fremden Spieler wird kurz die eigene Kampfkraft angezeigt;
     - anschließend springt der Wert auf die richtige Kampfkraft des fremden Spielers.
     - Ziel: fremde Profile/Rows dürfen nie einen lokalen Own-Combat-Power-Wert als Zwischenzustand rendern.
- Video-Datei im Chat: `1000098671.mp4`.
- Ursachen-Audit abgeschlossen:
  - der erste Own-Profile-Paint wurde nach v326 von `v4130-hall-dungeon-authority` erneut mit dem alten kompakten Layout überschrieben;
  - `v448-final-ui-power-account-integrity` und `v4126-power-rpc-diagnostics` überschrieben im geöffneten Profil global die Kampfkraft mit der lokalen Own-Power, auch bei Fremdprofilen.
- Hall-Video-Fix umgesetzt:
  - Commit `bf0ed81dfb40c97e41142fe903965b54db0ae871`;
  - v4130 ruft `v646DecorateHall()` direkt unmittelbar nach dem Own-Profile-Render sowie im nächsten RAF auf;
  - v655 markiert `#v074ProfileContent` bereits beim Loading/Render mit `data-profile-id`;
  - v448 malt lokale Kampfkraft im Profilmodal nur noch, wenn `data-profile-id === eigene User-ID`;
  - v4126 hat denselben Own-Profile-Guard;
  - fremde Profile behalten damit ihren Serverwert von `p.combat_power`.
- Automatische QA: **vollständig grün**
  - v4130 Syntax grün;
  - modifizierte v448/v4126/v655 Inline-Skripte Syntax grün;
  - Profile-ID-Guards vorhanden;
  - direkter v4130→v646 Decorator-Hook vorhanden;
  - Stable/Server 1 unverändert;
  - Gameplay/Matchmaking/Combat-Math/Cooldown/Rewards/Serverautorität unverändert.
- Aktuelle Beta-Größe nach Fix: **5.749.692 Byte**.
- Hall Top-3 / Avatar-Rahmen Direktintegration:
  - Nutzerwunsch: Top-3-Avatare deutlich größer über die ganze Kartenbreite; aktive Avatar-Rahmen in Top 3 und kompletter Rangliste sichtbar.
  - **Architekturregel ausdrücklich eingehalten: kein neuer Renderer-/Wrapper-Patch.**
  - Commit `87c887e20a0fd040540eb90cadbc70ac579884f6`:
    - `v6145` lädt `avatar_frame_id` direkt mit der bestehenden Hall-Profilabfrage;
    - Top 3 und normale Ranglistenzeilen erzeugen Avatar + Rahmen im selben HTML-Render;
    - bestehender `v7137FrameArtMarkup`-Pfad wird als gemeinsame Rahmen-Assetquelle verwendet;
    - keine zweite Rahmen-Mapping-Logik eingeführt.
  - Commit `b19b2d3b83006d1da7c65e002863f7aa27e03e25`:
    - vorhandenes `v6145-hall-pagination-css` direkt geändert;
    - Top-3-Avatar nutzt jetzt die Kartenbreite und ist deutlich größer;
    - Frame-Art bleibt separate Overlay-Ebene;
    - alter `v7137`-Post-Render-Wrapper um `v073LoadRanking` entfernt;
    - Search/Friends-Rahmenrefresh bleibt separat bestehen, da diese Renderer nicht von v6145 kommen.
  - QA: **vollständig grün**
    - v6145 Syntax grün;
    - `avatar_frame_id` direkt im Hall-SELECT;
    - Top-3 + Ranglisten-Frame-Markup direkt im kanonischen Renderer;
    - 8 Rahmenassets vorhanden;
    - **0 neue Render-Wrapper**;
    - **0 neue Timer**;
    - **0 neue MutationObserver**;
    - Stable/Server 1 unverändert;
    - Gameplay/Matchmaking/Combat-Math/Rewards/Serverautorität unverändert.
- Aktuelle Beta-Größe nach Hall-Avatar/Rahmen-Direktintegration: **5.749.992 Byte**.
- **Quest Sprint NICHT starten**, bis diese zwei Hall-Fehler manuell erneut geprüft und bestätigt sind.
- Scope: **Beta zuerst**
- **Server 1 / Stable bleibt unangetastet**, bis eine Phase ausdrücklich für Stable freigegeben wird.

### Wichtige Einordnung der Namen

Bezeichnungen wie `HOME-1 ... HOME-31`, `TOWER-T1 ...` oder frühere `B1/C...` sind **Unterphasen innerhalb des V8-Umbaus**.

Sie ersetzen nicht das Hauptziel:

1. große Inline-CSS-Blöcke aus der HTML ziehen;
2. JS systemweise aus `beta.html` / später `index.html` ziehen;
3. pro System auf möglichst **einen finalen Owner** reduzieren;
4. alte V4/V5/V6/V7-Patch-Layer erst entfernen, wenn ihre Aufgaben nachweislich übernommen wurden;
5. am Ende sollen `index.html` und `beta.html` möglichst nur noch Struktur + Includes/Bootstrap enthalten.

## 2. Was bereits strukturell erledigt wurde

### Gilde

- Phase 3B hat die Gilden-JS-Blöcke aus der HTML ausgelagert.
- Manifest: `V8_PHASE3B_EXTRACTION.json`
- Damaliger Umfang:
  - 54 eligible scripts
  - 51 externe Bundles/Dateien
  - 257017 Byte JS
- Die späteren 3C-Phasen haben die Beta-Gildenbereiche weiter auf klarere Owner reduziert.
- Relevanter Abschlussstand:
  `V8_PHASE3C19_25_BETA.json`
- Es existieren weiterhin `legacy`-Dateien. **Legacy bedeutet nicht automatisch löschbar.**
  Erst entfernen, wenn der finale Owner die Funktion nachweislich übernommen hat.

### Turm

- V8.009-Tower wurde bereits in externe Beta-Dateien zerlegt.
- Startpunkt/Owner u. a.:
  - `js/features/tower/beta/v8009-t1-tower-direct-preempt.js`
  - `js/features/tower/beta/v8009-t1-tower-system.js`
  - `js/features/tower/beta/v8009-t1-tower-entry.js`
  - `js/features/tower/beta/v8009-t2-tower-lobby.js`
- Zugehörige Tower-CSS-Dateien liegen unter:
  `css/features/tower/beta/`
- Es existieren Manifeste `V8009_TOWER_*.json`.

### Startseite / HOME

- HOME wurde bis **HOME-31** bereinigt.
- Aktueller externer Owner:
  `js/features/home/beta/v8009-home-renderer.js`
- Unterstützende Performance-/Lifecycle-Schicht:
  `js/system/performance/v7288-home-adaptive-fit-script.js`
- Browser-QA:
  - `.github/scripts/v8009_home_events_browser_qa.mjs`
  - `.github/workflows/v8009-home-events-browser-qa.yml`
- Aktuelles Manifest:
  `V8009_HOME_31_BETA.json`

Wichtige HOME-Ergebnisse:
- V366 ist der kanonische sichtbare Home-Renderer.
- Header-Routen Gold+/Mail sind direkt korrekt gebunden.
- Frost-Checkliste besitzt direkt 7 Slots inkl. `weapon2`.
- Growroom-Status ist wetterbewusst und wird gezielt statt durch unnötige Vollrenders aktualisiert.
- Event-Karten können gezielt aktualisiert werden.
- alte Versionsschreiber/Version-Patches wurden aus dem Home-Owner entfernt bzw. konsolidiert.
- viele doppelte Render-, DOM-, Wetter-, Avatar-, Weltboss- und Header-Arbeiten wurden entfernt.
- versteckte/inaktive Startseite wird bei normalen Hintergrundaufrufen nicht unnötig neu gerendert.
- saubere Signaturtreffer vermeiden unnötige Folgearbeit.

**HOME vorerst als abgeschlossen behandeln.**
Kein `HOME-32` beginnen, solange kein echter reproduzierbarer Home-Bug oder klarer Rest-Owner gefunden wurde.

### Weitere bereits ausgelagerte Beta-Bausteine

- Events:
  `js/features/events/beta/v8009-weekend-events.js`
- Dungeon-Reward-Feedback:
  `js/features/rewards/beta/v8009-dungeon-reward-feedback.js`
- Beta Combat Cadence:
  `js/system/performance/beta/v8009-combat-cadence-slower.js`
- Bootstrap:
  - `js/v8/phase1-bootstrap.js`
  - `js/v8/phase2-bootstrap.js`

## 3. Strukturierung ist NOCH NICHT fertig

Aktueller Repo-Stand vor dieser Statusdatei:

- `index.html`: ca. **6574124 Byte**
- `beta.html`: ca. **5749992 Byte**
- externe `.js`-Dateien unter `js/`: **134**
- externe `.css`-Dateien unter `css/`: **130**

Das heißt: Es wurde viel ausgelagert, aber die Haupt-HTML ist weiterhin mehrere MB groß und enthält noch erheblichen Alt-/Inline-Code.

### Noch systematisch zu bearbeiten

Priorität des ursprünglichen Plans:

1. **Dungeon**
2. **PvP / Hall of Haze**
3. **Quest**
4. **Growroom**
5. danach verbleibende Shop/Character/Inventory/System-/Admin-/sonstige Inline-Blöcke nach Audit

Für jedes System gilt:
- erst Bestand/Owner/Abhängigkeiten erfassen;
- dann in Beta externe Datei(en) auslagern;
- Verhalten 1:1 erhalten;
- Browser-/Syntax-/Integrations-QA;
- erst danach alte Inline- oder Legacy-Owner stilllegen;
- danach nächstes System.

## 4. EXAKTER nächster Schritt

### Hall-of-Haze – EIN gemeinsamer manueller Re-Test

Bitte in Beta jetzt gesammelt prüfen:

1. **Hall öffnen**
   - eigenes Profil oberhalb der Top 3 sofort korrekt dekoriert;
   - kein alter/schmaler Zwischenzustand.
2. **Top 3**
   - Avatare deutlich größer und über die Kartenbreite;
   - wenn ein Top-3-Spieler einen aktiven Avatar-Rahmen besitzt, ist er direkt sichtbar;
   - kein nachträgliches Einblenden durch einen Ranking-Wrapper.
3. **Komplette Rangliste**
   - Spieleravatare sichtbar;
   - aktive Rahmen direkt sichtbar, sofern vorhanden.
4. **Fremdes Spielerprofil**
   - Kampfkraft zeigt vom ersten sichtbaren Frame an den fremden Wert;
   - kein kurzer Own-Power-Zwischenwert.

Wenn alle Punkte passen:
- PvP / Hall of Haze als abgeschlossen markieren;
- direkt mit **Quest Sprint** fortfahren.

Wenn etwas nicht passt:
- nur den konkreten Restfehler korrigieren;
- **keinen neuen Renderer-/Timer-/Observer-Patch darüberlegen**.

### Statusdatei-Regel

`V8_CURRENT_STATUS.md` wird **bei jedem V8-Durchgang gepflegt**:
- beim **Start** einer Unterphase: aktueller Schritt + Ziel;
- nach **erfolgreichem Abschluss**: letzter geprüfter Commit, Teststatus, ausgelagerte Dateien und exakter nächster Schritt;
- bei **Fehler/Blocker**: Fehlerursache + aktueller Stand + nächster Reparaturschritt.

Damit bleibt das Projekt auch bei einem Chatwechsel mitten in einer Phase exakt fortsetzbar.

## 5. Arbeitsregeln

### Beta / Stable

- Änderungen zuerst **nur Beta**.
- Stable / Server 1 nicht verändern.
- Gemeinsame Dateien nur dann anfassen, wenn Stable-Verhalten durch Guard nachweislich unverändert bleibt.

### Kleine, prüfbare Schritte

Pro Schritt:
1. Ursache/Bestand prüfen;
2. eine klar abgegrenzte Änderung;
3. Commit;
4. automatischer Test;
5. erst bei sinnvollem Meilenstein manueller Test durch den Nutzer.

Nicht nach jedem Commit den Nutzer mit „Browser-Test läuft gerade“ unterbrechen.
Test intern prüfen; nur fertigen Erfolg oder echten Fehler melden.

### Nicht anfassen ohne ausdrücklichen Grund

Besonders vorsichtig mit:
- Save-/Load-System
- Save-Versionen
- `CURRENT_GAME_VERSION`
- `SAVE_PREFIX`
- `SAVE_VERSION`
- `SAVE_GAME_VERSION`
- Versions-/Migrationsmaps
- Serverautorität
- Echtgeld-/Harz-Taler-Buchungen
- Reward-Claims

Strukturierungsphasen dürfen Gameplay oder Serverzustand nicht beiläufig verändern.

### Final-Owner-Prinzip

Ein System darf vorübergehend mehrere Legacy-Dateien besitzen, solange die Migration läuft.
Ziel ist aber:
- ein klarer Runtime-Owner pro Aufgabe;
- keine gegenseitigen Monkey-Patches ohne Not;
- keine mehrfachen Renderer;
- keine mehrfachen Timer/Observer für dieselbe Aufgabe;
- alte Layer erst löschen, wenn Tests belegen, dass sie funktionslos geworden sind.

## 6. Bekannte Architekturpfade

```text
js/
├─ v8/
│  ├─ phase1-bootstrap.js
│  └─ phase2-bootstrap.js
├─ features/
│  ├─ guild/
│  │  ├─ beta/
│  │  └─ legacy/
│  ├─ tower/
│  │  └─ beta/
│  ├─ home/
│  │  └─ beta/
│  ├─ events/
│  │  └─ beta/
│  ├─ dungeon/
│  └─ rewards/
└─ system/
   ├─ bootstrap/
   ├─ performance/
   └─ version/

css/
├─ features/
│  ├─ guild/
│  ├─ tower/
│  └─ rewards/
└─ system/
   ├─ performance/
   └─ version/
```

## 7. Anleitung für einen neuen Chat

Der Nutzer kann einfach schreiben:

> **Grow Legends weiter. Lies zuerst `V8_CURRENT_STATUS.md` aus meinem GitHub-Repo und prüfe danach den aktuellen main-HEAD. Mach exakt beim nächsten Schritt weiter.**

Dann:
1. diese Datei lesen;
2. aktuellen HEAD prüfen;
3. neuere Manifeste/Commits seit dem hier genannten geprüften Commit berücksichtigen;
4. **nicht** aus einem alten Chatstand fortfahren, wenn GitHub inzwischen weiter ist;
5. mit Abschnitt **„EXAKTER nächster Schritt“** fortsetzen.

## 8. Status dieser Übergabe

Diese Datei wurde angelegt, nachdem **V8.009 HOME-31** einschließlich Browser-QA erfolgreich war.

Der nächste fachliche Schritt ist **nicht HOME-32**, sondern die Restinventur der großen `beta.html` und anschließend der systematische Dungeon-Auszug.
