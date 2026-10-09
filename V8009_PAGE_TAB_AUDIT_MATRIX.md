# V8.009 – Page / Tab Audit Matrix

Stand: 2026-10-09

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
| Character | Attribute / Inventar / Talente / Materialien | [x] | v459 alleiniger sichtbarer Tab-Lifecycle-Owner; Material-/Inventar-Autoberechnung getrennt; alte v442 Layout-Rückverschiebung entfernt; globale Render-/Inventory-Wrapperketten konsolidiert; manueller Endtest offen V8.285: Audit speichert vor/nach geänderte Ausrüstung, Talente, Attribute in privaten Server-Journalen. Datenverlust-Bugfix Server1/Beta, aber Mobil-/Re-Login-Endtest weiter offen. |
| Growroom | Grow / Stock / Genetics / Orders | [x] | Event-Bus/Tab/Care/Hydration/Genetik/Stock/Orders-Lifecycle konsolidiert; V8.194 Gilden-Blütenspende eigener atomarer Server-RPC, 1/Tag Berlin, +5 Gilden-EP; manueller Endtest offen V8.285: kanonischer Seed-/Plant-/TimeSeed-State wird ab jetzt transaktional vor/nach Änderungen archiviert; künftige Sonderfälle rekonstruierbar. |
| Quests | Quest / Schicht-Arbeiten-Chillen | [x] | Dampf-/Quest-Renderowner konsolidiert; V8.190: Rewarded-Video direkt unter Zeit-Samen-Skip auf Beta + Server1, bis zu 2× je Quest, je 25 % der ursprünglichen Dauer, maximal 50 %, nur nach signiertem AdMob-SSV; 0/1/2 serverautoritativ; V8.242: Quest-Zeit-Samen-Fundchance serverautoritativ von 50 % auf 35 % für Beta und Server 1 (normal/Elite) reduziert; Drop-SQL beider Server nachkontrolliert; manueller 2×-Endtest offen V8.289: Bonus bei 100 verbrauchtem Quest-Dampf jetzt ausschließlich 0 oder +1 Harz (Default 50%-Chance), maximal +1 je 100 Dampf pro Tag; alte garantierte +2 und Frühdrops in beiden v7044 Owner- und v6359-Fallbackfunktionen entfernt; tägliche erste Quest +2 und Elite +1..3 unverändert. V8.291: Bonus-HT-Chance 6,5% und Dampf-50%-Chance jetzt je Server via sichere Admin-Konfiguration schaltbar, 6,5%-Standard unangetastet. SQL in ops/database/v8289_quest_dampf_harz_balance.sql und v8291_quest_admin_config_owners.sql. |
| Dungeon | Weltkarte / 10er-Detailkarte / Kampf / Reward | [x] | Combat bleibt beim v7175 Renderer; v7051 serverautoritativ; v247 alleiniger Reward-Modal-Owner; doppelter Reward-DOM/Sound entfernt; Feedback-Run-ID erhalten; manueller Endtest offen |
| Shop | Waffen & Rüstung / Schmuck & Magie | [x][T] | Repaint-Flicker/Legacy-Header bereinigt; Kauf serverautoritativ; V8.195/196 Beta: aktiver VIP erhält genau 1 gemeinsamen kostenlosen Neu-Wurf pro Berliner Tag für Waffen oder Magie/Schmuck; Button zeigt vorher explizit kostenlos und springt nach Verbrauch sofort wieder auf 1 Harz-Taler; Authority direkt in v7083 V8.285: historische Käufe enthielten nur Gold/Eventreferenz, nicht vollständiges Item-Receipt; neue kanonische Itemzustands-Journale erfassen künftige gekaufte Itemobjekte beim Kauf. Spezifisches, doppelsicheres Shop-Receipt bleibt als separater Ausbau offen. V8.297: Erfolgreiche serverautoritative Shop-Neuwurf-RPC liefert `vip_free_reroll_available`, jetzt direkte Label-Synchronisierung beider Neuwurfbuttons und CSS-Klasse über v461SyncRerollControls(available), unabhängig vom shopViewSig-basierten Repaint-Dedup. Kosten nach VIP-Free sofort 1 Harz; kein lokaler Debit, serverseitige Preise unverändert. Event/Server-Response-Mock-QA PASS, Beta/Server1 Cache 8297vipreroll1. |
| Hinterhof-Dealer | Tütchen / Harz-Automat | [x] | V8.234–236: Rewarded-Tütchen produktiv auf Beta + Server 1 aktiviert, inklusive signiertem AdMob-SSV und servergetrenntem Fortschritt; V8.237: beim Seitenaufruf ist Tütchen direkt der aktive und sichtbare Tab (kanonischer Owner + HTML-Startzustand beider Entrypoints), Harz-Automat bleibt manuell erreichbar; V8.238: bei 3/3 neues Belohnungs-Popup mit echten Beta-Eventdaten, Server 1 vorläufig mit serverseitiger Tütchen-Vorschau bei bestätigtem Claim-Anstieg; einmalig quittierbar; exakte historische Server-1-Receipt-RPC wegen blockiertem Datenbankzugriff noch offen; V8.239: natives top-layer Belohnungsfenster, damit Tütchen-/Automat-Tabs nicht überlagern; Server-1-Abschluss 3/3 mit 503 Gold und 3 Fragmenten gegen Eventlog bestätigt; V8.241: globaler `?`-Guide von historischem Harz-Lotto auf fünf aktuelle Schritte zu Rewarded-Tütchen, Belohnungspopup, Harz-Automat und Chancen umgestellt (Beta + Server 1); manueller Endtest auf Geräten offen |
| PvP | Hall-/Battle-Lifecycle | [x] | Cooldown ohne Full-Rerender, Legacy-Finish konsolidiert, v7053 Server-Authority + Fallback sauber getrennt; manueller Endtest offen |
| Guild | Übersicht / Growtasks / Boss / Krieg | [x] | kompletter Struktur-/DOM-/Lifecycle-/Authority-Pass grün; V8.194 Grow-Beutel-Spende prüft Membership serverseitig und ist vom normalen Gilden-XP-Tagescap getrennt; manueller Endtest offen |
| Hall of Haze | Spieler-Ranking / Gilden-Ranking / Profile | [x] | V8.184: v6145 bleibt kanonischer Hall-Owner; neue Haupttabs Spieler/Gilden, Gildenranking nach Gildenlevel → Gilden-Buds → Gilden-EP, anklickbares Gildenprofil mit Beschreibung/Leiter/Mitgliedern; V8.207: Top-3-Podium nutzt keine 100%-Rahmenstauchung mehr, sondern kanonisch vergrößerte Overlay-Geometrie; VIP wegen kleinerer Artwork-Öffnung separat normalisiert; Beta/Server1 Cache aktualisiert; manueller UI-Endtest offen V8.297: Screenshot-Fix TOP3: Bild-/Rahmenebene bleibt unter separat deckender Namen-/VIP-Badge-/Stats-Ebene mit eigener Isolation und mehrzeiligem Namen; Original CSS v6145 owner direkt angepasst, Cache 8297podiumcaption1 Beta + Server1. Mobile Sichtprüfung nach Publish offen. |
| Friends | Ranking / Suche | [x] | v4130 finaler Friends/Search-Owner, Presence-Singleflight + 60s Refresh; v333/v382/v383 und globale Social-Renderwrapper retired; manueller Endtest offen |
| Mail | Inbox / Sent / Compose / Battlelog | [x] | v381 finaler Mail-/Tab-/Compose-Owner, v6200 Battlelog; Recipient-Routing ohne Delay, doppelte Tab-Loader entfernt; manueller Endtest offen |
| Admin | Content / Spieler / Tools (gestapelte Bereiche, keine echten Tabs) | [x] | v093 alleiniger Admin-Status- und Content-Lifecycle-Owner; Render-/Check-/Load-Wrapperketten entfernt; Player/Reward/Ticket/Broadcast/Systemtechnik-Authority geprüft; manueller Endtest offen V8.290/V8.291: zusätzliche eigenständige Web-Admin-App admin.html mit Kanonischem Frontend-Owner js/admin-control-center.js und CSS css/admin-control-center.css. Servergetrennter Beta/Server1-Schalter, eigenes Supabase-E-Mail-/Passwort-Login, verpflichtende game_admins-RBAC pro v8290_admin_console-RPC, anonymes EXECUTE widerrufen, private Audit-Aktionstabelle. 9 Read-only-Adminbereiche (Overview, Spieler, Economy, Settings, Sicherheit, Events, Mitteilungen, Bots, System); Echtgeldsensitive Gutschrift nur positiv mit Event-ID/Grund/Serverconfirm und Rollback-/Idempotenztest; zwei Quest-HT-Chancen editierbar mit Revision-CAS. Klassenbalance, Shoppreise, Events-Edits, Löschen/Resets und Deploys READ ONLY bzw noch gesperrt. JS-Syntax, 9 RPC-Leseaktionen für beide Server, settings/grant-Rollback/Replay geprüft. Cloudflare Worker Auslieferung / echter Browser-Login auf admin.html noch NICHT verifiziert. |
| Harz Dealer | Harz / Gold / Frames / VIP (Beta + Server 1) | [x] | v7117 bleibt Hub-Owner; V8.195/196 Beta: 7/14/30-Tage-VIP, tägliche serverautoritative Truhe jetzt mit eigenem Reward-Dialog + Replay des heutigen Claims, +10 % Wochentruhen-EP, 1 gemeinsamen Gratis-Shopwurf/Tag, temporärer Titel/Rahmen, optionale öffentliche VIP-Identität; V8.208: Navigation auf „Harz · Gold · Rahmen · VIP“ verdichtet, sprachabhängig und VIP-verfügbarkeitsabhängig; Seit V8.293 ist VIP auch auf Server 1 aktiv (eigene Entitlements, Play-Verifikation, Truhe, Rahmen); manueller Endtest offen V8.294 Live-Test PASS: Server1 VIP 7-Tage Testkauf `vip_7day` 1 eindeutiger Beleg für Tomssen, gültig bis 15.10.2026 22:25 MESZ, Titel/VIP-Visibility serverseitig true. VIP-Tagestruhe heute exakt 1x +600 Gold/+1 Harz/+10 Fragmente, Ledger und private Audit-Zustandsänderungen 1:1 gleich; Shop-Gratiswurf noch unbenutzt. Cross-Server-Kauftoken Kollision 0. Android VIP-Rahmen/Gratiswürfeln, Verlängerung, täglicher Reset noch Endtest offen. V8.295 VIP-Kronenrahmen nach erstem Live-Server1-VIP-Kauf fehlte im Frame-Selector: Hauptursache `server1.v7137_avatar_frame_state()` -> veralteter `server1.v7137_frame_state_for` ohne VIP; DIREKT geändert, verweist auf geschützten `server1_private.v7137_frame_state_for` mit temporär owned VIP crown. Framecount auf Beta+Server1 korrigiert, Client cached in-flight VIP-Refresh/account switch behoben, neue Frame-Skriptversion in beiden Entrypoints `8295vipframe1`. SQL API-Test als Tomssen: VIP true, 1 owned crown, frame_count 1; aktive Crown in gerollbackter Transaktion testweise setzbar und lesbar, Originaldaten unverändert. Android-Test nach Publish offen. V8.296 VIP Truhen-Nachholen auf Beta+Server1: 3-tägiges Berliner Nachholfenster, max 3 offene Claims, ab Kaufdatum/ununterbrochener aktiver VIP-Zeit, keine Doppelzahlung; serverseitige v8296_pending_vip_chest_days Owner, v8195_vip_state liefert pending_chests, v8195_vip_claim_daily schreibt 1–3 Tage in einem atomaren Gold-/Harz-/Fragment-Claim mit Ledger. Im VIP-Tab `X/3 Truhen bereit`, Hinweis `bis zu 3 sammeln/ältere verfallen`, Mehrfach-Abholen mit addiertem Popup. Beta 3er-, Server1 2er-Rollback-Audit geprüft, Repeat=ALREADY_CLAIMED; alte Claims unverändert, VIP-Preise/Klassenbalance unverändert; Android-Realtest offen. |

