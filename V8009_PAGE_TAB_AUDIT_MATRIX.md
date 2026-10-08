# V8.009 – Page / Tab Audit Matrix

Stand: 2026-10-08

Legende:
- [ ] offen
- [~] in Arbeit / teilweise geprüft
- [x] strukturell + Legacy-DOM + Lifecycle/Owner geprüft
- [T] zusätzlich manuell im Beta-Build bestätigt

## Pflichtregel
Jede Hauptseite und jeder Untertab muss vor Abschluss von V8.009 durch:
1. DOM-/Legacy-Producer-Audit
2. Render-/Lifecycle-Audit
3. Owner-Konsolidierung
4. Timer/RAF/Observer-Prüfung
5. Daten-/Authority-Pfad-Prüfung
6. manuellen Funktionstest an sinnvollem Meilenstein

Die Matrix wird nach jedem großen Cleanup-Batch aktualisiert.

## Hauptseiten

| Seite | Tabs / Unteransichten | Status | Notiz |
|---|---|---|---|
| World / Startseite | Home / Navigation / World-Module | [x] | V8.221 Beta: Grow-Cup-Bühne direkt im bestehenden CSS-Owner überarbeitet; Pflanze sitzt höher auf dem Podest und nutzt warmes Kontaktlicht + stärkeren Kontaktschatten, Overlay/Vignette reduziert; Bühnenbild-Diagnose ergab nur 180×320 px im eingebetteten WebP, daher bleibt echter Schärfegewinn durch höher aufgelöstes Original als separater Asset-Schritt offen. V8.220 Server 1: Grow Cup jeden Donnerstag; EXP-Wochenende alle 2 Wochen Freitag–Sonntag gemeinsam mit Smaragd-Koloss; Gegenwochenende Gold + Dampf ohne Koloss; persönlicher 6-Stunden-Cup mit 6 Aktionen, je Aktion 1 Regler + versteckter Sweet Spot, wöchentlich neue reale Growroom-Sorte/Sweet-Spots, indirekter Pflanzenstatus, maximal 600 Punkte und je Server genau eine Rangliste; Pflegefenster-Push, Vor-Run-Anleitung, Cup-Navigation, Startseiten-CUP-Bild und Timer-Resync auf beiden Servern; Server 1 besitzt eigene server1/server1_private Cup-/Runen-Authority ohne public/recovery_private-Datenzugriff; 6-Minuten-Test entfernt; Klassenbalance unverändert; manueller Server-1-Mobile-Endtest offen |
| Character | Attribute / Inventar / Talente / Materialien | [x] | v459 alleiniger sichtbarer Tab-Lifecycle-Owner; Material-/Inventar-Autoberechnung getrennt; alte v442 Layout-Rückverschiebung entfernt; globale Render-/Inventory-Wrapperketten konsolidiert; manueller Endtest offen |
| Growroom | Grow / Stock / Genetics / Orders | [x] | Event-Bus/Tab/Care/Hydration/Genetik/Stock/Orders-Lifecycle konsolidiert; V8.194 Gilden-Blütenspende eigener atomarer Server-RPC, 1/Tag Berlin, +5 Gilden-EP; manueller Endtest offen |
| Quests | Quest / Schicht-Arbeiten-Chillen | [x] | Dampf-/Quest-Renderowner konsolidiert; V8.190: Rewarded-Video direkt unter Zeit-Samen-Skip auf Beta + Server1, bis zu 2× je Quest, je 25 % der ursprünglichen Dauer, maximal 50 %, nur nach signiertem AdMob-SSV; 0/1/2 serverautoritativ; V8.242: Quest-Zeit-Samen-Fundchance serverautoritativ von 50 % auf 35 % für Beta und Server 1 (normal/Elite) reduziert; Drop-SQL beider Server nachkontrolliert; manueller 2×-Endtest offen |
| Dungeon | Weltkarte / 10er-Detailkarte / Kampf / Reward | [x] | Combat bleibt beim v7175 Renderer; v7051 serverautoritativ; v247 alleiniger Reward-Modal-Owner; doppelter Reward-DOM/Sound entfernt; Feedback-Run-ID erhalten; manueller Endtest offen |
| Shop | Waffen & Rüstung / Schmuck & Magie | [x][T] | Repaint-Flicker/Legacy-Header bereinigt; Kauf serverautoritativ; V8.195/196 Beta: aktiver VIP erhält genau 1 gemeinsamen kostenlosen Neu-Wurf pro Berliner Tag für Waffen oder Magie/Schmuck; Button zeigt vorher explizit kostenlos und springt nach Verbrauch sofort wieder auf 1 Harz-Taler; Authority direkt in v7083 |
| Hinterhof-Dealer | Tütchen / Harz-Automat | [x] | V8.234–236: Rewarded-Tütchen produktiv auf Beta + Server 1 aktiviert, inklusive signiertem AdMob-SSV und servergetrenntem Fortschritt; V8.237: beim Seitenaufruf ist Tütchen direkt der aktive und sichtbare Tab (kanonischer Owner + HTML-Startzustand beider Entrypoints), Harz-Automat bleibt manuell erreichbar; V8.238: bei 3/3 neues Belohnungs-Popup mit echten Beta-Eventdaten, Server 1 vorläufig mit serverseitiger Tütchen-Vorschau bei bestätigtem Claim-Anstieg; einmalig quittierbar; exakte historische Server-1-Receipt-RPC wegen blockiertem Datenbankzugriff noch offen; V8.239: natives top-layer Belohnungsfenster, damit Tütchen-/Automat-Tabs nicht überlagern; Server-1-Abschluss 3/3 mit 503 Gold und 3 Fragmenten gegen Eventlog bestätigt; V8.241: globaler `?`-Guide von historischem Harz-Lotto auf fünf aktuelle Schritte zu Rewarded-Tütchen, Belohnungspopup, Harz-Automat und Chancen umgestellt (Beta + Server 1); manueller Endtest auf Geräten offen |
| PvP | Hall-/Battle-Lifecycle | [x] | Cooldown ohne Full-Rerender, Legacy-Finish konsolidiert, v7053 Server-Authority + Fallback sauber getrennt; manueller Endtest offen |
| Guild | Übersicht / Growtasks / Boss / Krieg | [x] | kompletter Struktur-/DOM-/Lifecycle-/Authority-Pass grün; V8.194 Grow-Beutel-Spende prüft Membership serverseitig und ist vom normalen Gilden-XP-Tagescap getrennt; manueller Endtest offen |
| Hall of Haze | Spieler-Ranking / Gilden-Ranking / Profile | [x] | V8.184: v6145 bleibt kanonischer Hall-Owner; neue Haupttabs Spieler/Gilden, Gildenranking nach Gildenlevel → Gilden-Buds → Gilden-EP, anklickbares Gildenprofil mit Beschreibung/Leiter/Mitgliedern; V8.207: Top-3-Podium nutzt keine 100%-Rahmenstauchung mehr, sondern kanonisch vergrößerte Overlay-Geometrie; VIP wegen kleinerer Artwork-Öffnung separat normalisiert; Beta/Server1 Cache aktualisiert; manueller UI-Endtest offen |
| Friends | Ranking / Suche | [x] | v4130 finaler Friends/Search-Owner, Presence-Singleflight + 60s Refresh; v333/v382/v383 und globale Social-Renderwrapper retired; manueller Endtest offen |
| Mail | Inbox / Sent / Compose / Battlelog | [x] | v381 finaler Mail-/Tab-/Compose-Owner, v6200 Battlelog; Recipient-Routing ohne Delay, doppelte Tab-Loader entfernt; manueller Endtest offen |
| Admin | Content / Spieler / Tools (gestapelte Bereiche, keine echten Tabs) | [x] | v093 alleiniger Admin-Status- und Content-Lifecycle-Owner; Render-/Check-/Load-Wrapperketten entfernt; Player/Reward/Ticket/Broadcast/Systemtechnik-Authority geprüft; manueller Endtest offen |
| Harz Dealer | Harz / Gold / Frames / VIP (Beta) | [x] | v7117 bleibt Hub-Owner; V8.195/196 Beta: 7/14/30-Tage-VIP, tägliche serverautoritative Truhe jetzt mit eigenem Reward-Dialog + Replay des heutigen Claims, +10 % Wochentruhen-EP, 1 gemeinsamen Gratis-Shopwurf/Tag, temporärer Titel/Rahmen, optionale öffentliche VIP-Identität; V8.208: Navigation auf „Harz · Gold · Rahmen · VIP“ verdichtet, sprachabhängig und VIP-verfügbarkeitsabhängig; Server 1 bleibt ohne VIP und zeigt deshalb nur „Harz · Gold · Rahmen“; manueller Endtest offen |

