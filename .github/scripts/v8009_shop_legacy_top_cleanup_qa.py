from pathlib import Path
import json,re
p=Path("js/features/shop/beta/v8009-s1-v7063-server-shop-forge-auto-bridge.js")
txt=p.read_text(encoding="utf-8")
checks={
 "prune_function_present":"function pruneLegacyShopTop()" in txt,
 "canonical_hero_guard":"v461ShopHero" in txt and "while(n&&n!==hero)" in txt,
 "rarity_hint_text_pruned":"werte steigen jetzt klar mit der seltenheit" in txt.lower(),
 "legacy_bork_header_pruned":"händler von grünhain" in txt.lower() or "haendler von gruenhain" in txt.lower(),
 "prune_before_render":"pruneLegacyShopTop();\n  if(!window.v7081UseAuthority" in txt,
 "prune_after_render":"const r=rawRenderShop.apply(this,arguments);\n  pruneLegacyShopTop();" in txt,
 "hero_still_required":"document.getElementById('v461ShopHero')" in txt,
 "weapon_grid_still_required":"document.getElementById('v057WeaponGrid')" in txt,
 "magic_grid_still_required":"document.getElementById('v057MagicGrid')" in txt
}
payload={"build":"V8.009-SHOP-LEGACY-TOP-CLEANUP-QA","checks":checks,"ok":all(checks.values())}
Path("V8009_SHOP_LEGACY_TOP_CLEANUP_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not payload["ok"]:raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