## Zusätzliche Feature-Seiten / Submodule

| Modul | Tabs / Unteransichten | Status | Notiz |
|---|---|---|---|
| Tower | Lobby / Ranking / Meta-Aufstieg / Run / Result | [~] | kompletter DOM-/Lifecycle-/Owner-/Timer-/Authority-Pass grün; globaler v372-Header bleibt sichtbar, interner Sticky-Header startet darunter (60/54 px); V8.279 LIVE: Server1-Tomssen-Itemverlust beim Turm bestätigt (QA 4 belegte Slots -> kanonische Revision 164 leer), serverseitigen Admin-Legacy-Save-Enforce-Durchschreibfehler in der bestehenden v6355-Triggerfunktion behoben; kanonischer v7072-Turm-Owner schreibt keine Inventar-/Grow-/Build-Snapshots mehr und persistiert keinen kompletten lokalen Spielstand; nach Aktionen separate v7074/v7065/v7033-Authority-Refreshes. Beta + Server1 Cacheversion aktualisiert; Syntax- und SQL-Definition geprüft. V8.280 Haxxar Server1 Regression: 2 ausgerüstete Items, Itemrevision 6, 0 Tower-Runs; aktueller Tower-Owner in isolierter V8-Fixture mit echten Haxxar-State-Daten gegen leere und fremde Tower-Snapshots getestet: jeweils keine Item-/Grow-/Build-Veränderung und keine LocalStorage-Fullsave-Writes; Live-Zustand danach unverändert. V8.281: Echter Anbau-Turm-Live-Run mit Haxxar SERVER1 bestanden (2 Originalausrüstungen vor/nach unverändert, 1 neuer Tower-Drop im Inventar, Level 3→4, Tower-Run 1, Etage 8). Initiales Charakterseiten-Ruckeln über Telemetrie bestätigt, Performance-Fix offen. Tomssen: 3 konkrete Quest-/Dungeon-Originalitem-Objekte gefunden; vier Shopkäufe und 1 Tower-Drop ohne vollständig rekonstruierte Gegenstände, NICHT wiederhergestellt; V8.282: 3 belegte Originalitems auf Server1-Tomssen transaktional nach Backup ID 2 wiederhergestellt (Quest82-Ring, Dungeon15/16-Stiefel), Revision 164→165, Save/kanonischer Item-State übereinstimmend; 4 Shopkäufe und 1 Tower-Drop in Wiederherstellung offen. V8.283 Forensik: 4 erfolgreiche Shop-POSTs/Goldabbuchungen bestätigt, Shop-Owner ersetzt gekauftes Angebot sofort und zeichnet gekaufte Itemdaten nicht im Ledger auf. Tower erzeugt zufälliges Originalitem beim Abschluss, letzte Zusammenfassung hält nur Anzahl. Derzeit 5 Originalitems ohne sichere volle IDs/JSON, keine weitere Live-Mutation. Separates PITR/Original-Client-Snapshot prüfen. Android-Performance und Original-Restore offen V8.284: Nutzer wählt statt noch unbewiesener fünf Originalgegenstände ausdrücklich 3.000 Gold Kompensation für Tomssen; Gold 899→3.899, abgesichert und einmalig gebucht (Gold Ledger). V8.284 Save-Trigger-Owner für Gold/Harz/Items beidseitig ohne Admin-Backflow; V8.285 Zukunfts-Audit mit vollständigem Vorher-/Nachher-Item-State und Zahlungskonten auf beiden Servern; echter Haxxar-Run erfolgreich, UI-Ruckeln weiter offen. V8.288 Client-Fix: Rangliste nach beendetem Run konnte wegen root.dataset.v8009LobbyWarmupQueued trotz neuem #vTRanking-DOM dauerhaft auf „wird geladen“ verbleiben. In kanonischem Turm-Renderowner nun pro neuem Live-DOM garantierte verzögerte Saison-/Mittwochs-/Belohnungsladung (650/850/1050ms), zuletzt angezeigte Rangliste bei Repaint erhalten und fetch Mittwoch nach 7s mit sichtbarem Fallback. Beta-/Server1-Entrypoints beide mit Cachebust 8288rankrecovery1. JavaScript-Parse 2/2 PASS und DOM-Mock-Test 3/3 PASS. Live-Tower-Daten für Tomssen/Haxxar/K3n3dr0 serverseitig vorhanden. Android-Manualtest/Cloudflare-Update-Kontrolle offen; Tower Replay-Lags separat offen. |
| Forge | Dismantle / Craft / Verzaubern / Nebelforge | [x] | V8.220 Beta + Server 1: direkter Verzaubern-Tab im v488-Shell-Owner; getrennte Runenwallet je Server, +1 bis +10 und Item-Mutation serverautoritativ/idempotent; +2/+3/+4 besitzen eigene sichtbare Inset-/Glow-FX, +5 zusätzlich Blitz-FX; Server-1-RPCs/Wallet liegen ausschließlich in server1/server1_private; Nebelschmied bleibt getrennt; Klassenbalance unverändert; manueller Server-1-Endtest offen |
| Worldboss | Entry / Overlay / Combat / Reward | [x] | Entry/State/Countdown/Balance/Authority konsolidiert; v113/v114/Home-Click-Layer retired; globale Render-/Polling-Schichten entfernt; manueller Endtest offen |
| Guildboss | Signup / Fight / Replay / Reward | [x] | Server-Gate korrigiert: nur eigene offene Belohnung vom unmittelbaren Vortag sperrt die neue Anmeldung; ältere offene Rewards sperren nicht; Visual-/Replay-/Reward-Lifecycle konsolidiert; erneuter manueller Signup-Test offen |
| Profile Modal | Profil / Equipment / Friend action | [x] | v655 finaler Loader/Renderer, v652 nur Decoration-Observer; V8.195 Beta: öffentliche VIP-Markierung/Rahmen nur bei unexpired vip_until + vip_visible, Sichtbarkeit serverseitig gegen Spoofing geschützt; manueller Endtest offen |
| Character Creation | Beta Creator / Server-1 Creator | [x] | v4136 einziger direkter gl_create_character-Owner; Server1 nutzt denselben Create-Helper, eigene UI/Isolation bleibt; Finalizer-/Retry-Doppelpfade entfernt; Launch-Gate unverändert; V8.240: neuer Server1-Charakter startet nach bestätigtem Create/Hydrate den bestehenden v6254-Welcome-Guide direkt; bestehende Charaktere können das Tutorial freiwillig über das Startseiten-? erneut starten; manueller Android-Endtest offen |
| Settings | Account / Cloud / Logout / Delete / Version | [x] | v141 alleiniger DOM-Builder, v225 nur Binder/Repair |
| Global Header | Gold / Harz / Dampf / Navigation | [x] | v372 ist autoritativer Header; Ressourcen werden live synchronisiert; Tower-Offset berücksichtigt; DOM-Contracts aktiv V8.284: Gold/Harz mit Trusted Owner auch für Admins geschützt. V8.285: Journal jede Währungsänderung auf kanonischem Serverstand; Bot-Legacy-Mirror kann veraltet sein, echte Server1-Spieler zum Prüfzeitpunkt konsistent. |

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
- Harz Dealer: harz, gold, frames, vip (Beta + Server 1)

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


