from pathlib import Path
import re,json
ROOT=Path(".")
files={
"v089":"js/features/shop/beta/v8009-s9-v089-shop-comparison.js",
"v090":"js/features/shop/beta/v8009-s10-v090-shop-comparison-fix.js",
"v138":"js/features/shop/beta/v8009-s12-v138-shop-match-inventory.js",
"v139":"js/features/shop/beta/v8009-s10-v139-real-shop-rarity-fix.js",
"v030":"js/features/shop/beta/v8009-a1-shops-gems-enchants.js",
"v054":"js/features/shop/beta/v8009-a2-reliable-buying-feedback.js",
"v056":"js/features/shop/beta/v8009-a1-shop-stat-separation.js",
"v057":"js/features/shop/beta/v8009-a1-clean-shop-core.js",
"v464":"js/features/shop/beta/v8009-s6-v464-shop-reference.js",
"v466":"js/features/shop/beta/v8009-s1-v466-all-item-art-purchase-fix.js",
"v475":"js/features/shop/beta/v8009-s4-v475-shop-polish.js",
"v7063":"js/features/shop/beta/v8009-s1-v7063-server-shop-forge-auto-bridge.js",
}
txt={k:(ROOT/v).read_text(encoding="utf-8") for k,v in files.items()}
global_render_re=re.compile(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b')
checks={
 "v089_no_global_render":not global_render_re.search(txt["v089"]),
 "v090_no_global_render":not global_render_re.search(txt["v090"]),
 "v138_no_global_render":not global_render_re.search(txt["v138"]),
 "v139_no_global_render":not global_render_re.search(txt["v139"]),
 "v030_no_global_render":not global_render_re.search(txt["v030"]),
 "v054_no_global_render":not global_render_re.search(txt["v054"]),
 "v056_no_global_render":not global_render_re.search(txt["v056"]),
 "v057_no_global_render":not global_render_re.search(txt["v057"]),
 "v464_no_global_render":not global_render_re.search(txt["v464"]),
 "v466_no_global_render":not global_render_re.search(txt["v466"]),
 "v475_polish_no_raf":"requestAnimationFrame(polishShop)" not in txt["v475"],
 "v475_nav_no_delay":"setTimeout(queue,20)" not in txt["v475"],
 "v7063_no_trailing_shop_timer":"shopPaintTimer" not in txt["v7063"],
 "v7063_view_signature":"shopViewSig" in txt["v7063"] and "sig===lastShopViewSig" in txt["v7063"],
 "v139_offer_still_active":"v057OfferHtml=v139ActualOffer" in txt["v139"],
 "v090_comparison_still_available":"function v090ComparisonHtml" in txt["v090"],
}
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
checks["zero_inline_js"]=len(re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?</script>',beta,re.I))==0
checks["zero_inline_css"]=len(re.findall(r'<style\b',beta,re.I))==0
payload={"build":"V8.009-SHOP-FLICKER-CONSOLIDATION-QA","checks":checks,"ok":all(checks.values())}
(ROOT/"V8009_SHOP_FLICKER_CONSOLIDATION_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not payload["ok"]: raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
