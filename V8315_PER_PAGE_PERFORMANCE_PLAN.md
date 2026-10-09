# V8.315 – Messplan pro Seite/Tab (Grow Legends)

Stand: 09.10.2026. **Kein allgemeines „99 % optimal“ behaupten, solange keine Vorher/Nachher-Messung auf echter Android-WebView läuft.**

## Warum der bisherige QA-Durchgang das Flackern nicht ausschließen konnte

- Repo-Syntax und statische Checks validieren Dateien, nicht den Zeitpunkt eines sichtbaren DOM-Austauschs.
- Ein Fixture mit simuliertem Account löst nicht dieselben Netzwerk-, Account-Ready- und Server-Sync-Signale aus wie ein echter Login.
- Für eine einmalige Instabilität nach dem Start müssen DOM-Austausch, Visibility-Wechsel, Full-Renders, Frame-Gaps und Long Tasks **zeitlich derselben Seite** zugeordnet werden.
- Auch CSS-Repaints ohne DOM-Austausch sind möglich; daher zusätzlich Layout-Shifts/Frame-Gaps und bei Bedarf Android Performance Trace.

## Verfügbares Werkzeug

- Kanonischer opt-in Trace-Owner: `js/system/performance/v8315-page-trace.js`.
- **V8.316:** Sichtbare Bedienelemente direkt im kanonischen Systemtechnik-Owner `js/features/system/beta/v8009-s1-v4107-systemtechnik.js` unter dem 30-Sekunden-Profil, erreichbar über die Admin-Navigation. Der frühere Settings-QA-Dialog wird hierfür nicht mehr verwendet. Beta und Server 1.
- Nach Start: kleiner **PERF-MESSUNG / STOP**-Button. Beim Stop Ergebnis mit **Bericht kopieren** und **JSON speichern**.
- Modi: **Manuell messen** (normal im Spiel navigieren und Tabs auslösen) oder **Alle 17 Seiten prüfen** (nacheinander nur navigieren, 2,5 s Halt je Seite, danach vorherige Seite öffnen; keine Kampf-, Werbe-, Kauf- oder Belohnungs-Klicks).
- Tracer ist beim normalen Spielstart inert (keine MutationObserver-/PerformanceObserver-/rAF-/Timer-Schleife) und erfasst **keine Account-IDs, Nutzernamen, Chats oder Rohspielstände**.
- Messfelder je Seite: Aufrufe und Verweildauer, DOM-Knoten min/max, hinzugefügte/entfernte DOM-Knoten, Mutation-Records, Root-/Aktuelles-Ersetzungen, Visibility-/Hidden-Wechsel, Layout-Shifts, lange Main-Thread-Tasks, Frames und Gap-p95, Frames >=50 ms, Bilder ohne NaturalWidth, kanonische World-Render-Marker, Klicks auf Tab-IDs. Der Trace verursacht selbst geringe Messlast und ist keine native GPU-Messung.
- Nach dem Stop ist die Messschleife vollständig deaktiviert. Ergebnisse bleiben ausschließlich im aktuellen Tab-Speicher (bis Reload), sofern sie nicht explizit kopiert/gespeichert werden.

## Messmatrix

| Seite | Wiederholbarer Ablauf | Zusätzlich manuell |
|---|---|---|
| Startseite / Aktuelles | Neu-Login, 30 s beobachten, zu anderer Seite und zurück, 3-mal | Event/Weltboss, Grow-Cup-Ergebnis-Slot, Wetter und Dampfwechsel verfolgen |
| Charakter | 3-mal öffnen/wechseln | Attribute/Talente/Ausrüstung/Materialien ohne unnötige Änderungen |
| Growroom | 3-mal öffnen | Pflanzen-/Pflege-/Lager-Tabs, Timer und Wetter |
| Quest & Schicht | 3-mal öffnen | Quest/Schicht-Tabs, Dampf-Anzeige, laufender Timer |
| Dungeon | 3-mal öffnen | Dungeon-Liste/Räume, freiwilliger Kampf separat |
| Anbauturm | 3-mal öffnen | Lobby/Rangliste, einmal vollständigen Run separat |
| Nebelkarawane | 3-mal öffnen | Tabwechsel, Listenlayout |
| Endgame | 3-mal öffnen | Tabs, Freischaltungen |
| Händler | 3-mal öffnen | Händler wechseln, scrollen; keine Testkäufe im Automat |
| Harzschmiede | 3-mal öffnen | Schmiede-Reiter/Inventar, kein unbeabsichtigtes Crafting |
| Harz-Dealer | 3-mal öffnen | Angebote/Rahmen ansehen, keine Echtgeldkäufe |
| Hinterhof-Dealer | 3-mal öffnen | Tütchen/Automat; Werbung nur im gesonderten manuellen Test |
| PvP | 3-mal öffnen | Rangliste/Gegnerliste; Kampf gesondert |
| Gilde | 3-mal öffnen | Übersicht, Chat, Kriege, Boss |
| Hall of Haze | 3-mal öffnen | Spieler-/Gildenrangliste |
| Nebel-Crew | 3-mal öffnen | Freunde, Anfragen |
| Nebel-Post | 3-mal öffnen | Nachrichtenliste und Navigation |