## 08.10.2026 – V8.285 Player-Value-Integrity / Echtgeldschutz
- **Live-Payment-Proof:** Public Google-Play-Kaufregister: 5 Beta-Quittungen / 275 Harz, 1 Server1-Quittung / 25 Harz. 6/6 mit exakt passendem Harz-Event; Token-PK einzigartig. Interne Credit-RPCs nicht für `anon`/`authenticated` direkt ausführbar.
- **Guard-Coverage:** Server1 53/53 registrierte Charaktere mit Item/Gold/Harz/Seed/Build Guards. 50 sind Bots; 49 Bot-Gold-, 42 Bot-Harz- und 5 Bot-Item-Legacy-Mirror-Differenzen aus asynchroner Bot-Autorität, keine defekten Canonical-Werte nachgewiesen. 3 reale Server1-Charaktere hinsichtlich Inventory/Gold/Harz 3/3 konsistent. Beta 23/24 mit Kern-Guards; 1 Profil onboardingbezogen offen.
- **Backend-Code geändert:** `public` (Beta) + `server1` Gold-, Harz- und Item-Save-Trigger-Owner überschreiben niemals mehr autoritatives Geld/Items aus einem Client-Komplettsave. Details: `ops/database/v8284_authoritative_save_guards.sql`.
- **Historie neu:** `recovery_private` Beta + `server1_private` Server1, 4 private kanonische Audit-Trigger pro Server: Gold/Harz/Level/XP; kompletter Itemstate; Grow/Seeds/Plants; Build/Talente. Exaktes JSON `before_state`/`after_state` plus `txid`, `actor_uid`, Zeit und Revision. SQLite/LocalStorage dient nicht als Nachweis. SQL-Code: `ops/database/v8285_authoritative_value_history.sql`.
- **Geprüft:** Beta- und Server1-Subtransaktions-Regressionsproben für alle vier Owner ohne persistierende Testwertänderung; Live-Audit protokolliert echte Build-, Seed- und Wallet-Fortschritte. Vollständige Android-Endtestmatrix für alle kaufbaren Flows NICHT abgeschlossen.
- **Offen:** gezielte App-/RPC-Sicherheitsprüfung sämtlicher Kaufrouten; Handy-Performance direkt nach Tower/Attributhydration; Bot-Legacy-Mirror-Synchronisation; Ereignis-Watchdog/Alerts für verdächtige Voll-Resets; Audit-Archiv/Retention; Beta-Neuprofil ohne vollständigen Kernstate; accountübergreifende Kauf-/RPC-Replay-Tests. Keine absolute Verlustfreiheit behaupten.

