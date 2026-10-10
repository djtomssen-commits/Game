# V8.358 – Google Play repeated product purchases: positive Harz ledger fix

Status **APPLIED AND VERIFIED** on Beta and Server 1 (2026-10-10).

## Root cause
The authoritative purchase-credit functions already derive a stable event ID from the unique verified Google Play purchase token. However, until V8.358 the positive Harz ledger referenced only the product/SKU. Since the unique (user_id, source_ref) index applies to positive Harz credits, purchasing the exact same SKU a second time with a DIFFERENT token could fail the transaction. This was a verified schema/code collision risk; no actual user loss was proven.

## Live migrations completed
- Beta: `v8358_beta_google_play_token_scoped_ledger_ref`
- Server 1: `v8358_server1_google_play_token_scoped_ledger_ref`

The live authoritative functions `public.gl_credit_google_play_purchase` and `server1.gl_credit_google_play_purchase` were both updated using their freshly fetched complete original definitions. Each has exactly one changed expression in the positive Harz event insert: source_ref now combines the existing server namespace with the existing **token-derived purchase event ID**, rather than with the product ID. This is the only change.

## Invariants retained
- The per-token Google receipt/transaction table and lock.
- Existing event-ID check for exact-token replay.
- Same-server validation and prevention of cross-account/product token reuse.
- Same permitted Harz denominations and product mapping.
- Trusted balance guard, atomic balance+event transaction and existing unique ledgers.
- No manual credit, refund, backfill, balance write outside the source function, or index removal.

## Post-migration database checks
- Fetched both live `pg_get_functiondef` definitions again: both now reference token-specific event ID; both old product-only reference expressions absent.
- Checked retained unique positive Harz-ledger indexes in `public` and `server1`.
- Checked both records present in `supabase_migrations.schema_migrations`.
- Read-only synthetic reference generation: three inputs A, B, A generate exactly two distinct ledger reference values on both servers. This proves same-token stability and different-token separation of the *reference expression*, not full Play billing.
- Counts at verification: 5 recorded historical Beta Google Play credit events, 1 recorded historical Server 1 event; 6 Google receipt records in shared receipt table. These historical entries were not changed.

## Follow-up
A new Google Play **test purchase of the same product twice using distinct valid purchase tokens**, plus repeat delivery of a previously processed token, must be verified on the respective servers. Expected: two independent purchased credits, exactly one credit per token, replay reported already processed and no extra Harz. Perform the validation using the ordinary trusted purchase verification pathway. Investigate any older purchase token with paid-but-not-credited status using authoritative purchase/ledger records, without blind grants. No new Android bundle or Cloudflare UI deployment is required for this SQL-only fix.

Companion audit: `ops/database/V8357_ECONOMY_LEDGER_COLLISION_AUDIT.md`. Recorded in `V8_CURRENT_STATUS.md` and `V8009_PAGE_TAB_AUDIT_MATRIX.md`.
