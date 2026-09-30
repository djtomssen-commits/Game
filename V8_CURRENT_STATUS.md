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
- Aktuelle Unterphase: **V8.009-QUEST-SPRINT-1-CONSOLIDATION-PASS2-COMPLETED-START-CHAIN-NEXT**
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