V8.286 Legacy-Mirror-Nachkontrolle: public/server1.v7043_mirror_domains_from_save enthält noch historische Rückschreibpfade aus vollständigem Save für die Betriebsart `mirror`; aktuelle 54 Server1-/23 Beta-Domäneneinträge für Progress/Items/Seeds/Quest/Dungeon/Pets alle `enforce`, daher kein aktuell aktivierter Import. Vor Wiederaktivierung der Betriebsart mirror muss die Funktion separat gehärtet/entfernt werden, ohne New-Account-Cutover zu brechen. Historisches Beta-Haxxar Level 1 besitzt keinen Save und noch keinen vollständigen Kernstate. Produktivlauf von 3 echten S1-Charakteren konsistent; neue Audit-Historie protokolliert bereits echte Mutationen. Kauf-/Serverpfad-Quittungen 6/6 mit Harz-Ledger konsistent.


V8.287 – Aktive tägliche Verlustwache
- Beta und Server1: getrennte private Verlustscanner für V8.285-Audit-Änderungen eingerichtet. Täglich 06:05/06:10 UTC über pg_cron, Check der verdächtigen Item-, Gold-, Harz-, Plant- und Talentverluste. Private Duplikat-geschützte Alerts; keine Auto-Reparatur oder Itemgenerierung.
- Teststatus: synthetische FULL_ITEM_WIPE sowie Gold-/Harz-Verlustwarnungen in beiden Schemata durch DB-Testtransaktionen geprüft und zurückgerollt; echte erste Server1-Prüfung 30 Events, 0 neue Verdachtsfälle. ChatGPT automatische Alarmwache täglich ca. 09:00 Berlin nur bei Anomalie oder ausbleibender Cron-Ausführung.
- SQL-Owner jetzt unter ops/database/v8287_daily_loss_watch.sql versioniert. Die Sicherheitswache ist aktiviert, mobile End-to-End-Matrix und eventbasierte Live-Alarme sind dennoch weiter offen.


