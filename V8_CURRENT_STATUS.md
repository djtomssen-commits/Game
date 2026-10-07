## 0. VERBINDLICHE ARCHITEKTURREGEL

- **Keine neuen Patch-Schichten über bestehende Renderer legen.**
- Änderungen immer direkt im aktuell kanonischen Owner/Renderer bzw. dessen bestehender CSS-/JS-Datei durchführen.
- Keine neuen `render...`-Wrapper, Monkey-Patches, nachträglichen `setTimeout`-/`requestAnimationFrame`-Painter oder `MutationObserver`, wenn derselbe Effekt direkt im Owner erzeugt werden kann.
- Wird ein alter Nachbearbeitungs-Wrapper durch die direkte Integration überflüssig, muss er im selben Durchgang entfernt bzw. aus der aktiven Beta-Ladekette genommen werden.
- Neue Hilfsfunktionen sind nur erlaubt, wenn sie reine gemeinsame Daten-/Utility-Logik sind und **keinen zweiten Render-Lifecycle** erzeugen.
- Ziel: pro Feature genau eine nachvollziehbare kanonische Render-/Lifecycle-Kette statt wieder hunderter übereinanderliegender Render-Fixes.

## 0.1 VERBINDLICHER DEBUG-/ACCOUNT-DIAGNOSE-ABLAUF

- Ab **03.10.2026** gilt bei jedem gemeldeten Spieler-/Account-Fehler: **Health- und Runtime-Diagnose direkt mit auslesen**, bevor nur nach Sichtbild oder am eigenen Account gefixt wird.
- Reihenfolge bei accountabhängigen Fehlern:
  1. aktuellen `main`-Stand prüfen;
  2. **Account-State-Health-Logs** des betroffenen Accounts/Servers prüfen;
  3. **Runtime-JavaScript-Fehlerlogs** des betroffenen Accounts/Servers prüfen;
  4. erst danach kanonischen Owner/Renderer bzw. Server-RPC untersuchen und direkt dort reparieren.
- Ziel: Unterschiede wie **„bei Tomssen funktioniert es, bei einem anderen Spieler nicht“** reproduzierbar über Accountzustand + Runtimefehler erklären.
- Account-State-Health-Check ist direkt in `js/features/account/beta/v8009-s1-v4139-account-switch-authority.js` integriert.
- Client-Funktionen:
  - `v4139AccountStateHealthCheck()`
  - `v4139AccountHealthDiagnostics()`
  - `v4139ReportAccountHealth()`
- Serverlogging Health:
  - RPC: `public.v8080_report_account_state_health(jsonb)`
  - Tabelle: `recovery_private.account_state_health_events`
  - speichert nur Diagnose-/Strukturdaten, **keinen kompletten Spielstand**;
  - identische Meldungen desselben Accounts werden innerhalb von 30 Minuten dedupliziert.
- Runtime-Error-Logger ist ebenfalls direkt in der bestehenden Account-Authority integriert.
- Erfasst authentifizierte `window.error`- und `unhandledrejection`-Fehler mit Seite, Datei, Zeile/Spalte, Server und Build.
- Serverlogging Runtime:
  - RPC: `public.v8082_report_runtime_error(jsonb)`
  - Tabelle: `recovery_private.runtime_client_errors`
  - kein kompletter Spielstand;
  - clientseitiges Sendelimit + serverseitige 30-Minuten-Deduplizierung.
- Bei einem neuen Fehlerbericht eines anderen Spielers soll der Diagnosepfad **nicht erst auf Nachfrage** erfolgen, sondern standardmäßig mitlaufen.
- Wenn Logs technisch nicht lesbar sind, das ausdrücklich sagen und danach direkt den kanonischen Codepfad prüfen; **keine Annahme als bestätigte Ursache darstellen**.
- Architekturregel bleibt bestehen: Diagnose darf keine neue Render-/Patch-Schicht erzeugen.
- Ab 03.10.2026 zusätzlich aktiv: **stiller Player-QA-Smoke-Check + Feature-Health-Marker**.
- Kein Toast, kein Popup, keine sichtbare Spieleranzeige; reine Hintergrunddiagnose.
- Read-only: der QA-Check verändert keine Gameplaywerte und führt keine Käufe/Kämpfe/Rewards aus.
- Serverseitige QA-Tabelle: `recovery_private.player_qa_snapshots`.
- Reporting-RPC: `public.v8083_report_player_qa(jsonb)`.
- Automatisch protokolliert:
  - Login-Smoke-Snapshot;
  - erster Seitenaufruf pro Session über `growlegends:navigation-open-v7119`;
  - Account-Owner/Social-Owner;
  - Charakter-/Klassenstatus;
  - Level;
  - Inventar/Material-Struktur;
  - Equipment-Struktur + belegte Slots;
  - Grow-/Dungeon-Struktur;
  - Runtime-Fehleranzahl der Session;
  - Screen vorhanden/aktiv/gerendert + Child-Count.
- Statuswerte: `ok`, `warn`, `fail`.
- Gleicher Trigger/Screen wird clientseitig nur einmal pro Session gemeldet; identische Server-Snapshots werden 30 Minuten dedupliziert.
- Client-Diagnose:
  - `v4139ReportPlayerQa(trigger, screen)`
  - `v4139PlayerQaDiagnostics()`
- Bei zukünftigen Spielerproblemen standardmäßig **Health + Runtime + Player-QA-Snapshot gemeinsam prüfen**.
- **Verbindlich ab 03.10.2026:** Bei *jedem* gemeldeten Funktionsfehler werden diese drei Diagnosequellen direkt mit ausgelesen und mit dem aktuellen `main` abgeglichen:
  1. `recovery_private.account_state_health_events`
  2. `recovery_private.runtime_client_errors`
  3. `recovery_private.player_qa_snapshots`
- Leere Tabellen bedeuten nur „noch kein Eintrag vorhanden“ und dürfen **nicht** als Beweis gewertet werden, dass kein Fehler existiert.
- Falls ein Diagnosezugriff technisch fehlschlägt, wird das ausdrücklich als unvollständige Diagnose behandelt und nicht als Entwarnung.


### Aktuelle accountabhängige Fehler/Fixes vom 03.10.2026

- Equipment-Item-Popup funktionierte auf einem Beta-Account, bei einem Freund jedoch nicht zuverlässig.
- Direkter kanonischer Equipment-Fix:
  - `js/features/character/beta/v8009-s8-v6102-character-equipment-scroll-fix.js`
  - alle gerenderten Equipment-Slots erhalten denselben Item-Detail-Klickpfad.
- Zusätzliche Ursache im bestehenden Popup-Owner gefunden:
  - `js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js`
  - Popup hing noch von der alten globalen Variable `slotLabels` ab;
  - behoben: eigene feste Slot-Metadaten im v123-Owner, unabhängig von Legacy-Initialisierungsreihenfolge.
- Letzter Popup-Core-Commit: `7efe123dde8d0a0043aea134f3727a69c187adc5`.
- Blüten-Dealer: Unique-Constraint-Fehler bei Gold-Belohnungen war account-/historienabhängig.
- Bestehende RPC `v7071_buy_grow_dealer` direkt repariert:
  - `source_ref` enthält jetzt zusätzlich die eindeutige Request-ID;
  - dadurch kollidieren spätere legitime Dealer-Aktionen nicht mehr mit älteren Events.

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


### Beta – Growroom komplett auf Braun/Holz wie Startseite + Charakter gezogen · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Growroom-Owner direkt bearbeitet, keine neue Patch-Datei:
  - `v8009-extracted-v492-growroom2-css.css`
  - `v8009-extracted-v6163-growroom-primary-tabs-css.css`
- Growroom-Grundfläche und nicht-funktionale grün/schwarze UI-Flächen auf dieselbe Braun-/Holzpalette wie Startseite und Charakter gezogen:
  - Screen-/Growroom-Hintergrund;
  - Topstats;
  - Panels und Panel-Header;
  - Samen-Karten;
  - Pflanzenkarten;
  - Stage/Details/Yield/Care/Perfect;
  - untere Karten/Upgrades;
  - Modal/Sortenbuch;
  - Home-Grow-/Buff-Karten;
  - primäre Growroom-Tabs und Inline-Container.
- Funktionale Statusfarben bleiben erhalten:
  - Pflege-/Ready-Zustände;
  - Qualitäts-/Raritätsfarben;
  - Fortschrittsbalken;
  - Warn-/Badge-Farben.
- Pflanzenraum-Bild selbst bleibt als Szene erhalten, nur die Abdunklung wurde warm-braun angepasst.
- Beta Cache-Bust: `8029growbrown1`.
- Commits:
  - Growroom Hauptpalette: `72f8d1212659d886c0216edcb4da817693e5faae`
  - Growroom Tabs: `729e197a3d1c957af68ee0ab865fd8cbc1c08c10`
  - Beta Cache: `3355745c7531bee4fcec0aeae3a751ae6124ace4`


### Beta – Growroom Topf-Rahmen und Pflanzenkarten nochmals höher · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Growroom-Owner direkt angepasst:
  - `v8009-extracted-v497-plant-art-economy-css.css`
  - `v8009-extracted-v493-growroom-mobile-css.css`
  - `v8009-extracted-v492-growroom2-css.css`
- Pflanzenkarten nochmals leicht erhöht:
  - Desktop 192 → 202 px;
  - <=760 px 176 → 186 px;
  - <=390 px 168 → 178 px.
- Gesamter Rahmen mit allen Töpfen/Pflanzen nochmals verlängert:
  - Mobile 590 → 620 px;
  - <=390 px 565 → 595 px;
  - Basis-Szene 740 → 770 px.
- Ziel: mehr Luft über den Pflanzen und keine abgeschnittenen oberen Pflanzenteile.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8030growheight2`.
- Commits:
  - Pflanzenkarten: `11da16089c50812541f3c1f9f92af01c79414e71`
  - Mobile Topf-Rahmen: `8d1a83ea7ea43eb8258174e3043cc609ed32a1be`
  - Basis-Szene: `d3cbd3dad1456fa8932227766f4c3d61052c0670`
  - Beta Cache: `2cb15d948f2c9872e0f963d9d498c8b0563bcaa7`


### Beta – Growroom Slot-Rahmen deutlich höher gegen abgeschnittene erste Pflanzenreihe · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Screenshot zeigte: nicht die einzelne Pflanzenkarte, sondern der gesamte Rahmen mit den 6 Pflanzen-Slots war zu niedrig; dadurch wurde die oberste Reihe oben beschnitten und der Pflegestatus der ersten Pflanze war nicht vollständig sichtbar.
- Bestehende Owner direkt angepasst:
  - `v8009-extracted-v493-growroom-mobile-css.css`
  - `v8009-extracted-v492-growroom2-css.css`
- Großen Pflanzen-/Topf-Rahmen deutlich erhöht:
  - Mobile 620 → 720 px;
  - <=390 px 595 → 700 px;
  - Basis-Szene 770 → 850 px.
- Einzelne Pflanzenkarten diesmal bewusst nicht weiter vergrößert.
- Ziel: alle 3 Pflanzenreihen vollständig im Rahmen, inklusive Pflegeanzeige oben.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8031growframe3`.
- Commits:
  - Mobile Slot-Rahmen: `602b147d468bd120e6efe19c829aab8fbf7bd551`
  - Basis-Szene: `75a00dffd43e55a7383ed69606b3bdff42cf273a`
  - Beta Cache: `36f8477152acd4231ce9be365898f26e2e9305f7`


### Beta – Quest & Schicht auf einheitliche Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Owner direkt bearbeitet:
  - `v8009-extracted-v386-quest-redesign-style.css`
  - `v8009-extracted-v4172-quest-rpg-style.css`
  - `v8009-extracted-v7137-shift-frame-css.css`
- Quest:
  - Seitenhintergrund;
  - Questgeber-/Panel-Hintergründe;
  - Tabs;
  - Quest-Karten;
  - Meta-/Reward-Boxen;
  - Elite-Info;
  - Refresh-Bereich
  auf Braun/Holz gezogen.
- Schicht:
  - Seitenkopf;
  - Quest/Schicht-Tabs;
  - Schicht-Hero;
  - Karten;
  - Stundenwahl;
  - Wirtschafts-/Statusboxen;
  - aktive Schicht;
  - Aufgabenbox;
  - Reward-Modal
  auf dieselbe Braunpalette gezogen.
- Funktionale Farben bleiben erhalten, z. B. Quest-Schwierigkeit, Belohnungen, Fortschritt, aktive/Ready-Status.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8032questshiftbrown1`.
- Commits:
  - Quest Basis: `b1f03c52ed1d57f3e952cf9132913a176f586f6c`
  - Quest RPG Polish: `abbe3485537777022ec8582990c259ac433b5b19`
  - Schicht: `77713e0ed9407faeefb2cb069a75d1a0423a6153`
  - Beta Cache: `b8757a4f47ccef1cc623386e3648de909c80606e`


### Beta – Dungeons auf einheitliche Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Dungeon-Owner direkt bearbeitet:
  - `css/features/dungeon/beta/v8009-d4-v251-modern-maps.css`
  - `css/features/dungeon/beta/v8009-d4-v261-detail.css`
  - `v8009-extracted-v599-clean-dungeon-css.css`
- Braun/Holz umgestellt:
  - Dungeon-Kartenrahmen;
  - Kartenkopf;
  - Ticket-/Infoflächen;
  - Dungeon-Auswahlkarten;
  - Footer;
  - aktueller Gegner/Reward-Flächen;
  - Detailkarten-Chrome;
  - Kampfkarte außen;
  - Kampfkopf;
  - Kampfempfehlung;
  - Kampflog;
  - Countdown-Fläche.
- Dungeon-Hintergrundbilder und Gegnerbilder bleiben unverändert.
- Funktionale Farben bleiben erhalten, darunter:
  - aktuelle/verfügbare/abgeschlossene Dungeon-Zustände;
  - Boss-/Raritätsfarben;
  - HP;
  - Kampf-FX und Schadensfarben.
- Änderungen sind mit `body.v8011-beta-unified-headers` auf Beta begrenzt.
- Keine neue Owner-Datei.
- Beta Cache-Bust: `8033dungeonbrown1`.
- Commits:
  - Map-Chrome: `84381ad15e3dfad0a5aca92a1e356157d9594e23`
  - Detail-Chrome: `c56fb552d86b89278c19e56b2114836af2b91aa1`
  - Kampf-Chrome: `597d39057d2256994e20dbeab636a79f42a28a14`
  - Beta Cache: `c7b74f52d5fe8c4989ebb79358d783ca6b5b0746`
- QA: alle drei geänderten CSS-Dateien Klammer-Tiefe 0.


### Beta – 20er-Dungeonübersicht im echten aktuellen Owner auf Braun umgestellt · 02.10.2026
- Screenshot zeigte, dass die 20er-Dungeonübersicht trotz vorheriger Dungeon-Farbumstellung noch grün/schwarz war.
- Ursache: Die 20er-Weltübersicht wird nicht mehr vom alten `v251`-Renderer/Style gerendert, sondern vom aktuellen `gl20/v4218`-Owner.
- Bestehenden aktuellen Owner direkt geändert:
  - `v8009-extracted-gl20-v4218-style.css`
- Auf Braun/Holz umgestellt:
  - kompletter Dungeon-World-Container;
  - Kopfbereich;
  - Versuch/Ticket-Fläche;
  - Mapframe;
  - 20er-Grid-Hintergrund;
  - Karten-Grundflächen;
  - Badge-Grundflächen;
  - Info-Bereich unter den Dungeon-Bildern;
  - Footer / Nächster Dungeon / Schlüsselstein.
- Dungeon-Bilder und funktionale Zustandsfarben (aktuell, abgeschlossen, verfügbar, gesperrt) bleiben erhalten.
- Kein neuer Owner, keine zusätzliche Patch-Datei; tatsächlichen aktuellen Owner direkt repariert.
- Nur Beta; Server 1 unverändert.
- Beta Cache-Bust: `8034dungeonworldbrown1`.
- Commits:
  - aktueller 20er-World-Owner: `8a5921811d796267cb78ec2f1e723cbd09efd568`
  - Beta Cache: `0cf2b5cfd386049ec5055c1ea1f91776631beb2e`


### Beta – Anbau-Turm Braunpalette + Ranglisten-Loader stabilisiert · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Anbau-Turm-Flächen im bestehenden finalen Visual-Owner direkt auf Braun/Holz gezogen:
  - `css/features/tower/beta/v6269-tower-complete-rework-css.css`
- Umgestellt wurden u. a.:
  - Run-HP-Leiste;
  - Lobby-Karte;
  - Ranglisten-Karten;
  - eigene Rangzeile/Infoflächen;
  - Prep-/Szenen-Chrome;
  - Event-/Spezialraum-Tags;
  - Result-/Checkpoint-Panels.
- Funktionale Farben (HP, Event, Boss, Kampfstatus, Mutationen etc.) bleiben erhalten.
- Ranglistenproblem im aktuellen Lobby-Controller direkt bearbeitet:
  - `js/features/tower/beta/v8009-t2-tower-lobby.js`
- Ursache/Schwachstelle:
  - Saison-Rangliste wartete vollständig auf den seitenweisen `profiles`-Scan;
  - bei langsamer/hängender Abfrage blieb sichtbar nur „Rangliste wird geladen …“.
- Neuer Ablauf im bestehenden Loader:
  - eigener Turmrekord wird sofort sichtbar dargestellt;
  - vollständige Server-Rangliste lädt parallel;
  - Server-Scan erhält 6,5-s-Zeitlimit;
  - bei Fehler/Timeout bleibt eigener Rekord sichtbar statt endlosem Ladezustand;
  - Fehler wird mit `[V8.035] Turm-Rangliste` geloggt.
- Keine neue Owner-Datei / kein neuer Ranking-Renderer.
- Beta Cache-Bust: `8035towerbrownrank1`.
- Commits:
  - Turm Braun: `2ac16c7b55445ced2f0d79a6c457734e26a57f13`
  - Ranglisten-Loader: `26a65ed91fce26a52162f5cd09d8bc6aa7c9880c`
  - Beta Cache: `3e5f082a49f685e7d80133c64964a4cf7d3bbc8a`
- QA: CSS und JS Klammer-/Klammerpaar-Tiefen jeweils 0.


### Beta – Anbau-Turm Lobby-Flackern durch unnötige Authority-Re-Renders behoben · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Beobachtung: Anbau-Turm-Lobby flackerte periodisch, ungefähr alle 10 Sekunden.
- Ursache im bestehenden Authority-Bridge:
  - jeder Server-Snapshot rief bei sichtbarem Turm pauschal `window.vTowerRender()` auf;
  - dadurch wurde die komplette Lobby neu aufgebaut, selbst wenn sich am Turmzustand nichts geändert hatte.
- Direkt repariert in:
  - `js/features/authority/beta/v8009-s1-v7072-server-tower-weekly-worldboss-bridge.js`
- Neuer Ablauf:
  - vor/nach `applyTower()` wird eine sichtbare Turm-State-Signatur verglichen;
  - kompletter `vTowerRender()` nur noch bei echter Turm-State-Änderung;
  - bei unverändertem Snapshot werden nur die vorhandenen Live-Painter (`v6345PaintTowerTimers`) aktualisiert;
  - HP-/Recovery-Countdown bleibt live, ohne kompletten DOM-Neuaufbau.
- Kein neuer Owner, kein zusätzlicher Renderer.
- Beta Cache-Bust: `8036towerflicker1`.
- Commits:
  - Authority-Fix: `c45b4760170c25bf28d7e83eb8b5b33ee1d38e0b`
  - Beta Cache: `8af70a53df7337325550213092da576b45fef175`


### Beta – Nebelkarawane Braun/Holz + Header kompakter · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktuellen Nebelkarawane-Owner direkt bearbeitet:
  - `v8009-extracted-v7248-nebelkarawane-redesign-css.css`
- Hintergrund und nicht-funktionale UI-Flächen auf die gemeinsame Braun-/Holzpalette gezogen:
  - kompletter Caravan-Screen;
  - Hero-Grundfläche und Overlay;
  - Wallet/Help;
  - Routen-Badges;
  - Stations-/Infoflächen;
  - Route-Karten;
  - Reward-Flächen;
  - Result-/Finish-Flächen;
  - Regeln/History.
- Großen Nebelkarawane-Header/Hero deutlich kompakter gemacht:
  - Desktop min-height 420 → 330 px;
  - Mobile min-height 440 → 350 px;
  - Toprow-Padding reduziert;
  - Title-Chip kleiner;
  - Titelgröße reduziert;
  - Untertitel kleiner;
  - Wallet/Help kleiner;
  - Route-Copy und Progress vertikal kompakter.
- Szenen-/Routenbilder sowie Risiko-/Reward-Farben bleiben erhalten.
- Kein neuer Owner, keine zusätzliche Patch-Datei.
- Beta Cache-Bust: `8037caravanbrowncompact1`.
- Commits:
  - Nebelkarawane Owner: `89c70577a958b62436832a541a4630605f81819a`
  - Beta Cache: `a294d4b27b7475ed55aec18e4c16915d98d7f8a0`


### Beta – Nebelkarawane echten aktiven v7253/v7254-Owner korrigiert · 02.10.2026
- Nutzer-Screenshot zeigte, dass die vorherige Änderung am `v7248`-Owner sichtbar nichts bewirkte.
- Ursache: Die aktuell sichtbare Route-Select-Ansicht wird durch den späteren `v7253-karawane-layout-fix.css` / `.v7254-route-select`-Block überschrieben.
- Genau diesen aktuellen Last-Writer direkt geändert:
  - `v8009-extracted-v7253-karawane-layout-fix.css`
- Sichtbare Route-Select-Ansicht jetzt auf Braun/Holz gezogen:
  - Route-Select-Hintergrund;
  - Hero-Fläche;
  - Hero-Stats;
  - Routen-Karten;
  - Preis-/Side-Chips.
- Header/Hero jetzt wirklich kompakter:
  - Desktop Route-Select 888 → 820 px;
  - Mobile 840 → 780 px;
  - Hero weiter nach oben;
  - Hero-Padding reduziert;
  - Titel 28 → 24 px auf Mobile;
  - Beschreibung/Stats kleiner;
  - Routen entsprechend weiter nach oben gezogen.
- Kein neuer Owner, tatsächlichen aktuellen Last-Writer direkt bearbeitet.
- Nur Beta; Server 1 unverändert.
- Beta Cache-Bust: `8038caravanactive1`.
- Commits:
  - aktiver Nebelkarawane-Owner: `adb15612a2036ccd1e9b973d28f9c3f90cbe3e18`
  - Beta Cache: `456f3d019709fbdc306ae33b6a818b23b0e3b4e2`


### Beta – Nebelkarawane Header nochmals kleiner · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktiven Last-Writer direkt angepasst:
  - `v8009-extracted-v7253-karawane-layout-fix.css`
- Header/Hero nochmals kompakter:
  - Route-Select Gesamthöhe Desktop 820 → 790 px;
  - Mobile 780 → 750 px;
  - Hero weiter nach oben;
  - Hero-Padding reduziert;
  - Titel Desktop kleiner;
  - Mobile Titel 24 → 21 px;
  - Beschreibung und Stats nochmals kleiner;
  - Routen entsprechend etwas weiter nach oben gezogen.
- Kein neuer Owner / keine Patch-Datei.
- Beta Cache-Bust: `8039caravanheader2`.
- Commits:
  - Header kleiner: `8a8707bef9afcf49622b545b3d13e3b5819b748a`
  - Beta Cache: `7ce62b0de5b91232fce1f86f09760a8ebf4a7746`


### Beta – Gildenchat-Fenster nochmals etwas kleiner · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Gildenchat-Owner direkt bearbeitet:
  - `css/features/guild/legacy/v4144-guild-chat-css.css`
  - `css/features/guild/legacy/vGuildChatCloseVisibilityFix.css`
- Fenster nochmals leicht verkleinert:
  - maximale Breite 390 → 370 px;
  - Mobile jetzt 94vw statt 100vw;
  - etwas weniger Außenpadding;
  - Header niedriger;
  - Close-Button kleiner;
  - Eingabefeld etwas niedriger;
  - Senden-Button etwas kompakter.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8040guildchatsmaller2`.
- Commits:
  - Chat-Basis: `5868cd5c23d857a68ab73f5a7d68f11aca005227`
  - Viewport-/Close-Owner: `0c6aec1cd73e8e53aeb4df8a0017ac96b4220eda`
  - Beta Cache: `eeba19a39276ae91716b51d91eb5e3810493ec32`


### Beta – Endgame-Hintergrund auf Braun/Holz umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehenden Endgame-Owner direkt bearbeitet:
  - `v8009-extracted-v457-endgame-style.css`
- Auf Braun/Holz umgestellt:
  - kompletter Endgame-Screen;
  - Hero-Grundfläche;
  - Summary-Karten;
  - Lock-Hinweise;
  - Riss-Karten;
  - Kampfkarte;
  - Log-/Reward-Flächen;
  - Welt-Link-Karte.
- Violette Nebelriss-/Endgame-Akzente bleiben als thematische Funktionsfarbe erhalten.
- Kampf-/HP-Farben bleiben unverändert.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8041endgamebrown1`.
- Commits:
  - Endgame Style: `e40562cdd2af09c2ac787779efadae768b551c95`
  - Beta Cache: `40801dd740114223879afa55438c92353949b092`


### Beta – Shop auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktuelle Shop-Owner direkt bearbeitet:
  - `v8009-extracted-v464-shop-reference-css.css`
  - `v8009-extracted-v475-shop-polish-css.css`
- Braun/Holz umgestellt:
  - kompletter Shop-Screen;
  - Hero-Grundfläche;
  - Ressourcen-Chips;
  - Händler-Tabs;
  - Shop-Karten;
  - Shop-Header;
  - Count-/Infoflächen;
  - Itemkarten-Grundfläche;
  - Vergleichs-/Same-Flächen;
  - Reroll-/Action-Bereich;
  - Hero-Shade im späteren v475-Last-Writer.
- Item-Raritätsfarben bleiben erhalten.
- Kauf-/Statusfarben bleiben erhalten.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8042shopbrown1`.
- Commits:
  - Shop Basis: `4bed8b2506fba6f874e52a4d588e3bb662632b94`
  - Hero Last-Writer: `2603ca08f8f521188e2c501ac2f3624b9f0fe50f`
  - Beta Cache: `c30d24f905a10c0eedecf9a8202d3ab98ba39cbb`


### Beta – Harzschmiede auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktive Harzschmiede-Owner direkt bearbeitet:
  - `v8009-extracted-v667-harzschmiede-tab-redesign.css`
  - `v8009-extracted-v490-harzschmiede-comic-ui.css`
- Braun/Holz umgestellt:
  - kompletter Forge-Screen;
  - Shell/Grundfläche;
  - Werkstatt-Hintergrund;
  - Tabs;
  - Panel-/View-Flächen;
  - Inventar-Karten-Grundfläche;
  - Auswahl-/Summary-Flächen;
  - Kosten-/Result-Flächen;
  - Regel-/Legenden-Flächen.
- Holz-Header bleibt erhalten und passt nun zum restlichen Braun-Look.
- Qualitäts-/Raritätsfarben sowie Prismatisch-/Craft-Effekte bleiben erhalten.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8043forgebrown1`.
- Commits:
  - aktiver Forge-Owner: `454b43a97826b0e1c6ab383b3f4651aa125e2cca`
  - Workshop-Unterbau: `74728adcb4e03a8f2be8fc0376743bea7b4be9e7`
  - Beta Cache: `0ec6e237e46f00f7b9e34035c4e08368e30917f1`


### Beta – Harz-, Gold- und Rahmen-Dealer auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende Dealer-Owner direkt bearbeitet:
  - `v8009-extracted-v567-harz-dealer-final-css.css`
  - `v8009-extracted-v569-harz-dealer-header-clean.css`
  - `v8009-extracted-v570-harz-dealer-npc-framing.css`
  - `v8009-extracted-v571-harz-dealer-hero-layout.css`
  - `v8009-extracted-v7117-dealer-hub-css.css`
  - `v8009-extracted-v7114-gold-shop-css.css`
  - `v8009-extracted-v7137-shift-frame-css.css`
- Gemeinsamer Dealer-Hub, Harz-Dealer, Goldlager und Avatar-Rahmen-Shop auf die bestehende Braun-/Holzpalette gezogen.
- Geändert wurden u. a.:
  - Seitenhintergründe;
  - Hub/Tab-Chrome;
  - Harz-Hero und Angebotskarten;
  - Goldlager-Header/Balances/Loading-Flächen;
  - Rahmen-Shop-Grundfläche, Guide, Karten und Preview-Untergrund.
- Rahmen-Effekte, Paket-/Preisfarben, Gold-Event und funktionale Aktiv-/Statusfarben bleiben erhalten.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8044dealersbrown1`.
- Relevante Commits:
  - Harz-Dealer Basis: `b7489aea75784d05ad427926d782c755555580d7`
  - Harz Header: `26258dc05993e8a0e5c215ceae51483670edaab3`
  - Harz NPC: `0d7621fe6d027e04c52afa72a1d7262894866622`
  - Harz Hero: `46b0484f21891313ed4a9aa94ce627893d7e9302`
  - Dealer-Hub: `d22331f55374e690978fc7b2b6eccb8747657f26`
  - Goldlager: `dba02815bb96f646ac0a347e912a8a1a5e8bb8aa`
  - Rahmen-Shop: `5f794b17a5a2ad7b4cde53c0f44a0e9d15fa3d9e`
  - Beta Cache: `4cc5abb5d98c34a1e9a9154835bad77646c11c4b`


### Beta – Dealer-Header + Tabs an einheitlichen Header-Stil angepasst · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Gemeinsamen Dealer-Header direkt im bestehenden Owner angepasst:
  - `v8009-extracted-v7117-dealer-hub-css.css`
- Header jetzt im selben Stil wie die übrigen vereinheitlichten Bereiche:
  - flacheres braunes Panel;
  - gleiche Braun-/Goldpalette;
  - Emblem-Rahmen braun statt grün;
  - Kicker beige/gold statt grün;
  - Titel größer/ruhiger mit Georgia und ohne schwarzen Textschatten;
  - kompaktere Abstände.
- Dealer-Tabs ebenfalls vereinheitlicht:
  - braune Grundfläche;
  - gold/beige Schrift;
  - identischer aktiver Braun-/Goldzustand für Harz, Gold und Rahmen.
- Rahmen-Tab-Active-State im bestehenden `v8009-extracted-v7137-shift-frame-css.css` an dieselbe Tab-Optik angepasst.
- Kein neuer Owner / keine Patch-Datei.
- Beta Cache-Bust: `8045dealerheader1`.
- Commits:
  - Dealer-Hub Header/Tabs: `f91858e083f4d9d34b8d7584a578f60b31045de3`
  - Rahmen-Tab Active: `08f4317ea537974f9072a8beb109eb2af0e28bfe`
  - Beta Cache: `abff215534620db18e2ee2d4c877d658694de36c`


### Beta – PvP-Arena auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktuelle PvP-Owner direkt bearbeitet:
  - `css/features/pvp/beta/v8009-s1-v549-pvp-grow-legends-css.css`
  - `css/features/pvp/beta/v8009-s1-v550-pvp-hero-cleanup-css.css`
  - `css/features/pvp/beta/v8009-s1-v551-pvp-header-final-css.css`
- Braun/Holz umgestellt:
  - kompletter PvP-Screen;
  - Arena-Shell;
  - Bud-/Ressourcenbox;
  - Liga-Karte;
  - Statuskarten;
  - Gegner-/Match-Chrome;
  - Regelbox;
  - Bud-Skala;
  - Hero-Abdunklung;
  - Header-Seitenembleme.
- Arena-/Hero-Bild bleibt erhalten.
- Liga-, Kampf-, HP-, Bud- und sonstige funktionale Statusfarben bleiben erhalten.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8046pvpbrown1`.
- Commits:
  - PvP Basis: `d4ac566724c7c679bcbeb81f3d612d153f6daf01`
  - Hero Last-Writer: `82056879c9ec3de9fdd197a268cc6c69b24b49a9`
  - Header Last-Writer: `e08c20c70f85dc077943a78a4ee25065d0a2b60e`
  - Beta Cache: `2d9a9191d605b6e4705fe74cb1c2cf314c0b0cd9`


### Beta – Gilde auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende aktuelle Gilden-Owner direkt bearbeitet:
  - `css/features/guild/legacy/v554-guild-reference-owner-css.css`
  - `css/features/guild/v7307-guildgrow-chestheader-final.css`
- Braun/Holz umgestellt:
  - kompletter Gilden-Screen;
  - Gilden-Hero;
  - Wappen-/Harzflächen;
  - Gildenfortschritt;
  - Tabs;
  - Upgrade-Karten;
  - Mitgliederkarten;
  - Admin-/Management-Flächen;
  - Gilden-Grow-/Wochentruhe-Boards;
  - Aufgaben- und Beitragskarten.
- Gildenbild/Wochentruhe-Artwork bleibt erhalten.
- Funktionale Farben bleiben erhalten:
  - Gildenlevel-Fortschritt;
  - Online/Offline;
  - Rollen;
  - Boss-/Krieg-/Statusfarben;
  - erledigte Aufgaben und Belohnungsstatus.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8047guildbrown1`.
- Commits:
  - Gildenübersicht: `15bd9353a7575a16bcd43638e2496ac0ead10317`
  - Gilden-Grow/Wochentruhe: `729c8bad356315e198a8a66b4ad857218c9fbfc3`
  - Beta Cache: `99098738c5d5d3ca6f662ed992cb7d5b139c56e6`


### Beta – Hall of Haze auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Bestehende aktuelle Hall-Owner direkt bearbeitet:
  - `v8009-extracted-v646-hall-template-css.css`
  - `v8009-extracted-v6145-hall-pagination-css.css`
  - `css/features/pvp/beta/v8009-s1-v326-hall-profile-css.css`
- Auf Braun/Holz umgestellt:
  - kompletter Hall-Hintergrund;
  - Hauptkarten und eigenes Profil;
  - Ranglistenzeilen;
  - Podium- und Pagination-Chrome;
  - Profil-Detailflächen.
- Hall-Artwork bleibt erhalten.
- Funktionale Farben bleiben erhalten, darunter Online-Status, aktive Tabs/Modi und DU-/Own-Markierungen.
- Kein neuer Owner, keine Patch-Datei; bestehende Owner direkt angepasst.
- Beta Cache-Bust: `8048hallbrown1`.
- Commits:
  - Hall Basis: `894a1b04fe5e06636ff8c18f0383a00b87b62472`
  - Rangliste/Pagination: `9532ada1168c888b79f089f8ebc60d583a268b75`
  - Profilflächen: `2064272df90f9eec1575f8b6350c9080b17d6158`
  - Beta Cache: `790eb5f0e86bf6543abdd047d53c9de6cb4f2492`


### Beta – Hall of Haze erste Listenzeile nicht mehr fälschlich hervorgehoben · 02.10.2026
- Ursache: alter Selektor `#v072HallRanking .v072-player-row:nth-child(1)` behandelte die erste sichtbare Zeile jeder Pagination-Seite wie einen Spitzenrang.
- Dadurch waren z. B. Rang 4 auf Seite 1 und Rang 24 auf Seite 2 grün/dunkelgrün hervorgehoben.
- Die drei alten seitenlokalen `nth-child(1..3)`-Rangfarben wurden aus dem bestehenden Hall-Owner entfernt.
- Podium/Rang 1–3 oben bleibt unverändert; normale Listenzeilen sind jetzt einheitlich braun.
- Eigene Spielerzeile/DU-Markierung bleibt als echter Sonderzustand erhalten.
- Kein neuer Patch/Owner.
- Beta Cache-Bust: `8049hallrowfix1`.
- Commits:
  - Hall Owner: `e20cc1c4575583f3b19bf505fc5c62c7a20a92e1`
  - Beta Cache: `97659f45c42883c89abaf0ac82cd81512ab315f2`


### Beta – Topbar auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Aktuellen autoritativen Topbar-Owner direkt bearbeitet:
  - `v8009-extracted-v372-authoritative-header-css.css`
- Braun/Holz umgestellt:
  - gesamter Topbar-Hintergrund;
  - Hamburger-Menü;
  - Gold-/Harz-/Dampf-Ressourcenkarten;
  - Plus-Buttons;
  - Mail/Freunde/Einstellungen-Buttons.
- Ressourcen-Icons und Wertefarben bleiben zur schnellen Unterscheidung erhalten.
- Logo-/Versionsfarben bleiben unverändert.
- Kein neuer Owner, keine Patch-Datei.
- Beta Cache-Bust: `8050topbarbrown1`.
- Commits:
  - Topbar Owner: `5c097238f3501f6a23e277a566cc2a930c25968a`
  - Beta Cache: `06679e15587e3f624569e2680c759c48872ffafc`


### Beta – Wochentruhe + Smaragd-Koloss auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Wochentruhe:
  - bestehenden Owner `v8009-extracted-v6239-weekly-chest-css.css` direkt bearbeitet;
  - Modal, Hero, Stats, Reward-Slots, Preview-/Aktivitätsflächen und Level-Guide auf Braun/Holz gezogen;
  - Truhen-Artwork, Fortschrittsbalken, Ready-Leuchten und Reward-/Raritätsfarben bleiben funktional erhalten.
- Smaragd-Koloss:
  - bestehende Owner direkt bearbeitet:
    - `v8009-extracted-v110-mystic-worldboss.css`
    - `v8009-extracted-v290-worldboss-balance-css.css`
    - `v8009-extracted-v327-worldboss-confirm-css.css`
    - `v8009-extracted-v6123-worldboss-slot-feinschliff-css.css`
  - Overlay-/Panel-Chrome, Stats, Log, Balancebox, Bestätigungsdialog und Home-Slot auf Braun/Holz gezogen;
  - Boss-Artwork, Smaragd-/Phasenfarben, HP, Treffer-/Kampf-FX und Live-/Ready-Zustände bleiben erhalten.
- Kein neuer Owner und keine zusätzliche Patch-Datei.
- Beta Cache-Bust: `8051chestkolossbrown1`.
- Commits:
  - Wochentruhe: `457d2cf63fdc4b16bb49711c69519b744ed47ac6`
  - Koloss Hauptscreen: `b499be38b48db54840717b9893f44d26899bc5a6`
  - Balancebox: `68055dcea7aad95959938bcd2650f759c1b218cc`
  - Bestätigungsdialog: `362510eed2c4480a90467029a4f86f5e6f7bbe98`
  - Home-Slot: `92809ff4ec1799531264489eac61b36779432d1c`
  - Beta Cache: `a9c1a69abcf494aa4050aa7c620073a0b66649be`


### Beta – Nebel Crew + Nebel Post auf Braun-/Holzpalette umgestellt · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Nebel Crew:
  - bestehenden Hauptowner `v8009-extracted-v673-nebel-crew-redesign.css` direkt bearbeitet;
  - Seitenhintergrund, Crew-Panel, Freundeskarten, Suche, Count-/Statusflächen und normale Aktionsflächen auf Braun/Holz gezogen;
  - Online-/Accept-/Remove- und sonstige Funktionsfarben bleiben erhalten.
- Nebel Post:
  - aktive Owner direkt bearbeitet:
    - `v8009-extracted-v6202-nebel-post-compact-final.css`
    - `v8009-extracted-v677-nebel-post-redesign.css`
  - Seitenhintergrund, Mail-Card, Listen-/Detailflächen, Formulare, Modal und Battlelog-Chrome auf Braun/Holz gezogen;
  - aktive Tabs, Senden-/Statusfarben und Kampfresultate bleiben funktional hervorgehoben.
- Kein neuer Owner, keine zusätzliche Patch-Datei.
- Beta Cache-Bust: `8052nebelcrewpostbrown1`.
- Commits:
  - Nebel Crew: `e16b76c6d71cd93d372ebeee0a786a33ce907d12`
  - Nebel Post finaler Owner: `cb903909b9f84de19847f402259537fd49bc42f9`
  - Nebel Post Basis: `f3614892402cc7c973bf1570de3494474086bd52`
  - Beta Cache: `68adcc6097b034e0a00863f779302e2cea4a4840`


### Beta – großer Rest-Grün-Audit: Belohnungsfenster/Popups auf Braun/Holz · 02.10.2026
- Nur Beta geändert; Server 1 bleibt unverändert.
- Direkte Owner-Anpassungen ohne neue Patch-Schicht.
- Umgestellt wurden:
  - allgemeine Server-/Grow-Auftrag-Belohnungsfenster und Reward-Zeilen;
  - Quest-Belohnungsfenster inkl. XP/Gold-/Loot-Karten;
  - täglicher Login inkl. Tageskarten und Reveal-Fläche;
  - Samen-Inventar-Popup inkl. Meta-Leiste, Karten und Source-Flächen;
  - Pet-Fund-/Belohnungs-Popup inkl. Drop-Guide, Karte und Reward-Fläche;
  - Ticket-Belohnungsbox.
- Funktionale Farben bleiben erhalten:
  - Raritäten;
  - Ready/Claim/Current;
  - positive Status-/Erfolgsfarben;
  - Gold/Harz/Gem/Scroll/Key-spezifische Akzente.
- Beta Cache-Bust: `8053rewardbrown1`.
- Commits:
  - Server Rewards: `56566ab316f7cd31d55c0e23401afbcf22deb74b`
  - Quest Reward: `49d8d72c31b1477f5f1abcbd38a0b314e0eaa4bd`
  - Daily Login: `ca2aef6cc651d07b0942aa9583210507d197e046`
  - Samen-Popup: `c76388050c475c4ddce515d8c17512032c4397c8`
  - Pet-Popup: `913b2f1930d74b3d6fe7f68d8a2c5c833a20cb75`
  - Ticket-Reward: `aa9dc57ff7c9de9d3035cd54ed703f9fab53f1c4`
  - Beta Cache: `b6f720a1a4572166a16f9399baad6628dd512832`


### Beta – dunkler Streifen unter Topbar + Header-Geist entfernt · 02.10.2026
- Screenshot zeigte zwischen autoritativer Topbar und brauner Startseite noch einen dunklen horizontalen Streifen.
- Zusätzlich war links im Streifen eine schmale alte UI-Geometrie sichtbar.
- Direkte Owner-Reparatur, keine neue Patch-Schicht:
  - `v8009-extracted-v690-world-wood-comic-css.css`: Braun-/Holzhintergrund jetzt auch auf `body > .app > main`/App-Canvas durchgezogen; Home-Margins oben auf 0 fixiert.
  - `v8009-extracted-v372-authoritative-header-css.css`: geschlossener `#v032MenuPanel` hat nun keinerlei sichtbare Geometrie mehr; beim Öffnen greifen weiterhin die bestehenden `.open/.show`-Zustände.
- Nur Beta-Cache aktualisiert: `8054homegapbrown1`.
- Server 1 unverändert.
- Commits:
  - Home-Canvas: `aa13a54ff2b6347de05b2b78c320f8a2aacd63ab`
  - Header-Ghost: `a22427d1118bc3fd229790fccd14cd3cba9e2149`
  - Beta Cache: `79d076ef49c8fd6c7312d51fcc554402cf5ee59c`


### Beta – echter Alt-Header-Rest entfernt + Topbar klar braun + Charakter-Check ausgeschrieben · 02.10.2026
- Neuer Screenshot bestätigte: über dem Wetter war weiterhin ein Stück des historischen `.app > header` sichtbar.
- Root Cause: alter globaler Header-Owner verwendete einen spezifischeren `body .app > header { display:block!important }`; der bisherige v372-Hide-Selektor war trotz späterer Ladereihenfolge zu schwach.
- Direkter Fix im autoritativen Owner `v8009-extracted-v372-authoritative-header-css.css`:
  - Legacy-`.app > header` jetzt mit höherer Spezifität vollständig auf 0 gesetzt;
  - Border/Shadow/Opacity/Pointer ebenfalls neutralisiert;
  - autoritativer `#v372TopbarShell` und `.v372-topbar` sichtbar wärmer/brauner gesetzt.
- Charakter-Check direkt im bestehenden Owner `v8009-extracted-v685-home-character-checklist-css.css` korrigiert:
  - keine Ellipsis mehr bei Aufgabenbezeichnungen;
  - `Talentpunkte`, `Skillpunkte`, `Ausrüstung verzaubert`, `Mit Steinen gesockelt`, `Aktive Klassenset-Boni` dürfen vollständig umbrechen;
  - rechte Statuswerte bleiben rechts lesbar.
- Keine neue Patch-Schicht. Server 1 unverändert.
- Beta Cache: `8055headerghost2` / `8055checkfull1`.
- Commits:
  - Header: `eb4e1e44eb73e460b7cf92d1ac37d2baa3e57807`
  - Charakter-Check: `90166dfeb5cf7400f72b377a6a0ec43dfb3e7926`
  - Beta Cache: `aaa0884883e091326b1eadcc1240a196f9a2c181`


### Item-Popup Folgefix 03.10.2026

- Vor dem Fix wurden alle drei Diagnosequellen gelesen:
  - Runtime-Errors: keine Einträge;
  - Account-State-Health: keine Einträge;
  - Player-QA-Snapshots: keine Einträge.
- Das wurde ausdrücklich **nicht** als Fehlerfreiheit interpretiert.
- Direkter Source-Audit im bestehenden Popup-Owner `js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js` zeigte noch harte Abhängigkeiten von optionalen Helpern:
  - `v030StatLabel`
  - `v030EffectLabel`
  - `v296MysticSpecialText`
- Diese Abhängigkeiten konnten den Popup-Aufbau bei bestimmten Laufzeit-/Load-Zuständen abbrechen.
- Direkter Owner-Fix ohne neue Patch-Schicht:
  - Gem-Stat fällt bei fehlendem Helper auf den vorhandenen Stat-Key zurück;
  - Enchant-Effekt fällt auf den vorhandenen Effekt-Key zurück;
  - mystischer Effekt fällt auf das vorhandene Label bzw. „Spezialeffekt“ zurück.
- Core-Fix Commit: `4fe31453d5a5cf1a649fb3f8cc6ce3e5734812c8`
- Cache-Reload:
  - Beta: `45c18e07ad69ab5f49a27af16e79cc0169884fbc`
  - Server 1: `1fa8805a4e8cb7258c1191d2016a19d10e7c2b09`
  - index: `1536f56e8eac72ad2250206789f0f48ca64c567f`


### Guide-System Komplettüberarbeitung 03.10.2026

- Nutzerwunsch: das globale `?`-Guide-System auf **allen Spielerseiten** aktualisieren; alte Texte an neue Features anpassen.
- Zusätzlich behoben: auf Seiten ohne eigenen Guide wurde bisher fälschlich der **Startseite-Guide** geöffnet.
- Kanonischer Guide-Owner direkt bearbeitet:
  - `js/features/guide/beta/v8009-s1-v6254-grow-guide.js`
- Kein neuer Patch-/Renderer-Layer angelegt.
- Alle öffentlichen Navigationsseiten besitzen jetzt einen eigenen aktuellen Guide:
  - Startseite
  - Charakter
  - Growroom
  - Quest & Schicht
  - Dungeons
  - Anbauturm
  - Nebelkarawane
  - Endgame / Nebelrisse
  - Händler
  - Harzschmiede
  - Harz, Gold & Rahmen
  - Hinterhof-Dealer
  - PvP-Arena
  - Gilde
  - Hall of Haze
  - Nebel-Crew
  - Nebel-Post
- Zusätzliche Kontexte mit eigenem Guide:
  - Goldlager
  - Illegales Buch
  - Pet Sammelalbum
  - Freund werben
  - Smaragd-Koloss
- Growroom behält zusätzlich seinen bestehenden **kontextsensitiven Tab-Guide** für Growroom, Blütenlager, Blüten-Dealer, Genetik und Grow-Aufträge.
- `currentPage()` fällt bei unbekannten/administrativen Seiten **nicht mehr auf `world` zurück**.
- Das globale `?` wird nur angezeigt, wenn der aktuell sichtbare Kontext tatsächlich einen Guide besitzt.
- Klick auf das globale `?` öffnet nur noch den Guide des aktuellen Kontexts; kein stiller Startseite-Fallback mehr.
- Guide-Coverage gegen die öffentliche Navigation geprüft: **17/17 öffentliche Seiten abgedeckt, 0 fehlend**.
- Core-Commit: `c025f8b95c106e5897f68229d510b93cf15c8ae4`
- Cache-Reload:
  - Beta: `c881d5feb926c238916dc5eb45469bca1f87a5a8`
  - Server 1: `78a96d923cba2c1cc4b7c38781b2309bde347ec9`
  - index: `1ca8ddef4912d42312b8fee96bcd750b002181e4`


### Beta – Dungeon-Button grün + echtes Harzschmiede-Bild im Startseiten-Slot · 03.10.2026
- Nutzerwunsch auf der Startseite direkt im bestehenden UI umgesetzt; **kein neues Bild generiert** und keine neue Patch-/Renderer-Schicht angelegt.
- Dungeon:
  - bestehende Sonderregel im aktiven Home-Comic-Owner `v8009-extracted-v523-approved-home-comic-css.css` geändert;
  - `Zum Dungeon` verwendet jetzt dieselbe grüne Button-Palette wie die übrigen Hauptaktionen.
- Harzschmiede:
  - bestehender Home-Slot-Owner `v8009-extracted-vforge-home-card-css.css` direkt bearbeitet;
  - statt der bisherigen CSS-/Emoji-Platzhaltergrafik wird das bereits im Spiel vorhandene echte Schmiede-Artwork `assets/v7195-base64/f43016c6d1fa99c290aa.webp` verwendet;
  - künstliche Amboss/Hammer/Spark-Overlays im Slot sind ausgeblendet.
- Nur Beta-Cache aktualisiert:
  - Home-Comic: `8062dungeongreen1`
  - Forge-Slot: `8062forgeart1`
- Server 1 unverändert.
- Commits:
  - Dungeon-Button: `efb8956ea220720f74a10abed055f4815d236c74`
  - Harzschmiede-Slot: `f4a72c340953c98e635caef4b99630342753a5c9`
  - Beta Cache: `74d3e972179ce152c2befd7adf430639e7bca854`


### Startseite Folgefix – Dungeon-Last-Writer + Harzschmiede echtes Bild · 03.10.2026
- Nutzer-Screenshot zeigte nach dem ersten Versuch: Dungeon-Button weiterhin orange und Harzschmiede-Slot weiterhin mit alter Platzhaltergrafik.
- Diagnosequellen vor dem Folgefix geprüft:
  - `recovery_private.account_state_health_events`: aktuelle Beta-Login-Einträge vorhanden; kein Hinweis auf diesen visuellen Fehler.
  - `recovery_private.runtime_client_errors`: keine aktuellen Einträge.
  - `recovery_private.player_qa_snapshots`: Startseite/World für aktuelle Beta-Sessions `ok`, keine Runtimefehler; der Fehler war damit ein CSS-/Asset-Owner-Thema und kein Account-State-Fehler.
- Root Cause Dungeon:
  - der zuvor geänderte v523-Owner war **nicht** der letzte Gewinner;
  - `v8009-extracted-v524-approved-home-strong-css.css` setzte danach mit höherer Spezifität `#world.active .v366-card.dungeon .v366-go` wieder orange.
- Direkter Fix:
  - v524-Regel selbst auf dieselbe grüne Palette wie die übrigen Home-Aktionsbuttons geändert;
  - keine neue Override-/Patch-Schicht angelegt.
- Root Cause Harzschmiede:
  - Home-Slot wurde im kanonischen Home-Renderer weiterhin mit CSS-/Emoji-Platzhaltern aufgebaut;
  - zusätzlich wurden manche Einstiege mit alten, ungeversionierten Asset-URLs geladen.
- Direkter Fix im kanonischen Owner:
  - `js/features/home/beta/v8009-home-renderer.js` rendert im Harzschmiede-Slot jetzt ein echtes `<img>` mit dem bereits vorhandenen Spiel-Asset
    `assets/v7195-base64/f43016c6d1fa99c290aa.webp`;
  - `v8009-extracted-vforge-home-card-css.css` passt dieses Bild per `object-fit: cover` in den Slot ein;
  - keine neue Bilddatei erzeugt.
- Cache-Refresh auf allen drei aktiven HTML-Einstiegen durchgeführt, damit Android/WebView/Browser nicht weiter die alte Home-CSS bzw. den alten Renderer verwenden:
  - v524: `8063dungeongreen2`
  - Forge/Home-Renderer: `8063forgeimg2`
- Commits:
  - echter Dungeon-Last-Writer: `bb6eadd430aa5b04891c8aaf6793c07bc44af9ae`
  - kanonischer Home-Renderer: `624beb0c7fe2d36f4e26bfe95c1e55346aa28761`
  - Forge-Slot-CSS: `ff98fcdfb4c91953705260d6df367a796d35631f`
  - Beta Cache: `8d53d1a8989ceae79092a6f164d05e2db2f5e2cd`
  - index Cache: `410574e4a16447711f745473b306434d3777b995`
  - Server1 Cache: `21e8b0dc32c056e5ad6854d214e344329f8aaa65`


### Gildenchat – Topbar-Offset / Zurück-Pfeil wieder sichtbar · 03.10.2026
- Nutzer-Screenshot zeigte: Gildenchat begann unter der globalen Topbar, oberer Bereich war abgeschnitten; der Zurück-/Schließen-Pfeil war dadurch nicht sichtbar.
- Vor dem Fix Diagnosequellen geprüft:
  - Account-State-Health: aktueller Beta-Login `ok`;
  - Player-QA: aktuelle `world`-/`character`-Snapshots `ok`, keine Session-Runtimefehler;
  - Runtime-Error-Tabelle aktuell leer.
- Root Cause:
  - der aktive Viewport-Stabilisierer im kanonischen Gildenchat-Owner `js/features/guild/beta/v8008-c25-guildchat-owner.js` berechnete den oberen Offset nur aus `.app > header`;
  - dieser Legacy-Header ist nach der Topbar-Bereinigung absichtlich auf 0 gesetzt;
  - die tatsächlich sichtbare autoritative Topbar ist `#v372TopbarShell` / `.v372-topbar`;
  - dadurch wurde der Chat praktisch bei `top: 6px` gestartet und lag hinter der sichtbaren Topbar.
- Direkter Owner-Fix, keine neue Patch-Schicht:
  - Viewport-Berechnung verwendet jetzt zuerst `#v372TopbarShell`, danach `.v372-topbar`, und nur als Fallback den alten `.app > header`;
  - Chat beginnt damit unterhalb der echten Topbar;
  - vorhandener Chat-Header und Zurück-/Schließen-Pfeil bleiben innerhalb des sichtbaren Viewports.
- Cache-Refresh:
  - `v8008-c25-guildchat-owner.js?v=8064chatviewport1`
  - in Beta, index und Server1 aktualisiert.
- Commits:
  - Core: `b5c5d15e02f43ca2b740aea5df52282f76afa27f`
  - Beta: `0a58924f85e73f4ecdf30adbbd992466e45286d9`
  - index: `d20a31c280ee91bf5c7f090ceaeb20103b5c973b`
  - Server1: `60a81ac7b4c23a7e447a88d7f553a199f45eef7c`


### Universelles Item-Vergleichs-Popup · 03.10.2026
- Nutzerwunsch: beim Antippen eines Items überall einen direkten Vergleich mit dem aktuell ausgerüsteten Item desselben Slots anzeigen.
- Kanonischer Owner:
  - `js/features/items/beta/v8009-s2-v4103-item-ui-consistency.js`
  - bestehender Character-Detail-Owner routet ausgerüstete Slots in denselben Vergleich:
    `js/features/character/beta/v8009-s7-v123-character-equipment-redesign.js`
- Aufbau des Popups auf Mobile bewusst **untereinander**:
  1. aktuell angelegtes Item;
  2. angeklicktes Item.
- Grundwerte werden separat verglichen:
  - grünes `↑` + Differenz = besser;
  - rotes `↓` + Differenz = schlechter;
  - graues `=` = gleich.
- Edelstein und VZ-Rolle werden **nicht in die Grundwert-Pfeile eingerechnet**, sondern jeweils als eigene Blöcke unter den Grundwerten angezeigt.
- Set-/Spezial-/Prismatisch-Informationen bleiben als eigener Zusatzblock sichtbar.
- Wenn kein Item im passenden Slot angelegt ist, zeigt der obere Bereich `Kein Item ausgerüstet`; das angeklickte Item wird gegen 0 verglichen.
- Zentrale Item-Registry ergänzt, damit gerenderte/dekorierte Item-Flächen ihr echtes Itemobjekt an das Vergleichs-Popup übergeben.
- Klick-Abdeckung:
  - Inventar;
  - Händler/Shop;
  - ausgerüstete Items;
  - Quest-Fund;
  - Dungeon-Fund;
  - aktuelle V4103-Itemkarten;
  - ältere Reward-Karten werden zusätzlich über Titel gegen Inventar/Equipment/Shop aufgelöst.
- Aktionsbuttons innerhalb der Itemkarte bleiben unangetastet; der Vergleich öffnet nur beim normalen Item-Antippen.
- CSS direkt im bestehenden Item-UI-Owner erweitert:
  - `v8009-extracted-v4103-item-ui-css.css`
- Cache-Refresh in Beta, index und Server1:
  - `8065itemcompare1`
- Commits:
  - Vergleichs-Core: `9d8b398b165ee4d39ccb456f447ebaecd2044837`
  - Legacy-Reward-Auflösung: `9839e915e97db0f807c912a3133961bad6a68660`
  - Popup-CSS: `5b20553b5b59a305a37b9f6f57cfb93f79640b78`
  - Equipment-Routing: `af1e0bd25c02493a5de78346cc894f1b4bfce78c`
  - Beta Cache: `b8f340269bd1018ea17b979a9410bc8d64591c50`
  - index Cache: `8e96d34bc894726b4d58d7e5d8c28c7480a59d66`
  - Server1 Cache: `5bc6325ba976f1a17b84ecc6eb857a8a11046ddc`


### Itemkurve V4 – komplette Raritätskurve abgeflacht · 03.10.2026
- Nutzerfeedback: Mystische Items blieben zu viele Level lang stärker als neuere Legendär-/Prismatisch-Drops.
- Vollständige Prüfung der Raritätskurve durchgeführt: Grau → Grün → Blau → Episch → Legendär → Prismatisch → Mystisch.
- Root Cause serverseitig:
  - `v7167_core_total` nutzte bereits eine additive Levelkurve, aber mit zu großen festen Seltenheitsboni:
    - alt: `0 / 3 / 6 / 10 / 15 / 21 / 28`;
  - ab Episch wurde Glück in `v7167_curve_native` zusätzlich **oben auf** das Core-Budget gerechnet;
  - dadurch wuchs der reale Abstand stärker als beabsichtigt.
- Neue kanonische Kurve V4:
  - Level-Gain unverändert: `+0.72` Gesamtbudget pro Itemlevel;
  - Seltenheitsbonus jetzt:
    - Grau `+0`
    - Grün `+1.5`
    - Blau `+3`
    - Episch `+4.5`
    - Legendär `+6`
    - Prismatisch `+8.5`
    - Mystisch `+10.5`
  - Glück ab Episch bleibt als Charakteristik bestehen, wird aber **innerhalb desselben Gesamtbudgets** verteilt statt zusätzlich erzeugt.
- Beispiel Grower-Waffe / natives Gesamtbudget:
  - Lv10: `17 / 19 / 20 / 22 / 23 / 26 / 28`
  - Lv50: `46 / 48 / 49 / 51 / 52 / 55 / 57`
  - Lv100: `82 / 84 / 85 / 87 / 88 / 91 / 93`
  - Lv300: `226 / 228 / 229 / 231 / 232 / 235 / 237`
- Ergebnis:
  - jede Rarität bleibt bei gleichem Level stärker;
  - der Abstand wächst nicht mehr mit dem Level mit;
  - höherleveliger Loot niedrigerer Rarität kann hochwertige ältere Items wieder einholen;
  - Mystisch bleibt wegen höherem Grundbudget + Spezialeffekt wertvoll, blockiert aber nicht mehr dauerhaft die Progression.
- Serverautorität:
  - Beta/`public` und Server1/`server1` wurden identisch geändert.
  - Supabase-Migrationen:
    - `v8066_flat_item_rarity_curve`
    - `v8066_item_curve_v4_normalizer`
- Bestehende Items:
  - `player_item_state`, `player_saves` und Profil-Equipment serverseitig neu normalisiert;
  - alte V3-Items werden auf V4 neu berechnet, also auch alte überstarke Mystics tatsächlich abgesenkt;
  - Beta-QA nach Migration: `254/254` gefundene Gear-Items in Inventar/Equipment auf `v447Curve.version = 4`, `0` Altitems.
- Client-Fallback ebenfalls auf dieselbe V4-Kurve umgestellt:
  - `js/features/items/beta/v8009-s1-v447-unified-item-balance.js`
  - bestehende serverautoritative V4-Items werden nicht erneut überschrieben;
  - alte V3-Markierungen werden einmal auf V4 migriert.
- Cache-Key: `8066itemcurve4`.
- GitHub-Commits:
  - Client-Kurve: `8675367c352740fc539819cba7d2472fc11c2af0`
  - Beta Cache: `ac8cc77a7517b8dc69b3d5a4fd3f95816ba2894e`
  - index Cache: `7c7d9c84a02052076d0102d4564a2126197194b7`
  - Server1 Cache: `0c21f8b9b63011e7e61bf702772269b687251180`


### Waffen-Schadensspanne V8.067 – balance-neutral integriert · 03.10.2026
- Nutzerwunsch: Waffen sollen eine echte Min–Max-Schadensspanne besitzen, die im Kampf greift, ohne Dungeon/PvP/Turm/Boss-Balance durch zusätzlichen Schaden zu verschieben.
- Designentscheidung:
  - Waffenspanne ersetzt bestehende generische Schadensschwankung;
  - sie wird **nicht zusätzlich** auf den bisherigen Schaden addiert;
  - der Mittelpunkt der Spanne entspricht Faktor `1.0`, daher bleibt der erwartete Durchschnittsschaden erhalten.
- Itemdaten für Waffen/`weapon2`:
  - `weaponDamageMin`
  - `weaponDamageMax`
  - `weaponDamageAvg`
  - `weaponDamageModel = v8067-neutral-spread`
- Range wird aus der aktuellen V4-Itemkurve abgeleitet; ca. ±10 % um den Waffenmittelwert.
- Server-Funktionen:
  - `public.v8067_weapon_factor`
  - `server1.v8067_weapon_factor`
  - `recovery_private.v8067_weapon_factor_for`
  - `server1_private.v8067_weapon_factor_for`
- PvE:
  - zentraler `v7099_pve_fight` in Beta + Server1 nutzt die Waffenspanne;
  - alter anonymer Base-Damage-Jitter wurde durch die Waffenrange ersetzt;
  - vorhandener Erwartungswert bleibt erhalten:
    - fixed-base: alter Mittelwert `1.0`;
    - Endgame: alter `rand*9`-Mittelwert `+4.5`;
    - Standard-PvE: alter `rand*10`-Mittelwert `+5`.
  - Damit greift die Range in den Modi, die den zentralen PvE-Resolver nutzen (u. a. Dungeon/Turm/Endgame und entsprechende gemeinsame Combat-Pfade).
- PvP:
  - `v6350_resolve_pvp_core` in Beta + Server1 nutzt die Waffenrange statt des alten `.84 + random()*.32`-Jitters;
  - Erwartungswert bleibt `1.0`;
  - Frost-`weapon2` erhält beim Nebenhandtreffer zusätzlich seinen eigenen neutralen Range-Faktor.
- Bestehende Waffen serverseitig normalisiert; QA:
  - Beta `player_item_state`: `23/23` gefundene Waffen besitzen gültige Min/Max-Spanne;
  - Stichprobe Range-Faktoren:
    - Minimum ca. `0.89–0.90`
    - Mittelpunkt exakt `1.0`
    - Maximum ca. `1.10–1.11`
  - Rundungsabweichungen der Endpunkte sind symmetrisch um exakt `1.0`; dadurch kein systematischer DPS-Buff/Nerf.
- UI:
  - aktuelle Itemkarte zeigt `⚔️ min–max Schaden`;
  - Vergleichspopup zeigt `Waffenschaden` als eigene Grundwert-Zeile;
  - grüner/roter Pfeil vergleicht den Mittelwert der beiden Spannen.
- Client-Fallback:
  - `v8009-s1-v447-unified-item-balance.js` erzeugt dieselben Range-Felder auch clientseitig.
- Cache-Key: `8067weaponrange1`.
- GitHub-Commits:
  - Itemkurven-/Range-Felder: `fe4c66ca738f3ca7d54371d63f9a47e1bc82734b`
  - Item-UI/Comparison: `431716a9ab67a0170baf8b7712a895023f14b951`
  - CSS: `80fd52f6410e4cb57e3d421a5d1e8744f9b1fd73`
  - Beta Cache: `3bc5d33cd9eb68b789fa29a76a6b128a728f6e1a`
  - index Cache: `81f236196aa37000baeba1b2940207ffb4fb1c88`
  - Server1 Cache: `637d133e16aa203d76d441900390b67f97617721`
- Supabase-Migrationen:
  - `v8067_weapon_damage_range_model_fix`
  - `v8067_weapon_range_combat_integration`


### Dungeon-Referenzbalance V8.068 – alle 20 Dungeons neu kalibriert · 03.10.2026
- Anlass: Nach Itemkurve V4 waren spätere Dungeons nicht mehr mit der vorgesehenen Levelprogression synchron; ab etwa Dungeon 6 wurden Bosse für normale Builds zunehmend zu hart, ab Dungeon 9+ konnte man vom Level her bereits den nächsten Dungeon erreichen, obwohl der vorherige noch deutlich zu schwer war.
- Vollprüfung: **20 Dungeons / 200 Gegner** gegen zwei Referenzprofile simuliert:
  - `normal`: leicht veraltete, realistische Ausrüstung;
  - `strong`: levelnahe hochwertige Ausrüstung.
- Neue Zielprogression:
  - normale Gegner am empfohlenen Level klar machbar;
  - spätere Räume enger;
  - Boss am vorgesehenen Abschlusslevel knapp, aber zugunsten eines normalen Builds;
  - hochwertige Ausrüstung schafft spürbare Reserve, Mystisch ist **keine Voraussetzung**.
- Serverseitige Balance-Tabelle `v7048_dungeon_balance` in Beta + Server1 für **alle 20 Dungeons** skaliert.
- Ergebnis der Referenz-QA nach Rebalance:
  - normaler Build: kein erwarteter Pflicht-Stopp in einem der 20 Dungeons;
  - Boss-Margen über Dungeon 2–20 liegen ungefähr bei `1.05–1.11`;
  - starker Build: Boss-Margen ungefähr `1.48–1.73`.
- Progressionspuffer:
  - Dungeon-Bosse sind nun auf etwa **2 Level vor Freischaltung des nächsten Dungeons** kalibriert;
  - D1 Boss empfohlen Lv18, D2 Boss Lv28, D3 Boss Lv38, …, D20 Boss Lv208.
  - Dadurch soll ein Spieler den vorherigen Dungeon normalerweise abschließen können, bevor der nächste Level-Unlock erreicht wird.
- Konkreter D2/Lv28-Test mit normalem Blue-/Level-25-Referenzgear:
  - Gegner 9: Margin ca. `1.51`
  - Boss: Margin ca. `1.10`
  - damit Boss auf Lv28 realistisch machbar, aber deutlich schwerer als die normalen Räume.
- Waffenspanne im **echten serverautoritativen Dungeon-Run** ergänzt:
  - aktiver Owner `v7049_run_dungeon_core` in Beta + Server1;
  - alter `random()*7` Schaden ersetzt durch sichtbare Waffen-Min/Max-Spanne;
  - Mittelwert bleibt auf dem bisherigen `+3.5`-Schadensmittel, also kein systematischer DPS-Buff/Nerf.
- Client-Parität:
  - bestehender Dungeon-Balance-Owner `v8009-s17-v428-dungeon-rebalance.js` direkt auf dieselben 20 Skalierungsfaktoren gestellt;
  - `v8009-s8-v249-central-dungeon-balance.js` liefert Boss-Empfehlungslevel mit dem neuen 2-Level-Puffer.
- Cache:
  - v428: `8068dungeonref1`
  - v249: `8068bossbuffer1`
- Supabase-Migrationen:
  - `v8068_dungeon_weapon_range_runtime`
  - `v8068_rebalance_all_20_dungeons_for_item_v4`
  - `v8068_dungeon_boss_progression_buffer`
- GitHub:
  - v428 Balance: `3d090f664842b12079e5816c25c32200437bf1b7`
  - v249 Boss-Level-Puffer: `1c1adffe08f0202707f91ae4193e624847b22f77`
  - v428 Cache: Beta `92e5440b9bd32f076d1446a275c42753929b24a5`, index `9a80aae75dc50ccf6906721eda19b4b7ed6aceef`, Server1 `5811931080d8808043ff68359764863e1c17d3db`
  - v249 Cache: Beta `70ccbc549781f8e1a95b590739d4b2cd4862b1fc`, index `b7d4e8e2a35233d4ec4f9daeadee37e30c5e7b7b`, Server1 `5eb90099d21d3283d4a105ec47941b3c367f2a51`
- Korrektur zur V8.067-Doku: Die Waffenrange war bereits im zentralen `v7099_pve_fight`, aber der produktive Dungeon-Run lief separat über `v7049_run_dungeon_core`. Mit V8.068 ist die Range nun auch dort wirklich aktiv.


### PvE-Gegner-Audit nach Itemkurve V4 / Waffenrange · 03.10.2026
- **Dungeon 1–20:** neu kalibriert in V8.068; siehe Abschnitt oben.
- **Turm:** kein statischer Dungeon-artiger Fehlskalierungsfall gefunden.
  - Gegner werden beim Lauf aus den **aktuellen Spielerwerten** abgeleitet (`primary`, `maxHp`, Floor/Depth, Normal/Elite/Miniboss/Boss);
  - Kampf läuft über `v7099_pve_fight`;
  - dadurch folgt der Turm der neuen Itemkurve automatisch und die V8.067-Waffenrange greift im zentralen Resolver.
- **Quest:** der aktuelle serverautoritative Quest-Flow ist Timer/Angebot/Claim/Belohnung; es gibt aktuell **keinen serverseitigen Quest-Win/Loss-Kampfresolver**. Die sichtbare Quest-Kampfdarstellung entscheidet daher nicht über Erfolg oder Belohnung. Itemkurve/Waffenrange erzeugen hier keinen Progressions-Wall.
- **Endgame / Nebelrisse:** gesondert gegen V4-Referenzbuilds geprüft.
  - Normaler Build: Boss-Margins über Riss 1–9 ca. `1.86 → 1.23`;
  - starker Build: ca. `2.51 → 1.64`;
  - damit nach Item-V4 **nicht zu schwer**, eher mit komfortabler Reserve; aktuell kein Notfall-Nerf nötig.
- **Weltboss:** besitzt eigenen readiness-/ideal-stat-basierten Combat-Owner und ist nicht dieselbe statische Gegnerkurve wie Dungeon.
- **Gildenboss:** eigener beitrags-/Combat-Power-basierter Modus; ebenfalls nicht direkt von der alten Dungeon-Tabelle abhängig.
- Folgeprinzip für künftige Balance:
  - statische Progressionsinhalte wie Dungeon gegen feste V4-Referenzbuilds prüfen;
  - dynamische Modi wie Turm an aktuelle Spielerwerte koppeln;
  - Sonderbosse separat über ihre eigene Zielzeit/Teilnahme- bzw. Readiness-Kurve balancieren.


### Itemvergleich V8.069 – stabile Direktanzeige + Gesamtwertung mit Stein/VZ · 03.10.2026
- Balance-Hinweis:
  - die Dungeon-Referenzbalance V8.068 wurde bewusst auf **native Item-Grundwerte ohne verpflichtende Steine/VZ** kalibriert;
  - Stein/VZ sind damit Progressionsbonus und keine Voraussetzung, um den vorgesehenen Dungeon-Levelpfad zu schaffen.
- Nutzerfehlerbild: direkte Shop-Vergleichsanzeige sprang nach kurzer Zeit von `+` auf `-`.
- Root Cause:
  - aktiver Shop-Owner `v8009-s10-v090-shop-comparison-fix.js` bewertete `item.bonus` inklusive bereits eingerechnetem Stein und addierte den Stein danach erneut;
  - außerdem konnte ein noch nicht normalisiertes lokales Item vor der finalen V4-Kurvennormalisierung bewertet werden.
- Fix:
  - Kandidat + angelegtes Item werden vor dem Vergleich über `v447ApplyItemCurve` auf den kanonischen V4-Zustand gebracht;
  - native Grundwerte kommen primär aus `v429StatLock.native`;
  - Stein wird genau einmal bewertet;
  - VZ-Rolle wird genau einmal bewertet;
  - kein Gem-/VZ-Doppelzählen mehr.
- Universelles Vergleichspopup:
  - Bereich **Grundwerte** zeigt jetzt wirklich nur native Itemwerte;
  - Stein und VZ bleiben separat sichtbar;
  - neuer Block **Gesamt inkl. Stein + VZ** zeigt `↑ Insgesamt besser`, `↓ Insgesamt schlechter` oder `= Insgesamt gleichwertig`;
  - Differenz wird als stabiler Vergleichswert angezeigt.
- Diagnostik vor Fix:
  - `runtime_client_errors`: aktuell leer;
  - aktuelle Shop-/Character-QA-Snapshots: `ok`, 0 Runtimefehler;
  - Account-State-Health zeigt bei einem Frost-Account weiterhin den bereits bekannten `ITEM_SLOT_MISMATCH:weapon2 -> weapon`; dieser Befund ist separat und nicht Root Cause des Vergleichssprungs.
- Dateien:
  - `js/features/items/beta/v8009-s2-v4103-item-ui-consistency.js`
  - `js/features/shop/beta/v8009-s10-v090-shop-comparison-fix.js`
  - `v8009-extracted-v4103-item-ui-css.css`
- Cache-Key: `8069itemcompare2`.
- Commits:
  - Popup/Core: `c959a0bbc2e3c5eb98ace08b8ceee7922030f93b`
  - Shop-Vergleich: `54d4a20b2837e57a1d5b43f5c262f99646b063c1`
  - CSS: `c7ae961b6f674b11d0f933c75639831e954af41b`
  - Beta Cache: `e08778a6378f54c852653ff08eae04325fe77eb0`
  - index Cache: `cfff5b6c646b76e261cf8057fe090649b2bf96df`
  - Server1 Cache: `2b3ae11f9fbec8a164bb1143a1d31e57838e1d31`


### Inventar-Vergleich V8.070 – vollständig auf zentralen Owner umgestellt · 03.10.2026
- Nutzerfrage: Ist die Vergleichsanzeige im Inventar dieselbe wie im Shop?
- Vorher: Klicks wurden zwar bereits vom zentralen `v4103`-Delegate abgefangen, `v459-character-hub.js` enthielt aber weiterhin einen zweiten lokalen Inventar-Vergleich über `comparison(it)`.
- Fix:
  - `v459OpenInventoryItem` routet jetzt direkt auf `window.v4103OpenItemCompare(it,'inventory')`;
  - der alte lokale `comparison(it)`-Pfad im Inventar ist damit retired;
  - Shop, Inventar, Quest-/Dungeon-Fund und Equipment nutzen denselben zentralen Vergleichs-Owner.
- Der zentrale Inventar-Dialog behält die Aktionen:
  - `Anlegen`
  - `Verkaufen`
- Damit gilt im Inventar exakt dieselbe Bewertung wie im Shop:
  - native Grundwerte aus `v429StatLock.native`;
  - Stein genau einmal;
  - VZ genau einmal;
  - Gesamtblock `inkl. Stein + VZ`.
- Cache-Key: `8070inventorycompare1`.
- Commits:
  - zentraler Popup-Owner + Inventaraktionen: `74a2b4665039d542f5c6a4e6d30c7adb26851e3e`
  - alter v459-Inventarvergleich retired: `23c5851c9c9c0edba83c77bb92f41016823b1919`
  - CSS: `d5e8a62d99c81c79ab99cefac270b6a5b816ac12`
  - Beta Cache: `055e528e94af972f9c73a51fc42c84e88cd213df`
  - index Cache: `d9196b02eebcbb3d61ec2c58705b1532fdba8d3b`
  - Server1 Cache: `db2b1264872ebadcf1e43b6c51dfd776bb9c15b1`


### Qualitätsfarben V8.071 – überall kräftiger wie im Charakterfenster · 03.10.2026
- Nutzerwunsch: Qualitätsfarben sollen nicht nur im Charakterfenster kräftig sichtbar sein, sondern auf allen Itemflächen.
- Kanonische Qualitätsfarben global verstärkt: Grau #d0d4d8, Grün #72ff88, Blau #55c7ff, Episch #ed72ff, Legendär #ffc052, Mystisch #66ffff; Prismatisch mit kräftigem Regenbogenrand/Mehrfachglow.
- Betroffene Flächen: Charakter-Equipment, Inventar, Shop, Quest-/Dungeon-Fund, Spielerprofil/zentrale Itemkarten und universelles Item-Vergleichspopup.
- Vergleichspopup: komplette Itemkarte bekommt Qualitätsrahmen + dezenten Farbglow; Itembild-Rahmen, Name und Qualitäts-Meta übernehmen dieselbe Farbe; Prismatisch erhält einen klaren Regenbogenrand statt nur neutralem Braun.
- Zentraler Quality-Art-Owner v6108 wurde von charakter-only auf globale starke Qualitätsfarben umgestellt.
- Zentraler Item-UI-Owner v4103 übernimmt dieselbe Palette für alle markierten aktuellen Itemflächen.
- Cache-Key: 8071qualitystrong1.
- Commits: globale Quality-Art-Farben 9a9caf7c2fdfa3b7ddadb1a79f0c454af3f43207; zentrale Item-/Compare-Farben 795374726d8c2fc4770eba6a6fb187c3f8d87059; Beta Cache ec5c39cd7f45bfa6bc68de029871d62cff979f85; index Cache 65fecd055a808ef78e9ac9325fb6e9e5d2eef7e4; Server1 Cache 7a505ef57176a2e684ae0905480ab2f395cf060f.


### Itemvergleich V8.072 – Inventar/Shop/Popup auf einen einzigen Score vereinheitlicht · 03.10.2026
- Nutzerfehlerbild: Inventarkarte zeigte z. B. -20,3, während das Vergleichspopup +20,6 besser zeigte; Shop vermutlich ebenfalls betroffen.
- Root Cause: `v8009-s4-v470-character-slot-art-canonical-comparison.js` wird nach `v4103` geladen und war weiterhin der Last-Writer für Inventar-Badge sowie `v090ComparisonHtml`/`v089ShopComparison`. Dadurch liefen Karten-Badge und Popup über unterschiedliche Scores.
- Fix: `v470` berechnet keine eigene Itemwertung mehr, sondern verwendet `window.v4103TotalCompareScore()` für Inventar und Shop.
- Zentraler Endwert enthält jetzt: native Grundwerte + Stein + VZ-Rolle + mystischen Spezialeffekt.
- Popup-Label geändert auf `Gesamt inkl. Stein + VZ + Spezial`.
- Erwartung: Inventar-Badge, Shop-Badge und Popup liefern für dasselbe Item gegen dasselbe angelegte Item exakt dasselbe Vorzeichen und denselben Vergleichswert.
- Cache-Key: `8072compareunified1`.
- Commits: zentraler Score `057ffa681c1ecfa44162170e03a48f7a7ed456c8`; v470 Last-Writer-Fix `f1db13684f5e31cf9bafac56d7ebc21147fb50c5`; Beta Cache `5ec689887efe58aa70f1b88103880d968344490f`; index Cache `13796ca5a585e7aee7b4b241888e1fce50ce4540`; Server1 Cache `680560a667022694760b930f68f46236e8ad73cb`.
- Code-QA nach Commit: `v4103` enthält finalen Gesamt-Score; `v470` nutzt `window.v4103TotalCompareScore`; Beta/index/Server1 tragen den Cache-Key `8072compareunified1`.
- Account-State-Diagnostik konnte in diesem Schritt wegen Tool-Sicherheitsblock nicht vollständig erneut ausgelesen werden; die Code-Root-Cause war direkt reproduzierbar über die Script-Reihenfolge/Last-Writer-Struktur.


### New-Player-Guide V8.086 – vorhandenes System erweitert, keine Level-Sperren · 03.10.2026
- Nutzerwunsch nach Spielbewertung/Onboarding: ausdrücklich **keine neuen Level-Sperren** für bestehende Inhalte.
- Vor jeder Änderung repo-weit geprüft, ob bereits passende Systeme vorhanden sind.
- Vorhandene Bausteine:
  - globaler Erstbesuch-/Seiten-Guide: `js/features/guide/beta/v8009-s1-v6254-grow-guide.js`;
  - kontextsensitiver Growroom-Guide: `js/features/guide/beta/v8009-s2-v6283-grow-guides.js`;
  - bestehender Startseiten-`CHARAKTER-CHECK` im kanonischen Home-Renderer;
  - bestehende Startseiten-`Tagesziele` mit erster Quest, Dungeon usw.
- Ergebnis des Audits: Es gab bereits Guide-, Checklist- und Tagesziel-Mechaniken. Es fehlte nur ein klarer empfohlener Startpfad für neue Spieler.
- Deshalb **kein zweiter Tutorial-Owner, keine neue Checkliste und keine neue Render-Schicht** gebaut.
- Bestehenden `v6254`-Owner direkt erweitert:
  - Welcome erklärt jetzt den empfohlenen Startpfad:
    `Quest starten → Beute prüfen → Charakter verbessern → Growroom ansehen → Dungeon 1 testen`;
  - ausdrücklich als Empfehlung formuliert, nicht als Sperre/Pflicht;
  - Startseiten-Guide verweist jetzt auf vorhandene Tagesziele und Charakter-Check;
  - Quest-Guide beginnt für neue Spieler mit `Dein erster Auftrag` und erklärt, dass während des Quest-Timers andere Bereiche frei erkundet werden können;
  - Beute-Hinweis verweist auf den bestehenden Itemvergleich.
- Alle Bereiche bleiben weiterhin frei erreichbar.
- Änderung zunächst **nur Beta**; Server1/Stable unverändert.
- Backup vor dem Umbau vorhanden:
  - Branch `backup/pre-earlygame-rework-2026-10-03`
  - Ausgangscommit `b369b0a2fcb23c3176cc70265abf4d6b0bf380d7`.
- Cache-Key Beta: `8086onboarding1`.
- Commits:
  - Guide-Core: `7b0a3e97755b2c52d34e7242a7d650a1ad36bf3d`
  - Beta Cache: `1583e3a11dbc65ad0370658d0d1468ded18a5837`
- Code-QA:
  - neuer Startpfad vorhanden;
  - explizit keine Sperre/Pflicht;
  - Startseiten-Empfehlung vorhanden;
  - Quest-Einstieg vorhanden;
  - neuer Beta-Cache aktiv.


### Server 1 Promotion – kompletter aktueller Beta-Frontendstand übernommen · 03.10.2026
- Nutzerfreigabe: **alle aktuellen Beta-Änderungen auf Server 1 übernehmen**.
- Vor Promotion Backup angelegt:
  - Branch `backup/pre-server1-promotion-2026-10-03`
  - Ausgangscommit `c702ced7c492fb48a61c7385b643953634732fcf`.
- Release-Regel `SERVER1_RELEASE_POLICY.md` geprüft und eingehalten.
- Delta `beta.html` ↔ `server1.html` vor Promotion:
  - identische Feature-Struktur;
  - absichtlicher Kanalunterschied:
    - Beta: `js/features/anonymous-extracted/beta/anon-0001.js`
    - Server 1: `js/features/account/server1-release-channel.js`;
  - 75 abweichende/veraltete Cache-Keys auf Server 1;
  - Server-1-Titel separat.
- Promotion:
  - `server1.html` auf den vollständigen aktuellen Beta-Include-/Cache-Stand gebracht;
  - Server-1-spezifischen Einstieg beibehalten;
  - Titel bleibt `Grow Legends V7.308 Server 1`;
  - `window.GROW_RELEASE_CHANNEL='server1'` bleibt aktiv;
  - Beta-anonymer Preboot wird auf Server 1 nicht geladen.
- Dadurch sind die zuletzt nur über Beta-Cache-Bust sichtbaren Änderungen jetzt auch sicher auf Server 1 aktiv, darunter u. a.:
  - Braun-/Holz-UI-Überarbeitungen;
  - Header/Navigation;
  - Growroom/Quest/Dungeon/Turm;
  - Händler/Schmiede/Dealer;
  - PvP/Gilde/Hall/Nebelbereiche;
  - Reward-/Popup-/Item-UI;
  - aktueller Guide-/Onboarding-Stand `8086onboarding1`.
- Gemeinsame JS-/CSS-Owner waren bereits auf aktuellem `main`; die Promotion synchronisiert Server 1 auf dieselben Cache-/Include-Versionen.
- Promotion-Commit:
  - `62165f56d49ac3548cd2f91557a30eb22e2381e9`
- Smoke-Abgleich nach Promotion:
  - Server-1-Release-Channel vorhanden: **ja**;
  - Beta-`anon-0001.js` auf Server 1: **nein**;
  - `GROW_RELEASE_CHANNEL='server1'`: **ja**;
  - Cache-Differenzen Beta ↔ Server1 bei gemeinsamen Includes: **0**;
  - einzige strukturelle Include-Differenz ist der beabsichtigte Release-Channel-Preboot.
- Neuer stabiler Meilenstein:
  - Branch `stable-server1-2026-10-03`
  - Basis `62165f56d49ac3548cd2f91557a30eb22e2381e9`.


### Dampf-Event V8.087 – Post-Hydration-Sync auf Beta + Server 1 · 03.10.2026
- Fehlerbild auf Server 1: Gold-Event war sofort sichtbar, Dampf-Event erschien erst später.
- Datenbank geprüft:
  - aktuelles `Gold-Event` aktiv;
  - aktuelles `Dampf-Event` ebenfalls aktiv;
  - beide mit identischem aktiven Wochenend-Zeitraum.
- Damit war die Event-Konfiguration korrekt.
- Root Cause / Timing:
  - öffentliche Events werden asynchron über `v093LoadPublicContent()` geladen;
  - Dampf benötigt zusätzlich `v271SyncDampfEvent()` und den Ressourcen-Paint;
  - die kanonische Account-/Server-Hydration konnte danach noch den gespeicherten Dampfwert übernehmen, bevor der Event-Sync final nachgezogen wurde.
- Fix direkt im bestehenden kanonischen Owner:
  - `js/features/account/beta/v8009-s1-v4139-account-switch-authority.js`;
  - neue interne Funktion `syncDampfEventAfterHydration(id)`;
  - nach erfolgreicher `hydrateCanonicalLogin()`:
    - Eventdaten nur bei Bedarf laden;
    - `v271SyncDampfEvent()` ausführen;
    - `v271PaintDampf()` ausführen;
    - zentralen Ressourcen-Painter `v441PaintResources()` aktualisieren;
    - danach erst final rendern.
- Kein neuer Timer, kein Retry-Zug, kein separater Patch-Owner.
- Account-Wechsel während async Laden wird weiterhin abgefangen.
- Cache-Key Beta + Server1: `8087dampfsync1`.
- Commits:
  - Core-Fix: `ef8cac1d4e5d4770f7f92f0a2abb02df2861464d`
  - Beta Cache: `92e6a13c9ce456962abd09dfb5cd2c69f5e5d2c0`
  - Server1 Cache: `73ae50687333788edac6a69774e171a97c5b6c1d`.


### Critical Boot Gate V8.088 – wichtige Spieldaten bleiben hinter Ladebildschirm · 03.10.2026
- Nutzerwunsch: wichtige Serverdaten sollen vollständig während des Ladebildschirms geladen werden, damit nach dem Reveal keine kurzzeitig falschen Zustände sichtbar sind.
- Bestehenden Boot-/Splash-Lifecycle geprüft:
  - `v200-stable-core` steuert Auth-/Loading-Overlay;
  - `v224-atomic-boot-release` steuert den eigentlichen App-Reveal;
  - `v7284-splash-release-safeguard` ist der Release-Failsafe;
  - kein zweiter Ladebildschirm gebaut.
- Neuer zentraler Critical-Boot-Status im bestehenden Account-Owner:
  - `window.__V8088_CRITICAL_BOOT_READY__`.
- Für bestehende Charaktere wird der App-Reveal erst erlaubt, wenn der kanonische Server-Login vollständig abgeschlossen ist:
  - Account/Identität;
  - Authority-Gates;
  - zentrale Hydration;
  - Progress/Build/Items;
  - Quest;
  - Dungeon;
  - Ressourcen-/Dampf-Event-Sync;
  - aktive Eventdaten, falls sie noch nicht vorlagen.
- Neue Accounts ohne fertigen Charakter werden nicht blockiert; Charaktererstellung bleibt direkt erreichbar.
- `v224Release()` und `v7284ReleaseSplash()` verlangen bei fertigem Charakter jetzt den Critical-Boot-Status.
- Ladefortschritt nutzt die vorhandene Progressbar weiter und zeigt während der kritischen Phase u. a.:
  - Account/Serverstand wird geprüft;
  - wichtige Spieldaten werden synchronisiert.
- Startup-Timing-Messung direkt im bestehenden Account-Owner ergänzt:
  - `v4139BootTimingDiagnostics()`;
  - misst `profileMs`, `authorityMs`, `hydrateMs`, `eventMs`, `totalMs`, Server und Charakterstatus.
- Keine zusätzlichen Retry-Timer und kein neuer Boot-Owner.
- Aktiv auf Beta + Server 1.
- Cache-Key: `8088criticalboot1`.
- Commits:
  - Account/Critical Boot + Timing: `cc0d7ef268139e1a1a28eae7a3efc09a80732819`
  - Atomic Boot Gate: `07aaa560c9044e03e4abc8ca796b93dfe8464bc6`
  - Splash Safeguard: `97f18c8958d611d721ea63773a70ba61cc3bb8f9`
  - Beta Cache: `add7992e0a7f090c9262c6baf3ad1814ebefd9d5`
  - Server1 Cache: `98d0c6a546e70fdaac19c870ad6cf70bb4b6d9b4`.
- Code-QA:
  - Critical-Boot-Flag vorhanden;
  - Timing-Diagnose vorhanden;
  - beide Splash-Release-Owner prüfen das Gate;
  - Beta + Server1 laden `8088criticalboot1`;
  - Server1-Release-Channel bleibt unverändert.


### Server-1 Identität V8.089 – Release-Channel jetzt autoritativ · 03.10.2026
- Beim Auslesen nach einem frischen Server-1-Login erschienen weiterhin keine Health-/QA-Einträge unter `server1`.
- Ursache im bestehenden Server-Selection-Owner gefunden:
  - `server1.html` lädt korrekt `window.GROW_RELEASE_CHANNEL='server1'`;
  - `v343Selected()` erzwang den geladenen Build aber nur für `beta`;
  - auf Server 1 konnte deshalb ein älterer `growLegendsSelectedServer`-LocalStorage-Wert weiterhin `beta` liefern.
- Auswirkung:
  - QA/Health konnte Server-1-Sessions fälschlich als Beta beschriften;
  - auch servergescopte lokale Keys konnten dadurch vorübergehend mit falscher Server-ID arbeiten.
- Fix direkt in:
  - `js/features/account/beta/v8009-s6-v343-server-selection-v7226.js`
- Neue Regel:
  - Release-Channel `beta` → aktive Server-ID zwingend `beta`;
  - Release-Channel `server1` → aktive Server-ID zwingend `server1`;
  - nur neutrale/sonstige Builds verwenden den gespeicherten Selector.
- Serverwechsel bleibt unverändert: Auswahl eines anderen Servers navigiert auf dessen Build.
- Cache-Key Beta + Server1: `8089server1identity1`.
- Commits:
  - Core: `8b8c5a146bcb6d664e85ec2e81c8172e52d41de9`
  - Beta Cache: `282907f49b70a04e30f9a0e5be121817e436e0fb`
  - Server1 Cache: `23bc38ab5cc0cde5ea123b00a7de861aa4c0203b`.
- Hinweis: Der Login unmittelbar vor diesem Fix kann nicht als verlässlicher Server-1-Timingdatensatz verwendet werden. Nach einem erneuten Server-1-Login sollten QA/Health unter `server1` erscheinen.


### Diagnose-RPC Routing V8.090 – Server 1 nutzt gemeinsame Public-Diagnosefunktionen · 03.10.2026
- Nach V8.089 konnte ein frischer Server-1-Login im Supabase-Edge-Log gesehen werden, aber:
  - `v8080_report_account_state_health` → 404;
  - `v8083_report_player_qa` → 404;
  - `v8082_report_runtime_error` wäre aus demselben Grund ebenfalls betroffen.
- Ursache:
  - Beta-Supabase-Client arbeitet im Schema `public`;
  - Server-1-Supabase-Client arbeitet absichtlich im Schema `server1`;
  - die drei Diagnose-RPCs liegen gemeinsam im Schema `public`;
  - ein nacktes `v073Db.rpc(...)` sucht deshalb auf Server 1 im Schema `server1` und findet die Public-Diagnosefunktion nicht.
- Fix direkt im bestehenden Account-/Diagnose-Owner:
  - `v073Db.schema('public').rpc(...)` für:
    - `v8080_report_account_state_health`;
    - `v8082_report_runtime_error`;
    - `v8083_report_player_qa`.
- Gameplay-/Serverdaten bleiben unverändert servergetrennt; nur technisches Shared-Diagnose-Logging wird explizit über `public` geroutet.
- QA-Payload erweitert:
  - `bootCriticalReady`;
  - `bootTiming` mit `profileMs`, `authorityMs`, `hydrateMs`, `eventMs`, `totalMs`, Server und Charakterstatus.
- Core-Commit: `8c4dfd94da2b11c638fee9c903ac066734b15e5e`.
- Cache-Key Beta + Server1: `8090diagpublic1`.
- Beta Cache Commit: `fdaf732069581ede0187634429b58c4a1713019e`.
- Server1 Cache Commit: `ee608d4a64954f66233530c5f4d173b820d141f6`.
- Nächster Server-1-Login kann nun die echten Critical-Boot-Zeiten in den bestehenden QA-Snapshot schreiben.


### Early-Game Power-Block 1–5 V8.091 – Quest → Händler/Charakter → Growroom → Dungeon 1 · 03.10.2026
- Ziel: tatsächlichen Anfängerweg technisch prüfen, ohne neue Tutorial-/Lock-Systeme.
- Geprüft: neuer Charakter / erste Quest / Händler / Attribute / Growroom / Dungeon 1.
- Erste Quest:
  - Beta + Server1 starten mit 100 Dampf.
  - Level-1-Questkosten identisch: Schnell 5, Normal 6, Schwer 7 Dampf.
  - Kein Startblocker.
- Attribute:
  - Startwerte je Attribut 5.
  - Keine künstliche Level-Sperre.
  - Freie Punkte zu Beginn 0; frühe Verbesserung zunächst über Quest-Beute/Ausrüstung.
- Dungeon 1:
  - von Anfang an freigeschaltet.
  - Balance V8.068 unverändert.
  - UI-Inkonsistenz gefunden: v7287 nutzte für sichtbare Levelangaben noch v244DungeonRoomLevel() und konnte den D1-Boss als Lv20 anzeigen, obwohl der kanonische V8.068-Wert Lv18 ist.
  - Fix: sichtbare Dungeon-Level verwenden jetzt zuerst v025RecommendedLevel().
  - Core-Commit: c0aa1435714a5d9c90d0bde1870b17f33ee92f25
  - Cache-Key: 8091earlygame1
  - Beta Cache: d9b62abdd9ba4ea6868dc3d84f0ff73abfb2fcb2
  - Server1 Cache: bea503c228f0a2e1d6314b813f6d93c086fab7f2
  - Index Cache: 8a3e0d732b382cd90e7a19fdf64c51eb4c63b347
- Growroom / Startzustand:
  - Beta gl_create_character() gibt 2× moss (White Widow).
  - Server1 gl_ensure_fresh_character_state() hatte die Grow-Startdaten nicht im Basis-Save.
  - Dadurch initialisierte v6356_enable_seed_guard() bei frischen Server1-Charakteren alle Samen mit 0.
  - Startgold 120, White Widow kostet 180 Gold → Growroom war für frische Server1-Spieler direkt blockiert.
- Server1-Fix direkt im kanonischen Fresh-Character-State:
  - materials: []
  - timeSeeds: 0
  - Growroom Level 1 / Lampe 0 / Töpfe 0
  - 2× White Widow (moss)
  - restliche Start-Samen 0
- Bestehende Auswirkung:
  - genau 1 Level-1-Server1-Charakter mit komplett leerem Samenbestand gefunden;
  - einmalig auf 2× White Widow repariert;
  - Verifikation danach: still_blocked = 0.
- Keine Quest-/Händler-/Dungeon-Kampfbalance verändert; nur Startzustands- und Anzeige-Inkonsistenzen korrigiert.
- Supabase-Changelog/Docs vor DB-Änderung geprüft; kein relevanter aktueller Breaking Change für diese bestehende Funktion.
- Supabase Advisors nach Änderung geprüft; bestehende projektweite RLS-/Policy-Hinweise bleiben separat und wurden hier nicht verändert.


### Early-Game Power-Block 6–9 V8.092 – Materialien → Buch → PvP → Pets · 03.10.2026
- Geprüft: Edelsteine/Verzauberungen, Illegales Buch/Erfolge, PvP, Pet Sammelalbum.
- Edelsteine + Verzauberungen:
  - bestehender Material-Owner verwendet 1 Stein + 1 Rollen-Verzauberung pro Item;
  - Ersatz vorhandener Materialien wird vor Anwendung bestätigt;
  - Material-UI erklärt Fundquellen Quests/Dungeons/Bosse;
  - kein künstlicher Level-Lock und kein Early-Game-Blocker gefunden.
- Illegales Buch:
  - erste Langzeitziele beginnen sinnvoll bei Lv10 / Dungeon 1 / 10 Quests usw.;
  - jeder abgeschlossene Erfolg gibt +1 Hauptattribut;
  - Server-Achievement-Authority überschreibt die Getter mit kanonischen Servermetriken;
  - kein Startblocker gefunden.
- Pets:
  - Album ist direkt einsehbar;
  - normale Pet-Funde können aus Growroom, Quests und Dungeons kommen;
  - bestehende Drop-Raten: normale Quest 4 %, Elite 12 %, Grow abhängig von Pflege 2–6 %, Dungeon normal 3–6 %, Dungeon-Boss 12 %;
  - serverautoritativer Pet-State bleibt maßgeblich; kein Start-Lock nötig.
- PvP:
  - Matchmaking sucht zuerst Level ±2 / Kampfkraft 80–120 %, danach Level ±4 / Kampfkraft 65–135 %;
  - serverseitig beginnt der 30-Minuten-Cooldown ausdrücklich erst bei einem tatsächlich gestarteten Kampf;
  - Client-Inkonsistenz gefunden: v204FindOpponent() setzte lokal bereits beim bloßen Finden eines Gegners v204CooldownLeft auf 30 Minuten.
  - Folge: Gegner nur ansehen/finden und nicht kämpfen konnte bis zum nächsten Server-Refresh wie eine verbrauchte PvP-Sperre wirken.
- Fix direkt im bestehenden PvP-Owner:
  - beim Match-Fund kein lokaler Cooldown mehr;
  - Cooldown kommt erst aus dem tatsächlichen serverseitigen Kampf/Attack-Record.
  - Core-Commit: eec51eda2f1cd9fe52b466eed7551ccc3cf49c2c
  - Cache-Key: 8092earlygamepvp1
  - Beta Cache: f5275d1321c0925d98cf0f980df81b12115fce3f
  - Server1 Cache: 3f9afc7f8017bd6d417801df47eaf775008b3ac3
  - Index Cache: 33de884ec8c8dbcd0f5e97f410479795a9a56eb2
- Keine Drop-/Reward-Balance in diesem Block verändert.


### Early-Game Power-Block 10–13 V8.093 – Gilde → Harzschmiede → Anbau-Turm → Schlüsselstein 2 / Dungeon 2 · 03.10.2026
- Geprüft: Gilde, Harzschmiede, Anbau-Turm und Schlüsselstein-Fortschritt bis Dungeon 2.
- Gilde:
  - keine künstliche Level-Sperre im bestehenden Gilden-Owner;
  - Kern-RPCs für Erstellen, Anmeldung, Upgrade und Bewerbung sind in public und server1 vorhanden;
  - 24h-Sperre nach freiwilligem Austritt bleibt bestehen;
  - kein Early-Game-Blocker gefunden.
- Harzschmiede:
  - direkt erreichbar, aber bewusst kein Sofort-Crafting-System;
  - Zerlegen normaler Beute liefert Fragmente;
  - Händlerware liefert keine Fragmente und verhindert Gold→Fragment-Ausnutzung;
  - prismatisches Schmieden startet bei 150 Fragmenten + 1.000 Gold im ersten Levelband;
  - Edelsteine/Rollen, Klassensets, mystische und prismatische Items sind geschützt;
  - kein technischer Startblocker gefunden.
- Anbau-Turm:
  - vorhandene levelabhängige HP-Regeneration ist korrekt und bleibt unverändert:
    - Lv <10: 25 %/h
    - Lv <20: 20 %/h
    - Lv <30: 15 %/h
    - Lv <40: 10 %/h
    - Lv <50: 7 %/h
    - ab Lv50: 5 %/h
  - Heilung bleibt +20 % für 1 Harz-Taler.
  - Eine kurzzeitig vorgenommene Vereinheitlichung auf 5 %/h wurde sofort vollständig zurückgenommen; finaler Stand ist wieder die Staffelung.
  - Restore-Core-Commit: c29d997a024855608876ee3bceb38e8ca6e0dab6
  - Restore-Cache: Beta 616cd578b246ced2b977ff9cc99ec3dc086c6af5 / Server1 dcdb8d88f3839c66f16d4ddb9334f339cde89c80 / Index e0db827fa4f55ad503d100e9c373b8fe8c9bc313
- Schlüsselstein 2 / Dungeon 2:
  - Dungeon 1 muss abgeschlossen sein;
  - ab Level 20 zählen passende abgeschlossene Quests;
  - Pity-Chancen: 10 %, 18 %, 45 %, 70 %, 100 %;
  - spätestens die 5. passende Quest garantiert Schlüsselstein 2;
  - Weltkarte zeigt Fortschritt und nächste Chance;
  - v243 hält keys[] und unlocked[] als gemeinsame Source of Truth synchron;
  - v249 ist die finale zentrale Dungeon-Balance und überschreibt ältere D2-Balance-Layer;
  - aktueller kanonischer D2-Boss-Hinweis bleibt Lv28 gemäß V8.068/V8.069-Balance.
- In diesem Block nach Audit keine weitere Gameplayänderung nötig.


### Midgame Power-Block V8.094 – Dungeon 2–5 / Talente / Klassensets / Turm / PvP / Gilde · 03.10.2026
- Midgame-Systeme geprüft: Dungeon 2–5, Talentbaum, Klassensets/Genetik/Harzschmiede, Anbau-Turm, PvP und Gilde.
- Talente:
  - 1 Talentpunkt alle 2 Level.
  - erste Schlüsseltalente ab Lv25 bei 10 Punkten im Ast; danach Lv50/100/150/200/250/300.
  - Punktkurve und Voraussetzungen greifen logisch ineinander; kein Midgame-Blocker gefunden.
- Klassensets:
  - gezieltes Crafting nur über Genetik + PvP-Buds + Samenfragmente + Gold;
  - erstes Set-Rezept ab 100 PvP-Buds;
  - Buds sind reine Freischaltbedingung und werden nicht verbraucht;
  - keine zufälligen fertigen Klassenset-Drops mehr; bestehender langfristiger Progressionspfad bleibt.
- PvP:
  - Bud-Rewards bei Sieg bleiben abhängig von Gegnerstärke (+1 bis +5);
  - der V8.092-Fix bleibt aktiv: Gegner suchen verbraucht keinen 30-Minuten-Cooldown.
- Gilde:
  - relevante Kern-RPCs in public und server1 vorhanden; keine Midgame-Freischaltinkonsistenz gefunden.
- Anbau-Turm:
  - levelabhängige HP-Regeneration bleibt unverändert und wurde als korrekter Designstand bestätigt.
- Dungeon 2–5 / Architektur:
  - wichtiger Last-Writer-Konflikt gefunden:
    - v249 war als zentrale Dungeon-Balance dokumentiert;
    - später geladene v401 und v428 überschrieben v025EnemyStats erneut.
  - Dadurch gab es technisch drei Balance-Writer, obwohl nur ein kanonischer Owner vorgesehen ist.
- Fix ohne Balanceänderung:
  - die bisher tatsächlich wirksame Endformel aus v401 + v428 wurde mathematisch identisch direkt in v249 übernommen;
  - v401 und v428 sind jetzt reine Retirement-Marker und schreiben keine Kampfwerte mehr;
  - sichtbare Empfehlungen bleiben aus v249.
- Aktuelle Midgame-Boss-Empfehlungen bleiben:
  - Dungeon 2: Lv28
  - Dungeon 3: Lv38
  - Dungeon 4: Lv48
  - Dungeon 5: Lv58
- Ergebnis: eine kanonische Dungeon-Kampfwertquelle statt gestapelter Last Writer.
- Core-Commits:
  - v249 konsolidiert: 5e78f698c9ad9d7f788307678f3fec370130fa42
  - v401 retired: 35a6c79ddaacb123d2bc0f3e23ad9be4be82ce3c
  - v428 retired: 127262a3d96d6a3b935e4997fdb59ac7f78f2599
- Cache-Key: 8094dungeonowner1
- Beta Cache: 485111062c5836a4eead9613782df7271cee78dd
- Server1 Cache: 694c86ee423d444e60a1d0f399b4effd2c5be4a5
- Index Cache: 566eb455d88e09a73d06a9b2ffe2df2a40d0f0e7
- QA:
  - v249 besitzt die finale Scale-Formel;
  - v401/v428 schreiben keine Stats mehr;
  - Beta lädt den neuen Cache-Key.


### Late-/Endgame Power-Block V8.095 – Dungeon 6–20 / Nebel / Endgame / Bosse / Turm / Langzeit-Rewards · 03.10.2026
- Geprüft:
  - Dungeon 6–20;
  - Nebelkarawane;
  - Nebelschmied;
  - Nebelrisse / Endgame;
  - Smaragd-Koloss / Weltboss;
  - Gildenboss;
  - Turm-Lategame;
  - Weekly Chest / Daily Login / Langzeit-Belohnungen.
- Dungeon 6–20:
  - profitieren jetzt ebenfalls von der V8.094-Konsolidierung;
  - v249 ist alleiniger HP/Attack-Owner;
  - v401/v428 bleiben retired und schreiben keine Kampfwerte mehr;
  - Schlüsselsteine bleiben geordnet: vorherigen Dungeon abschließen + erforderliches Level + Quest-Pity 10/18/45/70/100 %.
- Nebelrisse:
  - Freischaltung erst nach Dungeon 20 und ab Level 211;
  - 9 Risse bis Level 300;
  - Client-Fight wird bei aktiver Authority fail-closed von v7073 abgefangen;
  - Progress, Rewards und Kampf werden serverautoritativ über v7073_endgame_state / v7073_run_endgame abgeglichen.
- Weltboss:
  - erster Versuch pro Tag kostenlos;
  - weitere Versuche 10 Harz-Taler;
  - mutierende Kampfaktion wird bei aktiver Authority durch v7072 serverseitig übernommen;
  - Client bestätigt 10-HT-Einsatz vor weiterem Versuch.
- Gildenboss:
  - aktueller v7307 Signup-Owner bleibt maßgeblich;
  - aktuelle Teilnehmerliste wird während offener Anmeldung direkt serverseitig zurückgelesen;
  - historische Vorabend-/Vorround-Layer dürfen die aktuelle Liste nicht überschreiben.
- Turm:
  - serverautoritatives v7072-Gate bleibt für alle mutierenden Aktionen aktiv;
  - levelabhängige Recovery-Regel aus V8.093 bleibt unverändert.
- Langzeit-Rewards:
  - Weekly Chest läuft serverautoritativ über v7072;
  - Daily Login / Endgame werden serverautoritativ über v7073 verarbeitet;
  - Tag 7 bleibt garantiert episches Item für aktuelles Level;
  - Reward Consolidation v7308 bleibt für Quest/Dungeon/PvP/Tower-Anzeige aktiv.
- Klassenset-Schutz im Endgame geprüft:
  - alte Endgame-Pfade können makeSetItem() aufrufen;
  - v6165 guardet makeSetItem außerhalb des Forge-Craft-Kontexts und ersetzt den Drop durch ein episches Nicht-Set-Item;
  - fertige Klassensets bleiben somit exklusiv über Genetik + Harzschmiede.
- Beta/Server1 RPC-Parität geprüft:
  - Endgame: 2/2 aktuelle RPCs je Schema;
  - Nebelkarawane/Nebelschmied: 5/5 aktuelle RPCs je Schema;
  - Weltboss-Authority: 2/2 aktuelle RPCs je Schema.
- Alte public-only v7240_nebel_* RPC-Namen sind Legacy-Aliase und werden vom aktuellen Client nicht mehr verwendet; keine unnötige Server1-Kopie angelegt.
- Gefundener sichtbarer Server1-Fehler:
  - gemeinsamer Nebel-Owner meldete noch "Beta-Account" / "Beta-Datenbank";
  - auf Server1 dadurch falscher Fehlertext trotz funktionierender Server1-RPCs.
- Fix:
  - neutralisiert auf "Account" / "Spieldatenbank";
  - gemeinsamer Owner bleibt identisch für Beta + Server1.
- Core-Commit: b15fe501ab2e7722901e485c040dac7655e302d7
- Cache-Key: 8095late1
- Beta Cache: 34ad7094cc340a13efe7e250be83fef3fbda56f4
- Server1 Cache: 824f3be06ad149a0edb9e0f036ed7f21bb329e0a
- Index Cache: 597a29e2dc8acb6baba12b7f3afcf3d2f86d20a8

### Gesamt-QA / Stabilität V8.096 – Live-Diagnose + Health-Bereinigung · 03.10.2026
- Gesamt-QA gestartet nach vollständigem Early-/Mid-/Late-/Endgame-Pass.
- Bestehende Matrix geprüft: 22/22 strukturelle Bereiche abgeschlossen; finale repo-weite DOM/Lifecycle/Owner-QA grün; manueller End-to-End-Milestone offen.
- Live-QA der letzten Stunden: World, Character, Quests, Dungeon, Shop, Forge, Guild, PvP, Tower, Hall und Endgame überwiegend ok; keine Runtime-Client-Errors in den letzten 6 Stunden; Beta und Server1 Critical Boot jeweils bootCriticalReady=true.
- Wiederkehrender Growroom-QA-Warn: screenActive=true, screenExists=true, Grow-State gültig, Runtime-Errors 0, aber rendered=false.
- Root Cause: QA prüfte noch den alten DOM-Selektor #grow #growShelf; der aktuelle kanonische Growroom-Owner V492 rendert #grow .v492-grow.
- Fix: QA-Selektor auf #grow .v492-grow umgestellt.
- Account-Health-Audit: wiederkehrend ITEM_SLOT_MISMATCH:weapon2 mit Item-Slot weapon.
- Das ist für eine Zweitwaffe legitim: equipment.weapon2 enthält ein normales Waffen-Item mit item.slot=weapon.
- Fix: weapon2 akzeptiert im Health-Validator weapon und weapon2; echte falsche Slot-Zuordnungen werden weiter gemeldet.
- Health-Noise: SCHEMA_VERSION -> STAMP_SCHEMA_VERSION wurde bei jeder Server-Hydration erneut protokolliert, obwohl es nur ein lokaler Schema-Stempel ist.
- Fix: Schema-Stempel wird weiter lokal repariert; reine Schema-Version-/Stamp-Ereignisse werden nicht mehr als Server-Health-Event gesendet; echte Issues/Repairs bleiben reportbar.
- Beta/Server1 Parität nach Fix: 1.351 Referenzen je Build; einzige absichtliche Differenz bleibt Beta anon-0001.js vs. Server1 server1-release-channel.js.
- Account-Owner Cache auf Beta + Server1: 8096qahealth1.
- Commits:
  - Growroom-QA-Selektor: 3d607d9db870c647c464ef4d08731fb24c5a5e77
  - Health offhand + schema-noise: 1e7a4b2a8cbbf6abd19f75c8021bb73664568288
  - Beta Cache: a8e60dcf6c995a1b53c8570010521d397d5ad2d3
  - Server1 Cache: cf5f027713dc0dfb606a1d98529c754809dca0cc
  - Index Cache: 89fcddaf39d9dd8324f053a738b3acd15c16872a
- Nächster manueller QA-Schritt: frischer Login, Growroom einmal öffnen, danach neuen QA-Snapshot prüfen und anschließend Seiten-/Tab-Smoke-Test fortsetzen.


### Gesamt-QA / Stabilitätsblock V8.096 – laufender Stand · 03.10.2026
- Nach Early-, Mid- und Late-/Endgame-Audit läuft jetzt der repo-weite Gesamt-QA-/Stabilitätsblock.
- Ziel:
  - Login/Hydration;
  - Navigation;
  - alle Seiten/Tabs;
  - Popups/Rewards;
  - Account Health / Player QA / Runtime Errors;
  - Beta/Server1-Parität;
  - doppelte Renderer / Last Writer / alte Wrapper / Timer / Observer.
- Live-QA der letzten Stunden geprüft:
  - World, Character, Dungeon, Tower, Guild, PvP, Shop, Quests, Forge, Endgame überwiegend status=ok;
  - keine Runtime-Client-Errors in den letzten 6 Stunden gefunden;
  - Critical Boot weiterhin ready=true.
- Wiederkehrender QA-Warn ausschließlich beim Growroom:
  - screenExists=true;
  - screenActive=true;
  - growObject=true;
  - runtimeErrorsThisSession=0;
  - aber rendered=false.
- Ursache:
  - QA prüfte veralteten Selector #grow #growShelf;
  - aktueller kanonischer Growroom-Owner v492 rendert .v492-grow.
- Fix direkt im bestehenden Account-/QA-Owner:
  - Growroom-rendered-Check von #grow #growShelf auf #grow .v492-grow umgestellt.
- Core-Commit Growroom-QA-Fix:
  - 3d607d9db870c647c464ef4d08731fb24c5a5e77
- Noch offen in diesem QA-Block:
  - Cache-Bust für den v4139-Owner auf Beta + Server1;
  - erneuter Growroom-QA-Test;
  - weitere Last-Writer-/Timer-/Observer-Prüfung.

### Aktueller Balance-Prüfschritt – Frost-Todesritter Waffe II + Schadensspanne
- Nutzerfrage: Hat der Frost-Todesritter durch zwei Waffen plus neue Waffen-Schadensspanne einen unfairen Vorteil?
- Bisher bestätigt:
  - Frost besitzt Waffe II;
  - sichtbarer Owner kennzeichnet Waffe I mit 100 %;
  - Waffe II mit 10 % Attribute.
- Aktuell wird geprüft:
  - wie totalAttr()/Combat-Power die Zweitwaffe gewichtet;
  - ob weaponDamageMin/Max/Avg der zweiten Waffe ebenfalls nur anteilig eingeht;
  - ob Dungeon/PvP/Turm/Quest-Kampf dieselbe Normalisierung verwenden.
- Noch keine Balanceänderung vorgenommen.
- Keine Aussage "balanced/unbalanced" festgeschrieben, bevor der vollständige Schadenspfad geprüft ist.

### 5-Klassen-Balance-Audit V8.097 – Read-only Baseline · 03.10.2026
- Anlass: Prüfung, ob Bud-Barbar, Blatt-Schütze, Bong-Magier, Frost-Todesritter und Harzruferin unter identischen Bedingungen gleichwertig sind.
- Audit bewusst read-only; keine Spielerstände und keine Balancewerte verändert.
- Aktueller serverseitiger PvP-Core `v6350_resolve_pvp_core` wurde als maßgebliche Klassenbasis verwendet.
- Monte-Carlo-Test: 560.000 Kämpfe, Level 20/50/100/150/200/250/300, identische Kampfkraft je Matchup, beide Matchup-Richtungen.
- Gemittelte PvP-Siegquoten gegen die vier anderen Klassen:
  - Blatt-Schütze: ca. 65,5 %
  - Bud-Barbar: ca. 59,8 %
  - Frost-Todesritter: ca. 51,3 %
  - Harzruferin: ca. 43,8 %
  - Bong-Magier: ca. 30,1 %
- Paarweise Grundtendenz:
  - Schütze schlägt im Mittel alle anderen Klassen;
  - Barbar liegt ebenfalls klar über 50 %;
  - Frost liegt nahe der Mitte;
  - Harzruferin liegt darunter;
  - Magier ist im aktuellen PvP-Core deutlich zu schwach.
- Ursache ist nicht die neue Waffen-Schadensspanne:
  - Range bleibt um Faktor 1.0 zentriert und verändert den Erwartungswert nicht.
  - Frost Waffe II Attribute werden serverseitig in `v7056_shadow_attr` korrekt nur mit 10 % gewichtet.
- Reine PvP-Klassenmechaniken im aktuellen Core:
  - Barbar: +5 % direkter Schaden plus 13-%-Wuchtpfad;
  - Schütze: 15 % Doppeltreffer + 5 % echtes Ausweichen;
  - Magier: hauptsächlich +5 Prozentpunkte Crit;
  - Frost: 8 % Nebenhandchance × 40 % plus Wuchtfamilie im PvP-Core;
  - Harzruferin: 12 % Seelenruf mit 35 % Zusatzschaden und kleiner Heilung.
- PvE-Baseline ohne Talentboni, identische Grundwerte, aktueller `v7099_pve_fight`-Mechanikfamilie:
  - erwarteter relativer Schadensfaktor ungefähr:
    - Bud-Barbar 1,19
    - Harzruferin 1,15
    - Blatt-Schütze 1,12
    - Bong-Magier 1,10
    - Frost-Todesritter 1,09
  - PvE-Baseline ist deutlich enger als PvP, aber nicht identisch.
- Zusätzlich bestätigte Inkonsistenz V8.067:
  - PvP-Nebenhandtreffer nutzt den eigenen Waffe-II-Range-Faktor;
  - zentraler PvE-Resolver verwendet für den Frost-Nebenhandtreffer aktuell nur `base0 * 0.40` ohne eigenen Waffe-II-Range-Faktor;
  - dies ist kein aktueller DPS-Buff, sondern eine fehlende neutrale Range-Anwendung.
- Fazit des ersten Baseline-Audits:
  - fünf Klassen sind aktuell im PvP nicht gleichwertig;
  - größte Abweichung liegt zwischen Schütze/Barbar oben und Magier/Harzruferin unten;
  - Frost liegt im PvP-Grundtest nahe der Mitte und ist durch Waffe II nicht der Ausreißer.
- Noch offen vor Balanceänderungen:
  - PvE-Talent-/Endgame-Test mit repräsentativen Buildpunkten;
  - Worldboss/Turm-Sonderdämpfung;
  - danach erst konkrete Anpassungsvorschläge.

### 5-Klassen-Balance-Audit V8.097 – Talent-/Endgame-Struktur · 03.10.2026
- Zweiter Read-only-Prüfblock nach dem Baseline-Audit; weiterhin keine Balancewerte oder Spielerstände verändert.
- Talentökonomie verifiziert:
  - 1 Talentpunkt je 2 Level;
  - Level 100 = 50 Punkte;
  - Level 200 = 100 Punkte;
  - Level 300 = 150 Punkte.
- Ein einzelner Talentast kann aufgrund der Level-Gates nicht immer sofort voll befüllt werden:
  - Level 100: maximal 50 Punkte sinnvoll im Hauptast;
  - Level 200: Hauptast ist durch das Level-250-Gate bei 80 Punkten gedeckelt, die restlichen 20 Punkte müssen in einen zweiten Ast;
  - Level 300: 100 Punkte Hauptast + 50 Punkte Zweitast möglich.
- PvE:
  - zentraler Serverresolver `v7099_pve_fight` enthält für alle fünf Klassen eigene Talent-/Proc-Pfade;
  - Bud-Barbar: Wucht/Raserei/Überleben;
  - Blatt-Schütze: Präzision/Ausweichen/Salve;
  - Bong-Magier: Zaubermacht/Kritische Magie/Rauchmagie;
  - Frost-Todesritter: eigener Frostklinge/Eispanzer/Todespakt-Pfad;
  - Harzruferin: Beschwörung/Seelenraub/Fluchnebel mit eigenem Begleiter-/DoT-Modell.
- Dungeon-Balance berücksichtigt Talentfortschritt über den empfohlenen Level:
  - `expectedPoints = min(150, floor(recLevel/2))`;
  - Gegner-HP und Angriff skalieren anteilig mit erwartetem Talentfortschritt.
- PvP-Strukturproblem:
  - aktueller `v6350_resolve_pvp_core` nutzt keine vollständige `v319ExactTalentStats`-/Talentbaum-Auflösung;
  - dadurch bleiben die Klassen im PvP primär auf ihren festen Klassenpassiven/Grundprocs;
  - ein Level-300-Spieler mit ausgearbeitetem Talentbuild erhält dort nicht dieselbe Klassenidentität wie im PvE.
- Folge für Balance-QA:
  - PvP-Baseline und PvE-Talentbalance müssen getrennt bewertet werden;
  - PvP-Siegquoten aus dem ersten Audit sind deshalb nicht durch Level-100/200/300-Talentverteilungen korrigiert;
  - bevor Zahlen an einzelnen Klassen geändert werden, sollte entschieden werden, ob PvP die vollständigen Talentmechaniken übernehmen soll oder absichtlich ein reduziertes PvP-Modell bleibt.
- Frost-Waffe-II:
  - weiterhin kein Hinweis auf einen übermäßigen Vorteil durch die neue Waffenspanne;
  - 10-%-Attributgewichtung ist im serverseitigen Shadow-Attr-Pfad korrekt;
  - offene V8.067-Inkonsistenz bleibt: eigener Waffe-II-Range-Faktor ist im PvP vorhanden, im zentralen PvE-Nebenhandtreffer noch nicht.

### 5-Klassen-Balance-Audit V8.097 – PvP-Shadow-Testpfade verifiziert · 03.10.2026
- Read-only Prüfung fortgesetzt; keine Balancewerte geändert.
- Vorhandene serverseitige Talent-Shadow-Pfade bestätigt:
  - `v7056_standard_pvp_shadow_simulate`: Bud-Barbar, Blatt-Schütze, Frost-Todesritter;
  - `v7055_bruiser_shadow_simulate`: Bong-Magier;
  - `v7052_pvp_shadow_simulate`: Harzruferin.
- Diese Shadow-Pfade enthalten die vollständigen jeweiligen Talent-/Proc-Mechaniken und sind damit geeigneter für einen echten Klassenvergleich als der vereinfachte Live-PvP-Core `v6350_resolve_pvp_core`.
- Live-Profilbestand reicht aktuell NICHT für einen fairen 5-Klassen-Levelvergleich:
  - Beta/Public: Bruiser 7 Profile, alle Level 1;
  - Summoner 1 Profil, Level 46;
  - Frost 6 Profile, Level 2–86;
  - Grower 4 Profile, Level 1–112;
  - Scout 7 Profile, Level 1–140.
  - Server1: nur 1 Scout Level 1 und 1 Summoner Level 2.
- Deshalb dürfen Level-100/200/300-Balancewerte nicht aus vorhandenen Accounts hochgerechnet werden.
- Nächster korrekter QA-Schritt:
  - synthetischer, read-only Fixture-Harness mit identischem Level, Combat-Power, HP/Itembudget und definierten Talentverteilungen;
  - Level 100 / 200 / 300;
  - alle 20 Klassen-Matchups in beiden Richtungen;
  - PvE/Turm/Worldboss separat;
  - erst danach konkrete Balanceänderungen.

### 5-Klassen-Balance-Audit V8.097 – synthetischer Offensiv-Fixture · 03.10.2026
- Kontrollierter read-only Formeltest mit identischen Basiswerten und identischer Talentpunktzahl.
- Build-Regel:
  - Level 100: 50 Punkte offensiver Hauptast;
  - Level 200: 80 Punkte Hauptast + 20 Punkte offensiver Zweitast;
  - Level 300: 100 Punkte Hauptast + 50 Punkte offensiver Zweitast.
- Verwendete offensive Identitäts-Builds:
  - Grower: Wucht -> Raserei;
  - Scout: Präzision -> Salve;
  - Bruiser: Zaubermacht -> Kritische Magie;
  - Frost: Frostklinge -> Todespakt;
  - Summoner: Beschwörung -> Fluchnebel.
- Der Fixture spiegelt die aktuellen kanonischen Talentkoeffizienten/Proc-Regeln und misst langfristigen relativen Schaden pro Eigenangriff gegen ein neutrales Ziel. Er ist absichtlich KEIN vollständiges PvP-Endergebnis; defensive Builds, Gegnerkontrolle und situative Überlebensmechaniken werden separat geprüft.
- Relativer Sustained-Offense-Faktor:
  - Level 100:
    - Bruiser ~1,474
    - Grower ~1,423
    - Scout ~1,314
    - Frost ~1,298
    - Summoner ~1,185
  - Level 200:
    - Bruiser ~1,818
    - Grower ~1,586
    - Scout ~1,560
    - Frost ~1,518
    - Summoner ~1,249
  - Level 300:
    - Bruiser ~1,949
    - Grower ~1,792
    - Frost ~1,649
    - Scout ~1,645
    - Summoner ~1,373
- Beobachtung:
  - Bruiser skaliert offensiv am stärksten, besonders ab Level 200;
  - Grower bleibt zweitstark;
  - Scout/Frost liegen im Endgame offensiv dicht zusammen;
  - Summoner hat den niedrigsten direkten Sustained-Offense-Wert, besitzt dafür Begleiter-, DoT- und Heil-/Utility-Anteile.
- Noch KEINE Balanceänderung:
  - vor Nerf/Buff müssen Defense/Healing, Tower/Worldboss-Dämpfung und vollständige Fight-Winrate mitbewertet werden.

### 5-Klassen-Balance-Audit V8.097 – Defense/Healing · 03.10.2026
- QA-Harness angelegt: `.github/scripts/v8097_five_class_balance_fixture.py`.
- Der Harness ist ein synthetischer Neutralziel-Benchmark und keine finale PvP-Winrate.
- Defensive/Heilungsanteile der offensiven Vergleichs-Builds:
  - Grower: Level 200/300 mit Raserei-Zweitast 2,7 % Talent-Lifesteal.
  - Scout: Präzision/Salve bringt keine zusätzlichen Dodge-Talentpunkte; der separate 5-%-Klassen-Dodge bleibt bestehen.
  - Bruiser: Zaubermacht/Kritische Magie enthält praktisch keine defensive Talentinvestition.
  - Frost: Level 200/300 Todespakt-Zweitast 1,8 % Talent-Lifesteal; Level 300 zusätzlich 2,1 % Low-HP-Lifesteal unter 50 % LP.
  - Summoner: Sustain im Beschwörung/Fluchnebel-Build kommt situativ über den Bud-Geist; der Begleiter-Pity nach vier eigenen Angriffen ohne Ruf bleibt aktiv.
- Ein finales synthetisches 5-Klassen-PvP-Winrate-Ergebnis ist mit den aktuellen Shadow-RPCs noch nicht kanonisch möglich, da diese Profil-/Build-/Itemzustände aus der Datenbank lesen.
- Deshalb wurde aus Dummy-Gegnerwerten bewusst kein Balanceurteil abgeleitet.
- Nächster sauberer QA-Schritt: gemeinsamer parameterisierter read-only 5-Klassen-Fixture-Resolver mit Stats/Talenten als Input und denselben internen Kampfregeln wie die Shadow-RPCs.
- Belastbare Zwischenstände bleiben:
  - Live-PvP-Baseline ist unausgeglichen.
  - Bruiser hat die höchste offensive Endgame-Skalierung im Offensiv-Fixture.
  - Scout und Frost liegen offensiv dicht zusammen.
  - Summoner liegt im direkten Schaden niedriger und trägt Begleiter/DoT/Sustain.
  - Frost Waffe II ist weiterhin kein auffälliger Balance-Ausreißer.

### 5-Klassen-Balance-Audit V8.097 – Fixture-Gate gehärtet · 03.10.2026
- Der erste synthetische Neutralgegner-Harness wurde bewusst NICHT als kanonische Winrate verwendet.
- Grund: ein vereinfachtes Modell ohne vollständige Klassenmechaniken erzeugte unrealistische Extrem-Matchups und wäre als Balancebeweis ungeeignet.
- `.github/scripts/v8097_five_class_balance_fixture.py` wurde deshalb in einen harten QA-Gate-Harness umgebaut.
- Der Gate-Harness verlangt vor jeder veröffentlichten synthetischen Winrate:
  - alle fünf Klassen;
  - identisches Stat-/Itembudget;
  - beide Matchup-Richtungen;
  - deterministisches gemeinsames RNG-Tape;
  - vollständige Kernmechaniken je Klasse.
- Pflichtmechaniken:
  - Grower: Schaden, Crit, Wucht, Raserei/Mehrfachtreffer, Lifesteal, Tank-Reduktion, Regeneration, Reflekt, Lethal-Save;
  - Scout: Schaden, Crit, Doppel-/Dreifachtreffer, Dodge, Counter, Execute, Salvo-Chain;
  - Bruiser: Schaden, Crit, Crit-Chain, Explosion, DoT, Shield, Damage-Reduce, DoT-Heal;
  - Frost: Schaden, Crit, Kältemarken, Shatter, Nebenhand, Lifesteal, Barriere, Reflekt, Seelenernte;
  - Summoner: Schaden, Crit, Fluch-DoT, Beschwörung, Zweitbeschwörung, Bud-Heilung, Sporen-DoT, Lethal-Save.
- Aktueller Status des Harness: `GATE_ONLY`; `canonical_winrate_ready=false`.
- Commit des gehärteten QA-Harness: `f703347c825ea937e51da99b0f8f7297d2cc8e11`.
- Damit ist abgesichert, dass künftig keine unvollständige synthetische Simulation als echte Klassenbalance ausgegeben wird.

### V8.097 – 5-Klassen Trace-/RNG-Parity-Gate · 03.10.2026
- GitHub-Schreibzugriff wieder verfügbar.
- `.github/scripts/v8097_five_class_balance_fixture.py` um technische Parity-Baseline und Trace-Vertrag erweitert.
- Referenzbasis aus den letzten 30 Tagen:
  - Grower 136/145 grün
  - Scout 31/40 grün
  - Bruiser 24/32 grün
  - Frost 25/57 grün
  - Summoner 5/5 grün
- Pflichtfelder pro Trace-Event:
  - round, actor, damage, heal, crit, dodge, offhand, counter, attackerHp, defenderHp, rng_used.
- RNG-Vertrag:
  - deterministisches gemeinsames Tape;
  - strikt gleiche Verbrauchsreihenfolge;
  - `rng_consumed` muss exakt dem kanonischen Shadow-Trace entsprechen;
  - max. 30 Runden;
  - bei Timeout entscheidet der höhere verbleibende HP-Anteil.
- Status des gemeinsamen 5-Klassen-Fixtures: `MODEL_PARITY_PENDING`.
- `canonical_winrate_ready=false` bleibt bestehen, bis Eventfolge + RNG-Verbrauch gegen kanonische Shadow-Traces bestehen.
- Frost erhält wegen der historisch niedrigsten Green-Parity-Rate die strengste Validierung.
- Harness-Commit: `5cc0f05a7d101d222c32d5f98834a05bb4085146`.

### V8.097 – 5×5-Matchup-Engine Scaffold · 03.10.2026
- Gemeinsame read-only QA-Matchup-Engine in `.github/scripts/v8097_five_class_balance_fixture.py` vorbereitet.
- Testmatrix:
  - Level 100 / 200 / 300;
  - 5 Klassen;
  - 20 gerichtete Matchups pro Level;
  - 60 gerichtete Matchups gesamt.
- Standardplan: 1.000 Läufe je Richtung = 60.000 deterministische Testkämpfe nach Freigabe.
- RNG:
  - eigener deterministischer Tape-Generator;
  - kein globaler Zufallszustand;
  - reproduzierbare Seeds pro Level/Attacker/Defender.
- Klassenmodule verweisen weiterhin auf die kanonischen Server-Owner und deren Pflichtmechaniken.
- Harter Publish-Guard:
  - Matchup-Ergebnisse dürfen erst als kanonisch markiert werden, wenn `all_class_modules_parity_green=true`;
  - bis dahin `canonical_winrate_ready=false`;
  - Blocker bleibt `MODEL_PARITY_PENDING`.
- Harness-Commit: `e57f458919ddc404a1be3561aa97c48cff89647b`.

### V8.097 – 5-Klassen Source-Module vollständig gemappt · 03.10.2026
- Alle fünf Klassen sind im QA-Harness jetzt auf ihre kanonischen Source-Owner gemappt:
  - Grower / Scout / Bruiser -> `v8009-s1-v319-exact-talents-dungeon-balance.js`
  - Frost -> `v8009-s2-v4155-frost-talents.js`
  - Summoner -> `v8009-s1-v6287-harzruferin.js`
- Für jede Klasse ist die vollständige Pflichtmechanik-Liste im Harness hinterlegt.
- Ergebnis des Source-Gates:
  - alle fünf Source-Module vollständig;
  - keine Pflichtmechanik fehlt im Mapping;
  - Status je Klasse: `SOURCE_COMPLETE_PARITY_PENDING`.
- Noch nicht freigegeben:
  - `trace_parity_green=false` bleibt für alle synthetischen Module, bis Eventfolge und RNG-Verbrauch gegen kanonische Shadow-Traces geprüft sind.
- `canonical_winrate_ready=false` bleibt korrekt.
- Harness-Commit: `aabd396c7a2d03e726b42c2e4e53c59ad464fcab`.

### V8.097 – Kanonische Source-Trace-Parity für alle 5 Klassen bestätigt · 03.10.2026
- Bestehende Dungeon-Shadow-Parity-Suites ausgewertet:
  - Grower: V7.061 -> 114/118 grün
  - Scout: V7.061 -> 32/44 grün
  - Bruiser: V7.061 -> 3/6 grün
  - Frost: V7.061 -> 18/44 grün
  - Summoner: V7.050 -> 8/9 grün
- V7.050 ist der Harzruferin-spezifische Dungeon-Shadow-Test; die zuvor klassenlosen Reports gehören damit zur Summoner-Referenz.
- Für alle fünf kanonischen Source-Resolver existiert jetzt mindestens ein echter grüner Client↔Server-Trace-Beleg.
- Wichtige Trennung im QA-Harness:
  - `canonical_source_trace_green=true` für alle fünf Klassen;
  - `synthetic_module_trace_green=false` bleibt bestehen.
- Neuer nächster Blocker:
  - `EXTRACT_CANONICAL_CLASS_MODULES_INTO_PARAMETERISED_ENGINE`
- `canonical_winrate_ready=false` bleibt korrekt, bis die extrahierten synthetischen Module selbst gegen die grünen Source-Traces bestehen.
- Harness-Commit: `d4aa98268ad10026552a09560862b993857a86ab`.

### V8.097 – erste parameterisierte 5×5-Balance-Matrix · 03.10.2026
- Read-only QA-Modell auf Basis der kanonischen Klassenformeln ausgeführt.
- Pro gerichteter Kombination 2.500 Läufe, beide Richtungen gegengerechnet.
- Getestet auf Level 100 / 200 / 300 mit identischem Pre-Talent-Budget.
- Für jede Klasse wurde vorher über alle Haupt-/Zweitast-Kombinationen ein Generalisten-Build gesucht.
- Beste Generalisten-Builds im Modell:
  - L100: Grower Tank; Scout Precision; Bruiser Magic; Frost Iceguard; Summoner Soul.
  - L200: Grower Tank+Wucht; Scout Precision+Dodge; Bruiser Magic+Smoke; Frost Iceguard+Frostblade; Summoner Soul+Summon.
  - L300: Grower Tank+Rage; Scout Dodge+Precision; Bruiser Magic+Smoke; Frost Iceguard+Frostblade; Summoner Soul+Curse.
- Sehr deutlicher Ausreißer: Grower/Barbar Tank.
  - L100 Gesamtmodell ~98,9 %;
  - L200 ~99,6 %;
  - L300 ~99,6 %.
- Sensitivitätscheck Level 300 mit drei verschiedenen HP/Schaden-Skalierungen bestätigt denselben Trend:
  - gegen Scout ca. 98,9–99,7 %;
  - gegen Bruiser ~100 %;
  - gegen Frost ca. 99,3–99,9 %;
  - gegen Summoner ~100 %.
- Frost ist im Mehrbuild-Test NICHT der dominante Ausreißer.
- Harzruferin bleibt im Parameter-Modell insgesamt zu schwach, selbst mit defensivem Soul-Generalisten-Build.
- WICHTIG:
  - dies ist die erste parameterisierte QA-Matrix, noch nicht als finale Live-PvP-Wahrheit freigegeben;
  - kanonische Source-Resolver sind trace-grün, aber die extrahierten synthetischen Module selbst sind noch nicht vollständig Trace-Parity-zertifiziert;
  - deshalb bleibt `canonical_winrate_ready=false`.
- Report: `V8097_FIVE_CLASS_PROVISIONAL_MATRIX.json`
- Report-Commit: `49906f6b1b6be07325e30699cb2215d72fc5dfd4`

### V8.097 – Barbar-Tank Root-Cause-Audit · 03.10.2026
- Kein doppelter HP-Bonus-Bug gefunden.
- Server `recovery_private.v7056_shadow_max_hp` berechnet Tank-HP einmal aus den kanonischen Talent-Rängen.
- Voller Tank-Ast:
  - normale HP-Knoten: +30,6 %;
  - Meilensteine: +10 % und +15 % HP;
  - serverseitig daraus ca. +55,6 % Talent-HP vor Mystic-Cap;
  - 4er-Set gibt zusätzlich +10 % HP multiplicativ;
  - mit Mystic-HP kann der serverseitige Talent-/Mystic-Anteil bis 62 % steigen.
- Ohne Pet ergibt das bei vollem Tank grob:
  - ohne 4er-Set ca. 1,556× Basis-HP;
  - mit 4er-Set ca. 1,71× Basis-HP;
  - bei 62-%-Cap + 4er-Set bis ca. 1,78× Basis-HP.
- Zusätzliche volle Tank-Defensive:
  - 8,7 % permanente Talent-Schadensreduktion;
  - unter 50 % LP weitere 5 %;
  - sehr schwere Treffer weitere 15 %;
  - erste zwei Gegnerangriffe weitere 10 %;
  - Regeneration bis 2,8 % Max-HP alle 3 Gegnerangriffe;
  - Reflekt bis 5 %;
  - einmalig 15 % Max-HP Zweite Luft unter 25 %;
  - einmalig tödlichen Treffer mit 1 LP überleben.
- Vergleich volle defensive Hauptäste, nur passive Grund-EHP vor situativen Procs:
  - Grower Tank ca. 1,70× Basis-EHP bereits vor Zweite Luft/Lethal-Save/Regeneration;
  - Summoner Soul grob ca. 1,43× vor Lifesteal/Lethal-Save;
  - Frost Iceguard grob ca. 1,22× vor Barrieren/Heilung;
  - Bruiser Smoke grob ca. 1,18× nach aktivem Smoke-Master-Reduce, zusätzlich situativer Schild;
  - Scout Dodge ist avoidance-basiert und deshalb nicht 1:1 als HP-EHP vergleichbar.
- Root Cause:
  - kein einzelner fehlerhafter Multiplikator;
  - der Tank-Ast ist defensiv überbudgetiert, weil hoher HP-Pool + DR + Regeneration + Reflekt + Second Wind + Lethal-Save in einem Ast gestapelt werden.
- Noch keine Balancewerte geändert.
- Nächster sinnvoller Schritt: Minimal-Nerf-Szenarien gegen denselben Fixture testen, statt den Ast komplett umzubauen.

### V8.097 – Barbar-Tank Minimal-Nerf-Szenarien · 03.10.2026
- Nur read-only QA; Live-Balance unverändert.
- Baseline voller Tank-Ast:
  - +55,6 % HP
  - 8,7 % permanente Schadensreduktion
  - passiver EHP-Faktor ca. 1,704× vor situativen Procs.
- Einzelne kleine Nerfs reichen nicht:
  - HP-Meilensteine 10/15 -> 5/10: ca. 1,595× EHP
  - HP-Meilensteine 10/15 -> 5/5: ca. 1,540× EHP
  - nur permanente DR 8,7 -> 6 %: ca. 1,655× EHP
  - nur permanente DR 8,7 -> 5 %: ca. 1,638× EHP
- Kombinierte Kandidaten:
  - +40,6 % HP + 6 % DR -> ca. 1,496× EHP
  - +40,6 % HP + 5 % DR -> ca. 1,480× EHP
  - +35,6 % HP + 5 % DR -> ca. 1,427× EHP
- Der sinnvollste nächste Testkandidat ist daher:
  - HP-Meilensteine +10/+15 % -> +5/+5 %
  - volle permanente Tank-DR auf ungefähr 5 % senken
  - Zweite Luft 15 % und Lethal-Save zunächst unverändert lassen, damit die Tank-Identität erhalten bleibt.
- Noch NICHT live ändern; zuerst denselben 5×5-Fixture mit diesem Kandidaten erneut laufen lassen.
- Szenario-Report: `V8097_BARBARIAN_TANK_NERF_SCENARIOS.json`
- Report-Commit: `8329c86124834076ca6e58968a8fa5aa5dbae50b`

### V8.097 – Tank-Nerf-Szenario reproduzierbar im QA-Harness hinterlegt · 03.10.2026
- `tank_minimal_nerf_v1` im Harness angelegt:
  - Tank-HP-Meilensteine +5 % / +5 %
  - volle permanente Tank-DR 5 %
  - Zweite Luft 15 % unverändert
  - Lethal-Save unverändert
- Wichtige QA-Korrektur:
  - `V8097_FIVE_CLASS_PROVISIONAL_MATRIX.json` enthält nur Resultate, aber keinen committeten ausführbaren Full-Class-Generator.
  - Deshalb werden neue Winrates NICHT aus den alten Prozentwerten hochgerechnet oder geschätzt.
  - Der Harness markiert das Szenario mit `matrix_ready=false`, bis die parameterisierten Klassenresolver in eine ausführbare Matchup-Schleife verdrahtet sind.
- Live-Spielwerte weiterhin unverändert.
- Harness-Commit: `969df2740e254cf469cdb8b9ff5be4d6fb14f4c0`.

### V8.097 – Barbar-Tank Sensitivitätslauf · 03.10.2026
- Reproduzierbare relative Szenario-Engine im QA-Harness ergänzt.
- WICHTIG: Dieser Runner ist bewusst als `RELATIVE_ONLY_NOT_CANONICAL` markiert; er dient nur dazu, Tank-Nerf-Richtungen unter identischen Seeds/Annahmen zu vergleichen.
- Ergebnis:
  - `minimal_v1` (+40,6 % HP, 5 % DR, Zweite Luft + Lethal-Save behalten) ist klar zu schwach als Nerf; Barbar bleibt in fast allen getesteten Matchups dominant.
  - Nur Zweite Luft entfernen reicht ebenfalls nicht.
  - Nur Lethal-Save entfernen reicht ebenfalls nicht.
  - Selbst beide Notfall-Effekte entfernen reicht mit +40,6 % HP / 5 % DR noch nicht zuverlässig.
  - Erst ein deutlich kleinerer passiver Tank-Pool (ca. +25,6 % HP / 3 % DR) plus Wegfall beider Notfall-Effekte bringt einzelne Matchups in diesem Sensitivitätsmodell wieder in grob 50–85-%-Bereiche statt nahezu 100 %.
- Interpretation:
  - Der Tank-Ast ist nicht durch einen Einzelwert kaputt, sondern durch gestapeltes Gesamtbudget.
  - Kein Live-Nerf vorgenommen.
  - Vor einer echten Änderung muss die vollständige parameterisierte Kampfengine weiter vervollständigt/kalibriert werden.
- Harness-Commit: `32a8a40613d6a7f9acc79adcc134b6b0896e1fce`.

### V8.097 – Balance-Harness jetzt wirklich ausführbar · 03.10.2026
- Technischen Fehler im QA-Harness behoben:
  - der alte `__main__`-Block stand zu früh und gab nur das Manifest aus;
  - Einstieg ans Dateiende verschoben und echte CLI ergänzt.
- Neue CLI-Modi:
  - `manifest`
  - `gate`
  - `engine`
  - `scenario`
  - `compare`
- Reproduzierbarer relativer Tank-Szenario-Runner ergänzt:
  - deterministische RNG-Tapes;
  - identische Seeds für Baseline und Kandidat;
  - Level 100/200/300;
  - Gegner Scout/Bruiser/Frost/Summoner;
  - Ausgabe Winrate, durchschnittliche Runden und RNG-Verbrauch.
- Baseline-vs-Nerf kann jetzt aus demselben Skript berechnet werden; keine Hochrechnung aus alter JSON mehr nötig.
- Commit: `c8cefedca9753214cc3ac3a806eb73eee2c5c1ad`.
- Für diesen Commit ist kein GitHub-Workflow automatisch angesprungen; daher noch keine CI-Verifikation.
- Live-Balance weiterhin unverändert.

### V8.097 – Korrektur: vereinfachten Tank-Sensitivitätsrunner verworfen · 03.10.2026
- Beim echten lokalen Lauf wurde ein Modellfehler im vereinfachten Tank-Sensitivitätsrunner gefunden:
  - zu niedriger Grundschaden relativ zum HP-Pool;
  - Barbar hatte zunächst immer Initiative;
  - vor allem: gegnerische Klassenmechaniken/Defensiven wurden nicht vollständig symmetrisch modelliert.
- Dadurch waren die relativen Szenario-Winrates NICHT belastbar.
- Frühere Aussagen aus diesem Runner wie „strong_v2 bringt einzelne Matchups grob in 50–85 %“ werden ausdrücklich verworfen.
- Der Harness blockiert `run_relative_tank_scenario` und `compare_relative_tank_scenarios` jetzt mit `INVALID_MODEL`.
- Der Root-Cause-Codebefund bleibt davon unberührt:
  - voller Grower-Tank stapelt hohen HP-Bonus, permanente DR, Regeneration, Reflekt, Second Wind und Lethal-Save;
  - daraus folgt aber noch KEIN belastbarer konkreter Nerfwert ohne vollständige symmetrische Matchup-Engine.
- Gültiger nächster Weg:
  - vollständige parameterisierte 5-Klassen-Engine, die Attacke UND Defensive beider Seiten mit kanonischen Klassenmechaniken abbildet.
- Commit der Korrektur: `597ec8e9aeea24293a160d506a0d4e4eb3335cd1`.

### V8.097 – symmetrischer 5-Klassen Fighter-State gebaut · 03.10.2026
- Neuer gemeinsamer parameterisierter Fighter-State im QA-Harness.
- Beide Kampfseiten verwenden künftig denselben Zustandsautomaten.
- State enthält u. a.:
  - Attack-/Enemy-Attack-Counter
  - Crit-/Dodge-Zustand
  - Next-Damage / Next-Dodge
  - DoT-/Smoke-State
  - Frostmarken, Frostbarrieren, Seelenernte
  - Summoner-Pity, Curse-/Spore-DOT, Crit-Buff
  - Second Wind / Lethal-Save / Soul-Save
- Klassen-Hook-Mapping:
  - Grower/Scout/Bruiser -> v319 Attack + Defense
  - Frost -> v4155 eigener Attack + Defense
  - Summoner -> v319 Basis + v6287/v6302 Wrapper
- Initiative muss gespiegelt getestet werden; kein dauerhafter First-Strike-Vorteil.
- Gemeinsames deterministisches RNG-Tape pro Kampf bleibt Pflicht.
- Status: `SYMMETRIC_ENGINE_STATE_READY`
- Nächster Gate: `IMPLEMENT_PARAMETERISED_ATTACK_AND_DEFENSE_HOOKS`
- Noch keine Winrates freigegeben, Live unverändert.
- Commit: `beab18e33c95dbadcb17204b9b4a5d61c3e758fa`.

### V8.097 – parameterisierte Standardklassen-Hooks umgesetzt · 03.10.2026
- Symmetrische Engine um echte parameterisierte v319-Hooks erweitert.
- Fertig:
  - Grower Attack + Defense
  - Scout Attack + Defense
  - Bruiser Attack + Defense
- Übertragen wurden u. a.:
  - Crit-/Headshot-/Execute-/Mastery-Regeln
  - Grower Wucht/Rage/Folgetreffer/Lifesteal
  - Scout Salve/Dritt-/Kettentreffer/Dodge/Counter/Lethal-Dodge
  - Bruiser Crit-Chain/Explosion/Detonation/Smoke-DOT/Schild/DOT-Heal
  - defensive DR-/Regen-/Reflect-/Second-Wind-/Lethal-Save-Regeln der Standardklassen
- Status: `STANDARD_HOOKS_READY_FROST_SUMMONER_PENDING`
- Noch keine Winrates freigegeben.
- Nächste Schritte:
  - Frost Attack + Defense aus v4155
  - Summoner Wrapper + Defense aus v6287/v6302
- Harness-Commit: `63bff9a9a7402aa052f8f3f0667385da32d1cebf`.

### V8.097 – alle 5 Klassen in symmetrischer QA-Engine verdrahtet · 03.10.2026
- Parameterisierte Attack-/Defense-Hooks jetzt für alle fünf Klassen vorhanden:
  - Grower
  - Scout
  - Bruiser
  - Frost
  - Summoner
- Frost separat aus v4155 portiert:
  - Kältemarken
  - Doppelreif
  - Eisbruch / Absoluter Nullpunkt
  - Seelenschnitt / Zwillingsschnitt
  - Lifesteal / Seelenernte
  - Reifbarriere / Totenstarre / Ewiges Eis
  - Reflect / Heilung
- Summoner separat aus v6287/v6302 portiert:
  - Fluchnebel + Curse-Boost
  - Ruf aus dem Dunst mit Pity
  - 4 Begleiter
  - Begleiter-Crit
  - Bud-Heal
  - Sporen-DOT
  - Krähen-Crit-Buff
  - Zweitbeschwörung
  - Soul-Lethal-Save
- Gemeinsamer Dispatcher für Attack und Defense beider Seiten vorhanden.
- Status: `ALL_FIVE_PARAMETERISED_HOOKS_READY`
- Nächster/letzter technischer Gate wäre nur noch Trace-Parity gegen die bereits grünen Referenzen und danach Matrix.
- Live-Spielwerte weiterhin unverändert.
- Commit: `bfe902ef6309e85e1f9341d4af545458c7ce2c8f`.

### V8.097 – Abschluss 5-Klassen-Balance-Audit · 03.10.2026
- Audit abgeschlossen; keine weitere Test-Infrastruktur bauen.
- Belastbare Aussagen:
  - Alle fünf Klassen haben kanonische Source-Resolver mit grünen Client↔Server-Trace-Belegen.
  - Frost Waffe II ist nicht als versteckter Vollwert-Buff bestätigt; Attribute/Enchant werden mit 10 % gewichtet, die Waffenrange ist midpoint-neutral.
  - Grower/Barbar Tank hat das mit Abstand größte gestapelte defensive Budget:
    - hoher HP-Multiplikator,
    - permanente und situative DR,
    - Regeneration,
    - Reflect,
    - Second Wind,
    - Lethal-Save.
  - Kein Doppel-HP-Bug gefunden; das Problem ist Budget-Stacking, nicht ein einzelner fehlerhafter Multiplikator.
  - Harzruferin hat in den bisherigen synthetischen Offense-/Utility-Audits die schwächste direkte Druckkurve und ist eher Kandidat für Unterperformance als für Übermacht.
  - Frost liegt mechanisch näher an der Mitte; sein Dual-Wield ist nicht der Hauptausreißer.
- NICHT belastbar genug für Live-Entscheidung:
  - exakte 5×5-Winrates der synthetischen Engine;
  - konkrete Nerf-/Buff-Prozentwerte.
- Grund:
  - die neuen parameterisierten Hooks sind vollständig verdrahtet, aber noch nicht selbst gegen gespeicherte kanonische Event-/RNG-Traces zertifiziert;
  - vereinfachte Sensitivitätsrunner wurden wegen Modellfehlern ausdrücklich verworfen.
- Entscheidung für jetzt:
  - KEINE Live-Balanceänderung.
  - Bei nächster Balance-Runde zuerst echte Match-/Telemetry-Daten nach Klasse/Level/Build sammeln oder die parameterisierte Engine einmalig trace-zertifizieren.
  - Danach nur gezielte Werte ändern; keine pauschalen Klassen-Nerfs.
- Audit damit fachlich geschlossen.

### V8.097 – Balance Schritt 1 auf Beta umgesetzt · 03.10.2026
- Nur Grower/Barbar Tank angepasst; Scout, Bruiser, Frost und Summoner unverändert.
- Tank Normalnode s5:
  - vorher 0,30 % Schadensreduktion pro Rang
  - jetzt 0,18 % pro Rang
  - voller permanenter Tank-DR-Anteil sinkt dadurch von ca. 8,7 % auf ca. 7,0 %.
- Tank HP-Meilensteine:
  - +10 % -> +7 %
  - +15 % -> +10 %
- Unverändert:
  - Zweite Luft 15 %
  - Lethal-Save bei 1 LP
  - Regen
  - Reflect
  - situative Tank-DR
- Texte im Talentbaum entsprechend aktualisiert.
- Beta-Code-Commits:
  - `f64a46ade17c0c1e32d804223ad07115ddbf5fa0`
  - `219a4dfc6a091833784bac461cec49bc42774648`
- Kein Server-1-Transfer in diesem Schritt.

### V8.097 – Balance Schritt 2 auf Beta umgesetzt · 03.10.2026
- Nur Harzruferin angepasst; Grower/Barbar, Scout, Bruiser und Frost unverändert.
- Ruf aus dem Dunst:
  - Grundchance 10 % -> 12 %
  - Hard-Pity nach 4 Fehlversuchen bleibt unverändert.
- Begleiterschaden:
  - global +5 % relativ auf den bestehenden Begleiter-Multiplikator.
  - Talent-/Set-Boni bleiben unverändert.
- Sichtbare Klassen-/Roster-Texte auf 12 % aktualisiert.
- Keine Änderung an:
  - Fluch-/Spore-DOT
  - Bud-Heal
  - Krähen-Crit-Buff
  - Zweitbeschwörung
  - Soul-Lethal-Save
- Beta-Code-Commit:
  - `a4f314f9f773aa8a8b8fcc88e0e7826ebf0e7e48`
- Kein Server-1-Transfer in diesem Schritt.

### V8.097 – Nachtest der beiden Beta-Balance-Schritte · 03.10.2026
- Direkter Regression-/Sanity-Test der tatsächlich geänderten Mechaniken durchgeführt.
- Barbar-Tank:
  - vorher passiver EHP-Faktor ca. 1,704×
  - nachher ca. 1,587×
  - Änderung ca. -6,9 %
  - Zweite Luft 15 % und Lethal-Save unverändert.
- Harzruferin:
  - Basis-Rufchance 10 % -> 12 %
  - mit Hard-Pity auf Versuch 5 steigt die effektive Basis-Rufrate ohne Talentboni von ca. 24,4 % auf ca. 25,4 % pro Angriff.
  - zusammen mit +5 % relativem Begleiterschaden steigt der erwartete Begleiter-Beitrag ohne Talent-/Set-Boni grob um ca. 9,3 %.
- Interpretation:
  - beide Änderungen sind moderat;
  - Barbar wird spürbar entschärft, aber nicht entkernt;
  - Harzruferin wird spürbar zuverlässiger, ohne pauschalen Direkt-Damage-Buff.
- Das ist bewusst KEINE kanonische 5×5-Live-Winrate-Matrix.
- Report: `V8097_POST_BALANCE_STEP_SANITY_TEST.json`
- Report-Commit: `2113413d3ad901d6a2fe4b7344fdc4e44649a097`
- Server 1 weiterhin unverändert.

### V8.097 – direkter 5-Klassen Balance-Index nach Beta-Anpassungen · 03.10.2026
- Direkter Vergleich jetzt als relativer Balance-Index dokumentiert.
- Definition: 100 = Durchschnitt aller fünf Klassen.
- Kein Winrate-Wert; basiert auf den bereits auditierten Offense-Faktoren plus symmetrischem defensivem EHP-Anteil der ausgewählten Level-Builds.
- Aktuelle Beta-Anpassungen berücksichtigt:
  - Grower Tank-Nerf
  - Summoner Beschwörung 12 % + 5 % Begleiterschaden
- Level 100:
  - Grower 123,9
  - Bruiser 96,6
  - Frost 95,3
  - Summoner 93,5
  - Scout 90,7
- Level 200:
  - Grower 113,4
  - Bruiser 103,9
  - Frost 97,1
  - Summoner 95,5
  - Scout 90,0
- Level 300:
  - Grower 128,5
  - Bruiser 103,9
  - Frost 90,9
  - Summoner 90,5
  - Scout 86,2
- Interpretation:
  - Grower Tank ist trotz Schritt 1 noch klar oberhalb des Feldes, besonders L100/L300.
  - Bruiser liegt am ehesten um den Durchschnitt.
  - Frost und Summoner liegen darunter, aber nah beieinander.
  - Scout liegt in dieser Build-Auswahl am niedrigsten.
- Report: `V8097_FIVE_CLASS_POST_BALANCE_INDEX.json`
- Report-Commit: `865e28140d0c514eb2ad0387a615b77cbfc62210`

### V8.097 – Balance Schritt 3 auf Beta · 03.10.2026
- Nur Grower/Barbar und Scout angepasst.
- Grower Tank:
  - HP-Meilensteine 7 % / 10 % -> 5 % / 8 %
  - Tank s5 permanente DR pro Rang 0,18 % -> 0,12 %
  - passiver Tank-EHP gegenüber Schritt 2 nochmals ca. -3,6 %
- Scout:
  - Präzision s0 Geschick pro Rang 0,6 % -> 0,7 %
  - Dodge s0 Ausweichen pro Rang 0,5 % -> 0,6 %
  - Dodge s6 dauerhaftes Ausweichen pro Rang 0,2 % -> 0,25 %
- Magier, Frost und Harzruferin unverändert.
- Talenttexte synchronisiert.
- Projektierter relativer Balance-Index nach Schritt 3 (100 = 5-Klassen-Mittel, KEINE Winrate):
  - L100: Grower 120,3 / Scout 92,3 / Bruiser 97,3 / Frost 96,0 / Summoner 94,2
  - L200: Grower 109,8 / Scout 92,3 / Bruiser 104,4 / Frost 97,5 / Summoner 95,9
  - L300: Grower 124,4 / Scout 89,2 / Bruiser 104,3 / Frost 91,2 / Summoner 90,8
- Interpretation:
  - Richtung stimmt, aber Index bleibt beim Grower-Tank hoch und Scout niedrig.
  - KEINE weitere starke Anpassung nur anhand dieses Index; ab hier braucht es echte Kampf-/Telemetry-Daten oder trace-zertifizierten Matrix-Lauf.
- Code-Commits:
  - `9cbd7ecb691b8fab16f6a5b24e2b6928379252f2`
  - `5f1f1309157a137189c0bfd2c35eeb3781ec728f`
- Report: `V8097_POST_BALANCE_STEP3_INDEX.json`
- Report-Commit: `f385ee9a7c32d13e84a7dc627c6f5c099b1fb6a0`
- Server 1 unverändert.

### V8.097 – Beta Kampftelemetrie + vollständiger Talent-Wirkungs-/Sichtbarkeits-Audit · 03.10.2026
- Bestehenden Combat-QA-Owner erweitert; keine zweite parallele Telemetrie gebaut.
- Live-Kampftelemetrie:
  - speichert bis zu 300 abgeschlossene Beta-Kämpfe lokal,
  - erfasst Klasse, Level, Attribute, Talentverteilung, Modus, Runden,
    verursachten/erlittenen Schaden, Heilung, Konterschaden, Crits, Dodges,
    ausgelöste Proc-Tags und bis zu 80 Kampfereignisse je Kampf.
  - QA-Sandboxkämpfe sind explizit ausgeschlossen.
  - Exporte:
    - `v606CombatTelemetry()`
    - `v606CombatTelemetrySummary()`
    - `v606ClearCombatTelemetry()`
- Load-Order korrigiert:
  - Combat-QA/Telemetry lädt jetzt nach Frost UND Harzruferin,
    damit der finale Resolver aller fünf Klassen gemessen wird.
- Talent-Audit:
  - 105/105 normale Talentknoten mechanisch zugeordnet.
  - 105/105 Schlüsseltalente mechanisch zugeordnet.
  - Passive Talente bleiben ohne Kampftext-Spam.
  - Aktive/ausgelöste Mechaniken werden im Kampf sichtbar getaggt.
- Neu sichtbar gemacht:
  - Grower: VOLLTREFFER, REGENERATION
  - Scout: PRÄZISER TREFFER, KONTERSCHUSS+, AKROBAT, MEISTERREFLEX+
  - Bruiser: ÜBERLADUNG+, GRENZENLOSE MACHT+
- Harzruferin neu im zentralen Combat-QA:
  - Ruf aus dem Dunst
  - Fluchnebel
  - Seelenraub
  - Zweiter Ruf / Geisterchor
  - NICHT GANZ TOT
- Bestehende aktive QA bleibt für Barbar, Scout, Bruiser und Frost erhalten;
  neue Tests prüfen jetzt explizit auch Sichtbarkeit der Talent-Procs.
- Verifikation:
  - QA-Owner lädt nach Harzruferin: ja
  - Summoner QA vorhanden: ja
  - Telemetrie-Exports vorhanden: ja
  - QA-Sandbox von Live-Telemetrie getrennt: ja
  - 105/105 Coverage-Marker vorhanden: ja
  - neue aktive Labels im kanonischen Resolver vorhanden: ja
- Commits:
  - `1af8371f039c9631669b0cb2ee8e9fa20f54cfff` Telemetrie + Summoner QA
  - `e5a640c0b3e0be8c1dd54a8e9be17e7e8ca48cde` Sandbox-Trennung + QA UI
  - `4213701f762568baa96291b0e5fd44e8f1bb8044` Load-Order hinter Klassen-Resolver
  - `7517e2ffb376ded8890657752901ff82d36d4d7e` stille Talent-Procs sichtbar
  - `150682d8f6a9e569fc345a154e2951ddc574670b` Scout/Grower Proc-Sichtbarkeit
  - `f8d536105f7e06a84a6790ad90ea69e3dda820b6` aktive Sichtbarkeits-QA
- Server 1 unverändert; Beta zuerst beobachten.

### V8.097 – Server 1: Talent-Fixes + Kampftelemetrie übernommen, Beta-Balance getrennt · 03.10.2026
- Server-1-Freigabe durch Thomas erfolgt.
- Auf Server 1 übernommen:
  - Combat-QA / Kampftelemetrie
  - aktive Talent-Proc-Anzeigen
  - Harzruferin im zentralen Kampf-QA
  - finale QA-/Telemetry-Ladereihenfolge nach allen fünf Klassen-Resolvern
- Wichtig: Die aktuellen Beta-Balanceänderungen wurden NICHT auf Server 1 übernommen.
- Release-Channel-Trennung eingebaut:
  - `GROW_RELEASE_CHANNEL='server1'` hält auf Server 1 die bisherigen Live-Balancewerte.
  - Beta/Standard-Channel behält die neuen Beta-Werte.
- Server-1-Werte bleiben:
  - Grower Tank s5 DR: 0,30 % pro Rang
  - Grower HP-Meilensteine: +10 % / +15 %
  - Scout Präzision s0: +0,6 % Geschick pro Rang
  - Scout Dodge s0: +0,5 % pro Rang
  - Scout Dodge s6: +0,2 % pro Rang
  - Harzruferin Basis-Rufchance: 10 %
  - Harzruferin kein zusätzlicher +5-%-Begleiterschaden aus dem Beta-Balance-Schritt
- Beta bleibt:
  - Grower Tank s5 DR: 0,12 % pro Rang
  - Grower HP-Meilensteine: +5 % / +8 %
  - Scout Präzision s0: +0,7 % Geschick pro Rang
  - Scout Dodge s0: +0,6 % pro Rang
  - Scout Dodge s6: +0,25 % pro Rang
  - Harzruferin Basis-Rufchance: 12 %
  - Harzruferin +5 % relativer Begleiterschaden
- Verifikation:
  - Channel-Guards vorhanden: ja
  - Server-1 alte Barbar-/Scout-Werte vorhanden: ja
  - Server-1 alte Harzruferin-Werte vorhanden: ja
  - Server-1 QA/Telemetry lädt nach Harzruferin: ja
- Commits:
  - `6f4b8d0c70a84d1fef5af685a157d0cd5065dcda` Balance-Channel-Trennung v319
  - `074b669ba5ec94f638cbd3fbd035057e7ba08f00` Server-1 Talenttexte auf Live-Werten
  - `7f9f678e0cf88e6fd14ace7b5a4c5a91b5f72d28` Harzruferin Beta/Server-1 Balance getrennt
  - `cb4cb63c98e595122d64eb22d8c56d6bc094b1ef` Server-1 Telemetry-Ladereihenfolge



### 2026-10-04 – Beta Item-Popup: Ablegen wiederhergestellt
- Ursache: Der zentrale `v4103`-Vergleichspopup übernahm auch ausgerüstete Items, hatte aber nur Aktionen für `context='inventory'`. Dadurch fehlte beim Öffnen eines ausgerüsteten Gegenstands die Aktion zum Ablegen.
- Fix direkt im kanonischen Owner `js/features/items/beta/v8009-s2-v4103-item-ui-consistency.js`: Für `context='equipment'` wird der aktuelle Equipment-Slot eindeutig ermittelt und die Aktion **„Gegenstand ablegen“** eingeblendet; Klick ruft den bestehenden `unequip(slot)`-Pfad auf.
- Release-Schutz: Änderung ist auf Beta aktiviert; bei `GROW_RELEASE_CHANNEL='server1'` bleibt sie vorerst deaktiviert.
- Commit: `42db9928c2a3b819962d59981f16b688b3fdd7a6`.

- Nach Freigabe durch Thomas gilt derselbe Fix auch für **Server 1**, da `server1.html` denselben zentralen `v4103`-Item-Owner lädt. **Keine Änderung an Server-1-Sperre/Öffnungslogik oder Serverkonfiguration.**

### 2026-10-04 – Itemvergleich über Belohnungsfenstern
- Ursache: Der zentrale `#v4103CompareOverlay` lag mit `z-index:1000015` unter Dungeon-/Reward-/Popup-Overlays, die bis `2147483647` gehen. Dadurch öffnete sich der Vergleich korrekt, wurde aber vom Belohnungsfenster verdeckt.
- Fix direkt im bestehenden zentralen Item-UI-CSS `v8009-extracted-v4103-item-ui-css.css`: Vergleichs-Overlay auf die oberste Popup-Ebene gesetzt (`z-index:2147483647!important`).
- Gilt für **Beta und Server 1**, weil beide denselben v4103-Owner/CSS laden.
- Server-1-Sperre/Öffnungslogik unverändert.
- Commit: `d860f90432cc7d9b72b3296bdafeb4632de4f3e0`.

### 2026-10-04 – Set-Item Kernwerte angehoben (Beta + Server 1)
- Ursache bestätigt: Die aktuelle flache Qualitätskurve verteilt bei Lila einen Teil des Budgets auf Glück. Beispiel Grower-Stiefel Lv.112: Grün = 53 Stärke / 35 Ausdauer, Blau = 54 / 36, Lila = 52 / 34 / 5 Glück. Dadurch konnte ein episches Set-Item bei den sichtbaren Kernwerten schwächer wirken als Grün/Blau.
- Fix zentral im bestehenden Gear-Normalizer beider Server (`recovery_private.v7167_normalize_gear_item` und `server1_private.v7167_normalize_gear_item`): Set-Items ab Lila bekommen für Hauptattribut und Ausdauer mindestens **Blau derselben Klasse/Slot/Stufe + 1**; Zusatzwerte wie Glück bleiben zusätzlich erhalten.
- Validierung Lv.112 Grower/Boots: Blau = 54 Stärke / 36 Ausdauer; Set = **55 Stärke / 37 Ausdauer / 5 Glück** auf Beta und Server 1.
- Bestehende Set-Items wurden einmal durch denselben Normalizer gezogen; neue Quest-/Dungeon-/Endgame-/Schmiede-Set-Items verwenden die Regel automatisch.
- Supabase-Migration: `v8098_set_item_core_stat_floor_both_servers`.
- Server-1-Sperre/Öffnungslogik unverändert.

### 2026-10-04 – Angelegte Items ohne Selbstvergleich
- Wenn ein bereits ausgerüsteter Slot geöffnet wird (`context='equipment'`), zeigt der zentrale `v4103`-Popup jetzt nur noch den angelegten Gegenstand mit Details und **„Gegenstand ablegen“**.
- Der bisherige doppelte Selbstvergleich „Angelegt“ vs. „Angeklickt · identisch“ wurde für Equipment-Slots entfernt.
- Inventar-, Shop- und Belohnungsitems behalten weiterhin den vollständigen Vergleich zum aktuell angelegten Item.
- Gilt für **Beta und Server 1**, da beide denselben zentralen Item-Owner laden.
- Commit: `2b47240c28495d49b11f9650487b640dc9bebe9f`.

### 2026-10-04 – Dampf-Event auf 200 reduziert, Harz-Refill bis 300 erlaubt
- Dampf-Event startet/füllt den kostenlosen Tagesstand jetzt auf **200 Dampf statt 300**.
- Während eines aktiven Dampf-Events bleibt das technische Maximum bei **300 Dampf**.
- Harz-Refill ist während des Events nicht mehr gesperrt: pro Refill weiterhin **+20 Dampf für 1 Harz Taler**, bis maximal 300.
- Außerhalb des Events bleibt der normale Tagesstand/Refill-Cap bei 100 unverändert.
- Aktive Event-Spielstände ohne heutigen Harz-Refill wurden, sofern sie noch über 200 lagen, auf 200 begrenzt; bereits durch Refill gekaufte Energie wird nicht rückwirkend entfernt.
- Gilt für **Beta und Server 1**. Server-1-Sperre unverändert.
- Supabase-Migration: `v8099_dampf_event_200_refill_to_300`.

### 2026-10-04 – Dampf-Anzeige an 200/300-Regel angepasst
- Top-Bar nutzt weiterhin den dynamischen Event-Cap 300 und zeigt damit nach Tagesgrant korrekt **200/300**.
- Alter Client-Eventgrant in `v271` von 300 auf 200 geändert; Event-Toast/Badge/Admintext angepasst.
- Alter stale-event repair `v342` setzt jetzt 200 statt 300.
- Kanonische Dampf-Karte `v294`: Harz-Refill bleibt im Event sichtbar und aktiv bis zum Event-Cap 300; Auffüllungszähler bleibt sichtbar.
- Gilt für Beta und Server 1, da beide dieselben Client-Owner laden.
- Commits: `09cead70856e6b205e2599b6c1aa408b2fc87c50`, `e1eb72eccaaab45fee373b015f6e2b1346d04421`, `ee57b83263c88113705893de3c4a7bc84d31a406`.

### 2026-10-04 – Accountwechsel: leerer Header-/Brown-Screen gehärtet
- Fehlerbild bei einem Spieler nach Accountwechsel: Ladebildschirm endet, Top-Bar erscheint, Hauptinhalt bleibt leer/braun; davor zwei Fehlermeldungen im Video.
- Trigger passt zum Accountwechselpfad: alter Runtime-/UI-Zustand konnte während des Wechsels teilweise sichtbar/aktiv bleiben, obwohl der neue Account bereits finalisiert wurde.
- Fix direkt im kanonischen Account-Switch-Owner `v4139-account-switch-authority.js`: Beim Accountwechsel werden jetzt zusätzlich Boot-Gate/critical-ready zurückgesetzt, alle aktiven Screens bereinigt, Startseite als einziger aktiver Screen gesetzt, Menü-/Popup-Reste geschlossen und ein dediziertes `growlegends:account-transition-reset`-Event ausgelöst.
- Nach erfolgreicher Server-Hydration wird die Startseite erneut eindeutig aktiviert, das Menü synchronisiert und erst dann der Atomic-Boot-Gate freigegeben.
- Commit: `d5bc34e5f4a471c79c176b11c8d95bbe0c7c4091`.
- Nächster Reprotest: Account A -> Abmelden/Accountwechsel -> Account B -> prüfen, ob Startseite direkt sichtbar ist und keine leere braune Fläche bleibt.

### 2026-10-04 – Startseiten-Dampf-Eventanzeige korrigiert
- Die Startseite hatte noch hart codiert **„300 DAMPF EVENT / 300 Dampf Maximum aktiv“**.
- Shared Home-Renderer zeigt jetzt **„DAMPF EVENT – 200 Dampf gratis · mit Harz bis 300“**.
- Automatische Wochenend-Eventbeschreibung ebenfalls auf **200 gratis / Harz bis 300** geändert.
- Gilt für Beta und Server 1 über den gemeinsamen Home-Renderer; Server-1-Sperre unverändert.
- Commits: `beeaee4f5b9940a2c46964ed2dbb81e58b1876a4`, `e535854669b7108e2c55c8037b28a966d4822223`.

### 2026-10-04 – Dampf-Refill im Event repariert
- Ursache: Der neue Event-Button war sichtbar, aber `v294` setzte bei aktivem Event weiterhin `onclick=null`; zusätzlich blieb der ältere `v288`-Eventblocker im Funktionspfad aktiv.
- Fix im kanonischen `v294-dampf-canonical.js`: eigener serverautoritärer Refill-Handler nutzt `v7044_refill_dampf`, aktualisiert danach Dampf/Harz/Refill-Zähler und repaintet Top-Bar, Dampfkarte und Startseite.
- Regel: Event kostenlos 200 Dampf, Harz-Refill +20 bis max. 300; normal max. 100; 10 Refills/Tag bleiben bestehen.
- Gilt für Beta und Server 1 über denselben Client-Owner; Backend-RPCs sind auf beiden Servern bereits entsprechend angepasst.
- Commit: `7790d621d14605d1078109d8b9ae19cb8d561e12`.

### 2026-10-04 – Edelstein-/Schriftrollenverkauf serverautoritativ repariert
- Ursache: Materialverkauf (`v681` Einzelverkauf und `v683` Mehrfachverkauf) entfernte Materialien und erhöhte Gold nur lokal. Bei serverautoritativen Accounts wurde der lokale Goldwert anschließend vom kanonischen Serverstand überschrieben.
- Neuer RPC auf **Beta und Server 1**: `v8100_sell_materials(jsonb,text)`. Verkauf entfernt die ausgewählten Edelsteine/Schriftrollen und schreibt Gold atomar in `player_progress_trusted`; zusätzlich Gold- und Item-Ledger mit Request-ID/Dedupe.
- Client-Brücke im bestehenden `v7062`-Item-Authority-Owner ergänzt; Einzel- und Mehrfachverkauf benutzen bei Item-Authority jetzt denselben Serverpfad und übernehmen danach Materialien + Gold direkt aus der Serverantwort.
- Lokaler Legacy-Fallback bleibt nur für Accounts ohne Item-Authority erhalten.
- Supabase-Migration: `v8100_server_authoritative_material_sales`.
- Commits: `94d014b764d1f8fde53630be128a9e629f345ad5`, `274aa7dc52b2c9ddf19da38b51702d33b20aff4b`, `96be08ad052f7ffa7d6adcc6fe4a16adc41c9b2a`.

### 2026-10-04 – Local-vs-Server Authority Audit
- Anlass: Materialverkauf entfernte Edelsteine/Schriftrollen lokal, während Gold serverautoritativ war. Daraufhin gezielter Audit aller wertvollen Client-Mutationen.
- **Echte Lecks gefunden und behoben:**
  - `v394-time-seeds-currency.js`: Quest-Zeit-Samen-Drop und Quest-Skip-Verbrauch liefen noch lokal. Unter Quest-Authority wird der lokale 50%-Roll jetzt nicht mehr ausgeführt; der Server-Receipt besitzt den Drop. Quest-Skip nutzt jetzt den vorhandenen `v7044_skip_quest`-RPC und übernimmt `time_seeds` + aktive Quest aus der Serverantwort. Commit `680919f39e6ab88d81d1134fa447d3f264431c43`.
  - `v109-harz-drops.js`: alte Quest-/Dungeon-Harz-Zusatzdrops konnten nach serverseitigem Reward noch lokal minten. Unter Quest-/Dungeon-Authority werden diese lokalen Rewardpfade jetzt vollständig übersprungen; Legacy-Fallback bleibt nur außerhalb ENFORCE. Commit `12c5afe3c4113f6e2f041a3fea0009b1347477a9`.
- **Verifiziert serverautoritativ / lokaler Altcode wird vor Mutation abgefangen:** Daily Login (`v7073`), Wochenkiste/Turm/Weltboss (`v7072`), PvP (`v7053`), Growroom/Blüten-Dealer (`v7065`/`v7071`), Händler/Shop-Reroll/Harzschmiede (`v7063`), Materialverkauf (`v8100_sell_materials`), Lotto (`v8010`), Schicht (`v7137`), Referral (`v7129`).
- Supabase Authority-Check: alle vorhandenen Beta-Spieler in den geprüften Kern-Domains `daily/items/progress/pvp/quest/seeds/shop/tower/weekly/worldboss` stehen auf `enforce`; dasselbe gilt für die vorhandenen Server-1-Spieler.
- Wichtig: `localStorage` bleibt an vielen Stellen bewusst als **Cache/Render-Mirror** bestehen. Es darf unter ENFORCE aber keine kanonische Währung/Belohnung mehr erzeugen oder verbrauchen.
- Nächster Cleanup-Schritt empfohlen: historische lokale Reward-/Economy-Implementierungen physisch reduzieren/retiren, statt sie nur hinter Authority-Guards zu belassen.

### 2026-10-04 – Legacy-Local Economy Cleanup Block 1
- Ziel: lokale Economy-/Reward-Mutationen nicht nur per Authority-Guard blockieren, sondern aus den aktiven Altpfaden entfernen bzw. auf kanonische Server-Owner delegieren.
- `v109-harz-drops.js`: alter lokaler Quest-/Dungeon-Harz-Mint vollständig retired; Datei ist nur noch ein Retired-Marker ohne Currency-Mutation. Commit `68ced1618c6407d084893971c7bbf1f4e8734108`.
- `v394-time-seeds-currency.js`: lokaler 50%-Quest-Zeit-Samen-Roll entfernt; Quest-Skip nutzt den vorhandenen Server-RPC `v7044_skip_quest`; lokaler Burn-Fallback entfernt/fail-closed. Commit `073a2034ea8f86db6bd609b9d06261750aa2f4c7`.
- Daily Login: `v7073` exportiert jetzt den kanonischen Server-Claim `v7073ClaimDailyLogin`; der alte `v484`-Claim delegiert ausschließlich dorthin und mintet lokal nichts mehr. Tote lokale Reward-/Persist-Mutatoren in `v484` zusätzlich neutralisiert. Commits `aa7647a7ee127930d387889bad9e2442caf36d11`, `bda2dc473f708f7af4e0acf64aec529a0a6f335d`, `0b38b13742d723b1ea93ead15bbe976b5fec36a7`.
- Weltboss: `v7072` exportiert den kanonischen Server-Run `v7072WorldbossRun`; der alte `v110Fight` delegiert ausschließlich dorthin. Lokaler 10-HT-Abzug, lokaler Attempt/Wins-Mutator und lokales Item-Minting wurden aus dem alten Fight-Owner entfernt. Commits `ffb8012b4cbb23c14e4e96c078d91a3d574e4065`, `708fb64f0865a8c21d5b4445abcd0bffdf671469`.
- Ergebnis: In diesen vier kritischen Altpfaden kann ein versehentlich ausgelöster Legacy-Handler keine kanonische Währung/Belohnung mehr lokal erzeugen oder verbrauchen; bei fehlendem Server-Owner fail-closed statt Local-Fallback.
- Gilt über die gemeinsamen Client-Owner für Beta und Server 1; Server-1-Sperre unverändert.

### 2026-10-04 – Legacy-Local Economy Cleanup Block 2
- Wochen-Truhe: `v7072` exportiert jetzt `v7072WeeklyAction`; alter `v6239`-Owner mintet keine Rewards mehr lokal. Öffnen/Claim/Claim-All delegieren an den Server-Owner, sonst fail-closed. Commits `e64c8385f0486bbc63a691373638748b1b11fda3`, `ce230cdb15a0d9139d6c6fba1c0abbbb962f1b5f`.
- Growroom/Blüten-Dealer: `v7071` exportiert Serveraktionen für Veredeln, Einsammeln und Dealer-Kauf. Alter `v6282`-Owner verbraucht keine Blüten und mintet keine Gold/Fragmente/Zeit-Samen/Materialien/Items mehr lokal; Mutationen delegieren nur noch serverseitig. Commits `73d1a921dc3aa7edf1cf24496ad37dafb5efee7d`, `be489e97826342714f4afe66e3cbcb0ee57b60fc`.
- Turm: alte lokale Economy-Mutatoren `finishRun`, Händlerkauf, Upgrade-Kauf und Mittwochs-Claims fail-closed sobald Tower-Authority aktiv ist. Der kanonische `v7072`-RPC-Pfad bleibt Owner. Commit `539ff91d6cf5d7ab0bfabf17d66c4892439516b6`.
- Harzschmiede: alte lokale `dismantle`/`craft`-Mutatoren fail-closed unter Item-Authority; der vorhandene `v7063`-Serverpfad bleibt Owner. Commit `4ac9aee2853644d576e0a06d6348b2df0a46f545`.
- PvP: alter `v204Finish` kann unter `pvp=enforce` keine lokalen Gold/EXP-Rewards mehr schreiben. Commit `52a8263eac59db38a19e0aabe86efdd87a6492dc`.
- Ergebnis: Auch direkte/programmgesteuerte Legacy-Aufrufe können in diesen Systemen unter ENFORCE keine kanonischen Economy-Werte mehr lokal erzeugen oder verbrauchen.
- Gilt über gemeinsame Client-Owner für Beta und Server 1; Server-1-Sperre unverändert.

### 2026-10-04 – Top-Bar Ressourcen sofort aktualisieren
- Ziel: Gold, Harz-Taler und Dampf sollen nach jeder bestätigten Änderung sofort in der Top-Bar sichtbar sein.
- Ursache: Der zentrale Live-Painter `v441PaintResources()` aktualisierte noch die alten Header-IDs (`v358*`), aber nicht den aktuellen autoritativen `v372`-Header.
- Fix: `v441` schreibt jetzt synchron in `#v372Gold`, `#v372Harz` und `#v372Dampf` inklusive aktuellem Dampf-Cap; alte Header-/Shop-Mirrors bleiben weiterhin synchron.
- Zusätzlich `growlegends:resources-changed` als zentraler Paint-Trigger und `v441SettleResources` exportiert.
- Item-/Material-Authority-Bridge `v7062` ruft nach Verkäufen jetzt ebenfalls direkt `v441PaintResources()` auf.
- Bereits verifiziert direkte Refresh-Aufrufe nach Dampf-Refill, Shop/Forge, Tower/Weekly/Worldboss, Grow-Dealer, Daily Login und PvP.
- Commits: `205c860fbce5f90f17375cf61a30ff7a326d2446`, `39b9e8b35152fbfe183a829b0aa3295126c24612`.
- Gilt über gemeinsame Client-Owner für Beta und Server 1; Server-1-Sperre unverändert.

### 2026-10-04 – Server 1 auf aktuellen Nicht-Balance-Stand aktualisiert
- Nutzerfreigabe: aktuelle Beta-Fixes auf Server 1 übernehmen, **Klassenbalance ausdrücklich ausnehmen**.
- `server1.html` lädt bereits dieselben gemeinsamen Feature-/Authority-Owner wie Beta; Server-1-spezifischer Release-Channel bleibt `GROW_RELEASE_CHANNEL='server1'`.
- 22 heute geänderte **Nicht-Balance-Owner** in `server1.html` mit neuem Cache-Bust `v=8100s1sync1` versehen, damit Server-1-Clients garantiert den aktuellen Stand laden.
- Enthalten u. a.: Item-Vergleich/Popup, Dampf 200/300 + Refill, Accountwechsel-Härtung, Materialverkauf, Local-vs-Server-Authority-Cleanup, Daily/Weekly/Worldboss/Grow/Tower/Forge/PvP-Cleanup und sofortiger Top-Bar-Ressourcenrefresh.
- **Nicht angefasst:** `v319-exact-talents-dungeon-balance`, `v318-talent-combat-complete`, `v6287-harzruferin`, `v4156-class-identity-balance` sowie alle Beta-spezifischen Klassenbalancewerte.
- Balance-Trennung verifiziert: `V319_BETA_BALANCE`, `V318_BETA_BALANCE` und `V6287_BETA_BALANCE` schalten auf Server 1 weiterhin auf die alten Release-Werte.
- Server-1-Freigabe unverändert: `opens_at=NULL`, `harzruferin_opens_at=NULL`, Release-Pfad `server1.html`; keine automatische Öffnung aktiviert.
- Commit: `3fc6e7e03ca63c72689abdd074e1c3c6256568fc`.

### 2026-10-05 – Hinterhof-Dealer geöffnet, nur Harz Lotto verfügbar
- Hinterhof-Dealer ist player-sichtbar; beim Öffnen ist **Harz Lotto** der aktive/default Tab.
- **Tütchen** bleibt sichtbar, aber deaktiviert und mit **COMING SOON** gekennzeichnet.
- Tütchen-Inhalt ist initial verborgen; Lotto-Panel sofort sichtbar. Kein kurzer aktiver Tütchen-Zustand beim Laden.
- Hero-Text angepasst: Harz Lotto geöffnet, Tütchen/Werbe-Belohnungen folgen später.
- `v8010` erzwingt bei jedem Dealer-Open den Lotto-Tab; ein Versuch, `bags` zu öffnen, fällt auf Lotto zurück.
- CSS für gesperrten Coming-Soon-Tab ergänzt.
- Beta und Server 1 aktualisiert; Server 1 bleibt geschlossen.
- Commits: `a4bffe3c54989275aa875c2ba83be6b01a3aa9c7`, `8593b079def294680c952c787ad2f82635c4926e`, `ff00b94ac08f1ff94097080266fcef20bfce1b89`, `58275a810d16588bd516c3bc9148819043a88ae5`.

### 2026-10-05 – Anbau-Turm: globale Top-Bar bleibt sichtbar
- Fehler: Im Anbau-Turm fehlte die globale Top-Bar.
- Ursache: Der zentrale `v372`-Header-Owner entschied die Sichtbarkeit nur anhand von `.screen.active`. Der Tower baut intern mehrere Renderzustände neu auf; dabei kann dieser Active-State kurz fehlen und der Header auf `display:none!important` gesetzt werden.
- Fix direkt im kanonischen Header-Owner: Navigation auf `tower` gilt jetzt als starke Sichtbarkeitsquelle. Die Top-Bar bleibt während Lobby/Run/Ranking/interner Tower-Repaints sichtbar.
- Nach Tower-Navigation erfolgt zusätzlich ein synchroner Paint + Microtask/RAF-Nachpaint, damit ein nachlaufender Tower-Render den Header nicht wieder verschwinden lässt.
- `v372PaintTopbar` als zentraler Refresh exportiert; Accountwechsel setzt den Navigation-Marker sauber zurück.
- Cache-Bust auf Beta und Server 1: `v=8101towertopbar1`.
- Commits: `b0b57206e2e95318b827170d52ff7146533b81e5`, `b991ae53462170df93dc4c47a60099b6de160372`, `d9bf53dc596b2afe2e2f85980f515ee128da8e0b`.
- Server 1 bleibt geschlossen; Klassenbalance unverändert.


### 2026-10-05 – Anbau-Turm Header-Offset + Hinterhof-Navigation korrigiert
- Anbau-Turm: Ursache für den überlagerten Header war der interne `.v6259-head` mit `position: sticky; top: 0`; beim Scrollen lief er unter die globale `v372`-Topbar.
- Fix im bestehenden Tower-CSS: Sticky-Offset auf 60 px gesetzt, auf kleinen Displays auf 54 px. Die globale Topbar bleibt im Turm bewusst sichtbar.
- Hinterhof-Dealer: Seite und Lotto waren bereits vorhanden, aber `v4148` ließ `bagDealer` weiterhin nur für Admins in die Navigation.
- Fix im kanonischen Menü-Owner: `bagDealer` ist für normale Spieler sichtbar, sobald die Seite existiert. Tütchen bleibt deaktiviert/COMING SOON; Harz Lotto bleibt verfügbar.
- Beide Änderungen wirken auf Beta und Server 1 über die gemeinsamen Owner; Server-1-Sperre und Klassenbalance unverändert.
- Commits: `ad088b9820180f4be68e3b537dfe854cef92defc`, `ae9a41066873acce44bd95a644cf80a9a03d882a`.


### 2026-10-05 – Korrektur: tatsächliche finale Owner für Tower-Header + Hinterhof-Navigation
- Der erste Fix griff zu früh in der Kaskade und wurde später wieder überschrieben.
- **Hinterhof-Dealer:** tatsächlicher finaler Owner war `v4149-final-navigation-render-authority.js`. Dort existierten noch drei Admin-Gates: Availability, direkte Navigation und finaler `v032Go`-Wrapper. Alle drei entfernt. `bagDealer` ist jetzt öffentlich, sofern die Seite existiert. Tütchen bleibt unabhängig davon Coming Soon.
- **Anbau-Turm:** `v6271-tower-topbar-lobby-css.css` überschrieb den früheren Sticky-Fix mit `position:relative!important; top:auto!important`. Finaler Fix sitzt jetzt dort: `.v6259-head` ist sticky und startet bei `calc(var(--v654-hud-bottom, 60px) + 3px)`, also unter der tatsächlich gemessenen globalen Topbar.
- Beta und Server 1 erhielten Cache-Busts für beide finalen Dateien, damit alte Assets nicht weiter aus Cache/Cloudflare verwendet werden.
- Commits: `724e97a85ef7ab1389d9f657a6c3e8c43fbb7769`, `bd9ced277c042c7b79a5f162dc5777aa930db8fc`, `398071d36a7a5e80ec62af7d8e851dcd9cb1075c`, `bc5c77c5ea50ff31e7bc85a8adcae8b7ddfd5446`.


### 2026-10-05 – Shop-Kauf gegen veraltete Angebote abgesichert + Erstvergleich korrigiert
- Spielerfall **Over_Killer3** analysiert:
  - 05.10.2026 08:52:24 CEST: bestätigter Shopkauf, -1.800 Gold;
  - 05.10.2026 08:52:36 CEST: bestätigter Shopkauf, -9.000 Gold;
  - beide Käufe erzeugten serverseitig Händlerstiefel; einer aktuell ausgerüstet, einer im Inventar;
  - kein zu diesen Käufen gehörender Händler-Helm im Serverbestand.
- Ursache Kauf-Mismatch:
  - Client übergab bisher nur Händlerbereich + Slotindex;
  - bei veralteter sichtbarer Shopkarte konnte der Server bereits ein anderes Angebot im selben Slot besitzen.
- Schutz V8.102:
  - Client sendet zusätzlich `p_expected_item_id`;
  - Beta + Server1 RPC `v7097_buy_shop_item(..., p_expected_item_id)` prüfen die sichtbare Item-ID gegen das aktuell serverseitige Angebot **vor** Goldabzug/Inventaränderung;
  - bei Abweichung: `SHOP_OFFER_CHANGED`, kein Goldabzug, Shop wird frisch geladen;
  - alte 3-Parameter-RPC bleibt fail-closed und verlangt die erwartete Item-ID.
- Shop ersetzt nach einem Kauf weiterhin **nur den gekauften Slot**; übrige Angebote bleiben unverändert.
- Erstöffnungs-/Vergleichsfehler:
  - Shopkarten konnten vor abgeschlossenem serverautoritativem Equipment-Hydrate Vergleichswerte aus einem älteren lokalen `s.equipment` berechnen;
  - zusätzlich war in `v7074-item-enforce-bridge.js` im frühen Authority-Pfad irrtümlich `P.ready/P.enforce` statt `A.ready/A.enforce` verwendet.
- Vergleichsfix:
  - `v139ActualOffer` zeigt keine historischen v089/v090-Vergleiche mehr vor dem finalen v470-Owner;
  - solange der serverseitige Item-State noch nicht bestätigt ist: neutral `Vergleich wird geladen …`;
  - nach Authority-Hydration wird ein aktiver Shop gezielt neu gerendert;
  - nach autoritativen Equipment-Änderungen wird der aktive Shop ebenfalls neu gerendert, damit Plus/Minus sofort zum aktuell getragenen Item passt.
- Betroffene Commits:
  - Client Kauf-ID-Guard: `b05a82e291b53921fd262218a734c5ec6edb13b7`
  - Erstvergleich Owner: `e3aec1f9e08e2517a105c35753dd409214026113`
  - Item-Authority Frühpfad + Shop-Repaint: `734904520b204d0b00066bf4472432caf5e027d8`
  - Equipment-Änderung → Shopvergleich aktualisieren: `275426c91e7849eff09585ec73a5d3358f09d2ff`
  - Beta/Server1 Cache-Busts: `2410316d897a4d04a2bad64827fd1386efa6fae0`, `937023d21fd393dc269a3631635433f662eb14ea`.


### 2026-10-05 – Shop-Umsprung im Video behoben
- Nutzer-Video zeigt: Shop öffnet zunächst mit einem Angebotssatz und springt wenige Sekunden später sichtbar auf andere Items.
- Ursache direkt im aktiven Shop-Core gefunden:
  - `v057FillShops()` erwartete historisch **9 lokale Angebote**;
  - der aktuelle serverautoritative Shop liefert **6 Angebote**;
  - jeder `renderShop()`-Aufruf interpretierte die korrekten 6 Serverangebote als „unvollständig“ und generierte lokal wieder 9 neue Items;
  - der nächste Server-Hydrate setzte danach erneut die echten 6 Angebote ein → sichtbarer Umsprung.
- Fix:
  - `js/features/shop/beta/v8009-a1-clean-shop-core.js`
  - unter aktiver Item-Authority erzeugt `v057FillShops()` **keine lokalen Shopangebote mehr**;
  - die alte 9-Slot-Logik bleibt nur als nicht-autoritativer Fallback;
  - serverseitige 6-Slot-Angebote bleiben stabil und werden nicht mehr durch Render-Aufrufe ersetzt.
- Commit: `06572543ee8dd101230a22e36aa36122853c0ff1`
- Cache-Bust Beta: `4adc35e109ce202173fd105f72e8f3eb3de422fd`
- Cache-Bust Server1: `195af38189c20764e9e1041ca04f3b9f11f15c95`.


### 2026-10-05 – Zweiter Shop-Umsprung-Fix: sichtbare lokale Erstangebote blockiert
- Neues Nutzer-Video zeigt weiterhin sichtbaren Wechsel:
  - zuerst lokale alte Angebotsnamen wie `Moosläufer`, `Knospenhorn-Helm`, `Grimmtritt-Boots`;
  - wenige Sekunden später serverseitige Angebote wie `Händlerwaffe`, `Händler-Kopfschutz`, `Händlerstiefel`.
- Ursache:
  - der vorherige Fix verhindert lokale Neugenerierung **nach** erkannter Item-Authority;
  - beim allerersten Shop-Öffnen kann die Authority/Händler-Hydration aber noch nicht fertig sein;
  - `v461-shop-redesign` renderte in diesem Zeitfenster noch den im lokalen State vorhandenen Altbestand sichtbar.
- Fix direkt im sichtbaren Shop-Owner `v461-shop-redesign.js`:
  - bei authentifiziertem Spieler wird der Shop erst dann mit Itemkarten gerendert, wenn `v7063ItemStageDiagnostics()` `ready && enabled` meldet;
  - vorher nur neutraler Ladezustand `Händlerangebote werden geladen …`;
  - der Owner stößt einmalig `v7063ItemStageRefresh(true)` an;
  - nach bestätigter Server-Hydration wird der Shop genau mit dem autoritativen Bestand gerendert.
- Dadurch darf kein lokaler/alter Angebotssatz mehr kurz sichtbar sein und danach auf Serverangebote springen.
- Commit: `a49c93a6bb633b5f80dbd56c20747a3303382313`
- Cache-Bust Beta: `b401f8011eacf1348e8952b5d929359a94587ad1`
- Cache-Bust Server1: `c28471c06d5d33150ed949199ab200454b021115`.


### 2026-10-05 – Alter Shop-Header/Legacy-DOM entfernt
- Nutzer-Screenshot zeigte oberhalb des aktuellen Shops noch einen alten Block:
  - `Bork · Händler von Grünhain`;
  - alter Seltenheits-Hinweis;
  - zusätzlich darunter bereits der neue v461/v464-Shop.
- HTML-Vertrag geprüft: `<section id="shop" class="screen"></section>` ist in Beta und Server1 leer. Sämtliche Shop-DOM-Struktur wird dynamisch erzeugt.
- Daraus folgt: direkte Kinder von `#shop`, die nicht zum aktuellen v461/v464-Vertrag gehören, sind Legacy-DOM.
- Fix direkt im kanonischen `v461-shop-redesign.js`:
  - v461 übernimmt exklusiven Root-Besitz von `#shop`;
  - zulässige direkte Kinder:
    - `#v461ShopHero`
    - `#v464ShopTabs`
    - `#v057GearShopCard`
    - `#v030MagicShop`
  - alle anderen direkten Shop-Blöcke werden beim kanonischen Render entfernt.
- Damit verschwinden der alte `Bork · Händler von Grünhain`-Header und der alte Seltenheits-Hinweis zusammen mit sonstigen fremden Shop-Root-Blöcken.
- Commit: `bb39ed0ce8ab7f98139c53a265428a24447ff042`
- Cache-Bust Beta: `8d6448413e61c05bef1a334ff4fa3f6a7db2912f`
- Cache-Bust Server1: `0d274b9e1a4be5030da08ad4c92d02a5cb7f2e0b`.


### 2026-10-05 – Tatsächlichen späten Shop-Writer v6105 stillgelegt
- Nach erneutem Nutzerhinweis komplette Shop-Lade-/Eventreihenfolge geprüft.
- Später aktiver Writer gefunden:
  - `js/features/shop/beta/v8009-s1-v6105-item-variety-and-art-rework.js`
  - Navigation auf `shop` rief noch `refreshMerchantPools(false)` auf;
  - diese Funktion leerte `s.weaponShop` und `s.magicShop`, generierte anschließend lokalen Händlerbestand neu und persistierte ihn.
- Das konnte nach früheren Shop-Fixes weiterhin einen sichtbaren Bestandswechsel auslösen.
- Fix:
  - `refreshMerchantPools()` ist als Bestands-Writer vollständig retired;
  - V6105 bleibt nur noch Owner für Item-Templates/Artwork;
  - kein Leeren, kein lokales Neuwürfeln, kein Schreiben von `weaponShop`/`magicShop` mehr aus V6105.
- Commit: `23b1998ceacd0845fb2b2a856a3b56385de5162c`
- Cache-Bust Beta: `483a22f527677ead901b62b26902400eb0298a57`
- Cache-Bust Server1: `d2f06abb51a66e84106a9636974412b4ca46eb5a`.


### 2026-10-05 – Root Cause Shop-Sprung: Whole-Save-Hydration schrieb alten Shop zurück
- Neues Nutzer-Video (~50 s) frameweise geprüft:
  - ca. 10 s: korrekter Server-Shop (`Händlerwaffe`, `Händler-Kopfschutz`, ...)
  - ca. 15–20 s: Wechsel auf alte lokale Fantasy-Angebote (`Wurzelbeißer`, `Kettendorn-Axt`, `Knospenhorn-Helm`, ...)
  - ca. 25 s: Rücksprung auf Server-Shop; gleichzeitig erscheinen alte Händler-DOM-Blöcke oberhalb.
- Tatsächliche Root Cause:
  - der Account-/Cloud-Resolver `v075ApplyCloudSave()` ersetzte den gesamten Live-State mit `player_saves.save_data`;
  - alte Account-Snapshots enthalten weiterhin `weaponShop` und `magicShop`;
  - dadurch konnte eine **späte Whole-Save-Hydration** einen bereits korrekt server-hydrierten Shop wieder mit altem lokalem Händlerbestand überschreiben;
  - direkt danach korrigiert `v7063` erneut auf den Serverbestand → sichtbares Hin-und-her;
  - der Whole-Save-Pfad ruft zusätzlich den historischen globalen `render()` auf, wodurch alte Shop-DOM-Strukturen kurzfristig wieder erzeugt werden konnten.
- Root-Fix im Save-Vertrag:
  - neue zentrale Funktion `v8102StripServerOwnedShopState()`;
  - `weaponShop` und `magicShop` werden aus Whole-Account-Snapshots entfernt;
  - Cloud-Load: alte Shopfelder aus `save_data` werden ignoriert;
  - wenn der Server-Shop bereits hydriert ist, bleibt der aktuelle autoritative Shop beim Account-Hydrate erhalten;
  - sonst werden Shoparrays leer gehalten, bis `v7063` den echten Server-Shop liefert;
  - Cloud-Write speichert `weaponShop`/`magicShop` nicht mehr;
  - v200/v145 lokale Account-Snapshots speichern diese Felder ebenfalls nicht mehr;
  - v4136 kanonische Account-Snapshots entfernen die Felder ebenfalls;
  - nach Whole-Save-Hydration übernimmt bei aktivem Shop wieder der kanonische Shop-Owner.
- Betroffene Commits:
  - v200 Save/Hydration-Vertrag: `acc4d01615cd45576ffd938d716d753022797b03`
  - v145 Scoped-Snapshot-Schutz: `776c2241fe817eab1a37a3dbd82f2f6b2eee7b68`
  - v4136 Canonical-Snapshot-Schutz: `d1fbb220a414365c0c8d9de2f02786e9511d2a94`
  - Cache-Bust Beta: `98fcbde5f944d040485aa28153b6031807bc6d7c`
  - Cache-Bust Server1: `d123c6e0bd78cce9272507cda793aebb87ee9b64`.


### 2026-10-05 – Shop-Stock Authority bereinigt: alte automatische Generatoren entfernt
- Nach weiterem Nutzerhinweis alle aktiven Shop-Writer und globale Render-Hooks erneut geprüft.
- Kritischer automatischer Alt-Writer gefunden:
  - `js/features/anonymous-extracted/beta/anon-0011.js`
  - historische V4.02-`v062FillShops()`-Logik erzwang bei jedem globalen `render()` wieder lokalen 6+6-Händlerbestand, sobald Arrays leer/nicht in der alten Form waren;
  - während moderner Server-Hydration führte das zu: leer/neu → lokale Fantasy-Items → anschließend `v7063` Serveritems → sichtbarer Shop-Sprung.
- Fix:
  - `v062FillShops()` vollständig als Shop-Writer retired;
  - der globale `render()`-Wrapper darf Shoparrays nicht mehr verändern;
  - historischer One-Time-Refresh entfernt.
  - Commit: `8c688df8cd514a54eb602a84a91c4bf0221529f5`
  - Cache-Bust Beta/Server1: `a2399b847548da55de52ecd49be9c217e7aabd9b`, `20616506d18ab432a2c9b179df4914d31b863b7c`.
- Rest-Audit zeigte weitere lokale Bestands-Writer:
  - `v030Fill()` in `v8009-a1-shops-gems-enchants.js`;
  - `v030FillShops()` + One-Time-Refresh in `v8009-a1-shop-stat-separation.js`;
  - One-Time-Refresh in `v8009-s5-v135-shop-level-scaling.js`.
- Diese drei wurden ebenfalls als Shop-Bestands-Owner retired:
  - Generator-/Stat-Helfer bleiben erhalten;
  - sie dürfen `weaponShop` / `magicShop` nicht mehr automatisch erzeugen/leeren/ersetzen.
  - Commits:
    - v030: `49d7d88d2652d727d91e6beaae128d0421dcb84f`
    - v056: `dded001c461a6315f3e2a0ff4fcb59e021d43b67`
    - v135: `dae8ec05eea75e756769879c897d35bb072b3f13`
  - Cache-Bust Beta/Server1: `3811dc0e010accf00d25c2d9452ee6a60de277a2`, `19fed4e6e5debee9d917d57cfb6ba312c68964ee`.
- Zielzustand: Live-Shopbestand wird ausschließlich durch `v7063/v7097` gesetzt; historische Renderer/Generatoren sind nur noch Darstellung/Kompatibilität und besitzen keinen Shop-State mehr.


### 2026-10-05 – Shop Restfehler aus neuem Video: 0-Angebote + Legacy-Render final abgefangen
- Neues Nutzer-Video zeigte nach den vorherigen Shop-Writer-Fixes:
  - zunächst korrekte 6 Serverangebote;
  - danach Umsprung auf **0 Angebote**;
  - anschließend tauchte wieder alter Shop-DOM wie `Bork · Händler von Grünhain` / Seltenheits-Hinweis auf.
- Ursache 1:
  - `v461-shop-redesign.js` betrachtete den Server-Shop bereits als bereit, sobald die Item-Stage `ready && enabled` war;
  - wenn `weaponShop`/`magicShop` in einem späteren Whole-State-/Render-Timing kurz leer waren, wurde deshalb ein echter `0 Angebote`-Zustand gerendert.
- Fix:
  - v461 verlangt jetzt zusätzlich tatsächlich vorhandenen Shopbestand in beiden Bereichen;
  - solange einer der beiden Bereiche leer ist, bleibt der Shop im neutralen Ladezustand und stößt den Server-Refresh an.
  - Commit: `0aa3569db7543e0ad9b8d484097a2bbefe4d725c`.
- Ursache 2:
  - ein historischer globaler `render()` kann nach dem kanonischen Shop-Render noch Legacy-Shop-DOM erzeugen;
  - der finale v4149-Render-Owner hatte bisher nur Navigation finalisiert, nicht den offenen Shop.
- Fix:
  - v4149 ruft nach jedem globalen Render bei aktivem `#shop` einmal den kanonischen `window.renderShop()` auf;
  - dadurch übernimmt der finale Shop-Owner wieder unmittelbar und entfernt seine bekannten Legacy-Blöcke.
  - Commit: `d3b9cd6330927f503f769d39f17eec53cc030a0e`.
- Cache-Bust:
  - Beta: `29e215a38154b85f56cb3237d7b56e05938b1a2a`
  - Server1: `8d346940899d67146d5509521f3c6ff2098f09b0`.


### 2026-10-05 – Letzte sichtbare Shop-Legacy-Overlays aus Video entfernt
- Nutzer-Video `1000099614.mp4` frameweise geprüft.
- Shop-Angebote selbst blieben stabil; nachträglich erschienen noch zwei alte UI-Elemente:
  - `🌙 Händler: tägliche automatische Aktualisierung um 00:00 Uhr.`
  - Scene-Title `BORKS AUSRÜSTUNG`.
- Producer 1 gefunden:
  - `js/features/system/beta/v8009-s8-v127-midnight-reset-system.js`
  - `v127AddResetInfo()` setzte bei globalen Rendern `#v127ShopResetInfo` vor die erste Shop-Card.
  - Zusätzlich prüfte der alte Server-Guard noch primär `shop` statt der heutigen Item-Authority.
- Fix:
  - Shop-Reset-Hinweis vollständig retired und vorhandener `#v127ShopResetInfo` wird entfernt;
  - `v127ServerOwned()` berücksichtigt jetzt ausdrücklich `v7081UseAuthority('items')`, damit die alte lokale Shop-Tagesresetlogik bei serverautoritativen Items blockiert bleibt.
  - Commit: `9df3c29208fc1fcc43569240aad61cf7f2fd6404`.
- Producer 2 gefunden:
  - `js/features/anonymous-extracted/beta/anon-0006.js`
  - `v043SceneLabels()` setzte bei jedem globalen Render historische Shop-Titel `BORKS AUSRÜSTUNG` / `SCHMUCK & VERZAUBERUNG`.
- Fix:
  - beide Shop-Einträge aus dem v043-Scene-Label-Owner entfernt;
  - vorhandene `#shop .v043-scene-title` werden bereinigt;
  - v461/v464 bleiben alleinige Shop-Heading-Owner.
  - Commit: `bdefd90cc6ec4cc68816bcf8d8a4234811491757`.
- Cache-Bust:
  - Beta: `bebac935ce65a2fe440b0f5ed6767ffc8ad1a2a9`
  - Server1: `5ec4282e85c789cb15b3e69f0881c1bfc433324b`.


### 2026-10-05 – Harz Lotto vollständig durch serverautoritären Harz-Automaten ersetzt
- Anlass: rechtlich/Play-Policy riskante Lotto-/Jackpot-Struktur mit käuflichen Harz-Talern entfernt.
- Neues Modell:
  - 5 Harz-Taler → 1 Belohnung
  - 10 Harz-Taler → 2 Belohnungen
  - 25 Harz-Taler → 3 Belohnungen, erste Belohnung garantiert Ausrüstung Blau+
  - 50 Harz-Taler → 5 Belohnungen, erste Belohnung garantiert Ausrüstung Episch+
  - mögliche Rewards: Gold, Edelstein/Rolle, Ausrüstung;
  - kein Spieler-Jackpot, keine Echtgeld-Auszahlung, keine Harz-Rückgewinn-Lotterie.
- UX:
  - vorhandener roter Automat bleibt;
  - Einsatzstufe wählen;
  - serverseitige Ziehung beim Einwurf;
  - Päckchen erscheint im Ausgabefach;
  - Klick auf Päckchen öffnet Belohnungsfenster;
  - nicht geöffnetes Päckchen bleibt serverseitig als Pending-Paket erhalten.
- Backend-Migration:
  - Migration `replace_harz_lotto_with_reward_machine_v8011` erfolgreich angewendet.
  - neue Tabellen `public.harz_machine_draws` und `server1.harz_machine_draws`.
  - neue RPCs je Schema:
    - `v8011_harz_machine_state()`
    - `v8011_harz_machine_play(integer)`
    - `v8011_harz_machine_reveal(uuid)`
  - alte `v8010_harz_lotto_*` Kauf-/Claim-RPCs fail-closed mit `LOTTO_RETIRED`;
  - alte Lotto-State-RPCs melden `retired=true`.
  - beide pg_cron Lotto-Jobs `v8010_harz_lotto_draw` und `v8010_server1_harz_lotto_draw` entfernt.
- Übergang:
  - 2 offene Beta-Lottoscheine automatisch erstattet;
  - insgesamt 50 Harz-Taler zurückgebucht;
  - Server1 hatte keine offenen Scheine.
- Reward-Kurven:
  - 5 HT: 60 % Gold / 25 % Material / 15 % Gear; Gear 55 % Grau / 35 % Grün / 10 % Blau.
  - 10 HT: 45 % Gold / 30 % Material / 25 % Gear; Gear 30 % Grau / 45 % Grün / 22 % Blau / 3 % Episch.
  - 25 HT: erste Belohnung Gear 78 % Blau / 20 % Episch / 2 % Legendär; weitere Ziehungen 35 % Gold / 30 % Material / 35 % Gear.
  - 50 HT: erste Belohnung Gear 82 % Episch / 16 % Legendär / 2 % Mythisch; weitere Ziehungen 25 % Gold / 25 % Material / 50 % Gear.
- Client:
  - `js/features/shop/beta/v8010-harz-lotto.js` in-place auf neuen V8.011 Harz-Automat umgebaut.
  - Commit: `c86fb52e7c3a6a4244d8bb4d92b42f09ace6438e`.
  - Automaten-/Päckchen-/Reward-CSS in `v8010-harz-lotto-v2.css`.
  - Commit: `8678898eb5d4fa8b39fbc80834a4b4193d4df311`.
  - Beta/Server1 UI-Texte von Harz Lotto → Harz-Automat und neue Cache-Versionen:
    - Beta HTML: `48b1b38d4ce44e954d2639ad474e87523e32621a`
    - Server1 HTML: `05e355180107de74c97f4a4a5fd89cfb9eba08e6`
- Rechts-/Chancenseiten:
  - `zufallschancen.html` auf echten aktuellen Server-Shopstand korrigiert:
    - Waffen/Rüstung 6 Angebote;
    - Schmuckbereich 2 Schmuck + 4 Materialien;
    - 74 % Grau / 22 % Grün / 3,5 % Blau / 0,5 % Episch;
    - Material 58 % Edelstein / 42 % Rolle.
  - Harz-Automat Chancen und Garantien vollständig offengelegt.
  - Commits:
    - Zufallschancen: `453a5b74bd6f9a5525237112d85df2bce10339c0`
    - Nutzungsbedingungen: `1077170c5b6ba732be8d0b65cbe8fdad25d5b5ee`
    - Kauf/Erstattung: `f71d1c519df0510f8c0a6987f81e5f442fb76844`
- QA:
  - neue RPCs je Beta/Server1 vollständig vorhanden (3/3);
  - keine Lotto-Cronjobs mehr vorhanden;
  - transaktionaler Beta-Test `play(5) → reveal` auf Testaccount erfolgreich und vollständig zurückgerollt.


### 2026-10-05 – Harz Lotto → Harz-Automat: Umbau gestartet (laufender Block)
**Ziel**
- Das bisherige Harz Lotto mit Schein, 6-aus-50, Dienstag-Ziehung, Spieler-Jackpot und 25-HT-Einsatz wird vollständig aus dem aktiven Produktpfad entfernt.
- Der vorhandene rote Automat bleibt als visuelle Basis.
- Neuer Ablauf:
  - Spieler wählt festen Einsatz: 5 / 10 / 25 / 50 Harz-Taler.
  - Server zieht die Harz-Taler ab und legt die komplette Belohnung bereits serverseitig fest.
  - Im Ausgabefach erscheint anschließend ein Päckchen.
  - Erst beim Klick auf das Päckchen öffnet sich das Belohnungsfenster.
  - App-Abbruch nach dem Einwurf darf die Belohnung nicht verlieren; unrevealed Päckchen bleibt serverseitig offen.
- Höherer Einsatz = mehr Belohnungen und bessere Qualitätschancen.
- Kein Spieler-Jackpot, keine Echtgeld-Auszahlung, keine Rückgewinn-Logik des alten Lottos.

**Backend bereits erledigt**
- Supabase-Migration `replace_harz_lotto_with_reward_machine_v8011` erfolgreich angewendet.
- Neue Tabellen:
  - `public.harz_machine_draws`
  - `server1.harz_machine_draws`
- Neue serverautoritative RPCs in Beta und Server1:
  - `v8011_harz_machine_state()`
  - `v8011_harz_machine_play(p_stake integer)`
  - `v8011_harz_machine_reveal(p_draw_id uuid)`
- Erlaubte Einsätze: 5 / 10 / 25 / 50 HT.
- Reward-Anzahl:
  - 5 HT → 1 Reward
  - 10 HT → 2 Rewards
  - 25 HT → 3 Rewards
  - 50 HT → 5 Rewards
- 25 HT: erste Belohnung garantiert Gear Blau+.
- 50 HT: erste Belohnung garantiert Gear Episch+.
- Aktuelle Reward-Kategorien im ersten Produktionsstand:
  - Gold
  - Edelstein / Verzauberungsrolle
  - Ausrüstung
- Rewards nutzen bestehende serverautoritative Systeme:
  - Gold über `v6358_server_award_gold`
  - Materialien über `v6359_add_weekly_material_for`
  - Gear über `v6359_make_item_for`
- Harz-Abzug wird serverseitig in `player_progress_trusted` gebucht und in `player_harz_events` geloggt.
- Ungeöffnete Päckchen werden über `revealed_at is null` dauerhaft wiedergefunden.
- Altes Lotto serverseitig stillgelegt:
  - `v8010_harz_lotto_buy_ticket` → `LOTTO_RETIRED`
  - `v8010_harz_lotto_claim` → `LOTTO_RETIRED`
  - `v8010_harz_lotto_state` meldet retired/replacement.
- Alte Lotto-Cronjobs entfernt:
  - `v8010_harz_lotto_draw`
  - `v8010_server1_harz_lotto_draw`
- Offene Lotto-Scheine der laufenden Beta-Runde wurden beim Übergang automatisch mit ihrem Einsatz erstattet; Erstattung wird idempotent als `lotto_retirement_refund:<round>` in `player_harz_events` geloggt.

**Client bereits erledigt**
- `js/features/shop/beta/v8010-harz-lotto.js` vollständig vom Lotto-Client zum Harz-Automaten-Client umgebaut.
- Commit: `c86fb52e7c3a6a4244d8bb4d92b42f09ace6438e`.
- Neuer Client:
  - nennt das Feature `Harz-Automat`;
  - zeigt HT-Bestand;
  - feste Einsatzbuttons 5/10/25/50;
  - Einwurf über `v8011_harz_machine_play`;
  - Päckchen erscheint im Automatenfach;
  - Päckchen öffnet über `v8011_harz_machine_reveal`;
  - Reward-Popup zeigt Gold / Material / Item inkl. Qualität;
  - Chancen-/Garantie-Popup direkt im Feature;
  - Tütchen-Tab bleibt Coming Soon;
  - alter Zahlen-/Schein-/Jackpot-/Dienstag-Code ist aus dem aktiven Client entfernt.

**Noch offen / nächster Schritt**
1. Beta- und Server1-HTML final prüfen und ggf. committen:
   - Hero-Text `Harz Lotto ist geöffnet` → `Harz-Automat ist geöffnet`.
   - Tab `Harz Lotto` → `Harz-Automat`.
   - `data-v8010-tab="lotto"` → `machine`.
   - Loading-Text anpassen.
   - Script-Cache-Bust auf `?v=8011machine1`.
   - Der letzte HTML-Schreibschritt wurde durch den Chatwechsel unterbrochen; NICHT davon ausgehen, dass er bereits committed ist.
2. Automaten-CSS auf Päckchen/Einsatzbuttons/Reward-Popup anpassen; vorhandenes Automatenbild beibehalten.
3. Beta zuerst testen:
   - 5/10/25/50 HT;
   - korrekter Harz-Abzug;
   - Päckchen bleibt nach Reload offen;
   - Reveal nur einmal;
   - Gold/Items/Materialien erscheinen serverseitig korrekt;
   - Topbar aktualisiert sofort.
4. Danach Server1-Funktionstest.
5. Rechtsseiten nach tatsächlichem finalen Mechanismus aktualisieren:
   - `nutzungsbedingungen.html`
   - `kauf-und-erstattung.html`
   - `zufallschancen.html`
   - alte Lotto-/Jackpot-/6-aus-50-Texte vollständig entfernen.
6. `zufallschancen.html` zusätzlich an den aktuellen Shopbestand anpassen (alte 9-Slot-Angaben sind veraltet).
7. Danach nächster Legal-Audit-Block:
   - Werbung/AdMob + `werbung.html` + Datenschutz/Data Safety
   - DSA-Meldeweg für rechtswidrige UGC-Inhalte
   - Play-Console Target Audience / Content Rating / Data Safety / Ads / Account Deletion gegen echten Build prüfen.

**Wichtig**
- Nicht wieder auf das alte Lotto-Modell zurückfallen.
- Kein Patch über den alten Lotto-Code legen; aktive Owner direkt auf Harz-Automat umstellen.
- Beta testen, dann Server1.


### 2026-10-05 – Harz-Automat wieder scharf
- Nutzer meldete: Automatenmotiv im neuen Harz-Automat sichtbar verschwommen, obwohl es im früheren Harz-Lotto scharf war.
- Ursache bestätigt: Beim Umbau auf `v8010-harz-lotto-v2.css` war der Hintergrund wieder auf das alte kleinere JPEG `assets/v8010-harz-lotto-machine.jpg` zurückgefallen.
- Fix direkt im bestehenden Automaten-CSS, keine neue Patch-Schicht:
  - Hintergrund wieder auf das bereits vorhandene HQ-Asset `assets/v8010-harz-lotto-machine-hq.webp` gestellt.
  - Commit: `93b4547f2047f125340be7336621f4f12958ffa1`.
- Cache-Bust für Beta und Server1 auf `8011machine2` erhöht.
- Automatenlogik, Rewards und Serverautorität unverändert.


### 2026-10-05 – Harz-Automat Bild-Fallback nach leerem Hintergrund
- Nach Umstellung auf das HQ-WebP wurde der Automatenbereich auf dem Gerät leer/schwarz dargestellt.
- Fix direkt im bestehenden Automaten-CSS:
  - primär weiterhin `assets/v8010-harz-lotto-machine-hq.webp`;
  - darunter `assets/v8010-harz-lotto-machine.jpg` als sichtbarer Fallback;
  - gleiche Größe/Position, keine neue Render-Schicht.
- Commit: `249f4914e07c08def600a744adaa3184c51983f2`.
- Cache-Bust Beta + Server1 auf `8011machine3`.


### 2026-10-05 – Harz-Automat: echte scharfe Lotto-Originaldatei wiederhergestellt
- Neuer Screenshot zeigte weiterhin starke Unschärfe plus Bildartefakte.
- Repo-/Historienaudit ergab die tatsächliche frühere scharfe Lotto-Lösung:
  - Originaldatei liegt weiterhin im Repo: `assets/file_00000000e27c8210b37148cc50f5d1af.png`;
  - Originalgröße ca. 1198×1313, Datei ca. 2,1 MB;
  - beim früheren Lotto wurde sie ab Commit `58eff407bfb0dc26634eda6b8bdaa216f8745282` als natives `<img>` gerendert;
  - der spätere CSS-Hintergrund mit 640×702/ca. 15–17 KB war die Quelle der sichtbaren Unschärfe/Artefakte.
- Fix direkt im bestehenden V8.011 Automaten-Owner:
  - natives `.v8010-machine-image` wieder in `v8010-harz-lotto.js` integriert;
  - CSS-Hintergrundbild aus `.v8010-machine` entfernt;
  - Original-PNG wird unverzerrt mit `width:100%; height:auto; filter:none; transform:none` gerendert;
  - Overlays (Bestand, Päckchen, Einsatzhinweis) bleiben absolut über demselben Automatencontainer.
- Keine neue Patch-/Render-Schicht.
- Cache-Bust Beta + Server1 auf `8011machine4`.


### 2026-10-05 – Harz-Automat Reward-Pool V8.012 erweitert
- Nutzerfreigabe für breiteren Belohnungspool umgesetzt.
- Serverautoritative Migration: `expand_harz_machine_reward_pool_v8012`.
- Neue Anzahl:
  - 5 HT → 1 Belohnung
  - 10 HT → 2 Belohnungen
  - 25 HT → 4 Belohnungen (3 normal + 1 seltene Garantie)
  - 50 HT → 7 Belohnungen (5 normal + 1 seltene + 1 Premium-Garantie)
- Normaler Pool:
  - 30 % Gold
  - 18 % Edelstein/Verzauberungsrolle
  - 16 % Zeit-Samen
  - 12 % Fragmente
  - 5 % Samen
  - 17 % Ausrüstung
  - 2 % kleine Harz-Taler-Rückgabe
- Harz-Rückgabe ist auf maximal einen Treffer pro Päckchen begrenzt; Höhe 1–3 HT abhängig vom Einsatz.
- 25-HT-Garantie:
  - 35 % Ausrüstung Blau+
  - 30 % 3–5 Zeit-Samen
  - 25 % 30–60 Fragmente
  - 10 % 2–3 bessere Samen
- 50-HT-Premium-Garantie:
  - 35 % Ausrüstung Episch/Legendär
  - 30 % 6–10 Zeit-Samen
  - 25 % 80–120 Fragmente
  - 10 % 4–6 bessere Samen
- Mythische Ausrüstung aus dem Harz-Automaten vollständig entfernt.
- Samen, Zeit-Samen und Fragmente werden direkt in den bestehenden serverautoritativen Zuständen gebucht und in den vorhandenen Eventtabellen protokolliert.
- Client-Chancenanzeige und Reward-Popup an neue Reward-Arten/Mengen angepasst.
- `zufallschancen.html` an die tatsächlichen neuen Wahrscheinlichkeiten/Garantien angepasst.
- Client-Code-Commit: `d792170833a0cea6e96ce0e23444dc789c6703ec`.
- Cache-Bust Beta/Server1: `8012rewards1`.


### 2026-10-05 – Tütchen-Dealer / Rewarded Ads: Freigabestrategie bis Play Store
- Der aktuelle `Coming Soon`-Lock des Tütchen-Dealers ist **absichtlich** gesetzt und soll vorerst bestehen bleiben.
- Grund: Die App ist noch nicht final im Play Store freigeschaltet. Bis dahin sollen ausschließlich Google-Testanzeigen verwendet werden.
- Aktueller technischer Stand:
  - native Rewarded-Ad-Bridge im Webcode über `window.Capacitor?.Plugins?.GrowLegendsAds`;
  - Reward-Aufruf über `showRewarded(...)`;
  - serverseitiger Tütchen-Fortschritt und Reward-State vorhanden;
  - Beta und Server1: `ad_bag_settings.enabled = true`, `mode = 'test'`;
  - produktiver Reward-RPC `v7215_ad_bag_apply_verified(...)` ist nicht für normale Clients freigegeben, sondern nur für `service_role`;
  - Testbetrieb kann über `v7215_ad_bag_admin_test_watch()` simuliert werden.
- Geplanter Ablauf **erst nach Play-Store-Freigabe**:
  1. native Google-Test-Ad-Unit in `GrowLegendsAds` gegen die echte Rewarded-Ad-Unit ersetzen;
  2. Server-Side-Verification / verifizierte Reward-Bestätigung im Produktionspfad testen;
  3. Consent/UMP, Datenschutz und Google-Play-Data-Safety gegen den tatsächlichen Produktions-AdMob-Build prüfen;
  4. `ad_bag_settings.mode` von `test` auf Produktion umstellen;
  5. erst danach den `Coming Soon`-Lock des Tütchen-Dealers entfernen;
  6. final testen: vollständig angesehenes Video = genau 1 Fortschritt, vorzeitig geschlossen = 0 Fortschritt, keine Doppelbelohnung.
- Bis zur Store-Freigabe **keine Produktiv-Ads aktivieren und den Coming-Soon-Lock nicht entfernen**.


### 2026-10-05 – Go-Live-Checkpoint: Rewarded Ads + Datenschutz nach Play-Store-Freigabe
- Bis zur finalen Play-Store-Freigabe bleibt der Tütchen-Dealer auf `Coming Soon` und der Ads-Pfad im `test`-Modus.
- **Erst nach Freigabe**:
  1. Google-Testanzeigen in der nativen `GrowLegendsAds`-Bridge durch echte Rewarded-Ad-Units ersetzen.
  2. Produktionspfad inkl. Server-Side-Verification / Reward-Bestätigung testen.
  3. `ad_bag_settings.mode` von `test` auf Produktion umstellen.
  4. Tütchen-Dealer `Coming Soon` entfernen.
  5. `datenschutz.html` an den tatsächlichen Produktionszustand anpassen:
     - Google AdMob / Werbedienst,
     - tatsächlich verarbeitete Geräte-/Werbe-/technische Daten,
     - personalisierte bzw. nicht personalisierte Anzeigen,
     - Consent/UMP bzw. tatsächlich eingesetzte Einwilligungslogik,
     - Empfänger/Drittlandübermittlungen,
     - Widerrufs-/Datenschutzoptionen.
  6. Google-Play-Data-Safety-, Ads- und ggf. Zielgruppen-/Content-Rating-Angaben gegen den finalen Produktions-Build abgleichen.
- Wichtig: Datenschutztext nicht auf Verdacht vorziehen; Grundlage ist der reale native Produktions-AdMob-Build.


### 2026-10-05 – Legal/Release Audit: Account-Löschung + UGC geprüft
- Rechtstexte gegen aktuellen Code geprüft:
  - `nutzungsbedingungen.html`, `kauf-und-erstattung.html`, `widerruf.html`, `datenschutz.html`, `zufallschancen.html`, `account-loeschen.html`.
  - Kein alter aktiver Lotto-/Jackpot-Mechanismus mehr in den aktuellen Rechtstexten; Harz-Automat ist als aktuelle Zufallsmechanik beschrieben.
  - `zufallschancen.html` entspricht dem aktuellen Harz-Automaten V8.012.
- Google-Play-UGC-Anforderung mit aktuellem Code abgeglichen:
  - Gildenchat hat Melden + Blockieren über `v8009-s1-v6144-player-safety.js`.
  - Meldungen landen serverseitig in `player_reports`; Blockierungen in `player_blocks`.
  - RLS/Policies begrenzen normale Nutzer auf eigene Meldungen/Blockierungen; Admins können Meldungen prüfen.
- Kritischer Account-Deletion-Befund gefunden und behoben:
  - vorher löschte `delete_my_account()` nur einige Alt-Tabellen direkt;
  - viele neuere serverautoritative Tabellen ohne FK-Cascade konnten personenbezogene/spielbezogene `user_id`-Daten behalten;
  - `guild_war_duels` hatte zwei `NO ACTION`-FKs und konnte die Account-Löschung blockieren.
- Migration angewendet: `harden_account_deletion_full_player_cleanup_v8013`.
- Neuer kanonischer Löschpfad für `public` und `server1`:
  - entfernt zuerst Guild-War-Duelle des Nutzers;
  - löscht anschließend dynamisch alle accountbezogenen Base-Table-Zeilen mit `user_id`;
  - `withdrawal_requests` bleiben als möglicher rechtlicher/verbraucherrechtlicher Nachweis bewusst ausgenommen;
  - löscht das Profil;
  - löscht zuletzt `auth.users`, sodass verbleibende CASCADE/SET-NULL-Beziehungen greifen.
- RPC-Sicherheit nach Fix:
  - `anon`: kein EXECUTE;
  - `authenticated`: EXECUTE erlaubt.
- Technische Verifikation Beta/public + Server1: neuer Cleanup, Duel-Cleanup und Retention-Ausnahme vorhanden.
- Noch offen vor finalem Store-Go-Live:
  - einen echten Testaccount einmal Ende-zu-Ende löschen und danach auf Restdaten prüfen;
  - Supabase Security Advisor separat bereinigen/klassifizieren (u. a. anonyme Rollenwarnungen und Leak-Password-Protection);
  - Ads/Datenschutz wie separat dokumentiert erst beim Produktions-AdMob-Go-Live finalisieren.


### 2026-10-05 – Finaler App-Inhaltsabgleich: sichtbare Alttexte + Beta-Parität bereinigt
- Finalen Inhaltsabgleich gegen aktuellen Repo-Stand durchgeführt.
- Gefundene sichtbare Altlasten:
  - Beta-Hinterhof-Dealer zeigte noch den alten Text `Tütchen-Dealer` / `Schau freiwillige Werbevideos ...`, obwohl Tütchen bis zum AdMob-Go-Live auf Coming Soon bleiben sollen.
  - Coming-Soon-Guard meldete noch `Harz Lotto ist bereits verfügbar`.
- Behoben:
  - Beta `index.html` auf aktuellen Hinterhof-Dealer-Text umgestellt:
    - `Hinterhof-Dealer`
    - `Harz-Automat ist geöffnet. Tütchen & Werbe-Belohnungen folgen später.`
    - Tütchen-Tab disabled / Coming Soon
    - Harz-Automat als aktiver Tab.
  - Alte sichtbare `Harz Lotto`-Toast-Meldung durch `Harz-Automat` ersetzt.
- Beim Paritätscheck zusätzlich entdeckt:
  - Beta hatte den Harz-Automat-Panelbereich, lud aber die aktuelle `v8010-harz-lotto-v2.css` und `v8010-harz-lotto.js` nicht direkt wie Server 1.
  - Asset-Loading in Beta auf Server-1-Parität gebracht.
- Interne historische IDs/Funktionsnamen wie `v8010LottoPanel` bleiben bewusst bestehen, solange sie nicht nutzersichtbar sind und funktional noch verwendet werden; kein unnötiges Rename/Rewrite.
- Aktueller sichtbarer Stand:
  - kein aktiver alter Lotto-/6-aus-50-/Dienstag-19-/Gewinnklassen-Flow;
  - Harz-Automat ist die aktuelle Zufallsmechanik;
  - Tütchen bleibt Coming Soon;
  - Datenschutz für echte AdMob-Werbung bleibt bis zum Produktions-Go-Live vorgemerkt.


### 2026-10-05 – Offene Restpunkte vor/bei öffentlichem Release
Erledigt und nicht erneut als offen behandeln:
- finaler App-Inhaltsabgleich durchgeführt;
- alte sichtbare Lotto-/Tütchen-Alttexte bereinigt;
- Beta-Harz-Automat auf Server-1-Asset-Parität gebracht;
- Account-Löschpfad gehärtet;
- ein Beta-Testaccount wurde erfolgreich gelöscht; Auth-User und Auth-Identity waren danach nicht mehr vorhanden;
- Melden/Blockieren/Moderation im Gildenchat vorhanden und geprüft;
- Play-Console-Grundeinstellungen wurden bereits gemeinsam durchgegangen.

Noch offen:
1. **AdMob-/Rewarded-Ads-Go-Live erst nach öffentlicher Play-Store-Freigabe**
   - Google-Testanzeigen in der nativen `GrowLegendsAds`-Bridge durch echte Rewarded-Ad-Units ersetzen.
   - Produktions-Reward/SSV bzw. serverseitige Reward-Bestätigung testen.
   - `ad_bag_settings.mode` von `test` auf Produktion umstellen.
   - Tütchen-Dealer `Coming Soon` entfernen.
2. **Datenschutz/Consent beim echten Ads-Go-Live finalisieren**
   - `datenschutz.html` an den realen Produktions-AdMob-Build anpassen.
   - tatsächliche Datenflüsse, Geräte-/Werbe-/technische Daten, personalisierte/nicht personalisierte Werbung, Consent/UMP, Empfänger/Drittlandtransfer und Widerrufsmöglichkeiten korrekt dokumentieren.
   - Google-Play-Data-Safety-/Ads-Angaben gegen den finalen Produktions-Build erneut abgleichen.
3. **Optionaler zweiter Account-Lösch-End-to-End-Nachweis**
   - vor dem Löschen UID notieren;
   - Testaccount löschen;
   - danach sämtliche relevanten Beta-Tabellen gezielt nach dieser UID prüfen.
   - Der erste praktische Löschtest war erfolgreich, aber ohne vorher notierte UID war kein vollständiger tabellenweiser Restdaten-Nachweis mehr möglich.
4. **Separater Supabase-Security-Audit kann noch durchgeführt werden**
   - Advisor-Warnungen klassifizieren;
   - insbesondere Anonymous-Sign-In/RLS-Warnungen und Leaked-Password-Protection prüfen;
   - nichts blind ändern, sondern nur echte Release-Risiken beheben.

Aktueller Release-Status:
- Für die Frage `Haben wir in der App die nötigen rechtlichen/policy-relevanten Bausteine?` sind die wesentlichen App-Funktionen und Rechtstexte vorhanden.
- Der einzige bewusst verschobene Pflichtblock ist der echte AdMob-/Datenschutz-Go-Live, weil die App derzeit noch nicht öffentlich mit Produktionswerbung läuft.


### 2026-10-05 – Beta: Leerbild nach 10-Minuten-Auto-Logout / Re-Login erneut reproduziert
- Nutzer meldete auf Beta mit `Tomssen5@gmail.com`: nach automatischem Logout und erneutem Login nur brauner Leerbereich mit Topbar; zusätzlich zwei Fehlercodes im Client.
- Diagnose gemäß Account-Fehlerregel:
  - Account-State-Health für Tomssen: ältere Einträge unauffällig; kein neuer Health-Report zum Fehlerzeitpunkt.
  - Runtime-Client-Errors: keine neuen Einträge; der Fehler passiert offenbar vor/außerhalb des normalen Runtime-Reporters.
  - Player-QA: keine neue Tomssen-Login-Snapshot-Serie zum Fehlerzeitpunkt; ebenfalls Hinweis auf sehr frühen Boot-/Auth-Abbruch.
  - Auth selbst war erfolgreich: `auth.users.last_sign_in_at` für Tomssen aktualisierte sich unmittelbar zum gemeldeten Zeitpunkt.
- Historie bestätigt: gleicher Fehlerbereich war am 30.09. bereits als 10-Minuten-Idle-Logout/Login-Race dokumentiert; damaliger manueller Endtest blieb offen.
- Aktuelle Root-Cause-Hypothese nach Repo-Abgleich:
  - `index.html` lud mehrere kritische Account-/Boot-Owner ohne Cache-Bust,
  - `beta.html` lud dieselben bereits mit Versions-Query,
  - dadurch konnte Android/WebView beim Re-Login ältere Auth-/Save-Owner weiterverwenden.
- Direkter Fix, kein Patch:
  - `index.html` lädt jetzt folgende bestehenden Owner mit den bereits in Beta verwendeten Versions-Queries:
    - `v145-account-isolation-fix.js?v=8102shopsavestrip1`
    - `v200-stable-core.js?v=8102shopsavestrip1`
    - `v224-atomic-boot-release.js?v=8088criticalboot1`
    - `v4136-account-save-owner.js?v=8102shopsavestrip1`
- Commit: `8fbd7974efa79a39f710699c2cce72ef6fcba375`.
- Nächster manueller Test:
  1. Beta einmal komplett neu laden / App neu öffnen, damit die neuen Script-URLs gezogen werden.
  2. Normal anmelden.
  3. Auto-Logout nach 10 Minuten auslösen lassen.
  4. Erneut mit demselben Account anmelden.
  5. Erwartet: Startseite rendert normal; kein leerer brauner Screen; keine alten Bootstrap-/Account-Fehler.
- Falls der Fehler erneut kommt: die beiden sichtbaren Fehlercodes exakt notieren/screenshotten; dann direkt gegen `v200` / `v301` / `v4136` weiterdiagnostizieren, ohne neue Auth-Schicht einzubauen.


### 2026-10-05 – Synthetischer Testspieler-Smoke ohne echten Charakter
- Ziel: einen dauerhaften Spieler-Lauf-Smoke ermöglichen, ohne einen normalen Charakter anzulegen und ohne Ranglisten/Rewards/Economy zu verändern.
- Neuer Repo-/CI-Test:
  - `qa/v8140-synthetic-player-smoke.mjs`
  - Workflow: `.github/workflows/v8140-synthetic-player-smoke.yml`
- Der Test benötigt **keinen Login, keinen Auth-User und keinen Charakter**.
- Read-only-Prüfungen:
  - Hauptscreens vorhanden: World, Character, Quest, Dungeon, Growroom, Gilde, PvP, Turm, Shop, Hinterhof-Dealer;
  - kritische Auth-/Boot-/Save-Owner werden geladen;
  - Idle-Logout-/Re-Login-Guards vorhanden;
  - Harz-Automat-JS/CSS vorhanden;
  - Tütchen bleibt Coming Soon;
  - alte sichtbare Lotto-/6-aus-50-/Dienstag-19-Texte fehlen;
  - alle lokalen JS/CSS/Asset-Referenzen aus `index.html` müssen als Datei existieren;
  - alle lokal geladenen JS-Dateien werden mit `node --check` syntaxgeprüft;
  - Player-QA-, Runtime-Error- und Account-Health-Diagnosefunktionen müssen vorhanden sein.
- Commits:
  - Testscript: `277cfc7eff489958e0b01a94e73aeb33582369d6`
  - Workflow: `227ababf1a3624df5e3d1a0aa139e27a2f81543c`
- Zusätzlich serverseitiger synthetischer Smoke direkt gegen Supabase Beta ausgeführt, ohne Datenänderung.
- Ergebnis Server-Smoke: **PASS**.
- Bestätigt vorhanden:
  - RPCs: `delete_my_account`, `gl_create_character`, `v8011_harz_machine_state`, `v8011_harz_machine_play`, `v8011_harz_machine_reveal`, `v8080_report_account_state_health`, `v8082_report_runtime_error`, `v8083_report_player_qa`;
  - Tabellen: `profiles`, `player_saves`, `player_progress_trusted`, `player_harz_events`, `harz_machine_draws`, `guild_chat_messages`, `player_reports`, `player_blocks`.
- Grenzen des No-Character-Smokes:
  - er führt absichtlich keine echten Quest-/Dungeon-/PvP-/Shop-/Harz-Automat-Aktionen aus;
  - er prüft Struktur, Ladekette, Syntax, Owner und Server-Verfügbarkeit;
  - für echte transaktionale Gameplay-Fehler bleibt ein authentifizierter Testaccount nötig.
- Künftig nach größeren Beta-Änderungen diesen synthetischen Smoke als ersten automatischen Gate verwenden, bevor Server 1 aktualisiert wird.


### 2026-10-05 – Synthetischer No-Character-Smoke erstmals real ausgeführt
- Workflow: `V8.140 Synthetic Player Smoke`.
- Erster echter Lauf: **FAIL**, dadurch direkt zwei Treffer sichtbar:
  1. `screen:tower` war ein zu strenger Testvertrag, weil der Turm über seine Runtime-Owner-Kette installiert/angesprochen wird und nicht zwingend als statischer Basis-HTML-Screen vorliegen muss.
  2. Echter Syntaxfehler in `js/features/guild/beta/v8008-c25-guildboss-runtime-owner.js`.
- Smoke-Diagnose verbessert:
  - Node-Syntaxfehler geben jetzt Datei + genaue Fehlermeldung/Zeile aus.
  - Turm wird über geladenen kanonischen Tower-Owner + `#tower`-Target-Vertrag geprüft statt nur über statisches HTML.
  - Commit: `85208865a96e71e18bdd006ec2057f51ca12e985`.
- Exakte echte Syntaxursache:
  - Gildenkrieg-Tab-`queueMicrotask` hatte im `catch`-Block eine fehlende schließende `}`.
  - Node meldete `SyntaxError: Unexpected token ')' ` bei Zeile 280.
- Direkt im bestehenden Gildenboss-Runtime-Owner korrigiert, keine neue Patch-Schicht:
  - Commit: `7b8451ce0f10474917508eecfa3296d4f42c36b7`.
- Danach automatischer Workflow-Lauf:
  - Run-ID `37348945608`
  - Ergebnis: **SUCCESS / GRÜN**
- Damit hat der neue No-Character-Smoke bereits beim ersten echten Einsatz einen realen geladenen JS-Fehler gefunden und abgesichert.


### 2026-10-05 – Harz-Automat 50 HT: Ziehung durch DB-Constraint blockiert
- Nutzer meldete: 50-Harz-Taler-Ziehung auf Beta funktioniert nicht.
- Live-Log-Diagnose bestätigte den Fehler eindeutig:
  - RPC `v8011_harz_machine_play(50)` erzeugte korrekt `reward_count = 7`.
  - Insert in `harz_machine_draws` scheiterte mit SQL-State `23514`.
  - Ursache: `harz_machine_draws_reward_count_check` erlaubte die 7er-Belohnungsmenge nicht.
- Beta-Fix:
  - `public.harz_machine_draws_reward_count_check` ersetzt.
  - Erlaubt jetzt exakt `reward_count in (1,2,4,7)`.
  - Migration: `allow_harz_machine_reward_count_7_beta`.
- Server-1-Parität ebenfalls korrigiert:
  - alter Check erlaubte nur `reward_count <= 5`.
  - jetzt `reward_count <= 7`.
  - Migration: `server1_harz_machine_reward_count_7`.
- Verifiziert:
  - public: `reward_count = ANY (ARRAY[1,2,4,7])`
  - server1: `reward_count >= 1 AND reward_count <= 7`
- Die fehlgeschlagenen 50-HT-Versuche liefen innerhalb des RPC-Statements in einen DB-Fehler und wurden dadurch transaktional zurückgerollt; es sollte dabei kein dauerhafter HT-Abzug verbleiben.
- Nächster manueller Check:
  - auf Beta erneut 50 HT ziehen;
  - erwartet: Paket wird erfolgreich erzeugt, 7 Belohnungen werden gespeichert und anschließend normal revealbar.


### 2026-10-05 – Startseite: WhatsApp Community durch Kanal ersetzt
- Aktueller Startseiten-Owner: `js/features/home/beta/v8009-home-renderer.js`.
- Alten WhatsApp-Community-Link ersetzt durch:
  - `https://whatsapp.com/channel/0029Vb91tC62f3EGkwjeQb2T`
- Sichtbarer Text geändert:
  - `Community beitreten` → `Kanal folgen`
  - aria-label → `Grow Legends WhatsApp-Kanal öffnen`
- Keine neue UI-Schicht eingebaut; bestehender Renderer direkt angepasst.
- Änderung gilt über denselben Home-Renderer konsistent für Beta und Server 1.
- Commit: `9192fd4612f3186f61f7383606c50e5b5415e82c`.


### 2026-10-05 – Harz-Automat: Belohnungen im Päckchen anklickbar
- Nutzerwunsch: Im Belohnungsfenster des Harz-Automaten sollen Items anklickbar sein:
  - Rüstung/Waffen → Vergleich + Anlegen;
  - Edelsteine/Rollen/sonstige Drops → Detailansicht, damit klar ist, was der Fund macht.
- Umsetzung direkt im bestehenden Automaten-Owner `js/features/shop/beta/v8010-harz-lotto.js`, keine zusätzliche Render-Schicht.
- Gear-Rewards:
  - werden nach Reveal gegen das tatsächlich gutgeschriebene Inventar-Item aufgelöst (ID/UID, sonst Name+Slot);
  - Klick öffnet den kanonischen `window.v4103OpenItemCompare(item,'inventory')`;
  - dadurch stehen der vorhandene Vergleich, Gesamtwertung sowie `Anlegen`/`Verkaufen` zur Verfügung.
- Material-/Spezial-Rewards:
  - Klick öffnet eine Automaten-Detailansicht;
  - Edelstein: Name, Qualität, Stat + Wert und Hinweis auf Sockelung / 1 Stein pro Item;
  - Verzauberungsrolle: Effekt + Wert und Hinweis auf 1 Rollen-Verzauberung pro Item;
  - Zeit-Samen, Fragmente, Grow-Samen und Harz-Taler erhalten kurze Funktionsbeschreibung.
- Gold bleibt reine nicht-interaktive Mengenbelohnung.
- Reward-Zeilen zeigen bei anklickbaren Belohnungen `Antippen`.
- CSS direkt in `v8010-harz-lotto-v2.css` ergänzt.
- Commits:
  - JS: `94a7f374b4aaeebaff1deeede2a3d280892d9cc7`
  - CSS: `aca8a958fb80395eacc627ce816c0557c21cde88`
  - index Cache: `ec1ad69f5c9b3000476d4c9448230a8089ebc558`
  - Server1 Cache: `707054df961682701cd547dfb65708d4952c95db`
- Cache-Key: `8014rewarddetail1`.
- Synthetischer No-Character-Smoke wurde durch die Änderung automatisch angestoßen; zum Zeitpunkt der Status-Aktualisierung noch queued.


### 2026-10-05 – Harz-Automat Reward-Anzahl auf 1 / 2 / 3 / 5 zurückgestellt
- Nutzer hat die gewünschte Staffelung klargestellt:
  - 5 HT → 1 Belohnung
  - 10 HT → 2 Belohnungen
  - 25 HT → 3 Belohnungen
  - 50 HT → 5 Belohnungen
- Vor Fix war der aktive Server-RPC fälschlich auf 1 / 2 / 4 / 7 gestellt.
- Serverautoritative Korrektur direkt in den bestehenden Funktionen:
  - `public.v8011_harz_machine_play`
  - `server1.v8011_harz_machine_play`
  - aktive Count-Zeile jetzt: 5→1, 10→2, 25→3, 50→5.
- Garantiestruktur passend reduziert:
  - 25 HT: 2 normal + 1 seltene Garantie
  - 50 HT: 3 normal + 1 seltene + 1 Premium-Garantie
- Historische Draws mit 4/7 Rewards existieren bereits. Deshalb bleibt der Tabellen-Check bewusst historienkompatibel bei `reward_count between 1 and 7`; neue Draws werden ausschließlich über den aktiven RPC mit 1/2/3/5 erzeugt.
- Client `js/features/shop/beta/v8010-harz-lotto.js` auf 1/2/3/5 und passende Texte korrigiert.
- Öffentliche Chancen-Seite `zufallschancen.html` auf denselben aktuellen Stand gebracht.
- Verifikation DB:
  - public: aktive Funktion enthält 25→3 / sonst 5;
  - server1: aktive Funktion enthält 25→3 / sonst 5.
- Commits:
  - Client: `ca9d89ba1961ba78044b26592896017e5bfbbb78`
  - Zufallschancen: `7b2a92419b93294ba77a20e5ef772333d811ebdf`
  - index Cache: `a5d6668a1c26bfa3ee19ad7e1b44b8229be319fc`
  - Server1 Cache: `8c908179e990f93424a017b4df98f4ac3316c12e`
- Cache-Key: `8015count12535`.


### 2026-10-05 – Anbau-Turm Header überdeckt Inhalte
- Nutzer-Screenshots zeigten in mehreren Turm-Zuständen, dass der orange `ANBAU-TURM`-Header nachfolgende Inhalte überdeckt, besonders im Kampf wurden die oberen Statusfelder abgeschnitten.
- Ursache im gemeinsamen Turm-CSS-Owner:
  - `css/features/tower/beta/v6271-tower-topbar-lobby-css.css`
  - `#tower .v6259-head` war `position: sticky` mit festem `top` unter der globalen HUD-Topbar.
  - Dadurch scrollten Route/Kampf/Reward/Mutation usw. unter den Turm-Header.
- Fix direkt im bestehenden Owner:
  - `position: sticky` → `position: relative`
  - `top: calc(...)` → `top: auto`
- Wirkung:
  - Turm-Header bleibt normal im Seitenfluss;
  - keine Überlagerung der jeweiligen Turm-Inhalte mehr;
  - gilt zentral für Lobby, Türen, Kampf, Rewards, Mutationen, Händler und weitere Turm-Ansichten.
- Kein zusätzlicher Offset-/Patch-Layer eingebaut.
- Commit CSS: `874db8d7faa4e21803064c203607a95cf9fdc44c`
- Cache-Key: `8016towerheaderflow1`
- index Cache: `bebcbdd32957f428eebdb9e228efce18bd62fa7f`
- Server1 Cache: `1e7176dad53b4537ad7c2605b4f2b38bd25168a6`


### 2026-10-05 – Anbau-Turm: globaler HUD-Safe-Bereich ergänzt
- Nach dem ersten Header-Fix zeigten neue Screenshots: der orange Turm-Header überdeckt seine eigenen Inhalte nicht mehr, aber der gesamte Turm kann beim Öffnen/Scrollen noch unter die feste globale Gold/Harz/Dampf-Leiste geraten.
- Zweiter zentraler Fix im selben Owner `css/features/tower/beta/v6271-tower-topbar-lobby-css.css`:
  - `#tower.active` erhält oben einen Safe-Bereich auf Basis des bereits gemessenen globalen HUD-Werts:
    - `padding-top: calc(var(--v654-hud-bottom, 82px) + 8px)`
    - zusätzlich passendes `scroll-padding-top`
- Dadurch startet der komplette Turm unterhalb der echten globalen HUD-Kante statt unter der Topbar.
- Gilt zentral für alle Turm-Zustände; keine Einzel-Offsets pro Route/Kampf/Reward.
- Commit CSS: `7c1015e4eaa3a59d92de9568bb6669162e4df037`
- Cache-Key: `8017towerhudsafe1`
- index Cache: `423a941000bef3e6a442f1debcee1b08a69ecccd`
- Server1 Cache: `0575049cd64ecbf42156157a8ca6ee55feb91fbf`


### 2026-10-06 – Rewarded Ads auf Produktion umgestellt
- Nutzerfreigabe: Tütchen-Dealer soll ab jetzt echte Werbung statt Google-Testanzeigen verwenden.
- Android-Repo `djtomssen-commits/Grow-Legends-Android`:
  - `.github/workflows/build-apk.yml` auf echte Grow-Legends Rewarded-Ad-Unit umgestellt.
  - Produktions-AdMob-App-ID bleibt `ca-app-pub-8173685824080775~1559500342`.
  - Rewarded-Ad-Unit jetzt `ca-app-pub-8173685824080775/5115601970`.
  - native Bridge meldet `testAds=false` / `testAd=false`.
  - VersionName auf `1.0.8` angehoben; versionCode kommt weiterhin aus dem GitHub-Run.
  - Commit: `7e33246f05c92a67d7704f79cafcec58bedf12cd`.
  - Build-Run 57 wurde automatisch gestartet.
- Supabase:
  - `public.ad_bag_settings.enabled=true`.
  - `mode` von `test` auf `production` umgestellt.
  - SSV-Edge-Function `admob-rewarded-ssv` ist aktiv und prüft Google-Signatur, Ad-Unit, Reward-Item, User-ID, Custom-Data und Transaction-ID, bevor der serverautoritative Reward-RPC ausgeführt wird.
- Wichtig:
  - die bereits in Google Play hochgeladene 1.0.7 enthält weiterhin den alten Test-Ad-Build;
  - echte Werbung kommt erst mit dem neu gebauten 1.0.8-AAB in die installierte App.
  - Tütchen-Tab im Webclient ist noch Coming Soon und wird im nächsten Block an den produktiven Rewarded-Pfad angebunden und freigeschaltet.


### 2026-10-06 – Datenschutzerklärung für produktive Rewarded Ads aktualisiert
- `datenschutz.html` auf Stand 06.10.2026 aktualisiert.
- Neu aufgenommen:
  - freiwillige Rewarded Ads / Google AdMob;
  - mögliche Verarbeitung von IP-, Geräte-/App-, Werbe-/Gerätekennungen, Diagnose- und Interaktionsdaten;
  - Google UMP für Einwilligungs-/Datenschutzoptionen;
  - personalisierte oder nicht personalisierte Anzeigen abhängig von Einwilligung/Region/Google-Konfiguration;
  - Server-Side-Verification für Reward-Gutschriften;
  - Widerruf/Änderung der Einwilligung über Datenschutzoptionen;
  - passende Rechtsgrundlagen sowie Google/AdMob als Empfänger/Dienst.
- Aussage `keine personalisierte Werbung` entfernt und durch den tatsächlichen Produktionszustand ersetzt.
- Repo-Commit Game: `841bfd89165f25a9022986aeb91212259a0e3927`.
- Android-Kopie `www/datenschutz.html` synchronisiert.
- Android-Commit: `ecb4fb9e1e55338d3d42b8eaf26247a2363eb047`.


### 2026-10-06 – Beta Tütchen-Dealer freigeschaltet
- Nach Produktions-AdMob-/Datenschutz-Umstellung wurde der vorhandene kanonische Tütchen-Flow auf **Beta** sichtbar freigeschaltet.
- Kein neuer Overlay-/Patch-Owner:
  - bestehender `v7215`-Owner in `v8009-s2-v086-polish-script.js` bleibt zuständig für State, Rewarded-Aufruf, SSV-Poll und Reward-Popup.
  - bestehender Hinterhof-Tab-Owner `v8010-harz-lotto.js` wurde direkt angepasst.
- Beta:
  - Tütchen-Tab nicht mehr disabled / Coming Soon.
  - Umschalten Tütchen ↔ Harz-Automat funktioniert über denselben Tab-Owner.
  - Tütchen öffnet `v7215BagDealerOpen()`.
  - Hero-Text auf produktiven Rewarded-Betrieb angepasst.
- Server 1 bleibt vorerst geschützt:
  - der gemeinsame JS-Owner blockiert den Tütchen-Tab weiterhin, wenn `server1` aktiv ist.
  - Freigabe erst nach Beta-Endtest.
- Commits:
  - Tab-/Owner-Fix: `e8d432dc1f30d84bde16cab86336d47f42d8fcaa`
  - Beta-Markup + Cache-Bust: `12e8321c24b4555469a085bdf24f6385e9a222f1`
- Nächster manueller Endtest in der Android-App mit dem neuen Produktions-Ad-Build:
  1. Tütchen öffnen.
  2. Rewarded Ad vollständig ansehen.
  3. Erwartet: genau +1 serverseitiger Fortschritt nach AdMob-SSV.
  4. Anzeige vor Reward schließen: 0 Fortschritt.
  5. denselben SSV-Event nicht doppelt gutschreiben.


### 2026-10-06 – Tütchen bis Veröffentlichung von 1.0.8 wieder auf Coming Soon
- Entscheidung: Solange Android **1.0.8** mit dem produktiven Rewarded-Ad-Bridge-Build noch nicht veröffentlicht ist, bleibt der Tütchen-Dealer sichtbar gesperrt.
- Grund:
  - aktuell live/ausstehend ist noch 1.0.7;
  - Tütchen hängt funktional vom neuen Produktions-AdMob-Build 1.0.8 ab;
  - verhindert, dass Spieler bereits eine UI sehen, deren nativer Produktionspfad noch nicht öffentlich verfügbar ist.
- Direkt im bestehenden Owner umgesetzt, keine neue Patch-Schicht:
  - `v8010-harz-lotto.js`: Tütchen-Tab global wieder gesperrt, Coming-Soon-Toast verweist auf 1.0.8.
  - `index.html`: Tütchen-Tab wieder disabled / COMING SOON; Hero-Text entsprechend angepasst.
  - Cache-Bust auf `8016rewardedhold1`.
- Commits:
  - Owner-Lock: `0d0c921526250b09fb90d9d9987f0b284703d2b8`
  - Markup/Cache-Bust: `e043fb087acf0cec26a2076e6ddc052624a75979`
- Freigabe erst nach:
  1. 1.0.8 öffentlich verfügbar,
  2. AdMob-Shop-Verknüpfung gesetzt,
  3. Rewarded-Endtest inkl. SSV erfolgreich.


### 2026-10-06 – Server 1 auf aktuellen Nicht-Balance-Stand aktualisiert
- Nutzerfreigabe: **Server 1 aktualisieren, Charakter-/Klassenbalance ausdrücklich ausnehmen.**
- Delta seit dem letzten Server-1-HTML-Update geprüft:
  - aktuelle Änderungen betrafen Rewarded-/Tütchen-Hold, Datenschutz und Status;
  - keine neue Klassenbalance wurde in diesem Delta freigegeben.
- `server1.html` direkt auf den aktuellen freigegebenen Nicht-Balance-Stand gebracht:
  - Hinterhof-Text wie aktueller Release-Stand: Tütchen/Rewarded folgen mit App-Version 1.0.8.
  - Harz-/Tütchen-Owner Cache-Key auf `8016rewardedhold1`, damit Server 1 den aktuellen **Coming-Soon-Lock** zuverlässig lädt.
  - Tütchen bleibt auch auf Server 1 bis 1.0.8 + AdMob-Verknüpfung + SSV-Endtest gesperrt.
- **Charakter-/Klassenbalance bleibt unverändert auf Server 1.**
  - bestehende Release-Channel-Trennung bleibt aktiv: `GROW_RELEASE_CHANNEL='server1'`;
  - `v319` bestätigt weiterhin `V319_BETA_BALANCE = ... !== 'server1'`;
  - damit werden die Beta-Balancewerte nicht auf Server 1 übernommen.
- Server-1-Release-Channel/Supabase-Schema-Trennung unverändert.
- Commit: `6246a150403d9e625188f95fef70eb1c32ce8807`.


### 2026-10-06 – Release-Readiness Vollaudit + Hardening
- Anlass: finaler technischer Gegencheck vor öffentlicher Veröffentlichung.
- GitHub/CI:
  - V8.140 Synthetic Player Smoke nach Aktualisierung der Release-Marker wieder **GRÜN**; Run #21 erfolgreich.
  - Smoke prüft >2000 Verträge, alle lokal geladenen Assets sowie Node-Syntax der geladenen JS-Dateien.
  - historischer DOM-Contract-Guard hatte einen Fehler in seinem eigenen Python-RegEx-Parser; QA-Script direkt repariert.
  - DOM Contract Guard Run #554 danach **GRÜN**.
- Android 1.0.8:
  - Play-Store-AAB-Workflow hatte nach der Umstellung auf echte AdMob-Werbung noch irrtümlich die alte Google-Test-Ad-Unit validiert.
  - Workflow direkt auf die echte Rewarded-Unit umgestellt.
  - Commit Android: `359c704986d77395b8fa1ddb148302079fc1320d`.
  - Play-Store-AAB + APK Run #59: **SUCCESS**.
  - normaler APK Run #28: **SUCCESS**.
- Runtime-Telemetrie der letzten 24 Stunden ausgewertet:
  - echte aktuelle JS-Fehler gefunden:
    1. `v301-auth-idle-hard-lock.js`: `v200DurableUser is not defined` bei Load-Order/Cache-Skew;
    2. `v6102-character-equipment-scroll-fix.js`: fehlendes `__V7126_CHARACTER_CHURN__` bei Slot-Write-Telemetrie;
    3. älterer Frost-Offhand-`insertBefore`-Race.
  - alle drei direkt in den bestehenden Ownern gehärtet, keine neue Patch-Schicht:
    - Auth-Fallback: `7af18fcba6478259cda8d01af7816b5273a6169b`
    - Slot-Telemetrie self-init: `410fa08ee0f3042b2fb3ca5b5272c3279ec7b7f3`
    - Frost-DOM-Insertion parent-safe: `6f6f5adad6ddbb52e5601aab5e38d898de7b6215`
  - Cache-Bust für diese drei Owner auf Beta/Stable und Server 1: `8141releasehardening1`.
- Supabase Release-Hardening:
  - Projektzustand: ACTIVE_HEALTHY.
  - unnötige anonyme EXECUTE-Rechte von spielverändernden SECURITY-DEFINER-RPCs auf **public und server1** entfernt.
  - Harz-Automat bleibt für `authenticated` + `service_role` verfügbar.
  - Gildenboss-Anmeldung bleibt für `authenticated` + `service_role`.
  - Dungeon-Side-Reward-Trigger ist nicht mehr direkt durch normale/anon Clients ausführbar; service_role bleibt.
  - `gl_server_access_pre_request()` bewusst nicht verändert, da es als Pre-Request-Gate funktionieren muss.
  - Migrationen:
    - `release_hardening_revoke_anon_gameplay_rpc_execute`
    - `release_hardening_revoke_public_anon_gameplay_execute`
  - Direkt verifiziert: die geprüften Gameplay-RPCs haben für `anon` jetzt `EXECUTE=false`.
- Nicht als Release-Blocker eingestuft:
  - RLS-enabled/no-policy INFOs auf RPC-only/fail-closed Tabellen;
  - ungenutzte Indizes / fehlende PKs auf historischen Backup-Tabellen;
  - wiederholte Tower/Dungeon-`stalled_action`-Telemetry bei ~6,5 s Replay-Phasen wirkt überwiegend wie Schwellenwert gegen absichtlich längere Animationen, nicht wie bestätigter Funktionsausfall.
- Noch bewusst offen / Release-Gate:
  1. **10-Minuten Idle-Logout → gleicher Account erneut einloggen** einmal manuell mit dem neuen Cache-Bust bestätigen; kein brauner Leerbildschirm.
  2. 1.0.7 kann als erster öffentlicher Stand ohne Tütchen-Ads live gehen; Tütchen bleibt Coming Soon.
  3. Nach öffentlichem Store-Eintrag AdMob mit Google Play verknüpfen.
  4. Danach 1.0.8 Rewarded-Endtest: volles Video = exakt +1 Fortschritt; Abbruch = 0; SSV keine Doppelgutschrift.
  5. Supabase Leaked-Password-Protection ist noch deaktiviert und sollte als Account-Hardening aktiviert werden; kein Gameplay-Code-Blocker.
- Release-Einschätzung nach Audit:
  - Kernspiel/Serverautorität/Build-Pipeline sind technisch nahe release-ready.
  - Vor endgültigem GO bleibt der manuelle Re-Login-Test als wichtigster unmittelbarer Funktionscheck.


### 2026-10-06 – Release-Risiko-Check: Geld / Spielstand / Account
- Ziel: nicht kosmetische Bugs, sondern nur Fehlerklassen prüfen, die bei echten Spielern finanziell oder rechtlich relevant werden können.
- Google-Play-Harz-Kaufpfad geprüft:
  - Client-Owner: `js/features/monetization/beta/v8009-s1-v6350-google-play-harz-billing.js`
  - Edge Function: `verify-google-play-purchase` (ACTIVE, verify_jwt=true)
  - Kauf wird serverseitig über Google Android Publisher API bestätigt.
  - Accountbindung über `obfuscatedExternalAccountId`/SHA-256 des Grow-Legends-Users.
  - Zielserver Beta/Server1 wird explizit mitgeführt.
  - Server-Gutschrift läuft ausschließlich über `gl_credit_google_play_purchase`.
  - Kauf-Token wird in `google_play_purchases` protokolliert.
  - Gutschrift ist idempotent über Purchase-Token + `player_harz_events` Event-ID; doppeltes Credit bei Retry wird verhindert.
  - Pending-/Recovery-Pfad ist vorhanden; offene Käufe werden bei Account-ready/pageshow/foreground und Dealer-Aufruf erneut geprüft.
- Aktuelle Runtime-Diagnose der letzten 24h zeigte 5 Fehler; release-relevant waren insbesondere:
  - `v200DurableUser is not defined` aus `v301-auth-idle-hard-lock.js`;
  - `v200SaveScopedLocal is not defined` aus `v4139-account-switch-authority.js`.
- Direktfix ohne neue Patch-Schicht:
  - `v200DurableUser` und `v200SaveScopedLocal` im kanonischen v200-Core explizit auf `window` exportiert.
  - v301 verwendet nur noch `window.v200DurableUser` und `window.v136Logout?.('idle')`.
  - v4139 schreibt seinen Save-Override direkt auf `window.v200SaveScopedLocal`, keine fragile Bare-Global-Zuweisung mehr.
- Commits:
  - v200: `d411054ee85e0416c09b901d8d776994e102a451`
  - v301: `aa15411c85f64683b181a2ea63c728de02d3c517`
  - v4139: `5d2759e4ea28936d670f954e0c6c3afe2c2ff9b2`
- Zwei Character-Runtime-Fehler (`slotWrites`, `insertBefore`) stammen aus zuvor geladenen/cached Versionen; aktueller Code enthält die Schutzlogik bereits. Deshalb kritische Character-Owner ebenfalls mit neuem Cache-Key ausgeliefert.
- Cache-Key: `8142releaseguard1`
  - index: `384bfdd191b837c004afef125efba5928b87d639`
  - server1: `111ded1ca78d63673c3d13d46fb7324ee4c89a0f`
- Synthetischer Smoke wurde durch die Commits automatisch gestartet; zum Zeitpunkt dieser Statusnotiz noch in_progress.
- Vor endgültiger Release-Freigabe noch manuell:
  1. App komplett neu starten, damit Cache-Key 8142 geladen wird.
  2. Auto-Logout nach 10 Min → Re-Login testen.
  3. Accountwechsel Beta ↔ anderer Account testen.
  4. Einen echten Google-Play-Testkauf mit dem finalen 1.0.8-Build durchlaufen: Kauf → Server-Credit → App-Neustart → Balance weiterhin korrekt.
- Bewertung:
  - normale optische/UI-Bugs sind kein Release-Rechtsblocker;
  - Spielstandverlust, Account-Lifecycle-Fehler, verlorene Premiumwährung und nicht wiederherstellbare Käufe bleiben Release-Blocker bis grün getestet.


### 2026-10-06 – Server 1 öffnet heute automatisch um 16:00 Uhr
- Nutzerfreigabe: Server 1 heute für alle Spieler öffnen.
- Öffnungszeit fest gesetzt auf **2026-10-06 16:00 Uhr Europe/Berlin** = **14:00 UTC**.
- Supabase:
  - `public.game_servers.id='server1'`
  - `enabled=true`
  - `opens_at='2026-10-06 14:00:00+00'`
  - bestehender Pre-Request-Gate öffnet damit ab exakt 16:00 Uhr automatisch für alle.
  - Early-Access-Testkonten behalten bis dahin Zugriff.
- Login-/Serverauswahl direkt im bestehenden `v343`-Owner angepasst:
  - Server 1 zeigt bis 16:00 einen live laufenden Countdown `HH:MM:SS`.
  - Text: Start heute 16:00 Uhr.
  - Countdown aktualisiert sich sekündlich.
  - ab 16:00 schaltet die Anzeige automatisch von geschlossen/Countdown auf **ONLINE · Live-Server**.
  - ab 16:00 blockiert der Client normale Accounts nicht mehr.
- Cache-Bust Beta/Stable + Server 1: `8142server1launch1600`.
- Commits:
  - Countdown-/Launch-Owner: `f66d8d5d77baab2ce471e81f6178403cdc3a885b`
  - index.html Cache-Bust: `a1bb18dd74b8c2fabe6f0fb182eec71a46d0a6a8`
  - server1.html Cache-Bust: `f3b0d6540bddb6963a79b188beaf407c52d3ea03`
- DB nach Migration verifiziert: Server 1 enabled=true, opens_at=2026-10-06 14:00:00+00.


### 2026-10-06 – Mehrsprachigkeit Power-Block 1
- Ziel: echtes zentrales Sprachsystem statt rein optischer DE-Anzeige im Login.
- Standard/Fallback bleibt **Deutsch**.
- Neu: zentraler Owner `js/features/i18n/v8143-i18n-core.js`.
- Unterstützte Sprachen im ersten Block:
  - 🇩🇪 Deutsch
  - 🇬🇧 English
  - 🇪🇸 Español
  - 🇫🇷 Français
  - 🇵🇱 Polski
  - 🇹🇷 Türkçe
- Sprachwahl:
  - Login-Topbar `🌐 DE` ist jetzt ein echtes Dropdown.
  - Auswahl wird in `localStorage:growthLegendsLanguage`-ähnlichem zentralem Schlüssel `growLegendsLanguage` gespeichert.
  - noch nie gewählte Sprache => Deutsch.
  - `<html lang>` wird dynamisch gesetzt.
  - fehlende Übersetzungen fallen automatisch auf Deutsch zurück.
  - Sprachwechsel feuert `growlegends:language-changed`.
- Bereits über den zentralen Owner lokalisiert:
  - Login-Grundoberfläche / Login-Aktionslabels
  - Serverauswahl inkl. Server-1-Countdown und Öffnungstexte
  - Hauptnavigation
  - Topbar-Ressourcen Gold / Harz / Dampf
  - Login-Featuretexte / Footer
- Server-/Spielstände werden NICHT übersetzt oder umgeschrieben; nur Darstellung.
- Beta und Server 1 laden denselben I18N-Owner.
- Cache-Bust für die betroffenen Owner: `8143i18n1`.
- Wichtige Commits:
  - I18N Core: `6f29f7e4692955459656acc541d386a8d09f5b28`
  - Login Selector: `c93528a2a3b6c4f812b5d0c421e03da1dad54dc6`
  - Serverauswahl: `131f1ee4021ce86ec37c9cbfd81dc16acfbaa12d`
  - Navigation: `77df322420f6c018bc8c368d0d06e7516777b133`
  - Topbar: `409833e8b18465b02297d3363e4272dee82e8c34`
  - Login Core: `cb5dca1829e826308abbd0309dcc820cde7e5556`
  - index/server1 Wiring: `774cc30a9121006b31a4fdb85fcc4229db83288a` / `c90bdf80d5964d1b4ccbbad094b75ce13c110732`
  - Smoke-Marker Update: `adfddcdf1fb24fa3c325e17a76ada5fe51461a9f`
- QA:
  - DOM Contract Guard blieb während der Umbauten grün.
  - Synthetic Smoke musste wegen des absichtlich geänderten Auth-Core-Cachemarkers auf `8143i18n1` aktualisiert werden; Run #36 ist nach Marker-Fix ausgelöst.
- Nächster Power-Block:
  - Startseite
  - Charakter
  - Growroom
  - Quest & Schicht
  - Dungeons / Turm
  - danach Shop/Schmiede/Dealer/PvP/Gilde/Hall/Freunde/Post und alle Popups/Toasts/Guides.

### 2026-10-06 – Mehrsprachigkeit Power-Block 2
- Zentralen I18N-Core erweitert:
  - `GrowI18n.register(locale, dict)` ergänzt, damit weitere Sprachpakete sauber nachgeladen werden können.
  - Commit: `8c6c8ada9c1eb1de056d6df78d77e032ac7eb518`.
- Neuer presentation-only Gameplay-I18N-Owner:
  - `js/features/i18n/v8144-i18n-gameplay.js`
  - keine Gameplay-/State-/RPC-Logik wird verändert;
  - übersetzt ausschließlich sichtbare Texte innerhalb der sechs Kernseiten dieses Blocks.
- Erste Kernseiten sprachfähig gemacht:
  - Startseite
  - Charakter
  - Growroom
  - Quest & Schicht
  - Dungeons
  - Anbau-Turm
- Unterstützte Sprachen weiterhin:
  - Deutsch (Default + Fallback)
  - English
  - Español
  - Français
  - Polski
  - Türkçe
- Abgedeckte sichtbare Bereiche u. a.:
  - Startseiten-Begrüßungen / Events / Schnellzugriff
  - Charakter-Tabs / Ausrüstungstitel / Slot-Grundtexte
  - Growroom Tabs / Genetik / Aufträge
  - Quest-Grundaktionen / Belohnung / Elite / Zeit-Samen
  - Dungeon-Grundaktionen / Versuche / Belohnungen
  - Turm-Hauptlabels / Recovery / Run / Rangliste / Guide-Grundtexte
- Sprachwechsel ist reversibel:
  - Original-DE-Texte werden pro DOM-Knoten/Attribut gespeichert;
  - DE → andere Sprache → andere Sprache → DE funktioniert ohne Reload.
  - Commit: `b72837630c3c39e5e5bcc1895c844643ab6d6c0c`.
- Wiring:
  - Beta/Stable `index.html` Commit `387c6ded60d204e8dfed4e38f12e8d7ed47809b2`
  - `server1.html` Commit `1bcdae12c9267c1bf8672355b831d516e3190660`
- QA nach Block:
  - DOM Contract Guard Run #567: **SUCCESS**
  - Synthetic Player Smoke Run #40: **SUCCESS**
- Nächster Power-Block:
  - Händler
  - Harzschmiede
  - Harz-/Gold-/Rahmen-Dealer
  - Hinterhof-Dealer
  - PvP
  - Gilde
  - Hall of Haze
  - Nebel-Crew
  - Nebel-Post
  - danach verbleibende Popups / Toasts / Guides / Spezialdialoge.

### 2026-10-06 – Mehrsprachigkeit Power-Block 3
- I18N-Abdeckung erweitert auf:
  - Händler
  - Harzschmiede
  - Harz-/Gold-/Rahmen-Dealer
  - Hinterhof-Dealer / Harz-Automat
  - PvP
  - Gilde
  - Hall of Haze
  - Nebel-Crew
  - Nebel-Post
- Der bestehende presentation-only Owner `v8144-i18n-gameplay.js` wurde erweitert; keine Gameplay-, Reward-, Save- oder RPC-Logik verändert.
- Neue übersetzte Kerntexte u. a.:
  - Händler-Kategorien / Reroll-Texte
  - Harzschmiede Tabs, Auswahl, Prismatisch-Schmieden, Samenfragmente
  - Dealer-Tabs Harz / Gold / Avatar-Rahmen
  - Harz-Automat Grundtexte / Päckchen / Chancen / Belohnungsdialoge
  - Gildenübersicht / Rollen / Fortschritt
  - Freunde / Anfragen
  - Nebel-Post Grundzustände / Antworten / Löschen / ungelesen
- Nebel-Post Datum/Zeit formatiert jetzt passend zur gewählten Sprache/Locale.
- Neue Root-Abdeckung im I18N-Bridge:
  - `shop`, `forge`, `harzDealer`, `bagDealer`, `pvp`, `guild`, `hall`, `friends`, `mail`
- Dynamisch gerenderte Inhalte werden nach Navigation zusätzlich verzögert nachgezogen, damit asynchron geladene Oberflächen mitübersetzt werden.
- Cache-Bust Power-Block 3:
  - Gameplay I18N: `8145gameplay2`
  - Mail Owner: `8145i18nmail1`
- Commits:
  - I18N-Erweiterung: `ac0c7ced3247c1778175716f53b66dcede99aab2`
  - Mail Locale: `40f4ce09ff5be90cfa36b0f75b28b21acf57283c`
  - index Wiring/Cache: `15b7a4776722f1d5a21619f00d29a114c85574ad`
  - server1 Wiring/Cache: `37239689b9d7ce664b5d33343770b314f1bfb3eb`
- QA:
  - DOM Contract Guard Run #568: **SUCCESS**
  - Synthetic Player Smoke Run #42: **SUCCESS**
- Nächster Block:
  - verbleibende Popups, Toasts, Guides, Spezialdialoge, Detailtexte und dynamische Result-/Belohnungsfenster komplett durchgehen;
  - danach Sprach-QA pro Sprache auf Mobile, insbesondere lange französische/polnische Texte und kleine Buttons.

### 2026-10-06 – Mehrsprachigkeit Power-Block 4
- Sprachsystem erweitert auf Popups, Bestätigungen, Guides und Belohnungsfenster.
- Abgedeckte Overlay-/Dialogbereiche u. a.:
  - Dungeon-Belohnungsfenster
  - PvP-Ergebnis/Belohnung
  - Quest-Belohnungsfenster
  - Level-Up Popup
  - Pet-Fund Popup
  - Täglicher Login-Bonus
  - Wochen-Truhe
  - Harz-Automat Detail-/Belohnungsfenster
  - Nebel-Post Nachrichtenmodal
  - Growroom Guide
  - Anbau-Turm Guide
  - allgemeine `[role="dialog"]`-Fenster
- Neue Kernübersetzungen in EN / ES / FR / PL / TR für:
  - Bestätigen / Abbrechen / Ja / Nein
  - Belohnung bestätigen
  - Sieg / Niederlage
  - Schließen / Zurück / Weiter / Überspringen / Fertig
  - Level-Up / Attributpunkte / Talentpunkte
  - täglicher Login-Bonus
  - Wochen-Truhe / Truhen-Status / Alles abholen
  - Guide-/Hilfetexte und Buttons.
- Umsetzung bleibt presentation-only:
  - kein Gameplay-State verändert
  - keine Reward-/RPC-Logik verändert
  - keine Save-Struktur verändert.
- Dialoge werden nach Klick/Öffnung in kurzen sicheren Nachläufen übersetzt, damit dynamisch erzeugte Modals ebenfalls erfasst werden.
- Cache-Bust: `8146dialogs1` auf Beta/Stable und Server 1.
- Commits:
  - Dialog-/Overlay-I18N: `07c8353aa2e7b035195612a52b1fc69b094a644b`
  - index Cache: `608e4b5ac86c484f17edd21da0b48712f248e933`
  - server1 Cache: `a90204993529a440162ddc628f61fcc87437a836`
- QA:
  - DOM Contract Guard Run #569: **SUCCESS**
  - Synthetic Player Smoke Run #44: **SUCCESS**
- Verbleibend für den Sprachabschluss:
  - lange Guide-Fließtexte und sehr spezielle Detailtexte vollständig migrieren;
  - dynamische Toast-Inhalte mit Variablen vollständig über Schlüssel führen;
  - Mobile-Layout-QA für lange französische/polnische Texte.

### 2026-10-06 – Mehrsprachigkeit Final-Polish
- Neuer finaler I18N-Polish-Owner: `js/features/i18n/v8147-i18n-final-polish.js`.
- Schwerpunkt:
  - lange Guide-Titel und zentrale Guide-Fließtexte
  - dynamische Toasts mit Namen/Variablen
  - finale Umschaltung der Hilfetexte ohne Einfluss auf Gameplay/State.
- Guide-Übersetzungen für die zentralen Spielbereiche in EN / ES / FR / PL / TR ergänzt; Englisch enthält zusätzlich einen größeren Satz der langen Einsteiger-/Kerntexte.
- Dynamische Toast-I18N ergänzt, u. a. für Material-Anwendung / Verbesserungsfeedback / Nachrichtenempfänger.
- Final-Polish wird auf Beta/Stable und Server 1 geladen.
- Commits:
  - Final-I18N Owner: `4214d83dafdcb425643a816c4103e91a0706afcb`
  - index Wiring: `879dd581e12baf49ad338d04dd3a094b09d649bf`
  - server1 Wiring: `1f6eecf4a4555d78ed3b7441acf430ec05a43d6b`
- QA:
  - DOM Contract Guard Run #570: **SUCCESS**
  - Synthetic Player Smoke Run #46: **SUCCESS**
- Release-Status Mehrsprachigkeit:
  - technisches Sprachsystem fertig;
  - Deutsch bleibt Default/Fallback;
  - Login, Navigation, Kernseiten, Shops, Social, Gilde, PvP, Guides, Popups und wichtige dynamische Dialoge sind eingebunden;
  - keine Save-/Reward-/RPC-/Balance-Logik durch die Sprachschicht verändert.
- Rest nur noch visuelles Geräte-QA: lange FR/PL-Texte auf kleinen Displays prüfen; das ist kein Architektur-/Gameplay-Blocker.


### 2026-10-06 – Sprachumschaltung Live-Fix: Login + Gameplay
- Nutzer-Repro: Trotz ausgewählter Fremdsprache blieben Login und Spiel sichtbar auf Deutsch.
- Zwei konkrete Ursachen im aktuellen Code gefunden und direkt in den bestehenden Ownern behoben:
  1. `v8143-i18n-core.js` löste die Login-Schlüssel aus `META` nicht über `t()` auf. Dadurch waren Teile des neuen Login-Sprachsatzes für den Translator faktisch nicht erreichbar.
  2. `v347-login-reference-design.js` rief aus dem Login-Layout erneut `GrowI18n.apply()` auf, während der I18N-Core seinerseits `v347EnsureLayout()` aufruft. Das erzeugte eine rekursive Core↔Login-Kette.
- Fixes:
  - `t()` verwendet jetzt `D` + `META` als kanonische Lookup-Quellen.
  - rekursiver `GrowI18n.apply()`-Rückruf aus v347 entfernt; v347 bleibt der kanonische Login-Layout-Owner.
  - Gameplay-I18N folgt jetzt dem tatsächlich aktiven `.screen` statt nur einer festen historischen Screen-ID-Liste.
  - Navigation triggert Sprach-Anwendung auch für dynamische/neue Screen-IDs.
  - Sprachwechsel wendet die Übersetzung zusätzlich auf alle bereits existierenden Screens an.
- Cache-Bust auf Beta/Stable + Server 1: `8151langlive1`.
- Commits:
  - Core Lookup: `98c9eb91135ad6a721ccad1c0aa4a205ed583ca1`
  - Login Rekursion: `b02c2daeb1b183fa762d38f030caea08facfa5f9`
  - Gameplay Active-Screen: `1b40ab2102d731a0632e0a5f6aa64fa66b3ba01b`
  - index Cache: `9bb96d051505008c06f936be8bf94119890c17c5`
  - server1 Cache: `8ee78cf2b319fa7f71f7c745aebb0a1c68d19069`
- Keine Gameplay-/Reward-/Save-/RPC-/Balance-Logik verändert.


### 2026-10-06 – Sprachumschaltung Selector-Binding Fix
- Nutzer-Screenshot bestätigt: selbst sichtbare Login-/Servertexte bleiben nach Sprachwahl auf Deutsch.
- Übersetzungsschlüssel/Renderer waren vorhanden; Ursache lag im eigentlichen Selector-Binding:
  - der Login-Topbar-Selector kann im Login-Lifecycle als DOM neu aufgebaut/ersetzt werden;
  - bisher wurde der `change`-Listener nur beim initialen Rebuild gesetzt;
  - ein später ersetzter, optisch identischer Selector konnte daher ohne aktiven Handler bleiben.
- Direkt im kanonischen v347 Login-Owner repariert:
  - `onchange` und `oninput` werden bei jedem `v347EnsureLayout()` neu gesetzt;
  - zusätzlicher delegierter `change`-Handler auf Dokumentebene fängt spätere DOM-Ersetzungen desselben Selectors ab;
  - Sprachwert wird weiterhin ausschließlich über den bestehenden `GrowI18n.setLanguage()` gesetzt.
- Kein neuer Renderer/Patch-Lifecycle eingeführt.
- Cache-Bust Beta/Stable + Server 1: `8152langbind1`.
- Commits:
  - Selector-Binding: `9bd0a0c264e1915b0dbca4636199e2ca88f53683`
  - index Cache: `e27cd3515a1daac198f49e54bfbac38ec619daf2`
  - server1 Cache: `29fce48ad6aa3ec988f548f2f5eef2f0c2524a35`
- Syntaxcheck v347 / v8143 / v8144: grün.


### 2026-10-06 – Ursache Sprachsystem endgültig gefunden: beta.html ohne I18N-Wiring
- Nutzer-Repro blieb trotz vorheriger Core-/Selector-Fixes unverändert: Login und Spiel auf Beta vollständig Deutsch.
- Entry-Point-Audit ergab die eigentliche Ursache:
  - `index.html` und `server1.html` luden die neuen Sprach-Owner;
  - `beta.html` lud **keinen** der drei I18N-Owner.
- Dadurch war auf dem tatsächlichen Beta-Build keine Sprachengine aktiv; die Auswahl konnte optisch vorhanden sein, aber Übersetzungen konnten nicht greifen.
- Direkt in `beta.html` behoben:
  - `v8143-i18n-core.js` eingebunden;
  - `v8144-i18n-gameplay.js` eingebunden;
  - `v8147-i18n-final-polish.js` eingebunden;
  - Reihenfolge wie im kanonischen aktuellen Entry-Point vor `v200-stable-core`;
  - v200/v343/v347 Cache-Key auf `8153betai18n1` aktualisiert.
- Commit: `9e9276dc8a3f56a715c583e3e803705f4d914636`.
- Keine Gameplay-/Save-/Reward-/RPC-/Balance-Logik verändert.


### 2026-10-06 – Ingame-Sprachumschaltung: finaler Render-/Navigations-Owner korrigiert
- Nutzer bestätigt: Login übersetzt nach beta.html-Wiring, Ingame blieb vollständig Deutsch.
- Ursache im tatsächlichen Last-Writer gefunden:
  - `v8009-s8-v4149-final-navigation-render-authority.js` baute das finale Menü mit fest verdrahteten deutschen Labels.
  - derselbe finale Navigations-Owner rief nach `v032Go(...)` keinen I18N-Nachlauf auf und dispatchte keinen `growlegends:navigation-open-v7119`-Event.
  - dadurch konnten dynamisch neu gerenderte Seiten nach Login/Navigation wieder Deutsch bleiben; v8144 lief am finalen Renderzeitpunkt vorbei.
- Direkt im kanonischen v4149-Owner behoben:
  - finale Menülabels werden über `GrowI18n.t('nav.*')` erzeugt;
  - nach dem finalen globalen `render()` wird die aktuell aktive Seite über `v8144GameplayI18n.schedule(activeId)` lokalisiert;
  - nach `v032Go(id)` wird der bestehende Navigation-Event ausgelöst und die Zielseite lokalisiert;
  - bei `growlegends:language-changed` wird das finale Menü erzwungen neu gebaut und alle vorhandenen Screens erneut lokalisiert.
- Keine neue Render-Schicht; Änderung direkt im bereits bestehenden finalen UI-Owner.
- Cache-Bust: `8154ingamei18n1` auf index.html, beta.html und server1.html.
- Commits:
  - v4149 final owner: `6c557cddd6897ee0d2bbda83cf10d4e4d1ebeac6`
  - index: `074443b15ab625dc020733831192a7fef33bc5da`
  - beta: `f6d07a490b41c11ce33eef3716b59215450fa386`
  - server1: `8ffd43338c32a20b3617e2f51b7588272bcc8248`
- Syntaxcheck v4149 + v8144: grün.


### 2026-10-06 – Ingame-I18N Power-Block: kanonische Kernseiten direkt angebunden
- Nutzer bestätigt nach Login-/Navigationsfix: Navigation übersetzt, eigentliche Spielseiten weiterhin Deutsch.
- Ursache:
  - Navigation/Login verwenden echte I18N-Schlüssel.
  - Die aktuellen Gameplay-Owner schreiben große Teile ihrer Oberfläche weiterhin direkt auf Deutsch in ihre Templates.
  - Die bisherige globale Textbrücke lief zeitlich zu früh bzw. traf viele aktuelle Texte nicht.
- Direkte Owner-Integration umgesetzt:
  - Startseite: `v8009-home-renderer.js`
  - Charakter: `v8009-s2-v459-character-hub.js`
  - Quest: `v6344-quest-variety-js.js`
  - Dungeon: `v8009-d4-v261-detail.js`
  - Growroom: `v8009-s1-v492-growroom2.js`
  - Anbau-Turm: `v8009-t1-tower-system.js`
- Jeder dieser kanonischen Owner wendet die I18N-Darstellung unmittelbar nach seinem eigenen finalen Render an; kein zusätzlicher Polling-/Observer-Renderer.
- `v8144-i18n-gameplay.js` um aktuelles Vokabular der realen Renderer erweitert, inkl. Startseite, Growroom, Charakter, Dungeon und Turm in EN/ES/FR/PL/TR.
- Growroom-Einbau hatte im ersten Commit eine fehlende Abschlussklammer; durch Syntaxcheck erkannt und direkt korrigiert, bevor Testfreigabe.
- Alle betroffenen JS-Dateien danach Syntaxcheck: **grün**.
- Cache-Bust auf index/beta/server1: `8156corepages2`.
- Wichtige Commits:
  - Home: `173ff9e2109bb206f68aadd519a86d49e6df8440`
  - Quest: `b06e30e3eb3091ffe02e6307bd56085f8d7a74ad`
  - Character: `6f914dd947cb2c922fecb59a4fdd33ea86a80ab0`
  - Dungeon: `7565d70b546a7a833107dd0a75d5dd19d691de5e`
  - Growroom: `0353cfda6525aa35eba84af30a71d1e6191def8b`, Brace-Fix `aefeddd22813e70bf22b7d93989904d1f082bcaa`
  - Tower: `0a15b29d1393c6cdd9a294b58e12937ed6e029bf`
  - I18N Vokabular: `cdba162a331996314f6d222f210665be61a94885`
  - Cache index/beta/server1: `131020c29ca8836b5375bf9e6ca72cb03827b777` / `6ffba40644c026fe434f4dd3ee39c2adb163d62a` / `41a2c6bb1d0160c5793f571dc9a9142173e51be6`
- Nächster I18N-Block nach Geräte-Repro:
  - Händler
  - Harzschmiede
  - Harz/Gold/Rahmen-Dealer
  - Hinterhof-Dealer
  - PvP
  - Gilde
  - Hall of Haze
  - Nebel-Crew
  - Nebel-Post
  - Endgame/Nebelkarawane


### 2026-10-06 – Whole-Game-I18N Wörterbuch zentralisiert + dynamische Texte
- Nutzerwunsch: nicht nur einzelne Seiten, sondern das **gesamte Spiel** in das zentrale Wörterbuch aufnehmen; alle vorhandenen Sprachen vollständig mitziehen.
- Zentrale Gameplay-I18N in `v8144-i18n-gameplay.js` erweitert:
  - große Whole-Game-Vokabularschicht für EN / ES / FR / PL / TR;
  - Growroom vollständig erweitert, u. a. Freie Töpfe, Raum-Upgrade, Pflege, Licht einstellen, Gießen, Beschneiden, Nährstoffe, Samenlager, Pflanzenstatus, Qualitäts-/Ernte-/Bufftexte;
  - gemeinsame Gameplay-Begriffe für Charakter, Shop, PvP, Gilde, Social, Mail, Hall/Endgame/Nebelbereiche ergänzt.
- Zusätzlich dynamische Pattern-Übersetzungen eingebaut, damit Texte mit Live-Werten nicht deutsch bleiben:
  - `Freier Topf N`
  - `Topf N`
  - `Pflege X von Y`
  - `X/Y Töpfe`
  - `N Sorten`
  - `<Sorte> pflanzen`
  - `N× ernten`
  - `Aktiv: ...`
  - `N Min. aktiv`
  - `Vorrat: N`
  - `Ausgewählt: ...`
  - weitere dynamische Level-/Rang-/Pflegeformulierungen.
- Zentraler Screen-Registry erweitert um aktuelle Bereiche:
  - world, character, grow, quests, dungeon, tower, caravan, endgame, shop, forge, harzDealer, goldShop, bagDealer, pvp, guild, hall, friends, mail, admin, systemtech.
- Syntaxcheck I18N + Growroom: grün.
- Cache-Bust auf index/beta/server1: `8157wholei18n1`.
- Commits:
  - Whole-game Wörterbuch + Patterns: `442aa32a8c1a1aa892a2e078ccf89c9fcb616604`
  - Screen registry: `d7dd52d6d261adc873df6d207d9b9456192a2865`
  - index/beta/server1 cache: `bd5b9c1ab8178b6e981accc72a6a051301613470` / `dcb693f22aa23d19a2cf9de2e3495ef0c973882d` / `ddc46bc27a394d0b1d0a006b58be58440dd6a469`
- Prinzip bleibt: keine neue Patch-Schicht; bestehende zentrale I18N-Bridge wird als ein Wörterbuch-/Pattern-Owner ausgebaut.


### 2026-10-06 – I18N Abschlussblock: Composite-Phrasen + bestätigte Resttexte
- Nutzer meldete nach Whole-Game-I18N weiterhin deutsche Resttexte.
- Vollständiger automatischer Scan aller 642 Beta-Skripte wurde vom GitHub-Connector wegen Tool-Call-Limit nicht in einem Durchgang zugelassen; deshalb Abschluss robust im zentralen I18N-Owner umgesetzt.
- `v8144-i18n-gameplay.js` erweitert:
  - kontrollierter Phrasen-Fallback nach Exact-Match + Dynamic-Pattern;
  - lange bekannte Wörterbuchphrasen werden innerhalb zusammengesetzter Live-Texte übersetzt, Zahlen/Namen bleiben erhalten;
  - kurze/generische Tokens werden bewusst ausgeschlossen, um Itemnamen/Spielwerte nicht versehentlich zu verändern.
- Bestätigte Growroom-Resttexte vollständig in EN/ES/FR/PL/TR ergänzt:
  - Topf-Hinweis / Detailhinweis
  - kompletter Pflege-Erklärungstext
  - Wachstumszeit-/Ertrags-Upgrades
  - Kein Buff aktiv
  - Keine Samen
  - Pflanzenplatz nicht verfügbar
  - freier/freigeschalteter Topf
  - nicht käuflicher Samen / Loot-Hinweis
  - Mutation entdeckt
  - Ernte abgeschlossen
  - Samen-Händler
  - Diese Woche
  - Mutationen / Ertrag / Wachstumszeit / Licht
- Syntaxcheck `v8144-i18n-gameplay.js`: grün.
- Cache-Bust index/beta/server1: `8158fullscan1`.
- Commits:
  - Composite-Phrasen-Fallback: `0486950360b7020f781147c422bd78dca0a6b720`
  - Restübersetzungen: `f4df5a70f081f83a651a658ffb85067af1619ce8`
  - index/beta/server1: `27089b08fb3f08eb68723f62981b7364515a23a8` / `65d13cf859e6b04343fb4075e48ba210e227435a` / `02d60242fc92ef3351a507aeb8e573b2d5f432b0`


### 2026-10-06 – I18N Power-Block 1: Inventarisierung + Runtime-Audit
- Ziel: Sprachmigration nicht weiter per Sichtprüfung/Einzelstring, sondern mit belastbarer Source-of-Truth.
- Statische Inventur des tatsächlich geladenen `beta.html` erstellt:
  - 293 sichtbare statische Texte im DOM gefunden.
  - 137 davon als deutschsprachige UI-Kandidaten erkannt.
  - davon waren erst 11 als exakte Literale bereits zentral in `v8144-i18n-gameplay.js` abgedeckt.
  - 126 statische deutsche Kandidaten fehlen damit noch als direkte zentrale Übersetzung bzw. müssen in kanonische Keys migriert werden.
- Inventar im Repo:
  - `V8159_UI_INVENTORY.json`
  - enthält deutschen Source-Text + aktuellen Literal-Abdeckungsstatus.
- Neuer **diagnostischer** Beta-Scanner:
  - `js/features/i18n/v8159-i18n-audit.js`
  - scannt gerenderte Screens, Login/Dialogs/Overlays auf sichtbare deutsche Textknoten sowie aria-label/title/placeholder;
  - speichert letzten Bericht in `window.__V8159_I18N_AUDIT_LAST__` und `localStorage.growLegendsI18nAudit`;
  - API: `window.v8159I18nAudit()` / `window.v8159I18nAuditGet()`;
  - reagiert auf Sprachwechsel, Navigation und Account-Ready.
- Der Audit ist reine Diagnose: kein Renderer, kein State-/Reward-/RPC-/Balance-Eingriff.
- Audit vorerst **nur in beta.html** eingebunden.
- Commits:
  - statische Inventur: `9da47b51a1115e66c2044d150b1c2a22a14d5c19`
  - Runtime-Audit: `87fc5ec2716e21e2c381137bf4179c16f154d569`
  - Beta-Wiring: `a806a62bc0a0563bc60c9d46ffa998d96ee1c408`
- Nächster Power-Block:
  - 126 statische Kandidaten in saubere I18N-Keys + EN/ES/FR/PL/TR überführen;
  - danach aktive dynamische Resttexte anhand Runtime-Audit schließen;
  - erst danach die Übergangs-Textbrücke reduzieren.


### 2026-10-06 – Server 1 Countdown auf 20:00 Uhr verschoben
- Auf ausdrücklichen Wunsch die öffentliche Server-1-Öffnung heute von 16:00 auf **20:00 Uhr Europe/Berlin** verschoben.
- Kanonischer Gate-/Countdown-Owner:
  - `V343_SERVER1_OPENS_AT` von `2026-10-06T14:00:00Z` auf `2026-10-06T18:00:00Z` geändert.
  - Fallback-/Hinweistexte von 16:00 auf 20:00 aktualisiert.
- I18N-Core:
  - alle Server-1-Launchtexte für DE/EN/ES/FR/PL/TR auf 20:00 aktualisiert.
- Cache-Bust auf index/beta/server1: `8160server12000`.
- Syntaxcheck v343 + v8143: grün.
- Commits:
  - v343 Countdown/Gate: `d53f7a4a0b7e8f7facf172267442bad66d795836`
  - I18N Launchtexte: `ee03d9838bac5103a0a6c7aa480c2eb1c23fa3b0`
  - index/beta/server1: `7779cc049567fee10c2698998ae45d5415c91033` / `b141ed82f3f1145a807918f0f4264f121aa4b00b` / `f33b6af5d1739c2bb76e3ae5236f7eb0579d703f`


### 2026-10-06 – I18N Power-Block 2: statische Beta-UI vollständig zentral abgedeckt
- Inventur wurde korrigiert, weil der erste Abgleich nur `v8144` berücksichtigt hatte.
- Neuer zentraler Abgleich über:
  - `v8143-i18n-core.js`
  - `v8144-i18n-gameplay.js`
  - `v8147-i18n-final-polish.js`
- Korrigierter Ausgangsstand:
  - 137 deutsche statische UI-Kandidaten in `beta.html`
  - 16 bereits zentral vorhanden
  - 121 tatsächlich fehlend
- Drei große Übersetzungsblöcke in `v8144-i18n-gameplay.js` ergänzt, jeweils für EN / ES / FR / PL / TR:
  1. Charakter-Grundlayout, Grow-Fallbacks, Quest, Dungeon, PvP
  2. Gilde, Gildenboss, Gildenkrieg, Hall of Haze, Nebel-Crew, Nebel-Post
  3. Hinterhof-/Dealertexte, Admin, Account-Löschung, Support, Gildenchat, Moderation
- Ergebnis der statischen Source-of-Truth-Inventur:
  - **137 / 137 zentral abgedeckt**
  - **0 statische deutsche Kandidaten offen**
- `V8159_UI_INVENTORY.json` auf neuen Stand aktualisiert.
- Syntaxcheck `v8144-i18n-gameplay.js`: grün.
- Cache-Bust index/beta/server1: `8161staticcomplete1`.
- Commits:
  - Inventur-Abgleich korrigiert: `fe148e0308b748bcd59fd7eb97325ebc4997c628`
  - Static UI A: `dd6428f09fda9169cc13b2abe6ebf474e323ce61`
  - Static UI B: `0db646d2a0011de95813cf3f1d8bd765004447c6`
  - Static UI C: `5701030ed7dd243eee48f7b8d4daafa2652ca011`
  - Inventur 137/137: `4dce6024b3ee61b95746574e17fef03609f023ee`
  - index/beta/server1 Cache: `1a92a5ca4e0d591ba8d06873d03837a827f28777` / `ce3e4c2c497129ddbd226526b0cffa33eec2de56` / `4af006acae602f0994a95434c084ff6844322e3a`
- Nächster Schritt:
  - Runtime-Audit auf Beta nutzen, um nur noch dynamisch gerenderte deutsche Resttexte zu schließen.
  - Statische `beta.html`-Grundoberfläche ist jetzt vollständig zentral abgedeckt.


### 2026-10-06 – I18N Power-Block 3: dynamische Laufzeittexte
- Nach statisch 137/137 nun aktive Runtime-Owner auf dynamische deutsche Texte geprüft.
- Große dynamische Blöcke für EN/ES/FR/PL/TR ergänzt:
  - Quest-Belohnungen / zusätzliche Beute / Zeit-Samen
  - Dungeon-Belohnungsmodal
  - Shop-Kauf-/Reroll-Feedback
  - Item-Vergleich / Spezialeffekt-Hinweise
  - Weltboss / mystische Status- und Achievement-Texte
  - Einstellungen / Account-Löschung
  - Growroom Live-Zustände, Pflege, Gilden-Gewächshaus, Offline-Wachstum, Grow-Achievements
  - Mail-Fehler / Versandstatus
  - Harzschmiede / Schutzstatus / Zerlegen
  - Ressourcen-Events
  - Profil-/Ranglistenstatus
  - Gildenboss / Gildenkrieg Live-Zustände
  - Turm Mittwoch-/Run-/Shop-/Türstatus
- Zusätzlich neue dynamische Regex-Patterns für Live-Werte:
  - +N Zeit-Samen
  - Neuer Bestand
  - Item-Zielinventar
  - Samen-Vorrat / Samenfund / Samenkauf
  - PvP-Sieger
  - Auffüllungen X/Y
  - episch/legendär ausgewählte Items
  - Bossstufe / HP
  - Mittwochs-Rangplatz
  - Turmblätter
  - Grow-Kaufpreis / gesperrter Topf / Pflege X/4
- Reine Entwickler-/SQL-Diagnose bewusst nicht als Spieler-I18N übernommen.
- Syntaxcheck v8144: grün.
- Cache-Bust index/beta/server1: `8162runtimei18n1`.
- Commits:
  - Runtime A: `57af03f28f1da15b678298db87c1251859763053`
  - Runtime B: `0176d5de7083e80d8aaae2f62091c368438fb733`
  - Runtime Patterns: `fac5cc8a68c7e1fce63384cac4bd1662452e1587`
  - Runtime C (Tower/Guild): `fc500ebe02a16de1a77f36e7ab3cdd84ef052b63`
  - index/beta/server1 cache: `2394bd5e99385c4da31cd8e6974c358e82e17399` / `0edec42153ebb4076add52f98c0f28ef358b7b31` / `c6e112b0f703e39e92b4086ae5dff0c6f691c65f`
- Nächster Schritt:
  - Beta auf EN einmal komplett durchklicken; Runtime-Audit zeigt nur noch echte sichtbare Resttexte.
  - verbleibende Restmenge danach schließen.


### 2026-10-06 – Charakter Attribute springen auf alten Render: Root Cause + Fix
- Nutzer-Video geprüft: Am Ende springt der Attribute-Tab sichtbar auf den alten Renderer; `Grow-Skill: 0` taucht wieder auf.
- Root Cause eindeutig im kanonischen Basiszustand gefunden:
  - `js/features/core/beta/v8009-a1-legacy-state-core.js`
  - dessen globales `render()` schrieb spät erneut direkt nach `#attrs.innerHTML`
  - alte Map enthielt `growSkill / Grow-Skill`
  - damit überschreibt der Legacy-Basisrenderer nachträglich den modernen `v4140`-Attribute-Owner.
- Direkt an der Ursache repariert:
  - Legacy-`#attrs.innerHTML`-Writer vollständig retired.
  - Basis-`render()` delegiert Attribute nur noch an `window.v4140PaintAttributes?.()`.
  - `growSkill` aus `defaultState.attrs` entfernt.
  - `growSkill` aus den zwei alten Basisitems entfernt.
  - alte `itemBonus`-Darstellung übersetzt den entfernten Stat nicht mehr.
- Keine zusätzliche Patch-/Observer-Schicht eingeführt.
- Syntaxcheck:
  - legacy-state-core: grün
  - v4140 attribute owner: grün
  - v459 character hub: grün
- Cache-Bust index/beta/server1: `8163attrowner1`.
- Commits:
  - Root-Fix: `62b765c1425b610a28a5b576f6429b9193af39f0`
  - index/beta/server1: `192d2259c5e5084b139ec73b23bb1e7091554b7b` / `b5e467424f17d6f480c52236d8d4d7b4811cef62` / `9b97b64d00a56b45dcca153c6d204d9de58e952e`


### 2026-10-06 – Attributwerte wechseln trotz stabilem Layout
- Nach dem Root-Fix bleibt das moderne Attributlayout stabil, Nutzer meldet aber weiterhin wechselnde Zahlen.
- Ursache eingegrenzt:
  - `v4140` las bei jedem Repaint die globale `totalAttr()` neu.
  - `totalAttr` wird im Altbestand noch von mehreren Kompatibilitäts-/Migrationsschichten gewrappt (u. a. v327/v328).
  - damit konnte derselbe moderne Renderer je nach später Boot-/Hydration-Reihenfolge unterschiedliche Funktionsidentitäten lesen.
- Fix direkt im kanonischen Attribute-Owner `v8009-s1-v4140-attribute-display-owner.js`:
  - beim Laden wird die aktuelle kanonische `totalAttr`-Funktion genau einmal als `canonicalTotalAttr` eingefroren;
  - der State bleibt live, nur die Funktionsquelle kann danach nicht mehr wechseln;
  - alle sichtbaren Attributwerte lesen ausschließlich aus dieser eingefrorenen Berechnung;
  - Diagnostik erweitert um Werte-Snapshot + `calculatorFrozen:true`.
- Syntaxcheck: grün.
- Cache-Bust index/beta/server1: `8164attrvalues1`.
- Commits:
  - v4140 Value-Source-Fix: `6c64e479cf044f0c29d63098ecbed694c50836c3`
  - index/beta/server1: `fd72afce48f32c4d5854349cfd3db305cd389901` / `a47c9a3ab5ba85edf299d425f31d86bc37d94017` / `2d9faeb036c9a587ca3006ae2bd3fd0e69192430`


### 2026-10-06 – Attributzahlen springen: serverautoritative Ausrüstung vor First Paint
- Nutzer meldete nach stabilem Layout weiterhin wechselnde Attributzahlen.
- Root Cause jetzt auf Datenfluss eingegrenzt:
  - `v459` öffnete den Attribute-Tab sofort und malte mit lokalem `s.equipment`.
  - `v7074-item-enforce-bridge` hydrierte 550–2700 ms später die serverautoritative Ausrüstung und ersetzte `s.equipment`.
  - `totalAttr()` berücksichtigt Ausrüstung; deshalb wechselten die Zahlen sichtbar von lokal/stale auf serverkanonisch.
- Direkt im kanonischen Character-Hub `v8009-s2-v459-character-hub.js` behoben:
  - vor dem ersten Attribute-Paint wird `v7074ItemAuthorityRefresh(false,false)` abgewartet, falls der Item-Authority-Stand nicht frisch ist;
  - währenddessen zeigt der Tab nur `Attribute werden synchronisiert …`, keine falschen Zwischenwerte;
  - danach genau ein finaler Paint über `v4140PaintAttributes` + `v537ApplyAttributes`;
  - redundanter unmittelbarer v537-Paint nach `activate()` entfernt;
  - parallele Refreshes werden über eine gemeinsame Promise zusammengeführt.
- Syntaxcheck v459: grün.
- Cache-Bust index/beta/server1: `8165attrhydrate1`.
- Commits:
  - v459 authoritative first-paint: `80d6181d861deb1cffd14ca522eddc4b22dc615a`
  - index/beta/server1: `ac36f67aa93fae13c58e4282969d6038160aaab8` / `1bb1cb3508e578bcfe5ef969a68cf44b59cee1cf` / `3763ac280562f75dbdeb7a299c00e7dbd45e8022`


### 2026-10-06 – Attribute-Zahlen springen: server-first Equipment Sync
- Nutzer meldete nach Layout-/Calculator-Fixes weiterhin wechselnde Attributzahlen.
- Root Cause im tatsächlichen Ablauf bestätigt:
  - Attribute werden aus Basiswerten + `s.equipment` berechnet.
  - `v459` malte den Attribute-Tab sofort mit lokalem/stalem Equipment.
  - `v7074-item-enforce-bridge` hydratisiert serverautoritative Ausrüstung erst später und ersetzt `s.equipment`.
  - dadurch waren zuerst lokale Zwischenwerte sichtbar und danach die echten Serverwerte.
- Fix direkt im Character-Hub `v8009-s2-v459-character-hub.js`:
  - Attribut-Tab zeigt bei fehlender/frischer Authority zunächst nur „Attribute werden synchronisiert …“;
  - für eingeloggte Accounts wird nicht mehr mit lokaler Ausrüstung vorgerendert;
  - `v7074ItemAuthorityRefresh(true,false)` erzwingt vor dem ersten Attribut-Paint einen frischen serverautoritativen Item-Sync;
  - danach genau ein finaler Paint über `v4140`.
- Kein zusätzlicher Polling-/Observer-Owner.
- Syntaxcheck v459 + v4140: grün.
- Cache-Bust index/beta/server1: `8165attrserverfirst1`.
- Commits:
  - Character server-first sync: `1189a7d84506aad69577f5353a2c6fef6be6d921`
  - index/beta/server1: `a31b1eff7b528103da5e3eb435f61466321876ea` / `8e1cb1d6e26970ad7fe34a23b541f21304c16d45` / `ede45dfcc1d2d7d6d7b5c0d4b6f41c4b7fdc07fc`


### 2026-10-06 – Attribute springen/flackern: globale Repaint-Wege entfernt
- Nutzer bestätigt nach Server-first-Fix: Attributzahlen springen weiterhin; zusätzlich einmal sichtbares Flackern.
- Neue Root-Cause-Analyse:
  - `v4140` hing weiterhin global an `persist()` und repaintete den kompletten Attributbereich bei beliebigen Persist-/Hydration-Vorgängen.
  - `v7074-item-enforce-bridge` rief nach Item-Hydration auf aktiver Charakterseite weiterhin das globale `render()` auf.
  - dadurch existierten trotz kanonischem Attribut-Owner weiterhin mehrere Repaint-Auslöser auf denselben sichtbaren DOM-Bereich.
- Direkt an den bestehenden Ownern behoben:
  - `v8009-s1-v4140-attribute-display-owner.js`:
    - globaler `persist()`-Wrapper vollständig retired;
    - Attribute repainten nur noch über Tab-Lifecycle, explizites Punkteverteilen und autoritativen Equipment-Sync;
    - Snapshot-Signatur eingebaut: bei identischen Hauptattribut-/Punkte-/Werten wird der DOM nicht erneut aufgebaut;
    - Crit-Anzeige wird aus derselben eingefrorenen Attributquelle berechnet.
  - `v8009-s4-v7074-item-enforce-bridge.js`:
    - globales `render()` nach Item-Hydration entfernt;
    - bei sichtbarem Attribute-Tab nur noch gezielter Aufruf von `v4140PaintAttributes()` + `v537ApplyAttributes()`.
- Keine neue Patch-/Observer-Schicht.
- Syntaxcheck:
  - v4140: grün
  - v7074: grün
- Cache-Bust index/beta/server1: `8166attrsingleowner1`.
- Commits:
  - v4140: `ce8fededccdc37634d9704f238f40ca9e7bef64b`
  - v7074: `eec658f4b16c9111358f616776fe988b92aed436`
  - index: `013ece57f9a0c383179a62c066cb360bebd6f48a`
  - beta: `53638d6206b0a605920e02cad37128920c61bc9d`
  - server1: `f1b9738b910344c7c5aca87f4d49ffa930a68e93`
- Nächster Test:
  - Charakter → Attribute öffnen;
  - 10–15 Sekunden beobachten;
  - einmal Inventar öffnen/zurück zu Attribute;
  - wenn Zahlen weiterhin springen, als Nächstes die tatsächlichen Werte-Snapshots von `v4140AttributeDiagnostics()` vor/nach dem Sprung mit Equipment-Revision aus `v7074ItemAuthorityDiagnostics()` vergleichen.


### 2026-10-06 – Attribute direkt korrekt: kein lokaler First Paint mehr
- Nutzer meldete nach V8.166 weiterhin folgenden Ablauf:
  - zuerst falsche/lokale Attributwerte sichtbar;
  - danach „Attribute werden synchronisiert …“;
  - danach andere/korrekte Werte.
- Ziel: Attribute dürfen ausschließlich mit finalen serverautoritativen Equipment-Werten sichtbar werden.
- Direkt im kanonischen Character-Hub `v8009-s2-v459-character-hub.js` geändert:
  - Attribute-Tab wird nicht mehr sichtbar aktiviert, solange Item-Authority nicht frisch ist;
  - der bisherige sichtbare Text „Attribute werden synchronisiert …“ entfällt;
  - während eines ausstehenden Syncs bleibt der aktuell sichtbare Tab unverändert;
  - erst nach erfolgreichem `v7074ItemAuthorityRefresh(true,false)` wird der Attribute-Tab aktiviert und genau einmal final über v4140/v537 gemalt;
  - bei bereits frischer Authority öffnet Attribute sofort.
- Zusätzlich Item-Authority vorgezogen:
  - `v8009-s4-v7074-item-enforce-bridge.js` startet den Boot-Sync bei `growlegends:account-ready` jetzt sofort statt mit 550-ms-Verzögerung;
  - v459 stößt auf account-ready zusätzlich einen stillen Prewarm an.
- Ergebnisziel:
  - keine lokalen/falschen Attributwerte;
  - kein sichtbarer Synchronisierungs-Zwischenzustand;
  - beim Öffnen direkt finale Serverwerte.
- Syntaxcheck:
  - v459: grün
  - v7074: grün
- Cache-Bust index/beta/server1: `8167attrdirect1`.
- Commits:
  - v459: `895c8f46b2f80e577d0b0dd639ef85a7278b5bca`
  - v7074: `94d2771654c4d79cda39a028807d4a612fd19812`
  - index: `05aa37c3de5b2b12eba492f3e92377a102553ad2`
  - beta: `29de96dd00cb5b4913237309443f3932a811e3aa`
  - server1: `bd7b70e8670aa73c0ddca756ddc7c873b5bc0ab6`


### 2026-10-06 – Attribute switchen weiter: Build-Authority als zweite Wertquelle identifiziert
- Nutzer korrigiert: Nicht nur Flackern, sondern die Attributzahlen wechseln weiterhin zwischen zwei Wertesätzen.
- Root Cause:
  - Attributanzeige wurde bisher nur auf frische Item-/Equipment-Authority gesperrt.
  - `v7033-build-authority-bridge` hydratisiert zusätzlich serverautoritative Basisattribute `s.attrs` und `s.points` und konnte diese nach dem ersten sichtbaren Paint ersetzen.
  - `totalAttr()` = Basisattribute + Equipment + Set-Boni; deshalb reicht Item-Authority allein nicht.
- Fix im kanonischen Character-Hub `v8009-s2-v459-character-hub.js`:
  - Freigabe für Attribute verlangt jetzt gleichzeitig frische Build-Authority und frische Item-Authority.
  - Vor dem ersten sichtbaren Attribut-Paint werden parallel erzwungen:
    - `v7033BuildAuthorityRefresh(true)`
    - `v7074ItemAuthorityRefresh(true,false)`
  - erst wenn beide Quellen frisch sind, wird der Attribut-Tab sichtbar aktiviert.
  - account-ready prewarmt ebenfalls beide Quellen.
- Zusätzliche Repaint-Bereinigung:
  - `v7033-build-authority-bridge.js`:
    - Build-Hydration führt keinen globalen `render()`-Pfad mehr aus;
    - nur bei tatsächlich geändertem Build-State gezielter `hydrate`-Repaint über v4140/Skilltree/Punkte/Kampfkraft;
    - account-ready startet sofort statt 150 ms verzögert;
    - Charakter-Navigation erzwingt keinen zweiten Force-Refresh mehr, sondern nutzt den vorhandenen frischen Gate-State.
  - `v7077-progress-enforce-hydration.js`:
    - globales Character-`render()` nach Progress-Hydration entfernt;
    - nur Kampfkraft + Character-Summary werden gezielt aktualisiert.
- Keine neue Patch-/Observer-Schicht.
- Syntaxcheck v459/v7033/v7077: grün.
- Cache-Bust index/beta/server1: `8168attrdual1`.
- Commits:
  - v459: `8903aef8c43c5e748c0c24823132975c6d972ba2`
  - v7033: `4d8dfcbb725e7ea117bc183ae04c10a1ae054c29`
  - v7077: `72f669b9c7b5992869d496ba20f6900e8acc4192`
  - index: `ff9a4245f1588a038e3d2ca1f605916ac5290733`
  - beta: `ce2f2825fe508f4f02634b4928e70e876469ea4b`
  - server1: `7c261fb23b933b80fb52d7c9803ce8b43393675a`
- Erwartetes Verhalten:
  - kein lokaler Attributsatz sichtbar;
  - kein späteres Umschalten durch Build-Hydration;
  - direkt finale Werte aus Server-Build + Server-Equipment.


### 2026-10-06 – Attribute schwanken weiter: Legacy-Item-Stat-Rewriter als Root Cause entfernt
- Nutzer meldete trotz Build+Item-Authority-Gating weiterhin schwankende Attributzahlen.
- Tiefer Audit der tatsächlichen Rechenkette ergab:
  - `v4140` wurde bereits deutlich vor mehreren späteren Item-/Stat-Schichten geladen.
  - Entscheidend: `v447-unified-item-balance.js` normalisierte ausgerüstete Items nicht nur bei Render/Persist, sondern zusätzlich per festen Timern nach **700 ms / 2600 ms / 6000 ms**.
  - Diese Altlogik schrieb direkt auf `it.bonus` in `s.equipment`.
  - `v4154-class-balance-item-variety.js` rief dieselbe Normalisierung nochmals bei `account-ready`/pageshow auf.
  - `v425-item-stats-single-authority.js` und `v429-immutable-item-stats.js` besaßen ebenfalls clientseitige Stat-Mutationspfade für Equipment.
- Das erklärt den beobachteten Verlauf:
  - serverautoritative Items werden geladen;
  - alte Client-Normalisierer rechnen die Item-Boni später erneut um;
  - spätere Server-Hydration setzt sie wieder zurück;
  - `totalAttr()` schwankt dadurch sichtbar.
- Architekturfix:
  - Für echte eingeloggte Accounts sind alte Client-Item-Stat-Normalisierer jetzt **read-only/no-op**.
  - Der Server ist für Item-Kampfwerte die einzige Source of Truth.
- Direkt geändert:
  - `v8009-s1-v447-unified-item-balance.js`
    - keine Item-Bonus-Mutation mehr bei authentifiziertem Account;
    - `all()` ist dort no-op;
    - 700/2600/6000-ms Rewrite-Train vollständig retired.
  - `v8009-s6-v425-item-stats-single-authority.js`
    - `canonical()`/`all()` mutieren bei eingeloggtem Account keine Itemwerte mehr.
  - `v8009-s7-v429-immutable-item-stats.js`
    - `lock()`, `restore()`, `lockAndRestoreAll()` und lokales Save der Statlocks sind bei eingeloggtem Account no-op.
  - `v8009-s4-v4154-class-balance-item-variety.js`
    - ruft die alte v447-Normalisierung für eingeloggte Accounts nicht mehr auf.
- Anonyme/offline Legacy-Pfade bleiben erhalten.
- Syntaxcheck aller vier Dateien: grün.
- Cache-Bust index/beta/server1: `8169serveritemstats1`.
- Commits:
  - v447: `bcf1340705ea93740640c110ce719b28d214e08e`
  - v425: `e839347c0211373d2e31b767c097bb72b296b3fb`
  - v429: `b1d087f88505d90384b1adc4a4f34a9e97eae9e6`
  - v4154: `c394515caf51c28a16a82d1085fcd0f596f16d16`
  - index: `5db8d163e1a9ac5a9163cfcda76e4fa3959ec9f9`
  - beta: `6ed7dd0342bb0e7d195884e39b2c217d7b72a150`
  - server1: `f8fbaaae30b3c5b3a6ab88f2461b5398852edae1`
- Erwartetes Verhalten:
  - serverseitig geladene Item-Boni bleiben unverändert;
  - `totalAttr()` bekommt nach dem ersten finalen Sync keine 0.7/2.6/6.0-s Client-Umschreibungen mehr;
  - Attributzahlen dürfen damit nicht mehr zwischen lokal normalisierten und serverautoritativen Werten wechseln.


### 2026-10-06 – Letzter einmaliger Attribut-Umsprung: Auth-Startfenster geschlossen
- Nutzer meldete nach V8.169 nur noch genau einen Umsprung der Attributzahlen.
- Root Cause:
  - `v459` behandelte den kurzen Boot-Zustand „`v073User` noch nicht vorhanden“ wie einen echten anonymen Nutzer.
  - Wenn der zuletzt gespeicherte Character-Tab „Attribute“ war, konnte dadurch einmal der lokale/stale Attributsatz gerendert werden, bevor `growlegends:account-ready` kam.
  - Danach wurden Build- und Item-Authority korrekt geladen und die Zahlen wechselten genau einmal auf den Serverstand.
- Fix in `v8009-s2-v459-character-hub.js`:
  - solange `window.__V200_AUTH_READY__ !== true`, dürfen Attribute überhaupt nicht freigegeben werden;
  - „noch kein User während Boot“ wird nicht mehr als Anonymous interpretiert;
  - wenn der Character-Hub während Auth-Resolve mit gespeichertem Attribute-Tab öffnet, bleibt/öffnet vorübergehend Inventory statt lokale Attribute zu rendern;
  - nach `account-ready` wird der gespeicherte Attribute-Tab erneut versucht und erst nach Build+Item-Authority freigegeben.
- Kein Sync-Text, kein lokaler First Paint, keine neue Patch-Schicht.
- Syntaxcheck v459: grün.
- Cache-Bust index/beta/server1: `8170attrauthgate1`.
- Commits:
  - v459: `cf161859c88261b92a0f48e420270cc6aed4608b`
  - index: `531c382d311ba8572024fba034196558fbc0102d`
  - beta: `a53a327a4f037470554c7d08484bc84f20b85137`
  - server1: `a0e4d27ce475ea2fe4a5ee09e5e037da1717f95d`
- Erwartung:
  - kein einziger sichtbarer lokaler Attributsatz mehr während Login/Boot;
  - erster sichtbarer Attribut-Paint = finaler Server-Build + finale Server-Items.


### 2026-10-06 – Server 1 wieder geschlossen, neuer Countdown bis 07.10.2026 16:00
- Nutzerwunsch: Server 1 jetzt wieder schließen und Countdown auf morgen 16:00 Uhr setzen.
- Kanonischer Gate-Zeitpunkt geändert:
  - vorher: 2026-10-06 20:00 Europe/Berlin = 18:00 UTC
  - neu: **2026-10-07 16:00 Europe/Berlin = 14:00 UTC**
  - `V343_SERVER1_OPENS_AT = Date.parse('2026-10-07T14:00:00Z')`
- Wirkung:
  - Server 1 ist bis zum neuen Zeitpunkt wieder `preview/geschlossen`.
  - öffentliche Auswahl zeigt Countdown bis morgen 16:00.
  - nicht freigeschaltete Accounts werden bis dahin blockiert.
  - freigeschaltete Test-/Vorabkonten behalten den bestehenden Vorabzugang.
- Sichtbare Fallback-Texte auf „Morgen · 16:00 Uhr“ / „öffnet morgen um 16:00 Uhr“ geändert.
- I18N `v8143-i18n-core.js` für DE/EN/ES/FR/PL/TR aktualisiert; nur Server-1-Launch-Texte geändert, andere 20:00-Zeiten (z. B. Gildenboss) unverändert.
- Syntaxcheck Gate + I18N: grün.
- Cache-Bust index/beta/server1: `8171server1oct7`.
- Commits:
  - Gate: `18b2cc80b9a70155938cb1ff2fb2ce69b7576120`
  - I18N: `d3975802b15314bd5efadd8e228cafc992c9ddaa`
  - index: `e3aaca4120edc691e031f88bc8ce20674e7bceb4`
  - beta: `07d77fbd2bdef1410e6d437f8e59615669ac3fc1`
  - server1: `cc990d21031cc17a0f79996c4a011f7919b9fb6d`


### 2026-10-06 – Letzter einmaliger Attribut-Sprung: v327-DOM-Writer retired
- Nutzer meldete weiterhin genau einen Sprung der Attributzahlen.
- Tiefer DOM-Audit ergab:
  - `v8009-s3-v327-worldboss-confirm-attributes.js` war trotz moderner v4140-Ownership weiterhin ein direkter Writer auf `#attrs`.
  - `v327CleanAttributeUi()` lief bei `growlegends:account-ready` und bei Character-Navigation.
  - Es suchte pro Attributzeile das erste `<b>` und schrieb dort erneut `totalAttr(key)` hinein.
  - Zusätzlich ersetzte v327 noch `v125RenderAttrs()` und wrapte global `totalAttr()`.
- Dadurch konnten die modernen v4140-Werte einmal nachträglich durch die alte v327-Rechenkette überschrieben werden.
- Direkter Owner-Fix:
  - v327 schreibt keine Attributzahlen mehr ins DOM.
  - v327 darf nur noch alte Grow-Skill-Fragmente entfernen.
  - alter v125-Attributrenderer-Override aus v327 retired.
  - globaler `totalAttr`-Wrapper aus v327 retired.
  - Worldboss-Logik/Bestätigungsdialoge unverändert.
- Syntaxcheck v327: grün.
- Cache-Bust explizit auf Script-Tag gesetzt: `8172attrsingleowner2` in index/beta/server1.
- Commits:
  - v327: `31b2daa301c4dca142a61cc974c5b581907b6218`
  - index: `d1179805e6d32088b4599a6010cb8be8d2c746a4`
  - beta: `2cfedf35f70e4e8075b56af7b67a0d81daffc498`
  - server1: `1c99ed2251b831314756db68118dab82e415737b`
- Erwartung:
  - `#attrs` hat jetzt nur noch v4140 als Zahlen-Owner.
  - kein einmaliger Überschreib-Paint mehr bei account-ready/Character-Navigation.


### 2026-10-06 – Einmaliger Attribut-Sprung: Cross-Account Authority Race behoben
- Nutzer meldete weiterhin genau einen sichtbaren Umsprung der Attributzahlen.
- Vollständigerer Authority-Audit zeigte eine echte Race-Condition beim Account-/Session-Wechsel:
  - `v7074-item-enforce-bridge` hielt `refreshP` global fest.
  - Wenn während einer laufenden Item-Authority-RPC die User-ID wechselte, konnte der neue Account dieselbe alte Promise übernehmen.
  - Die alte Serverantwort konnte danach noch `s.equipment` anwenden, obwohl bereits ein anderer Account aktiv war.
  - `v7033-build-authority-bridge` hatte analog eine nicht UID-gebundene laufende Gate-RPC, deren alte Antwort nach Accountwechsel noch Build-State anwenden konnte.
  - `v459.authorityFresh()` prüfte bisher nur ready + Alter, nicht ob Item-/Build-Authority tatsächlich zur aktuellen UID gehörten.
- Direkter Root-Fix:
  - `v7074` bindet jede Refresh-Promise an `requestUid`; bei UID-Wechsel wird ein alter Inflight-Refresh nicht wiederverwendet; Antworten werden verworfen, wenn die aktuelle UID nicht mehr der Request-UID entspricht.
  - `v7033` bindet jede Gate-Promise an `requestUid`; alte Build-Antworten werden nach Accountwechsel verworfen.
  - `v459.authorityFresh()` akzeptiert Build + Item nur noch, wenn beide Diagnostics-UIDs exakt der aktuellen `v073User.id` entsprechen.
- Dadurch kann kein alter Account-Snapshot mehr einmal sichtbar werden und anschließend vom neuen Account überschrieben werden.
- Syntaxcheck v7074/v7033/v459: grün.
- Cache-Bust index/beta/server1: `8173uidrace1`.
- Commits:
  - v7074: `2ecf4933a0f416b44ae4e644c7ee654060fccc5b`
  - v7033: `3b7499e6352e53e8bf765643d14a70a1e7206962`
  - v459: `207990ea30dade16253433ad8845f61109b932d1`
  - index: `21005fa8bc4ce11d615a8289557d03d9dde32564`
  - beta: `fff7679176c25692fddc0c8a3a54a28cd37498f9`
  - server1: `8e44f694ab8b9406d639cad8a0dae7506c958da0`


### 2026-10-06 – Videoanalyse: nur Hauptattribut springt 494 → 555; periodischer Item-Refresh als sichtbarer Trigger entfernt
- Neues Video `1000099808.mp4` frameweise geprüft:
  - Stärke bleibt zunächst stabil bei **494**.
  - Nach ~50 s springt Stärke einmal auf **555**.
  - Geschick **5**, Intelligenz **5**, Ausdauer **192**, Glück **87** bleiben unverändert.
  - Damit ist der Rest der Attribut-State-Kette stabil; betroffen ist ausschließlich das Hauptattribut.
- Serverzustand des betroffenen Beta-Accounts geprüft:
  - mehrere ausgerüstete Mystik-Items besitzen `mainPct: +5 % Hauptattribut`;
  - zusätzlich existieren `primaryPct`-Verzauberungen (+3 % / +7 %).
  - Der Unterschied ist deshalb eindeutig im Bereich Hauptattribut-Prozentlogik einzuordnen, nicht als allgemeiner Build-/Equipment-Wechsel.
- Sichtbarer Trigger im Client:
  - `v7074-item-enforce-bridge` führte alle 60 Sekunden `refresh(true,true)` aus.
  - Dadurch wurde bei jedem Hintergrundabgleich der Character-/Attribute-Owner erneut gepaintet, selbst wenn das Equipment identisch war.
- Direkter Authority-Fix in `v8009-s4-v7074-item-enforce-bridge.js`:
  - Equipment-Fingerprint eingeführt (Slot + Item-ID + Bonus + Gem + Enchant + Mystic-Special + Set-ID).
  - `applyServer()` vergleicht Equipment vor/nach Serverantwort.
  - Attribute werden nur noch neu gepaintet, wenn sich der Equipment-Fingerprint wirklich geändert hat.
  - 60-s-Hintergrundrefresh jetzt `refresh(true,false)` statt sichtbarem Paint.
  - Foreground-Refresh nach >45 s ebenfalls silent.
  - echte Itemaktionen bleiben weiterhin sofort sichtbar.
- Kein Maskieren eines Werts und kein zusätzlicher Observer/Renderlayer.
- Syntaxcheck v7074: grün.
- Cache-Bust index/beta/server1: `8174attrtimer1`.
- Commits:
  - v7074: `d9c2b5724afb08841b81e04619ad06d9ad890926`
  - index: `c17c935275fe494d6cb0dffa390039182cd33010`
  - beta: `e130ad186491eafabe9dcfded6088af9ce4d0808`
  - server1: `f1218cf5fa7d59a9e0677d20221d7877bb3597ec`
- Nächster Prüfpunkt falls weiterhin ein Hauptattribut-Sprung sichtbar ist:
  - zwei konkurrierende Hauptattribut-Semantiken zusammenführen: rohes `totalAttr(primary)` vs effektive `primaryPct/mainPct`-Berechnung.


### 2026-10-06 – Item-Quelle gefixt: alte Startup-Normalisierer dürfen Server-Stats nicht mehr verändern
- Nutzerhinweis: Nicht nur Attribute, sondern vermutlich auch Item-Stats selbst haben sichtbar geschwankt.
- Audit bestätigte zwei alte Bestands-Mutatoren:
  - `v331-item-level-scaling.js` hat beim Script-Start bestehendes Inventar + Equipment einmal komplett neu skaliert und danach `render()` ausgeführt.
  - `v455-item-loot-balance-contract.js` hat bestehende Items bei Start, DOMContentLoaded, pageshow, account-ready und nach Cloud-Save erneut normalisiert.
- Das konnte für eingeloggte Accounts folgenden Ablauf erzeugen:
  1. lokaler/cache-basierter Itemzustand wird clientseitig umgerechnet,
  2. Attribute werden aus diesen lokalen Itemwerten berechnet,
  3. spätere Item-Authority setzt die serverautoritativen Boni wieder ein,
  4. Stärke/Ausdauer springen gemeinsam.
- Direkter Fix:
  - `v331`: Boot-Migration bestehender Inventory-/Equipment-Items vollständig retired; kein Startup-`render()` und kein Startup-Save mehr.
  - `v331` bleibt nur Generator-Kurve für neu erzeugte Legacy-/Offline-Items.
  - `v455`: Bestandsnormalisierung fail-closed bis Auth geklärt ist.
  - `v455`: bei echtem eingeloggtem Account keine Normalisierung bestehender Items mehr.
  - `v455`: Start-/DOMContentLoaded-/pageshow-Normalisierung entfernt; account-ready normalisiert nur noch Legacy/Anonymous-State.
- Damit sind bestehende Item-Kampfwerte bei eingeloggten Accounts ausschließlich serverautoritative Source of Truth.
- Syntaxcheck v331/v455: grün.
- Cache-Bust index/beta/server1: `8175itemsource1`.
- Commits:
  - v331: `e0309a6cdeafe88015745d0e89d4ddf54d9f19a4`
  - v455: `ed87a063f3ee76bcbffa2fc851951bb5caa335fb`
  - index: `c921a3365cb4b17bf6bad5e794cce7f06048fc9e`
  - beta: `892159837444ac1d299e8cc35350d03caf7ca863`
  - server1: `0fed185a96c72af3dfc6a223e4af9e2b5a2aae27`
- Erwartung:
  - Item-Bonuswerte selbst bleiben nach dem Laden stabil.
  - dadurch dürfen Stärke/Ausdauer nicht mehr zwischen lokal umgerechneten und serverautoritativen Summen springen.


### 2026-10-06 – Item-Drift weiter sichtbar: finaler v7132-Delayed-Rehydrate entfernt
- Nutzer meldete trotz v331/v455-Bereinigung weiterhin einen einmaligen Wertewechsel.
- Serververgleich direkt geprüft:
  - `public.player_saves.save_data.equipment` und `public.player_item_state.equipment` sind für den betroffenen Account slotweise identisch (Item-ID, bonus, Gem, Enchant, Mystic-Special).
  - Damit ist ausgeschlossen, dass zwei verschiedene Serverstände gegeneinander wechseln.
- Bestehende QA-Historie zeigt `itemLocalMatch=false` bei gleichzeitig `itemServerOnlyOwner=true` und vollständig enforce-ten Authority-Domains:
  - der Drift entsteht lokal im Client nach/zwischen Hydrationen.
- In `v8009-s3-v7132-item-authority-lockdown.js` bestand noch ein sichtbarer Korrekturpfad:
  - `growlegends:account-ready` plante `ensureAuthority({paint:true})` erst via Startup-Quiet +350 ms bzw. Fallback +500 ms.
  - Dadurch konnte erst lokaler/zwischenzeitlicher Item-State sichtbar werden und danach der finale Serverzustand erneut Equipment/Character repainten.
- Fix:
  - finaler Item-Authority-Hydrate startet bei `account-ready` sofort und **silent** (`paint:false`).
  - keine verzögerte 350/500-ms sichtbare Korrektur mehr.
  - Character-Navigation erzwingt keinen zweiten Hydrate mehr, wenn v7074 bereits ready ist.
  - Character/Inventory-Owner entscheiden selbst über den ersten sichtbaren Paint.
- Syntaxcheck v7132: grün.
- Cache-Bust index/beta/server1: `8176itembootstrap1`.
- Commits:
  - v7132: `e2fc56a9dde13dab6317114b5a51a3b12b21a681`
  - index: `cae8b4a01f49f0f9aca8498257d92d5ef3a0891f`
  - beta: `4785d29691af8041f8a2bdaf149224721f5a8161`
  - server1: `9c035e5be3271b2a0bd88c7c51ffb6d230df7a5c`
- Relevanter Befund:
  - Falls danach weiterhin ein Wechsel sichtbar ist, muss der lokale Item-Drift selbst detailliert diffbar gemacht werden (welcher Slot/welches Feld), da beide Serverquellen nachweislich identisch sind.


### 2026-10-06 – Persist-Safety-Net aus Character/Item-Pfad entfernt + QA auf exakten Stat-Diff erweitert
- Nutzer meldete weiterhin sichtbaren Wechsel.
- Belastbarer Befund aus vorhandener QA-Historie:
  - `itemLocalMatch=false`
  - gleichzeitig `itemServerOnlyOwner=true`
  - alle Authority-Domains enforce
  - Serverquellen `player_saves.equipment` und `player_item_state.equipment` sind für den Account identisch.
- Neue gefundene Lücke:
  - `v7133-global-gameplay-authority-lockdown` wrappt global `persist()`.
  - Jeder persist-Aufruf konnte nach 80 ms `hydrateActive()` starten.
  - Auf Character wurden dabei Build + Items erneut serverseitig geladen; v7074 wurde dabei mit Default-Paint aufgerufen.
  - Shop/Forge analog.
  - Damit existierte trotz direkter Item-/Build-Owner weiterhin ein zweiter generischer Rehydrate-Lifecycle.
- Fix:
  - Character/Shop/Forge/HarzForge sind aus dem generischen persist-getriebenen Rehydrate-Safety-Net entfernt.
  - `hydrateActive()` führt für diese Screens keinen zweiten Korrektur-Hydrate mehr aus.
  - Direkte serverautoritative Action-Owner bleiben unverändert zuständig.
- QA-Erweiterung in `v7084-background-system-test.js`:
  - `itemCombatDiff` vergleicht pro Slot:
    - Item-ID
    - bonus.staerke/geschick/intelligenz/ausdauer/glueck
    - Gem stat/value
    - Enchant effect/value
  - neue Checks:
    - `itemCombatDiff`
    - `itemCombatStatsMatch`
  - Damit ist bei erneutem Drift exakt sichtbar, welcher Slot und welches Feld lokal vom Serverwert abweicht.
- Syntaxcheck v7133/v7084: grün.
- Cache-Bust index/beta/server1: `8177itemdrift1`.
- Commits:
  - v7133: `301dfb8f0519d9d3c7d989fe5dfb508e042a15c7`
  - v7084: `3577af414a46b076ce877e06de9727c8239702eb`
  - index: `c030d8fa7c0984d9fd4dc60e57219e9c353eb8b8`
  - beta: `7c064b69a03bbce167d24c774e6d94d401b74a06`
  - server1: `cf0d02f15bc351695f76dec20f1c041d4bdb670f`


### 2026-10-06 – Attribut-Sprung jetzt direkt instrumentiert (kein weiterer Blindfix)
- Nutzer meldete nach den letzten Bereinigungen nur noch einen kleinen einmaligen Sprung im Hauptattribut.
- Der aktuelle kanonische Attribut-Owner `v4140` wurde deshalb direkt mit Source-Breakdown instrumentiert.
- Bei jeder echten Wertänderung nach dem ersten Paint wird automatisch ein Runtime-Incident `attribute_value_changed` geschrieben.
- Pro geändertem Attribut werden Vorher/Nachher protokolliert:
  - angezeigter Wert
  - Basiswert `s.attrs`
  - Klassenbonus
  - Equipment-Summe
  - einzelne Equipment-Beiträge inkl. Slot/Item-ID/Set-ID
  - `setBonusValue`
  - Set-Anzahl
  - aktuelle UID/Klasse
- Dadurch ist beim nächsten sichtbaren Sprung exakt nachvollziehbar, welcher Summand sich geändert hat.
- Keine Änderung an Gameplay-Werten; reine Diagnose im kanonischen Owner.
- Syntaxcheck v4140: grün.
- Cache-Bust index/beta/server1: `8178attrtrace1`.
- Commits:
  - v4140: `8574c81746b112d476d28b533ed88277194edb1e`
  - index: `186f3adc4bbee176004baf8438d6b13133bfda94`
  - beta: `1ac56b50aa29c8dd6adfa7eff7526490854985cf`
  - server1: `5a5dca83f1b183f0090af217ef820b1fde6fd1b7`


### 2026-10-06 – Root-Cause bestätigt und gefixt: Mystic-Boot-Migration veränderte bestehende Server-Items
- Instrumentierter `v4140`-Trace hat den Wertewechsel exakt belegt:
  - Basisattribute und Klassenbonus blieben unverändert.
  - Die Bonuswerte bereits ausgerüsteter Items wechselten während des Boots.
  - Beispiele aus dem Trace:
    - Waffe Stärke 92 → 47
    - Amulett Stärke 70 → 51
    - gleichzeitig erschienen auf diesen Items Ausdauer-Werte 27 / 30
- Ursache:
  - `v325-mythic-item-balance.js` reparierte beim Script-Start bereits vorhandene Inventory- und Equipment-Mystic-Items lokal via `v325FixMystic()`.
  - `v330-mythic-true-upgrade.js` reparierte beim Start ebenfalls bereits vorhandenes Mystic-Inventar.
  - Danach setzte Item-Authority die echten Serverwerte wieder ein → sichtbarer Attribut-/Item-Stat-Sprung.
- Fix V8.179:
  - v325 Boot-Migration bestehender Inventory-/Equipment-Items vollständig retired.
  - v325 bleibt nur noch für neu generierte Mystic-Drops aktiv.
  - v330 Boot-Reparatur bestehenden Mystic-Inventars entfernt.
  - v330 bleibt nur noch für neu erzeugte Drops/Vergleichslogik aktiv.
  - unnötige Startup-`render()`-Aufrufe aus beiden Pfaden entfernt.
- Syntaxcheck v325/v330: grün.
- Cache-Bust index/beta/server1: `8179mysticboot1`.
- Commits:
  - v325: `d6926f1169208d47af850566b75ccee8686d8588`
  - v330: `22baa1e3ae0fae5e35d36a8207dda856f8791975`
  - index: `7a4967828866ca84c3a13b92c7b4ebe2a01e9ccd`
  - beta: `2ca4d03af42e968a0394cf9c7e62afa1a9e068ec`
  - server1: `303d19c57a6fbb18d9fb92c61d92086acf24d77e`
- Erwartung:
  - Bereits gespeicherte serverautoritative Mystic-Items behalten vom ersten sichtbaren Frame an exakt ihre Serverwerte.
  - Kein lokaler Boot-Rebalance mehr, der Stärke/Ausdauer/Glück einmal umverteilt.


### 2026-10-06 – Belegter Root Cause: Pre-Auth Item-Normalisierer erzeugten falsche erste Itemwerte
- Neuer `attribute_value_changed` Trace nach Test ausgewertet.
- Beweis:
  - Basisattribute und Klassenbonus blieben unverändert.
  - Mehrere Equipment-Boni wechselten gleichzeitig.
  - Beispiel:
    - Waffe Stärke lokal vor Server: 92 → Server 47
    - Amulett Stärke lokal vor Server: 70 → Server 51
    - Ausdauer derselben Items wurde beim Serverzustand 27/30 statt lokaler anderer Verteilung
  - Damit ist die Ursache eindeutig ein clientseitiger Item-Stat-Writer vor finaler Authority.
- `v325` und `v330` waren bereits als Boot-Mutatoren bereinigt, aber der Drift blieb.
- Weitere konkrete Root-Cause gefunden:
  - `v422-item-stat-consistency.js` canonicalisierte beim Script-Start bestehendes Inventory + Equipment via `v422All()`, speicherte und renderte.
  - `v447-unified-item-balance.js` rief beim Script-Start `all()` auf, außerdem bei DOMContentLoaded/pageshow. Sein Auth-Guard konnte zu diesem Zeitpunkt noch nicht greifen, weil Auth noch nicht resolved war.
  - `v6337-item-class-stat-rule.js` rief ebenfalls sofort `v447NormalizeAllItems()` auf.
- Fix V8.180:
  - v422: Pre-Auth fail-closed; keine Boot-Canonicalization, kein Boot-Save/Render.
  - v447: keine Boot/DOMContentLoaded/pageshow-Normalisierung bestehender Items mehr; nur Generator-Wrappers bleiben automatisch aktiv. Anonymous/offline kann erst nach account-ready normalisieren.
  - v6337: keine sofortige Normalisierung mehr; Anonymous/offline erst nach account-ready.
- Syntaxchecks v422/v447/v6337: grün.
- Cache-Bust index/beta/server1: `8180preauthitems1`.
- Commits:
  - v422: `621c65064448967087f2b019f174c749bf60b46e`
  - v447: `48d062bdacdba562cced9dba293f17bfcc667ec8`
  - v6337: `3a7958fcd81a2987c1ef047dfb63c1e35a5144d4`
  - index: `cdffb69064e221467c29498e415d22af2e230b90`
  - beta: `f5362343a19fdf5fe2477615c0561ab1ca31d901`
  - server1: `d39ec8874091fc5af56652a59a73d5f1ea95bd2b`
- Erwartung:
  - erster sichtbarer Item-/Attribute-State kommt nicht mehr aus lokal vor Auth umgerechneten Bonuswerten.
  - kein späterer Sprung auf den Serverzustand mehr.


### 2026-10-07 – Attribute springen weiter: verbleibende Pre-Auth Item-Normalisierer v423/v425/v429 fail-closed gemacht
- Nutzer bestätigt nach V8.180: Attributwerte springen weiterhin sichtbar zwischen zwei Wertesätzen.
- Erneuter Audit der aktiven Item-Kette ergab noch drei Legacy-Owner, die bestehende Itemwerte vor vollständig aufgelöster Auth anfassen konnten:
  - `v8009-s5-v423-item-progression-fix.js`
  - `v8009-s6-v425-item-stats-single-authority.js`
  - `v8009-s7-v429-immutable-item-stats.js`
- Root Cause:
  - der bisherige Schutz prüfte im Wesentlichen nur, ob bereits `v073User.id` vorhanden ist;
  - während des frühen Boots ist Auth aber noch nicht final aufgelöst;
  - dadurch wurde der Zustand kurz als lokaler/Legacy-State behandelt und vorhandene Inventory-/Equipment-Stats konnten normalisiert/kanonisiert/gelockt werden;
  - danach setzt `v7074` den echten serverautoritativen Equipment-State zurück;
  - sichtbares Resultat: Attribute/Itemwerte springen einmal auf einen anderen Wertesatz und später wieder zurück.
- Direkter Fix ohne neue Patch-Schicht:
  - alle drei Legacy-Owner besitzen jetzt `legacyLocalItemStateWritable()`;
  - bestehende Itemwerte dürfen nur noch verändert werden, wenn `window.__V200_AUTH_READY__ === true` **und** kein authentifizierter Server-Account aktiv ist;
  - unresolved/pre-auth ist damit ausdrücklich fail-closed;
  - bestehende eingeloggte Inventory-/Equipment-Items werden von diesen Legacy-Dateien nie mehr rebalanced;
  - Boot-Normalisierung + Boot-Render in v423/v425/v429 für unresolved/serverautoritative Zustände entfernt;
  - Generator-/Legacy-Offline-Logik bleibt für echte lokale Zustände erhalten.
- Cache-Bust auf index/beta/server1:
  - `8181itempreauth2`
- Beta Cache-Key wurde nach Prüfung auf genau einen Query-Parameter normalisiert.
- Nächster manueller Test:
  1. App vollständig schließen;
  2. neu starten und einloggen;
  3. Charakter → Attribute öffnen;
  4. mindestens 60–90 Sekunden beobachten;
  5. zusätzlich Inventar öffnen/zurück zu Attribute;
  6. falls weiter ein Sprung sichtbar ist, den vorhandenen `attribute_value_changed`-Trace + `itemCombatDiff` als nächste harte Quelle auswerten.


### 2026-10-07 – Attributsprung 428 → 489 endgültig zugeordnet: 61 Erfolgsboni wurden zu spät geladen
- Nutzer meldete nach V8.181 weiterhin einen einmaligen Sprung des Hauptattributs von **428 auf 489**.
- Neuer `attribute_value_changed`-Trace ausgewertet:
  - Basis-Stärke bleibt **109**;
  - Klassenbonus bleibt **4**;
  - Equipment-Summe bleibt exakt **315**;
  - dieselben sechs Equipment-Items und dieselben Bonuswerte vor/nach dem Sprung;
  - `109 + 4 + 315 = 428`.
- Differenz zum finalen Wert: **489 - 428 = 61**.
- Erfolgslogik verifiziert:
  - `v8009-s2-v106-illegal-book.js` erweitert `totalAttr(primary)` um `v106CompletedCount()`;
  - jeder abgeschlossene Erfolg gibt dauerhaft **+1 Hauptattribut**.
- Serverzustand des betroffenen Beta-Accounts verifiziert:
  - `public.player_achievement_state.done` enthält exakt **61 abgeschlossene Erfolge**;
  - damit ist der fehlende Summand mathematisch und serverseitig eindeutig bestätigt.
- Root Cause:
  - `v459-character-hub` sperrte den ersten sichtbaren Attribute-Paint bisher nur auf frische Build- und Item-Authority;
  - Achievement-Authority `v7080` hydriert bewusst on-demand;
  - deshalb konnte zuerst der nackte Wert **428** sichtbar werden;
  - nach Achievement-Hydration wurde derselbe unveränderte Build mit +61 Erfolgsbonus zu **489**.
- Direkter Fix V8.182 im kanonischen Character-Hub:
  - Datei: `js/features/character/beta/v8009-s2-v459-character-hub.js`;
  - `authorityFresh()` verlangt jetzt bei aktivem Achievement-Enforce zusätzlich frische `v7080AchievementDiagnostics()` für dieselbe UID;
  - `ensureAttributesAuthoritative()` lädt jetzt vor dem ersten sichtbaren Attribute-Paint gemeinsam:
    1. Build-Authority,
    2. Item-Authority,
    3. Achievement-Authority;
  - bei `account-ready` werden dieselben drei Quellen vorgewärmt;
  - Attribute werden erst danach sichtbar aktiviert.
- Erwartetes Verhalten:
  - kein sichtbares **428 → 489** mehr;
  - direkt **489** beim ersten sichtbaren Attribute-Paint.
- Commit Character-Hub: `111de12959841cc074b13e25d4de6d03f18c1d5c`.
- Cache-Bust index/beta/server1: `8182achievementgate1`.


### 2026-10-07 – V8.183: 428 stabil, aber Erfolgsbonus fehlte wegen zu früher Capability-Abfrage
- Nach V8.182 meldete Nutzer: kein sichtbares Springen mehr, Hauptattribut bleibt aber bei **428** statt korrekt **489**.
- Vorher bereits serverseitig bestätigt:
  - 61 abgeschlossene Erfolge;
  - jeder Erfolg = +1 Hauptattribut;
  - korrekter Endwert daher **428 + 61 = 489**.
- Root Cause V8.183:
  - `v459-character-hub` fragte `v7081UseAuthority('achievements')` ab, bevor die Account-Capabilities garantiert fertig geladen waren;
  - `v7081UseAuthority()` liefert bei noch unbekannter Capability absichtlich `false`;
  - dadurch wurde Achievement-Authority beim ersten finalen Paint fälschlich als „nicht erforderlich“ behandelt;
  - Ergebnis: kein Springen mehr, aber stabiler nackter Wert **428** ohne +61 Erfolgsbonus.
- Direkter Fix im kanonischen `v8009-s2-v459-character-hub.js`:
  - unbekannte/ungeklärte Capabilities gelten für den Attribute-First-Paint jetzt als **nicht frisch**;
  - `ensureAttributesAuthoritative()` lädt zuerst explizit `v7081CapabilitiesRefresh(true)` für die aktuelle UID;
  - erst danach wird entschieden, ob `achievements` serverautoritativ ist;
  - bei aktivem Achievement-Enforce werden danach Build + Items + Achievement-State gemeinsam geladen;
  - Attribute werden erst freigegeben, wenn alle für `totalAttr()` nötigen Quellen frisch sind.
- Erwartung:
  - direkt **489** anzeigen;
  - kein vorheriges 428;
  - kein späteres Umspringen.
- Commit Character-Hub: `71f34e12c736000238e80dcaa6112560fad0d100`.
- Cache-Bust index/beta/server1: `8183achievementcap1`.
