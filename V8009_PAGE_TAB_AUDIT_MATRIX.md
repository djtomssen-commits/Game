# V8.009 – Page / Tab Audit Matrix

Stand: 2026-10-01

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
| World / Startseite | Home / Navigation / World-Module | [~] | Navigation/World-Lifecycle bereits teilweise konsolidiert; kompletter Seitenpass noch offen |
| Character | Attribute / Inventar / Talente / Materialien | [~] | mehrere globale Render-Hooks entfernt; Material-DOM auf v546 reduziert; kompletter Tab-für-Tab-Pass noch offen |
| Growroom | Grow / Stock / Genetics / Orders | [x] | Event-Bus/Tab/Care/Hydration/Genetik/Stock/Orders-Lifecycle konsolidiert; manueller Endtest offen |
| Quests | Quest / Schicht-Arbeiten-Chillen | [x] | Dampf-/Quest-Renderowner konsolidiert, Claim/Event/Reward-Kette vereinheitlicht, Schicht-Timer bereinigt; manueller Endtest offen |
| Dungeon | Weltkarte / 10er-Detailkarte / Kampf / Reward | [~] | Karten-Owner reduziert, v048 Combat retired, Lifecycle deutlich bereinigt; Combat/Reward-Finalpass offen |
| Shop | Waffen & Rüstung / Schmuck & Magie | [x][T] | Repaint-Flicker, Legacy-Header, alte Shop-DOM-Producer und delayed Repaints bereinigt; Header vom Nutzer bestätigt |
| Tütchen-Dealer | Dealer / Rundenfortschritt / Reward | [ ] | kompletter Seitenpass offen |
| PvP | Hall-/Battle-Lifecycle | [x] | Cooldown ohne Full-Rerender, Legacy-Finish konsolidiert, v7053 Server-Authority + Fallback sauber getrennt; manueller Endtest offen |
| Guild | Übersicht / Growtasks / Boss / Krieg | [x] | kompletter Struktur-/DOM-/Lifecycle-/Authority-Pass grün; manueller Endtest offen |
| Hall of Haze | Ranking / Gegner / Profil-Interaktion | [x] | v6145 Ranking-Owner, v649 gezielter Progress-Sync, globale Hall-Repaints entfernt; manueller Endtest offen |
| Friends | Ranking / Suche | [ ] | kompletter 2-Tab-Pass offen |
| Mail | Inbox / Sent / Compose / Battlelog | [ ] | kompletter 4-Tab-Pass offen |
| Admin | Overview / Players / Content | [ ] | kompletter 3-Tab-Pass offen |
| Harz Dealer | Harz / Gold / Frames | [ ] | kompletter 3-Tab-Pass offen |

## Zusätzliche Feature-Seiten / Submodule

| Modul | Tabs / Unteransichten | Status | Notiz |
|---|---|---|---|
| Tower | Lobby / Ranking / Meta-Aufstieg / Run / Result | [~] | Saisonwechsel-Ranking am 2026-10-01 gefixt; kompletter Tower-Pass offen |
| Forge | Dismantle / Craft / Nebelforge | [ ] | kompletter 3-Tab-Pass offen |
| Worldboss | Entry / Overlay / Combat / Reward | [~] | Overlay/Art auf einen Owner reduziert; kompletter Funktionspass offen |
| Guildboss | Signup / Fight / Replay / Reward | [x] | Server-Gate: Vortagsbelohnung muss vor neuer Anmeldung abgeholt werden; Visual-/Replay-/Reward-Lifecycle konsolidiert; manueller Endtest offen |
| Profile Modal | Profil / Equipment / Friend action | [x] | v655 finaler Loader/Renderer, v652 nur Decoration-Observer, Deadlines/Fallbacks erhalten; manueller Endtest offen |
| Character Creation | Beta Creator / Server-1 Creator | [~] | alte v029/v4131/v4135 Producer retired; kontextabhängige v4136/v7229 Owner bleiben |
| Settings | Account / Cloud / Logout / Delete / Version | [x] | v141 alleiniger DOM-Builder, v225 nur Binder/Repair |
| Global Header | Gold / Harz / Dampf / Navigation | [x] | v358 Header-Owner, v283 Harz, v284 Dampf; DOM-Contracts aktiv |

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
- Harz Dealer: harz, gold, frames

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