## Zusätzliche Feature-Seiten / Submodule

| Modul | Tabs / Unteransichten | Status | Notiz |
|---|---|---|---|
| Tower | Lobby / Ranking / Meta-Aufstieg / Run / Result | [~] | kompletter DOM-/Lifecycle-/Owner-/Timer-/Authority-Pass grün; globaler v372-Header bleibt sichtbar, interner Sticky-Header startet darunter (60/54 px); V8.279 LIVE: Server1-Tomssen-Itemverlust beim Turm bestätigt (QA 4 belegte Slots -> kanonische Revision 164 leer), serverseitigen Admin-Legacy-Save-Enforce-Durchschreibfehler in der bestehenden v6355-Triggerfunktion behoben; kanonischer v7072-Turm-Owner schreibt keine Inventar-/Grow-/Build-Snapshots mehr und persistiert keinen kompletten lokalen Spielstand; nach Aktionen separate v7074/v7065/v7033-Authority-Refreshes. Beta + Server1 Cacheversion aktualisiert; Syntax- und SQL-Definition geprüft. V8.280 Haxxar Server1 Regression: 2 ausgerüstete Items, Itemrevision 6, 0 Tower-Runs; aktueller Tower-Owner in isolierter V8-Fixture mit echten Haxxar-State-Daten gegen leere und fremde Tower-Snapshots getestet: jeweils keine Item-/Grow-/Build-Veränderung und keine LocalStorage-Fullsave-Writes; Live-Zustand danach unverändert. V8.281: Echter Anbau-Turm-Live-Run mit Haxxar SERVER1 bestanden (2 Originalausrüstungen vor/nach unverändert, 1 neuer Tower-Drop im Inventar, Level 3→4, Tower-Run 1, Etage 8). Initiales Charakterseiten-Ruckeln über Telemetrie bestätigt, Performance-Fix offen. Tomssen: 3 konkrete Quest-/Dungeon-Originalitem-Objekte gefunden; vier Shopkäufe und 1 Tower-Drop ohne vollständig rekonstruierte Gegenstände, NICHT wiederhergestellt; V8.282: 3 belegte Originalitems auf Server1-Tomssen transaktional nach Backup ID 2 wiederhergestellt (Quest82-Ring, Dungeon15/16-Stiefel), Revision 164→165, Save/kanonischer Item-State übereinstimmend; 4 Shopkäufe und 1 Tower-Drop in Wiederherstellung offen. V8.283 Forensik: 4 erfolgreiche Shop-POSTs/Goldabbuchungen bestätigt, Shop-Owner ersetzt gekauftes Angebot sofort und zeichnet gekaufte Itemdaten nicht im Ledger auf. Tower erzeugt zufälliges Originalitem beim Abschluss, letzte Zusammenfassung hält nur Anzahl. Derzeit 5 Originalitems ohne sichere volle IDs/JSON, keine weitere Live-Mutation. Separates PITR/Original-Client-Snapshot prüfen. Android-Performance und Original-Restore offen |
| Forge | Dismantle / Craft / Verzaubern / Nebelforge | [x] | V8.220 Beta + Server 1: direkter Verzaubern-Tab im v488-Shell-Owner; getrennte Runenwallet je Server, +1 bis +10 und Item-Mutation serverautoritativ/idempotent; +2/+3/+4 besitzen eigene sichtbare Inset-/Glow-FX, +5 zusätzlich Blitz-FX; Server-1-RPCs/Wallet liegen ausschließlich in server1/server1_private; Nebelschmied bleibt getrennt; Klassenbalance unverändert; manueller Server-1-Endtest offen |
| Worldboss | Entry / Overlay / Combat / Reward | [x] | Entry/State/Countdown/Balance/Authority konsolidiert; v113/v114/Home-Click-Layer retired; globale Render-/Polling-Schichten entfernt; manueller Endtest offen |
| Guildboss | Signup / Fight / Replay / Reward | [x] | Server-Gate korrigiert: nur eigene offene Belohnung vom unmittelbaren Vortag sperrt die neue Anmeldung; ältere offene Rewards sperren nicht; Visual-/Replay-/Reward-Lifecycle konsolidiert; erneuter manueller Signup-Test offen |
| Profile Modal | Profil / Equipment / Friend action | [x] | v655 finaler Loader/Renderer, v652 nur Decoration-Observer; V8.195 Beta: öffentliche VIP-Markierung/Rahmen nur bei unexpired vip_until + vip_visible, Sichtbarkeit serverseitig gegen Spoofing geschützt; manueller Endtest offen |
| Character Creation | Beta Creator / Server-1 Creator | [x] | v4136 einziger direkter gl_create_character-Owner; Server1 nutzt denselben Create-Helper, eigene UI/Isolation bleibt; Finalizer-/Retry-Doppelpfade entfernt; Launch-Gate unverändert; V8.240: neuer Server1-Charakter startet nach bestätigtem Create/Hydrate den bestehenden v6254-Welcome-Guide direkt; bestehende Charaktere können das Tutorial freiwillig über das Startseiten-? erneut starten; manueller Android-Endtest offen |
| Settings | Account / Cloud / Logout / Delete / Version | [x] | v141 alleiniger DOM-Builder, v225 nur Binder/Repair |
| Global Header | Gold / Harz / Dampf / Navigation | [x] | v372 ist autoritativer Header; Ressourcen werden live synchronisiert; Tower-Offset berücksichtigt; DOM-Contracts aktiv |

