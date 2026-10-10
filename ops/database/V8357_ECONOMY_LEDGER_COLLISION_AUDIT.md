# V8.357 – Economy ledger source_ref collision audit (READ-ONLY)

Date: 2026-10-10. Database: Grow Legends Supabase (project recorded in project settings). Scope: live schemas `server1`, `server1_private`, `public` (Beta), `recovery_private`. **This audit makes no changes to accounts, rewards, balances, tables, indexes, functions or application runtime.**

## Coverage and method

- Introspected all 1,487 SQL functions across the four game schemas: public 515, recovery_private 227, server1 515, server1_private 230.
- Examined UNIQUE index definitions for reward/event tables (gold, Harz, XP, seeds, pets, item ledgers and claim receipts) in both game schemas.
- Extracted and parsed 140 direct player-event INSERT statements from 83 functions under server1 + server1_private that reference gold/Harz/seed/XP/pet ledgers. Automated checks distinguished constant references from day/week/record/draw/request references; inspected high-risk functional callsites to `v6358_server_award_gold/harz`. This is a broad static scan, **not** a complete proof of runtime behavior for every RPC or every implicit trigger/dynamic SQL path.
- Inspected live aggregated event history (no user IDs or purchase tokens copied into this report), comparing Beta and Server 1.

## Finding 1 – FIXED LIVE, Server 1: Blüten-Dealer Goldbündel [V8.356]

The original `server1.v7071_buy_grow_dealer` used constant `'grow_dealer:'||oid` as `source_ref` for every trade of the same offer, even on subsequent days. The server1 partial UNIQUE index on positive `player_gold_events(user_id,source_ref)` correctly rejected a second daily gold purchase. The production function has been replaced so all five reward ledger insert paths use `'grow_dealer:'||oid||':'||req`. Live metadata confirms five updated references, no static remnants, retained daily-claim and request-idempotency guards, no unique index removed. SQL backup: `ops/database/v8356_server1_grow_dealer_unique_trade_ledger_refs.sql`. User functional retest pending.

## Finding 2 – CONFIRMED CODE DEFECT, NOT FIXED: repeated Google Play purchases (Beta AND Server 1) [HIGH]

Functions:
- `server1.gl_credit_google_play_purchase(uuid,text,text,text,jsonb)`
- `public.gl_credit_google_play_purchase(uuid,text,text,text,jsonb)`

Both generate a **unique** `v_event_id := 'gplay_'||md5(p_purchase_token)` and protect the receipt using the shared `public.google_play_purchases` unique purchase token, but their positive Harz ledger entries use only:

- Server1: `source_ref='google_play:server1:'||p_product_id`
- Beta: `source_ref='google_play:beta:'||p_product_id`

Both `player_harz_events` tables have a positive-only UNIQUE index on `(user_id,source_ref)`. Consequently, a **second distinct Google Play purchase token for the same product by the same account** can violate the UNIQUE constraint, rolling back the credit function and leaving a paid purchase needing retry/reconciliation. This is a **proven static schema/code incompatibility**, **not** evidence of a confirmed lost payment. The database shows at least one such product booking in each server and no successful duplicate per player+product reference. No user IDs, tokens, order IDs, or private purchase payloads recorded.

**Proposed fix, not applied:** Change only the two trusted purchase functions' `source_ref` expressions to `'google_play:server1:'||v_event_id` and `'google_play:beta:'||v_event_id` respectively. Preserve purchase token acquisition/validation, server isolation checks, `v_event_id` idempotency and advisory lock, user/amount validation, all indexes, and all other function statements. Test duplicate-token replay returns `alreadyProcessed=true` with 0 extra Harz, while distinct tokens for the same SKU both credit exactly once. Also reconcile any verified paid tokens whose credit failed prior to the fix using existing authoritative receipts; never guess or issue blind player grants. Because this is an active real-money credit path, prioritize deployment after explicit authorization and QA verification.

## Other high-priority samples with no identical reuse established

- `server1.v8011_harz_machine_play` (and public counterpart): each drawing uses a fresh UUID, reward slots append their index; unique gold/Harz/seed references are scoped to the draw and slot. No constant cross-draw reference found.
- `server1.v6359_claim_daily_login`: source references contain a Berlin day and reward type. The daily award guard enforces one claim a day.
- `server1.v6359_weekly_award_reward_for`: reward `source_ref` includes the weekly cycle and reward ID. `v6359_weekly_chest_rewards_for` currently creates one reward each with distinct IDs gold/fragments/time/material/seed/harz/gear, so the one-event-per-type-per-week `event_id` is compatible with current reward generation. Recheck if the weekly chest starts giving multiple rewards of the same type.
- `server1.v6359_claim_tower_placement`: use placement week key and matching claim table.
- `server1.v6358_harvest_grow`, `server1.v6359_run_endgame`, `server1_private.v7215_ad_bag_apply_for`: event or provider-event scoped IDs in reviewed entries.
- `server1.v7062_sell_item`, `server1.v8100_sell_materials`, `server1.v7097_buy_shop_item`: request ID used for ledger bookkeeping.
- `server1.v7129_claim_referral_grand`: deliberate one-time static reference `referral:grand` with `grand_claimed_at` guard; **not** the recurring-bonus pattern.
- `server1.v8195_vip_claim_daily`: banked day-list contributes to event suffix; no static product-only reference pattern in reviewed code.
- `server1.v6359_grow_dealer_action_legacy_v7087`: dealer ledger references incorporate the dealer day and offer ID; separately evaluate legacy path activation if changing authority modes.

## Guardrails / next work

1. Do not remove the UNIQUE indexes to suppress errors; they detect duplicate rewards.
2. Do not auto-credit unconfirmed purchases or manipulate live player balances during an audit.
3. Fix Google Play purchase ledger references **in the authoritative SQL functions**, stage and verify first, then migrate both worlds separately.
4. Follow up on original-user trade acceptance for V8.356 and independent test purchases for Google Play.
5. Keep any further audit or corrective migration in `V8_CURRENT_STATUS.md` and `V8009_PAGE_TAB_AUDIT_MATRIX.md`.

**Audit status:** Blüten-Dealer fixed server1, Google Play repeated-SKU vulnerability in BOTH databases awaits correction, other reviewed recurrent economy event paths no further definitively identical static source reference detected; global correctness is not certified.