Die automatische Runde dauert mindestens ~43 Sekunden plus Seitenübergänge. Sie beweist nur, dass Navigations-/Idle-Signale pro Seite messbar sind. Kämpfe, Käufe, Serverbelohnungen und konkrete Untertabs bleiben **separate manuelle Szenarien**, um keine Live-Spielerdaten zu verändern.

## Sofort nutzbarer Ablauf auf dem Android-Gerät

1. App vollständig neu starten, anmelden und als Admin **Hamburger-Menü → Systemtechnik** öffnen (NICHT Einstellungen). Im Bereich „Code-Diagnose“ unter dem bisherigen 30-Sekunden-Profiler steht **PERFORMANCE JE SEITE** (V8.316).
2. **Manuell messen** starten, zurück zur Startseite; ca. 30 Sekunden bei `Aktuelles` bleiben, danach 3-mal zwischen Startseite und Charakter/Quest wechseln.
3. Wenn es flackert, weiterlaufen lassen und danach am unteren **STOP**-Button beenden. **Bericht kopieren** und im Chat einfügen; alternativ JSON speichern.
4. Zusätzlich **Alle 17 Seiten prüfen** aus der QA öffnen; nach Abschluss die Messdaten ebenfalls sichern.
5. Dasselbe auf Beta und Server 1 ausführen, möglichst auf demselben Smartphone und mit gleichen Schritten.

## Auswertungsregeln (Schwellenwerte sind Arbeitshypothesen)

- **P0 – unsichtbarer oder falscher UI-Zustand:** `aktuelles_dom_removed` ohne begründete Event-/Account-/Wetteränderung, Layout-Verlust, Sprünge von Attributwerten, verschwundene Buttons/Items, kaputte Darstellung.
- **P1 – blockierende Performance:** einzelne Main-Thread-Tasks >=200ms, Frame-Abstände >=100ms, wiederholte Root-Replacements ohne Eingabe, auffällige Sichtbarkeitswechsel nach dem Mount.
- **P2 – allgemeines Ruckeln:** p95 Frame Gap über ~33 ms während *sichtbarer, aktiver* Animationen; viele Frame-Gaps >=50ms, nicht durch Taskwechsel oder Hintergrundbetrieb begründet.
- **P3 – Infrastruktur:** 646 JS- und 712 CSS-Referenzen pro Entrypoint im V8.312-Sweep, große Initialisierung/Account-Ready-Warteschlange. Optimierung durch Zusammenlegen/Lazy Loading erst nach Abhängigkeitsanalyse, nicht durch blinde Skriptdeaktivierung.

Nach jedem Fix: dieselbe Bildschirmfolge erneut messen, DOM-Identitäten und Long-Tasks vergleichen; keine Verbesserung behaupten, wenn lediglich ein syntaktischer QA-Test bestanden wurde.

## Reproduzierbare CI-Prüfung

- `.github/workflows/v8315-per-page-audit.yml` führt Node-Syntaxcheck und synthetischen Playwright-Chromium-Test des Messwerkzeugs aus.
- `qa/v8315-page-audit-browser.mjs` prüft absichtlich erzeugten Aktuelles-DOM-Verlust, Visibility-Wechsel, Render-Marker, Tab-Klicks und 17 navigierbare Fixture-Seiten.
- Das CI-Artefakt enthält JSON-Auswertung und Screenshot: `grow-legends-v8315-per-page-audit`.
- **Grenze:** CI ist ein synthetischer Instrumentationscheck ohne Login. Er garantiert nicht, dass alle 17 Funktionen im realen Spiel fehlerfrei sind. Die finale Page-/Tab-Performance-Freigabe erfolgt ausschließlich mit Android-Trace plus gezielten Browser-Regressionen je repariertem Owner.