## 09.10.2026 – V8.298 Beta/Server1-Paritätsprüfung
- GitHub `main`: `beta.html` und `server1.html` laden je 1358 JS-/CSS-Dateien, davon 1356 identische Assetpfade. Erwartete exklusive Includes: Beta i18n-Audit/Anonym-Preboot, Server1 Release-Channel und Bot-Admin. 84 gemeinsame Assets haben unterschiedliche `?v`-Cachekennungen, aber denselben kanonischen Dateipfad. Keine pauschale Cache-Neuladung ausgelöst.
- ECHTER Backend-Rückstand von V8.254 korrigiert: `recovery_private.v7049_run_dungeon_core` (Beta) enthält jetzt denselben `random()::numeric`-Cast und `#variable_conflict use_variable` wie `server1_private.v7049_run_dungeon_core`; sonstiger Funktionskörper nach Schema-Normalisierung exakt gleich. Direkte kanonische Funktion ersetzt, keine zusätzliche Patch-Schicht. Migration `v8298_beta_dungeon_canonical_owner_parity`, Repo-Quelle `ops/database/v8298_beta_dungeon_canonical_owner_parity.sql`.
- Zweite Quittungs-Metadatenabweichung bereinigt: `server1.v8195_vip_claim_daily` verwendet jetzt für Nachholtruhen-Harz-Event-`source_ref` denselben Banktage-Suffix wie Beta statt des aktuellen Kalendertags. Event-ID, Beträge, Belohnungen, Lock, Atomizität, Rechte und Spielerbestand unverändert. Migration `v8298_server1_vip_chest_source_ref_parity`, Quelle `ops/database/v8298_server1_vip_chest_source_ref_parity.sql`.
- LIVE READ-ONLY Post-QA: `dungeon_exact_parity=true`, `beta_dungeon_fixes_present=true`, `s1_vip_ledger_parity=true`, `shop_reroll_exact_parity=true`, `vip_state_exact_parity=true`. Kein Echtgeld- oder Kampf-Durchlauf für diese Verifikation ausgelöst.
- Ausnahmen bleiben bewusst: Klassenbalance getrennt und unangetastet; 50 Bot-Spielerkonten/Gilden/Auto-Worker gehören zum Server1-Betrieb, NICHT ungeprüft auf Beta übertragen; Serverdaten und Authority-Schemas isoliert. Vollständige Feature-/Mobile-/Cloudflare-Runtimeparität ist ohne Android- und Live-Endtests nicht bewiesen.


