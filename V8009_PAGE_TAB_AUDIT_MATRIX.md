# V8.009 – Page / Tab Audit Matrix

Stand: 2026-10-07

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
| World / Startseite | Home / Navigation / World-Module | [x] | kanonischer Home-Renderer besitzt Weltboss-Slot/Navigation; v483/v7288 Lifecycle konsolidiert; globaler Render-/Postrender-Wrapper entfernt; manueller Endtest offen |
| Character | Attribute / Inventar / Talente / Materialien | [x] | v459 alleiniger sichtbarer Tab-Lifecycle-Owner; Material-/Inventar-Autoberechnung getrennt; alte v442 Layout-Rückverschiebung entfernt; globale Render-/Inventory-Wrapperketten konsolidiert; manueller Endtest offen |
| Growroom | Grow / Stock / Genetics / Orders | [x] | Event-Bus/Tab/Care/Hydration/Genetik/Stock/Orders-Lifecycle konsolidiert; V8.194 Gilden-Blütenspende eigener atomarer Server-RPC, 1/Tag Berlin, +5 Gilden-EP; manueller Endtest offen |
| Quests | Quest / Schicht-Arbeiten-Chillen | [x] | Dampf-/Quest-Renderowner konsolidiert; V8.190: Rewarded-Video direkt unter Zeit-Samen-Skip auf Beta + Server1, bis zu 2× je Quest, je 25 % der ursprünglichen Dauer, maximal 50 %, nur nach signiertem AdMob-SSV; 0/1/2 serverautoritativ; manueller 2×-Endtest offen |
| Dungeon | Weltkarte / 10er-Detailkarte / Kampf / Reward | [x] | Combat bleibt beim v7175 Renderer; v7051 serverautoritativ; v247 alleiniger Reward-Modal-Owner; doppelter Reward-DOM/Sound entfernt; Feedback-Run-ID erhalten; manueller Endtest offen |
| Shop | Waffen & Rüstung / Schmuck & Magie | [x][T] | Repaint-Flicker/Legacy-Header bereinigt; Kauf serverautoritativ; V8.195/196 Beta: aktiver VIP erhält genau 1 gemeinsamen kostenlosen Neu-Wurf pro Berliner Tag für Waffen oder Magie/Schmuck; Button zeigt vorher explizit kostenlos und springt nach Verbrauch sofort wieder auf 1 Harz-Taler; Authority direkt in v7083 |
| Hinterhof-Dealer | Harz Lotto / Tütchen (Coming Soon) | [x] | Player-sichtbarer Menüeintrag über v4148; Harz Lotto offen, Tütchen deaktiviert/COMING SOON; manueller Endtest offen |
| PvP | Hall-/Battle-Lifecycle | [x] | Cooldown ohne Full-Rerender, Legacy-Finish konsolidiert, v7053 Server-Authority + Fallback sauber getrennt; manueller Endtest offen |
| Guild | Übersicht / Growtasks / Boss / Krieg | [x] | kompletter Struktur-/DOM-/Lifecycle-/Authority-Pass grün; V8.194 Grow-Beutel-Spende prüft Membership serverseitig und ist vom normalen Gilden-XP-Tagescap getrennt; manueller Endtest offen |
| Hall of Haze | Spieler-Ranking / Gilden-Ranking / Profile | [x] | V8.184: v6145 bleibt kanonischer Hall-Owner; neue Haupttabs Spieler/Gilden, Gildenranking nach Gildenlevel → Gilden-Buds → Gilden-EP, anklickbares Gildenprofil mit Beschreibung/Leiter/Mitgliedern; Beta/Server1 getrennte RPCs; manueller UI-Endtest offen |
| Friends | Ranking / Suche | [x] | v4130 finaler Friends/Search-Owner, Presence-Singleflight + 60s Refresh; v333/v382/v383 und globale Social-Renderwrapper retired; manueller Endtest offen |
| Mail | Inbox / Sent / Compose / Battlelog | [x] | v381 finaler Mail-/Tab-/Compose-Owner, v6200 Battlelog; Recipient-Routing ohne Delay, doppelte Tab-Loader entfernt; manueller Endtest offen |
| Admin | Content / Spieler / Tools (gestapelte Bereiche, keine echten Tabs) | [x] | v093 alleiniger Admin-Status- und Content-Lifecycle-Owner; Render-/Check-/Load-Wrapperketten entfernt; Player/Reward/Ticket/Broadcast/Systemtechnik-Authority geprüft; manueller Endtest offen |
| Harz Dealer | Harz / Gold / Frames / VIP (Beta) | [x] | v7117 bleibt Hub-Owner; V8.195/196 Beta: 7/14/30-Tage-VIP, tägliche serverautoritative Truhe jetzt mit eigenem Reward-Dialog + Replay des heutigen Claims, +10 % Wochentruhen-EP, 1 gemeinsamen Gratis-Shopwurf/Tag, temporärer Titel/Rahmen, optionale öffentliche VIP-Identität; VIP- und Referral-Rahmen haben getrennte IDs + eigene V2-Artworks; Server 1 noch ohne VIP; manueller Endtest offen |

