# Grow Legends – V8 Arbeitsstand

> **Diese Datei ist die zentrale Übergabe für neue Chats.**
> Bei einem neuen Chat zuerst diese Datei lesen und danach den aktuellen `main`-HEAD prüfen.
> Nicht aus Chat-Erinnerung raten, wenn Repo-Stand und Chat voneinander abweichen.

## 1. Aktueller Stand

- Projekt: **Grow Legends**
- Aktuelle Beta-Linie: **V8.009**
- Arbeitsbranch: **main**
- Letzter vollständig geprüfter Code-Commit vor dieser Statusdatei:
  `52723a2191f29c67b8a20e3e252ac9b598967db6`
- Letzte vollständig abgeschlossene Unterphase: **V8.009-DUNGEON-D4-BETA**
- D4 Ergebnis: **erfolgreich**
- D4 Extraktionscommit: `52723a2191f29c67b8a20e3e252ac9b598967db6`
- D4 Workflow/QA: **grün**
- D4 ausgelagert:
  - `v251-modern-dungeon-maps-style` → `css/features/dungeon/beta/v8009-d4-v251-modern-maps.css`
  - `v251-modern-dungeon-maps-core` → `js/features/dungeon/beta/v8009-d4-v251-modern-maps.js`
  - `v260-dungeon-detail-style` → `css/features/dungeon/beta/v8009-d4-v260-detail.css`
  - `v260-dungeon-detail-script` → `js/features/dungeon/beta/v8009-d4-v260-detail.js`
  - `v261-dungeon-detail-style` → `css/features/dungeon/beta/v8009-d4-v261-detail.css`
  - `v261-dungeon-detail-script` → `js/features/dungeon/beta/v8009-d4-v261-detail.js`
- D4 Umfang: ca. **66 KB** Inline-Code aus `beta.html` entfernt.
- `beta.html` danach: **6076288 Byte** statt **6142744 Byte**
- Quellreihenfolge der sechs Legacy-Kerne: **1:1 erhalten**
- JS-Syntax der drei extrahierten Scripts: **grün**
- Aktuelle Owner-Erkenntnis:
  - D2 ersetzt `renderDungeon` durch den kanonischen Dispatcher und umgeht die historische Render-Wrapper-Kette.
  - Weltkarte: D2 ruft weiterhin bevorzugt `window.v251RenderWorld` auf → **v251 World ist aktiv**.
  - Detailkarte: `v261-dungeon-detail-script` überschreibt `window.v251RenderDetail`, `v244RenderSelectedDungeonMap` und `v064RenderMap` mit `v261RenderDetail` → **v261 Detail ist aktiv**.
  - `v260RenderDetail` wird danach von v261 als Owner überschrieben und ist damit ein **Retirement-Kandidat**, aber noch nicht gelöscht.
  - Der v251-Block enthält zusätzlich `v251StartCurrentDungeonFight`, den v261 weiterhin benutzt; v251 darf daher nicht pauschal entfernt werden.
- D2/D3-Owner-Kette: **unverändert erhalten**
- Gameplay/Combat-Math/Rewards/Serverautorität: **unverändert**
- Aktuell in Arbeit / nächster Schritt: **V8.009-DUNGEON-D5-BETA**
- Scope der laufenden Strukturierungsarbeit: **Beta zuerst**
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
- `beta.html`: ca. **6076288 Byte**
- externe `.js`-Dateien unter `js/`: **97**
- externe `.css`-Dateien unter `css/`: **94**

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

### Nächste Unterphase: V8.009-DUNGEON-D5-BETA

D4 ist abgeschlossen. Die alten v251/v260/v261-Kerne sind nun extern und können erstmals sauber gegeneinander auditiert werden.

1. aktuellen `main`-HEAD lesen;
2. repo-weit die tatsächlichen Abhängigkeiten von `v260RenderDetail`, den `v260d-*`-DOM-Klassen und den beiden v260-D4-Dateien erfassen;
3. belegen, ob außerhalb des v260-Owners noch aktiver Runtime-Code von v260 abhängt;
4. gleichzeitig die kanonische Laufzeitkette festhalten:
   - Welt → `v251RenderWorld`
   - Detail → `v261RenderDetail`
   - Kampf → D1 Combat-Renderer / D2 Dispatcher
   - Reward → Rückkehr über D2 Lifecycle-Sync;
5. wenn der Repo-Audit **keine notwendige v260-Abhängigkeit** findet:
   - v260 als ersten historischen Detail-Owner kontrolliert aus der Beta-Ladekette nehmen;
   - die Dateien zunächst behalten, nicht löschen;
   - prüfen, dass v261 direkt und unverändert Owner bleibt;
6. wenn noch notwendige v260-Abhängigkeiten existieren:
   - v260 nicht deaktivieren;
   - Abhängigkeiten im D5-Manifest dokumentieren und nur den nächsten eindeutig redundanten Patch wählen;
7. Tests:
   - D2/D3/D4 Includes und Reihenfolge,
   - JS-Syntax,
   - keine doppelte aktive Detail-Owner-Zuweisung nach Bootstrap,
   - Stable/Server 1 unverändert,
   - keine Änderung an Gameplay, Combat-Math, Rewards oder Serverautorität;
8. danach Statusdatei auf D5-Ergebnis und exakten D6-Schritt aktualisieren.

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