### V8.301 – Grow-Cup-Startseitenanzeige (09.10.2026)
- Frontend-Befund: Renderer `js/features/home/beta/v8009-home-renderer.js` hatte `growCupEventActive()` via `v8210GrowCupSnapshot().run.status==='active'` irrtümlich von einem **individuellen unvollendeten** Donnerstags-Cup abhängig gemacht, selbst am Freitag bei Backend `active:false`.
- Kanonischer Fix: Ausschließlich berechneter Berlin-Event-Zeitplan steuert Status-Kachel und Startseiten-Spezialkarte; Donnerstag sichtbar, Freitag/Samstag ausgeblendet. Nicht auf Cup-Daten, Spieler-Saves, Belohnungen oder Balance zugegriffen.
- Beta/Server1: HTML-Cache-Bust jeweils `?v=8301cup-active-schedule`. Regression im vorhandenen Home-Events-Browser-QA-Skript ergänzt; isolierter JS-Funktionstest und HTML-Referenzen geprüft (PASS), echter Android/Playwright-Lauf ausstehend.


### V8.302 – Grow-Cup-Historie / Menü / Ranking-Claim (09.10.2026)
- Nach dem Donnerstags-Event war die Cup-Kachel inaktiv (korrekt), aber es fehlte ein permanenter Eingang. Backend `v8210_growcup_state` suchte bei Nicht-Cup-Tagen nur noch eine `active` Runde, nicht mehr `completed`; Ergebnis/Claim-Fenster nicht erreichbar.
- Kanonische Owner geändert: `js/features/system/beta/v8009-s8-v4149-final-navigation-render-authority.js` (neuer, nur bei geladener Feature-Funktion sichtbarer Grow-Cup-Menüpunkt), `js/features/events/beta/v8198-runehunt.js` (im Ranking-Tab persönlicher Platz, Punkte, abgeschlossener Claimstatus, Claimbutton).
- Beide HTML-Skript-Cache-URLs gezielt aktualisiert: `8302cup-nav` und `8302cup-history`.
- Backend-Migration `v8302_growcup_history_state_both_worlds` für `public` / `server1` ist angewendet. Historien-Fallback beider Funktionen überprüft; Donnerstag-Neustart-Lobby bleibt erhalten; die Prämien-SQL-Funktion ist unverändert.
- Tests: JS Syntax für Menü/Cup **PASS**; HTML Pfade **PASS**; isolierter Claim-Button-State-Test **PASS** (final offen, final abgeholt, nicht final, Nichtteilnehmer). Echter Android-End-to-End-Claim bleibt zu testen. Keine Daten-/Reward-Veränderung.

### V8.303 – Dampf-Kauf nur serverseitig (09.10.2026)
- K3n3dr0: Ledger bestätigt 05:46 +2 Harz aus Grow-Auftrag, 05:51:27 -1 Harz für einen Dampf-Refill, 05:51:33 -7 Dampf durch nächste Quest. Kanonischer Stand anschließend 13 Dampf und 1 Harz. Zwei vorangehende UI-Käufe ohne verifizierte Buchung; Backup-Spielstand zeigt veraltete Werte.
- Bestehender Owner `js/features/quest/beta/v8009-s8-v294-dampf-canonical.js` geändert: lokaler Kauf-Fallback entfernt, nur `v7044_refill_dampf` darf Kauf ausführen. Vorher Quest- und Harz-Serverstand synchronisieren, parallele Käufe sperren, bei fehlgeschlagenem RPC keine lokale Kontobewegung.
- Beta/Server1 HTML Cacheversion jeweils `?v=8303dampf`. Backend/Preise/Questmechanik unangetastet.
- Isolierter Test PASS: Erfolg, Netzwerkfehler, nicht angemeldet, parallele Klicks. Android-End-to-End noch nicht bestätigt.