## Zusätzliche Feature-Seiten / Submodule

| Modul | Tabs / Unteransichten | Status | Notiz |
|---|---|---|---|
| Tower | Lobby / Ranking / Meta-Aufstieg / Run / Result | [x] | kompletter DOM-/Lifecycle-/Owner-/Timer-/Authority-Pass grün; globaler v372-Header bleibt sichtbar, interner Sticky-Header startet darunter (60/54 px); manueller Endtest offen |
| Forge | Dismantle / Craft / Nebelforge | [x] | 3 Tabs aus einem Shell-Owner; Zerlegen + Prismatisch serverautoritativ/idempotent; Nebelschmied-Tab-Injection/Observer retired, Reroll mit persistenter Request-ID; manueller Endtest offen |
| Worldboss | Entry / Overlay / Combat / Reward | [x] | Entry/State/Countdown/Balance/Authority konsolidiert; v113/v114/Home-Click-Layer retired; globale Render-/Polling-Schichten entfernt; manueller Endtest offen |
| Guildboss | Signup / Fight / Replay / Reward | [x] | Server-Gate korrigiert: nur eigene offene Belohnung vom unmittelbaren Vortag sperrt die neue Anmeldung; ältere offene Rewards sperren nicht; Visual-/Replay-/Reward-Lifecycle konsolidiert; erneuter manueller Signup-Test offen |
| Profile Modal | Profil / Equipment / Friend action | [x] | v655 finaler Loader/Renderer, v652 nur Decoration-Observer; V8.195 Beta: öffentliche VIP-Markierung/Rahmen nur bei unexpired vip_until + vip_visible, Sichtbarkeit serverseitig gegen Spoofing geschützt; manueller Endtest offen |
| Character Creation | Beta Creator / Server-1 Creator | [x] | v4136 einziger direkter gl_create_character-Owner; Server1 nutzt denselben Create-Helper, eigene UI/Isolation bleibt; Finalizer-/Retry-Doppelpfade entfernt; Launch-Gate unverändert; manueller Endtest offen |
| Settings | Account / Cloud / Logout / Delete / Version | [x] | v141 alleiniger DOM-Builder, v225 nur Binder/Repair |
| Global Header | Gold / Harz / Dampf / Navigation | [x] | v372 ist autoritativer Header; Ressourcen werden live synchronisiert; Tower-Offset berücksichtigt; DOM-Contracts aktiv |

## Automatisch erkannte Tab-Gruppen
- Character: attributes, inventory, talents, materials
- Guild: overview, growtasks, boss, war
- Friends: ranking, search
- Mail: inbox, sent, compose, battlelog
- Shop: weapon, magic
- Growroom: grow, stock, genetics, orders
- Forge: dismantle, craft, nebelforge
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