## Automatisch erkannte Tab-Gruppen
- Character: attributes, inventory, talents, materials
- Guild: overview, growtasks, boss, war
- Friends: ranking, search
- Mail: inbox, sent, compose, battlelog
- Shop: weapon, magic
- Growroom: grow, stock, genetics, orders
- Forge: dismantle, craft, enchant, nebelforge
- Tower: rank, meta
- Admin: overview, players, content
- Harz Dealer: harz, gold, frames, vip (Beta)

## Reihenfolge für den großen Enddurchgang
1. Dungeon Combat + Reward final
2. Character – alle 4 Tabs
3. Guild – alle 4 Tabs + Guildboss
4. Quests + Schicht
5. Growroom – alle 4 Tabs
6. PvP + Hall of Haze
7. Tower kompletter Pass
8. Friends + Mail
9. Tütchen-Dealer + Harz Dealer
10. Forge
11. World / Worldboss
12. Admin
13. finale repo-weite DOM/Lifecycle/Owner-QA
14. manueller Endtest-Milestone


## Abschlussstatus V8.009
- Strukturell geprüfte Bereiche: **22/22**
- Offene Matrix-Bereiche: **0**
- Finale repo-weite DOM/Lifecycle/Owner-QA: **[x]**
- Beta-Entry: keine Inline-Scripts/Styles/Eventhandler und keine doppelten Script-/Stylesheet-Includes.
- Verbleibend: gemeinsamer manueller End-to-End-Test-Milestone.
