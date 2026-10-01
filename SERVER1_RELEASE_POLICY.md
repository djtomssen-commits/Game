# Grow Legends – Beta → Server 1 Release-Regel

## Grundregel

Ab jetzt gilt für alle normalen Änderungen:

- **Beta zuerst.**
- Neue Features, UI-Änderungen, Balance-Anpassungen und Bugfixes werden zuerst nur für Beta umgesetzt und getestet.
- **Server 1 wird nicht verändert**, solange Thomas nicht ausdrücklich die Freigabe gibt, z. B.:
  - „Beta ist getestet, auf Server 1 übernehmen.“
  - „Auf Server 1 veröffentlichen.“
  - „Server 1 aktualisieren.“

## Arbeitsweise

### Beta-Phase
- Entwicklung erfolgt auf dem aktuellen Arbeitsstand.
- `beta.html` und Beta-spezifische Owner dürfen geändert werden.
- Änderungen werden auf Beta getestet.
- Während dieser Phase keine Änderungen an `server1.html` und keine Server-1-spezifischen Release-Änderungen.

### Promotion auf Server 1
Erst nach ausdrücklicher Freigabe:

1. getesteten Beta-Stand bestimmen;
2. Delta zum aktuellen Server-1-Stand prüfen;
3. nur die freigegebenen Änderungen nach Server 1 übernehmen;
4. `GROW_RELEASE_CHANNEL='server1'`, Server-1-Daten/Charaktertrennung und servergebundene Regeln beibehalten;
5. Server-1-Smoke-Test durchführen;
6. stabilen Meilenstein/Status aktualisieren.

## Schutzregel für zukünftige Arbeiten

Ohne ausdrückliche Server-1-Freigabe gilt:
- `server1.html` **nicht anfassen**;
- `js/features/account/server1-release-channel.js` **nicht anfassen**;
- Server-1-spezifische Datenbank-/Release-Konfiguration **nicht anfassen**;
- gemeinsame Dateien nur dann ändern, wenn klar ist, dass die Änderung bewusst auch Server 1 betreffen darf. Ansonsten Beta-spezifischen Owner verwenden oder die Änderung hinter dem Beta-Channel halten.

## Aktuelle stabile Referenz

- Stabiler Rücksprungpunkt: `stable-server1-2026-10-01`
- Dieser Branch bleibt unverändert und dient nur als Referenz/Rollback-Basis.
