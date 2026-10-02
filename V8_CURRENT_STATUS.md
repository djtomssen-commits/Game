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
  `06be757c3faf109c2f3c3f18195086d1909592d0`
- Aktuelle Unterphase: **V8.009-QUEST-FIRST-RUN-FLICKER-SKIP-LAYOUT-FIX-PENDING**
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
- Manueller Screenshot danach zeigte zwei Restfehler:
  - Top-3-Avatare weiterhin zu klein/schmal;
  - Tomssen hatte im Top-3-Feld keinen Rahmen, obwohl das eigene Profil oben den aktiven Rahmen korrekt zeigte.
- Root-Cause-Audit:
  - Live-`profiles`-Datensatz von Tomssen geprüft: `avatar_frame_id = emerald_aura`; Datenbankwert ist korrekt;
  - `v6145` wird in der Script-Reihenfolge deutlich vor dem alten v7137-Frame-System geladen;
  - Hall darf deshalb nicht davon abhängen, dass ein später Frame-Helper den ersten Render nachbearbeitet.
- Direkter Source-Fix:
  - Commit `8b61274ea38abbb03dd9b162f3f184b05a3c0235`: `v6145` besitzt die für Hall benötigte Frame-Assetauflösung direkt im kanonischen Renderer und rendert Frame-Markup selbst;
  - `v6145HallRefresh()` als kanonischer Hall-Neurender für echte Frame-Änderungen ergänzt;
  - Commit `be3664b893ec479d49344baee6b032eff463ff6d`:
    - bestehendes `v6145-hall-pagination-css` direkt bearbeitet;
    - Top-3-Avatarcontainer jetzt quadratisch über die Kartenbreite;
    - Klassenbild wird innerhalb dieses Containers gecroppt/skaliert (`scale(2.55)`) statt als schmale Ganzkörperfigur stehen zu bleiben;
    - Frame-Art für Top 3 direkt als Overlay im gleichen Render;
    - Frame-Art in normalen Ranglistenzeilen ebenfalls direkt sichtbar;
    - alter Hall-`v073LoadRanking`-Frame-Repaint-Wrapper bleibt entfernt;
    - Rahmenwechsel aktualisiert eine offene Hall über den kanonischen `v6145HallRefresh()` statt `decorateHallFrames()` nachträglich darüberzumalen.
- Architektur-QA für diesen Fix: **grün**
  - **0 neue Renderer**
  - **0 neue Render-Wrapper**
  - **0 neue Timer**
  - **0 neue MutationObserver**
  - Stable/Server 1 unverändert;
  - Gameplay/Matchmaking/Combat-Math/Cooldown/Rewards/Serverautorität unverändert.
- Aktuelle Beta-Größe nach Source-Fix: **5.751.007 Byte**.
- Manueller Screenshot 30.09.2026 15:08 zeigte: Source-Fix noch nicht ausreichend.
  - Top-3-Avatare weiterhin als schmale Ganzkörperstreifen;
  - Tomssen weiterhin ohne `emerald_aura`-Rahmen im Top-3-Feld.
- Zweiter Root-Cause-Audit:
  - Top 3 hing trotz v6145 noch an der generischen Avatar-`<img>`-Kette; späte Alt-CSS konnte diese Darstellung weiter beeinflussen;
  - `v7230-server-frame-isolation` entfernte auf Server 1 pauschal **alle** `.v7137-frame-target > .v7139-frame-art` im DOM und löschte damit auch korrekt serverseitig geladene öffentliche Hall-Rahmen;
  - Live-Supabase bestätigt Top-3-Daten: Tomssen hat weiterhin `avatar_frame_id = emerald_aura`; Daten sind nicht die Ursache.
- Direkter Owner-Fix ohne Overlay-Patch:
  - Commit `188d2f032248621b9daf8daea619ddf4436648eb`:
    - `v6145` besitzt jetzt `podiumAvatar()`;
    - Top-3-Charakterbild wird direkt als eigene Portrait-Fläche im kanonischen Podium-HTML erzeugt;
    - Top 3 benutzt nicht mehr die generische Avatar-`<img>`-Kette.
  - Commit `0acaa527b314d613f3971fd4d344b667894fbdfd`:
    - bestehendes `v6145-hall-pagination-css` direkt auf `.v6145-podium-portrait` umgestellt;
    - `v7230` Frame-Isolation auf lokale/Own-Surfaces begrenzt (World, Character, eigenes Hall-Profil);
    - öffentliche Top-3-/Ranglisten-Rahmen werden von v7230 nicht mehr entfernt;
    - bestehender kanonischer v6145-Include nur cache-versioniert:
      `v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2`;
      dadurch kein zweiter Renderer, aber garantiert frische JS-Datei.
- QA für zweiten Root-Fix: **vollständig grün**
  - v6145 Syntax grün;
  - v7230 Syntax grün;
  - Architektur-/Ownership-QA grün;
  - Diff-QA grün;
  - **0 neue Renderer**;
  - **0 neue Wrapper**;
  - **0 neue Timer**;
  - **0 neue MutationObserver**;
  - Stable/index.html unverändert;
  - Gameplay/Matchmaking/Combat-Math/Cooldown/Rewards/Serverautorität funktional unverändert.
- Aktuelle Beta-Größe: **5.751.305 Byte**.
- **Quest Sprint NICHT starten**, bis diese zwei Hall-Fehler manuell erneut geprüft und bestätigt sind.
- Scope: **Beta zuerst**
- **Server 1 / Stable bleibt unangetastet**, bis eine Phase ausdrücklich für Stable freigegeben wird.

### Quest Sprint 1 – Start und Extraktion 30.09.2026

- Nutzer hat den Quest Sprint ausdrücklich freigegeben.
- Breiter deterministischer Bestand:
  - Manifest: `V8009_QUEST_SPRINT1_INVENTORY.json`
  - Commit: `4072d0e9390bb747e9855dc9d68f838b4adac5d5`
  - 333 Quest-bezogene Inline-Script-Treffer
  - 89 Inline-Style-Treffer
  - 44 externe JS-Treffer
  - 14 externe CSS-Treffer
  - 111 Owner-/Wrapper-Kandidaten in der Audit-Shortlist
- Einordnung: Die breiten Treffer enthalten viele Fremdsysteme, die Quest nur referenzieren. Diese werden nicht blind verschoben oder stillgelegt.
- Sicherer JS-Extraktionsbatch:
  - Commit: `80147bd24fee4ec1069bd22b231a2c52ed6489d0`
  - Manifest: `V8009_QUEST_SPRINT1_EXTRACT.json`
  - 28 klar Quest-eigene Inline-JS-Blöcke 1:1 nach `js/features/quest/beta/` ausgelagert
  - ausgelagerter JS-Inhalt: **196.768 Byte**
  - Source-Reihenfolge beibehalten
  - alle extrahierten Dateien per `node --check` grün
  - `index.html` / Stable unverändert
  - kein Gameplay-, Reward-, Combat-Math- oder Serverautoritätsverhalten geändert
  - keine Owner stillgelegt; dies war reine Struktur-Extraktion
- Nächster Schritt:
  - Quest-Owner-/Wrapper-Kette gezielt auditieren;
  - insbesondere `renderQuests`, `startQuest`, `claimQuest`, Quest-Timer, Elite-Quest und Server-Authority-Layer;
  - erst danach redundante Wrapper in einem gemeinsamen Batch entfernen bzw. Aufgaben in den kanonischen Owner integrieren;
  - keine neue Render-/Timer-/Observer-Schicht hinzufügen.

### Quest Sprint 1 – Owner-Audit 30.09.2026

- Audit-Manifest: `V8009_QUEST_OWNER_AUDIT.json`.
- Last-Writer-Kette im aktuellen Beta-Dokument:
  - `renderQuests`: **21 Schreiber**, letzter Writer `js/features/quest/beta/v6344-quest-variety-js.js`
  - `startQuest`: **15 Schreiber**, letzter Writer `js/features/quest/beta/v7110-quest-authority-sync.js`
  - `claimQuest`: **30 Schreiber**, letzter Writer `js/features/quest/beta/v7045-atomic-quest-receipt-client.js`
- Wichtige aktive Nebenaufgaben älterer Layer:
  - `v229-live-ui-sync`: leichter 1-Sekunden-Questcountdown und Completion-Repaint;
  - `v392-single-active-quest-script`: aktive Quest-Karte/Claim-Ansicht;
  - `v4127-quest-skip-stable`: Skip-Button-/Zeit-Samen-Lifecycle;
  - `v386-quest-redesign-script`: sichtbare Angebotskarten;
  - `v7045`: serverautoritärer Claim-/Receipt-Pfad bei enforce;
  - `v7110`: letzter Start-Quest-Authority-Layer;
  - `v6344`: letzter sichtbarer Quest-Render-Decorator/Variety-Layer.
- Konsequenz:
  - keine pauschale Stilllegung älterer Quest-Wrapper;
  - nächster Konsolidierungsbatch migriert Nebenaufgaben zuerst direkt in kanonische Owner/Hooks;
  - Timer, aktive Karte, Skip, sichtbare Angebotskarten und Server-Authority getrennt behandeln.
- Stable / `index.html`: unverändert.

### Quest Sprint 1 – Konsolidierung Pass 1/2 30.09.2026

- Pass 1 QA: `V8009_QUEST_CONSOLIDATION_QA.json` – vollständig grün.
- Pass 1 entfernte Quest-Wrapper:
  - `v229-live-ui-sync`: kein `startQuest`-/`claimQuest`-Wrapper mehr; direkte Timer-Hooks `v229QuestStartSync` / `v229QuestClaimSync`;
  - `v392-single-active-quest-script`: kein `startQuest`-/`renderQuests`-Wrapper mehr; direkte Hooks `v392PrepareStart`, `v392PaintActive`, `v392TickActive`;
  - `v4127-quest-skip-stable`: kein `startQuest`-/`renderQuests`-Wrapper mehr; bestehender `v4127ScheduleQuestSkip` bleibt;
  - `v6344` ruft aktive Karte + Skip direkt im finalen Quest-Render auf;
  - `v7110` ruft Start-Hooks direkt im finalen Start-Owner auf;
  - `v7045` ruft Claim-Hooks direkt im finalen Claim-Owner auf.
- Pass 2 QA: `V8009_QUEST_CONSOLIDATION_PASS2_QA.json` – vollständig grün.
- Pass 2 entfernte Render-Wrapper:
  - `v386-quest-redesign-script`: kein eigener `renderQuests`-Writer mehr; `v386RenderQuestShell` wird direkt aus `v6344` aufgerufen;
  - `v4172-quest-rpg-script`: kein eigener `renderQuests`-Writer mehr; `v4172EnhanceQuestPage` wird direkt aus `v6344` aufgerufen;
  - `v233-quest-reward-final-click`: kein eigener `renderQuests`-Writer mehr; Claim-Button-Bindung läuft über `v233BindClaimButton` direkt aus `v6344`.
- Zusätzliche sichere Bereinigung:
  - `v310-elite-quests` verliert den doppelten `renderQuests`-Wrapper;
  - Elite-Paint bleibt erhalten, weil `v321-elite-hard-guarantee-dampf-scale` weiterhin `v310PaintEliteQuests()` nach dem Quest-Render ausführt.
- Keine neue Render-/Timer-/Observer-Schicht hinzugefügt.
- Stable / `index.html` unverändert.
- Nächster Schritt:
  - Startkette `v321 -> v443 -> v7045 -> v7110` auditieren und nur sichere Wrapper weiter reduzieren;
  - Dampf-Kosten, Local/Server-Authority und Receipt/Reward-Pfade strikt erhalten.

### Quest Sprint 1 – Start Chain + Render Pass 3 30.09.2026

- Start-Chain-QA: `V8009_QUEST_START_CHAIN_QA.json` – vollständig grün.
- Startkette weiter reduziert:
  - `v443-quest-dampf-live-fix` schreibt `startQuest` nicht mehr; direkte Nacharbeit über `v443AfterQuestStart` aus `v7110`;
  - `v321-elite-hard-guarantee-dampf-scale` schreibt `startQuest` nicht mehr; lokale Dampf-Vorbereitung über `v321PrepareLocalQuestStart` direkt aus `v7110`;
  - `v7110` bleibt letzter Start-Owner;
  - `v7045` bleibt Server-Authority-/Receipt-Grenze.
- Render Pass 3 Code fertig:
  - `v309-distinct-quest-offers`: kein `renderQuests`-Writer mehr; direkte Pre-/Post-Hooks;
  - `v316-quest-balance-skip`: kein `renderQuests`-Writer mehr; direkte Balance-/Skip-Paint-Hooks;
  - `v496-quest-claim-single-payout`: kein `renderQuests`-Guard-Wrapper mehr; stale-paid Reparatur als direkter Pre-Render-Hook;
  - `v6344` übernimmt die ursprüngliche Reihenfolge:
    1. v496 stale-paid repair,
    2. v316 balance,
    3. v309 offer prepare,
    4. Basis-Render,
    5. v309 role paint,
    6. v316 skip paint,
    7. danach bestehende v386/v392/v4172/v233/v4127 Hooks.
- Pass-3-QA Workflow + Contract liegen im Repo und wurden ausgelöst.
- Beim unmittelbaren Nachcheck war `V8009_QUEST_RENDER_PASS3_QA.json` noch nicht zurückgeschrieben; deshalb QA-Status aktuell **pending**.
- Stable / `index.html`: unverändert.

### Quest Sprint 1 – manueller Testpunkt 30.09.2026

- `V8009_QUEST_PUSH_CHAIN_QA.json`: vollständig grün.
- `V8009_QUEST_REWARD_ART_QA.json`: vollständig grün.
- Push-Wrapper für Quest Start/Skip/Claim entfernt; direkte Hooks liegen in `v7110` und `v7045`.
- `v4121` überschreibt `claimQuest`/`v233ClaimQuest` nicht mehr; Reward-Art läuft direkt über Snapshot-/After-Claim-Hooks aus `v7045`.
- Guild-XP Claim-Wrapper `v440`/`v474` wurden bewusst **nicht** entfernt:
  - `v7045` deckt serverautoritäre Quest-Sideeffects ab;
  - Local/Mirror braucht weiterhin den Legacy-Guild-XP-Pfad.
  - Entfernen wäre aktuell nicht verhaltensneutral.
- Erster manueller Quest-Meilensteintest ist jetzt fällig:
  1. Questseite öffnen – drei Angebote sichtbar, kein Flackern/Leerseite;
  2. Quest starten – korrekter Dampf-Abzug, aktive Karte erscheint;
  3. Timer zählt sichtbar;
  4. optional Skip testen – Zeit-Samen/Skip-Funktion prüfen;
  5. Quest abschließen/Claim – genau eine Belohnung;
  6. Reward-Popup inkl. Item-Art prüfen;
  7. neue Questangebote erscheinen;
  8. keine doppelte Gilden-EP-/Reward-Ausgabe und keine Fehlermeldung.
- Nach diesem manuellen Meilenstein erst weitere Claim-/Guild-Konsolidierung.

### Dungeon Activity Reward Hotfix 30.09.2026

- Manueller Fund im Dungeon-Rewardfenster:
  - `Keine Gilden-EP für diese Aktivität verbucht`
  - `Wochen-Truhen-EP werden geprüft …`
  - Quest-Activity-XP funktionierte dagegen.
- Root Cause serverseitig bestätigt:
  - `player_dungeon_runs` hatte zwei Activity-Trigger auf **AFTER INSERT**:
    - `trg_v7165_guild_xp_dungeon_runs`
    - `trg_v8009_dungeon_side_rewards`
  - Beim INSERT ist der Dungeon-Run noch nicht ausgewertet; `won=false` / `resolved_at=null`.
  - Der Kampf wird erst danach ausgewertet und derselbe Run per UPDATE auf `won=true` + `resolved_at` gesetzt.
  - Dadurch liefen weder Weekly-Chest- noch Guild-XP-Award.
- Supabase Migration angewendet:
  - `fix_dungeon_activity_triggers_on_resolve`
  - beide Trigger laufen jetzt auf `AFTER UPDATE OF won, resolved_at`
  - Guard: nur `new.won is true`, `new.resolved_at is not null` und nur beim Übergang von unresolved/not-won.
- Award-Funktionen bleiben unverändert und idempotent über `dungeon:<run_id>`:
  - `v6359_weekly_chest_activity_for`
  - `v6360_award_guild_activity_for`
- Triggerdefinitionen nach Migration nochmals verifiziert.
- Test erforderlich: nächster erfolgreicher Dungeonkampf muss im Rewardfenster konkrete Wochen-Truhen-EP und Gilden-EP (oder legitimen Cap/keine-Gilde-Status) anzeigen.

### Dungeon Activity Reward – manuell bestätigt 30.09.2026

- Manueller Test durch Nutzer erfolgreich:
  - Dungeon-Sieg abgeschlossen.
  - Gilden-EP werden wieder korrekt verbucht.
  - Wochen-Truhen-EP werden wieder korrekt verbucht.
- Server-Hotfix `fix_dungeon_activity_triggers_on_resolve` damit praktisch bestätigt.
- Dungeon-Activity-Reward-Fehler geschlossen.

### Quest / Dungeon Übergabestand für neuen Chat – 30.09.2026

- Dungeon Activity Reward Hotfix ist **manuell bestätigt**:
  - Gilden-EP im Dungeon funktionieren wieder.
  - Wochen-Truhen-EP im Dungeon funktionieren wieder.
  - Servermigration: `fix_dungeon_activity_triggers_on_resolve`.
  - Ursache war: Activity-Trigger liefen auf `AFTER INSERT`, obwohl `won/resolved_at` erst später per UPDATE gesetzt werden.
  - Trigger laufen jetzt auf erfolgreichem resolved UPDATE.
- Quest Sprint:
  - viele alte `renderQuests`-/`startQuest`-/`claimQuest`-Wrapper wurden bereits in direkte Hooks überführt.
  - kanonische Owner weiterhin:
    - Render: `v6344`
    - Start: `v7110`
    - Claim/Receipt: `v7045`
  - Startup-Painter in `v386`, `v392`, `v4172` wurden entfernt; alle drei Dateien haben dort keinen eigenen verzögerten Startup-`setTimeout` mehr.
  - Active-Quest-Geometrie wurde zusätzlich direkt in `v392` stabilisiert.
- Manueller Restfehler:
  - vor allem bei der **ersten Quest nach Login** springt/flackert die aktive Questkarte noch gelegentlich.
  - Videoanalyse zeigte: nicht die ganze App zoomt; konkret ändert sich der Skip-/Zeit-Samen-Block.
  - `v394-time-seeds-style` besitzt einen `@media(max-width:390px)`-Breakpoint, der Spaltenbreite/Gap/Seed-Kachel ändert.
  - Dadurch kann der Block zwischen zwei Geometrien springen.
- Letzter gestarteter Fix:
  - Workflow: `.github/workflows/v8009-quest-skip-layout-lock.yml`
  - Transform: `.github/scripts/v8009_quest_skip_layout_lock.py`
  - aktueller HEAD beim Übergabestand: `aefd513172bffe75982ced1ad14378b3063a055b`
  - letzter Commit-Text: `V8.009 QUEST: lock skip row layout`
  - Ziel: den mobilen `v394`-Sonderblock entfernen und eine feste 2-Spalten-Geometrie `minmax(0,1fr) 76px` verwenden.
  - WICHTIG: Der Transform war beim letzten Check noch nicht als Ergebnis-Commit in `beta.html` angekommen.
- Nächster Schritt im neuen Chat:
  1. aktuellen HEAD lesen;
  2. prüfen, ob `V8009_QUEST_SKIP_LAYOUT_LOCK.json` existiert;
  3. prüfen, ob `beta.html` im Style `v394-time-seeds-style` bereits `grid-template-columns:minmax(0,1fr) 76px;` enthält und der 390px-Mobile-Override weg ist;
  4. erst dann Nutzer ausdrücklich sagen **„jetzt testen“**;
  5. Testfall: neu einloggen -> sofort erste Quest starten -> beobachten, ob Skip-/Zeit-Samen-Bereich bzw. Karte noch springt/flackert.
- Stable / `index.html` weiterhin unangetastet.

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
- `beta.html`: ca. **5751305 Byte**
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


### First-Login / schwarzer Bildschirm – Fix 30.09.2026

- Repro: normaler E-Mail-/Passwort-Login wurde von Supabase erfolgreich mit HTTP 200 akzeptiert, danach zeigte der Client trotzdem schwarzen Zwischenzustand / Login-Fehler.
- Server-Profil des betroffenen Accounts war vorhanden und gültig; Fehler lag nach erfolgreicher Authentifizierung im Client-Finalize/Bootstrap.
- Nutzerbeobachtung bestätigte: manuelles Abmelden aus dem schwarzen Zustand + erneuter Login funktionierte. Damit war ein staler/in-flight Session-/Finalize-Zustand der entscheidende Unterschied.
- Fix Commit: `d727c979dfb9c5b7fa6de304cae90494a65f6b58`
  - neuer Helper im bestehenden `v200-stable-core`: `v200LoginReadyFor(user)`;
  - E-Mail-Login nutzt jetzt `v200FinalizeAuthenticatedLogin(user)`;
  - erster kanonischer Finalizer bleibt unverändert der Owner;
  - wenn der erste Finalize wegen einer bereits laufenden Auth-Transition fehlschlägt, wartet der Login kurz auf denselben Accountzustand;
  - falls nötig wird die weiterhin gültige Supabase-Sitzung geprüft und exakt ein zweiter Lauf desselben kanonischen Finalizers ausgeführt;
  - kein Sign-out/Sign-in-Workaround mehr nötig;
  - echte Session-/Bootstrap-Fehler bleiben weiterhin sichtbar und werden nicht als Erfolg maskiert.
- Automatische QA: **grün**
  - `v200-stable-core` Syntax grün;
  - Recovery-Vertrag grün;
  - Diff-Sanity grün.
- Gleichzeitig bestätigt: die zuvor gefundenen toten Shop-Aufrufe `v030MakeWeaponOffer()` und `v030MakeMaterialOffer()` sind im aktuellen Beta-Stand bereits entfernt; aktiver Shop nutzt `v030MakeGear(v030WeaponBase())` bzw. `v030MakeMaterial()`.
- Stable / `index.html`: unverändert.

### Login / 10-Minuten-Idle-Race – Fix 30.09.2026

- Nutzer-Video reproduziert einen sporadischen Fehler direkt nach erneutem Login:
  - Toast: `Account konnte nicht serverseitig geladen werden`
  - Fehler: `BETA_CHARACTER_BOOTSTRAP_INCOMPLETE`
  - anschließend leerer/inkonsistenter App-Zustand statt sauberem Login oder Startseite.
- Nutzerbeobachtung: Fehler tritt insbesondere nach dem automatischen Logout nach 10 Minuten Inaktivität auf.
- Root Cause im bestehenden Auth-/Logout-Lifecycle:
  - `v301-auth-idle-hard-lock` startet `v136Logout('idle')`;
  - der kanonische V4.159/`v4136-account-save-owner` bestätigt vor dem eigentlichen Supabase-`signOut()` noch den Server-Spielstand;
  - während dieser Vorbereitungsphase war `__V301_LOGOUT_IN_PROGRESS__` noch nicht gesetzt;
  - dadurch konnte ein neuer E-Mail-/Google-Login bzw. Finalize parallel zum noch laufenden Logout starten;
  - `v200FinalizeUser()` konnte dann gegen eine Sitzung laufen, die parallel beendet wurde, wodurch der Beta-Character-Bootstrap fehlschlug.
- Direkter Owner-Fix, Commit `2d7c1bdfcad3e83dddc2fca8a5abd05957729279`:
  - bestehender `v4136`-Logout-Owner mit genau einer laufenden `logoutPromise` serialisiert;
  - neue reine Lifecycle-Flag `__V4136_LOGOUT_PREPARING__` wird vor `directCloudWrite()` gesetzt und danach sicher gelöscht;
  - E-Mail-Login, Google-Login, zentraler Finalize und Auth-State-Listener blockieren während Logout-Vorbereitung/Logout;
  - E-Mail-Login behandelt `v200FinalizeUser() === false` nicht mehr stillschweigend als Erfolg.
- Architektur:
  - **kein neuer Renderer**
  - **kein neuer Render-Wrapper**
  - **kein neuer Timer**
  - **kein neuer MutationObserver**
  - bestehende Auth-/Logout-Owner direkt geändert.
- Automatische QA: **vollständig grün**
  - `v200-stable-core` Syntax grün;
  - `v4136-account-save-owner` Syntax grün;
  - Race-Fix-Vertrag grün;
  - Diff-Sanity grün;
  - nur `beta.html` + `V8009_AUTH_IDLE_LOGIN_RACE_FIX.json` geändert;
  - Stable/`index.html` unverändert.
- Manueller Test ist noch offen und kann erst sinnvoll erfolgen, wenn der aktuelle Repo-`beta.html`-Stand tatsächlich live unter `/beta` ausgeliefert wird.

### Beta-Startstabilität / Seite wirkt teilweise hängend – Fix 30.09.2026

- Nutzer meldete direkt nach dem Idle-Login-Thema, dass die Seite teilweise hängt bzw. Probleme macht.
- Live-/Repo-Browservergleich zeigte: **echte Runtime-Startfehler existierten auch im aktuellen Repo-Build**, also nicht nur ein Cloudflare-Verzögerungsproblem.
- Reproduzierte kritische Fehler vor Fix:
  - `v030MakeWeaponOffer is not defined`
  - `v030MakeMaterialOffer is not defined`
  - `v030RenderMaterials is not defined`
  - `questPool is not defined`
  - `fightDungeon is not defined`
  - Null-DOM-Zugriffe auf `onclick` / `className`
  - Social/Friends-Zugriffe auf `v073User.id` vor bestehender Session
  - Guild-Legacy-Dateien nutzten nicht definiertes `IS_BETA`
  - vor Login unnötige Supabase-Anfragen mit 401/permission denied.
- Direkte Owner-/Legacy-Bereinigung ohne neue Render-Schicht:
  - Guild-Beta-Guards in
    - `js/features/guild/legacy/06-v408-guild-upgrade-audit-fix.js`
    - `js/features/guild/legacy/07-v410-guild-level-system.js`
    auf `window.GROW_RELEASE_CHANNEL` umgestellt;
  - Hall/Friends-Owner `js/features/pvp/beta/v8009-s1-v4130-hall-dungeon-authority.js` blockiert Serverabfragen vor echter Auth-Session;
  - `beta.html` nutzt bei Shop-Refresh die vorhandenen aktuellen Generatoren statt entfernter `v030MakeWeaponOffer`/`v030MakeMaterialOffer`;
  - Tagesreset bevorzugt den bestehenden `v057FillShops`-Owner;
  - alte Material-/Quest-/Dungeon-Hooks greifen nur noch ein, wenn ihr jeweiliger Legacy-Owner tatsächlich existiert;
  - Reset-Button und Equipment-Slot-Zugriffe null-sicher;
  - Social/Public-Abfragen werden vor Login gestoppt statt 401-Schleifen auszulösen.
- Finaler Beta-Code-Commit:
  - `06be757c3faf109c2f3c3f18195086d1909592d0` — `V8.009 beta: fix startup runtime faults`
- Automatische Chromium-QA **grün**:
  - aktueller Repo-`beta.html` lädt HTTP 200 vollständig;
  - **0** `ReferenceError`;
  - **0** `TypeError`;
  - **0** `Cannot read properties of null`;
  - **0** Supabase-401/`permission denied for table profiles` im ausgeloggten Starttest;
  - bekannte kritische Startfehler vollständig entfernt.
- Stable/`index.html` unverändert.
- Kein neuer Renderer, kein neuer Render-Wrapper, kein neuer MutationObserver für diesen Fix.

## LIVE-BETA DEPLOY-BEFUND 30.09.2026

- Nutzer-Screenshot 15:28 zeigte weiterhin exakt den alten Top-3-Stand.
- GitHub-Repo ist **nicht** die Ursache:
  - aktuelles `beta.html`: **5.751.305 Byte**
  - SHA256: `371da8a6dbb69cde45d36f0896abe7399120469b3200846f9c5820604a8a82dd`
  - enthält `v6145-podium-portrait`
  - enthält cache-versionierten Include `v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2`.
- Live-Audit gegen `https://gamenew.djtomssen.workers.dev/beta`:
  - ausgeliefert: **5.749.692 Byte**
  - SHA256: `0b5e785c78ab730e48000e30ab95891aebf654369bac730b466175c8f62b2562`
  - **kein** `v6145-podium-portrait`
  - **kein** cache-versionierter v6145-Include
  - entspricht dem älteren Hall-Video-Fix-Stand.
- Cloudflare-Header:
  - `Cache-Control: public, max-age=0, must-revalidate`
  - `CF-Cache-Status: MISS`
  - damit ist es **kein Browser-/CDN-Cacheproblem**, sondern der Worker/Host liefert tatsächlich einen älteren Beta-Build.
- `tester.html` ist nur die Beta-Tester-Anleitungsseite und nicht die Spiel-Beta.
- Im GitHub-Repo existiert **kein Cloudflare/Wrangler/Deploy-Workflow** für den Worker; der Live-Deploy liegt außerhalb dieses Repos bzw. muss extern neu veröffentlicht werden.
- Verifikation:
  - `V8009_LIVE_BETA_AUDIT.json` prüft den echten Cloudflare-Endpunkt aus GitHub Actions;
  - `V8009_DEPLOY_PATH_AUDIT.json` bestätigt: kein Wrangler-/Cloudflare-/Worker-Deploypfad im Repo;
  - `tester.html` ist nur die Beta-Tester-Anleitungsseite, nicht die Spiel-Beta.
- Live-Runtime-Nachtest um ca. 16:56 nach den Startup-Fixes:
  - Live `/beta` enthält inzwischen den neuen Auth-Race-Marker (`has_new_auth_fix = true`);
  - Live wirft aber weiterhin die vorherigen Startup-Fehler (`v030MakeWeaponOffer`, `v030RenderMaterials`, `questPool`, `fightDungeon`, Null-DOM/User-Zugriffe, `IS_BETA`, Supabase-401);
  - damit liefert Cloudflare aktuell **einen Zwischenstand**: Auth-Fix bereits veröffentlicht, Startup-Stability-Commit `06be757c3faf109c2f3c3f18195086d1909592d0` noch nicht vollständig live;
  - derselbe aktuelle Repo-Build ist lokal/Chromium dagegen ohne diese kritischen Fehler grün.
- Aktueller Blocker ist **Deployment**, nicht Hall-Code.
- **Keine weiteren Hall-Code-Patches durchführen, bis Live-`/beta` denselben Stand wie Repo-`beta.html` ausliefert.**
- Stable `/` stimmt exakt mit `index.html` überein und bleibt unverändert.

- Klarstellung Nutzer 30.09.2026 16:13:
  - der Screenshot mit „Hall of Haze wird geladen …“ zeigt **nur den normalen initialen Ladezustand direkt beim Betreten**;
  - die Hall lädt danach vollständig;
  - **kein Hall-Loader-Hänger / kein neuer Runtime-Loader-Bug**;
  - nicht weiter am Loader arbeiten.
\n## 4. EXAKTER nächster Schritt

### ZUERST: aktuellen `beta.html`-Stand live nach `/beta` deployen

1. Cloudflare-/Worker-Beta neu veröffentlichen, sodass Live-`/beta` dem aktuellen Repo-`beta.html` entspricht.
2. Danach Live-Audit erneut ausführen und prüfen:
   - Bytes/Hash müssen dem aktuellen Repo-Stand entsprechen;
   - `v6145-podium-portrait` muss live vorhanden sein;
   - `v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2` muss live geladen werden;
   - der Auth-Race-Fix muss live enthalten sein;
   - die Startup-Stability-Fixes aus Commit `06be757c3faf109c2f3c3f18195086d1909592d0` müssen live enthalten sein.
3. Erst **danach** zwei manuelle Meilenstein-Tests:
   - Beta frisch öffnen: Login-Maske muss ohne Hänger/Runtime-Fehler stabil erscheinen;
   - Hall Top 3 / Avatar-Rahmen erneut prüfen;
   - 10-Minuten-Idle-Logout auslösen und anschließend erneut anmelden; kein `BETA_CHARACTER_BOOTSTRAP_INCOMPLETE`, kein leerer Zwischenzustand.
4. Wenn Hall danach noch falsch ist, am bestehenden kanonischen `v6145`-/`v7230`-Owner weiterarbeiten.
5. Wenn Login nach dem Idle-Logout weiterhin fehlschlägt, zuerst den bestehenden `v200`/`v301`/`v4136`-Lifecycle anhand der neuen Guards diagnostizieren; **keinen zusätzlichen Auth-Patch darüberlegen**.
6. **Keine neue Patch-Schicht, keinen neuen Renderer, Wrapper, Timer oder Observer hinzufügen.**

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


### Quest Active-Card Restfix – 30.09.2026

- Manueller Test nach Skip-Layout-Lock:
  - aktiver Questbereich flackert/springt weiterhin;
  - nach erfolgreichem Claim blieb die aktive Questkarte teilweise sichtbar;
  - außerdem zeigte die aktive Questkarte ein anderes Bild als das zuvor gewählte Angebot.
- Root Cause Bild/Flackern:
  - `v6344 decorateCards()` dekorierte global alle `.v386-card` per Index der drei aktuellen Angebote;
  - dadurch wurde auch `.v392-active-view > .v386-card` fälschlich mit Angebot 0/1/2 dekoriert;
  - `v392PaintActive()` und der spätere v6344-Decorator malten deshalb abwechselnd unterschiedliche Art auf dieselbe aktive Karte.
- Fix:
  - Commit `976d62c47102d960e436abacee559c86bf4891b6`:
    - v6344 dekoriert Angebotskarten nur noch innerhalb `.v386-list`;
    - aktive Karte wird separat mit `s.quests.active` dekoriert;
    - gemeinsamer direkter Helper `v6344DecorateQuestCard(card,q)`.
  - Commit `93b59faff24a9d3120e067fc0de3dc404df96976`:
    - v392 ruft den exakten Active-Quest-Art-Helper direkt im selben Paint auf;
    - kein nachträglicher Index-Repaint mehr nötig.
- Fix für stehenbleibende Active-Card:
  - Commit `479da8ed5a02715bff70a3403ad6352a2ae2a8a8`:
    - v392 leert und versteckt die Active-View hart, sobald `s.quests.active` null ist.
  - Commit `aa988d216bc1593beb3212a0614050baffdbcfbe`:
    - nach bestätigtem erfolgreichem Server-Claim wird die lokale Projektion `s.quests.active=null` sofort gesetzt;
    - ein fehlgeschlagener/staler Folge-Sync kann dadurch die konsumierte Quest nicht sichtbar stehen lassen;
    - explizite Server-Bundle-/State-Daten bleiben danach weiterhin autoritativ.
- Keine neue Render-Schicht, kein neuer Timer, kein MutationObserver.
- Stable / `index.html`: unverändert.
- Nächster manueller Test:
  1. neu einloggen;
  2. erste Quest starten;
  3. prüfen, ob Bild exakt dem gewählten Angebot entspricht und die Karte nicht mehr zwischen zwei Zuständen springt;
  4. Timer/Skip prüfen;
  5. Claim ausführen;
  6. aktive Karte muss unmittelbar verschwinden und die drei neuen Angebote müssen sichtbar sein.


### Quest Elite-Panel Flicker Root Fix – 30.09.2026

- Nutzer bestätigt: Questbild ist nach Active-Art-Fix korrekt, aber das Flackern bleibt.
- Entscheidender Hinweis aus manuellem Test: Beim Flackern wechselt sichtbar auch der Text im Elite-Quest-Block.
- Root Cause im Code bestätigt:
  - `v4172-quest-rpg-script.js` schrieb bei jedem kanonischen Quest-Paint eigenen Elite-Text in `.v4172-elite-info`;
  - `v4222-separate-elite-quest-script.js` schrieb kurz danach per verzögertem `setTimeout` einen anderen Elite-Text in denselben DOM-Knoten;
  - v4222 besaß zusätzlich noch einen eigenen `renderQuests`-Wrapper mit verzögertem 10-ms-Repaint sowie einen 800-ms-Startup-Paint.
  - Damit existierten zwei sichtbare Owner für denselben Elite-Block; der Textwechsel im Gerätetest bestätigt genau diesen Race.
- Fixes:
  - `70bdb9551de29eaf8e93bf802827e5e86e278f8d`
    - v4172 erzeugt/positioniert den Elite-Host nur noch;
    - v4172 schreibt keinen Elite-Inhalt mehr.
  - `a87ba524c17a08dc74a59ee9313590d37a7ab05d`
    - v4222 ist jetzt alleiniger Content-Owner über `v4222RenderElitePanel`;
    - alter verzögerter `renderQuests`-Wrapper entfernt;
    - 800-ms-Startup-Elite-Repaint entfernt;
    - 10/20-ms Panel-Repaints auf direkte Aufrufe reduziert.
  - `f7519c18a6d9af7aae03bcf13a593c5e679a61b5`
    - kanonischer v6344-Quest-Render ruft v4222 direkt unmittelbar nach v4172 auf.
- Architektur:
  - kein neuer Renderer;
  - kein neuer Timer;
  - kein MutationObserver;
  - ein sichtbarer Owner für Elite-Panel-Inhalt.
- Stable / `index.html`: unverändert.
- Manueller Test jetzt sinnvoll: erste Quest direkt nach Login starten und auf Elite-Text + gesamte aktive Karte achten.


### Quest Flicker – v321 Startup Repaint entfernt – 30.09.2026

- Nutzer bestätigt nach Elite-Owner-Fix:
  - Elite-Block flackert nicht mehr;
  - der Bereich darunter flackert weiterhin.
- Weitere Ursache gefunden:
  - `v321-elite-hard-guarantee-dampf-scale.js` führte 420 ms nach Startup noch einen vollständigen `renderQuests()` aus;
  - damit wurde die komplette Questdarstellung nach dem ersten kanonischen Paint erneut aufgebaut;
  - das passt exakt zum verbleibenden sichtbaren Flicker unterhalb des inzwischen stabilen Elite-Blocks.
- Fix:
  - Commit `6b3c57a890be0bb33d9a694165edb9ddc9681440`
  - verzögerten 420-ms-`renderQuests()`-Startup-Paint entfernt;
  - nur die reine Daten-Normalisierung `v271NormalizeQuestOffers()` bleibt bestehen.
- Kein neuer Renderer, Timer oder Observer.
- Stable / `index.html`: unverändert.
- Nächster Test: neu einloggen -> sofort erste Quest starten -> prüfen, ob der gesamte Bereich unterhalb Elite nun stabil bleibt.


### Quest Skip-Bereich Flicker – Direktintegration – 30.09.2026

- Nutzer bestätigt nach Elite-/v321-Fixes:
  - Elite-Bereich stabil;
  - verbleibendes Flackern offenbar nur noch im Skip-/Zeit-Samen-Bereich.
- Ursachen im Code:
  - `v4127` malte den Skip-Bereich standardmäßig erst über doppeltes `requestAnimationFrame` nach;
  - `v6344` rief diesen verzögerten Skip-Paint nach dem kanonischen Quest-Render erneut auf;
  - `v7110` und `v7045` schedulten denselben verzögerten Paint nach Start/Server-Sync ebenfalls;
  - parallel existierte in `v316` noch ein alter Skip-Painter sowie ein 350-ms-Startup-`renderQuests()`.
- Fixes:
  - `1fea0a4e363b32000d97e0715bba8f5d7c84de6e`
    - alter v316-Skip-Painter aus aktiver Renderkette genommen;
    - 350-ms-Startup-Full-Repaint entfernt;
    - Balance-Normalisierung bleibt erhalten.
  - `fe998c423aba10eef2de8d7af0e65c93f577e2ba`
    - v392 malt `v4127EnsureQuestSkip()` direkt im selben Paint wie die aktive Questkarte.
  - `c55e0a41553b0bbe3ae2043341f5564e9bd826e4`
    - v6344 schedult keinen alten/v316 Skip-Paint mehr;
    - nutzt direkten v4127-Ensure-Aufruf.
  - `1f161feaaad09a1ab4680c8c16a492650438ba81`
    - v7110 Start-Posthook nutzt direkten Skip-Paint.
  - `c680103cb9748ff61cb331967a20ef155ca85945`
    - v7045 Server-Start/Claim/Skip nutzt direkten Skip-Paint statt verzögertem Scheduling.
- Ziel: Skip-/Zeit-Samen-Zeile existiert bereits beim ersten sichtbaren Active-Quest-Paint und wird nicht 1–2 Frames später nachgebaut.
- Stable / `index.html`: unverändert.
- Nächster Test: neu einloggen -> erste Quest starten -> nur Skip-/Zeit-Samen-Zeile beobachten.


### Quest Skip Restflackern – idempotenter Paint – 30.09.2026

- Nutzer bestätigt: Restflackern deutlich schwächer, aber im Skip-Bereich noch sichtbar.
- Letzte konkrete Ursache im v4127-Owner:
  - `scheduleSkip()` lief weiterhin über doppeltes `requestAnimationFrame`;
  - derselbe Skip-Block konnte nach dem direkten Paint nochmals 1–2 Frames später neu geschrieben werden;
  - `ensureSkip()` setzte bei jedem Aufruf erneut `btn.innerHTML` und `stock.innerHTML`, auch wenn Inhalt unverändert war.
- Fix:
  - Commit `0d0a293c04a299ddabfc7ffb5f495c586eef1565`
  - `scheduleSkip()` versucht zuerst synchron zu malen und nutzt nur noch einen einzelnen RAF-Retry, wenn der Host noch nicht existiert;
  - Button-Markup wird nur noch geändert, wenn es sich tatsächlich unterscheidet;
  - Zeit-Samen-Bestand wird nur noch bei geänderter Anzahl neu ins DOM geschrieben;
  - kein unconditional delayed Startup-Repaint mehr;
  - pageshow/visibility reparieren nur noch, wenn die Questseite wirklich sichtbar ist.
- Stable / `index.html`: unverändert.
- Nächster Test: neu einloggen -> erste Quest starten -> Skip-/Zeit-Samen-Zeile beobachten.


### Quest Skip – doppelte Zeit-Samen-Kachel – 30.09.2026

- Screenshot bestätigt:
  - Skip-Bereich flackert weiterhin leicht;
  - Zeit-Samen-Kachel erscheint doppelt: einmal separat oberhalb und einmal korrekt rechts im Skip-Row.
- Root Cause im v4127-Owner:
  - v4127 suchte die Bestandskachel nur innerhalb der kanonischen `.v394-skip-row`;
  - eine bereits vorhandene historische `.v394-time-seed-stock` außerhalb der Row wurde dadurch nicht übernommen;
  - v4127 erzeugte deshalb eine zweite Kachel.
- Fix:
  - Commit `4bf52bf7e6d2e632d29039df8316e45065c7cb23`
  - vorhandene Zeit-Samen-Kachel wird jetzt hostweit gefunden und in die kanonische Skip-Row verschoben;
  - zusätzliche doppelte Seed-Kacheln werden entfernt;
  - zusätzliche doppelte Skip-Rows werden ebenfalls entfernt;
  - kein neuer Renderer/Timer/Observer.
- Stable / `index.html`: unverändert.
- Nächster Test: erste Quest starten; es darf nur noch genau eine Zeit-Samen-Kachel geben. Restflackern weiter beobachten.


### Quest Claim stale-active Hotfix 30.09.2026

- Nutzer-Video nach Skip-/Flicker-Arbeiten:
  - nach Quest-Claim erschien hinter/anschließend wieder eine sehr alte Questansicht;
  - zusätzlich war weiterhin ein Rewardfenster sichtbar.
- Root Cause im serverautoritären Claim-Pfad:
  - `claimServerQuest()` setzte `s.quests.active=null`,
  - danach konnte `applyBundle(b)` denselben bereits verbrauchten Run aus einem stale Claim-Receipt/Bundle wieder als `active` einsetzen;
  - dadurch durfte ein alter Quest-Renderer nach `paintAll()` nochmals eine abgeschlossene/alte aktive Questoberfläche aufbauen.
- Fix Commit: `3a5caba3765325d5dd020153188923d90eb8e676`
  - Claim- und Timeout-Recovery-Bundles wenden Rewards weiterhin vollständig an;
  - Feld `active` wird aus dem Reward-Bundle vor `applyBundle()` entfernt;
  - aktiver Questzustand wird anschließend ausschließlich über `canonicalQuestState(true)` frisch vom Server bezogen;
  - verhindert, dass ein verbrauchter Quest-Run nach dem Claim wieder aufersteht.
- Stable / `index.html`: unverändert.
- Manueller Test erforderlich:
  1. Quest bis Claim spielen;
  2. Belohnung abholen;
  3. nach Combat/Reward darf keine alte `Aktiver Auftrag`-Questseite mehr erscheinen;
  4. danach müssen direkt die neuen drei Angebote sichtbar sein.


### Quest Claim Hotfix – manuell bestätigt + Claim/Gilden-Audit gestartet 30.09.2026

- Nutzer bestätigt nach Commit `3a5caba3765325d5dd020153188923d90eb8e676`:
  - Quest-Claim funktioniert vollständig;
  - keine alte Questseite erscheint mehr;
  - Reward-/Claim-Flow funktioniert;
  - neue Questangebote erscheinen korrekt.
- Damit ist der Quest-Claim stale-active Hotfix **manuell bestätigt**.
- Nächste Konsolidierungsphase: verbleibende Claim-/Gilden-Wrapper.
- Aktueller Bestand:
  - `v411` und `v474` besitzen Legacy-Quest-Claim-Hooks hinter `__V6140_EVENT_BUS__`-Guards;
  - `v440` besitzt weiterhin einen direkten Quest-Claim-Wrapper;
  - `v7045` ist weiterhin der letzte serverautoritäre Claim-/Receipt-Owner.
- Vor weiterer Entfernung wird der zentrale Inline-Event-Bus `v6140-central-game-event-bridge` deterministisch auditiert, damit Local/Mirror-Gilden-EP nicht verloren gehen.
- Audit hinzugefügt:
  - Script: `.github/scripts/v8009_quest_claim_guild_audit.py`
  - Workflow: `.github/workflows/v8009-quest-claim-guild-audit.yml`
  - Commits: `1a74ec7a33741f7cab8c31fc83ec90c981c26719`, `48c9b16497594ec5e7c14645ce85aaadbc317865`
  - Zieloutput: `V8009_QUEST_CLAIM_GUILD_AUDIT.json`
- Bis der Audit die tatsächliche v6140-Rolle bestätigt: **keinen v440/v474/v411 Quest-Claim-Wrapper entfernen**.
- Stable / `index.html`: unverändert.


### Quest Claim/Gilden-EP Konsolidierung – v440 in Beta retired 30.09.2026

- Claim/Gilden-Audit Ergebnis: `V8009_QUEST_CLAIM_GUILD_AUDIT.json` (Bot-Commit `71ea80778e7986633a899c0dbdcc9b81a1984b02`).
- Audit bestätigt:
  - `v6140-central-game-event-bridge` ist in Beta aktiv und erzeugt das zentrale `questCompleted`-Event;
  - der Subscriber vergibt Gilden-EP über `v474AwardGuildActivity('quest', ...)` bzw. Fallback `v411AwardGuildActivity('quest')`;
  - `v411` und `v474` besitzen ihre historischen Quest-Claim-Wrapper nur hinter `__V6140_EVENT_BUS__`-Guards und sind bei aktivem Bus deshalb nicht zusätzliche Beta-Owner;
  - `v440` war dagegen nicht gegated und legte weiterhin einen zusätzlichen Claim-/RPC-Guard-Pfad über die Beta.
- Modus-Trennung:
  - Enforce: `v7045` ist der autoritäre Claim-/Receipt-Owner und führt serverseitige Sideeffects direkt aus;
  - Local/Mirror: `v7045` delegiert an die bestehende Claim-Kette, wodurch `v6140` genau den lokalen Completion-/Guild-XP-Pfad besitzt.
- Fix Commit: `58278f533a1740a9ce84ef4ac149fb5a4742bddf`
  - `v440` bleibt für Stable/Legacy unverändert funktionsfähig;
  - in Beta kehrt `v440` nach Export seiner Legacy-Hilfsfunktion sofort zurück;
  - kein zusätzlicher `v233ClaimQuest`-/`claimQuest`-Wrapper mehr aus v440;
  - kein zusätzlicher v440-RPC-Guard / v073Init-Wrapper / Startup-Timer in Beta.
- QA hinzugefügt:
  - `.github/scripts/v8009_quest_v440_retire_qa.py`
  - `.github/workflows/v8009-quest-v440-retire-qa.yml`
  - Commits `85ef09f31e7ef6bf070eb42497da0884fe1ebb00`, `68f994cbc7efad323002b718b647655e2cbc71d8`.
- Stable / `index.html`: funktional unverändert.
- Nächster manueller Meilenstein:
  - mit einem Charakter in einer Gilde genau eine Quest abschließen;
  - Gilden-EP müssen weiterhin gebucht werden;
  - es darf nur ein Gilden-EP-Award/Toast für die Quest erscheinen.


### Quest Gilden-EP manuell bestätigt + v4121 Doppel-Repaint entfernt 30.09.2026

- Manueller Test nach v440-Retirement:
  - Quest mit Tomssen abgeschlossen;
  - Gilden-EP erscheinen korrekt im Belohnungsfenster;
  - keine zusätzliche Gilden-EP-Toast-Meldung sichtbar;
  - kein doppelter sichtbarer Award.
- Damit ist Commit `58278f533a1740a9ce84ef4ac149fb5a4742bddf` manuell bestätigt.

- Nächste Claim-Konsolidierung:
  - `v4121-quest-reward-current-item.js` erhielt den Reward-Art-Paint bereits direkt über `v7045 -> v4121AfterQuestClaim`;
  - zusätzlich existierte noch ein globaler Click-Listener auf `#v392ClaimQuest,#claimQuest`, der 120 ms später dieselbe Reward-Art nochmals malte.
- Fix Commit: `350b6e4fd071a199955a52c05c1131e572aa12fe`
  - globalen 120-ms-Click-Repaint entfernt;
  - direkter `v4121AfterQuestClaim`-Hook bleibt unverändert;
  - Snapshot-/Art-Auflösung bleibt unverändert;
  - keine Reward-, Item-, XP-, Gold- oder Serverlogik verändert.
- QA hinzugefügt:
  - `.github/scripts/v8009_quest_v4121_repaint_retire_qa.py`
  - `.github/workflows/v8009-quest-v4121-repaint-retire-qa.yml`
  - Commits `c54467a0ed608d75ff07508b9ab6a8df5694113f`, `7d3c1349be1fa84a916e30d51f8f9fb9b0871c92`.
- Stable / `index.html`: unverändert.
- Nächster Schritt:
  - verbleibende Claim-Kette `v496 -> v6140 -> v233 -> v7045` weiter inventarisieren;
  - nur Wrapper entfernen, deren Local/Mirror-Fallback oder Single-Payout-Schutz nachweislich anderweitig abgedeckt ist.


### Quest Level-Up vor Belohnung – Reihenfolge festgelegt 30.09.2026

- Nutzerwunsch:
  - bei Quest-Claim muss ein echter Levelaufstieg **immer vor** dem Quest-Belohnungsfenster erscheinen.
- Root Cause:
  - im serverautoritären Quest-Claim setzt `v7045` Level/XP direkt aus dem Server-Bundle;
  - dadurch läuft der normale `addXp()`-Pfad mit dem bestehenden Level-Up-Owner `v420` nicht;
  - das Reward-Popup wurde anschließend sofort geöffnet.
- Owner-Audit:
  - `V8009_LEVELUP_OWNER_AUDIT.json`, Commit `2727101871132e493039eee91d5ab33fe776cac9`;
  - aktiver Level-Up-Owner: `v420-levelup-notification-fix`;
  - `v6211` ist nur Reliability/Fallback.
- Fix Commit: `ef1dbd6147048b19909886bdf66d95817105ff78`
  - `v420` exportiert jetzt den bestehenden Presenter als `window.v420ShowLevelUp`;
  - der vorhandene 3,6-s-Lifecycle liefert einen Abschluss-Promise;
  - `v7045` snapshottet das Level vor dem Claim;
  - bei serverbestätigtem Levelanstieg wird erst `v420ShowLevelUp(oldLevel,newLevel)` vollständig abgearbeitet;
  - erst danach öffnet `v7136ShowServerReward(...)` das Quest-Belohnungsfenster.
- Keine zusätzliche Level-Up-UI, kein neuer Popup-Renderer.
- Stable / `index.html`: unverändert.
- Nächster manueller Test:
  - Quest so abschließen, dass Tomssen ein Level steigt;
  - Reihenfolge muss sein: Kampf -> LEVEL UP -> danach Quest-Belohnungsfenster.


### Quest Claim-Kette weiter konsolidiert 30.09.2026

- `v496-quest-claim-single-payout.js`
  - Fix `058c708bc497efa4ee4d20acb495a7df26ace1db`;
  - Single-Payout-Lock bleibt erhalten;
  - `v496RepairStalePaidQuest` bleibt erhalten und wird vom kanonischen `v6344`-Render direkt vor dem Paint aufgerufen;
  - nach normal erfolgreichem Claim keine zusätzlichen RAF-/80-ms-`renderQuests()`-Repaints mehr;
  - beim echten bereits-bezahlten Stale-Fall nur noch ein synchroner Reparatur-Render.
  - QA: `V8009_QUEST_V496_REPAINT_RETIRE_QA.json`, Commit `58170bf6fb4edd9bf2147d469a5cd879aa5e5655`, grün.

- `v233-quest-reward-final-click.js`
  - Fix `28baeadd266653f447567c8134ccc71d20e0061d`;
  - historischen documentweiten Capture-Click-Owner für `#claimQuest` entfernt;
  - kanonischer aktiver Button `#v392ClaimQuest` ruft weiterhin direkt `v233ClaimQuest()` auf;
  - `v233BindClaimButton` bleibt als Compatibility-No-op für den bestehenden v6344-Aufruf.
  - QA: `V8009_QUEST_V233_CAPTURE_RETIRE_QA.json`, Commit `e16daa30d4b7e5a4a11426c5e63aeff535e073aa`, grün.

- Reward-Overlay:
  - Fix `ad0bd72882bfe7dae6aef86284c2f686ed445d01`;
  - v233 zeigt das lokale Reward-Overlay nur noch einmal synchron;
  - alter RAF-Repaint + 80-ms-Repaint entfernt.
  - QA: `V8009_QUEST_V233_REWARD_RETRY_RETIRE_QA.json`, Commit `0fdea38b419f5af274ea52db146f232e58b10b5c`, grün.

- Fremder Altballast in v233:
  - Commit `4a903af5262dcae0ba398725a5a4b9e0a53d45bf`;
  - 300-ms-Startup-Timer entfernt, der alte `V4.29 Stable`-Versionslabels schrieb;
  - Quest-Claim-Datei besitzt damit keinen Versions-Writer mehr.

- Aktuelle Claim-Verantwortung:
  - Server-Enforce: `v7045` Claim/Receipt/Recovery/Reward;
  - Local/Mirror: `v233` Präsentation + `v496` Single-Payout-Guard;
  - Completion-Events: `v6140`;
  - Gilden-EP: `v474/v411`, kein v440-Beta-Owner mehr.
- Stable / `index.html`: unverändert.
- Nächster Schritt: Start-Quest-Wrapperkette `v443 / v4127 / gl-quest-ready-push / v7042 / v7045 / v7110` konsolidieren.


### Quest Start-/Navigation-Kette weiter konsolidiert 30.09.2026

- `v443-quest-dampf-live-fix.js`
  - Commit `93feca96d4d4859aa280a31733556270e4a5f096`: `v443AfterQuestStart` malt Dampf nach dem kanonischen Start nur noch einmal direkt statt über `settle()`.
  - Commit `155fa6dd1645d2944b5ec4863c78d852c38fa443`: gesamte historische Dampf-Repaint-Kette entfernt:
    - kein RAF-Retry;
    - keine 20/90/280-ms-Retries;
    - keine 400/1200/5200/12000-ms-Startup-Retries;
    - stattdessen direkte Paints bei Initialisierung, Persist, `growlegends:account-ready`, DOMContentLoaded und pageshow.
  - QA: `V8009_QUEST_V443_RETRY_RETIRE_QA.json`, Bot-Commit `63d43575d8b6e62d30940646300711358578e001`, grün.

- Navigation/Skip:
  - Audit `V8009_QUEST_NAV_SKIP_AUDIT.json`, Bot-Commit `a2e9d49f9e50137f84368568a5a82eedf1b3f659`;
  - gemeinsamer Post-Navigation-Owner `v7119` dispatcht `growlegends:navigation-open-v7119`;
  - `v229` nutzt diesen Shared-Event bereits für Quest-/Character-Refresh.
  - Commit `0d3c21a3ba45661365b183d2e2b5f4b3e76e8b13`:
    - `v4127` wickelt `v032Go` nicht mehr;
    - Skip-Reparatur lauscht stattdessen auf denselben Shared-Navigation-Event und reagiert nur bei `id==='quests'`;
    - direkter `v4127EnsureQuestSkip`-Owner bleibt unverändert.
  - QA: `V8009_QUEST_V4127_NAV_QA.json`, Bot-Commit `96149916e91ba5fb72cdd88e96ae3b1fae5a4027`, grün.

- Aktuelle Start-Verantwortung:
  - `v7110`: Preflight / serverseitiger State-Abgleich / Post-Start-Hooks;
  - `v7045`: serverautoritäres Start-RPC im Enforce-Modus;
  - `v443`, `v4127`, Push: direkte Hooks, keine eigenen Start-Wrapper;
  - Navigation: gemeinsamer v7119-Post-Navigation-Event statt Quest-eigenem `v032Go`-Layer.
- Stable / `index.html`: unverändert.
- Nächster sinnvoller Meilenstein-Test:
  1. Questseite öffnen;
  2. Quest starten;
  3. Dampf muss sofort einmal korrekt sinken;
  4. Skip-/Zeit-Samen-Zeile muss sofort korrekt erscheinen;
  5. Seite verlassen und wieder zu Quest wechseln; keine Verzögerung/kein Flackern/keine doppelte Skip-Zeile.


### Erste Quest nach Login – Post-Claim hängt auf aktiver Questseite 01.10.2026

- Nutzerbeobachtung:
  - nur/auffällig bei der **ersten Quest nach Login**;
  - Belohnung wird abgeholt;
  - danach bleibt die aktive Questseite sichtbar, aber ohne laufenden Timer;
  - nach Navigation weg von Quest und zurück erscheinen die drei Questangebote korrekt.
- Root Cause in `v7045`:
  - `canonicalQuestState(true)` gab trotz `force=true` einen bereits laufenden `questStateFlight` zurück;
  - ein noch vom Login/Boot stammender State-Request konnte dadurch nach einem erfolgreichen Claim einen alten `active`-Questzustand erneut anwenden;
  - das erklärt den First-Login-Charakter des Fehlers und warum erneute Navigation später korrekt rendert.
- Fix Commit: `26aef6e805ec067c9a1e374f9fceef8de71aab42`
  - `force=true` verwendet keinen alten Inflight-State-Request mehr;
  - Quest-State-Requests tragen jetzt eine `questStateEpoch`;
  - jede Mutation/Invalidierung erhöht die Epoch;
  - Requests, die vor einer Mutation gestartet wurden, dürfen ihren State danach nicht mehr auf `s.quests` anwenden;
  - `invalidateQuestState()` leert zusätzlich den gespeicherten Flight.
- QA:
  - `V8009_QUEST_FIRST_CLAIM_LOGIN_RACE_QA.json`
  - Bot-Commit `36756fb8ec4ce2fad18bf5f762a6b54198e92323`
  - alle Checks grün.
- Stable / `index.html`: unverändert.
- Manueller Test:
  1. frisch einloggen;
  2. direkt die erste Quest starten;
  3. Quest beenden/überspringen und Belohnung abholen;
  4. ohne Navigation müssen sofort die drei neuen Questangebote sichtbar sein;
  5. keine leere aktive Questkarte ohne Timer.


### First-Login-Quest manuell bestätigt + v4178 Live-Doppelpfad retired 01.10.2026

- Nutzer bestätigt den First-Login-Claim-Fix nach Commit `26aef6e805ec067c9a1e374f9fceef8de71aab42`:
  - erste Quest nach frischem Login abschließen/claimen funktioniert;
  - keine leere aktive Questkarte mehr;
  - drei neue Questangebote erscheinen direkt ohne Navigations-Workaround.
- Damit ist der First-Login-State-Race-Fix **manuell bestätigt**.

- `v4178-quest-live-hard-fix.js` war vollständig redundant:
  - eigener 1-s-Quest-Timer;
  - eigener `v032Go`-Wrapper;
  - eigene visibility/pageshow-Repaints;
  - eigener Startup-Timer;
  - dieselben Aufgaben werden bereits von `v229`, `v392` und dem Shared-v7119-Navigationsevent übernommen.
- Commit `d7edb9c8df6cb1f1a2ae836f054aaa379e2c1380`:
  - v4178 komplett als aktiven Runtime-Layer retired;
  - Datei enthält nur noch Retired-Marker;
  - kein Intervall, kein v032Go-Wrapper, kein Timer, kein Repaint mehr.
- QA hinzugefügt:
  - `.github/scripts/v8009_quest_v4178_retire_qa.py`
  - `.github/workflows/v8009-quest-v4178-retire-qa.yml`
  - Commits `9009a3077512e2dabe329e4c7d2bc2d22d3701bd`, `ebe3877b20b49e6f0895e23ca7f01b0fc5d48626`.
- Zusätzlich Commit `c749e5bc90e87760c67a5de60986e6515b657ca6`:
  - alten 350-ms-`V4.29 Stable` Versionswriter aus `v229-live-ui-sync.js` entfernt;
  - Quest/PvP-Live-Sync bleibt unverändert.
- Aktueller Quest-Live-Timer-Owner:
  - `v229`: einziges 1-s-Intervall;
  - `v392`: aktiver Karten-/Timer-Paint;
  - `v6344`: kanonischer Quest-Renderer.
- Stable / `index.html`: unverändert.


### Quest Runtime-Layer Audit + v4222 Wrapper-Konsolidierung 01.10.2026

- Runtime-Audit: `V8009_QUEST_RUNTIME_LAYER_AUDIT.json`, Bot-Commit `e7c900482e390d2bc29d9691e3e7e087b5388556`.
- `v4178-quest-live-hard-fix.js` vollständig retired:
  - Commit `d7edb9c8df6cb1f1a2ae836f054aaa379e2c1380`;
  - kein eigener 1-s-Timer, kein `v032Go`-Wrapper, kein pageshow/visibility/startup repaint mehr;
  - Live-Timer-Owner bleibt `v229`, aktiver Karten-/Tick-Owner `v392`.
- `v229-live-ui-sync.js`:
  - Commit `c749e5bc90e87760c67a5de60986e6515b657ca6`;
  - alter 350-ms-Versionswriter entfernt.

- Audit zeigt als wichtigste verbleibende Claim/Start-Layer:
  - `v099`: Local/Mirror Basis-Claim und XP-Event-Logik -> vorerst behalten;
  - `v310`: Local/Mirror Elite-Reward-/Generator-Logik -> vorerst behalten;
  - `v4222`: zusätzliche Claim-/Start-Wrapper nur für Elite-UI/Nacharbeit -> konsolidiert.

- `v4222` Konsolidierung:
  - Commit `6383472f111b0ab9beaab433f72f31328f5b32b7`: beide Claim-Wrapper + Start-Wrapper aus v4222 entfernt;
  - v4222 exportiert jetzt direkte Hooks `v4222AfterQuestClaim` und `v4222AfterQuestStart`;
  - Commit `9bc54518376e6ab3749ff20c36fdb0ddc460b4bf`: `v233` ruft den Elite-Post-Claim-Hook direkt nach erfolgreichem Local/Mirror-Claim;
  - Commit `8ac7416a4c63df2955d47db87c883ca4ac50003d`: `v7110` ruft den Elite-Post-Start-Hook direkt im kanonischen Start-Postflow.
- Elite-Chance, Elite-Balance, Elite-Belohnung und Elite-Panel selbst wurden nicht geändert.
- QA hinzugefügt:
  - `.github/scripts/v8009_quest_v4222_hook_qa.py`
  - `.github/workflows/v8009-quest-v4222-hook-qa.yml`
  - Commits `c36ab241142e35f7e17b5aa8ab35ce598f729f06`, `f5280c24a9c85d70dc38ef2a3ccce9e66ce7292d`
  - Bot-Output `V8009_QUEST_V4222_HOOK_QA.json` noch ausstehend zum Zeitpunkt dieser Statusnotiz.
- Stable / `index.html`: unverändert.
- Nach grüner QA nächster Check: normale Quest starten/claimen; falls eine Elite-Quest angeboten wird, muss sie weiterhin separat im Elite-Panel erscheinen und normale 3er-Auswahl unverändert bleiben.


### Local/Mirror Claim + Quest Fight-Art weiter konsolidiert 01.10.2026

- Später Owner erkannt:
  - `v235-quest-reward-stability.js` überschreibt `v233ClaimQuest` später als v233 selbst und ist damit der tatsächliche Local/Mirror-Claim-Owner.
- Commit `05109f744f282563c31acd1da256fde4f9aa44b7`:
  - `v235` ruft `v4222AfterQuestClaim` direkt nach erfolgreichem Local/Mirror-Claim;
  - dadurch ist die Elite-Nacharbeit auch beim tatsächlichen letzten Local-Claim-Owner abgesichert;
  - alten Reward-RAF + 80-ms-Overlay-Retry aus v235 entfernt;
  - alten 350-ms-Versionswriter aus v235 entfernt.
- Commit `aa3685ab6a1be0902f57076b177cfa51def13d41`:
  - `v240` finaler lokaler Reward-Presenter zeigt das Reward-Overlay nur noch einmal;
  - RAF-/80-ms-Repaint entfernt;
  - 440-ms-Startup-Inventar-/Versionswriter entfernt.
- QA:
  - `V8009_QUEST_LOCAL_CLAIM_OWNER_QA.json`
  - Bot-Commit `2613570655eff24ed599f56a205ec3acd6c42370`
  - alle Checks grün.

- Fight-Art Owner Audit:
  - `V8009_QUEST_FIGHT_ART_OWNER_AUDIT.json`
  - Bot-Commit `96883bc7f0dd4dd9a535a63df35923032bd14c1e`
  - bestätigt: `v636-quest-dungeon-authority-core.js` übernimmt später vollständig `v311PlayFight`, Quest-Kampfarena, Gegnername und Gegnerbild.
  - `v626` und `v627` waren danach nur noch historische Nachmal-/Preview-Layer.
- Retired:
  - `v626` Commit `3615b29b0f6fb0df2518a81cd10a508ecbd929ff`
  - `v627` Commit `a32aae6212fc13c26f26d20d69f4782e91a4aa10`
  - zusammen entfernt: alter v311PlayFight-Wrapper, Preview-Wrapper, 6 Timer und 4 RAF-Repaints.
- Fight-Art QA:
  - `V8009_QUEST_FIGHT_ART_RETIRE_QA.json`
  - Bot-Commit `352e86d4b6a9e6b2f959900da74aca7708d07d57`
  - alle Checks grün.
- Kanonischer Quest-Kampf-Owner bleibt `v636`.
- Stable / `index.html`: unverändert.
- Nächster Block: `v099` + `v310` Local/Mirror-Claim-/Elite-Wrapper gezielt entkoppeln, ohne XP-Event, Elite-Chance oder Elite-Garantien zu verändern.


### v099/v310 Local-Mirror-Kette + Reward-Art weiter konsolidiert 01.10.2026

- `v310-elite-quests.js`:
  - Commit `22a5153e6295d00081c0979fd7bfd1b547cf8b84`;
  - `claimQuest`-Wrapper vollständig entfernt;
  - neue direkte Hooks:
    - `v310BeginQuestClaim()`: öffnet ausschließlich beim bereiten Local/Mirror-Claim das automatische Elite-Roll-Fenster;
    - `v310FinishQuestClaim(active,paid)`: vergibt bei erfolgreicher Elite-Quest weiterhin garantiert 1–3 Harz-Taler + Blau/Episch-Item und schließt/resetet das Roll-Fenster.
  - Elite-Chance bleibt exakt `0.06` (6 %);
  - `makeQuest`-Generatorfenster / Anti-Reroll-Semantik unverändert;
  - verzögerter 300-ms-/RAF-Startup-Paint entfernt; Painter nur noch exportiert.
- `v235-quest-reward-stability.js`:
  - Commit `d37da59f1d1723e9b910eb03bc9fddcdf5f8b5ca`;
  - tatsächlicher Local/Mirror-Claim-Owner ruft v310 Begin/Finish direkt um den Claim herum auf;
  - v310 Finish läuft vor v4222 Post-Claim.
- QA:
  - `V8009_QUEST_V310_DIRECT_HOOK_QA.json`
  - Bot-Commit `5a7f247a1c22c7afa0a13b8537c597cc6ed20f3d`
  - grün.

- `v099-real-quest-xp-fix.js`:
  - Commit `879e87c4389298214241bd7680597ce5e1fca7e6`;
  - Local/Mirror-`claimQuest`-Basis bleibt unverändert;
  - globaler `render`-Wrapper entfernt;
  - documentweiter Click + 40-ms-XP-Repaint entfernt;
  - XP-Event-Painter als `v099PaintQuestXp` exportiert.
- `v6344-quest-variety-js.js`:
  - Commit `3f18dae57c0774263428ed143faa56f734239b88`;
  - kanonischer Quest-Renderer ruft `v099PaintQuestXp` direkt im Renderpfad auf.
- Gemeinsame QA:
  - `V8009_QUEST_V099_V310_QA.json`
  - Bot-Commit `10a38e71bde2d41c5699b80d6bebdbc93ca70d08`
  - grün.

- `v4121-quest-reward-current-item.js`:
  - Commit `9ee4380ec3ea64ca5eb0cffc6525b3ed2da8d594`;
  - Reward-Art-Hook läuft jetzt synchron genau einmal;
  - kein RAF und kein 60-ms-Retry mehr;
  - Snapshot-/Item-Art-Auflösung unverändert;
  - kanonischer Claim-Owner v7045 ruft den Hook weiterhin direkt.
- QA:
  - `V8009_QUEST_V4121_SYNC_ART_QA.json`
  - alle Checks grün.
- Stable / `index.html`: unverändert.
- Aktuelle Local/Mirror-Verantwortung:
  - `v099`: Basis-Payout (XP/Gold/Item/Angebote);
  - `v310`: Elite-Roll-/Elite-Garantie über direkte Hooks, kein Claim-Wrapper;
  - `v235`: finaler Local/Mirror-Claim-Transaktionsowner;
  - `v240`: finaler lokaler Reward-Presenter;
  - `v6344`: Quest-Renderer/UI-Paints.


### v321 / v309 / v637 / v7046 Runtime-Layer weiter reduziert 01.10.2026

- `v321-elite-hard-guarantee-dampf-scale.js`
  - Commit `f032c96de74a3c02c246a639dd4e2850b6377218`: `renderQuests`- und globaler `render`-Wrapper entfernt.
  - Dampf-Datenvorbereitung als `v321PrepareQuestRender` exportiert.
  - Dampfkosten-Paint als `v321PaintQuestCosts` exportiert.
  - Commit `c76a8a75ccb1c915c3bab87ab701cb10a21bfcaf`: beide Hooks direkt in den kanonischen `v6344`-Renderpfad eingebunden.
  - Dampfkurve / Restverbrauch / Elite-Garantie unverändert.
  - QA `V8009_QUEST_V321_RENDER_QA.json`, Bot-Commit `8aa4d7383b4800bc903c7dc01953af148fdca9b7`, grün.

- `v309-distinct-quest-offers.js`
  - Commit `a29cff01021c9fde2a5cb403460a89ab026654f5`: RAF-/250-ms-Rollenbadge-Repaints entfernt.
  - Rollen-Painter als `v309PaintQuestRoles` exportiert.
  - Commit `ee9c63944d6c433acb3dc9fdc7a9c5cd2a575872`: direkter Aufruf aus `v6344`.
  - GitHub-Workflow für Bot-QA wurde nicht gestartet; Contract daher direkt gegen main geprüft:
    - Export vorhanden;
    - kein RAF;
    - kein Timeout;
    - Prepare-Hook vorhanden;
    - v6344 ruft direkten Painter;
    - alter Schedule-Hook weg.
  - Alle sechs Direct-Checks grün.

- `v637-quest-exact-dungeon-core.js`
  - Commit `39c318a128388da851e6fa9f3571d25cd984cb6e`: globalen Click-Listener, pageshow-Listener, RAF und Startup-Timer entfernt; nur `v637SyncQuestDungeon` bleibt.
  - Commit `3addfdea9c59417222ff239c316d3bd17b6d0331`: `v636` ruft den Sync direkt nach Kampf-Root-Aufbau sowie direkt nach Skill-Chip-Erzeugung.
  - QA `V8009_QUEST_V637_DIRECT_HOOK_QA.json`, Bot-Commit `988d85fa2f8c8fc4c268baf89c926faa401398b4`, grün.

- `v7046-quest-event-duplicate-reward-guard.js`
  - Ladeaudit `V8009_QUEST_V7046_ORDER_AUDIT.json`, Bot-Commit `6bdfdabe64f798131e3e59f3c8d823cf6f2fb4b8`.
  - bestätigte Ladefolge: `v6140 -> v7045 -> v7046`.
  - account-ready markiert den Atomic-Owner synchron, bevor v6140 seinen 120-ms-Reinstall ausführt.
  - Commit `1658e28840852548586bc5c1345d4a30d324ef19`: defensiven 50/180/500/1400/3200-ms-Retry-Zug entfernt.
  - direkter Load-, account-ready-, DOMContentLoaded- und pageshow-Guard bleibt.
  - QA `V8009_QUEST_V7046_RETRY_QA.json`: alle Checks grün.

- Stable / `index.html`: unverändert.


### Quest Render-/Guard-/Local-Claim-Kette weiter vereinfacht 01.10.2026

- `v309-distinct-quest-offers.js`
  - Commit `a29cff01021c9fde2a5cb403460a89ab026654f5`: RAF + 250-ms-Startup-Repaint entfernt.
  - `v309PaintQuestRoles` als direkter Painter exportiert.
  - Commit `ee9c63944d6c433acb3dc9fdc7a9c5cd2a575872`: direkter Aufruf aus `v6344`.
  - QA `V8009_QUEST_V309_DIRECT_PAINT_QA.json`, Bot-Commit `53443ff27e540920d04984b9450c528171d2fedb`, grün.

- `v6344-quest-variety-js.js`
  - Commit `57a9970bab2c90d4f5ab30be13ff0f371762c689`;
  - freien 700-ms-Startup-Repaint entfernt;
  - account-ready/pageshow bleiben Lifecycle-Owner;
  - first-playable bleibt Asset-Warmup-Owner.

- `v7046-quest-event-duplicate-reward-guard.js`
  - Ladefolge durch Audit bestätigt: `v6140 -> v7045 -> v7046`;
  - Commit `1658e28840852548586bc5c1345d4a30d324ef19`: 50/180/500/1400/3200-ms-Startup-Retry-Zug entfernt;
  - direkter Load/account-ready/DOMContentLoaded/pageshow-Guard bleibt.
  - QA `V8009_QUEST_V7046_RETRY_QA.json`, Bot-Commit `3aaaefb12864d23e28883ad8c6b5eb8f7626d15b`, grün.

- `v637-quest-exact-dungeon-core.js`
  - Commit `39c318a128388da851e6fa9f3571d25cd984cb6e`: Click-/pageshow-/RAF-/Startup-Repaint entfernt.
  - Commit `3addfdea9c59417222ff239c316d3bd17b6d0331`: direkter Sync aus v636 nach Fight-Root-Aufbau und Skill-Chip-Erzeugung.
  - QA `V8009_QUEST_V637_DIRECT_HOOK_QA.json`, Bot-Commit `988d85fa2f8c8fc4c268baf89c926faa401398b4`, grün.

- `v496-quest-claim-single-payout.js`
  - Commit `1d2cf4a51a904cb879f84c81018075936c53d4b6`;
  - `claimQuest`-Wrapper vollständig entfernt;
  - neue direkte Hooks:
    - `v496BeginQuestClaim(q)`: Single-Payout-/Inflight-/Already-Paid-Guard;
    - `v496FinishQuestClaim(txn,paid)`: Lock-Abschluss und UI-State;
  - `v496RepairStalePaidQuest` bleibt als direkter Pre-Render-Repair.
- `v235-quest-reward-stability.js`
  - Commit `546eef58e8d7b8ead2b2fc52c91ad279041315b6`;
  - finaler Local/Mirror-Claim-Owner ruft v496 Begin/Finish direkt um den Basisclaim;
  - Duplicate-Claim wird vor Basis-Payout blockiert;
  - v496 Finish läuft vor v310 Finish.
- QA `V8009_QUEST_V496_DIRECT_HOOK_QA.json`: alle Checks grün.

- Aktuelle Local/Mirror-Claim-Verantwortung:
  - `v099`: einzige Basis-`claimQuest`-Payout-Funktion;
  - `v235`: finaler Local/Mirror-Transaktionsowner;
  - `v496`: direkter Single-Payout-Hook, kein Wrapper;
  - `v310`: direkter Elite-Hook, kein Wrapper;
  - `v4222`: direkter Elite-Panel/Lifecycle-Hook, kein Wrapper.
- Stable / `index.html`: unverändert.


### Quest Fast Batch A 01.10.2026
- Batch-Modus aktiv: sichere Cleanup-Schritte bündeln, nur bei riskanten Änderungen oder sinnvollen manuellen Testpunkten stoppen.
- `v316`: globalen No-op-`render()`-Wrapper entfernt, Commit `4992c501841ac247246f9e88d58221fd8f9f84e1`.
- `v4127`: Skip-Reparatur synchron, kein RAF-Fallback mehr, Commit `723056b63c0859e79229ac909c5c3fa18ba024eb`.
- `v229`: Quest-Start/Claim-Timer-Sync direkt statt RAF, 1-s-Live-Timer bleibt, Commit `b0cf35617ee323d203d409d1a6be211ec7f5e9d3`.
- Gemeinsame QA-Dateien: `.github/scripts/v8009_quest_fast_batch_a_qa.py`, `.github/workflows/v8009-quest-fast-batch-a-qa.yml`.
- Aktueller Audit: `V8009_QUEST_RUNTIME_LAYER_AUDIT_CURRENT.json`.
- Bewusst verbleibend: v636 Kampfanimation, v7045/v7110 Authority/RPC, v6344 Asset-Warmup, v231 Multi-Domain-Sync, v233 Dungeon-Map-Refresh.
- Quest-Cleanup für diesen Sprint ausreichend abgeschlossen.
- Nächster Seitenblock: Charakterseite.


### Fast page sweep: Gilde / Turm / Home / PvP / Dungeon 01.10.2026

- Arbeitsmodus: sichere Lifecycle-/Navigation-/Repaint-Cleanups seitenweise gebündelt; Gameplay-/Combat-/Authority-Timer bleiben unangetastet.

#### Gilde
- Load-Audit: `V8009_GUILD_LOAD_ORDER_AUDIT.json`.
- Nicht mehr geladen: c4/c5/c6 Overview sowie c7/c13 Replay; aktiv sind c25-Owner + c18 Replay.
- `df5a013a8497c6b203f1b7308deee311dbe686f7`: c25 Overview — direkte Paints, Shared-v7119 statt eigenem v032Go-Gate.
- `cc2f1e2c1f713acce5df747efea8658648760315`: Gildenkrieg — Shared-v7119, Polish-Repaint-Burst entfernt, direkte Visual-Polishes.
- `7c8605dfb4a03b052377f5cc98aa1ce17aba0e95`: Gildenchat — direkter Scroll/Postload ohne unnötigen RAF.
- QA `V8009_GUILD_FAST_BATCH_A_QA.json`, Bot-Commit `7b719edfb6e47e2668ae0766954ec8809db7bb4d`: 12/12 grün.

#### Turm
- Load-Audit `V8009_TOWER_LOAD_ORDER_AUDIT.json`, Bot-Commit `91a65393bfa38862f39ed8e371b7627f7b7dab43`.
- Ladefolge: direct-preempt -> lobby -> tower-system -> tower-entry.
- `de5caa1093963548cd27b6f9b56a3a9e43ab48d1`: späten doppelten Tower-Entry/Menu-Layer retired.
- `9f52dac6c37df5c7fe2eecd4bd66d7e5dfee3f65`: Tower-System nutzt Shared-v7119 statt eigenem v032Go-Wrapper; Enter/Leave/Result/Battle-Abbruchsemantik bleibt.
- Frühe direct-preempt Install-Retries bleiben bewusst, weil diese Datei lange vor Tower-System lädt.
- Bot-QA-Ausgabe zum Zeitpunkt dieser Notiz noch nicht zurückgeschrieben; direkte Hauptchecks gegen main bestätigen Entry-Retirement, Shared Navigation und erhaltene Preempt-Retries.

#### Home
- `5324437b7c916066d428573b56a2b1178f2942a1`: eigener v032Go-Wrapper entfernt; Header/World laufen über Shared-v7119 direkt.
- Character-Tab RAF+40ms bleibt bewusst als DOM-Verfügbarkeits-Fallback.
- QA `V8009_HOME_FAST_QA.json`, Bot-Commit `39391f7e477b2b6cf10fe8bd9428e0f6fcc9a866`: 5/5 grün.

#### PvP / Hall / Battlelog
- Runtime-Audit: `V8009_PVP_RUNTIME_AUDIT.json`.
- Navigation-only v032Go-Layer ersetzt durch Shared-v7119:
  - v204: `785e2527f7b2666ce2556903d283db62592985dd`
  - v206: `3505bff5cb8d8545c67d85e4f643f7e660a23846` + Find-Bind `7695f0a990892e20ce77d9676a4013a7035fc7c8`
  - v248: `5caff081b8f99a8c6a079d92c2c92c7c629e0438`; 600-ms-Version/Startup-Repaint entfernt
  - v437: `306d8a4cc9ca1765d03d83ba1f5d72f1d5d07191`; v032Go + 500/2000/5000-ms Bind-Retry-Zug entfernt
  - v4130: `7571c0a2e0954a5141fe75250c3837879b9eeb8c`
  - v6200: `547b22701a4f329afe3570c833a8f188135d77ba`; Battlelog-Mail-Navigation direkt, 60-s-Mail-Poll bleibt
- QA `V8009_PVP_FAST_BATCH_A_QA.json`, Bot-Commit `d952fcc54b3738b11a531492832cca8ffd63ebe3`: 16/16 grün.
- PvP-Kampf-/FX-/Atomic-Authority-Timer bewusst nicht verändert.

#### Dungeon
- Runtime-Audit `V8009_DUNGEON_RUNTIME_AUDIT.json`, Bot-Commit `ee044be37083a59367db109016cf31d9beff9aa9`.
- `ae30f18e13425d2077239a4d7493553dc9effe4d`: redundanten D2 Map-Finalizer als Runtime-Lifecycle retired.
- `5a55e619d3dc910201bcb64e6cbefacda3ce6e80`: v7166 auf direkten Canonical-Alias-/Repair-Helper reduziert; D5 Final Seal ist Lifecycle-Owner.
- `f4708256a662a7fbbb5ddfedb27c292f1122e07e`: D5 Shared-v7119 Navigation auf detail.id/detail.screen robust gemacht.
- Combat-Renderer/Animationen und D5 Health-Observer bleiben bewusst unangetastet.
- Bot-QA noch ausstehend zum Zeitpunkt dieser Notiz.

- Stable / `index.html`: unverändert.
- Character-Seite ist überwiegend inline im Monolithen; Audit `V8009_CHARACTER_RUNTIME_AUDIT.json` liegt vor und wird separat per Inline-Extraktor bearbeitet.


### Events / Rewards Kurzprüfung 01.10.2026
- `js/features/events/beta/v8009-weekend-events.js` geprüft:
  - lifecycle-basiert;
  - kein 30-s-Polling;
  - keine alten Startup-Retry-Kaskaden;
  - Boundary-Timer + Startup-Quiet-Koaleszierung sind funktional und bleiben.
- Reward-Pfade geprüft:
  - `js/features/rewards/v7308-reward-consolidation.js`
  - `js/features/rewards/beta/v8009-dungeon-reward-feedback.js`
- Reward-Retries bleiben bewusst erhalten, da sie Server-Feedback (Wochen-Truhe/Gilden-EP) in das bereits gewünschte Reward-Fenster synchronisieren.
- Keine Änderung an Quest-/Dungeon-/PvP-/Tower-Rewarddarstellung in diesem Pass.
- Nächster Block: Inline-Audit Growroom + Schmiede + Händler.


### Fast page sweep Fortsetzung 01.10.2026 — Character / Social / Dealer

#### Growroom / Schmiede / Händler
- `0ea9fa84a7288eb3a7fbb4ae7c2b23eafae72a05`: Inline-Lifecycle für Growroom, Schmiede und Händler konsolidiert.
- Growroom:
  - `v4114` eigener `v032Go`-Wrapper entfernt.
  - Shared `growlegends:navigation-open-v7119` übernimmt Grow-Open-Sync.
  - 250/1500-ms Startup-Retry-Zug entfernt; `account-ready` übernimmt.
- Schmiede:
  - `v6130` MutationObserver + RAF-Lifecycle entfernt.
  - Direkter `refreshForge()`-Owner mit DOMContentLoaded/pageshow/account-ready/shared navigation.
- Händler:
  - v129 direkte Kartenpolitur statt RAF.
  - v131/v135 von globalem `render()` auf `renderShop()` scoped.
- QA `V8009_INLINE_GROW_FORGE_SHOP_QA.json`, Bot-Commit `69a9e9d8d287c77cdedbe99d879fd7d26765612e`: 13/13 grün.

#### Charakterseite
- Patch A `4eb65b9247b6e1afc442d52dddfb3cc2f5c0b8ca`:
  - v4153 globalen Character-`render()`-Wrapper retired; Shared-v7119 bleibt.
  - v4156 globalen Character-`render()`-Wrapper retired; Shared-v7119 bleibt.
  - v533 Inventar-Startup-Retry-Zug `120/400/900/1800/3600` entfernt; direkte `renderInventory`/Arrange/Nav/Pageshow-Owner bleiben.
- Patch B `cf1a79f24d11b164aee37d616e77e02f1f087289`:
  - v4140 Attribute: globalen `render()`-Wrapper retired + 120/500/1400-ms Retry-Zug entfernt.
  - v515 Mobile Hero Polish: globalen `render()`-Wrapper + 80/220/600/1200/2400-ms Retry-Zug entfernt; Shared-v7119 ergänzt.
  - v526 Ornament: 80/220/600/1400/3000/6000-ms Retry-Zug entfernt.
  - v537 Attribute-Layout: 120/500/1400-ms Retry-Zug entfernt.
  - v543 Talentbaum: 150/600/1600-ms Retry-Zug entfernt.
  - v546 Materialien: 180/700/1700-ms Retry-Zug entfernt.
- Keine Attributwerte, Talentlogik, Itemlogik oder Avatar-/Equipment-Mechanik geändert.
- QA `V8009_CHARACTER_FAST_QA_AB.json`, Bot-Commit `7d4ce63674c0012b81c05cc7446fe5604d7c0b80`: 16/16 grün.

#### Freunde / Mail / Systemtechnik
- `5bf5569f1f04efdcd533ad245d2e2a3bc9844d2a`: Social-/Mail-/Systemtechnik-Lifecycles konsolidiert.
- Mail v381:
  - eigener `v032Go`-Wrapper entfernt.
  - Shared-v7119 lädt Mail direkt.
  - 60-s-Unread-Poll bleibt bewusst erhalten.
- Freunde/Hall v382/v383:
  - beide eigenen Navigation-`v032Go`-Wrapper entfernt.
  - direkte Ranking/Friends-Loader bleiben und dekorieren nach erfolgreichem Load.
  - Shared-v7119 ergänzt.
- Mail v6202:
  - MutationObserver auf Mail-Screen-Klasse entfernt.
  - 250/1000-ms Reparaturstarts entfernt.
  - account-ready / shared navigation / DOMContentLoaded / pageshow übernehmen.
- Alte V4102-Systemtechnik:
  - automatisches `runQA()` 1,8 s nach Login entfernt.
  - UI-Retry-Kaskade 0/100/500/1500/5000/15000/30000/46000/60000 ms entfernt.
  - spätere V4107-Systemtechnik/Admin-Guard bleibt unverändert.
- QA `V8009_SOCIAL_MAIL_SYSTEMTECH_QA.json`, Bot-Commit `bcec8b92b52e0e29f775cd69692bd9b931b3415d`: 12/12 grün.

#### Harz-/Gold-/Rahmen-/Tütchen-Dealer
- `4528d35e5fc1e81b37c490084e98b88c5ad3b6f1`: Harz-Dealer Render-Lifecycle konsolidiert.
- v567:
  - globaler `render()`-Wrapper entfernt.
  - 60/450/1400-ms Ensure-Retry-Zug entfernt.
  - direkter Hook an `v322RenderDealer` + Shared-v7119 bleibt.
- v322:
  - globaler `render()`-Wrapper retired.
  - Menü-Owner `v032InstallMenu` + Shared-v7119 bleiben.
  - 350-ms Initialisierung ersetzt durch direkten/DOMContentLoaded Setup.
- v339:
  - globaler `render()`-Wrapper retired.
  - 250/1200-ms Dealer/Version-Retry-Zug entfernt.
  - direkter `v322RenderDealer`-Hook + Shared-v7119 bleiben.
- Google-Play `v7236RecoveryBurst` bleibt bewusst unverändert: Kauf-/Recovery-Sicherheitslogik.
- Tütchen-Dealer Sichtbarkeits-/Serverreloads bleiben bewusst unverändert.
- Gold-/Rahmen-Dealer kleine Post-Open-Syncs bleiben vorerst erhalten, da sie Layout/Daten nach asynchronem Öffnen synchronisieren.
- QA `V8009_DEALER_FAST_QA_A.json` läuft; direkte Checks auf main sind grün.

- Stable / `index.html`: weiterhin unverändert.
- Arbeitsregel bleibt: nur Lifecycle-/Navigation-/Repaint-Altlasten entfernen; Authority-, Kauf-, Combat- und Server-Sync-Timer nur ändern, wenn deren Zweck vollständig geklärt ist.


### Final Lifecycle Sweep 01.10.2026 — große Cleanup-Batches

Arbeitsmodus:
- große sichere UI-/Lifecycle-Batches statt Einzel-Fixes;
- nur passive Repaint-/Retry-/Navigation-Altlasten entfernen;
- funktionale Timer für Push, AdMob, Server-Authority, Login/Onboarding, Combat, Rewards, Cooldowns, Receipt-/Retry-Sync bleiben bewusst erhalten;
- Stable / `index.html` bleibt unverändert.

#### Boss / Gildenboss / Dealer
- `05449d93`: Boss pageshow-Repaint direkt gemacht; 40-ms-Retry entfernt.
- `af601048` + `26ba7620`: Quest v306 „erste Quest heute +2 Harz“ direkt in kanonischen v6344-Renderer gehängt; eigene render/reward-Wrapper, RAFs und 300-ms-Startup-Repaint entfernt.
- Gildenboss v6317:
  - Fighter-Cutout-Sync direkt aus `v8008-c18-guildboss-replay-owner.js`;
  - MutationObserver + RAF + 700-ms-Retry entfernt;
  - Guild combat browser QA grün.
- Gildenboss v6316:
  - 250/1200-ms Startup-Retries entfernt;
  - direkter Initial-/Boss-Tab-Cleanup.
- Dealer v322:
  - `v322OpenDealer()` ohne RAF-Repaint;
  - Shared `growlegends:navigation-open-v7119` ist Render-Lifecycle-Owner.

#### Item-Art / Systemtechnik
- v4115: 6 Startup-Paints bis 12,5 s entfernt.
- v4108: 9 Startup-Repaints bis 30 s entfernt.
- v4110 Systemtechnik: 8 Guard-Passes bis 60 s entfernt; direkt bei Systemtechnik-Open/pageshow/visibility.
- v4117 Boots-Art: Startup-Repaints + DOM/pageshow-Delays entfernt.
- v6106 Item-Art: DOM/pageshow/first-playable/220-ms-Fallback + Navigation-RAF entfernt.
- v4103 Item-Surfaces:
  - 10 Repaint-Pässe bis 60 s entfernt;
  - direkte DOM/account-ready/navigation/pageshow/visibility-Hooks;
  - Day-7-Login-Reveal bleibt über aktuellen Item-Card-Owner abgesichert.
- v4129 Power/Version:
  - 100/500/1800/5000-ms Settle-Pässe entfernt;
  - Finalizer/DOMContentLoaded/pageshow/account-ready/visibility bleiben.

#### Quest-QA modernisiert
- Render Pass 3 QA an direkte Hooks angepasst:
  - v309 direkter Paint;
  - v316 alter Skip-Painter als retired;
  - v4127 direkter `EnsureQuestSkip`.
- Quest Consolidation QA entsprechend aktualisiert.
- Render-QA Workflow gegen parallele Push-Races abgesichert (`git pull --rebase origin main` vor Push).
- Aktuelle Quest Contract-QAs grün.

#### Final Sweep Batch 1
- Shop v464/v465: 8 Startup-Repaints bis 19 s entfernt.
- Character v4140 passive RAFs bei DOM/pageshow/Attribute-Tab entfernt; Action-Followup nach echtem Attributkauf bleibt.
- QA grün.

#### Final Sweep Batch 2
- v432 Itemvergleich: 1/4/7,8-s Repaints entfernt.
- v434 Attributpunkte: 250/1200/3500-ms Startup-Paints entfernt.
- direkte Account-/Persist-/Spend-Hooks bleiben.
- QA grün.

#### Final v433
- globalen `v032Go`-Wrapper entfernt;
- 250/1200/4200-ms Ressourcen-Startup-Zug + 1000/4200-ms Dungeon-State-Nachläufer entfernt;
- Shared v7119 + account-ready übernehmen;
- Dungeon-Integritätslogik, Versuchverbrauch und Persistenzguards unverändert.
- QA grün.

#### v6117 / Character passive lifecycle
- v6117 Class-Passive: DOM/pageshow/account-ready RAF/Delay entfernt.
- Equip/Unequip/Sell/Forge-Aktionshooks bleiben.
- passive Character-Open-Paints für Talent/Material/Equipment direkt gemacht.
- QA grün.

#### v488 Harzschmiede
- eigener Navigation-`v032Go`-Wrapper entfernt;
- 250/900/2200/5200/10200/16200-ms Retry-Zug entfernt;
- Shared v7119 für Forge/Menu/Home-Link/Prismatic-Inventar;
- Crafting, Prismatisch-Stats, Kosten und Sell-Rules unverändert.
- QA grün.

#### Big Batch 1
- v4158 Class-Passive passive RAFs entfernt.
- v4106 altes Item-Art-Repaint-Startup-Fanout entfernt.
- v6213 Legacy-Settle-Delays entfernt.
- v6102 Equipment account-ready Delay entfernt.
- v6339 Character-Title Navigation-Delay entfernt; notwendiger Selection-Deferral bleibt.
- QA grün.

#### Big Batch 2
- v435 Gold-Lifetime/Buch:
  - 500/1800/4200/9000-ms Reconcile-Zug + Extra-1000/4200-ms Nachläufer entfernt;
  - account-ready übernimmt;
  - Book-Refresh-Debounce bleibt.
- v452 Account-Schutz-Status:
  - 250/800/1800/4200 + doppelter 250-ms Startup-Zug entfernt.
- v453 Profile-Floor-Reconcile:
  - 250/900/2200/5200-ms Startup-Zug entfernt;
  - account-ready direkter Reconcile.
- v454 Recovery-UI-Cleanup:
  - 250/900/2200/5200-ms Cleanup-Zug entfernt.
- Ledger-/Account-Schutz-/Recovery-Funktionalität bleibt.
- QA grün.

#### Big Batch 3
- v7198 Item-Art:
  - DOM/pageshow/first-playable-Delays + Navigation-RAF entfernt;
  - direkte Lifecycle-Refreshes.
- v6346 Tower:
  - passive pageshow/account-ready/navigation-Delays entfernt;
  - 60-ms Klick-Followup bleibt absichtlich wegen Action-Ordering;
  - 1-s Tower-Live-Timer bleibt.
- QA grün.

#### Hall / Power
- v438 Hall-Live:
  - 500/1800/5200-ms Startup-Repaints + 1800/5200-ms Sync-Nachläufer entfernt;
  - account-ready direkter repaint/schedule.
- v446 Local-Power:
  - 600/1800/5200-ms Startup-Repaints entfernt;
  - echter Sync-Debounce + Klick-Followup bleiben.
- QA grün.

#### Big Batch 4
- v4103 60-s Item-Repaint-Zug entfernt.
- v4129 5-s Version/Power-Settle-Zug entfernt.
- aktuelle Render-/Finalize-/Reveal-Owner bleiben.
- QA grün.

#### Version / Status Cleanup
- mehrere reine Versions-/Status-Nachmaler entfernt:
  - updateValues/version 350/1500/3000 ms;
  - zwei update-Blöcke 350/1400/3000 ms;
  - Shop syncVersion 250/1000 ms;
  - keepVersion 0/500/2500/7000/17000 ms;
  - Systemtechnik paintStatus 50/250/700/1600/3500/8000/15000/30000/60000 ms.
- durch DOM/pageshow/account-ready-Hooks ersetzt.
- QA grün.

#### Big Batch 5
- v470 Equipment/Comparison: Startup-Settle-Zug bis 12,5 s entfernt; relevante DOM-Observer bleiben.
- v511 Character-Reorder: RAF + 150/500/1200-ms Startup-Zug durch DOM/pageshow/v7119 ersetzt.
- Materialien-Enhance: 0/120/450/1000/1800-ms Startup-Zug entfernt; Action-Followup bleibt.
- v6283 Growroom-Guide: 0/100/350/1000/2500-ms Startup-Zug entfernt; sinnvoller Grow-DOM-Observer bleibt.
- QA grün.

#### Big Batch 6
- v441 Shop/Resource: 1/5/11-s Nachläufer entfernt.
- v455 Item-Normalisierung: 250/900/2200/5200-ms Retry-Zug entfernt.
- v456 Level-300-UI: 250/900/2200/5200-ms Retry-Zug entfernt.
- v459 Character-Layout: Retry-Serie bis 13,5 s entfernt.
- v466 Item-/Shop-Dekoration: 250/1200/2600-ms Startup-Zug entfernt.
- v475 Shop-Polish: 80/500/1400-ms Startup-Zug entfernt.
- vorhandene Render-/State-/Navigation-Owner bleiben.
- QA grün.

#### Big Batch 7
- alter Materialien-Enhancer: 0/120/400/900/1800-ms Startup-Zug entfernt.
- Frost-Zweitwaffe: 0/80/220/600/1400-ms Startup-Schedule entfernt; Character-v7119 ergänzt.
- Growroom Tabs v6163: 0/250/900/2200/5000-ms Mount-Zug entfernt; Action-Retries + DOM-Observer bleiben.
- Weltboss-Homecard: 0/250/1000/3000-ms Startup-Prepare-Zug entfernt; World-DOM-Observer bleibt.
- QA grün.

#### Big Batch 8
- Profil-/Viewport-Boot: 0/80/300/900/1800-ms Startup-Zug entfernt; resize/orientation/pageshow bleiben.
- Native-Fullscreen-HUD: 0/80/300/900/1800-ms Startup-Zug entfernt; resize/pageshow bleiben.
- QA grün.
- Bot-Commit: `6969dbd8` (viewport/fullscreen cleanup).
- vorheriger Visual-Batch Bot-Commit: `d788d8c0`.

#### Post-Sweep Bewertung
- Es existieren weiterhin viele `setTimeout`, RAFs und Observer in `beta.html`.
- Diese Zahl allein ist kein Cleanup-Ziel mehr.
- Die verbleibenden langen/regelmäßigen Timer sind überwiegend funktional:
  - Grow-Push-Planung;
  - AdMob Reward-Bestätigung;
  - Server-/Authority-/Hydration-/Receipt-Retries;
  - Login/Onboarding;
  - Combat/FX/Cooldowns;
  - Reward-/Guild-XP-Feedback;
  - Wetter-Fetch-Timeout/Refresh;
  - echte UI-Action-Ordering-Defers.
- Nächster Schritt: nur noch eindeutig visuelle Legacy-Blöcke anfassen; danach gemeinsame Integrations-QA und manueller App-Rundgang.



#### Big Batch 9
- Harzruferin-/Avatar-/Settings-/Registration-UI weiter bereinigt.
- Entfernt:
  - zwei `[0,120,700]` Refresh-Startup-Züge;
  - `[0,120,700]` Decorate-Zug;
  - `[0,120,650]` Refresh-Zug;
  - `[0,250,900]` Fix-Zug;
  - `[0,250,900]` Repair-Zug;
  - Character-Avatar `[0,180,700]` Startup-Sync;
  - `[0,250,800]` Rerender-Zug;
  - Registration `[120,500,1400]` Entry-Paint-Zug.
- Durch direkte `foreground-ready`-/`account-ready`-Hooks ersetzt.
- Klick-/Action-Followups bewusst erhalten, z. B. Character-Avatar nach echtem Öffnen und Talent-Rerender nach Auswahl/Upgrade.
- QA `V8009_FINAL_BIG_BATCH9_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 10
- Growroom Legacy-DOM:
  - 250/1200/5000/15000-ms Cleanup-Zug entfernt;
  - direkte DOM/pageshow/visibility/account-ready Hooks bleiben.
- Tower-Focus:
  - 0/80/300/900-ms bind/reset Startup-Zug entfernt;
  - Menü-MutationObserver sowie resize/orientation-Followups bleiben.
- Character-Title:
  - 0/220/1100/2400-ms Startup-Sync entfernt;
  - account-ready/pageshow/navigation-ready laufen direkt;
  - 20-ms Selection-Followup sowie Double-RAF nach echtem Render bleiben wegen DOM-Reihenfolge.
- QA `V8009_FINAL_BIG_BATCH10_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 11
- Resource-Paint:
  - 200/800/2200/5000-ms Startup-Paint-Zug entfernt;
  - DOMContentLoaded/pageshow/account-ready übernehmen direkt.
- Progression-/Projection-UI:
  - 250/1000/3000-ms Startup-Paint-Zug entfernt;
  - 100-ms account-ready Delay entfernt;
  - Progressions-/Projected-Days-Berechnung unverändert.
- Systemtechnik Settings/Admin-Sync:
  - 0/250/1200-ms Startup-Sync-Zug entfernt;
  - direkte Admin-Check-, Settings-Build-, DOM/pageshow/account-ready-Hooks bleiben.
- QA `V8009_FINAL_BIG_BATCH11_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 12
- v477 Home-Exposure:
  - 150/800/1800-ms Startup-Retry-Zug entfernt;
  - direkte account-ready + Shared-v7119-World-Hooks ergänzt.
- v7117 Dealer-Hub:
  - 50/300/900-ms Startup-Sync entfernt;
  - RAF-Nachmaler aus `openHarz()` / `openGold()` entfernt;
  - Harz-/Gold-Dealer synchronisieren direkt über `growlegends:navigation-open-v7119`.
- Menü-Owner und gemeinsamer v7119-Navigation-Owner bleiben unverändert.
- QA `V8009_FINAL_BIG_BATCH12_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 13
- Auto-Equip UI:
  - 150/650/1600-ms `updateBars` Startup-Repaints entfernt;
  - `flushPending`-Recovery 1000/3000/7000 ms bewusst erhalten.
- Systemtechnik:
  - 120/900/2600-ms `installMenu` Startup-Retries entfernt;
  - Admin-/Power-Drift-Diagnose und Settings-Build-Hooks bleiben.
- Harzruferin Tower-Art:
  - 0/250/800-ms Startup-Reparaturen entfernt;
  - direkter account-ready + Shared-v7119-Tower-Hook;
  - 40-ms Klick-Followup nach echter Tower-Aktion bleibt.
- Harzruferin Begleiter-Position:
  - 0/180/700-ms Startup-Reparaturen entfernt;
  - account-ready direkt;
  - 40-ms Combat-Klick-Followup bleibt.
- QA `V8009_FINAL_BIG_BATCH13_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 14
- v358 Global Header:
  - eigenen `v032Go`-Wrapper entfernt;
  - 300/1200/2500-ms Startup-Paint-Zug entfernt;
  - direkte Shared-v7119-/pageshow-/account-ready-Hooks übernehmen.
- zweiter aktiver Header-Fix:
  - eigenen `v032Go`-Wrapper entfernt;
  - 250/900/1800-ms Startup-Fix-Zug entfernt;
  - direkte Shared-v7119-/pageshow-/account-ready-Hooks.
- v6100 Dock-Normalisierung:
  - eigenen `v032Go`-Wrapper entfernt;
  - passive RAF/100-ms Lifecycle-Nachläufer entfernt;
  - direkte DOMContentLoaded/pageshow/account-ready + Shared-v7119-World-Hooks.
- Resource-Werte, Gameplay und Navigationssemantik unverändert.
- QA `V8009_FINAL_BIG_BATCH14_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 15
- weitere aktive Header-/Alignment-Altlasten entfernt:
  - späteren `fix()`-`v032Go`-Wrapper entfernt;
  - 300/1200-ms Header-Fix-Startup-Zug entfernt;
  - `align()`-`v032Go`-Wrapper entfernt;
  - 300/1200-ms Alignment-Startup-Zug entfernt.
- beide Blöcke laufen jetzt direkt über Shared `growlegends:navigation-open-v7119`, `pageshow` und `account-ready`.
- Harzruferin aktuelles Tower-Gegnerbild:
  - 0/250/900-ms Startup-Reparaturzug entfernt;
  - direkter account-ready + Shared-v7119-Tower-Hook;
  - 60-ms Klick-Followup nach echter Tower-/Combat-Aktion bleibt.
- QA `V8009_FINAL_BIG_BATCH15_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 16
- v362 Header-Resource-Refresh:
  - eigenen `v032Go`-Wrapper entfernt;
  - Shared `growlegends:navigation-open-v7119` übernimmt den passiven Header-Refresh.
- v372 Header-Paint:
  - eigenen `v032Go`-Wrapper entfernt;
  - 300/1400-ms Startup-Paints entfernt;
  - DOMContentLoaded/pageshow/account-ready/shared navigation übernehmen direkt.
- v377 Settings-Gear:
  - eigenen `v032Go`-Wrapper entfernt;
  - Settings werden jetzt über Shared-v7119 bei Navigation geschlossen und der Gear-Bind direkt aktualisiert;
  - 300/1400-ms Startup-Bind-Retries entfernt;
  - Klick-außerhalb-Schließen und bestehende Settings-Portal-/Refresh-Logik bleiben erhalten.
- v376 Quest-Destination-Runtime war bereits retired und wurde nicht erneut verändert.
- v420 Level-Up-Owner blieb vollständig unangetastet.
- QA `V8009_FINAL_BIG_BATCH16_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 17
- v438 Hall-Live:
  - eigenen globalen `v032Go`-Wrapper entfernt;
  - Hall-Open-Sync läuft jetzt über Shared `growlegends:navigation-open-v7119`;
  - `writeLiveHall(true)` + sichtbarer Hall-Repaint bleiben erhalten.
- v446 Local-Power:
  - eigenen globalen `v032Go`-Wrapper entfernt;
  - Shared-v7119 repaintet direkt;
  - bestehende Sync-Semantik für `hall/pvp/guild/friends/character/world` bleibt vollständig erhalten.
- v457 Endgame:
  - eigenen globalen `v032Go`-Wrapper entfernt;
  - 250/900/2200/5200-ms Install-Startup-Zug + 350-ms Stamp-Fallback entfernt;
  - direkte Shared-v7119-/DOMContentLoaded/pageshow/account-ready-Hooks übernehmen;
  - Endgame-Kampflogik und Combat-Timer unverändert.
- v467 Dungeon-Navigation wurde bewusst noch nicht verändert; Rebuild-/Unlock-Recovery wird separat geprüft.
- QA `V8009_FINAL_BIG_BATCH17_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 18
- v201 Startseiten-Legacy:
  - globalen `v032Go`-Wrapper entfernt;
  - globalen `render()`-Wrapper entfernt;
  - neues direktes `v201EnsureHome()` über Shared-v7119 + pageshow;
  - Home-Dashboard/Worldboss-Karte bleiben abgesichert.
- v087 Hauptattribut-Runtime:
  - globalen `render()`-Wrapper entfernt;
  - Badge-Fix läuft nur noch über DOMContentLoaded/pageshow/Character-v7119;
  - v088 bleibt der präzise CSS-Owner für das echte HAUPTATTRIBUT-Pseudo-Label.
- v467 Dungeon:
  - globalen `v032Go`-Wrapper entfernt;
  - Dungeon-Open setzt weiterhin `layer='world'` und `view='map'`;
  - Rebuild-Sicherheiten laufen jetzt über Shared-v7119;
  - bestehender Capture-Fallback für Dungeon-Navigation bleibt;
  - Key-/Unlock-Recovery und Entry-Guards unverändert.
- Kanonischer v6101-`v032Go` wurde bewusst nicht entfernt, da er der aktuelle zentrale Navigationseigentümer ist.
- QA `V8009_FINAL_BIG_BATCH18_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Big Batch 19
- alter Header-Paint-Lifecycle:
  - globalen `v032Go`-Wrapper entfernt;
  - 250/1200/3200-ms Startup-Paints entfernt;
  - DOMContentLoaded/pageshow/account-ready/shared navigation übernehmen.
- v373 Dropdown-Autoclose:
  - globalen `v032Go`-Wrapper entfernt;
  - Hauptmenü schließt jetzt direkt über Shared `growlegends:navigation-open-v7119`;
  - Klick-Sicherheitsfallback im Menü bleibt.
- v4112 Item-Art:
  - globalen `v032Go`-Wrapper entfernt;
  - Item-Art-Queue läuft nur für character/shop/dungeon/hall/endgame über Shared-v7119;
  - eigentliche RAF-Queue für DOM-Dekoration bleibt.
- v6114 Pet-Album:
  - globalen `v032Go`-Wrapper entfernt;
  - Pet-Album schließt über Shared-v7119;
  - Hamburger/Menu-Sicherheitsklick bleibt.
- v6254 Tutorial/Help:
  - globalen `v032Go`-Wrapper entfernt;
  - Hilfe-/Guide-Lifecycle läuft über Shared-v7119;
  - Guide-Delays für echte Post-Navigation-/First-Visit-Reihenfolge bleiben.
- QA `V8009_FINAL_BIG_BATCH19_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Character Materialien Performance-Fix
- Meldung: Charakterseite → Tab **Materialien** fühlte sich ruckelig an.
- Ursache:
  - `v546` baute die komplette Materialliste beim Tab-Klick erneut über `innerHTML` auf;
  - zusätzlich liefen `v681` nach 30 ms und `v683` nach 40 ms nochmals als separate Enhancer;
  - beide Enhancer liefen außerdem separat auf pageshow/account-ready;
  - der `v459ArrangeCharacter`-Wrapper löste zusätzlich einen vollständigen Material-Render aus.
- Fix:
  - `v546RenderMaterials()` ist jetzt der einzige Material-DOM-Render-Owner;
  - direkt nach diesem Render werden `v681EnhanceMaterials()` und `v683MaterialMultiSell.enhance()` genau einmal synchron nachgezogen;
  - Material-Tab-Klick baut die Liste nicht mehr erneut auf;
  - `v459ArrangeCharacter` ordnet nur noch an und rendert Materialien nicht erneut;
  - redundante 30/40-ms Tab-Klick-Delays sowie pageshow/account-ready-Enhancer von v681/v683 entfernt.
- Unverändert:
  - Material anwenden / Server-Authority;
  - Einzelverkauf;
  - Mehrfachverkauf;
  - Filter-/Qualitätswechsel;
  - direkte Repaints nach echten Material-Verkäufen.
- QA `V8009_CHARACTER_MATERIAL_PERF_QA.json`: 10/10 grün.
- Stable / `index.html`: unverändert.


#### Big Batch 20
- v351 World-Mobile-Header:
  - eigenen globalen `v032Go`-Wrapper entfernt;
  - Double-RAF beim World-Open entfernt;
  - 300/1100-ms Startup-Nachläufer entfernt;
  - `v085InstallWorld` bleibt direkter Owner; zusätzlich DOMContentLoaded/pageshow/account-ready/shared-v7119.
- v352 World-Header/Ghost-Cleanup:
  - eigenen globalen `v032Go`-Wrapper entfernt;
  - Double-RAF beim World-Open entfernt;
  - 300/1200-ms Startup-Nachläufer entfernt;
  - `v085InstallWorld` + direkte Lifecycle-Hooks bleiben.
- v4125 Power-Repaint wurde bewusst noch nicht verändert, da es auch nach echten Gameplay-`render()`-Aufrufen aktualisiert und nicht nur Navigation nachmalt.
- QA `V8009_FINAL_BIG_BATCH20_QA.json`: grün.
- Stable / `index.html`: unverändert.


### Vollständigkeits-Audit Seiten / Tabs 01.10.2026
- Ziel: am Ende nicht nur einzelne Wrapper/Timer bereinigt haben, sondern **jede Beta-Seite und jeden Tab** inventarisieren, Owner zuordnen, QA prüfen und verbleibenden Inline-Code bewusst klassifizieren.
- Audit: `V8009_SCREEN_TAB_COVERAGE_AUDIT.json`
- Aktueller Bestand:
  - 14 `.screen`-Seiten;
  - 4 Character-Tabs (`attributes`, `inventory`, `talents`, `materials`);
  - 13 `data-go`-Navigationsziele;
  - 76 externe Beta-/V8.009-Includes;
  - weiterhin ca. 280 Inline-Script-Referenzen auf Screens/Tabs im Monolithen.
- Wichtig: damit ist **noch nicht alles aus beta.html ausgelagert**.
- Größte Restbereiche laut Audit:
  - `character`: sehr viele Inline-Owner/Legacy-Hooks;
  - `shop`: sehr viele Inline-Owner/Legacy-Hooks;
  - kleinere Restbereiche: `bagDealer`, `harzDealer`, `friends`, `mail`, `admin`.
- Character-Tabs:
  - `inventory`: mehrfach bereinigt und QA-abgedeckt;
  - `materials`: eigener Performance-/Lifecycle-Pass, 10/10 grün;
  - `attributes`: noch eigener Coverage-/Owner-Pass offen;
  - `talents`: noch eigener Coverage-/Owner-Pass offen.
- Nächste Reihenfolge:
  1. Character Attribute + Talente vollständig inventarisieren/konsolidieren;
  2. kleine Dealer/Social/Admin-Screens;
  3. große Inline-Restblöcke Character/Shop;
  4. danach gemeinsame Integrations-QA über alle 14 Screens + 4 Tabs;
  5. erst dann kann „jede Seite / jeder Tab geprüft“ als abgeschlossen markiert werden.
- Stable / `index.html`: unverändert.


#### Character Attribute + Talente Coverage-Pass
- Vollständigkeits-Audit hat die Character-Tabs separat geprüft.
- Attribute:
  - aktueller Owner bleibt `v4140-attribute-display-owner`;
  - Attributkauf/Spend-Logik unverändert.
- Talente:
  - aktueller Owner bleibt `v543-talents-mobile-tree-js`;
  - alter globale `v314`-`render()`-Wrapper entfernt.
- Character-Layout:
  - alter globale `v444`-`render()`-Wrapper entfernt;
  - Anordnung läuft direkt über DOM/pageshow/Character-v7119.
- Heldenquartier v514:
  - alter globale `render()`-Wrapper entfernt;
  - direkter Character-v7119 + pageshow übernimmt.
- Talent-Tab:
  - extra `requestAnimationFrame(apply)` beim Tab-Wechsel entfernt; direkter Apply.
- Unverändert:
  - Talent-Upgrades/Reset;
  - Attributpunkte/Spend;
  - Tab-State;
  - Character-Owner v459;
  - aktuelle Attribute-/Talent-Renderer.
- QA `V8009_CHARACTER_ATTR_TALENT_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Small-Screen Coverage: bagDealer + harzDealer
- bagDealer / v7260:
  - 0/650/1800-ms Startup-Sync-Zug entfernt;
  - account-ready/extras-ready/foreground-ready/pageshow/visibility laufen direkt;
  - Admin-only-Sichtbarkeit und Redirect auf World bleiben unverändert.
- harzDealer / v338:
  - globalen `render()`-Wrapper entfernt;
  - 300/1500-ms Startup-Modernize-/Version-Nachläufer entfernt;
  - `v322RenderDealer`-Hook + Shared-v7119 bleiben;
  - `v567-harz-dealer-final` bleibt der spätere sichtbare Dealer-Owner.
- Billing/Google-Play-Recovery, Kaufpfade und Admin-/Access-Logik unverändert.
- QA `V8009_DEALER_SMALL_SCREEN_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Small-Screen Coverage: admin
- v093 Admin:
  - globalen `render()`-Wrapper entfernt;
  - `v093CheckAdmin()` / `v093BuildMenu()` bleiben direkte Owner.
- v103 Spielereditor:
  - globalen `render()`-Wrapper entfernt;
  - Installation bleibt direkt an `v093AdminLoadLists()` gekoppelt.
- v274 Event-Presets:
  - globalen `render()`-Wrapper entfernt;
  - 2100-ms Startup-Nachlauf entfernt;
  - Presets bleiben über `v093CheckAdmin()` + `v093AdminLoadLists()` sowie account/pageshow erreichbar.
- v115 Global-Dialoge:
  - wirkungslosen globalen `render()`-Wrapper entfernt;
  - UI-Overlay wird direkt über DOMContentLoaded/account-ready sichergestellt.
- Unverändert:
  - Admin-RPCs;
  - Spielereditor-Speichern;
  - Event-/News-Verwaltung;
  - Moderation/Tickets;
  - zentrale Bestätigungsdialoge.
- QA `V8009_ADMIN_SMALL_SCREEN_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Small-Screen Coverage: friends + mail
- Social-Audit abgeschlossen.
- Friends:
  - v333 Online-Status/Remote-Refresh bleibt funktional;
  - 350-ms Refresh nach Visibility bleibt bewusst als Server-/Lifecycle-Followup.
- Mail:
  - v382 Compose-Öffnung bleibt mit 30-ms Action-Ordering nach Navigation;
  - v383 Name-/Mail-Button-Korrektur bleibt.
- Alter Header v371:
  - Mail-Button navigierte fälschlich zu `friends`;
  - auf `mail` korrigiert.
- v372 aktueller Header war bereits korrekt.
- QA `V8009_SOCIAL_SMALL_SCREEN_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Character Extraction Batch 1
- Vier kanonische Character-Owner 1:1 aus `beta.html` nach `js/features/character/beta/` ausgelagert:
  - `v4140-attribute-display-owner` → `v8009-s1-v4140-attribute-display-owner.js`
  - `v543-talents-mobile-tree-js` → `v8009-s1-v543-talents-mobile-tree.js`
  - `v444-character-inventory-order-fix` → `v8009-s1-v444-character-inventory-order.js`
  - `v514-heldenquartier-reference-js` → `v8009-s1-v514-heldenquartier-reference.js`
- Zusammen rund 22 KB Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Position/Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_CHARACTER_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Character Extraction Batch 2
- Weitere vier große Character-Owner 1:1 aus `beta.html` nach `js/features/character/beta/` ausgelagert:
  - `v459-character-hub` → `v8009-s2-v459-character-hub.js`
  - `v4155-frost-talents` → `v8009-s2-v4155-frost-talents.js`
  - `v4156-class-identity-balance` → `v8009-s2-v4156-class-identity-balance.js`
  - `v7124-character-scroll-summary-owner` → `v8009-s2-v7124-character-scroll-summary-owner.js`
- Zusammen rund 48 KB Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_CHARACTER_EXTRACTION_BATCH2_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Shop Extraction Batch 1
- Drei große Shop-/Item-Owner 1:1 aus `beta.html` nach `js/features/shop/beta/` ausgelagert:
  - `v466-all-item-art-purchase-fix` → `v8009-s1-v466-all-item-art-purchase-fix.js`
  - `v6105-item-variety-and-art-rework` → `v8009-s1-v6105-item-variety-and-art-rework.js`
  - `v7063-server-shop-forge-auto-bridge` → `v8009-s1-v7063-server-shop-forge-auto-bridge.js`
- Zusammen 78.366 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_SHOP_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Character Extraction Batch 3
- Weitere drei große Character-Owner 1:1 aus `beta.html` nach `js/features/character/beta/` ausgelagert:
  - `v4153-frost-class-avatar-authority` → `v8009-s3-v4153-frost-class-avatar-authority.js`
  - `v480-auto-gear-material-script` → `v8009-s3-v480-auto-gear-material.js`
  - `v6130-genetics-classset-core` → `v8009-s3-v6130-genetics-classset-core.js`
- Zusammen 59.307 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_CHARACTER_EXTRACTION_BATCH3_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Grow / Forge Extraction Batch 1
- Drei große eigenständige Feature-Owner 1:1 aus `beta.html` ausgelagert:
  - `v492-growroom2-script` → `js/features/grow/beta/v8009-s1-v492-growroom2.js`
  - `v6160-grow-contracts-core` → `js/features/grow/beta/v8009-s1-v6160-grow-contracts-core.js`
  - `v488-harzschmiede-core` → `js/features/forge/beta/v8009-s1-v488-harzschmiede-core.js`
- Zusammen 115.428 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_GROW_FORGE_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Pet / Weekly Extraction Batch 1
- Drei große eigenständige Owner 1:1 aus `beta.html` ausgelagert:
  - `v688-pet-drop-system-core` → `js/features/pets/beta/v8009-s1-v688-pet-drop-system-core.js`
  - `v686-pet-album-core` → `js/features/pets/beta/v8009-s1-v686-pet-album-core.js`
  - `v6239-weekly-chest-system` → `js/features/rewards/beta/v8009-s1-v6239-weekly-chest-system.js`
- Zusammen 73.764 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_PET_WEEKLY_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Dungeon Extraction Batch 1
- Drei große Dungeon-Owner 1:1 aus `beta.html` nach `js/features/dungeon/beta/` ausgelagert:
  - `v7051-atomic-dungeon-receipt-client` → `v8009-s1-v7051-atomic-dungeon-receipt-client.js`
  - `v446-dungeon-runtime-root-fix` → `v8009-s1-v446-dungeon-runtime-root-fix.js`
  - `v246-dungeon-final-fight-reward-fix` → `v8009-s1-v246-dungeon-final-fight-reward-fix.js`
- Zusammen 74.793 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_DUNGEON_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Authority Extraction Batch 1
- Drei große serverautoritäre Bridge-Owner 1:1 aus `beta.html` nach `js/features/authority/beta/` ausgelagert:
  - `v7072-server-tower-weekly-worldboss-bridge` → `v8009-s1-v7072-server-tower-weekly-worldboss-bridge.js`
  - `v7073-server-daily-endgame-bridge` → `v8009-s1-v7073-server-daily-endgame-bridge.js`
  - `v7042-unified-authority-bridge` → `v8009-s1-v7042-unified-authority-bridge.js`
- Zusammen 75.147 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_AUTHORITY_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### System Extraction Batch 1
- Vier große Systemtechnik-/QA-Owner 1:1 aus `beta.html` nach `js/features/system/beta/` ausgelagert:
  - `v4107-systemtechnik` → `v8009-s1-v4107-systemtechnik.js`
  - `v4102-qa-system` → `v8009-s1-v4102-qa-system.js`
  - `v4106-qa2-performance` → `v8009-s1-v4106-qa2-performance.js`
  - `gl-code-diag-script` → `v8009-s1-gl-code-diag.js`
- Zusammen 134.125 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_SYSTEM_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Account Extraction Batch 1
- Drei zentrale Account-/Save-Owner 1:1 aus `beta.html` nach `js/features/account/beta/` ausgelagert:
  - `v200-stable-core` → `v8009-s1-v200-stable-core.js`
  - `v4139-account-switch-authority` → `v8009-s1-v4139-account-switch-authority.js`
  - `v4136-account-save-owner` → `v8009-s1-v4136-account-save-owner.js`
- Zusammen 100.674 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_ACCOUNT_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Gameplay Extraction Batch 1
- Vier große Gameplay-Owner 1:1 aus `beta.html` ausgelagert:
  - `v7137-shift-frame-client` → `js/features/shift/beta/v8009-s1-v7137-shift-frame-client.js`
  - `v6287-harzruferin-js` → `js/features/combat/beta/v8009-s1-v6287-harzruferin.js`
  - `v319-exact-talents-dungeon-balance` → `js/features/talents/beta/v8009-s1-v319-exact-talents-dungeon-balance.js`
  - `v318-talent-combat-complete` → `js/features/talents/beta/v8009-s1-v318-talent-combat-complete.js`
- Zusammen 110.231 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_GAMEPLAY_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Social / Admin / Guide Extraction Batch 1
- Vier eigenständige Owner 1:1 aus `beta.html` ausgelagert:
  - `v6144-player-safety-js` → `js/features/social/beta/v8009-s1-v6144-player-safety.js`
  - `v6346-admin-broadcast-js` → `js/features/admin/beta/v8009-s1-v6346-admin-broadcast.js`
  - `v4124-social-quest-fix` → `js/features/social/beta/v8009-s1-v4124-social-quest-fix.js`
  - `v6254-grow-guide` → `js/features/guide/beta/v8009-s1-v6254-grow-guide.js`
- Zusammen 65.489 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_SOCIAL_ADMIN_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Lifecycle / Monetization Extraction Batch 1
- Drei große Owner 1:1 aus `beta.html` ausgelagert:
  - `v6350-google-play-harz-billing` → `js/features/monetization/beta/v8009-s1-v6350-google-play-harz-billing.js`
  - `v484-daily-login-core` → `js/features/rewards/beta/v8009-s2-v484-daily-login-core.js`
  - `gl-push-scheduling-v2` → `js/features/push/beta/v8009-s1-gl-push-scheduling-v2.js`
- Zusammen 44.641 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_LIFECYCLE_MONETIZATION_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Authority Extraction Batch 2
- Drei weitere serverautoritäre Owner 1:1 aus `beta.html` nach `js/features/authority/beta/` ausgelagert:
  - `v7133-global-gameplay-authority-lockdown` → `v8009-s2-v7133-global-gameplay-authority-lockdown.js`
  - `v7065-fail-closed-grow-authority-hotfix` → `v8009-s2-v7065-fail-closed-grow-authority-hotfix.js`
  - `v7033-build-authority-bridge` → `v8009-s2-v7033-build-authority-bridge.js`
- Zusammen 45.899 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_AUTHORITY_EXTRACTION_BATCH2_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### System / UI Extraction Batch 1
- Vier große System-/UI-Owner 1:1 aus `beta.html` ausgelagert:
  - `v448-final-ui-power-account-integrity` → `js/features/system/beta/v8009-s2-v448-final-ui-power-account-integrity.js`
  - `v7097-performance-ux-restore` → `js/features/system/beta/v8009-s2-v7097-performance-ux-restore.js`
  - `v7084-background-system-test` → `js/features/system/beta/v8009-s2-v7084-background-system-test.js`
  - `v6338-central-title-system-js` → `js/features/ui/beta/v8009-s1-v6338-central-title-system.js`
- Zusammen 64.582 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_SYSTEM_UI_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 2
- Vier weitere große Feature-Owner 1:1 aus `beta.html` ausgelagert:
  - `v086-polish-script` → `js/features/ui/beta/v8009-s2-v086-polish-script.js`
  - `v457-level300-endgame` → `js/features/endgame/beta/v8009-s1-v457-level300-endgame.js`
  - `v4154-class-balance-item-variety` → `js/features/character/beta/v8009-s4-v4154-class-balance-item-variety.js`
  - `v6282-grow-economy-js` → `js/features/grow/beta/v8009-s2-v6282-grow-economy.js`
- Zusammen 65.884 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle vier externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH2_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Grow / Forge Extraction Batch 1
- Drei große Owner 1:1 aus `beta.html` ausgelagert:
  - `v492-growroom2-script` → `js/features/grow/beta/v8009-s1-v492-growroom2.js`
  - `v6160-grow-contracts-core` → `js/features/grow/beta/v8009-s1-v6160-grow-contracts-core.js`
  - `v488-harzschmiede-core` → `js/features/forge/beta/v8009-s1-v488-harzschmiede-core.js`
- Zusammen 115.428 Bytes Inline-JS aus dem Monolithen entfernt.
- Script-IDs und Reihenfolge in `beta.html` beibehalten; nur auf `src=` umgestellt.
- Alle drei externen Dateien mit `node --check` geprüft.
- QA `V8009_GROW_FORGE_EXTRACTION_BATCH1_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 3
- Sechs große Owner 1:1 aus `beta.html` ausgelagert:
  - `v447-unified-item-balance` → `js/features/items/beta/v8009-s1-v447-unified-item-balance.js`
  - `v608-animation-qa-core` → `js/features/system/beta/v8009-s3-v608-animation-qa-core.js`
  - `v6226-talent-proc-core` → `js/features/talents/beta/v8009-s2-v6226-talent-proc-core.js`
  - `v470-character-slot-art-canonical-comparison` → `js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js`
  - `v465-item-art-script` → `js/features/items/beta/v8009-s1-v465-item-art-script.js`
  - `v314-talent-tree` → `js/features/talents/beta/v8009-s2-v314-talent-tree.js`
- Zusammen 84.847 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle sechs externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH3_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 4
- Sechs weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v253-avatar-weapon-monsters-core` → `js/features/character/beta/v8009-s5-v253-avatar-weapon-monsters-core.js`
  - `v468-dungeon-master-script` → `js/features/dungeon/beta/v8009-s2-v468-dungeon-master.js`
  - `v452-hard-account-isolation` → `js/features/account/beta/v8009-s2-v452-hard-account-isolation.js`
  - `v4165-dungeon-key-live-battle-index-fix` → `js/features/dungeon/beta/v8009-s2-v4165-dungeon-key-live-battle-index-fix.js`
  - `v606-combat-qa-core` → `js/features/system/beta/v8009-s4-v606-combat-qa-core.js`
  - `v141-settings-menu-script` → `js/features/ui/beta/v8009-s3-v141-settings-menu.js`
- Zusammen 78.293 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle sechs externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH4_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 5
- Acht große Owner 1:1 aus `beta.html` ausgelagert:
  - `v4147-deterministic-boot-controller` → `js/features/system/beta/v8009-s5-v4147-deterministic-boot-controller.js`
  - `v271-dampf-system` → `js/features/quest/beta/v8009-s1-v271-dampf-system.js`
  - `v4114-grow-care-authority` → `js/features/grow/beta/v8009-s3-v4114-grow-care-authority.js`
  - `v4135-character-save-barrier` → `js/features/account/beta/v8009-s3-v4135-character-save-barrier.js`
  - `v7129-referral-client` → `js/features/social/beta/v8009-s2-v7129-referral-client.js`
  - `v6235-illegal-book-longterm-pagination` → `js/features/book/beta/v8009-s1-v6235-illegal-book-longterm-pagination.js`
  - `v4162-menu-attention-badges-script` → `js/features/ui/beta/v8009-s4-v4162-menu-attention-badges.js`
  - `v7132-item-authority-lockdown` → `js/features/authority/beta/v8009-s3-v7132-item-authority-lockdown.js`
- Zusammen 97.477 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle acht externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH5_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 6
- Acht weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v6111-global-sound-system` → `js/features/audio/beta/v8009-s1-v6111-global-sound-system.js`
  - `v4103-item-ui-consistency` → `js/features/items/beta/v8009-s2-v4103-item-ui-consistency.js`
  - `v7229-server1-character-bootstrap` → `js/features/account/beta/v8009-s4-v7229-server1-character-bootstrap.js`
  - `v655-player-profile-load-fix-js` → `js/features/profile/beta/v8009-s1-v655-player-profile-load-fix.js`
  - `v4112-item-art-sweep` → `js/features/items/beta/v8009-s2-v4112-item-art-sweep.js`
  - `v110-mystic-worldboss-script` → `js/features/worldboss/beta/v8009-s1-v110-mystic-worldboss.js`
  - `v210-profile-skills-notifications` → `js/features/profile/beta/v8009-s1-v210-profile-skills-notifications.js`
  - `v7061-dungeon-all-class-parity-shadow` → `js/features/dungeon/beta/v8009-s3-v7061-dungeon-all-class-parity-shadow.js`
- Zusammen 88.872 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle acht externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH6_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 7
- Zehn weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v4131-character-persistence` → `js/features/account/beta/v8009-s5-v4131-character-persistence.js`
  - `v6106-real-comic-item-art` → `js/features/items/beta/v8009-s3-v6106-real-comic-item-art.js`
  - `v450-account-save-isolation-recovery` → `js/features/account/beta/v8009-s5-v450-account-save-isolation-recovery.js`
  - `v232-growroom-core` → `js/features/grow/beta/v8009-s4-v232-growroom-core.js`
  - `v290-worldboss-level-equipment-balance` → `js/features/worldboss/beta/v8009-s2-v290-worldboss-level-equipment-balance.js`
  - `v6109-background-music` → `js/features/audio/beta/v8009-s2-v6109-background-music.js`
  - `v7074-item-enforce-bridge` → `js/features/authority/beta/v8009-s4-v7074-item-enforce-bridge.js`
  - `v446-global-combat-power-authority` → `js/features/combat/beta/v8009-s2-v446-global-combat-power-authority.js`
  - `gl-live-weather-js` → `js/features/weather/beta/v8009-s1-gl-live-weather.js`
  - `v7050-dungeon-combat-parity-shadow` → `js/features/dungeon/beta/v8009-s4-v7050-dungeon-combat-parity-shadow.js`
- Zusammen 99.044 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle zehn externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH7_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 8
- Zehn weitere Owner 1:1 aus `beta.html` ausgelagert:
  - `v7165-combined-fixes-owner` → `js/features/system/beta/v8009-s6-v7165-combined-fixes-owner.js`
  - `v4117-boots-art-fix` → `js/features/items/beta/v8009-s4-v4117-boots-art-fix.js`
  - `gl20-v4218-js` → `js/features/system/beta/v8009-s6-gl20-v4218.js`
  - `v7080-server-achievement-authority` → `js/features/authority/beta/v8009-s5-v7080-server-achievement-authority.js`
  - `v381-player-mail-system` → `js/features/social/beta/v8009-s3-v381-player-mail-system.js`
  - `v269-ticket-system` → `js/features/admin/beta/v8009-s2-v269-ticket-system.js`
  - `v343-server-selection-v7226` → `js/features/account/beta/v8009-s6-v343-server-selection-v7226.js`
  - `v467-hard-live-dungeon-key-authority` → `js/features/dungeon/beta/v8009-s5-v467-hard-live-dungeon-key-authority.js`
  - `v6107-global-item-art-authority` → `js/features/items/beta/v8009-s4-v6107-global-item-art-authority.js`
  - `v7036-item-rearrange-authority-bridge` → `js/features/authority/beta/v8009-s5-v7036-item-rearrange-authority-bridge.js`
- Zusammen 93.371 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle zehn externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH8_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 8
- Zehn weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v7165-combined-fixes-owner` → `js/features/system/beta/v8009-s6-v7165-combined-fixes-owner.js`
  - `v4117-boots-art-fix` → `js/features/items/beta/v8009-s4-v4117-boots-art-fix.js`
  - `gl20-v4218-js` → `js/features/system/beta/v8009-s6-gl20-v4218.js`
  - `v7080-server-achievement-authority` → `js/features/authority/beta/v8009-s5-v7080-server-achievement-authority.js`
  - `v381-player-mail-system` → `js/features/social/beta/v8009-s3-v381-player-mail-system.js`
  - `v269-ticket-system` → `js/features/admin/beta/v8009-s2-v269-ticket-system.js`
  - `v343-server-selection-v7226` → `js/features/account/beta/v8009-s6-v343-server-selection-v7226.js`
  - `v467-hard-live-dungeon-key-authority` → `js/features/dungeon/beta/v8009-s5-v467-hard-live-dungeon-key-authority.js`
  - `v6107-global-item-art-authority` → `js/features/items/beta/v8009-s4-v6107-global-item-art-authority.js`
  - `v7036-item-rearrange-authority-bridge` → `js/features/authority/beta/v8009-s5-v7036-item-rearrange-authority-bridge.js`
- Zusammen 93.371 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle zehn externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH8_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 9
- Zehn weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v106-illegal-book-script` → `js/features/book/beta/v8009-s2-v106-illegal-book.js`
  - `v250-all-dungeon-key-progression` → `js/features/dungeon/beta/v8009-s6-v250-all-dungeon-key-progression.js`
  - `v093-admin-script` → `js/features/admin/beta/v8009-s3-v093-admin-core.js`
  - `v122-material-dialog-fix-script` → `js/features/materials/beta/v8009-s1-v122-material-dialog-fix.js`
  - `v7062-server-item-action-bridge` → `js/features/authority/beta/v8009-s6-v7062-server-item-action-bridge.js`
  - `v7070-authoritative-grow-hydration` → `js/features/grow/beta/v8009-s5-v7070-authoritative-grow-hydration.js`
  - `v649-hall-dungeon-progress-fix` → `js/features/hall/beta/v8009-s1-v649-hall-dungeon-progress-fix.js`
  - `v6252-register-popup` → `js/features/account/beta/v8009-s7-v6252-register-popup.js`
  - `v546-materials-grow-legends-js` → `js/features/materials/beta/v8009-s1-v546-materials-grow-legends.js`
  - `v423-item-progression-fix` → `js/features/items/beta/v8009-s5-v423-item-progression-fix.js`
- Zusammen 88.312 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle zehn externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH9_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 10
- Zehn weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v7114-gold-shop` → `js/features/shop/beta/v8009-s2-v7114-gold-shop.js`
  - `v6163-growroom-primary-tabs-core` → `js/features/grow/beta/v8009-s6-v6163-growroom-primary-tabs-core.js`
  - `v7092-runtime-watchdog` → `js/features/system/beta/v8009-s7-v7092-runtime-watchdog.js`
  - `v7136-complete-server-reward-core` → `js/features/rewards/beta/v8009-s3-v7136-complete-server-reward-core.js`
  - `v4158-dungeon1-profile-integer-fix` → `js/features/dungeon/beta/v8009-s7-v4158-dungeon1-profile-integer-fix.js`
  - `v683-material-multisell-core` → `js/features/materials/beta/v8009-s2-v683-material-multisell-core.js`
  - `v425-item-stats-single-authority` → `js/features/items/beta/v8009-s6-v425-item-stats-single-authority.js`
  - `v327-worldboss-confirm-attributes` → `js/features/worldboss/beta/v8009-s3-v327-worldboss-confirm-attributes.js`
  - `v6283-grow-guides-js` → `js/features/guide/beta/v8009-s2-v6283-grow-guides.js`
  - `v7071-server-grow-dealer-bridge` → `js/features/authority/beta/v8009-s7-v7071-server-grow-dealer-bridge.js`
- Zusammen 80.048 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle zehn externen Dateien mit `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH10_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 11
- Sechzehn weitere Owner 1:1 aus `beta.html` ausgelagert:
  - `v585-dungeon-safe-owner-core` → `js/features/dungeon/beta/v8009-s8-v585-dungeon-safe-owner-core.js`
  - `v433-dungeon-resource-consistency` → `js/features/dungeon/beta/v8009-s8-v433-dungeon-resource-consistency.js`
  - `v320-talent-point-details` → `js/features/talents/beta/v8009-s3-v320-talent-point-details.js`
  - `v236-dungeon-key-balance-core` → `js/features/dungeon/beta/v8009-s8-v236-dungeon-key-balance-core.js`
  - `v4149-final-navigation-render-authority` → `js/features/system/beta/v8009-s8-v4149-final-navigation-render-authority.js`
  - `v429-immutable-item-stats` → `js/features/items/beta/v8009-s7-v429-immutable-item-stats.js`
  - `v127-midnight-reset-system` → `js/features/system/beta/v8009-s8-v127-midnight-reset-system.js`
  - `v103-admin-player-editor-script` → `js/features/admin/beta/v8009-s4-v103-admin-player-editor.js`
  - `v249-central-dungeon-balance` → `js/features/dungeon/beta/v8009-s8-v249-central-dungeon-balance.js`
  - `v4115-authoritative-comic-items` → `js/features/items/beta/v8009-s7-v4115-authoritative-comic-items.js`
  - `v123-character-equipment-redesign-script` → `js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js`
  - `v441-resource-live-authority` → `js/features/authority/beta/v8009-s8-v441-resource-live-authority.js`
  - `v274-events-gold-mystic-presets` → `js/features/admin/beta/v8009-s4-v274-events-gold-mystic-presets.js`
  - `v533-inventory-reference-js` → `js/features/character/beta/v8009-s7-v533-inventory-reference.js`
  - `v6293-harzruferin-parity-js` → `js/features/combat/beta/v8009-s3-v6293-harzruferin-parity.js`
  - `gl-dungeon-ready-push-v1` → `js/features/push/beta/v8009-s2-gl-dungeon-ready-push.js`
- Zusammen 110.498 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- Alle neuen externen Dateien per `node --check` geprüft.
- QA `V8009_FEATURE_EXTRACTION_BATCH11_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 12A
- 8 Owner aus `beta.html` ausgelagert: v498, v6201, v438, v497, v252, v244, v117, v121.
- Zielordner: Grow / Worldboss / Hall / Dungeon / UI / Items unter `js/features/*/beta/`.
- 51.590 Bytes Inline-JS entfernt; Script-Reihenfolge unverändert.
- QA `V8009_FEATURE_EXTRACTION_BATCH12A_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 12B
- 8 Owner aus `beta.html` ausgelagert: v461, v6168, v6140, v115, gl-worldboss-ready-push-v2, v435, v430, v6211.
- 49.690 Bytes Inline-JS entfernt; Script-Reihenfolge unverändert.
- QA `V8009_FEATURE_EXTRACTION_BATCH12B_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 13
- 12 Owner aus `beta.html` ausgelagert: v494, v7079, v458, v6102, v7272, v111, v4100, v085, v145, v4150, v7144, v684.
- 70.156 Bytes Inline-JS entfernt; Script-Reihenfolge unverändert.
- QA `V8009_FEATURE_EXTRACTION_BATCH13_QA.json`: grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 11
- 16 weitere große Owner 1:1 aus `beta.html` ausgelagert:
  - `v585-dungeon-safe-owner-core` → `js/features/dungeon/beta/v8009-s8-v585-dungeon-safe-owner-core.js`
  - `v433-dungeon-resource-consistency` → `js/features/dungeon/beta/v8009-s8-v433-dungeon-resource-consistency.js`
  - `v320-talent-point-details` → `js/features/talents/beta/v8009-s3-v320-talent-point-details.js`
  - `v236-dungeon-key-balance-core` → `js/features/dungeon/beta/v8009-s8-v236-dungeon-key-balance-core.js`
  - `v4149-final-navigation-render-authority` → `js/features/system/beta/v8009-s8-v4149-final-navigation-render-authority.js`
  - `v429-immutable-item-stats` → `js/features/items/beta/v8009-s7-v429-immutable-item-stats.js`
  - `v127-midnight-reset-system` → `js/features/system/beta/v8009-s8-v127-midnight-reset-system.js`
  - `v103-admin-player-editor-script` → `js/features/admin/beta/v8009-s4-v103-admin-player-editor.js`
  - `v249-central-dungeon-balance` → `js/features/dungeon/beta/v8009-s8-v249-central-dungeon-balance.js`
  - `v4115-authoritative-comic-items` → `js/features/items/beta/v8009-s7-v4115-authoritative-comic-items.js`
  - `v123-character-equipment-redesign-script` → `js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js`
  - `v441-resource-live-authority` → `js/features/authority/beta/v8009-s8-v441-resource-live-authority.js`
  - `v274-events-gold-mystic-presets` → `js/features/admin/beta/v8009-s4-v274-events-gold-mystic-presets.js`
  - `v533-inventory-reference-js` → `js/features/character/beta/v8009-s7-v533-inventory-reference.js`
  - `v6293-harzruferin-parity-js` → `js/features/combat/beta/v8009-s3-v6293-harzruferin-parity.js`
  - `gl-dungeon-ready-push-v1` → `js/features/push/beta/v8009-s2-gl-dungeon-ready-push.js`
- Zusammen 111.499 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH11_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 14
- 15 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v6170-classset-upgrade-core`
  - `v412-stability-audit`
  - `v445-item-compare-mobile-fix`
  - `v108-expanded-item-pool`
  - `v338-harz-dealer-modern`
  - `v109-harz-drops`
  - `v116-worldboss-profile-stats-script`
  - `v460-char-ui-script`
  - `v333-friends-online-status`
  - `v665-native-oauth-callback-bridge`
  - `v567-harz-dealer-final`
  - `v265-war-animation`
  - `v228-settings-portal-script`
  - `v237-grow-dungeon-fixes-core`
  - `v7258-adaptive-mobile-fit-script`
- Zusammen 82.111 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH14_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 15
- 15 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v681-material-sell-core`
  - `v339-dealer-reference-redesign`
  - `v276-event-sync-gold-fx`
  - `v247-dungeon-reward-modal-core`
  - `v286-dungeon-events-gold-marker-fix`
  - `v6230-tower-dungeon-fx-parity-core`
  - `v4126-power-rpc-diagnostics`
  - `v432-item-compare-clarity`
  - `v6360-app-update-js`
  - `v6291-harzruferin-stability-js`
  - `v475-shop-polish-script`
  - `v4148-complete-menu-authority`
  - `v311-quest-finale`
  - `v371-true-fullwidth-topbar`
  - `v6302-harz-talent-mechanics-audit-js`
- Zusammen 74.284 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH15_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 16
- 15 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v422-item-stat-consistency`
  - `v241-harvest-reward-final-core`
  - `v442-character-layout-economy-fix`
  - `v7145-render-owner-core`
  - `v682-frost-second-weapon-core`
  - `v7135-server-activity-xp-feedback`
  - `v395-quest-reward-showcase`
  - `v359-header-duplicate-hard-fix`
  - `v243-dungeon-key-source-of-truth`
  - `v7077-progress-enforce-hydration`
  - `v6336-dot-status-ui-js`
  - `v347-login-reference-design`
  - `v372-authoritative-header`
  - `v135-shop-level-scaling`
  - `v331-item-level-scaling`
- Zusammen 67.641 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH16_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Anonymous Extraction Batch 17
- 11 große anonyme Legacy-Scripts ohne ursprüngliche Script-ID 1:1 aus `beta.html` ausgelagert:
  - Legacy State Core
  - Supabase Online System
  - Inline Vector Game Art
  - Class Creation / Primary Combat
  - Shops / Gems / Enchants
  - Unified Notification System
  - Clean Dungeon State Machine
  - Dungeon Progression Rebalance
  - Dungeon Interaction Fixes
  - Shop Stat Separation
  - Clean Shop Core
- Zusammen 177.918 Bytes Inline-JS aus dem Monolithen entfernt.
- Anonyme Scripts bleiben ohne ID; Position und vorhandene Attribute wurden beibehalten, nur `src=` ergänzt.
- Alle ausgelagerten Dateien per `node --check` geprüft.
- QA `V8009_ANONYMOUS_EXTRACTION_BATCH17_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Anonymous Extraction Batch 18
- 14 weitere anonyme Legacy-Scripts ohne ursprüngliche Script-ID 1:1 aus `beta.html` ausgelagert:
  - Public Player Profiles
  - Real Shop/Render Fix
  - Rarity Stat Separation
  - Rarity Economy
  - Reliable Buying Feedback
  - Daily Dampf System
  - Profile Dungeon Position
  - Single Active Dungeon Flow
  - Real Avatar Integration
  - Legacy Top Navigation / `v032Go`
  - Version Sync + Purchase Feedback
  - Loot / Item Balance
  - Global Progress Fix
  - Combat Balance
- Zusammen 68.645 Bytes Inline-JS aus dem Monolithen entfernt.
- Anonyme Scripts bleiben ohne ID; Position und vorhandene Attribute wurden beibehalten, nur `src=` ergänzt.
- Alle ausgelagerten Dateien per `node --check` geprüft.
- QA `V8009_ANONYMOUS_EXTRACTION_BATCH18_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 19
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v6289-harzruferin-beta-lock-js`
  - `v7037-dungeon-loot-shadow-recovery`
  - `v464-shop-reference-script`
  - `v6342-update-login-popup-js`
  - `v100-dungeon-xp-event-script`
  - `v403-illegal-book-longterm`
  - `v291-worldboss-upgrades-balance`
  - `v230-stability-core`
  - `v431-hall-authoritative-sync`
  - `v7101-public-profile-coalescer`
  - `v279-resource-root-fix`
  - `v288-resource-event-clarity`
  - `v510-character-hero-rebuild-js`
  - `v477-runtime-governor-head`
  - `v6298-character-avatar-stability-js`
  - `v125-attributes-skills-image1-script`
  - `v330-mythic-true-upgrade`
  - `v652-player-profile-redesign-js`
  - `v325-mythic-item-balance`
  - `v495-startup-levelup-guard`
- Zusammen 84.656 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH19_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 20
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v336-illegal-book-progress-fix`
  - `v6201-mystic-special-gameplay-compare`
  - `v416-dungeon-loot-contract`
  - `v4131-version-source`
  - `v599-clean-dungeon-core`
  - `v6300-tower-enemy-image-js`
  - `v134-rarity-inventories-script`
  - `v6213-final-authority`
  - `v6288-account-delete-toplayer-js`
  - `v6301-harzruferin-talent-desc-js`
  - `v427-hall-live-profile-sync`
  - `v456-level300-progression-authority`
  - `v7239-calendar-achievements`
  - `v405-illegal-book-categories-fix-script`
  - `v277-resource-cards-script`
  - `v4106-comic-items`
  - `v272-character-name-login-fix`
  - `v268-inventory-multisell`
  - `v242-dungeon-status-map-core`
  - `v4129-responsive-boot-central-version`
- Zusammen 75.930 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH20_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 21
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v224-atomic-boot-release`
  - `v482-dungeon-paid-timer-owner`
  - `v341-harz-dealer-dropdown-fix`
  - `v322-harz-dealer`
  - `v468-single-item-art-owner`
  - `v455-item-loot-balance-contract`
  - `v434-attribute-points-final-live-sync`
  - `v7081-account-capability-gate`
  - `v4108-item-placement-fix`
  - `v083-hall-progress-fix-script`
  - `v6343-purchase-equip-prompt-js`
  - `v6225-extra-hit-visual-core`
  - `v388-worldboss-attack-fix`
  - `v267-class-attributes`
  - `v6117-class-passive-prismatic-fix`
  - `v238-quest-loot-repair`
  - `v358-global-header`
  - `v6294-harzruferin-full-parity-js`
  - `v7117-dealer-hub`
  - `v118-top-dashboard-redesign-script`
- Zusammen 68.383 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH21_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 22
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v453-profile-floor-reconcile`
  - `v120-worldboss-countdown-script`
  - `v394-time-seeds-currency`
  - `v364-dropdown-position-click-fix`
  - `v6167-longterm-xp-balance`
  - `v094-xp-event-script`
  - `gl-native-fcm-account-sync-v1`
  - `v379-quest-battle-animation-setting`
  - `v283-resource-final-cleanup`
  - `v6345-tower-lobby-hp-timer-js`
  - `v6165-classset-forge-only`
  - `v7093-ux-parity-authority-invisible`
  - `v105-admin-rewards-script`
  - `v4104-qa-settings-visible`
  - `v337-harz-dealer-menu-copyright`
  - `v587-dungeon-result-overlay-core`
  - `v301-auth-idle-hard-lock`
  - `v6297-class-display-parity-js`
  - `v273-admin-menu-login-fix`
  - `v266-war-real-avatars`
- Zusammen 61.636 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH22_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 23
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v225-settings-account-actions-fix`
  - `v377-settings-gear-dropdown-fix`
  - `v239-grow-live-core`
  - `v7131-ui-polish`
  - `v112-worldboss-state-fix`
  - `v483-modern-home-power-stability`
  - `v334-login-name-version-fix`
  - `v284-dampf-card-redesign`
  - `v391-quest-page-finished-script`
  - `v098-xp-event-payout-fix`
  - `v7185-central-text-moderation`
  - `v404-illegal-book-design-script`
  - `v089-shop-comparison-script`
  - `v382-social-mail-buttons`
  - `v234-growroom-compact-core`
  - `v6340-character-title-visibility-js`
  - `gl-worldboss-home-click-fix-js`
  - `v400-dungeon-progression-guard`
  - `v114-worldboss-confirm-modal-script`
  - `v6317-transparent-cutouts-script`
- Zusammen 55.660 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH23_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 24
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v323-profile-dungeon-canonical-fix`
  - `v4142-admin-systemtechnik-authority`
  - `v139-real-shop-rarity-fix-script`
  - `v658-header-menu-offset-js`
  - `v090-shop-comparison-fix-script`
  - `v335-no-levelup-popup-login`
  - `v496-og-retire-fragment-balance-js`
  - `v245-dungeon2-balance-final`
  - `v6243-weekly-chest-audit-fix`
  - `gl-push-master-switch-controller-v1`
  - `v102-levelup-observer`
  - `v315-new-player-dampf-event-grant-fix`
  - `v201-startpage-fix`
  - `v278-resource-stability-script`
  - `v7103-shared-combat-presentation`
  - `v7230-server-frame-isolation`
  - `v7135-absolute-final-version-owner`
  - `v7233-server-scoped-storage`
  - `v6321-companion-actor-render-fix-js`
  - `v654-global-header-layout-fix-js`
- Zusammen 49.842 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH24_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 25
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v285-gold-event-payout-guard`
  - `v6339-character-avatar-title-js`
  - `v428-dungeon-rebalance`
  - `v095-global-xp-event-fx-script`
  - `v383-friend-mail-name-fix`
  - `v7113-single-version-owner`
  - `v6113-public-pet-profile-stats`
  - `v6333-tower-harz-avatar-js`
  - `v7098-system-qa-bridge`
  - `v7068-cloud-pressure-admin-signal`
  - `v324-dungeon-countdown`
  - `v420-levelup-notification-fix`
  - `v537-attribute-reference-js`
  - `v401-dungeon-difficulty-balance`
  - `v7104-v6349-parity-foundation`
  - `v7274-auth-refresh-singleflight`
  - `v7221-bagdealer-override-script`
  - `v7119-character-navigation-consolidation`
  - `v6100-performance-consolidation`
  - `v7157-character-equipment-scroll-stability`
- Zusammen 40.797 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH25_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Batch 26
- 20 weitere benannte Owner 1:1 aus `beta.html` ausgelagert:
  - `v342-event-dampf-300-fix`
  - `v6341-tower-recovery-live-js`
  - `gl-playstore-legal-links-js`
  - `v082-dungeon-balance`
  - `v6295-harzruferin-corefix-js`
  - `v302-dungeon-progress-source-fix`
  - `v387-quest-page-final-script`
  - `v7094-v6349-production-parity-monitor`
  - `v6214-legacy-cleanup-authority`
  - `v129-shop-inventory-character-premium-script`
  - `v096-quest-xp-star-fix-script`
  - `v107-book-position-fix-script`
  - `gl-shop-provenance-guard`
  - `v7123-quest-instant-open`
  - `v294-dampf-canonical`
  - `v6337-item-class-stat-rule`
  - `v493-growroom-mobile-js`
  - `v6140-central-event-bus-preboot`
  - `v659-native-fullscreen-statusbar-js`
  - `v138-shop-match-inventory-script`
- Zusammen 33.484 Bytes Inline-JS aus dem Monolithen entfernt.
- Originale Script-Attribute, IDs und Reihenfolge beibehalten; nur um `src=` ergänzt.
- QA `V8009_FEATURE_EXTRACTION_BATCH26_QA.json`: vollständig grün.
- Stable / `index.html`: unverändert.


#### Feature Extraction Mega Batch 28
- Großer Extraktionslauf statt weiterer 20er-Mikrobatches.
- Commit `9b9b0ce2128c6c6bc3be7592b3807196da68ac96`.
- 24 weitere große benannte klassische Inline-JS-Owner aus `beta.html` ausgelagert.
- 27.496 Bytes Inline-JS entfernt.
- Ziel: `js/features/legacy-extracted/beta/`.
- QA `V8009_FEATURE_EXTRACTION_MEGA28_QA.json`: grün.
- Stable / `index.html`: Hash unverändert.
- Alle extrahierten Dateien per `node --check` geprüft.

#### Feature Extraction Mega Batch 29
- Commit `81bd22d54505b8440b1c5dbcf46e0c863c9f0e52`.
- Sämtliche verbliebenen benannten klassischen Inline-JS-Blöcke aus `beta.html` ausgelagert.
- Keine weitere Stückelung in 20er-Batches.
- Ziel: `js/features/legacy-extracted/beta/`.
- QA `V8009_FEATURE_EXTRACTION_MEGA29_QA.json`.
- Ergebnisziel: `remaining_named_classic_inline_count = 0`.
- Stable / `index.html`: unverändert.
- Alle extrahierten Dateien per `node --check` geprüft.

#### Feature Extraction Mega Batch 30
- Nächster Großlauf vorbereitet für alle verbliebenen anonymen klassischen Inline-JS-Blöcke.
- Script: `.github/scripts/v8009_feature_extraction_mega30.py`.
- Workflow: `.github/workflows/v8009-feature-extraction-mega30.yml`.
- Trigger nach schnellem Mega29-Lauf korrigiert mit Commit `1cef889c90be31c23654ede19b1a9a5161273acf`.
- Status: Workflow angestoßen; Ergebnis-Commit/QA zum Zeitpunkt dieses Status-Updates noch nicht im main-Verlauf sichtbar.


#### Feature Extraction Mega Batch 30
- Ergebnis-Commit: `848bab366147013edbc0e7d1b3b4f28d33beae73`.
- 26 verbliebene anonyme klassische Inline-JS-Blöcke aus `beta.html` ausgelagert.
- 56.739 Bytes Inline-JS entfernt.
- Ergebnis: `remaining_anonymous_classic_inline_count = 0`.
- QA `V8009_FEATURE_EXTRACTION_MEGA30_QA.json`: grün.
- Stable / `index.html`: Hash unverändert.

#### Post-Extraction Rest-Audit
- Audit-Commit: `b032cfa9b24e7523327595199f12105fbcb52249`.
- `beta.html`: 2.302.792 Bytes.
- 781 Script-Tags insgesamt, 774 extern.
- Keine klassischen Inline-JS-Blöcke mehr.
- Übrig waren 7 explizit retired Script-Blöcke vom Typ `application/x-grow-legends-retired`.
- 604 Inline-Styleblöcke mit zusammen 2.027.630 Bytes.
- Keine doppelten externen Script-SRCs.
- Keine Inline-Eventhandler.

#### Mega31 Safe CSS + Retired Cleanup
- Ergebnis-Commit: `b754c70c8e0a04fd8fa7caff0614e57113fdeeeb`.
- 7 retired Inline-Skripte vollständig aus aktivem HTML entfernt und archiviert unter `js/features/legacy/retired-inline/`.
- 21.120 Bytes retired Script-Inhalt aus dem Monolithen entfernt.
- 6 konservativ sichere CSS-Blöcke ausgelagert.
- 47.450 CSS-Bytes aus `beta.html` entfernt.
- QA `V8009_MEGA31_SAFE_CSS_AND_RETIRED_QA.json`: grün.
- Stable / `index.html`: Hash unverändert.

#### Mega32 Root-CSS Extraction
- Ziel: alle verbleibenden Style-Blöcke auslagern, deren Style-ID nicht tatsächlich per DOM angesprochen wird.
- Relative Asset-Pfade bleiben erhalten, indem assetführende CSS-Dateien direkt auf Repo-Root liegen; damit bleibt `assets/...` semantisch identisch zur bisherigen Inline-CSS-Auflösung.
- Script-Commit: `48ca45b8c6c3c05b897e5c149862ebfd3c61ce89`.
- Workflow-Commit: `4512be96fb3a3fd0874163832a7fea15f8718834`.
- Status: Workflow angestoßen; Ergebnis-Commit/QA bei letzter Prüfung noch nicht im main-Verlauf sichtbar.


#### Mega32 Root CSS Extraction
- Ergebnis-Commit: `3b4a93ea6658c0270193638d0b710d861977aec0`.
- 597 Inline-Styleblöcke aus `beta.html` ausgelagert.
- 1.978.849 CSS-Bytes aus dem HTML entfernt.
- 45 davon enthielten relative `url(...)`-Assets; diese Dateien liegen bewusst auf Repo-Root, damit `assets/...` weiterhin dieselbe Auflösung wie vorher im Inline-CSS hat.
- Nur ein Styleblock blieb absichtlich inline: `v4114-grow-care-css`, weil dessen ID per DOM geprüft wird.
- Stable / `index.html`: Hash unverändert.
- QA `V8009_MEGA32_ROOT_CSS_QA.json`: grün.

#### Final Inline CSS Removal
- Analyse der einzigen Referenz zeigte: `document.getElementById('v4114-grow-care-css')` prüft nur die Existenz des Elements.
- Deshalb konnte der Styleblock sicher durch ein `<link>` mit identischer ID ersetzt werden.
- CSS-Datei: `v8009-extracted-v4114-grow-care-css.css`.
- CSS-Commit: `585b8dc116230387e307d3c67d2f2c552bcfa344`.
- Beta-Commit: `f97acc8ed04f6ac52c383d46fbfbaeb5c0d5e0da`.
- Zielzustand: **0 klassische Inline-JS-Blöcke und 0 Inline-Styleblöcke in beta.html**.
- Zero-Inline-QA-Workflow installiert: `ceeba19cc70def03a58f595a0b1c043c2531cfed`.

#### CSS Consolidation – nächste Phase
- Die reine Extraktion ist abgeschlossen; ab jetzt geht es um echte Konsolidierung statt weiteres Verschieben.
- Audit für exakte CSS-Duplikate, Mini-/Marker-Dateien und Bündelung vorbereitet.
- Script-Commit: `107ab82c43c51998cc69850768e2f85e5a1cdcae`.
- Workflow-Commit: `67d5ca327765f500585680ae30078ace8328c2c8`.
- Noch keine semantische CSS-Bereinigung ohne Audit-Beweis.


#### CSS Consolidation Audit
- Audit-Commit: `6c9b06df2a92ed39e5c4e6e3eefa9ade09f4002b`.
- Root-extracted CSS: 598 Dateien / 1.980.180 Bytes.
- 5 Gruppen mit exakt identischem Inhalt gefunden, insgesamt 17 Dateien.
- 93 sehr kleine Dateien <=300 Bytes identifiziert; diese sind **nicht automatisch redundant** und bleiben vorerst unangetastet.
- Exakte Duplikate wurden in `beta.html` auf gemeinsame physische Dateien umgebogen; die ursprünglichen Link-IDs bleiben erhalten.
- Link-Dedupe-Commit: `b2cabfc1c49d971d8e204493f15f48fbe47a6404`.
- 10 von 12 überflüssigen Duplikatdateien wurden bereits physisch entfernt.
- Verbleibende 2 Dateien:
  - `v8009-extracted-v7145-final-version-css.css`
  - `v8009-extracted-v7165-final-version-css.css`
- Abschlussworkflow installiert:
  - Script-Commit `1954e28508249b22f4825ec21f9a9af80be7e68e`
  - Workflow-Commit `133acaf8fcd2dcac0a31e99b0dc3eb0f55611f2a`
- Zero-Inline-QA lief erfolgreich mit Commit `62dc5288e55030d91750bf9f57a1042994ab8fcf`.


#### CSS Deduplizierung abgeschlossen
- Abschluss-Commit: `b7cc2bc26d072cc3ba7f2d34c4c518182a4a6a74`.
- Alle 12 physisch überflüssigen Dateien aus den 5 exakten Duplikatgruppen entfernt.
- Keine hängenden `href`-Referenzen.
- Gemeinsame kanonische Ziele für die betroffenen Link-IDs bestätigt.
- QA: `V8009_CSS_DEDUP_FINAL_QA.json` grün.

#### Mini-CSS Klassifizierung
- Audit-Commit: `1178772f78ba79f9171201e47eea8a70af2052dc`.
- Aktuell 81 Root-CSS-Dateien <=300 Bytes.
- Davon 4 reine Kommentar-/Markerdateien ohne wirksame CSS-Regel:
  - `v8009-extracted-v6316-version-authority-css.css`
  - `v8009-extracted-v7092-version-owner-css.css`
  - `v8009-extracted-v7109-final-version-css.css`
  - `v8009-extracted-v7164-combat-animation-complete-css.css`
- 77 kleine Dateien enthalten echte CSS-Regeln und werden nicht blind entfernt.
- Cleanup für die 4 inerten Marker vorbereitet:
  - Script-Commit `da7833f25e9ef86290f29f51c60b16bdf64b6959`
  - Workflow-Commit `91b219c49d3ebb5eb741b1193e2206093ee5ab1a`


#### Mini-CSS Marker Cleanup abgeschlossen
- Ergebnis-Commit: `16e12c5dc3ae501dae6e8a9d5a6e834923703671`.
- 4 reine Kommentar-/Marker-CSS-Dateien entfernt.
- 6 zugehörige Link-Verweise aus `beta.html` entfernt.
- Keine Dangling-Referenzen; QA `V8009_MINI_CSS_MARKER_CLEANUP_QA.json` grün.

#### Safe Mini-CSS Bundling
- Ergebnis-Commit: `edeabff18230d9344d54222d2753c4b3ab4acf04`.
- 3 direkt aufeinanderfolgende, nicht per DOM referenzierte Mini-CSS-Dateien zu `v8009-mini-bundle-001.css` zusammengeführt.
- Ursprungsdateien entfernt:
  - `v8009-extracted-v297-equipped-mystic-detail-style.css`
  - `v8009-extracted-v298-hall-mystic-special-style.css`
  - `v8009-extracted-v481-first-paint-version.css`
- CSS-Reihenfolge erhalten; Stable / `index.html` Hash unverändert.
- QA `V8009_MINI_CSS_SAFE_BUNDLE_QA.json`: grün.

#### Orphan-/Include-Audit
- Ziel: nach der großen Extraktion/Konsolidierung nicht mehr referenzierte Root-CSS sowie legacy-/anonymous-extracted JS-Dateien finden.
- Script-Commit: `42490362d7e105c2c51fb87611dc972ab9996690`.
- Workflow-Commit: `efc2846b656a5c4c323a863194924070e90af703`.
- Workflow wegen fehlendem Ergebnis-Commit erneut getriggert: `8b604f4c0d1e7836ff2c1ef98e3c553e4fc422ee`.
- Ergebnis-Audit zum Zeitpunkt dieses Status-Updates noch nicht sichtbar.


#### Orphan-/Include-Audit abgeschlossen
- Ergebnis-Commit: `60b7bb7ef3309d5510a6d2d3abc040b2f8efb330`.
- 833 ausgelagerte Kandidaten geprüft.
- Gesamtgröße: 2.123.275 Bytes.
- Ergebnis: **0 Orphans / 0 unreferenzierte Bytes**.
- Keine ausgelagerte CSS-/legacy-extracted-/anonymous-extracted-JS-Datei kann aktuell allein aufgrund fehlender Referenz entfernt werden.
- QA: `V8009_ORPHAN_INCLUDE_AUDIT.json`.

#### Nächste Phase: Legacy-/Owner-Konsolidierung
- Reine Extraktion und offensichtliche Datei-Deduplizierung sind weitgehend abgeschlossen.
- Jetzt Fokus auf echte überlappende Owner/Patch-Schichten pro Feature.
- Audit gruppiert externe Scripts nach bereinigten Funktions-/Namensstämmen und Reihenfolge.
- Script-Commit: `efa2b5c8b95dd595b2659e6f27d810c6b5580a0e`.
- Workflow-Commit: `2e272e291591789305b09c2d8c2f8cddede6027d`.
- Noch keine semantische Owner-Entfernung ohne Audit-Beweis.


#### Legacy Owner Overlap Audit
- Ergebnis-Commit: `0f8022578c51ee796de5b4d09366dbb2d5be7819`.
- 774 externe Scripts analysiert.
- 18 potenzielle Overlap-Gruppen identifiziert.
- Größte Gruppe: 11 Release-Marker-Skripte.
- Weitere auffällige Gruppen u. a.: Illegal Book (8), Dungeon-Key (6), Harz-Dealer (5), Attribute Points (4), Guild War (4), Heldenquartier Reference (4), Quest Reward (4), Version/Integrity (4).

#### Release-Marker Runtime Audit
- Repo-weite Referenzanalyse war zunächst zu konservativ, weil `index.html` und Audit-Dateien als Nutzung gezählt wurden.
- Deshalb Runtime-only-Audit auf tatsächlich von `beta.html` geladene Scripts umgestellt.
- Runtime-Audit-Commit: `14de6af2a3db84789fd3e22e5ba2f7ad4b32673f`.
- 772 geladene Beta-Scripts geprüft.
- 8 von 11 Release-Markern sind in der Beta-Runtime vollständig ungenutzt:
  - `v7096-release-marker.js`
  - `v7099-release-marker.js`
  - `v7109-release-marker.js`
  - `v7110-release-marker.js`
  - `v7111-release-marker.js`
  - `v7159-release-marker.js`
  - `v7160-release-marker.js`
  - `v7161-release-marker.js`
- 3 Marker bleiben vorerst aktiv, weil sie noch Runtime-Werte liefern:
  - `v7113-release-marker.js`
  - `v7114-release-marker.js`
  - `v7117-release-marker.js`
- Cleanup-Script: `2333506c1c0cf1a2fca2297e8566ec0805994ec3`.
- Cleanup-Workflow: `482b26e8aa9a97c381fdd9a6c1a9d8194d951820`.
- Ergebnis-Commit bei letzter Prüfung noch nicht sichtbar.


#### Release Marker Cleanup abgeschlossen
- Ergebnis-Commit: `e86cc756eec5f2fd7a9a2efaee1bda4603d59898`.
- 8 in der geladenen Beta-Runtime ungenutzte Release-Marker aus `beta.html` und Repo entfernt.
- 3 Release-Marker bleiben aktiv, weil sie weiterhin Runtime-Werte liefern (`__GROW_LEGENDS_RELEASE__` / Gold-Shop-Release-Metadaten).

#### Attribute-Points Legacy Cleanup
- Gruppe geprüft:
  - `v419-attribute-points-display.js`
  - `v426-attribute-points-live-update.js`
  - `v434-attribute-points-final-live-sync.js`
  - `v671-attribute-points-duplicate-remove-js.js`
- `v419`, `v426` und `v671` bestehen nur noch aus Retirement-Kommentaren und haben keine Runtime-Wirkung.
- `v4140-attribute-display-owner.js` ist der kanonische Attribut-Renderer.
- `v434` bleibt vorerst aktiv, weil es zusätzlich Repaints nach `persist()` und externen Punkteänderungen übernimmt; diese Funktion muss zuerst sauber in `v4140` integriert werden.
- Cleanup für die 3 wirkungslosen Scripts:
  - Script-Commit `9389d2301fce54eb25c688f2a0a8bc7e78e37993`
  - Workflow-Commit `76f2fd692a1ef3fea1983cbba5faf07c66eb9038`


#### Attribute-Points Owner Consolidation
- Die drei retired Alt-Skripte `v419`, `v426`, `v671` waren beim direkten Abschluss bereits aus `beta.html` entfernt.
- `v434-attribute-points-final-live-sync.js` hatte noch echte Persist-/Repaint-Funktion.
- Diese Sync-Aufgabe wurde in den kanonischen `v4140-attribute-display-owner.js` integriert.
- v4140-Commit: `d89421174a6285a46351042e5752727e2e0ff96c`.
- `v434` aus `beta.html` entfernt: `3d0294ac7d401f350d46ea4776bff68ef1cfb044`.
- Alte `v434`-Datei gelöscht: `32363f4a147fdcee25efb1700c2f2439407bc3b4`.
- QA-Workflow für Single-Owner-Zustand installiert:
  - Script `d823ccfa68ae88a3296d1d2016d2de8eba7c2fc7`
  - Workflow `21ec746a9120385576563202e5e38c507c01a251`
- Ergebnis: Attributanzeige/Attributpunkte laufen nun über einen kanonischen UI-Owner `v4140`; die separate v434-Sync-Schicht ist entfernt.


#### Heldenquartier / Character Legacy Cleanup
- Drei reine Delegator-Schichten geprüft und entfernt:
  - `v517-heldenquartier-reference-finish-js.js`
  - `v519-heldenquartier-reference-alignment-js.js`
  - `v521-heldenquartier-reference-frame-js.js`
- Diese Dateien delegierten nur an spätere Owner (`v7154CharacterSettle` / `v7124PaintCharacterSummary`) und wurden nirgends mehr aufgerufen.
- `beta.html`-Cleanup-Commit: `fdc48fbd8108c1480799ddb344ecfcd14bbcd312`.
- Dateien anschließend physisch gelöscht:
  - `9126e10f78f6a901a83a7b22f4745580b9b08f2e`
  - `89fe709285d92c123af074cf1108626a0abd990d`
  - `8fb456c07440e84e78461b98e255e0df1e4a6f70`

#### Character / Material Performance Audit
- Audit-Commit: `ec87c92de5da5d16ef98748751d2a1a368113ddc`.
- 76 geladene Character-/Material-nahe Scripts analysiert.
- Wichtig: `v681-material-sell-core` und `v683-material-multisell-core` haben keine aktiven MutationObserver mehr; deren Treffer kamen nur aus Retirement-Kommentaren.
- Echter aktiver Hotspot war `v470-character-slot-art-canonical-comparison.js` mit zwei MutationObservern auf Equipment- und Inventar-Subtrees.
- Diese Observer waren auch aktiv, während andere Character-Tabs (inkl. Materialien) offen waren.
- Beide v470-Observer entfernt; Updates bleiben über bestehende direkte Hooks auf `renderInventory`, `equip`, `unequip`, `render`, Shop und Character-Navigation erhalten.
- v470-Fix-Commit: `6f0b2c35e9ae3d36667ddb577159c8a8d919c607`.
- Regression-QA installiert:
  - Script `c9aa2195f7c4017243d0ed696c1bef064ca6994e`
  - Workflow `8b23121f44f035fde1c3af2f777d75a0c225ec98`


#### Large Runtime No-op / Retired Cleanup
- Runtime-Sweep-Audit: `39c52b1efc398ff71b442864171d76dcbf1de38c`.
- Vor Cleanup wurden 757 geladene Beta-Scripts geprüft.
- 32 geladene Dateien waren komplett leer oder nur Kommentar.
- Zusätzlich wurden zahlreiche unreferenzierte Mini-Marker/Retirement-Stubs erkannt.
- Konservativer Cleanup-Commit: `efaf6f9c2e1d5a73a24e0460984a8de41a9d7ca8`.
- Ergebnis: **79 tote Runtime-Layer in einem Batch entfernt**.
- Keine Dangling-Referenzen laut `V8009_RUNTIME_NOOP_DELEGATE_CLEANUP_QA.json`.
- Entfernt wurden u. a. alte Quest-/Guild-/Guildboss-/Tower-/World-/Shop-/Pet-/Event-/Character-Marker und No-op-Schichten.

#### Heldenquartier Delegate Sweep – Rest
- Zusätzlich 6 weitere unreferenzierte reine Delegatoren entfernt:
  - `v516-heldenquartier-exact-mobile-js.js`
  - `v518-heldenquartier-stage-rebuild-js.js`
  - `v522-heldenquartier-true-reference-js.js`
  - `v523-heldenquartier-clean-frame-js.js`
  - `v524-heldenquartier-banner-kill-js.js`
  - `v527-heldenquartier-clean-reference-js.js`
- Beta-Commit: `2ad2554a3fea37b8438641a93fa9e4aadf3ad519`.
- Dateien danach physisch gelöscht.
- Damit wurden in diesem großen Schritt insgesamt **85 aktive Script-Includes/Layers entfernt**.

#### Aktueller Beta-Strukturstand nach Groß-Cleanup
- `beta.html`: **674 externe Script-Tags**.
- **0 Inline-Script-Tags**.
- **0 Inline-Style-Tags**.
- Gegenüber dem früheren Post-Extraction-Stand mit 774 externen Scripts wurden damit inzwischen 100 externe Runtime-Includes aus der aktiven Kette entfernt.

#### Dungeon / Quest Wrapper Ownership Audit
- Audit-Commit: `3e788ea307fc5f32e52bbf0297c16947603236b6`.
- Historische Wrapper-Tiefe aktuell sichtbar:
  - `claimQuest`: 6 geladene Schichten
  - `v233ClaimQuest`: 6 Schichten
  - `persist`: 9 Schichten
  - `v065RenderWorld`: 11 Schichten
  - `v067OpenDungeon`: 4 Schichten
  - `dungeonUnlocked`: 6 Schichten
- Nächster Konsolidierungsschritt: innerhalb dieser Dateien explizit retired Wrapper entfernen, echte Balance-/Reward-/Authority-Logik jedoch behalten.

#### Post Runtime Cleanup Audit
- Script-Commit: `9d0687a9bc191268e206b5c7d70afc9ffd24c823`.
- Workflow-Commit: `0e8707dfa194aaf65f219f9fe9cec77ce8c73e9e`.
- Prüft neue Script-Anzahl, Inline-Zero und mögliche neue Orphans nach dem 85-Layer-Cleanup.


#### Dungeon-Key Authority Consolidation
- `v4150-live-dungeon-key-authority.js` vollständig gegen `V467` geprüft.
- V467 deckt Key-Normalisierung, `dungeonUnlocked`, Key-Grant, Quest-Claim-Key-Sync, Persistenz/Rebuild sowie moderne Dungeon-Navigation über `growlegends:navigation-open-v7119`, Opener-Guards und Click-Capture ab.
- `v4150SyncDungeonKeys` / `v4150DungeonKeyDiagnostics` wurden nirgends aktiv referenziert.
- Deshalb komplette v4150-Schicht entfernt:
  - Include entfernt: `de6376de518bcfb1442b9414c53207a7aed8c4b0`
  - Datei gelöscht: `7ec52f9ace515282952836aefbaaea89c457335f`
- Effekt: ein weiterer Grant-Wrapper, zwei Claim-Wrapper, ein `v032Go`-Wrapper und eine doppelte Key-Repaint-Lane entfernt.

#### Dungeon / Quest Retired-Wrapper Scan
- Audit-Commit: `9ef91d41ae042f91550eb405b6a9c88079da685c`.
- 12 relevante retired/superseded Stellen identifiziert.
- Wichtiger Befund: viele historische Navigation-Wrapper sind bereits sauber retired und durch Shared Events ersetzt.
- Noch aktive Wrapperketten werden nicht blind gelöscht, wenn dieselbe Datei zusätzlich Balance-/Reward-/Authority-Logik besitzt.
- Besonders tiefe Ketten bleiben:
  - `claimQuest`: 6 Schichten
  - `v233ClaimQuest`: 6 Schichten
  - `persist`: 9 Schichten
  - `v065RenderWorld`: 11 Schichten
- Nächste semantische Konsolidierung muss Logik in kanonische Owner verschieben, bevor weitere komplette Dateien entfernt werden.

#### Pure Unused Definition Cleanup
- Audit-Commit: `f6cc5c5daab1863e6040eca6ec3fe49ef67ac496`.
- 8 kleine geladene Dateien ohne Runtime-Referenzen, Listener, Timer, State-Mutation, Storage oder Netzwerk gefunden.
- Cleanup-Commit: `c2f385c9714e7d6484ec4c954ad571529e9a9d51`.
- Entfernt:
  - `v685-quest-dampf-display-fix.js`
  - `v687-pet-title-all-qualities.js`
  - `v6101-navigation-altcode-performance.js`
  - `v6261-tower-open-hotfix.js`
  - `v6270-tower-lobby-fixes-js.js`
  - `v6271-tower-topbar-lobby-js.js`
  - `v6322-harzruferin-elite-quest-balance.js`
  - `v7271-illegal-book-page-stability-diagnostics.js`
- QA bestätigt:
  - `V467` geladen
  - `v4150` vollständig abwesend
  - **665 externe Script-Tags**
  - **0 Inline-Script-Tags**
  - **0 Inline-Style-Tags**

#### Gesamtfortschritt Runtime-Includes
- Früherer Post-Extraction-Stand: 774 externe Scripts.
- Aktuell: **665 externe Scripts**.
- Damit bislang **109 externe Runtime-Includes** aus der aktiven Beta-Kette entfernt, zusätzlich zur vollständigen Inline-JS/CSS-Extraktion.


#### Dungeon-Key / Open-Lifecycle Konsolidierung – großer Folgebatch
- Seit dem 665-Script-Meilenstein weitere komplette Alt-Layer entfernt:
  - `v458-key-live-unlock.js`
  - `v4100-dungeon-key-live-fix.js`
  - `v497-dungeon-key-immediate-live-unlock.js`
- `v4150-live-dungeon-key-authority.js` war bereits zuvor entfernt.
- Damit bleibt `V467` als gemeinsame spätere Key-/Navigation-Authority.
- Key-Change-Erkennung wurde aus Claim-Wrappern an die echten Mutationsquellen verschoben:
  - `v243` emittiert `growlegends:dungeon-key-changed` beim lokalen D2-Unlock: `1a76dfae670b45f1d296032197b7ad65023c03c6`.
  - `v7045` emittiert denselben Event nach serverseitiger Quest-Key-Änderung: `540a7d76e59aa87f2683fa6aff7e1cccd1514d87`.
- Danach zwei Quest-Claim-Wrapper aus `V467` entfernt: `71ec3aca3c5a7b06405fc9cb12b7a82b86933267`.
- Aus `v243` zusätzlich historische Wrapper um `claimQuest`, `v065RenderWorld` und `v067OpenDungeon` entfernt: `e4f71217f46308bfeda676e3d9bcddf3185cf5bf`.
- Redundante D1-Availability-Wrapper aus `v4158` entfernt: `2a99a0e0dcc1c29202477af312874c0739654267`.
- Redundante D1-Availability-Wrapper aus `v6291` entfernt: `fe7413555488630ffb7152cb1a1b9a33348e8e8d`.
- Raumindex-Sync in finalen V467-Opener integriert: `3328aaeb55e52a56e0b0f7e01e031638ec57f588`.
- Danach `v302`-Wrapper um `v067OpenDungeon` entfernt: `47d51948865167e66dc4a8a865ecbc821caa8174`.
- `v244` kann nicht komplett entfernt werden: Runtime-Audit `0cc4be013580fc1b25e6b154c834e88d6d26114c` zeigt aktive Nutzung seiner Room-Name/Level-/Renderer-Helfer durch spätere Dungeon-Owner.

#### Präziser Wrapper-Mutations-Audit
- Erster präziser Audit-Commit: `5fb3edc7b3741c2037a750853f7898eb86d0cff9`.
- Dieser Audit zählt nur echte globale Funktionsüberschreibungen, nicht bloße Referenzen/Kommentare.
- Stand vor den jüngsten Folgebereinigungen:
  - `claimQuest`: 16 mutierende Dateien
  - `v233ClaimQuest`: 13
  - `v065RenderWorld`: 8
  - `v067OpenDungeon`: 4
  - `dungeonUnlocked`: 5
- Nach den jüngsten Änderungen wurde der Audit erneut getriggert; aktueller Rerun-Trigger: `ba6911ecf78f039b81918c8fbafc50e5c534072e`.

#### Central Event Bus / Quest Completion
- Event-Bus-Load-Order-Audit: `9bda80f29b0e474a1e67fbebe2c5050359bc6f43`.
- Kritischer Befund: `v6140-central-event-bus-preboot.js` wird bereits als geladenes Script **#5** ausgeführt und setzt `window.GL_EVENTS` + `__V6140_EVENT_BUS__`.
- Dadurch sind mehrere spätere Fallback-Quest-Wrapper in Beta ohnehin unerreichbar:
  - v411 Guild-Fallback
  - v474 Guild-Fallback
  - v492 Grow-Fallback
  - v688 Pet-Fallback
- `v235` emittiert jetzt nach einem erfolgreich abgeschlossenen Local/Mirror-Quest genau einen kanonischen `questCompleted`-Event auf `GL_EVENTS`: `5d36d3874a875e44e1c3f45ea00f7d60eb295c8e`.
- Server-Enforce bleibt getrennt in `v7045` und emittiert diesen lokalen Completion-Event nicht, damit Server-Side-Effects nicht doppelt laufen.
- Die zwei echten Quest-Source-Wrapper aus `v6140-central-game-event-bridge.js` wurden entfernt; v6140 bleibt Distributor/Subscriber sowie Dungeon-/PvP-Eventquelle: `09aae69425f23e95ad87552cbc399e3ba51153ed`.
- Quest-Completion-Event-QA installiert; aktueller Rerun-Trigger: `4b94674f3788a5dcd0dd3fb35ec5a1ed1872f084`.

#### Quest Reward Wrapper Konsolidierung
- In `v238-quest-loot-repair.js` den zweiten `claimQuest`-Wrapper entfernt, der nur Dungeon-Key-Repräsentationen synchronisierte.
- Der echte seltene Set-Item-Upgrade-Wrapper bleibt erhalten.
- Commit: `8d5f03c61b378b639659c5075ad6400de006d849`.
- `v395-quest-reward-showcase.js` hängt nicht mehr als eigener Wrapper um `v233ClaimQuest`; es stellt nur noch Snapshot/Repaint-Helfer bereit.
- v395-Commit: `c2d445b515a3f9a65ae0def3eba5f10ea59a70e4`.
- `v394-time-seeds-currency.js` übernimmt jetzt den späten Local/Mirror-Reward-Abschluss und ruft nach dem Zeit-Samen-Roll direkt den v395-Showcase-Repaint auf.
- v394-Commit: `4431523b116aa08a018a7070aed3c79c82d94d69`.
- Dadurch ein weiterer kompletter `v233ClaimQuest`-Wrapper entfernt, ohne Zeit-Samen-/Popup-Verhalten zu verlieren.

#### Aktueller Strukturstand
- Letzte bestätigte Script-Zahl nach Entfernung von v458/v4100/v497: **662 externe Scripts**.
- **0 Inline-JS**.
- **0 Inline-CSS**.
- Gegenüber dem Post-Extraction-Stand mit 774 externen Scripts sind damit **112 externe Runtime-Includes** aus der aktiven Beta-Kette entfernt.


#### Shop-Flackern / Händler-Render Konsolidierung
- Nutzerhinweis: Im Shop flackern Item-Attribute / Werte sichtbar.
- Root Cause im Audit: mehrere historische Layer bauten den kompletten Shop nach einem normalen globalen `render()` erneut auf; zusätzlich wurden Raritäts-/Polish-Klassen teils erst im nächsten `requestAnimationFrame` gesetzt.
- Repaint-Audit: `V8009_SHOP_REPAINT_AUDIT.json`, Ergebnis-Commit nach erstem Fix-Rerun: `013efae871bea8e1e255e57e7d985307d276472e`.
- Entfernte direkte Doppel-Repaints:
  - `v089-shop-comparison.js`: globales render -> renderShop entfernt (`e74fe5e344b8ecfdd42deb0dfdc09403206eab4d`)
  - `v090-shop-comparison-fix.js`: globales render -> renderShop + Init-Repaint entfernt (`d59ae2018b29ddefc4518cbebc70e841dcba31f1`)
  - `v139-real-shop-rarity-fix.js`: RAF-Repaint + 180-ms-Repaint entfernt (`385c331ee20e583c3e214d1a8408586a4d9ec2c5`)
  - `v138-shop-match-inventory.js`: Zwischenframe-Raritäts-Paint entfernt (`fbc947d885a8deea0452a2d5dda118037231eb4e`)
- Weitere globale Shop-Hooks entfernt, damit normale Spiel-Updates keinen Shop-Neuaufbau mehr triggern:
  - `v030` Shop/Gems/Enchants (`1db06111086e25aa5f4b083ba21df267a6c3687d`)
  - `v054` Buying Feedback (`b43472b33331fabbd195ea137569ecd3f3a578a4`)
  - `v056` Shop Stat Separation (`aff152934c8919310a8112c2006e834bfaa1de58`)
  - `v057` Clean Shop Core (`542b86c36507301a94d0a3fe79514d15e1a25818`)
  - `v464` Shop Reference global render layout hook (`073b42bc105a909c942aa3f0c6fbb09b2eeec906`)
  - `v466` Item Art global render shop decoration hook (`7104fd692a7d11a17347216a2f597da57f3640d3`)
- `v475-shop-polish` arbeitet jetzt synchron im selben Shop-Render-Turn statt einen Frame später; Navigations-Polish ebenfalls ohne 20-ms-Verzögerung: `97b0fa802b9aa5375653793131b9901706cd718b`.
- `v7063-server-shop-forge-auto-bridge` hat jetzt eine vollständige Shop-View-Signatur (Angebots-ID, Name, Qualität, Preis, Stats/Bonus, Gem/Enchant + Equipment).
  - Identischer bereits sichtbarer Shopzustand wird nicht erneut komplett aufgebaut.
  - Echte serverseitige Item-/Attribut-/Equipment-Änderungen rendern weiterhin sofort.
  - Der frühere trailing 100–150-ms-Repaint-Timer wurde entfernt.
  - Commit: `22a1d453e589d85bda49c300dfd060b3d937a5c0`.
- Zusätzlich den redundanten 80-ms-Startup-Vollrender in `v461-shop-redesign` entfernt; `v464` besitzt den unmittelbaren kanonischen Initial-Render: `1c4a79bc3e83a647a6c07858245965ffe1c4d3fa`.
- Nachaudit zeigt: verbleibende Shop-`renderShop`-Wrapper sind überwiegend synchrone Decorator-/Layout-Schichten im selben JS-Turn; die auffälligen globalen/RAF/trailing Voll-Repaints sind entfernt.
- Shop-Flicker-QA Workflow installiert:
  - Script: `6d9854c028b09a02a53ac0f714ad86af89edef6b`
  - Workflow: `232169de133458bea1570a14661adf45c9efb767`


#### Systemweiter Lifecycle-Hotspot-Audit
- Ergebnis-Commit: `f5e29dde7c4acda2f7aca40b6a7d6d1df25c896a`.
- 662 geladene externe Beta-Scripts systemweit auf Render-Overrides, Feature-Render-Assignments, RAF, Timer, Observer, Navigation-Hooks und DOM-Rewrites geprüft.
- Hotspot-Scores:
  - Dungeon: 694
  - Character: 650
  - Guild: 307
  - Quest: 287
  - Shop: 276
  - World/Worldboss: 271
  - PvP: 237
  - Grow: 219
  - Tower: 188
  - Pets: 55
- Shop wurde bereits im vorherigen Batch stark konsolidiert; Fokus verschiebt sich auf Dungeon/Character/Guild/Quest/Worldboss.

#### Presentation-/No-op-Render Cleanup
- Presentation-Wrapper-Audit: `50eb817289ae2224f83fd7b70dbbf09eaa240e43`.
- Vier reine/obsolete globale Render-Wrapper entfernt:
  - `v114-worldboss-confirm-modal.js` → `a3933a1e8acb366b6361dce8e8ac196448cf8311`
  - `v116-worldboss-profile-stats.js` → `b60dfc999ebdce260d16a5d01146754752a79001`
  - `v291-worldboss-upgrades-balance.js` → `7e896ce8ece3faa3a317bcbab0b7f00229d342a4`
  - `v315-new-player-dampf-event-grant-fix.js` → `86a73b336e48c388fb9da6427ba74a0a2792abbf`
- Repo-weiter No-op-Render-Sweep Ergebnis: `9bffcecc4a7d7336c836f54b5725dfa0c7d331d9`.
- Weitere drei reine pass-through Render-Wrapper entfernt:
  - `v108-expanded-item-pool.js` → `45a67dc4841287ea0daf2a18424c43ad45dde37c`
  - `v285-gold-event-payout-guard.js` → `434d6e95b30551109a3314e8801a1d703695ca8b`
  - `v319-exact-talents-dungeon-balance.js` → `3a55a3984cff28c73c7edcb29b276f6fcd18f875`
- Damit in diesem Durchgang 7 zusätzliche globale Render-Layer aus der Runtime-Kette entfernt, ohne Gameplay-Logik zu ändern.

#### Aktueller Strukturstand
- `beta.html`: **662 externe Scripts**.
- **0 Inline-JS**.
- **0 Inline-CSS**.
- Script-Anzahl bleibt hier gleich, weil die jüngsten Optimierungen innerhalb weiterhin benötigter Dateien stattfanden.
- Nächste große Blöcke:
  1. Dungeon lifecycle/timer/RAF consolidation
  2. Character/Inventory lifecycle consolidation
  3. Guild/Guildboss timer/replay/runtime consolidation
  4. Quest Dampf/render lifecycle consolidation
  5. Worldboss global-render/timer cleanup


#### Großbatch: Dungeon Lifecycle Cleanup
- System-Lifecycle-Audit initial: Dungeon Score 694.
- `V467` Key-/Navigation-Rebuild-Kaskaden von mehrfachen Rebuilds (immediate + microtask + RAF + 80/300 ms bzw. Navigation + RAF + 100 ms) auf **einen kanonischen Rebuild pro Event** reduziert.
  - Commit: `d7eb5baefdf9d56c65282e36b6938eff9854b11c`
- Alten globalen `render() -> renderDungeon()`-Fanout aus `v068 dungeon-interaction-fixes` entfernt.
  - Commit: `03ef0eda1abfcdb40f4ffa28c74cf011fe9b4745`
- Alten globalen Reward-Button-Renderwrapper aus `v048 clean-dungeon-state-machine` entfernt; Reward-Erzeugung bindet den Return-Button ohnehin direkt.
  - Commit: `45b23763fb32fd6f593268ff5c90dc89b2e5738e`
- `v7051 atomic-dungeon-receipt-client` Bootstrap-/ClaimButton-Retry-Kaskade bereinigt:
  - generischer Dungeon-Klick -> delayed claimButton entfernt
  - 100/450/1400/3600-ms Bootstrap-Retries entfernt
  - stattdessen ein Immediate-Boot + `account-ready` + `pageshow`
  - Commit: `f0f093c15eb902530b14c5c77f0c09e440088011`
- Kampf-Animationstimer im finalen Combat-Renderer bleiben ausdrücklich aktiv; sie steuern echte Treffer-/FX-/Replay-Sequenzen und sind kein Cleanup-Ziel.
- Aktueller Re-Audit:
  - Dungeon Score **642** (vorher 694)
  - globale Render-Overrides **5** (vorher 8)
  - Timeouts **122** (vorher 133)
  - RAF **50** (vorher 52)

#### Großbatch: Character / Inventory Lifecycle Cleanup
- Drei doppelte globale Renderpfade entfernt:
  - `v459-character-hub`: globaler Render-Hook entfernt; `renderInventory`, `renderSkillTree`, Materialien und Character-Navigation bleiben Owner.
    - Commit `cb51f8d4648fabaf5eb9d54f485632c46f6c3640`
  - `v460-char-ui`: globaler Hero-Stat-Polish-Hook entfernt; Navigation/pageshow bleiben.
    - Commit `d484f5fbb7fbf87e527436f6f1de96a07b197019`
  - `v470-character-slot-art-canonical-comparison`: globaler Comparison-Hook entfernt; gezielte `renderInventory`/compact/equip/unequip/navigation/account-ready Hooks bleiben.
    - Commit `f49cff549e974531d95173af78ddb97ab0e8dc8c`
- Damit wird besonders der Character-/Material-Tab von globalen Repaint-Pfaden entkoppelt.
- Aktueller Re-Audit:
  - Character Score **626** (vorher 650)
  - globale Render-Overrides **13** (vorher 16)
- Re-Audit Ergebnis-Commit: `7a72bca1ae3f7b47dfe796977728fb8aa8ea1c79`.

#### Aktueller Strukturstand
- `beta.html`: **662 externe Scripts**
- **0 Inline-JS**
- **0 Inline-CSS**
- Nächster Großblock: Guild/Guildboss Runtime/Timer/Replay + danach Quest Dampf/render + Worldboss.


#### Shop Legacy-Header Cleanup (Screenshot 2026-10-01)
- Nutzerhinweis per Screenshot: oberhalb des kanonischen Bork-Kampfladen-Hero standen noch zwei falsche Legacy-Blöcke:
  - alter Bork/NPC-Header („Bork · Händler von Grünhain“)
  - Seltenheits-Hinweis („Werte steigen jetzt klar mit der Seltenheit …“)
- Root Cause: Legacy-Shop-DOM konnte vor dem kanonischen `#v461ShopHero` bestehen bleiben bzw. wieder eingefügt werden.
- Finaler Shop-Owner `v7063-server-shop-forge-auto-bridge.js` erzwingt jetzt:
  - `#v461ShopHero` ist der erste sichtbare Shop-Block
  - sämtliche Legacy-Elemente davor werden entfernt
  - Seltenheits-Hinweis wird textbasiert unabhängig von alter Klasse/Markup entfernt
  - alter „Händler von Grünhain“-Header wird ebenfalls unabhängig von alter Klasse entfernt
  - Cleanup läuft sowohl vor als auch nach einem `rawRenderShop()`
- Fix-Commit: `e8932ccdc5fddc0b2bba11febc8d353b6201813f`.
- QA installiert:
  - Script `72f6e65a019f66175b171785fa3e292749ca8a13`
  - Workflow `a1dac629ea367b0fa152f3d53b88fd8ca2d0d2d1`


#### Großer Legacy-DOM-Contract-Durchgang
- Repo-weiter DOM-Producer-Audit eingeführt: `V8009_LEGACY_DOM_CONTRACT_AUDIT.json`.
- Startstand: **65 DOM-Producer-Kollisionen**.
- Nach erstem Großbatch: **47**.
- Nach Ressourcen-/Account-/Dungeon-/Settings-/Shop-Bereinigung: **34**.
- Shop statisch auf leeres `#shop`-Root reduziert; sichtbares Shop-DOM wird nur noch dynamisch vom aktuellen Owner erzeugt.
- Alte Shop-DOM-Produzenten aus `v030` und `v057` entfernt; Generator-/Kauf-/Materiallogik bleibt erhalten.
- Dampf:
  - `v026` und `v271` erzeugen keinen Refill-DOM mehr.
  - `v284` ist einziger Dampf-Card/`#v026RefillBtn`-Producer.
- Ressourcenleiste:
  - `v283` = finaler Harz-DOM-Owner.
  - `v284` = finaler Dampf-DOM-Owner.
  - alte DOM-Erzeugung in `v279`/`v282` entfernt.
- Header:
  - `v358` ist alleiniger Header-Builder.
  - doppelte Header-Erzeugung aus `v359` entfernt.
- Weltboss:
  - `v110` alter Overlay-Producer entfernt/delegiert.
  - `v111` ist alleiniger Overlay- und Real-Art-Owner.
  - delayed CSS-Boss -> Real-Art-Ersetzung aus `v6201` entfernt.
- Character Creator:
  - alte Creator-DOM-Owner aus `v4131` und `v4135` entfernt.
  - verbleibende kontextabhängige Owner: v200 Basis, v4136 Beta Save/Create Owner, v7229 Server-1 Bootstrap.
- Settings:
  - `v141` ist alleiniger Settings-DOM-Builder.
  - `v225` bindet/repariert nur noch bestehende Account-Aktionen, erzeugt sie nicht mehr.
- Dungeon:
  - alter retired `v064` Dungeon-1 Map-Producer entfernt; Balance-/Name-Helfer bleiben.
- Dauerhafter QA-Guard aktiviert:
  - Script `3b5d9e18f2e3552eb10dd854624ab6fabc5bc07a`
  - Workflow `276803a677a069ee41aafb04f8ac1e9a7778318e`
  - erster grüner Guard-Commit `cc1d7b8a20bfcf9ce7b4d4d1562f29e72a56b081`
  - Settings-Contract ergänzt: `4c1b36e1862fa6c296024de65875d01c30856b53`
  - Guard nach Erweiterung erneut grün: `5cc4e9a87009e711977d9433535458826efb4311`
- Aktueller DOM-Audit-Commit: `a0f1bc19013c59b08bd4e0516b44485a817bb941`.
- Aktuell größte Restkollisionen:
  - `dungeonMapCard`: 6 Producer
  - `dungeonTicketText`: 6 Producer
  - `battleLevel`: 5 Producer
  - Profil-Modal Buttons: 3 Producer
  - Character-Creator Modal: 3 kontextabhängige Producer
- Nächster Großblock: Dungeon-DOM-Producer auf einen World-Owner + einen Detail-Owner + einen Combat-Owner reduzieren.


#### Legacy-DOM Großdurchgang – Fortsetzung
- Alte Dungeon-Karten-DOM-Producer weiter reduziert:
  - `v244RenderSelectedDungeonMap` DOM-Renderer retired; Helper für Room-Namen/Level bleiben.
    - Commit `4d5bac20edb513fa7ea7d51df7bee97521346bb5`
  - `v251RenderWorld` und `v251RenderDetail` DOM-Renderer retired/delegieren an die späteren Owner.
    - Commit `1c16eb716a119fa952f2352838b60fae03a2ad2a`
  - Zielstruktur: `gl20/v4218` = Dungeon-Weltkarte, `v261` = 10-Gegner-Detailkarte.
- Auditpräzision verbessert:
  - Selektoren wie `querySelectorAll('[id="..."]')` werden nicht mehr fälschlich als DOM-Producer gezählt.
  - Audit-Script Fix: `78c8303354d56aecd060c366432f2335e2c7a823`
  - Guard-Script Fix: `c1b29729173a22a0aef81a5078260db4ae46ef95`
  - Rerun-Trigger: Audit `4cc0068730539f2673053aebf5e68b713c781892`, Guard `a0919712adefdd1267969b37b4a98652fc35b79f`.
- Materialien:
  - alter `v030Materials` DOM-Renderer aus Shop-Modul entfernt/delegiert an `v546`.
  - `v546` bleibt alleiniger Character/Material-DOM-Owner.
  - Commit `bf62e363bb019435412f063918e4a984f2521a77`.
- Profile:
  - Basis-`v074OpenProfile` DOM-Renderer retired; Equipment-/Ranking-/Bind-Helfer bleiben.
    - Commit `c157c5f584a5da49ca10a9be4d9cc252edcea764`
  - intermediärer `v326` Profilmodal-Renderer retired; Hall-/Payload-/Row-Helfer bleiben.
    - Commit `bfd5a4eb507cb86cddeb0e72ff5b303c882287cf`
  - `v655` bleibt kanonischer robuster Profil-Loader/-Renderer.
- DOM Audit + Guard erneut nach Dungeon/Material/Profile-Cleanup getriggert:
  - Audit Trigger `1e8e85709ffde8b9a9e274516d7e90b0dadf5cdf`
  - Guard Trigger `9e879e2b95115406d871cf5b12126c297be9912a`
- `v048ReturnMap` bewusst noch nicht blind entfernt: die doppelte ID sitzt in zwei historischen Kampf-/Reward-Implementierungen und wird zusammen mit dem Combat-Owner konsolidiert, damit Reward-/Battle-Verhalten nicht beschädigt wird.


#### Tower Saison-Rangliste – Monatswechsel 2026-10-01
- Nutzerhinweis per Screenshot: normale `SAISON · Turm-Rangliste` zeigte keine Wertung, während die Mittwochsrangliste korrekt geladen wurde.
- Root Cause:
  - Tower-Saison-ID ist monatlich (`YYYY-MM`).
  - Am 2026-10-01 wechselte die aktive Saison automatisch von `2026-09` auf `2026-10`.
  - Der alte Loader filterte ausschließlich `profiles.dungeon_progress.tower.season === currentSeason`.
  - Zusätzlich wurde vor dem Ranking-Fetch `syncProfile(true)` ausgeführt, wodurch ein frischer 0er-Oktober-Mirror einen noch vorhandenen September-Mirror überschreiben konnte.
- Dauerhafte Season-History eingebaut:
  - beim Saisonwechsel wird der vorige Saisonstand unter `s.tower.seasonHistory[seasonId]` archiviert (max. 6 Saisons)
  - Profil-Mirror enthält jetzt `season_history`
  - Commit: `74d0f089d48f546a4cc87662366b29c8af3f988b`
- Ranking-Loader korrigiert:
  - liest Rankingdaten zuerst, bevor der aktuelle 0er-Mirror synchronisiert wird
  - zeigt aktuelle Saison, sobald Werte vorhanden sind
  - ist aktuelle Saison leer, zeigt er automatisch die vorherige Monatswertung mit Hinweis auf den Saisonwechsel
  - unterstützt alte flache Season-Mirrors und neue `season_history`
  - Commit: `e840ec0cab85872fe811fa102a35a07ba326e6a9`
- Mittwochsrangliste bleibt unverändert auf ihrem dedizierten serverseitigen Ledger/RPC.


#### Großcleanup: Dungeon Combat Legacy + frühe Character-Owner
- Dungeon:
  - komplette historische `v048InstallFight()` Kampf-/Reward-Kopie entfernt; Funktion delegiert nur noch auf den späteren `v060InstallFight()`-Pfad.
    - Commit: `fd33cb27ae97bf6a7f46b1a3d0cefba9c237f6d1`
  - no-op globaler `render()`-Wrapper + eager rerender aus `v060 dungeon-progression-rebalance` entfernt.
    - Commit: `604b73f6709d3006d63357e8e030f3ec957045e6`
  - `v446SkipFight` bleibt bewusst in zwei kontextabhängigen Pfaden:
    - v446 = lokaler Fallback-Kampf
    - v7051 = serverautoritatives Replay
    - kein blindes Zusammenlegen, solange Fallback noch benötigt wird.
- Character / Klassenwahl:
  - früher textbasierter `v029ClassModal`-DOM-Producer retired; `v080` ist der erste visuelle Klassenmodal-Owner.
    - Commit: `debe89fb88a54773dcce2304612787d6cb8afdfb`
  - alter globaler `v029` Render-Wrapper entfernt:
    - schreibt Attribute nicht mehr bei jedem globalen Render neu
    - installiert den historischen Dungeon-Fight-Handler nicht mehr bei jedem Render
    - primäre Stat-/Item-/Klassen-Helfer bleiben erhalten
    - Commit: `560e90cc65662bab7ce8f90cdde73fb0a853b7cd`
- Tower:
  - `vTRanking` ist absichtlich in Lobby + separater Rank-View vorhanden; diese zwei DOM-Produzenten sind kontextabhängig und keine gleichzeitige Doppelung.
- Präzisions-Audit + Guard nach diesem Block erneut getriggert:
  - Audit Trigger: `f8589a72451bdfd3928f741dd79af8a3a29f3b31`
  - Guard Trigger: `2eb72d0b21dbc62166b7998d582e22bc6529d159`
  - Ergebnis-Commits waren zum Zeitpunkt dieses Status-Updates noch nicht sichtbar.


#### Feste Page-/Tab-Audit-Matrix
- Automatische Page-/Tab-Erfassung aus dem tatsächlich geladenen Beta-Stack abgeschlossen.
- Discovery-Commit: `b99004fe15daccf14bba90a4366d9dfa733bc985`
- Erkannte Hauptscreens: world, character, grow, quests, dungeon, shop, bagDealer, pvp, guild, hall, friends, mail, admin, harzDealer.
- Erkannte Tab-Gruppen:
  - Character: attributes / inventory / talents / materials
  - Guild: overview / growtasks / boss / war
  - Friends: ranking / search
  - Mail: inbox / sent / compose / battlelog
  - Shop: weapon / magic
  - Growroom: grow / stock / genetics / orders
  - Forge: dismantle / craft / nebelforge
  - Tower: rank / meta
  - Admin: overview / players / content
  - Harz Dealer: harz / gold / frames
- Neue dauerhafte Tracking-Datei: `V8009_PAGE_TAB_AUDIT_MATRIX.md`
- Matrix-Commit: `ac37ca1db9051379934a62e324e0b6f07fd2bdf7`
- Regel ab jetzt: nach jedem großen Cleanup-Batch werden **sowohl V8_CURRENT_STATUS.md als auch V8009_PAGE_TAB_AUDIT_MATRIX.md** aktualisiert.
- Ziel: jede Seite/jeden Tab durch DOM-/Legacy-Audit, Lifecycle-/Render-Audit, Owner-Konsolidierung, Timer/RAF/Observer-Prüfung, Authority-Datenpfad und manuellen Meilenstein-Test führen.
- Grobe Endreihenfolge:
  1. Dungeon Combat + Reward
  2. Character alle 4 Tabs
  3. Guild alle 4 Tabs + Guildboss
  4. Quests + Schicht
  5. Growroom alle 4 Tabs
  6. PvP + Hall of Haze
  7. Tower kompletter Pass
  8. Friends + Mail
  9. Tütchen-Dealer + Harz Dealer
  10. Forge
  11. World + Worldboss
  12. Admin
  13. finale repo-weite QA + manueller Endtest


#### Powerblock: Guild + Guildboss komplett strukturell geprüft
- Guild-Power-Audit umfasst **38 geladene Guild-Scripts**.
- Finaler Audit-Commit nach Cleanup: `333ddd3a9084f87cb6a177266964da8e33aed6a5`.
- Guild-Lifecycle nach Power-Cleanup:
  - keine globalen `render()`-Wrapper mehr
  - Boss-Visual-Owner: 0 künstliche Timeouts
  - Runtime-Owner: nur noch echte Autoplay/Clock-Lifecycle-Pfade; Settle-Kaskaden entfernt
  - Guildwar künstliche Startup-/Tab-/Visibility-Delays entfernt; 60s Server-Watch bleibt
  - Grow-Aufträge DOM-Refresh 1s -> 30s
  - Replay-Button über delegierten Click-Owner statt 600/1800ms Rebind-Retries
  - alter v255 Signup- und Guild->Boss-Load-Wrapper retired
- Wichtige Cleanup-Commits:
  - Boss Visual Retries: `9b82b772f32edce2cef8b49dc6d7e670e8cdd02c`
  - Grow Timer: `ad6db0c237845c895e8ca33b33e35fdd1b346073`
  - Replay Owner: `cbde218977b604ed90812ea7e15fcaeae7470432`
  - Overview Delays: `bdb1708892b36fcb96ef430009c6ed73cd767982`
  - War Delays: `eb01275d105c61d6d628360989d85d16f50d2180`
  - v255 Legacy Wrapper: `1c21ce8e179b5bcf8b4bf03f150c3260b7cd45ed`
  - Runtime Settle Delays: `59f1b7202609b0ffde8828e5962334887fff1abe`

#### Neue Guildboss-Regel: alte Belohnung vor neuer Anmeldung
- Gewünschte Regel serverautoritativ umgesetzt:
  - Neue Anmeldung (`p_value=true`) wird blockiert, solange eine ältere abgeschlossene Bossrunde derselben Gilde für den Spieler noch `reward_claimed=false` hat.
  - Abmeldung (`false`) bleibt möglich.
- Supabase Migration:
  - Name: `guildboss_signup_requires_previous_reward_claim`
  - Version: **20261001120616**
  - aktiv in `public.v7307_set_guild_boss_signup` und `server1.v7307_set_guild_boss_signup`
  - SQL-verifiziert: beide Funktionen enthalten Gate + Previous-Round-Check.
- Repo-Artefakt: `V8009_GUILDBOSS_SIGNUP_REWARD_GATE.sql`
  - Commit `a182403066c0da38ce51fdff8d5221f67c63a014`
- Client-Gate:
  - liest `v7165_get_last_guild_boss_result`
  - bei offener Altbelohnung: Signup-Button gesperrt mit „🎁 Erst Belohnung abholen“
  - zeigt alte Bossrunde/Claim-Pfad an
  - erneute Signup-Authority-Prüfung direkt vor RPC
  - Commit `86d6962a6c20bb4be31779c8ebc6a74d1b019a98`
- Nach erfolgreichem Claim wird der Signup-Gate sofort neu geprüft/freigegeben:
  - Commit `9995647a5deec5910164a77a60603810fea42ad5`
- Abschluss-QA: `V8009_GUILD_POWER_FINAL_QA.json`
  - Ergebnis-Commit `3fa74c43256a3c730b7d50981faaf54ecf6916cc`
  - alle Checks **true**
  - 4 Tabs vorhanden: overview / growtasks / boss / war
  - Zero-Inline-JS/CSS weiterhin grün.
- Matrix aktualisiert:
  - Guild: **[x]**
  - Guildboss: **[x]**
  - Matrix-Commit `c31ae523c617ff3aee96e20c6f0ff024182e6c6a`
- Manueller Endtest von Guild/Guildboss bleibt als späterer Test-Milestone offen.

#### Nächster Powerblock
- Quest + Schicht Full-Lifecycle-Audit gestartet:
  - Script `a21a1559734ab47aea70de2cacef9f36273eceb5`
  - Workflow `8502fd973edfeba14c9b32b72e094b6ed9bf7551`


#### Powerblock: Quest + Schicht strukturell abgeschlossen
- Abschluss-QA: `V8009_QUEST_SHIFT_FINAL_QA.json`
- Ergebnis-Commit: `4b52afd65a4895c3e615401b341f72010a263ce8`
- Alle Checks true.
- Wesentliche Ergebnisse:
  - globale Quest/Dampf-Renderowner von 5 auf 1 reduziert
  - Timeouts im präzisen Quest/Shift-Scope von 50 auf 15 reduziert
  - v294 bleibt finaler Dampf-Paint-Owner
  - v387/v391 RenderQuests-Wrapper retired, Funktionen in v6344-Pipeline integriert
  - v4124 Seed-Reward Claim-Wrapper retired; Seed-Showcase in v235 integriert
  - v7045 Authority-Boot-Retrykaskade entfernt, echte RPC-Timeouts bleiben
  - v7110 Lifecycle-Settles auf Microtasks umgestellt
  - Schicht: keine kosmetischen setTimeout-Retries mehr; echter 1s-Ticker + Avatar-Observer bleiben
- Matrix: Quest/Schicht auf **[x]** gesetzt
  - Matrix-Commit `646a5d9a758f249c18901a37536a092608758fd9`

#### Powerblock: Growroom – Grow / Stock / Genetik / Aufträge
- Initialer Growroom-Audit: 31 relevante geladene Scripts.
- Größte Altlasten bereinigt:
  - v492:
    - alte Quest/Dungeon/PvP-Drop-Wrapper komplett entfernt
    - GL_EVENTS ist alleinige Cross-Feature-Rewardquelle
    - 6-stufige Startup-Retrykaskade entfernt
    - 2 parallele Intervalle auf einen 1s-Ticker mit 5s-Heavy-Cadence reduziert
    - Seed-Inventar 45/90ms Repaints entfernt
    - Commit `fdb737bb9014e408d6ce5c0e77753da14e3cb361`
  - v4114 Care:
    - 30ms Nachpaint + Cloud 0ms Timer entfernt
    - Commits `1ccad37997043f749b4fc905b4dc706600659e97`, `be9249d12d51cb79d5b83984e44ff8ff4de50970`
  - v6163 Tabs:
    - 40/180/600/1600/4200ms Aktions-Retries entfernt
    - 0/80/350ms Harvest-Retries entfernt
    - doppelte RAF-Mounts entfernt
    - MutationObserver bleibt als Root-Rebuild-Wächter
    - Commit `ed370cdaf61c546da8588f80ddf5b9d37c0eb1a2`
  - v430:
    - 900/3200ms Max-Level-Repairkaskade entfernt
    - Commit `923013493a1d7804ff1b72aa1f6acf0f6963bc92`
  - v6160 Orders:
    - Harvest/account-ready/Cloud Nachläufe auf Microtasks
    - Commits `bd38bb7ad8c281be8a0c5d5cce06f0ea595ee2c8`, `90d151dc114ad7c788d0a6fb0fd32c949d019633`
  - Genetik v6130:
    - 0ms/30ms UI-Settles entfernt
    - Commit `8f8f64d40e1629d7acf2e33971001c53c1e8d6d7`
  - Stock v6282:
    - 120ms Harvest-Refresh entfernt
    - Commit `18dea2e6b7d855c13fb5d02f1813713e0ee5341e`
  - Server Dealer v7071:
    - 0/80/900/5200ms Refresh-Lanes entfernt
    - Startup-Quiet API bleibt
    - Commit `d1fbe79706d2142976b3797b3177ce1cf5279500`
- Finaler Growroom-Audit:
  - Ergebnis-Commit `020ff4d4402ecc5a79052631b871e10cd281a089`
  - keine globalen render()-Wrapper
  - v492: 2 Timeouts / 1 echtes Intervall
  - v4114: 0 Timeouts
  - v6163: 0 Timeouts / 0 RAF
  - v6160: 0 Timeouts
- Abschluss-QA: `V8009_GROWROOM_FOUR_TAB_FINAL_QA.json`
  - Ergebnis-Commit `dfff713ecebb600f3539cd9c61ed5bfd27687bb6`
  - alle 19 Checks true
  - Tabs: grow / stock / genetics / orders
  - Zero-Inline-JS/CSS weiterhin grün
- Matrix Growroom auf **[x]**
  - Matrix-Commit `1df8c0b542cc74fd328459cc86591f142a0df9a4`

#### Nächster Powerblock
- PvP + Hall of Haze + Profilinteraktion


#### Powerblock: PvP + Hall of Haze + Profil strukturell abgeschlossen
- Initialer Audit: `V8009_PVP_HALL_POWER_AUDIT.json`
  - 39 relevante geladene Scripts
  - global render: 8
  - timeouts: 76
  - RAF: 15
  - profile assignments: 9
- Finaler Audit-Commit: `79fde08cc7664c196600175c7ca015730de8ea98`
  - global render: **0**
  - timeouts: **47**
  - RAF: **11**
  - profile assignments: **6**
- Wesentliche Cleanup-Schritte:
  - v204 PvP-Cooldown: kein kompletter Seitenrerender mehr jede Sekunde; nur Cooldowntext/Button aktualisiert.
    - `3a9f4ee13d5cba72cd6c6a8d3e16cad4375fc0ff`
  - v206/v207/v209 globale No-op-Renderwrapper entfernt.
    - `76606f34943fe8c3f878c8b0d2fbe4f8edd0417f`
    - `c18adb1db88417320b77690691d4997a6f88cb72`
    - `5840b11e48a92b3fd77b4f64b455685d43116077`
  - v083 Hall-Progress nur noch auf Hall-Navigation, globale Render-/0/1200ms-Repaints entfernt.
    - `952446a0a0bfb76e047b4ab9e8873c468ebd56de`
  - Base-Public-Profile globaler Row-Rebind entfernt.
    - `1c130743b160b53a51803459f9de7982db938d6d`
  - v210 Profile/Notifications globaler Renderhook entfernt; echter 60s PvP-Notificationcheck bleibt.
    - `00a4143f431298231eae0f392bd845b5d18871da`
  - v211 doppelte historische v209FinishBattle-Payout-Implementierung retired; v216 bleibt einziger Legacy-Finish-Owner.
    - `b28666d195510562f612141b6663c44d2918a5cf`
  - v216 Result-Init 180ms -> Microtask.
    - `8ef6628959efbb7b47ba7a89f1fb6682498bf7f3`
  - v7053 Atomic-PvP-Bridge: 0/160/180/420/1300/4200ms Bind-/Boot-Retries entfernt; echte RPC-/Replay-/Cloud-Timeouts bleiben.
    - `7bb6f78bffdae4e8255199d6ef8314399dcf506c`
  - PvP-Buds Hall Mirror: Force-Sync ohne Delay.
    - `afc33696747dae64abc9af8b2fb4d7909812d9c4`
  - v205 Bud-Rewards: global render + 200ms Init entfernt; nur PvP-Lifecycle.
    - `5f7e99da9f103aa76c5a3fff78f33bb9340d32b9`
  - v6145 Hall: Navigation ohne 0ms Delay; Chunk-RAF für große Listen bewusst erhalten.
    - `e2e87763d2e4eb36fcad4ff924cd630978f0c0a0`
  - v649: alter Ranking-Wrapper + 1.6/3.2/5.2s Startup-Sync-Retries entfernt; v6145.syncOwn nutzt v649SyncDungeonProgress gezielt.
    - `eed8b077031bec89349a2674e2815eecf17e9bbe`
  - v652: v074OpenProfile-Wrapper entfernt; nur MutationObserver für Profil-Dekoration bleibt.
    - `9c00a887e14f929140ca4820824d8b96dbf3f576`
  - v655 Own-Profile Background-Sync 0ms -> Microtask; Netzwerk-Deadlines bleiben.
    - `799b064923301b29cb5c566c4cc0a02936db0aa4`
  - Battlelog UI-Startup-Delays entfernt; Replay-Sleeps + 60s Logrefresh bleiben.
    - `7c9272d4168d042305a97d460161022d95646a2f`
- Abschluss-QA: `V8009_PVP_HALL_PROFILE_FINAL_QA.json`
  - Ergebnis-Commit `debb220c646f48d34216882d3fcef8e6a69ce143`
  - alle Checks true
  - Zero-Inline-JS/CSS weiterhin grün
- Matrix:
  - PvP **[x]**
  - Hall of Haze **[x]**
  - Profile Modal **[x]**
  - Matrix-Commit `7ab6624f1cb3aa413d02abfb3030956f254c5cef`
- Manueller Endtest bleibt für den finalen Test-Milestone offen.

#### Nächster Powerblock
- Tower komplett: Lobby / Ranking / Meta-Aufstieg / Run / Result.


#### Powerblock: Quest + Schicht strukturell abgeschlossen
- Finale QA: `V8009_QUEST_SHIFT_FINAL_QA.json` grün.
- Globale Quest/Dampf-Renderowner: **5 -> 1**.
- Quest/Shift-Timeouts: **50 -> 15** im präzisen Scope; verbleibende sind echte RPC-/Receipt-/Countdown-/Push-Pfade.
- Schicht: **0 kosmetische setTimeout-Retries**, echter 1s-Fortschrittsticker bleibt.
- Dampf:
  - v026/v271/v284 globale Render-/Retry-Pfade retired
  - v294 bleibt finaler Dampf-Paint-Owner.
- Quest UI:
  - v387/v391 Renderwrapper retired
  - v6344 zentraler visueller Post-Render-Owner
  - v096 XP-Dekoration in v6344 integriert.
- Seed-Reward-Showcase:
  - v4124 Claim-Wrapper retired
  - Snapshot/Repaint in v235 canonical Local/Mirror payout integriert.
- Authority:
  - v7045 Boot-Delay-Kaskade entfernt
  - v7110 Lifecycle-Settle-Delays auf Microtasks reduziert.
- Matrix: Quests / Schicht = **[x]**.

#### Powerblock: Growroom vier Tabs strukturell abgeschlossen
- Grow / Blütenlager / Genetik / Aufträge vollständig als gemeinsamer Lifecycle-Block geprüft.
- Finale QA: `V8009_GROWROOM_FINAL_QA.json` **ok=true**, alle 20 Checks true.
- v492:
  - alte Quest-/Dungeon-/PvP-Drop-Fallback-Wrapper retired; GL_EVENTS ist einzige Cross-Feature-Quelle
  - 6-stufige Startup-Retry-Kaskade entfernt
  - zwei parallele Timer auf einen gemeinsamen UI-Ticker reduziert.
- v6163 Tabs:
  - 40/180/600/1600/4200-ms Refresh-Kaskade entfernt
  - Harvest 0/80/350-ms Retry entfernt
  - RAF-Mount-Kaskade entfernt
  - ein gezielter MutationObserver bleibt für Root-Rebuilds.
- v4114 Care:
  - 30ms Post-Care-Repaint retired.
- v6160 Orders:
  - account-ready/harvest delayed refreshes retired.
- v430 Grow-Maxlevel:
  - 900/3200ms Repair-Kaskade retired.
- Harvest Reward v241:
  - RAF + 80/220ms Sichtbarkeits-Reassert retired
  - 460ms Startup/Version repaint retired.
- Grow Guide v6283:
  - breiter Grow-subtree MutationObserver + RAF retired
  - v6163 ruft Guide-Refresh gezielt aus Tab/View-Lifecycle auf.
- Blütenlager v6282:
  - 60s Timer bleibt absichtlich für Trocknungs-/Dealer-Zeitstände.
- Genetik v6130:
  - eventbus-basiert, keine Timer-/Observer-Kaskaden.
- Authority v7065/v7070:
  - Server-Gate/Hydration-Guard bleiben; verhindern stale lokale Pflanzen vor Serverstand.

#### Growroom Pflanzen-/Keimling-Bildgröße korrigiert
- Screenshot 2026-10-01: Stage-Bilder und freie Topf-Icons waren sichtbar zu groß.
- Root Cause: v497 erzwang auf Mobile 60–82px Stage-Art + mindestens 144px Slots.
- Fix:
  - Stage-Art max-width 78%, object-fit contain
  - Seedling/Growth/Flower/Harvest abgestuft verkleinert
  - Mobile Slot-Minheight 144 -> 118px
  - freie Topf-Icons 32 -> 24px
  - Detail-Art ebenfalls verkleinert.
- Commits:
  - v497 Plant Art: `8e43b3fbb248d33b15e1a5113ddbefae8db222d4`
  - Mobile Empty Pot: `83b80d900104e96099902cd25ab582704f701f0b`
  - Base Empty Pot: `25a7a24ab66624eee9182edd53f66505e415e152`
- Finale Growroom-QA Ergebnis-Commit: `74f0a07a10459b631240080b5ecf242f72a985e2`.
- Matrix Growroom = **[x]**; manueller Sichttest der neuen Skalierung bleibt offen.


#### Powerblock: Tower komplett strukturell abgeschlossen
- Scope: **Lobby / Ranking / Meta-Aufstieg / Run / Result**.
- Kanonische Owner:
  - Runtime/Views/Run-State: `js/features/tower/beta/v8009-t1-tower-system.js`
  - Lobby/Ranking/Recovery-Live: `js/features/tower/beta/v8009-t2-tower-lobby.js`
  - Server-Authority: `js/features/authority/beta/v8009-s1-v7072-server-tower-weekly-worldboss-bridge.js`
- Direkte Owner-Konsolidierung:
  - v6300 Gegnerbild-Reparatur aus aktiver Beta entfernt; Milbenkrieger/Trauermücke werden direkt im Tower-Core kanonisch gemappt.
  - v6333 Harzruferin-Reparatur aus aktiver Beta entfernt; Harzruferin-Avatar wird direkt im kanonischen Battle-Markup erzeugt.
  - v6269 Mutation-Cap-Patch aus aktiver Beta entfernt; Cap-Normalisierung liegt direkt im Tower-Core, Kompatibilitätsfunktion bleibt verfügbar.
  - v6341 + v6345 Standalone-Recovery/Lobby-Timer aus aktiver Beta entfernt; **ein** 1-s-Live-Timer bleibt im Lobby-Owner.
  - globaler `persist()`-Wrapper des Towers entfernt; Tower-eigenes `save()` triggert den gezielten Profil-Sync weiterhin selbst.
  - früher `vTowerRender`-Wrapper aus dem Direct-Preempt entfernt; Replay-Render-Suppression und Arena-Prewarm liegen jetzt direkt im kanonischen `vTowerRender`.
- Lifecycle-Cleanup:
  - Preempt-Installationskaskade 0/500/1200 ms + 80-ms Event-Retries durch DOMContentLoaded/Microtask/Lifecycle-Hooks ersetzt.
  - Lobby-Painter 60/100/220-ms Nachläufe entfernt.
  - Ranking-Requeue 0-ms Timer auf Microtasks umgestellt.
  - Rank-View 20/35/55-ms Starttrio entfernt.
  - Reward-Prepare 0-ms Timer auf Microtask umgestellt.
- Wichtige Commits:
  - Core-Integration + globaler Persist-Wrapper weg: `a201e60317972c8b9e55015838b28cf2e391de02`
  - Lobby-Lifecycle-Cleanup: `91e1d7405aa3856f2efa95d30fc5949641ae4bba`
  - Preempt Retry-Cleanup: `a279e5bb439aa05ab151ce713c30e6372370c98b`
  - alte Repair-/Timer-Includes retired: `5f5f06faeb46a5fa8e3eda77c95d42219831c399`
  - Flow-Guard direkt in Canonical Renderer: `9daf001e41419be1b166729f9f4dacc50a9bb194`
  - Preempt Render-Wrapper retired: `8f1d107dfb43a33fad84e72b32f018d5f695745e`
  - Rank-View Delay-Trio entfernt: `61b1e255fa4ae1d0cdfcbd0332796c6375ee8db3`
- Abschluss-QA:
  - Manifest: `V8009_TOWER_POWER_FINAL_QA.json`
  - Manifest-Commit: `d6f87f38695e8fa2757cdc78895ae90f4782aefc`
  - alle Checks **true**
  - Syntax aller aktiven Tower-/Authority-Dateien grün
  - genau ein kanonischer `vTowerRender`-Owner
  - keine globalen `render=function`-Wrapper im aktiven Tower-Scope
  - kein globaler `persist=function`-Wrapper im aktiven Tower-Scope
  - kein aktiver Tower-`MutationObserver`
  - genau ein aktiver Lobby-Live-`setInterval`
  - Lobby / Ranking / Meta / sämtliche Run-Modi / Result vorhanden
  - Authority-Bridge genau einmal geladen
  - Stable/Server 1 unverändert; `index.html` SHA weiterhin `0bc5fe3eb0e69c856070dfcb6682d3178c56a597`
  - Gameplay-/Combat-Math-/Reward-/Serverautorität in diesem Cleanup nicht verändert.
- Matrix:
  - Tower = **[x]**
  - Matrix-Commit: `fa810226208227e674e8e732f1a39924c183b9d8`
- Manueller Tower-Endtest bleibt für den späteren gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Friends + Mail komplett:
  - Friends: Ranking / Suche
  - Mail: Inbox / Sent / Compose / Battlelog


#### Powerblock: Friends + Mail strukturell abgeschlossen
- Scope:
  - Friends / Nebel-Crew: Liste / Anfragen / Suche / Presence
  - Mail: Inbox / Sent / Compose / Battlelog
- Friends finaler Owner:
  - `js/features/pvp/beta/v8009-s1-v4130-hall-dungeon-authority.js`
  - finaler `v073LoadFriends` mit Singleflight
  - finale Spielersuche
  - Online/Offline aus `updated_at`
  - ein gezielter 60-s-Presence-Refresh nur bei sichtbarer Friends-Seite
  - Navigation über gemeinsamen `growlegends:navigation-open-v7119`-Lifecycle.
- Retired aus aktiver Beta:
  - v333 Friends-Online-Renderer/15-s-Poller
  - v382 Social-Mail-Button-Repair
  - v383 Friend-Mail-Name-Repair
- Mail:
  - `v381` ist finaler Mail-/Tab-/Compose-Owner.
  - `v381OpenMailTo` übernimmt direkt das Öffnen einer neuen Nachricht an einen Spieler.
  - Kompatibilitätsalias `v382OpenMailTo` bleibt ohne eigenes Repair-Script.
  - alter 30-ms Compose-Nachlauf vollständig entfernt.
  - Battlelog-Tab wird durch v381 geöffnet; doppelter document-click Loader in v6200 entfernt.
  - Replay-Sleeps bleiben als echte Animationstaktung.
  - Mail-Unread 60 s und Battlelog 60 s bleiben als echte Daten-Cadence.
- Social Foundation:
  - `anon-0018.js` globaler `render()`-Wrapper entfernt.
  - Hall/Friends-Menü nutzt jetzt `v032Go` statt eigener Screen-Umschaltung + Full-Render.
  - `v8009-a1-supabase-online-system.js` globaler `render()`-Wrapper entfernt.
  - alter `v072AddMenuItems`-Wrapper + 0-ms Social-Repaint entfernt.
  - Profil-Daten-Sync: ein 60-s Dirty-Check plus Account-/Foreground-/Pageshow-Lifecycle; Payload-Dedupe verhindert unnötige Writes.
- v4124:
  - Profil-Payload-Enrichment und Quest-Samen-Reward bleiben erhalten.
  - **9.552 Byte** überholte Hall/Friends-DOM-/Loader-Logik entfernt.
  - kein eigener Hall/Friends-DOM-Producer mehr.
- Wichtige Commits:
  - Canonical Mail Recipient Routing: `083e57a1ef0ad3c31c3bc2be0c3026904b7082c0`
  - v4130 Friends Presence/Singleflight: `18b5c7728ba61cc6306e51c561a0b136369b8fd3`
  - v4124 Mail-Alias auf Canonical Owner: `abb2415ff64a9ce6a0a7b0c1ef1622380eae4dff`
  - v333/v382/v383 aus Beta retired: `9c3c1d794e61d7dc3173663ec5d6c6663f68f24d`
  - globaler v073 Render-/Menu-Wrapper retired: `1b7e93033a2f07114ab6b31e519a9ce24a2c4fa3`
  - v072 Foundation Render-Wrapper retired: `25503e6ef214761adc066c8730fee811de061072`
  - v4124 Social-Doppelrenderer entfernt: `3a8a84076bd8334d6fc0fcec4337c8b3aa490b87`
  - Battlelog doppelter Tab-Loader entfernt: `5f42c3f0a1d017d3d62d14c8d571da0297e6ee96`
- Abschluss-QA:
  - `V8009_FRIENDS_MAIL_POWER_FINAL_QA.json`
  - Manifest-Commit: `d9e73a685ff5cb1619967a7ba8e76785bee6622c`
  - alle Checks **true**
  - keine globalen Render-Wrapper im aktiven Friends/Mail-Scope
  - keine aktiven Social-MutationObserver
  - v333/v382/v383 nicht mehr geladen
  - genau ein finaler Friends-Loader und eine finale Suche in v4130
  - Mail vier Tabs vollständig
  - Compose-Routing ohne Timeout
  - Stable/Server 1 unverändert; `index.html` SHA `0bc5fe3eb0e69c856070dfcb6682d3178c56a597`.
- Matrix:
  - Friends = **[x]**
  - Mail = **[x]**
  - Matrix-Commit: `5cb4c101ac8bead2c23ce931fd977126938f5a94`
- Manueller Friends/Mail-Endtest bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Tütchen-Dealer + Harz Dealer komplett.


#### Powerblock: Tütchen-Dealer + Harz/Gold/Rahmen Dealer strukturell abgeschlossen
- Tütchen-Dealer:
  - bisherige Admin-only-Sperre vollständig aus aktiver Beta entfernt:
    - v7260 CSS nicht mehr geladen
    - v7260 JS nicht mehr geladen
    - Menüflag im kanonischen v086/v7215-Owner dauerhaft player-visible
  - Supabase-Freigabe:
    - `public.ad_bag_settings.enabled = true`
    - `server1.ad_bag_settings.enabled = true`
    - Modus bleibt bewusst `test`; keine ungefragte Umschaltung auf Production Ads.
  - v7221 Visual-Wrapper aus aktiver Beta retired:
    - Bag-Art / Premium-Art
    - Pack-Markup
    - Loading-State
    jetzt direkt im kanonischen v7215-Owner in `v8009-s2-v086-polish-script.js`.
  - Lifecycle:
    - 1200/1800/350-ms kosmetische Start-/Foreground-Nachläufe entfernt
    - übrig bleiben nur 2 funktionale Timeouts:
      - Account/DB-Verbindungsretry
      - SSV-Bestätigungs-Poll nach Rewarded Ad
    - 0 Intervalle / 0 MutationObserver im Tütchen-Scope.
  - Reward-/Authority-Pfad geprüft:
    - `v7215_ad_bag_state`
    - `v7215_ad_bag_apply_verified`
    - private Apply-Funktion
    - `v7224_ad_bag_effective_spec`
    - Tageskurve: 100 % / 75 % / 55 % / 40 % / ab Runde 5 = 30 %
    - levelabhängige Goldskalierung bleibt serverseitig.
- Harz / Gold / Rahmen:
  - `v7117` ist jetzt direkter 3-Tab-Hub-Owner für:
    - Harz-Taler
    - Gold
    - Avatar-Rahmen
  - alte nachträgliche Frame-Tab-Injection aus v7137 retired.
  - alter `v7117OpenDealerTab`-Wrapper aus v7137 retired.
  - Harz-DOM bleibt kanonisch v567; v322 liefert Paketdaten/Menu/+ und delegiert Rendering.
  - Gold bleibt kanonisch v7114.
  - Rahmen-Daten/Kauf/Aktivierung bleiben serverautoritativ v7137.
  - Google-Play-Harz:
    - serverseitige Kaufprüfung/Consume/Recovery erhalten
    - 6-fache Recovery-Timerkaskade entfernt
    - kosmetische Dealer-Copy-Repaints entfernt
    - Recovery läuft jetzt über Account-/First-Playable-/Pageshow-/Foreground-/Dealer-Lifecycle ohne setTimeout.
- Authority-Prüfung:
  - Harz-Kauf: Google-Play-Verifikation über `verify-google-play-purchase`
  - Goldkauf: `v7114_buy_gold_pack`, idempotenter Purchase-ID-Pfad + Progress-Authority
  - Rahmenkauf: `v7137_buy_avatar_frame`, serverseitiger Harz-Abzug + Duplicate-Guard
  - Rahmenaktivierung: `v7137_set_avatar_frame`
- Abschluss-QA:
  - Manifest: `V8009_DEALER_POWER_FINAL_QA.json`
  - Manifest-Commit: `4511aee6ee0395b2be72b4abeeaa17495d18d714`
  - alle geänderten JS-Dateien syntaktisch grün
  - v7260 Admin-Gate aktiv: **0**
  - v7221 JS-Wrapper aktiv: **0**
  - Dealer-Hub enthält direkt alle 3 Tabs
  - Billing-Datei nach Cleanup: **0 setTimeout / 0 setInterval**
  - Stable/Server-1 HTML unverändert; `index.html` SHA weiterhin `0bc5fe3eb0e69c856070dfcb6682d3178c56a597`.
- Matrix:
  - Tütchen-Dealer = **[x]**
  - Harz Dealer = **[x]**
  - Matrix-Commit: `3976003a652d73c4231c66abc63303b4f8814426`
- Manueller Endtest für Tütchen / Harz / Gold / Rahmen bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Forge komplett:
  - Dismantle
  - Craft
  - Nebelforge


#### Powerblock: Forge komplett strukturell abgeschlossen
- Harzschmiede:
  - `v488` besitzt jetzt direkt alle 3 sichtbaren Tabs:
    - Zerlegen
    - Schmieden
    - Nebelschmied
  - nachträgliche Nebelschmied-Tab-Injection entfernt.
  - alter Forge-MutationObserver / Repair-RAF-Pfad aus `v7240` entfernt.
  - Wechsel zurück zu Zerlegen/Schmieden entfernt den Nebelschmied-Body sauber.
- Zerlegen:
  - bisher sichtbarer `v488`-Pfad hatte noch lokalen Inventory-/Fragment-/Gold-Mutate.
  - bei aktiver Item-Authority wird der Klick jetzt synchron vor jedem `await` abgefangen.
  - serverseitige Aktion: `v7062_dismantle_items`.
  - Request-ID + Duplicate-Guard serverseitig vorhanden.
  - geschützte Items, Händlerware und Fragment-Yields werden serverseitig validiert.
  - Auswahl-Snapshot / Clear-API liegt jetzt direkt beim v488-Owner.
  - Händler-Rückerstattungs-Vorschau nutzt bevorzugt denselben `sellValue`-Pfad wie die Serverökonomie.
- Prismatisches Schmieden:
  - Authority-Klick wird jetzt ebenfalls synchron vor jedem `await` abgefangen; der alte lokale Handler kann nicht mehr vorher mutieren.
  - serverseitige Aktion: `v7097_forge_prismatic`.
  - Gold / Fragmente / Inventar + Duplicate-Guard bleiben serverautoritativ.
- Nebelschmied:
  - direkter Owner-Aufruf statt Tab-Reparaturkette.
  - 0 MutationObserver im Nebelschmied-Scope.
  - nur 1 funktionaler UI-Timer verbleibt: Entfernen der kurzen Hit-Animation.
  - bisheriger `v7240_nebelforge_reroll` ist serverseitig, war aber nicht request-idempotent.
  - neuer Wrapper `public.v8009_nebelforge_reroll` deployed:
    - persistente Request-ID
    - Atomic Pending-Marker über `player_item_events`
    - Duplicate-Erkennung
    - gleiche Request-ID wird nach Transport-/Antwortfehler beim Retry wiederverwendet
    - `EXECUTE` nur für `authenticated` + `service_role`; kein `anon` / `PUBLIC`.
  - SQL-Snapshot im Repo: `V8009_FORGE_POWERBLOCK_SQL.sql`.
- Abschluss-QA:
  - `V8009_FORGE_POWER_FINAL_QA.json`
  - QA-Commit: `01743f8ee7d095cc57ac3618aeeb0c33e9be4273`
  - alle 3 geänderten JS-Dateien syntaktisch grün.
  - Forge-Tabs direkt vorhanden: **3/3**
  - alte `ensureForgeTab`-Injection: **0**
  - alter Forge-MutationObserver: **0**
  - Zerlegen serverseitig: **ja**
  - Craft serverseitig: **ja**
  - Nebelschmied Request-ID-idempotent: **ja**
  - Stable `index.html` unverändert; SHA weiterhin `0bc5fe3eb0e69c856070dfcb6682d3178c56a597`.
- Matrix:
  - Forge = **[x]**
  - Matrix-Commit: `822d26d5fd21a265925dd50454927a7c0c59de76`
- Manueller Endtest für Zerlegen / Craft / Nebelschmied bleibt für den gemeinsamen Test-Milestone offen.

#### Powerblock: World / Startseite + Worldboss strukturell abgeschlossen
- Scope:
  - World / Startseite / Navigation / World-Module
  - Weltboss Entry / Overlay / Combat / Reward / Authority
- Startseite:
  - `js/features/home/beta/v8009-home-renderer.js` bleibt kanonischer Home-Renderer.
  - Weltboss-Slot ist jetzt direkt im Home-Owner vollständig klickbar und per Tastatur bedienbar.
  - Startseite verwendet direkt den gehärteten `v111OpenWorldBoss`-Opener, Fallback bleibt `v110Open`.
  - separater `gl-worldboss-home-click-fix` mit Capture-Handler + World-MutationObserver aus aktiver Beta entfernt und Datei gelöscht.
  - kanonischer Home-Renderer emittiert gezielt `growlegends:home-rendered-v8009`.
- Home-Lifecycle:
  - v483 globaler `render()`-Wrapper entfernt.
  - v483 achtstufiger 120/300/650/1100/1800/2800/4200/6500-ms Startup-Retry-Zug entfernt.
  - v483 läuft jetzt über DOM/account/pageshow/foreground/extras-Lifecycle; 9-s-Fallback bleibt nur für Gast/offline.
  - v7288 wrappt `v085InstallWorld` nicht mehr nachträglich.
  - v7288 reagiert auf den gezielten kanonischen Home-Render-Event statt einen zweiten Post-Render-Owner aufzubauen.
  - mehrere 0-ms Lifecycle-Nachläufe im v7288-Boot entfernt.
- Weltboss-Lifecycle:
  - v112:
    - globaler `render()`-Wrapper entfernt
    - 10-s Legacy-State-Polling entfernt
    - unnötige Refresh/Fight-State-Wrapper entfernt
    - State-Sicherung bleibt an echten Entry-/Account-Pfaden.
  - v120:
    - globaler `render()`-Wrapper entfernt
    - 150-ms Startup-Install entfernt
    - genau ein 1-s Countdown-Ticker bleibt; arbeitet nur bei sichtbarer World-Seite.
  - v290:
    - globaler `render()`-Wrapper + 350-ms Startup-State-Repaint entfernt.
  - v291:
    - 350-ms Startup-Refresh entfernt.
  - v327:
    - globaler `render()`-Wrapper + 200-ms Confirm-Prebuild entfernt.
    - Grow-Skill-Migration/Attribute-Cleanup läuft gezielt nach Account-Hydration bzw. Character-Navigation.
  - v111:
    - alter 150-ms Phase-Polling-Fight-Wrapper entfernt; spätere Balance-/FX-Owner besitzen den echten Kampfpfad.
  - v388:
    - spätere Opener-/Refresh-Rebind-Wrapper, RAF/30-ms Rebind und 500-ms Version-/Button-Timeout entfernt.
    - Fehler-/Startlock um den finalen Fight-Owner bleibt erhalten.
- Retired komplett aus aktiver Beta + physisch gelöscht:
  - `v113-worldboss-retry-confirm`
  - `v114-worldboss-confirm-modal`
  - `gl-worldboss-home-click-fix-js`
  - zugehöriges v114 Confirm-CSS.
- Authority:
  - `v7072` öffnet den Weltboss jetzt ebenfalls bevorzugt über `v111OpenWorldBoss`.
  - serverseitiger `v7072_worldboss_run`-Pfad, Replay, Harz-Prüfung und Reward-Authority bleiben unverändert.
  - v6201 behält bewusst seine zwei gezielten Observer auf HP-/Log-Nodes für echte Kampf-FX; kein breiter Seiten-Reparaturobserver.
- Wichtige Commits:
  - v483 Lifecycle: `0a2341881368a88aa395f2fe75f6213ad1a8280f`
  - v112 Cleanup: `63ce063e9d1504f2555fa993a5b67625aa84588b`
  - v120 Lifecycle: `c8d3e6cdcb62e352f22293c10e1e33a52912895b`
  - v290 Render-Hook Cleanup: `a2361796e41779670140d8fb574629a3c952b57c`
  - v327 gezielter Attribute-Cleanup: `f101f76e55efde3cf0566354cc8ac405a7ee12ee`
  - Home-Weltboss Canonical Ownership: `2769bbbc156b5a5251e20ab9e3a73b355fa44e85`, `169734f16bf37eea9cfe203d146f9693b87acab7`
  - v7072 gehärteter Opener: `984ff495d7038cc1f04691226551728cf1746c78`
  - v7288 Post-Render-Wrapper entfernt: `21ea2adb103e916f1787dfa49935492a532a6623`
  - v111/v291/v388 Cleanup: `a942ed7454d7114af48bb885bf0f02145c15c321`, `6eff12721518c3623833bf30b1da02c3a38c1545`, `c6c290daebdf2b0179ae12ee2a96d5443c0e2ad3`
  - obsolete Includes entfernt: `d47fa3fa37e3b299106d730ee9e38565b04aca57`
- Abschluss-QA:
  - `V8009_WORLD_WORLDBOSS_POWER_FINAL_QA.json`
  - QA-Commit: `d15bc1f9e14069bc55f12725ef80bc47ba7075aa`
  - alle strukturellen Checks true
  - Syntax aller geänderten aktiven JS-Dateien grün
  - v113/v114/Home-Click-Layer aktiv: **0**
  - v112 Polling-Intervalle: **0**
  - v120 sichtbarer Countdown-Ticker: **1**
  - globale `render=function`-Wrapper in den bereinigten Worldboss-Layern: **0**
  - Stable `index.html` unverändert; SHA weiterhin `0bc5fe3eb0e69c856070dfcb6682d3178c56a597`.
- Matrix:
  - World / Startseite = **[x]**
  - Worldboss = **[x]**
  - Matrix-Commit: `d72d499004d7f083cfef1c8f15ba854802569418`
- Manueller Endtest für Startseite + Weltboss bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Admin komplett:
  - Overview
  - Players
  - Content



#### Runtime-Fix: Gildenboss-Anmeldung + Hintergrundmusik
- Nutzer-Repro 2026-10-01:
  - Gildenboss-Anmeldung vor 19:00 schlug mit „offene Gildenboss-Belohnung der vorherigen Runde“ fehl.
  - Hintergrundmusik stotterte im Android/WebView-Build.
- Gildenboss Root Cause:
  - produktiver `v7307_set_guild_boss_signup`-Gate prüfte jede ältere nicht abgeholte Teilnahmebelohnung (`battle_date < heute`);
  - gewünschte Regel ist ausschließlich eine offene eigene Belohnung **vom Vortag**.
- Gildenboss Fix direkt in bestehender Serverfunktion:
  - `public.v7307_set_guild_boss_signup`: `gr.battle_date = d - 1`;
  - `server1.v7307_set_guild_boss_signup`: identisch;
  - keine zusätzliche Client-/Server-Patchschicht.
  - produktive DB aktualisiert und verifiziert: beide Schemas `previous_day_only=true`, alter History-Gate `false`.
  - Repo-SQL Commit: `686debe2f6f1669c6d9dbf6a2f51a417b87d2ff4`.
- Musik Root Cause/Fix direkt in bestehenden Audio-Ownern:
  - Musik und SFX verwendeten zwei getrennte `AudioContext`-Instanzen;
  - Musikpuffer war fest auf 22.050 Hz gebaut und musste auf Android/WebView laufend zur Geräte-Samplerate resampelt werden.
  - `v8009-s2-v6109-background-music.js` erzeugt den Loop jetzt mit `audioCtx.sampleRate` und stellt denselben kanonischen Context für SFX bereit.
  - `v8009-s1-v6111-global-sound-system.js` verwendet diesen vorhandenen Context statt einen zweiten anzulegen.
  - Music Commit: `841322c36f9d9c806a83850f482fd7b3a10258f3`.
  - SFX Commit: `5c7f4ee47d3ab90abb0d132718d79fc6d7437793`.
- Manueller Endtest offen:
  - Gildenboss heute anmelden;
  - Hintergrundmusik mehrere Minuten mit Navigation/Scroll/Kampf laufen lassen.


#### Powerblock: Admin strukturell abgeschlossen
- Scope:
  - Admin-Zentrale / Content
  - Spieler verwalten
  - Belohnungen
  - Spieler-Tickets
  - Broadcasts / Umfragen
  - Event-Vorlagen
  - Systemtechnik
- Wichtige Bereinigung:
  - globale `render()`-Hooks aus Admin-Reward/Menu-Pfaden entfernt.
  - verzögerte Admin-Menü-Reparaturen (1,9-s Startup) entfernt.
  - doppelte Preset-/Ticket-/Broadcast-Installationspfade entfernt.
  - `v093CheckAdmin` ist jetzt alleiniger Admin-Status-/Berechtigungs-Lifecycle-Owner.
  - `v093AdminLoadLists` ist jetzt alleiniger Admin-Content-/Submodule-Load-Owner.
  - Player-Editor, Rewards, Tickets, Event-Presets und Broadcasts werden von dort optional direkt installiert/geladen.
  - Systemtechnik-Sync wird direkt aus dem Admin-Core angestoßen; Settings-Wrapper entfernt.
- Authority:
  - zentrale Player-Admin-RPCs existieren in `public` + `server1`.
  - Player-Admin-RPCs prüfen `is_game_admin()`.
  - `is_game_admin()` prüft serverseitig `game_admins.user_id = auth.uid()`.
  - Ticket-/Broadcast-Admin-RPCs ebenfalls serverseitig admin-gesichert.
- Abschluss-Audit:
  - aktive Admin-JS-Dateien: globale `render=function` Wrapper = **0**
  - `v093CheckAdmin=async function` Wrapper außerhalb des Core = **0**
  - `v093AdminLoadLists=async function` Wrapper außerhalb des Core = **0**
  - MutationObserver in aktiven Admin-Dateien = **0**
  - Admin-DOM besitzt keine echten drei Tabs; die bisherige Matrix-Bezeichnung war nur Prüfgruppierung. UI bleibt bewusst als gestapelte Admin-Bereiche erhalten.
- Wichtige Commits:
  - v105 Render-Hook entfernt: `3a6b7091dd3db429798630bba5d7a005ee1587af`
  - v273 Menu-Repair bereinigt: `63d0d39afe9c87fae9e4291bcc34c28333ab30a6`, `4736ffe1c2b728cef0ec4f23656d63f34817ddb3`
  - v274 Preset-Lifecycle konsolidiert: `4059ffa91e286adcee46fd708725a2f94e15f15a`, `150552afd8c559433b3f5ea0c010da64940fe2ae`
  - v269 Ticket-Lifecycle konsolidiert: `d223ad32d8ded17f547c15afdfe25442add206e5`, `33e3b7e3af0d3229f115072d2784f9c596dfd1aa`
  - v6346 Admin-Reparaturtimer/Wrapper entfernt: `4417e60d3067d4769625ab3ab6c1832c55408156`, `12531aac1e2a784fbfcc5f599c489599bbc4278d`
  - v4142 Wrapper bereinigt: `2d6ff92fda071963ed11ce9b0f47699c28f03a6d`, `890f876e64256cf8b13aad2e692fbd14423dbd57`
  - v093 kanonischer Owner: `4ab11b87299817f68811c9c6813b09b98e492b31`
  - v103 Load-Wrapper entfernt: `64e2bad43ee256161e8e5ee4f557abdebd31fa49`
  - QA: `V8009_ADMIN_POWER_FINAL_QA.json`, Commit `278fcd83da076511702620baaaf2dfdeda06da3f`
- Matrix:
  - Admin = **[x]**
- Manueller Admin-Endtest bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- verbleibende `[~]`-Bereiche aus der Matrix schließen:
  - Dungeon Combat + Reward final
  - Character – Attribute / Inventar / Talente / Materialien
  - Character Creation – Beta / Server-1
- danach repo-weite finale DOM/Lifecycle/Owner-QA.


#### Powerblock: Dungeon Combat + Reward final abgeschlossen
- Scope:
  - Dungeon Kampf / Replay
  - Server-Receipt / Reward
  - Reward-Modal
  - Niederlage-Modal
  - Wochen-Truhen-/Gilden-EP Feedback
- Konsolidierung:
  - `v7051` rendert das Reward-Fenster nicht mehr selbst.
  - Server-Reward wird direkt an `v247ShowDungeonReward()` übergeben.
  - `v247` ist jetzt alleiniger Reward-Modal-Owner.
  - Run-ID bleibt im Reward-Payload erhalten, damit Wochen-Truhen-/Gilden-EP serverseitig exakt nachgeladen werden.
  - doppelter Reward-Sound im Serverpfad entfernt.
  - `v587` Reward-Wrapper entfernt; Niederlage bleibt eigener, klar begrenzter Result-Pfad.
  - redundantes RAF-Re-Show im Niederlage-Overlay entfernt.
  - Niederlage persistiert bei serverautoritativem Dungeon nicht mehr den historischen Client-Gesamtstand.
  - alte Version-Stamp-/Re-Show-Logik im v247 Reward-Owner entfernt.
- Combat:
  - sichtbarer Kampf bleibt im bestehenden `v7175` Combat-Renderer.
  - keine globalen Render-Wrapper.
  - kein Polling-Interval.
  - genau ein gezielter MutationObserver für aktiven Combat-HUD/HP/Log-State.
- Authority:
  - `v7051_run_dungeon`, State und Ack in Public + Server1 vorhanden.
  - `v8009_dungeon_reward_feedback` ist über den produktiven RPC-Pfad erreichbar; echte Requests heute mit HTTP 200 bestätigt.
- Wichtige Commits:
  - v247 kanonischer Reward-Owner: `88ef22dc508a37eabfd66c9b865639f6beb01702`, `079a3c33787ace146311d05272b48a7a8dae0328`, `9bc21f2216fd7d0ac6b38e0cd6a4c262b536df24`
  - v7051 Server-Reward -> v247: `dd237a3e7050351c7867a4312dd5a68495704b5b`, `8a9beb4d29f709d9cba9e41037724883bebf7e23`, `3056e20489f02e84a2e9e54c1cef60ad0c49748d`
  - v587 Result-Cleanup: `b613008c2013824c9c0a4a7f8c99102716f98152`, `bdac0c16e15bf538188de4db1746850a5309d617`
  - QA: `V8009_DUNGEON_COMBAT_REWARD_FINAL_QA.json`, Commit `8e615e179d2177ddb4a4bce57a1e36c658705610`
- Matrix:
  - Dungeon = **[x]**
- Manueller Dungeon-Endtest bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Character:
  - Attribute
  - Inventar
  - Talente
  - Materialien


#### Powerblock: Character – alle 4 Tabs abgeschlossen
- Scope:
  - Inventar
  - Attribute
  - Talente
  - Materialien
  - Hero/Equipment-Layout als gemeinsamer Character-Rahmen
- Hauptfix für die bekannte Ruckelursache:
  - `v480UpdateAutoBars()` berechnet nicht mehr Inventar- und Materialplan gleichzeitig.
  - Inventar-Tab: nur Auto-Equip-Plan.
  - Material-Tab: nur Gem-/Rollen-Plan.
  - unsichtbare Tabs lösen keine schwere Auto-Berechnung mehr aus.
- Lifecycle-/Owner-Konsolidierung:
  - `v459` ist jetzt alleiniger sichtbarer Character-Tab-Lifecycle-Owner.
  - genau ein `renderInventory()`-Wrapper bleibt übrig: der kanonische v459-Owner.
  - `v268` Mehrfachverkauf ist nur noch Decorator unter v459; eigener Inventory-Wrapper entfernt.
  - `v533` Inventory-Reference ist nur noch Decorator unter v459; Wrapper/Navigation/Pageshow/Visibility-Repaints entfernt.
  - `v543` bleibt Talent-Renderer; Navigation/Pageshow/Klick-Lifecycle an v459 abgegeben.
  - `v4140` bleibt Attribute-Renderer; sichtbarer Tab-Lifecycle an v459 abgegeben.
  - `v123` Equipment-Polish wird direkt über v459 aufgerufen; globaler `render()`-Wrapper entfernt.
  - `v080` Avatar: globaler Render-Wrapper entfernt; `renderClassAvatar()` bleibt direkter Portrait-Owner.
  - `v510` Hero-Rebuild: globaler Render-Wrapper entfernt; nur Character-/Stability-Lifecycle.
  - `v275` Character-Name: globaler Render-Wrapper entfernt; direkter Avatar-/Character-Lifecycle.
  - `v328` Grow-Skill-Cleanup: globaler Render-Wrapper entfernt; Datenbereinigung bleibt erhalten.
  - `v267` alter verzögerter globaler Stat-Render entfernt.
- Wichtiger Altlast-Fix:
  - `v442` hat bei `pageshow` und über verzögerte Timer das Inventar wieder in das alte Character-Layout verschoben.
  - dieser alte Layout-Owner ist entfernt.
  - Verkaufswert-/Economy-Logik aus v442 bleibt erhalten.
- Abschluss-Scan über die kritischen Character-Dateien:
  - globale `render=function` Wrapper = **0**
  - `renderInventory=function` Wrapper = **1** (nur v459)
  - `renderSkillTree=function` Wrapper = **0**
  - `v459ArrangeCharacter=function` Wrapper = **0**
  - MutationObserver = **0**
  - Polling-Intervalle = **0**
- Wichtige Commits:
  - v459 Tab-Owner + aktive-Tab-Refresh: `fa3a95aa93607c57cf8e551c51e6e69a5ca64c34`, `c557ef6f09c0a1fb0855f70b6971a7a69dcac213`, `03401ec7babba560500b97e896f2597259ff73aa`, `649ab1f0acbccb1deea6c593fdef46ae2f2f5bda`
  - v480 aktive-Tab-Berechnung: `ae6a6b25399d6bbac6788e57a2cf2e88b92b7710`
  - v533 Wrapperkette entfernt: `9ba04ab6f3186c60118ae564da02251954ca639b`
  - v543 Lifecycle zentralisiert: `2691995a3e0f26f6d31da1f4e94b43daa8540349`
  - v4140 Lifecycle zentralisiert: `381f07cd57466913278bf26167f8ff37a3e53c64`
  - v268 Multisell unter v459: `67d066a576200651083d3daea415ea959bf26d82`
  - v080 Avatar-Renderwrapper entfernt: `aba303869f4bc7de7dcf0ef0a07aa87d4d8490e7`
  - v510 Hero-Renderwrapper entfernt: `1694095155059685fa48f9f24face31cba1c4e4d`
  - v275 Name-Renderwrapper entfernt: `f79116329582904d9a4d6f5c90a790fecb70db8f`
  - v328 GrowSkill-Rendercleanup entfernt: `1837e96443fad6951df5e4fae29c0a2b7b32787b`
  - v267 delayed render entfernt: `56568d214e3eaf01e51ea9aa6d3b27d08b6d5d54`
  - v123 Equipment-Wrapper entfernt: `7e64ad01e3f644dba83726bcba7d2ba814384d60`
  - v442 alter Layout-Owner entfernt: `ff8433d8853c4cb93524db4a709d2010b770fccb`
  - QA: `V8009_CHARACTER_FOUR_TAB_FINAL_QA.json`, Commit `4973dacda07ba3878bfba70d983eb45755fc83f9`
- Matrix:
  - Character = **[x]**
- Manueller Character-Endtest bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- Character Creation – Beta / Server-1 final
- danach repo-weite finale DOM/Lifecycle/Owner-QA.


#### Powerblock: Character Creation – Beta / Server 1 final abgeschlossen
- Scope:
  - Beta Creator
  - Server-1 Creator
  - Account-Finalizer-Handoff
  - Supabase-Schema-Routing
  - getrennte Server-1-Launch-Sperre
- Konsolidierung:
  - `v4136 -> v7275CreateCharacterServer()` ist jetzt der einzige direkte Client-Owner für `gl_create_character`.
  - Beta und Server 1 benutzen denselben Create-Helper.
  - Server-1-Rückgabe `initialized=true` wird im gemeinsamen Helper auf den kanonischen `ready=true`-Contract normalisiert.
  - `v7229` besitzt weiterhin nur die Server-1-spezifische UI/Isolation, ruft aber keinen eigenen Create-RPC mehr direkt auf.
  - zusätzlicher `v7229`-`v200FinalizeUser`-Wrapper entfernt.
  - 5-stufige Startup-Retry-Kaskade `[0,120,400,1000,2200]` entfernt.
  - 120-ms-Creator-Polling entfernt; Recovery nur noch über echte `account-ready` / `first-playable` Events.
  - historischer früher `v029` Text-Creator bleibt retired.
- Authority / DB:
  - `public.gl_create_character` vorhanden, serverautoritativ und mit `auth.uid()`.
  - `server1.gl_create_character` vorhanden, serverautoritativ und mit `auth.uid()`.
  - beide Schemas erzwingen Namens-/Klassenregeln serverseitig.
  - Server-1-DB-Client wird vor Launch weiterhin über das ausgewählte Server-Schema `server1` geroutet.
- Server-1-Öffnung ausdrücklich unverändert:
  - `V343_LAUNCH_AT = 2026-10-02T16:00:00+02:00`.
  - normale Accounts bleiben bis dahin über den separaten v343-Zugangspfad gesperrt.
  - Vorabtest-Zugang bleibt separat bestehen.
  - Character-Creation-Cleanup öffnet Server 1 nicht vorzeitig.
- Wichtige Commits:
  - gemeinsamer Create-/Finalizer-Owner: `ab0f1cf4771f99024aa3d3e616ac4be2b866d769`
  - Server1 nutzt gemeinsamen Create-Owner: `5ad2fd25929e4e19b2dc992dc6ff64834abc8e5f`
  - Server1 Creator-Polling entfernt: `e41c35872a279a06672a7c8a47265f9bd489da49`
  - QA: `V8009_CHARACTER_CREATION_FINAL_QA.json`, Commit `de44c78491e97c3b672b988b68b3dd8b48e019ec`
- Matrix:
  - Character Creation = **[x]**
- Manueller Creator-Endtest bleibt für den gemeinsamen Test-Milestone offen.

#### Nächster Powerblock
- finale repo-weite DOM/Lifecycle/Owner-QA.


#### Powerblock: Finale repo-weite DOM/Lifecycle/Owner-QA abgeschlossen
- Abschlussstatus:
  - **22/22** Matrix-Bereiche strukturell abgeschlossen.
  - offene `[~]` / `[ ]` Bereiche = **0**.
- Beta Entry:
  - externe Scripts: **638**
  - doppelte Script-`src`: **0**
  - Stylesheets: **708**
  - doppelte Stylesheet-`href`: **0**
  - Inline-Scripts: **0**
  - Inline-Styles: **0**
  - Inline-Eventhandler: **0**
- Letzte gefundene Restaltlast:
  - mehrere historische CSS-Marker zeigten noch auf fremde/ältere Stylesheets.
  - falsche Marker-Links ohne eigene CSS-Datei entfernt.
  - doppelte Final-Version-CSS-Marker entfernt.
  - echte v7137/v7145/v7165 Styles bleiben jeweils genau einmal eingebunden.
- Commits:
  - CSS-Include-Bereinigung: `c8023dd4a15eecc18f23f02e7f966f6d8ffc78ca`
  - doppelte Final-Version-Marker entfernt: `c3966992f78793d78a22d3c0c73576815955edbc`
  - Abschluss-QA: `V8009_FINAL_REPO_WIDE_QA.json`, Commit `c6bca5eaa171291fadb28a1b390abb127e18e456`
- Ergebnis:
  - V8.009 strukturelle Repo-QA = **abgeschlossen**.
  - Es bleibt nur noch der gemeinsame **manuelle End-to-End-Test-Milestone** im Beta-Build.


#### Growroom Visual-Fix – Töpfe / Pflanzenbilder
- Direkt im bestehenden Growroom-CSS korrigiert, **kein neuer Overlay-/Patch-Layer**.
- Freie Töpfe im Slot deutlich größer dargestellt.
- Pflanzenbilder pro Wachstumsphase größer und sauber im Slot zentriert (`object-fit: contain`, Boden-Ausrichtung).
- Kartenhöhe angepasst, damit Bild, Name, Timer und Pflegebereich nicht ineinander laufen.
- Mobile Größen separat mitgezogen.
- Geänderte Datei: `v8009-extracted-v497-plant-art-economy-css.css`
- Commit: `47a80e7854e1cd0f5f51101a8bf6934ca3578f9b`


#### Growroom Login-Hydration-Fix – Pflanzen / freigeschaltete Töpfe
- Ursache gefunden: Der Growroom konnte beim Login kurz mit Default-/Altzustand rendern (`roomLevel=1`, leere/alte Pflanzen), bevor der serverautoritative Grow-State des aktuellen Accounts fertig geladen war.
- Zusätzlich konnte der alte v498-Local-Snapshot-Recovery noch zeitversetzt nach 250/1000/3500/12000 ms eingreifen.
- Direkt an den bestehenden Ownern repariert, **kein zusätzlicher Patch-/Overlay-Layer**:
  - v7065 Authority-Readiness ist jetzt an die aktuelle Account-UID gebunden (`authorityUid`). Ein alter Login darf nicht mehr als ready für einen neuen Login gelten.
  - v7070 rendert den Growroom erst, wenn `enabled + ready + gleiche UID` bestätigt sind; vorher bleibt die vorhandene Sync-Barriere sichtbar.
  - v498 Local-Snapshot-Write/Repair ist unter Grow-Serverauthority deaktiviert; die historischen Delayed-Recovery-Timer können damit keinen Serverstand mehr überschreiben.
- Erwartetes Verhalten: Beim Login kein temporäres `1/1 Töpfe`, keine verspätet auftauchende Pflanze und keine erst später freigeschalteten Slots; stattdessen kurz Sync-Barriere, dann direkt der vollständige Serverstand.
- Commits: `08e511521892a64dc33c5e1be2c92bb957fdfa79`, `7e64f38be3b55fb0823ffca6de8614ba0274864d`, `c5c55569388539069327aead4e800f9f875b1435`


#### Growroom Visual-Fix 2 – größere Töpfe / vollständige Pflanzenbilder
- Bestehendes Growroom-Art-CSS erneut direkt angepasst, kein neuer Patch-Layer.
- Freie Topf-Symbole deutlich größer skaliert.
- Pflanzenkarten höher gemacht, damit größere Artworks Platz haben.
- Pflanzenbilder zeigen jetzt die **vollständige Grafik**: Maskierung entfernt, `object-fit: contain`, volle Breite/Höhe innerhalb des Art-Bereichs.
- Seedling/Growth/Flower/Harvest-Art jeweils größer skaliert; Mobile separat angepasst.
- Geänderte Datei: `v8009-extracted-v497-plant-art-economy-css.css`
- Commit: `452dec63f57914d08a2a33dc6280697a701a9f70`


#### Verbindliche Änderungsregel für weitere Arbeiten
- Bestehende Funktionen, Layouts, Styles und Logik **direkt an der zuständigen Stelle reparieren oder ändern**.
- **Keine neuen Patch-Layer, Overlay-Fixes, zusätzliche CSS-Overrides oder parallelen Ersatz-Owner** über einen Fehler legen, wenn die bestehende Stelle korrigiert werden kann.
- Bei Änderungen zuerst den aktuellen Owner/Quellcode finden und dort sauber ersetzen bzw. bereinigen.
- Alte fehlerhafte Regeln oder Logik entfernen/ersetzen, statt neue Gegenschichten aufzubauen.
- Diese Regel gilt dauerhaft für die weiteren Grow-Legends-Arbeiten.


#### Growroom Pflege – erster Tap CARE_TOO_EARLY behoben
- Fehlerbild: Pflege wurde im UI bereits als bereit angezeigt, der erste Tap konnte serverseitig noch `CARE_TOO_EARLY` liefern; direkt danach funktionierte der zweite Tap.
- Ursache: Grenzfall direkt am Beginn des Pflegefensters zwischen Client-Anzeige und serverseitiger Zeitprüfung.
- Direkt in der bestehenden serverautoritativen RPC `v6358_care_plant` korrigiert, **kein zusätzlicher Client-Patch-Layer**.
- Public + Server1 erhalten 3 Sekunden sichere Starttoleranz nur am unteren Pflegefenster-Rand; das obere Fenster/Verpassen bleibt unverändert.
- Migration: `fix_grow_care_first_tap_boundary`.
- Verifiziert: public und server1 enthalten die neue First-Tap-Toleranz.


#### Inventar – Besser/Schlechter-Vergleich wiederhergestellt
- Fehlerbild: In den Inventar-Itemkarten fehlten die sichtbaren Besser/Schlechter/Gleich/Freier-Slot-Vergleichsindikatoren.
- Ursache: Beim letzten Character-Owner-Cleanup wurde v470 als Vergleichs-Owner beibehalten, aber der kanonische v459-Inventar-Refresh rief `v470PaintInventoryComparisons()` nicht mehr auf.
- Direkt im bestehenden v459-Inventory-Refresh repariert, **kein neuer Patch-/Observer-Layer**.
- Nach `compactInventory`, Multisell, Auto-Bar und v533-Layout wird jetzt wieder der kanonische v470-Vergleich gemalt.
- Geänderte Datei: `js/features/character/beta/v8009-s2-v459-character-hub.js`
- Commit: `9d297f10b065cabe68c8a02f9358624991449873`


#### Growroom Startup-Hydration – Pflanzen und Slots sofort korrekt
- Video geprüft: Growroom öffnete zunächst mit Defaultzustand (`Lv.1 / 1 Topf`, gesperrte Slots), die echte Pflanze und freigeschalteten Slots kamen erst deutlich später nach.
- Ursache: Die Capability-Prüfung (`v7081`) war beim ersten Growroom-Render teils noch nicht bereit. Dadurch ließ die Hydration-Barriere den lokalen/default Grow-State einmal durch. Erst ein späterer Authority-Refresh ersetzte ihn durch den korrekten Serverstand.
- Direkt in den bestehenden Authority-/Hydration-Ownern repariert, **kein neuer Patch-/Overlay-Layer**:
  - `v7065` reagiert jetzt sofort auf `growlegends:authority-capabilities-ready` und hydratisiert Grow direkt.
  - Beim Öffnen des Growrooms wird bei noch fehlenden Capabilities die Capability-Prüfung sofort angestoßen.
  - `v7070` blockiert den Growroom-Render jetzt bereits während der Capability-Phase und wartet auf den aktuellen Account, bevor Default-/Altzustand sichtbar werden kann.
  - Danach wird direkt der serverautoritative Grow-State gerendert.
- Geänderte Dateien:
  - `js/features/authority/beta/v8009-s2-v7065-fail-closed-grow-authority-hotfix.js`
  - `js/features/grow/beta/v8009-s5-v7070-authoritative-grow-hydration.js`
- Commits: `258937542d462eeb80a1aa3bbc0293cb7e636275`, `0ac2d1494980243a1c3a352a9db8129e1bc1466b`


#### Kampf-Timing – Anbau-Turm Sound + Dungeon langsamer
- Anbau-Turm: Schlag-SFX im serverautoritativen Replay leicht vorgezogen, damit Sound und sichtbarer Treffer auf Mobile synchroner wirken. Kein zusätzlicher Audio-Patch; direkt im bestehenden `v7072` Tower-Replay-Owner geändert.
- Dungeon: kanonische Replay-Cadence im bestehenden `v7051` Dungeon-Owner moderat verlangsamt. Nur Präsentation/Animation; Server-Kampfwerte, Schaden und Rewards unverändert.
- Dateien:
  - `js/features/authority/beta/v8009-s1-v7072-server-tower-weekly-worldboss-bridge.js`
  - `js/features/dungeon/beta/v8009-s1-v7051-atomic-dungeon-receipt-client.js`
- Commits: `1c5845552a341f394d8fc8940eeee97f895b7371`, `70a6203eca77f3a4fa8201a7a3b15440800b7d30`


#### Grow-Aufträge – Belohnungs-Popup statt Toast
- Wenn ein Grow-Auftrag abgeschlossen wird, erscheint jetzt ein echtes Belohnungs-Popup mit Auftragsname und den konkreten Rewards; der bisherige Abschluss-Toast wurde entfernt.
- Beim Abholen der Grow-Auftrags-Belohnung erscheint ebenfalls das kanonische Belohnungs-Popup; der serverseitige Erfolgs-Toast `Grow-Auftrag serverseitig abgeholt` wurde entfernt.
- Reward-Logik bleibt unverändert: Abschluss macht die Belohnung abholbereit, erst der Claim schreibt die Belohnung gut.
- Direkt in bestehenden Ownern geändert, **kein zusätzlicher Patch-/Overlay-Owner**:
  - `js/features/rewards/beta/v8009-s3-v7136-complete-server-reward-core.js`
  - `v8009-extracted-v7136-complete-server-reward-style.css`
  - `js/features/authority/beta/v8009-s2-v7065-fail-closed-grow-authority-hotfix.js`
  - `js/features/grow/beta/v8009-s1-v6160-grow-contracts-core.js`
- Commits: `4f5db05a6db619b5899c15d17ca6197a07d6d079`, `6015e8f2d1b22760c04dc596e957d2c30f4223d7`, `3622511bdc58666135968834009b22b1ce37b118`, `a346ab71403a3b9c549b9b041b0bead0bb64a3d4`


#### Dampf-Kauf – Harz-Abzug + serverseitige Persistenz
- Fehler: Der sichtbare Dampf-Kauf konnte trotz aktiver Quest-Authority noch in den alten lokalen Refill-Pfad fallen. Dadurch wurde Dampf nur lokal erhöht und Harz nur lokal verändert; der nächste Server-Abgleich (z. B. nach Dungeon-Aktion) setzte beides wieder auf den kanonischen Serverstand zurück.
- Ursache: `v7045` prüfte für den Refill nur den alten `v7040`-Mode, während der aktuelle Authority-Entscheider `v7081UseAuthority('quest')` bereits aktiv sein konnte. `v7110` nutzte bereits beide Signale, `v7045` noch nicht.
- Direkt im bestehenden Quest-Authority-Client repariert, kein neuer Patch-Layer:
  - `v7045` nutzt jetzt denselben Authority-Entscheider wie `v7110`.
  - Dampf-Refill läuft bei aktiver Quest-Authority über das bestehende serverseitige RPC `v7044_refill_dampf`.
  - Dieses RPC zieht 1 Harz serverseitig ab, erhöht Dampf serverseitig um bis zu 20 und speichert `refill_count`/Revision dauerhaft.
  - Nach erfolgreichem Kauf wird der Quest-State-Cache invalidiert und Dampf/Harz direkt aus der Serverantwort gemalt, ohne einen globalen Voll-Render.
- Datei: `js/features/quest/beta/v7045-atomic-quest-receipt-client.js`
- Commit: `381deb6621df86974390cbee159b6611c4b33e10`


### Server 1 Promote – Block 1/2 · 01.10.2026

- `beta.html` wurde als aktueller stabiler Client nach `server1.html` geklont.
- Server 1 besitzt eigenen Release-Marker: `window.GROW_RELEASE_CHANNEL='server1'`.
- Serverauswahl `v343` routet Server 1 jetzt auf `server1.html` statt auf den alten `index.html`.
- Gemeinsame JS/CSS-Owner bleiben identisch mit Beta; keine zweite Patch-Version angelegt.
- Supabase Core-Parität für aktuelle Beta-Features ergänzt, Migration:
  - `server1_promote_core_beta_features_v8009`
- In `server1` neu gespiegelt:
  - `player_caravan_state`
  - `player_nebelforge_state`
  - `v7240_nebelforge_state`
  - `v7240_nebelforge_reroll`
  - `v8009_nebelforge_reroll`
  - `v7240_caravan_state`
  - `v7240_caravan_start`
  - `v7240_caravan_choose`
  - `v8009_dungeon_reward_feedback`
  - `v8009_dungeon_side_rewards`
  - Dungeon-Side-Reward-Trigger auf `server1.player_dungeon_runs`
- Nebelschmied/Nebelkarawane-Client akzeptiert jetzt `beta` und `server1`.
- Verifikation nach Migration: alle oben genannten Tabellen/Funktionen + Trigger in `server1` vorhanden.
- Nächster Block:
  1. verbliebene Server-1-Core-Differenzen gegen Beta prüfen;
  2. nur echte gameplay-relevante Abweichungen angleichen, globale Tabellen (News/Legal/Play/PUSH etc.) bewusst nicht blind duplizieren;
  3. danach Server-1 Smoke-Test vorbereiten.


### Server 1 Promote – letzter Backend-Differenzcheck · 01.10.2026

- Relation-Vergleich wurde mit Tabellen **und Views** wiederholt. Wichtig: viele vermeintlich fehlende Server-1-Tabellen sind bewusst als Views auf globale/public Daten vorhanden (u. a. Admins, Events, News, Wetter, Push, Tickets, Referral-Device-Guard, Serverkonfiguration).
- Dadurch sind die gemeinsam/global geführten Bereiche auf Server 1 bereits erreichbar und müssen nicht dupliziert werden.
- Verbleibende echte Relations-Differenzen:
  - `player_nebel_caravan_state`
  - `player_nebel_forge_state`
  Diese gehören zu alten `v7240_nebel_*` RPCs. Der aktuelle Client nutzt stattdessen die bereits nach Server 1 promoteten kanonischen RPCs:
  - `v7240_caravan_state/start/choose`
  - `v7240_nebelforge_state`
  - `v8009_nebelforge_reroll`
- Verbleibende Funktionsnamen ohne Server-1-Gegenstück sind nur alte/ungenutzte `v7240_nebel_*`, `v7274_ensure_character_ready` und der public Pre-Request-Hook. Repo-Suche ergab keine Client-Referenz auf diese Alt-RPCs.
- Die Serverkonfiguration wurde auf den neuen geklonten Entry umgestellt:
  - Beta: `beta.html`
  - Server 1: `server1.html`
- Supabase Migration: `server1_release_path_to_cloned_client_v8009`
- Backend-Promote damit für den aktuellen Client abgeschlossen; nächster Schritt ist ein kurzer Server-1-Smoke-Test mit frischem Server-1-Charakter.


### Server 1 Harz-Dealer Paritätsfix · 01.10.2026

- Fehlerbild: Auf Server 1 wurden die 3 „Beliebten Angebote“ noch groß untereinander dargestellt, obwohl Beta sie klein nebeneinander zeigt.
- Ursache: Nur `server1.html` hatte für die Harz-Dealer-Dateien einen festen Cache-Buster `?v=8009s1dealer2`. Dadurch konnte Server 1 weiterhin eine ältere, bereits unter genau diesem Query gecachte Dealer-Version laden, während Beta die aktuellen gemeinsamen Dateien direkt lädt.
- Direkt repariert, kein zusätzlicher CSS-/Patch-Layer:
  - die 6 festen `?v=8009s1dealer2`-Suffixe aus `server1.html` entfernt;
  - Server 1 lädt jetzt exakt dieselben Harz-Dealer-JS/CSS-URLs wie Beta.
- Die aktuelle kanonische v567-Datei enthält bereits das 3-spaltige Featured-Layout für „Beliebte Angebote“.
- Commit: `d61588117a08315251f1e9f8c9c6b43be826e7b5`.


### Server 1 UI-Parität – Harz Dealer + Nebelschmied · 01.10.2026

- Screenshot-Analyse korrigiert: Die sichtbare `V8.003`-Anzeige stammt aus der V8-Phase2-Strukturkennung und beweist nicht, dass Server 1 einen alten Client lädt.
- Reale Server-1-Abweichung in der Harzschmiede gefunden:
  - der kanonische v488-Forge-Owner renderte den Tab **Nebelschmied** nur bei `GROW_RELEASE_CHANNEL === 'beta'`;
  - der v7240-Nebelschmied selbst unterstützt bereits `beta` und `server1`.
- Direkt im kanonischen Owner korrigiert:
  - Nebelschmied-Tab wird jetzt für `beta` **und** `server1` gerendert;
  - Commit: `2d73d0f679350fc26622e10121633b53ebc054d4`.
- Harz-Dealer ebenfalls direkt im bestehenden v567-CSS bereinigt:
  - `Beliebte Angebote` ist jetzt im kanonischen CSS selbst ein fixes 3-Spalten-Grid auf Desktop und Mobile;
  - alte Flex-/Breitenregeln entfernt, kein zusätzlicher Override-Layer;
  - Commit: `54d93b645208ef2a64752e7b6ed828a7747fdc4c`.
- Gemeinsame Asset-Revision für Beta + Server 1 aktualisiert:
  - Dealer: `?v=8009dealer4`
  - Forge: `?v=8009forge1`
  - Beta Commit: `3060f5a148e84a28ce511e074e33b86e02bd12b3`
  - Server-1 Commit: `47e857443102996edc0db2e72f0a6ea7b4249c1a`.
- Verifiziert: `beta.html` und `server1.html` unterscheiden sich weiterhin nur in Release-Channel und Seitentitel; Dealer-/Forge-Includes sind identisch.


### Root-/Login-Launcher auf aktuellen V8-Client gehoben · 01.10.2026

- Ursache für die weiterhin sichtbaren Server-1-Abweichungen eingegrenzt: Der öffentliche Root-Einstieg `index.html` war bisher bewusst unverändert geblieben, während Beta und Server 1 auf den geklonten aktuellen V8-Clients liefen.
- Dadurch konnte die Serverauswahl auf der Login-Seite aus einem älteren Root-Entry stammen, obwohl `beta.html` und `server1.html` korrekt waren.
- Fix:
  - neuer neutraler Release-Channel `launcher`: `js/features/account/launcher-release-channel.js`;
  - `index.html` auf den aktuellen Beta/V8-Client geklont;
  - einzig Release-Channel und Seitentitel unterscheiden den Launcher von `beta.html`.
- Routing-Verhalten des bestehenden v343-Owners:
  - vor Launch: Standard = Beta; gespeicherte Auswahl Server 1 wird nach `server1.html` geroutet;
  - ab Launch: Standard = Server 1;
  - Auswahl Server 1 auf der Login-Seite lädt explizit `server1.html`.
- Commits:
  - Launcher-Channel: `fe07d8a7c19b7b7b61c81786e471fc9cfeac3f47`
  - Root-Launcher: `72c180d06a03f6bf3152afc5adcb1284ffd21bc9`.
- Verifiziert:
  - `index.html` vs. `beta.html`: nur 2 erwartete Unterschiede (Release-Channel, Title);
  - `server1.html` vs. `beta.html`: nur 2 erwartete Unterschiede (Release-Channel, Title).


### Stabiler Server-1-Meilenstein · 01.10.2026

- Der aktuell funktionierende Stand nach Server-1-Paritätsfixes wurde als eigener Rücksprungpunkt gesichert.
- Branch: `stable-server1-2026-10-01`
- Basis: aktueller `main`-Stand nach erfolgreichem Test von Server 1 inklusive Login-/Serverrouting, Startseite, Harz-Dealer und Nebelschmied.
- Diesen Branch nicht für laufende Entwicklung verwenden; er dient ausschließlich als stabile Referenz/Rollback-Basis.


### Beta-first Release-Regel aktiv · 01.10.2026

- Verbindliche Release-Regel dokumentiert in `SERVER1_RELEASE_POLICY.md`.
- Standard ab jetzt: Änderungen zuerst nur auf Beta entwickeln und testen.
- Ohne ausdrückliche Freigabe von Thomas keine Änderungen an `server1.html`, dem Server-1-Release-Channel oder Server-1-spezifischen Release-/Datenbankpfaden.
- Gemeinsame Dateien nur dann ändern, wenn die Änderung bewusst auch Server 1 betreffen darf; sonst Beta-spezifisch bzw. per Release-Channel begrenzen.
- Promotion auf Server 1 erfolgt erst nach expliziter Freigabe nach dem Muster: getestet → Delta prüfen → übernehmen → Smoke-Test → neuen stabilen Meilenstein setzen.
- Stabile Referenz bleibt `stable-server1-2026-10-01`.
- Policy-Commit: `a07e7e5ec52aa716a02d64d2062a5038d06ccdcc`.


### Geplantes Beta-Update: Harz Lotto · 01.10.2026

- Umsetzung zunächst **nur auf Beta** gemäß `SERVER1_RELEASE_POLICY.md`.
- Kein Drüberpatchen: direkte Integration in die zuständigen kanonischen Dealer-/Lotto-Owner und serverautoritären Backend-Funktionen.
- Neuer zusätzlicher Tab beim Tütchen-Dealer: **Harz Lotto**.
- Grundregeln:
  - 1 Schein pro Account und Woche;
  - Einsatz: 25 Harz Taler;
  - 6 Zahlen aus 1–50;
  - Zahlen nach Bestätigung unveränderlich;
  - Tippschluss: Dienstag 18:00 Uhr;
  - Ziehung: Dienstag 19:00 Uhr;
  - Ziehung und Auswertung serverautoritär;
  - Gewinn wird nicht automatisch gebucht, sondern über **„Belohnung abholen“**.
- Jackpot:
  - gespeist aus den Einsätzen aller Spieler;
  - nicht ausgeschüttete Gewinnanteile werden vollständig in den Jackpot der nächsten Runde übernommen.
- Gewinnklassen:
  - 6 Richtige = 70 % des verfügbaren Pots;
  - 5 Richtige = 15 %;
  - 4 Richtige = 10 %;
  - 3 Richtige = 5 %;
  - mehrere Gewinner derselben Klasse teilen den jeweiligen Klassenanteil gleichmäßig.
- Geplante UI:
  - großer roter Kaugummiautomat im Grow-Legends-Stil als Hauptmotiv;
  - Anzeige von aktuellem Jackpot und Countdown/Phasenstatus;
  - Zahlenraster 1–50 mit maximal 6 markierbaren Zahlen;
  - Bestätigungsbutton für den 25-HT-Schein;
  - nach Ziehung Darstellung der 6 gezogenen Kugeln, eigene Zahlen, Trefferzahl und Gewinn;
  - Button **„Belohnung abholen“**;
  - Bereich für die letzte Ziehung.
- Geplante technische Struktur:
  - serverseitige Wochenrunde;
  - genau ein Ticket je `user_id + round_id`;
  - serverseitige Harz-Taler-Abbuchung beim Bestätigen;
  - serverseitige Ziehung von 6 eindeutigen Zahlen;
  - serverseitige Treffer-/Gewinnberechnung;
  - serverseitiger Claim mit Einmal-Schutz;
  - Carry-over der nicht vergebenen Klassenanteile in die nächste Runde.
- Offener Detailpunkt vor Implementierung: Zielwährung der Auszahlung. Empfehlung: Gewinne ebenfalls in Harz Talern auszahlen.

### Harz Lotto – Beta Bau Block 1 · 01.10.2026

- Umsetzung gemäß Beta-first-Regel ausschließlich auf **Beta/Public**; `server1.html` und `server1`-Schema unverändert.
- Neuer zusätzlicher Tab direkt im bestehenden Tütchen-Dealer:
  - **Tütchen**
  - **Harz Lotto**
- Neue Beta-Dateien:
  - `js/features/shop/beta/v8010-harz-lotto.js`
  - `v8010-harz-lotto.css`
- `beta.html` bindet JS/CSS jeweils genau einmal ein; Server 1 enthält weder Tab noch Includes.
- UI umgesetzt:
  - großer roter Kaugummi-/Kugelautomat im Grow-Legends-Stil;
  - aktueller Jackpot;
  - Countdown/Phasenstatus;
  - Zahlenraster 1–50;
  - exakt 6 Zahlen auswählbar;
  - bestätigter Schein danach unveränderlich;
  - Anzeige der letzten 6 gezogenen Kugeln;
  - eigene Zahlen, Treffer, Gewinn;
  - manueller Button **„Belohnung abholen“**;
  - Gewinnklassen 6/5/4/3 Richtige = 70/15/10/5 %.
- Serverautoritäres Backend in Supabase Public:
  - Tabellen:
    - `public.harz_lotto_rounds`
    - `public.harz_lotto_tickets`
  - RPCs:
    - `public.v8010_harz_lotto_state()`
    - `public.v8010_harz_lotto_buy_ticket(integer[])`
    - `public.v8010_harz_lotto_claim()`
  - interne Funktionen:
    - `private.v8010_lotto_round_id(...)`
    - `private.v8010_lotto_ensure_round(...)`
    - `private.v8010_lotto_draw_due_rounds()`
- Regeln serverseitig erzwungen:
  - 1 Schein je `user_id + round_id`;
  - Einsatz exakt 25 Harz-Taler;
  - 6 eindeutige Zahlen aus 1–50;
  - Tippschluss Dienstag 18:00 Uhr Europe/Berlin;
  - Ziehung Dienstag 19:00 Uhr Europe/Berlin;
  - Harz-Abzug atomar direkt aus `player_progress_trusted.harz_taler`;
  - Ziehung und Trefferermittlung nur serverseitig;
  - Gewinne werden erst beim manuellen Claim gutgeschrieben;
  - Claim mit Einmal-Schutz;
  - mehrere Gewinner einer Klasse teilen den Klassenpool;
  - nicht vergebene Klassenanteile und Rundungsreste werden als `carry_out` in die nächste Runde übernommen.
- Automatische Ziehung:
  - aktiver pg_cron Job `v8010_harz_lotto_draw`;
  - läuft minütlich, zieht aber nur tatsächlich fällige offene Runden;
  - dadurch bleibt 19:00 Uhr Europe/Berlin auch über Sommer-/Winterzeit korrekt.
- Erste reale Runde wurde erzeugt:
  - Round-ID: **2026-10-06**
  - Tippschluss: **06.10.2026 18:00 Europe/Berlin**
  - Ziehung: **06.10.2026 19:00 Europe/Berlin**
- Security:
  - Lotto-Tabellen haben RLS aktiv;
  - keine direkten Spielerrechte auf Tabellen;
  - Zugriff ausschließlich über authentifizierte RPCs;
  - Supabase Security Advisor zeigt für die Lotto-Tabellen nur den erwarteten INFO-Hinweis „RLS enabled, no policy“, da Tabellen bewusst RPC-only sind.
- QA:
  - Lotto-JS Syntax: grün;
  - Beta JS Include: 1×;
  - Beta CSS Include: 1×;
  - Server 1 JS/CSS/Tab: 0×;
  - Cron aktiv;
  - RPC EXECUTE nur für `authenticated`, `service_role`, `postgres`.
- GitHub Commits:
  - Client-Owner: `e9f7e8b361758e2030be4f7c67f3ed3639c3399b`
  - CSS: `84c269cdd606b1e10b91abe612b21322394752ef`
  - Beta-Integration: `7b973c717850dea6540b6fe270b3924a93c30287`
- Nächster sinnvoller Schritt:
  - manueller Beta-Test: Tab öffnen → 6 Zahlen wählen → 25-HT-Schein bestätigen → Reload prüfen;
  - danach ggf. Feinschliff der Automatenoptik und Test eines kontrollierten Ziehungs-/Claim-Szenarios.


### Harz Lotto – Straßenautomaten-Hintergrund · 01.10.2026

- Nutzerkorrektur umgesetzt: nicht der generierte runde CSS-Automat, sondern das zuvor erzeugte **rechteckige Straßenautomaten-Bild ohne eingebrannte Gewinnzahlen** wird als Hintergrund verwendet.
- Das Bild ist direkt in `v8010-harz-lotto.css` als eingebettetes JPEG hinterlegt; dadurch kein externer Bildhost und kein separates Asset-Ladeproblem.
- Alter künstlicher Automatenaufbau entfernt:
  - kein `v8010-machine-sign`;
  - keine `v8010-globe`;
  - keine `v8010-mini-balls`;
  - keine `v8010-machine-base` mehr im Renderer.
- Neuer `machineHtml()` rendert nur noch die Hintergrundszene plus dynamische Ausgabefach-Zone.
- Nach einer Ziehung werden die echten 6 serverseitig gezogenen Zahlen als HTML/CSS-Kugeln über dem Ausgabefach des Straßenautomaten dargestellt.
- Vor der ersten Ziehung bleibt das Fach ohne feste Zahlen und zeigt nur den Hinweis „Ziehung Dienstag · 19:00“.
- Mobile Positionierung des Ausgabefachs separat angepasst.
- Cache-Revision Beta auf `?v=8010lotto2` erhöht.
- Server 1 unverändert.
- QA:
  - JS Syntax grün;
  - Hintergrund-Datenbild vorhanden;
  - alter Automaten-DOM nicht mehr im JS;
  - neue `v8010-draw-chute` vorhanden;
  - Beta Cache-Revision 2× aktualisiert;
  - Server 1 enthält weiterhin 0× Lotto-Includes.
- Commits:
  - Hintergrund/CSS: `3a7e930b92bcad33d8bdde469f901badd68f3879`
  - dynamisches Ausgabefach: `9d67b057f3e8285ca15f12ae3788068e069933bf`
  - Cache-Revision: `a4b60add71687bbe06730c98d7cd4f63783b2c86`.


### Harz Lotto – visueller Ziehungs-Test · 02.10.2026
- Beta-only Anzeige-Test ergänzt.
- Im Harz-Lotto-Tab gibt es temporär den Button **„🎯 Test-Ziehung anzeigen“**.
- Rendert ausschließlich clientseitig die sechs Beispielzahlen **7, 12, 18, 24, 29, 33** im echten Ausgabefach-Overlay.
- Keine DB-/Harz-/Jackpot-/Ticket-/Ziehungsdaten werden verändert.
- Zweiter Klick blendet den Test wieder aus.
- Kleine Einlaufanimation ergänzt, damit die spätere echte Ziehung räumlich beurteilt werden kann.
- Asset-Cache auf `8010lotto3` erhöht.


### Harz Lotto – Hintergrundschärfe · 02.10.2026
- Verschwommenes Automatenbild auf Beta korrigiert.
- Gleiches vom Nutzer gelieferte Automatenmotiv neu als schärferes WebP-Asset eingebunden: `assets/v8010-harz-lotto-machine-hq.webp`.
- CSS verweist jetzt auf das HQ-Asset; Lotto-Logik/Test-Ziehung unverändert.
- Cache-Version auf `8010lotto4` erhöht.


### Harz Lotto – Originalbild + Ausgabefach · 02.10.2026
- Nutzer-Original aus `assets/file_00000000e27c8210b37148cc50f5d1af.png` eingebunden (~2,1 MB), statt der bisherigen 15-KB-Vorschau.
- Bild bleibt unverändert; keine neue Bildgenerierung.
- Dynamische Ziehungszahlen werden weiterhin per HTML/CSS gerendert.
- Ausgabefach-Koordinaten auf das Originalbild neu gesetzt: ca. 25,2 % links / 68,9 % oben / 43,6 % Breite / 9,4 % Höhe.
- Veraltete mobile Sonderpositionen entfernt, damit Desktop und Mobil dieselben bildrelativen Koordinaten verwenden.
- Cache-Version auf `8010lotto5` erhöht.


### Harz Lotto – native Originalbild-Darstellung · 02.10.2026
- Wegen weiterhin sichtbarer Unschärfe und grauer Fläche CSS-Background-Technik entfernt.
- Automatenbild wird jetzt als echtes `<img>` mit natürlichem Seitenverhältnis gerendert.
- `width:100%`, `height:auto`, kein Filter/Transform, `image-rendering:auto`.
- Bild-URL erhält eigenen Cache-Buster `?v=8010orig6`.
- Dynamische Ziehungszahlen bleiben als absolute Overlay-Ebene über dem Bild.
- Cache für Lotto JS/CSS auf `8010lotto6` erhöht.


### Harz Lotto – Kugelposition Feinschliff · 02.10.2026
- Ziehungszahlen im Ausgabefach minimal nach rechts/unten verschoben.
- `.v8010-draw-chute`: `left 25.2% → 26%`, `top 68.9% → 69.6%`.
- Wartehinweis entsprechend angepasst: `left 26%`, `top 71.8%`.
- Cache-Version auf `8010lotto7` erhöht.


### Harz Lotto – Kugelposition Feinschliff 2 · 02.10.2026
- Vorherige Verschiebung war visuell zu gering.
- Ziehungszahlen jetzt deutlicher nach rechts/unten gesetzt.
- `.v8010-draw-chute`: `left 26% → 27.2%`, `top 69.6% → 70.8%`.
- Wartehinweis entsprechend auf `left 27.2%`, `top 73%` verschoben.
- Cache-Version auf `8010lotto8` erhöht.


### Harz Lotto – Kugeln ins Ausgabefach · 02.10.2026
- Screenshot zeigte: horizontale Position nahezu korrekt, vertikal noch deutlich zu hoch.
- Ziehungskugeln deshalb gezielt ins schwarze Ausgabefach verschoben.
- `.v8010-draw-chute`: `left 27.2% → 27.6%`, `top 70.8% → 74.1%`.
- Wartehinweis entsprechend auf `left 27.6%`, `top 76.2%` gesetzt.
- Cache-Version auf `8010lotto9` erhöht.


### Harz Lotto – aktiven CSS-Owner korrigiert · 02.10.2026
- Ursache gefunden: `beta.html` lädt `v8010-harz-lotto-v2.css`, während vorher versehentlich `v8010-harz-lotto.css` geändert wurde.
- Deshalb waren die letzten Positionsänderungen im Client nicht sichtbar.
- Tatsächlich aktive Desktop- und Mobile-Regeln jetzt korrigiert.
- Ziehungskugeln: `left 27.6%`, `top 74.1%`, `width 43.6%`, `height 9.4%`.
- Wartehinweis: `left 27.6%`, `top 76.2%`, `width 43.6%`.
- Cache-Version auf `8010lotto10` erhöht.


### Harz Lotto – Hinterhof-Dealer + Grow-Legends-Style · 02.10.2026
- Gemeinsame Seite von **Tütchen-Dealer** auf **Hinterhof-Dealer** umbenannt.
- Statischer Seitentitel, Beschreibung und Tab-ARIA entsprechend angepasst.
- Navigation wird über den V8.010-Owner bei Navigation-Ready/Pageshow dynamisch auf **🏪 Hinterhof-Dealer** korrigiert, unabhängig davon welcher ältere Menu-Builder vorher gerendert hat.
- Harz-Lotto-UI optisch näher an Grow Legends gebracht:
  - dunkles Waldgrün statt generischem Schwarz/Rot;
  - Gold-/Messingkanten und dezente Händler-/RPG-Rahmen;
  - Jackpot als braun-goldene Händlerkarte;
  - Buttons grün-gold statt generischem Rot;
  - Zahlenfeld als gerahmte RPG-Fläche;
  - Karten/Status/Ergebnisflächen mit konsistenter Grow-Legends-Tiefe;
  - roter Lottoautomat bleibt bewusster Fokus.
- Aktiver CSS-Owner bleibt `v8010-harz-lotto-v2.css`.
- Cache-Version auf `8010lotto11` erhöht.


### Harz Lotto – finaler Navigation-/Style-Owner Fix · 02.10.2026
- Ursache für nicht sichtbare Umbenennung gefunden:
  - `v4148 complete-menu-authority` setzte `bagDealer` weiterhin auf **Tütchen-Dealer**.
  - `v4149 final-navigation-render-authority` setzte ihn ebenfalls weiterhin auf **Tütchen-Dealer**.
- Beide echten finalen Navigation-Owner direkt auf **🏪 Hinterhof-Dealer** geändert.
- Lotto-CSS war syntaktisch korrekt; zur Absicherung gegen spätere Legacy-CSS-Overrides jetzt zusätzlicher finaler Runtime-Theme-Owner im V8.010 Lotto-JS.
- Runtime-Theme nutzt hochspezifische `#bagDealer #v8010LottoPanel ... !important` Regeln für:
  - Waldgrün/Gold Karten;
  - Goldrahmen;
  - braun-goldenen Jackpot;
  - grün-goldene Buttons;
  - gerahmtes Zahlenfeld;
  - Grow-Legends Händler-/RPG-Tiefe.
- Cache-Version auf `8010lotto12` erhöht.


### Harz Lotto – Tab-Klick repariert · 02.10.2026
- Ursache: Syntaxfehler im echten Lotto-Owner `js/features/shop/beta/v8010-harz-lotto.js`.
- Fehler entstand durch den zuvor eingebauten Runtime-Theme-Block mit fehlerhaft escaped Backticks; dadurch wurde der komplette Owner nicht ausgeführt und der Tab-Klickhandler war tot.
- Runtime-Theme-Schicht vollständig entfernt; Styling bleibt ausschließlich im direkten CSS-Owner `v8010-harz-lotto-v2.css`.
- JS-Syntax nach Fix erfolgreich geprüft.
- Tab-Handler `data-v8010-tab` ist wieder aktiv.
- Cache-Version auf `8010lotto13` erhöht.


### Harz Lotto – Test-Ziehung entfernt · 02.10.2026
- Temporäre Test-Ziehung vollständig aus dem V8.010 Lotto-Owner entfernt.
- Entfernt: Preview-State, feste Testzahlen, Test-Button, Preview-Klickhandler, Preview-API und Preview-Animation.
- Automat zeigt nur noch echte Server-Ziehungszahlen; vor einer Ziehung bleibt der Wartehinweis sichtbar.
- JS-Syntax nach Cleanup geprüft: OK.
- Cache-Version auf `8010lotto14` erhöht.


### Harz Lotto – Jackpot in Automaten-Display · 02.10.2026
- Direkt im echten Lotto-Owner geändert, kein zusätzlicher Patch-Layer.
- Großen Jackpot-Block aus dem Header entfernt.
- Header kompakter gemacht.
- `Aktueller Jackpot`, HT-Wert und Tippschluss/Ziehungsstatus werden jetzt direkt im oberen Display des Automaten gerendert.
- Neues Overlay ist bildrelativ positioniert und Teil des aktiven CSS-Owners `v8010-harz-lotto-v2.css`.
- JS-Syntax geprüft: OK.
- Cache-Version auf `8010lotto15` erhöht.


### Harz Lotto – Automaten-Jackpot sichtbar gemacht · 02.10.2026
- Ursache für unsichtbares Jackpot-Overlay gefunden: aktiver CSS-Owner `v8010-harz-lotto-v2.css` war nach Preview-Cleanup strukturell beschädigt.
- Übrig gebliebener Keyframe-Rest `0%...100%...` samt überzähliger schließender Klammer direkt im Owner entfernt.
- Veraltete mobile `.v8010-jackpot`-Regel entfernt.
- Vollständige CSS-Klammerprüfung danach: Tiefe 0, keine negative Verschachtelung.
- Jackpot-Overlay bleibt direkt im oberen Automaten-Display.
- Cache-Version auf `8010lotto16` erhöht.


### Harz Lotto – Harzschmiede-Style + Jackpot Feinschliff · 02.10.2026
- Direkt in den aktiven Ownern geändert; kein zusätzlicher Patch-Layer.
- Automaten-Jackpot: `HT` durch ausgeschriebenes **Harz-Taler** ersetzt.
- Jackpot-Overlay kleiner und sauberer im oberen Automaten-Display ausgerichtet.
- Hinterhof-Dealer Tabs ohne Emoji-Icons; klare Texttabs **Tütchen** / **Harz Lotto**.
- Tab-Design an Harzschmiede V6.67 angelehnt: dunkler Sockel, kräftiger grüner Active-State, gold/grüne Konturen, uppercase.
- Harz-Lotto-Header kompakter und direkt an Harzschmiede-Titelbar angelehnt: Holzstruktur, Goldkante, beige/goldene Typografie.
- Rote Kugel aus dem Harz-Lotto-Titel entfernt.
- Unterzeile `1 Schein pro Woche · 6 aus 50 · Einsatz 25 Harz-Taler` verkleinert.
- Alte spätere Lotto-Override-Regeln für Tabs/Header aus dem aktiven CSS-Owner entfernt, damit nur der direkte Owner gilt.
- JS-Syntax geprüft: OK; CSS-Klammerprüfung: Tiefe 0.
- Cache-Version auf `8010lotto17` erhöht.


### Harz Lotto – kompakter Header + 3 Popup-Tabs · 02.10.2026
- Direkt in den echten Lotto-Ownern umgesetzt.
- Harz-Lotto-Titelblock nochmals flacher gemacht und Abstand Richtung obere Händler-Tabs reduziert.
- Die bisherigen großen Bereiche unter dem Automaten wurden aus dem normalen Seitenfluss entfernt.
- Direkt unter dem Automaten jetzt drei Tabs: **Schein**, **Gewinnklassen**, **Letzte Ziehung**.
- Jeder Tab öffnet ein Grow-Legends-Popup mit dem vollständigen bisherigen Inhalt.
- Schein-Popup: Runde, Status, Zahlenauswahl/Bestätigung und Einsatz.
- Gewinnklassen-Popup: 6/5/4/3 Richtige und Ausschüttungsanteile.
- Letzte-Ziehung-Popup: gezogene Zahlen, eigene Treffer, Gewinn, Carry und ggf. Abholbutton.
- Popup schließt über X, Hintergrund oder Escape.
- JS-Syntax geprüft: OK; CSS-Klammerprüfung: Tiefe 0.
- Cache-Version auf `8010lotto18` erhöht.


### Harz Lotto – gesamter Block höher an Händler-Tabs · 02.10.2026
- Direkt im aktiven CSS-Owner umgesetzt.
- Abstand unter den Haupttabs **Tütchen / Harz Lotto** deutlich reduziert.
- Kompletter `#v8010LottoPanel` nach oben an die Haupttabs gezogen.
- Desktop: `margin-top: -38px`.
- Mobil: `margin-top: -32px`.
- Interne Abstände Header → Automat → Info-Tabs von 16/9 px auf 7 px vereinheitlicht.
- Unterer Panel-Padding ebenfalls reduziert.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto19` erhöht.


### Harz Lotto – Schein kompakter · 02.10.2026
- Direkt im aktiven Lotto-CSS-Owner angepasst.
- Schein-Popup kompakter gemacht:
  - Zahlenraster weniger Padding und kleinere Abstände;
  - Zahlen etwas kleiner;
  - Runden-/Statusbereich kleiner;
  - Bestätigungs-Hinweis kompakter;
  - Auswahl-/Einsatzleiste enger;
  - Bestätigungsbutton niedriger.
- Mobile Raster bleibt 5-spaltig und wurde ebenfalls kompakter abgestimmt.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto20` erhöht.


### Harz Lotto – Schein nochmals kleiner · 02.10.2026
- Direkt im aktiven Lotto-CSS-Owner weiter verkleinert.
- Popup-Breite reduziert.
- Zahlenraster enger und mit weniger Padding.
- Zahlen-Schrift kleiner.
- Runden-/Statusbereich, Hinweis, Auswahlleiste und Button nochmals kompakter.
- Popup-Titel und Innenabstände reduziert.
- Mobile Zahlen ebenfalls kleiner.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto21` erhöht.


### Harz Lotto – Schein-Kugeln kleiner · 02.10.2026
- Direkt im aktiven Lotto-CSS-Owner geändert.
- Nur die Zahlenkugeln im Schein-Popup verkleinert.
- Desktop: feste Kugelgröße 28×28 px.
- Mobil: feste Kugelgröße 25×25 px.
- Schrift entsprechend kleiner gesetzt.
- Kugeln werden innerhalb der Rasterzellen zentriert; Abstand leicht erhöht.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto22` erhöht.


### Harz Lotto – Schein-Kugeln wieder etwas größer · 02.10.2026
- Direkt im aktiven Lotto-CSS-Owner angepasst.
- Desktop-Kugeln von 28×28 px auf **32×32 px** erhöht.
- Mobile Kugeln von 25×25 px auf **29×29 px** erhöht.
- Schrift proportional leicht vergrößert.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto23` erhöht.


### Harz Lotto – Schein + Kugeln etwas größer · 02.10.2026
- Direkt im aktiven Lotto-CSS-Owner angepasst.
- Schein-Popup leicht vergrößert: max. Breite 600 px.
- Popup-Titel etwas größer.
- Desktop-Kugeln von 32×32 px auf **35×35 px** erhöht.
- Mobile Kugeln von 29×29 px auf **32×32 px** erhöht.
- Rasterabstände leicht vergrößert, damit die Kugeln nicht gequetscht wirken.
- CSS-Struktur geprüft: Tiefe 0.
- Cache-Version auf `8010lotto24` erhöht.


### Server 1 – Harz Lotto/Hinterhof-Dealer Promotion · 02.10.2026
- Ausdrückliche Server-1-Freigabe erhalten.
- Getesteten Beta-Stand des Hinterhof-Dealers nach `server1.html` übernommen.
- Server-1-Seite enthält jetzt die Tabs **Tütchen** / **Harz Lotto**.
- Harz-Lotto-Panel und aktueller UI-Stand mit Schein-/Gewinnklassen-/Letzte-Ziehung-Popups übernommen.
- Aktiver Lotto-CSS-Owner auf Server 1 eingebunden: `v8010-harz-lotto-v2.css?v=8010lotto24`.
- Aktueller Lotto-JS-Owner auf Server 1 eingebunden: `js/features/shop/beta/v8010-harz-lotto.js?v=8010lotto18`.
- `GROW_RELEASE_CHANNEL='server1'` und Server-1-Release-Channel-Datei nicht verändert.
- Keine Datenbankmigration im Zuge dieser UI/Feature-Promotion durchgeführt.
- Stabiler Rücksprungpunkt `stable-server1-2026-10-01` bleibt unverändert.


### Server 1 – Harz Lotto Ladefehler behoben · 02.10.2026
- Supabase geprüft: `v8010_harz_lotto_state()` liefert für die authentifizierte Session korrekt `ok: true`.
- Ursache im Client-Owner: `load()` verlangte zusätzlich das globale `v073User`; auf Server 1 kann diese Client-Referenz beim Öffnen des Tabs noch nicht verfügbar sein.
- Unnötigen `uid()`-Client-Guard direkt aus `v8010-harz-lotto.js` entfernt.
- Authentifizierung bleibt serverautoritativ im RPC über `auth.uid()`.
- Beta und Server 1 auf JS-Cache `8010lotto25` erhöht.
- JS-Syntax geprüft: OK.


### Server 1 – Harz Lotto nativ im server1-Schema · 02.10.2026
- Root Cause für „Lotto konnte nicht geladen werden“ gefunden: Server 1 erstellt den Supabase-Client mit `db.schema='server1'`, die Lotto-RPCs/Tables existierten aber nur in `public`.
- Server-1-Lotto deshalb nativ und servergetrennt im Schema `server1` angelegt:
  - `server1.harz_lotto_rounds`
  - `server1.harz_lotto_tickets`
  - `server1.v8010_harz_lotto_state()`
  - `server1.v8010_harz_lotto_buy_ticket(integer[])`
  - `server1.v8010_harz_lotto_claim()`
  - interne `server1.v8010_lotto_*`-Owner.
- Harz-Abbuchung und Gewinn-Claims laufen ausschließlich über `server1.player_progress_trusted` und `server1.player_harz_events`.
- Beta/Public bleibt vollständig getrennt und unverändert.
- RLS auf Server-1-Lotto-Tabellen aktiviert; direkter Tabellenzugriff für anon/authenticated entzogen; Zugriff nur über RPC.
- Separater Cron `v8010_server1_harz_lotto_draw` läuft minütlich und zieht nur Server-1-Runden.
- Direkter Test mit authentifizierter Server-1-Session: `server1.v8010_harz_lotto_state()` liefert `ok: true`.

## FESTE ARCHITEKTUR-REGEL: Beta / Server 1 Trennung · Stand 02.10.2026

### Release-Channels
- **Beta** läuft mit `window.GROW_RELEASE_CHANNEL='beta'` bzw. dem Beta-Channel.
- **Server 1** läuft mit `window.GROW_RELEASE_CHANNEL='server1'`.
- `js/features/account/server1-release-channel.js` setzt Server 1 explizit auf `server1`.
- Diese Release-Channel-Trennung bei Promotionen niemals entfernen oder überschreiben.

### Supabase-Schema-Trennung
- Der zentrale Supabase-Client wählt das Schema abhängig vom aktiven Server:
  - **Beta → `public`**
  - **Server 1 → `server1`**
- Owner: `js/features/social/beta/v8009-a1-supabase-online-system.js`
- Dort gilt:
  - `v073SelectedServer==='server1' ? 'server1' : 'public'`
  - der Supabase-Client wird mit `db:{schema:v073DbSchema}` erstellt.
- Konsequenz: Ein `v073Db.rpc('xyz')` auf Server 1 sucht `server1.xyz`, auf Beta `public.xyz`.

### WICHTIG für neue serverautoritative Features
Wenn ein Feature serverautoritative Tabellen/RPCs benutzt, reicht es **nicht**, nur Beta-Code nach `server1.html` zu übernehmen.

Vor jeder Server-1-Promotion prüfen:

1. Gibt es die benötigten Tabellen im Schema `server1`?
2. Gibt es die benötigten RPCs/Funktionen im Schema `server1`?
3. Greifen Server-1-RPCs ausschließlich auf `server1.*`-Tabellen zu?
4. Greifen Beta-RPCs ausschließlich auf `public.*`-Tabellen zu?
5. Sind RLS/Rechte für beide Schemas korrekt?
6. Gibt es Cronjobs/Hintergrundjobs getrennt für beide Server, falls das Feature zeitgesteuert ist?
7. Gibt es irgendwo hart codierte `public.*`-Referenzen, obwohl Server 1 getrennt sein muss?
8. Erst danach UI/JS in `server1.html` aktivieren.

### Harz-/Progress-Trennung
- Beta:
  - `public.player_progress_trusted`
  - `public.player_harz_events`
- Server 1:
  - `server1.player_progress_trusted`
  - `server1.player_harz_events`
- Harz-Taler, Gold, XP und andere servergebundene Progress-Daten niemals zwischen beiden Schemas vermischen.

### Harz Lotto – Referenzbeispiel
Beta/Public:
- `public.harz_lotto_rounds`
- `public.harz_lotto_tickets`
- `public.v8010_harz_lotto_state()`
- `public.v8010_harz_lotto_buy_ticket(integer[])`
- `public.v8010_harz_lotto_claim()`
- interne Owner: `private.v8010_lotto_*`
- Cron: `v8010_harz_lotto_draw`

Server 1:
- `server1.harz_lotto_rounds`
- `server1.harz_lotto_tickets`
- `server1.v8010_harz_lotto_state()`
- `server1.v8010_harz_lotto_buy_ticket(integer[])`
- `server1.v8010_harz_lotto_claim()`
- interne Owner: `server1.v8010_lotto_*`
- Cron: `v8010_server1_harz_lotto_draw`

### Fehlerbild vom 02.10.2026 – Merken
Problem:
- Lotto-UI wurde von Beta nach Server 1 übernommen.
- Client war korrekt geladen.
- Server 1 zeigte trotzdem **„Lotto konnte nicht geladen werden“**.

Ursache:
- Server-1-Supabase-Client arbeitet im Schema `server1`.
- Lotto-RPCs und Tabellen existierten zunächst nur in `public`.
- Deshalb konnte derselbe RPC-Aufruf auf Server 1 nicht auf den Beta/Public-Owner zugreifen.

Lösung:
- Lotto vollständig nativ im `server1`-Schema angelegt.
- Keine Umleitung des Server-1-Clients auf `public`.
- Damit bleiben Daten, Währungen, Tickets und Ziehungen vollständig getrennt.

### Beta → Server 1 Promotion – feste Checkliste
Bei jeder ausdrücklichen Freigabe „auf Server 1 übernehmen“:

1. aktuellen Beta-Stand bestimmen;
2. UI-/JS-Differenz zu `server1.html` prüfen;
3. alle serverautoritativen RPCs/Tabellen des Features identifizieren;
4. prüfen, ob `server1`-Entsprechungen existieren;
5. fehlende Server-1-Owner nativ in `server1` anlegen;
6. Server-1-RPCs auf `server1.*` prüfen;
7. Cronjobs/Trigger getrennt prüfen;
8. erst dann `server1.html` aktualisieren;
9. JS-Syntax/CSS-Struktur prüfen;
10. Server-1-Smoke-Test durchführen;
11. `V8_CURRENT_STATUS.md` aktualisieren.

### Owner-Prinzip gilt auch bei Server-Trennung
- Immer den **echten finalen Owner** ändern.
- Keine zusätzlichen Runtime-Patches, wenn der Owner direkt editierbar ist.
- Beta-spezifische und Server-1-spezifische Datenowner sauber getrennt halten.
- Gemeinsame UI-Dateien dürfen geteilt werden, solange deren Datenzugriff schemaabhängig korrekt bleibt.

### Rücksprung / Schutz
- Stabiler Server-1-Rücksprungpunkt bleibt:
  - `stable-server1-2026-10-01`
- Ohne ausdrückliche Freigabe:
  - `server1.html` nicht ändern,
  - Server-1-DB-Owner nicht ändern,
  - Server-1-Release-Channel nicht ändern.


### Server 1 – automatische Öffnung entfernt / manuell geschlossen · 02.10.2026
- Automatische Zeitfreischaltung vollständig entfernt.
- Client-Owner `js/features/account/beta/v8009-s6-v343-server-selection-v7226.js`:
  - festen Startzeitpunkt `02.10.2026 16:00` entfernt;
  - Countdown entfernt;
  - automatische Umschaltung auf Server 1 entfernt;
  - Anzeige lautet jetzt **GESCHLOSSEN · Start nur manuell**;
  - Server 1 bleibt clientseitig geschlossen, bis bewusst neu freigegeben wird;
  - bestehender Vorabzugang für freigeschaltete Testkonten bleibt erhalten.
- Server-Owner:
  - `public.game_servers.opens_at` darf jetzt `NULL` sein;
  - `server1.opens_at = NULL` bedeutet ausdrücklich **manuell geschlossen / keine automatische Öffnung**;
  - `server1.harzruferin_opens_at = NULL`;
  - `public.gl_server_access_pre_request()` berücksichtigt diesen manuellen Closed-State.
- Normale Accounts erhalten bei geschlossenem Server `SERVER1_CLOSED`.
- Service-Role und bestehende Early-Access-Tester bleiben zugelassen.
- Cache-Bust für den Server-Auswahl-Owner in Beta und Server 1:
  - `v=7226manualclosed1`.
- Zukünftige Öffnung von Server 1 darf nur noch bewusst/manuell erfolgen; kein Datum allein öffnet den Server.


### Beta – einheitliche Header im Harzschmiede-Stil · 02.10.2026
- Nur Beta aktiviert; Server 1 bleibt unverändert.
- `beta.html` trägt dafür `body.v8011-beta-unified-headers`.
- Globaler finaler UI-Owner: `v8009-extracted-v4149-final-ui-authority-css.css`.
- Einheitlicher Stil basiert direkt auf der Harzschmiede:
  - Holzplanken-Hintergrund;
  - dunkler Holzrahmen;
  - goldene Innenkante;
  - beige/goldene Titeltypografie;
  - einheitliche Schatten und Radien.
- Beta-scoped Header-Autorität erfasst aktuell:
  - Charakter;
  - Growroom;
  - Quest & Schicht;
  - Dungeons;
  - Anbauturm;
  - Nebelkarawane;
  - Endgame;
  - Harz & Gold & Rahmen Dealer;
  - Hinterhof-Dealer / Harz Lotto;
  - PvP-Arena;
  - Gilde;
  - Hall of Haze;
  - Nebel-Crew;
  - Nebel-Post;
  - Admin.
- Bestehende Inhalte/Buttons/Stats der einzelnen Header bleiben erhalten; nur das gemeinsame visuelle Header-System wird vereinheitlicht.
- Charakter behält seinen stabilen Single-Paint-Header-Owner; nur dessen reservierter Headerstreifen wurde auf Holz/Gold umgestellt.
- CSS-Klammerprüfung: Tiefe 0.
- Beta-Cache für Final-UI-Owner: `v=8011headers1`.


### Beta – Charakter-Header leer / Heldenquartier-Titel wieder sichtbar · 02.10.2026
- Screenshot zeigte auf der Charakterseite einen leeren Holz-Header unter der Haupt-Topbar.
- Ursache: finaler Owner `v530-heldenquartier-static-root-header-css.css` blendete alle DOM-Titel aus und verließ sich auf SVG-`<text>`; Android WebView malte den Rahmen/Hintergrund, aber der Text konnte fehlen.
- Direkt im finalen `v530`-Owner behoben.
- Nur Beta bekommt den neuen sichtbaren Header über Body-Scope `v8011-beta-unified-headers`.
- Titel `HELDENQUARTIER` und Unterzeile werden wieder als echte DOM-Texte angezeigt.
- Optik auf Harzschmiede-Holz/Gold-Stil umgestellt.
- Server 1 bleibt durch den Beta-Scope unverändert.
- Beta-Cache: `v530headerfix1`.
- CSS-Struktur geprüft: Tiefe 0.


### Beta – Charakterseite Braun/Holz wie Header · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende finale Charakter-CSS-Owner direkt erweitert, Beta-scoped über `body.v8011-beta-unified-headers`.
- Schwarze/dunkelgrüne Flächen um Avatar und Equipment-Slots auf warmes Braun/Holz im Header-/Harzschmiede-Farbraum umgestellt.
- Equipment-Slot-Innenflächen bleiben bewusst dunkel, damit Item-Art und Raritätsfarben klar lesbar bleiben.
- Footer/Stats, Set-Zusammenfassung und Charakter-Tabs ebenfalls in Braun integriert.
- Inventar-Container, Inventar-Header, Auto-Ausrüstung, Sellbar und Filter optisch in denselben Braunton gezogen.
- Avatar, Items, Texte, Funktionen und Layout nicht verändert.
- Beta Cache:
  - `v532 ... ?v=8012brown1`
  - `v533 ... ?v=8012brown1`


### Beta – Charakterseite komplett in Header-Braun · 02.10.2026
- Nur Beta angepasst; Server 1 bleibt optisch unverändert.
- Bestehende Beta-Klasse `v8011-beta-unified-headers` als Scope verwendet.
- Direkte finale Owner geändert:
  - `v8009-extracted-v504-character-final-owner-css.css`
  - `v8009-extracted-v533-inventory-reference-css.css`
- Restliche dunkle Flächen der Charakterseite auf warmes Header-/Harzschmiede-Braun umgestellt:
  - Seiten-/Hero-Hintergrund
  - Equipment-Slots
  - unterer Charakterbereich
  - Lebenspunkte/Kampfkraft
  - Set-Zusammenfassung
  - Charakter-Tabs
  - kompletter Inventar-Container
  - Auto-Ausrüstung
  - Auswahl-/Verkaufsbereich
  - Filter
  - Item-Karten
  - Raritäts-/Level-Flächen
  - leere Slots
  - Inventar-Hinweis.
- Seltenheitsfarben, Itembilder und Funktionslogik bleiben unverändert.
- Cache Beta: `8013brown2`.
- CSS-Klammerprüfung für beide Owner: OK.


### Beta – Charakter/Inventar Hintergründe wieder dunkel · 02.10.2026
- Auf Wunsch die zuvor ergänzten warm-braunen Beta-Hintergründe wieder entfernt.
- Direkt aus den finalen Ownern entfernt:
  - `v8009-extracted-v532-heldenquartier-final-polish-css.css`
  - `v8009-extracted-v533-inventory-reference-css.css`
- Wieder aktiv ist damit der vorherige dunkle Schwarz-/Grün-Look für:
  - Avatar-/Slot-Umgebung,
  - Charakter-Footer,
  - Lebenspunkte/Kampfkraft,
  - Set-/Passive-Bereiche,
  - Charakter-Tabs,
  - Inventar-Flächen,
  - Auto-Ausrüstung,
  - Auswahl-/Verkaufsbereich,
  - Filter und Item-Karten.
- Der neue Harzschmiede-/Holz-Header bleibt bestehen.
- Nur Beta betroffen; `server1.html` wurde nicht geändert.
- Cache-Bust: `v=8014dark1`.
- CSS-Struktur geprüft: Tiefe 0.

### Beta – Character-Hintergründe auf vorherigen Dark-Look zurückgesetzt · 02.10.2026
- Nur Beta betroffen; Server 1 unverändert.
- Im echten Owner `v8009-extracted-v504-character-final-owner-css.css` den später angehängten Block
  `V8.013 BETA character full warm-brown owner` vollständig entfernt.
- Damit greifen wieder die vorherigen dunklen Character-Owner:
  - Character-Hintergrund dunkelgrün/schwarz;
  - Character-Stage dunkel;
  - Equipment-Slots dunkel;
  - HP/Kampfkraft dunkel;
  - Set-/Passive-Bereich dunkel;
  - Character-Tabs wieder dunkel.
- Keine Gegen-Overrides ergänzt; alter Override wurde direkt entfernt.
- Inventar-Owner nicht verändert, da dieser bereits den dunklen Look besitzt.
- CSS-Struktur geprüft: Tiefe 0.
- Beta-Cache für Character-Owner: `8013darkrestore1`.


### Beta – Attribute springt nicht mehr auf altes Design · 02.10.2026
- Ursache: Der Attribut-Tab-Owner `v459` rief beim Aktivieren nur `v4140PaintAttributes()` auf.
- Dadurch wurde zunächst der ältere Attribut-Render sichtbar; der finale `v537`-Referenzlook kam erst separat über einen späteren Klick-/Frame-Hook.
- Direkt im echten Tab-Refresh-Owner repariert:
  - nach `v4140PaintAttributes()` wird nun sofort `v537ApplyAttributes()` ausgeführt;
  - auch beim Wiederherstellen des gespeicherten aktiven Attribute-Tabs wird der finale Owner unmittelbar angewendet.
- Kein zusätzlicher Runtime-Patch angelegt.
- Nur Beta geändert; `server1.html` unangetastet.
- JS-Syntax geprüft: OK.
- Beta-Cache: `v459-character-hub.js?v=459attrfinal1`.


### Beta – Charakter braun + Qualitätsfarben kräftiger · 02.10.2026
- Nur Beta angepasst über `body.v8011-beta-unified-headers`; Server 1 bleibt optisch unverändert.
- Charakter-/Ausrüstungsflächen wieder warm braun gesetzt:
  - Hero-/Slot-Umgebung,
  - Footer/Stats,
  - Set-/Passive-Bereich,
  - Charakter-Tabs.
- Item-/Slot-Qualitätsfarben auf der Charakterseite deutlich verstärkt:
  - stärkere 2px Qualitätskante,
  - kräftigerer Glow je Seltenheit,
  - Prismatisch mit zusätzlichem Cyan/Pink-Glow.
- Echte Owner geändert:
  - `v8009-extracted-v532-heldenquartier-final-polish-css.css`
  - `v8009-extracted-v6108-item-quality-color-authority.css`
- Beta Cache:
  - `8012brown1`
  - `8012quality1`


### Beta – Charakter/Inventar braun + Slot-Qualitäten kräftiger · 02.10.2026
- Nur Beta.
- Braunen Grow-Legends/Harzschmiede-Hintergrund im Inventar wiederhergestellt.
- Character-Hero bleibt auf dem bereits aktiven braunen V8.012-Stand.
- Inventar-Card, Inventar-Header, Auto-Ausrüstung, Auswahlbereich, Filter und Hinweisflächen wieder braun abgestimmt.
- Itemkarten selbst bleiben dunkler, damit die Qualitätsfarben klar herausstechen.
- Qualitätsfarben der ausgerüsteten Slots deutlich verstärkt:
  - kräftigere Rahmenfarben,
  - stärkerer Glow je Qualität,
  - Slot-Rahmen übernimmt zusätzlich die tatsächliche Itemqualität.
- Server 1 unverändert, da alle neuen Regeln über `body.v8011-beta-unified-headers` auf Beta begrenzt sind.
- Cache: Inventory `8015brown2`, Quality `8015quality2`.


### Beta – Charakter braun + Qualitätsfarben kräftiger · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Braune Charakter-/Heldenquartier-Flächen entsprechend dem bestätigten Screenshot wiederhergestellt:
  - Bühne um Avatar und Slots;
  - unterer Charakterbereich;
  - Lebenspunkte/Kampfkraft;
  - Set-/Talentzeile;
  - Klassenpassive;
  - Charakter-Tabs.
- Inventar-Oberfläche ebenfalls wieder in die bestätigte Braun-/Holzpalette gesetzt:
  - Inventarrahmen/-kopf;
  - Auto-Ausrüstung;
  - Verkaufsleiste;
  - Filter.
- Ausgerüstete Item-Slots behalten dunkle Itemfläche, aber Qualitätsfarbe ist jetzt deutlich kräftiger:
  - 3px Qualitätsrahmen;
  - stärkerer farbiger Außenglow;
  - innerer Qualitätsakzent.
- Bestehenden Qualitäts-Owner direkt verstärkt; kein zusätzlicher Runtime-Painter.
- Beta Cache:
  - v514: `8013brown1`
  - v533: `8013brown1`
  - v6108: `8013quality2`
- CSS-Klammerprüfung: grün.


### Beta – Character oben wieder braun · 02.10.2026
- Ursache: der spätere Owner `v530-heldenquartier-static-root-header-css.css` überschrieb den oberen Avatar-/Slot-Bereich wieder dunkel.
- Direkt im finalen Beta-Owner korrigiert.
- `#v510HeroRoot` und `.v510-stage` nutzen auf Beta wieder den braunen Holz-/Header-Farbton.
- Server 1 bleibt unverändert, da die Änderung ausschließlich unter `body.v8011-beta-unified-headers` greift.
- Qualitätsfarben der Item-Slots bleiben separat erhalten und werden nicht durch den braunen Flächenhintergrund ersetzt.
- CSS-Struktur geprüft: Tiefe 0.
- Cache: `8011charbrown2`.


### Beta – Heldenquartier/Inventar Referenz wiederhergestellt · 02.10.2026
- Referenz: Screenshot mit braunem/holzfarbenem Heldenquartier und braunem Inventar.
- Nur Beta geändert; Server 1 unverändert.
- `v532-heldenquartier-final-polish`: braune Character-/Stats-/Tab-Flächen direkt im bestehenden finalen Owner auf Referenzton abgestimmt.
- `v533-inventory-reference`: zwei konkurrierende Beta-Braun-Blöcke zu **einem finalen Owner** konsolidiert.
- Inventarheader, Auto-Ausrüstung, Auswahlbereich, Filter und Rahmen wieder im braunen Holz-/Bronze-Look.
- `v6108-item-quality-color-authority`: bestehende Qualitätsfarben der ausgerüsteten Slots verstärkt; keine feste Einheitsfarbe, sondern weiterhin echte Raritätsfarbe.
- Cache Beta: `8015brown2` / `8015quality2`.
- CSS-Struktur aller drei Owner geprüft.


### Beta – Character-Hintergrund exakt auf braune Referenz zurück · 02.10.2026
- Nur Beta geändert; Server 1 unverändert.
- Root Cause: der später geladene `v530-heldenquartier-static-root-header-css.css` setzte `#v510HeroRoot` trotz braunem v514-Owner wieder auf dunkel.
- Direkt im finalen v530-Owner korrigiert:
  - kompletter Character-/Avatar-/Slot-Rahmen wieder braun/holz wie in der bestätigten Referenz.
  - Stage bleibt braun.
- Inventory-Owner v533 konsolidiert:
  - doppelten V8.013/V8.015-Beta-Farbblock entfernt;
  - Inventar-Kopf bleibt Holz/Braun;
  - Inventar-Arbeitsfläche, Auto-Equip, Sellbar und Filter wieder dunkelgrün/schwarz wie in der Referenz.
- Equipment-Slots bleiben innen dunkel für Lesbarkeit.
- Bereits verstärkte Qualitätsfarben bleiben unverändert aktiv über v6108.
- Cache:
  - v530 `8016brown3`
  - v533 `8016brown3`
  - v6108 `8016quality3`
- CSS-Klammerprüfung: OK.


### Beta – Illegales Buch / Pet-Sammelalbum Braun angepasst · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Grünen Hintergrund hinter den beiden Character-Karten **Illegales Buch** und **Pet-Sammelalbum** im bestehenden Heldenquartier-Owner auf warmes Braun/Holz umgestellt.
- Pet-Sammelalbum-Tab im bestehenden Pet-Album-Owner optisch an den braunen Illegales-Buch-Tab angeglichen:
  - brauner Verlauf;
  - goldbrauner Rahmen;
  - gleicher Radius/Schattencharakter;
  - Pfeil statt Grün jetzt gold/beige.
- Keine neue Patch-Datei angelegt; bestehende Owner direkt erweitert und Beta-scoped über `body.v8011-beta-unified-headers`.
- Geänderte Owner:
  - `v8009-extracted-v514-heldenquartier-reference-css.css`
  - `v8009-extracted-v686-pet-album-css.css`
- Beta Cache-Bust für beide: `8017bookbrown1`.
- Commits:
  - Book-Host Braun: `9d0cfbd49e4b734eef780dd0511cae7a56013d20`
  - Pet-Tab Braun: `5edacc2a52420cf232e8d8793cc4b4f4fa47e0ca`
  - Beta Cache: `0ccad653fac389d2c98b596df9f8af212b196a3f`


### Beta – Inventarflächen auf Braun/Holz umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehenden finalen Inventar-Owner direkt angepasst: `v8009-extracted-v533-inventory-reference-css.css`.
- Grüne/dunkelgrüne Inventarflächen auf denselben Braun-/Holz-Farbraum wie Heldenquartier und Buchbereich gezogen:
  - Inventar-Card/Hintergrund;
  - Auto-Ausrüstung;
  - Verkaufsleiste;
  - Filter;
  - Inventar-Hinweis.
- Itemkarten selbst bleiben bewusst dunkel, damit Seltenheits-/Qualitätsfarben weiterhin klar lesbar sind.
- Keine neue Patch-Datei oder zusätzlicher Runtime-Owner.
- Beta Cache-Bust: `8017invbrown1`.
- Commits:
  - Inventar Braun: `bedf083d72a05026dabc5248308ce7e7788413b1`
  - Beta Cache: `660946e7723cf933199e82bc90b579273e58f6ef`


### Beta – Avatar und Ausrüstung füllen ihre Rahmen besser · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Ziel: Avatar und ausgerüstete Itembilder sollen ihre vorhandenen Rahmen stärker ausfüllen, ohne über die Rahmen hinauszulaufen.
- Bestehende Owner direkt geändert:
  - `v8009-extracted-v514-heldenquartier-reference-css.css`
  - `v8009-extracted-v532-heldenquartier-final-polish-css.css`
- Ausgerüstete Item-Art vergrößert:
  - Desktop 55 → 60 px;
  - Mobile <=390 px 51 → 57 px;
  - sehr schmal <=350 px 47 → 53 px.
- Avatar-Endscale im finalen Polish-Owner von `0.955` auf `1.025` erhöht und leicht höher ausgerichtet (`object-position:center 27%`).
- Portrait-Frame bleibt `overflow:hidden`, dadurch bleibt der Avatar sauber innerhalb seines Rahmens.
- Keine neue Patch-Datei, kein zusätzlicher Runtime-Owner.
- Beta Cache-Bust: `8018framefill1`.
- Commits:
  - Slots größer: `fb121a06a4a809157408efcf2b6c0b3462d69131`
  - Avatar größer: `4f6c6dbe24f3d2daf2bc5ebfd1d9cce43980f216`
  - Beta Cache: `6fd1fd48eb961e42c3dadff774cef171958f1c64`


### Beta – Heldenquartier obere Komposition an Referenzbild angepasst · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Referenz: vom Nutzer bereitgestelltes Heldenquartier-Bild mit deutlich größerem Avatar-Rahmen und größeren Slot-Rahmen.
- Nicht nur die Bilder skaliert, sondern die bestehende Layout-Geometrie im echten Owner angepasst:
  - Slot-Spalten Desktop: 68 px → 76 px;
  - Slot-Höhe Desktop: 82 px → 94 px;
  - Item-Art Desktop: 60 px → 70 px;
  - Avatar-Rahmen Desktop: 221 px → 252 px Höhe;
  - Avatar-Art Desktop: ca. 248×224 px → 280×255 px;
  - Mobile-Werte proportional ebenfalls vergrößert.
- Ziel: Avatar und sechs Ausrüstungsslots füllen den oberen Heldenquartier-Rahmen ähnlich der Referenz aus, bleiben aber innerhalb der vorhandenen Rahmen.
- Bestehender Owner direkt geändert:
  - `v8009-extracted-v514-heldenquartier-reference-css.css`
- Keine neue Patch-Datei oder zusätzlicher Runtime-Owner.
- Beta Cache-Bust: `8019referencefit1`.
- Commits:
  - Layout/Frame-Größen: `9e2d13733bdd6957e4a65882df6041e4bb4fc428`
  - Beta Cache: `96babbc02335e90e91c67c91059d1ec4a5d004d8`


### Beta – Avatar-/Slot-Hintergrund an Braun/Holz angepasst · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Oberen Heldenquartier-Bereich hinter Avatar und ausgerüsteten Items farblich an den restlichen Braun-/Holz-Look angepasst.
- Bestehenden Owner direkt geändert: `v8009-extracted-v514-heldenquartier-reference-css.css`.
- Änderungen:
  - Stage-Hintergrund von grün/dunkelgrün auf warmes Braun/Holz;
  - Avatar-Glow von grün auf warmen Bernstein-/Braunton;
  - Slot-Innenflächen auf dunkles Braun;
  - innere Slot-Kontur warm/goldbraun;
  - dekorative Blattstempel deutlich zurückgenommen und entsättigt.
- Qualitäts-/Raritätsfarben der Items bleiben unverändert aktiv.
- Keine neue Patch-Datei, kein zusätzlicher Runtime-Owner.
- Beta Cache-Bust: `8020stagebrown1`.
- Commits:
  - CSS-Owner: `1dcd418ef92ca8a3d4c5517301258058ad19bea2`
  - Beta Cache: `e12508bb15faf70255f1bff4d4bb0a219c52af0a`


### Beta – Letzten Grün-Stich unter Avatar/Slots im finalen Owner entfernt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Ursache des verbliebenen Farbbruchs gefunden: der später geladene finale Owner `v8009-extracted-v532-heldenquartier-final-polish-css.css` überschrieb frühere Braun-Regeln wieder mit grün/dunkelgrünen Stage-/Portrait-Layern.
- Direkt im tatsächlichen letzten Owner korrigiert:
  - Stage-Verlauf auf Braun/Holz;
  - grünen Avatar-Glow auf warmen Braun-/Bernsteinton;
  - grünliche Randabdunklung des Portraits auf warmes Braun;
  - grünlichen Root-Inset-Schatten auf Braun;
  - Stage-Blattdeko deutlich zurückgenommen/entsättigt;
  - XP-Kasten von dunkelgrün auf dunkelbraun.
- Item-Raritätsfarben bleiben unverändert.
- Keine neue Patch-Datei, keine zusätzliche Render-Schicht.
- Beta Cache-Bust: `8021stagebrown2`.
- Commits:
  - finaler Owner: `238b73c7d07805e5ec6982775ca2b57d18234f92`
  - Beta Cache: `7e486f39cdd2f0066420a6d33e9110ee268cfdfb`


### Beta – Stage-Braun exakt an untere Charakterkarten angeglichen · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Nach kompletter Prüfung der CSS-Kaskade bestätigt: Nach `v532-heldenquartier-final-polish` übernimmt kein späterer Heldenquartier-Owner mehr die Stage-Fläche.
- Ursache war daher kein weiterer verdeckter Grün-Override mehr, sondern ein zu dunkler/kalter Braunton im finalen Owner selbst.
- Direkt in `v8009-extracted-v532-heldenquartier-final-polish-css.css` korrigiert:
  - Stage-Verlauf auf dieselbe warme Braun-Familie wie Buch/Stats darunter gezogen;
  - Portrait-Randabdunklung deutlich wärmer und schwächer gemacht;
  - keine neue CSS-Datei, kein zusätzlicher Owner.
- Beta Cache-Bust: `8022stagebrown3`.
- Commits:
  - finaler Braunabgleich: `98406c84b92b5600769da278ff7dcacdb18169ad`
  - Beta Cache: `5c0cb8e7d6807ca308868565135e2c9b05912f69`


### Beta – markierter Reststreifen unter Avatar/Slots final korrigiert · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Nutzer-Screenshot markierte konkret den unteren Stage-Streifen links/rechts neben Level/XP.
- Ursache exakt gefunden: Im selben finalen Owner `v8009-extracted-v532-heldenquartier-final-polish-css.css` existierte weiter unten noch ein späterer Beta-Block für `#v510HeroRoot > .v510-stage`.
- Dieser spätere Block überschieb die zuvor angepasste Stage wieder mit dem dunkleren Verlauf `#5a3217 → #40220f → #2d180c → #241208`.
- Direkt diesen tatsächlichen Last-Writer geändert auf die warme Braun-Familie der unteren Charakterkarten:
  - `#6b3b19 → #5d3216 → #4b2812 → #3b200e`.
- Kein neuer Owner, keine Patch-Datei, keine zusätzliche Render-Schicht.
- Beta Cache-Bust: `8023stagebrown4`.
- Commits:
  - Last-Writer-Fix: `b5d0bf22edeac4e83606010f6fc8c945cd01c9f0`
  - Beta Cache: `8cca970786ad22d14d400ad9a05b549901e943dc`


### Beta – Startseiten-Hintergrund auf Braun/Holz umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehenden Startseiten-Background-Owner direkt angepasst: `v8009-extracted-v690-world-wood-comic-css.css`.
- Geändert wurden ausschließlich die großen Hintergrundflächen:
  - `body:has(#world.active)`
  - `#world.active`
- Dunkelgrün/schwarz auf warmes Braun/Holz umgestellt.
- Bestehende Karten, Hero, Buttons und Feature-Flächen nicht verändert.
- Keine neue Patch-Datei, kein zusätzlicher Owner.
- Beta Cache-Bust: `8024worldbrown1`.
- Commits:
  - Background-Owner: `aa65ec94d49af540647a71451ae7420f17544faa`
  - Beta Cache: `551f106bc541b6b773d89f3648921f99ce832d83`


### Beta – Startseite + Charakter komplett auf einheitliche Braunpalette gezogen · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Ziel: Startseite und kompletter Charakterbereich sollen wie aus einem Guss wirken und nicht mehr zwischen Grün/Schwarz/Braun wechseln.
- Keine neuen Owner und keine Patch-Dateien angelegt; bestehende CSS-Owner direkt bearbeitet.
- Gemeinsame Palette:
  - dunkles Braun für Tiefen/Innenflächen;
  - Mittelbraun für Karten und Panels;
  - Holzbraun für Header/Rahmen;
  - Gold/Beige für Konturen und Texte.
- Funktionale Farben bewusst erhalten:
  - Item-/Material-Raritäten;
  - XP-/Fortschrittsfüllungen;
  - Talent-Verbindungen/Status;
  - Event-/Statusfarben, wo sie Information tragen.
- Startseite direkt angepasst in:
  - `v8009-extracted-v690-world-wood-comic-css.css`
  - `v8009-extracted-v6103-world-final-polish.css`
  - `v8009-extracted-v4170-lower-cards-polish.css`
- Charakter direkt angepasst in:
  - `v8009-extracted-v514-heldenquartier-reference-css.css`
  - `v8009-extracted-v530-heldenquartier-static-root-header-css.css`
  - `v8009-extracted-v532-heldenquartier-final-polish-css.css`
  - `v8009-extracted-v533-inventory-reference-css.css`
  - `v8009-extracted-v537-attribute-reference-css.css`
  - `v8009-extracted-v543-talents-mobile-tree-css.css`
  - `v8009-extracted-v546-materials-grow-legends-css.css`
  - `v8009-extracted-v548-materials-final-atmosphere-css.css`
- Damit wurden insbesondere grün/schwarze Karten-, Panel-, Tab-, Attribut-, Talent- und Material-Hintergründe auf Braun/Holz umgestellt.
- Gemeinsamer Beta Cache-Bust für alle betroffenen Dateien: `8025unibrown1`.
- Relevante Commits:
  - World Basis: `3ba2d6b464803feb089523cae5e16e5ae6e37f69`
  - World Final Polish: `4076b1d13e16267a27ca4c11eb6939d878bb659e`
  - World Lower Cards: `be9699b733e6384e51693bb13557be8739a5de38`
  - Character Basis: `59161c2c6aeb60625fb684a86b6ce953b4f068cc`
  - Character Header: `083a7fd7c720384d28e3707465c5a5f5365af233`
  - Character Final Polish: `f845b7f3eca3c7ca8ac0874cbed6f1ed20b52751`
  - Inventory: `9a48a5955f79e1b834e656d7f3eac32747a4c211`
  - Attributes: `566a519c19f452f181eebceda8e1bd17d2b6fb2c`
  - Talents: `2a6fe42c7e8e7aec7f7f2896468af6873051b6f9`
  - Materials Basis: `238643df0a92b5ac8b6279f7b166ef109eef5a54`
  - Materials Atmosphere: `03164801da19158684bf727aeee91918a8bb5064`
  - Beta Cache: `7e8e6405bf939760758ab88181815303921b2013`


### Beta – Pet-Sammelalbum komplett auf Braunpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Pet-Album-Owner direkt bearbeitet, keine neue Patch-Datei:
  - `v8009-extracted-v686-pet-album-css.css`
  - `v8009-extracted-v6113-pet-album-header-and-profile-css.css`
- Komplettes Pet-Sammelalbum auf die gemeinsame Braun-/Holzpalette von Startseite und Charakter gezogen:
  - Overlay-Hintergrund;
  - Summary-Karten;
  - Pet-Zeilen;
  - Pet-Bildrahmen;
  - Qualitäts-Slot-Innenflächen;
  - Reward-Boxen;
  - Info-Box;
  - Pager;
  - Footer;
  - öffentliche Pet-Profilkarte.
- Funktionale Qualitätsfarben der 6 Pet-Qualitäten bleiben erhalten.
- Header bleibt im bestehenden Holzstil.
- Beta Cache-Bust: `8026petbrown1`.
- Commits:
  - Pet-Album Braun: `80a322f9f29088d8029a3320f3ade0cd934d82ee`
  - Pet-Profil Braun: `83c51214bbe6549d9b644a52e1b2895467750c01`
  - Beta Cache: `bfb98a825b3b3b082a1d347a78117bd05443edf4`


### Beta – Gildenchat leicht kompakter gemacht · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Gildenchat-Owner direkt bearbeitet:
  - `css/features/guild/legacy/v4144-guild-chat-css.css`
  - `css/features/guild/legacy/vGuildChatCloseVisibilityFix.css`
- Gildenchat nur leicht verkleinert, nicht neu aufgebaut:
  - maximale Breite ca. 410 → 390 px;
  - Außenpadding leicht reduziert;
  - Header etwas flacher;
  - Close-Button leicht kleiner;
  - Chat-Bubbles kompakter;
  - Nachrichtenabstände reduziert;
  - Chattext minimal kleiner;
  - Eingabefeld und Senden-Button etwas kompakter.
- Mobile Viewport-/Close-Fix bleibt vollständig aktiv; dessen bestehende Werte wurden passend mitgezogen.
- Keine neue Patch-Datei, kein neuer Owner.
- Beta Cache-Bust: `8027guildchatcompact1`.
- Commits:
  - Chat-Basis: `42e443e7560fc492b0ad60feed889f015e3eb53d`
  - Viewport-/Close-Owner: `16629b07f0da5e28b3bd43b86297dffecd6e07d9`
  - Beta Cache: `2b6320cc5a6619f194ce98f1ad484fcc1c7002e6`


### Beta – Growroom Pflanzenbereich höher, Pflanzen oben nicht mehr abgeschnitten · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Nutzer-Screenshot zeigte abgeschnittene Pflanzengrafik am oberen Rand der Pflanzenkarten.
- Bestehende Growroom-Owner direkt angepasst:
  - `v8009-extracted-v493-growroom-mobile-css.css`
  - `v8009-extracted-v497-plant-art-economy-css.css`
- Gesamte Pflanzenfläche auf Mobile um ca. 30 px verlängert:
  - 560 → 590 px;
  - schmalere Mobile-Regel 535 → 565 px.
- Pflanzenkarten selbst ebenfalls leicht höher gemacht und mit mehr oberem Innenraum versehen:
  - Desktop 182 → 192 px;
  - <=760 px 166 → 176 px;
  - <=390 px 158 → 168 px.
- Pflanzen-Art-Bereich jeweils um 8 px erhöht, damit die Grafik oben vollständig sichtbar bleibt.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8028growheight1`.
- Commits:
  - Mobile Growroom-Höhe: `6cd398588924fd1d07a86fd6d112433175a3d1d1`
  - Pflanzen-Art-Höhe: `46cb4e49d7f8dd33e4db161a49357dac334bba1b`
  - Beta Cache: `c4143c3e87175488ef2d516f50c7b78aa147bb3a`
