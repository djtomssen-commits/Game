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
