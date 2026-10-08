# Grow Legends · Admin Control Center (V8.291)

## Zugang

- Webseite: `/admin.html` auf **derselben Domain**, auf der die Worker-Build-Assets publiziert werden. Erwarteter Pfad nach erfolgreichem Deployment: `https://gamenew.djtomssen.workers.dev/admin.html`. Die Worker-Auslieferung ist in dieser Tool-Umgebung bisher **nicht live nachweisbar**; URL nicht als erfolgreich deployed behaupten.
- Login: bestehender Supabase-Benutzer mit E-Mail/Passwort; dessen auth.uid() muss in `public.game_admins` stehen. Beide Server referenzieren dieselbe Admin-Identität.
- Neues Konto ist nur ein Admin, wenn es serverseitig in `game_admins` freigeschaltet ist. Die Adresse selbst ist öffentlich erreichbar, aber **kein API-Datenzugang ohne gültigen Admin-Account**.
- Startserver immer **Beta**. Für Server 1 absichtlich manuell wechseln.
- Die App verwendet ausschließlich den bereits öffentlich für das Spiel verwendeten **Supabase Publishable Key**, niemals service_role oder geheime Schlüssel.

## Aktive Module

| Bereich | Funktionen |
|---|---|
| Übersicht | Charakteranzahl, Bots, verifizierte Google-Play-Belege, Events, Auditwarnungen, Quest-Chancen |
| Spielerakte | Charaktersuche, serverautoritatives Gold, Harz, Inventar, Ausrüstung, Itemrevision, Turm |
| Ökonomie | Positive Gold-/Harz-Gutschriften (0–100.000 Gold oder 0–250 Harz), verpflichtende Begründung und Bestätigung |
| Einstellungen | `quest_energy_harz_chance` 0–100 %, Default 50 %, auf 100 Quest-Dampf exakt 0/1 Harz; `quest_bonus_harz_chance` 0–25 %, Default 6,5 %, zusätzlicher Quest-Zufallsdrop |
| Sicherheit | Warnungen der täglichen Verlustprüfung und anonymisierungsschonend dargestellte Auditvorgänge |
| Events | Bestehende Zeiträume und Aktivierungsstatus **lesen** |
| Mitteilungen | Veröffentlichte Ankündigungen, Umfragen und Entwürfe **lesen** |
| Bots | Aktuelle Anzahl/Fehler/letzte Aktion **lesen** |
| System | Überwachung und ausgewählte Servermetriken **lesen** |

## Sicherheitsgarantien und Grenzen

- Befehlseigentümer: `public.v8290_admin_console` (Beta) / `server1.v8290_admin_console` (Server1). **Admin-UID-Prüfung bei jedem RPC**, nicht nur im Frontend. `anon` und `PUBLIC` keine Execute-Berechtigung.
- Admin-Aufträge werden in `recovery_private.v8290_admin_console_actions` / `server1_private.v8290_admin_console_actions` pro Server festgehalten; kein Zugriff von `authenticated` auf private Tabelle.
- Gutschriften nutzen nur die kanonischen serverseitigen Gold-/Harz-Award-Owner mit UUID-Idempotenz und Ledger, danach Cache-/Save-Mirror aus dem kanonischen Stand. Bei Timeout dieselbe Vorgangs-ID verwenden, **nicht einfach mehrfach neu abschicken**.
- Einstellungen nutzen einen Revisionsvergleich (CAS), begrenzte Werte, Grund und bestätigte Serverkennung. Settings sind in privaten servergetrennten Tabellen.
- Ungesicherte Operationen (Player löschen, kompletten Save zurückschreiben, Items direkt setzen, Klassenbalance auf Server1 ändern, Shops/Event-Schema direkt überschreiben, Reset, Server öffnen/schließen, APK/Play Store bauen) bewusst **nicht** als vermeintliche funktionsfähige Buttons umgesetzt.
- Cloudflare Deployment, E-Mail-/Passwort-Login im tatsächlichen Browser, MFA sowie SSL-/Cache-Verhalten müssen vor Produktionsfreigabe manuell getestet werden; das erfolgreiche SQL-/Stubs-Testprotokoll ersetzt keine reale Browser-QA.
- Bestehender Spielsitzungs-Storage-Key und Admin-Sitzungs-Storage-Key sind getrennt; beim Serverwechsel wird der ausgewählte Spieler zurückgesetzt.

## Deployment / QA

1. GitHub-Stand mit `admin.html`, `css/admin-control-center.css`, `js/admin-control-center.js` in denselben Cloudflare Worker-/Asset-Publishing-Prozess aufnehmen.
2. `/admin.html` in Browser und Android prüfen (HTML 200, CSS 200, JS 200, Supabase JS CDN geladen).
3. Login mit Admin, Non-Admin und abgemeldetem Benutzer testen. Kein Account außer `game_admins` darf Informationen lesen.
4. Beta: beide Quest-Settings testweise ändern, Spielquest durchführen, in Datenbank prüfen, danach Ausgangswerte bewusst wiederherstellen; Server1-Klassenbalance unverändert.
5. Beta: Supportgutschrift mit eindeutiger ID, Originalspielstand und Ledger prüfen; identische ID erneut senden → keine zweite Gutschrift. Für Live zunächst nur Daten lesen.
6. Browser-Abbrüche und Re-Login testen, besonders bei Gold-/Harz-Operationen.
7. Cloudflare-Cache des neuen Admin-Skripts sollte die Version `8291a1` verwenden.

## Nächste Ausbaustufen

- Eigene validierte Einstellungen für Quest/Elite-/Material-/Pet-Drops, Dungeon, Turm, PvP, Itemqualitäten, Schmiede, Händlerpreise, VIP/Harz-Automat, Growroom/Grow-Cup und Weltboss. Immer mit Beta-Regressionsprobe, Live-Freigabe und Audit.
- Support-/Ticketverwaltung, Push-/Ingame-Broadcast mit Vorabvorschau, Feature Flags, Serveröffnung, Bot-Aktionen sowie Server-/Play-Store-Deploymentkontrolle über dedizierte, abgesicherte Owner.
- MFA für Admin-Konten, zusätzliche Rate Limits, Alarmierung für Admin-Buchungen, zeitnahe Auditarchivierung/Backup sowie Vier-Augen-Prinzip für große Echtgeld-relevante Änderungen.

Verantwortliche Quellen: `ops/database/v8289_quest_dampf_harz_balance.sql`, `ops/database/v8290_admin_console_api.sql`, `ops/database/v8291_quest_admin_config_owners.sql`.
