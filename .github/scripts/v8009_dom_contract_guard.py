from pathlib import Path
import re,json,collections
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
static_ids=re.findall(r'\bid=["\']([^"\']+)["\']',beta,re.I)

def js_ids(txt):
    out=[]
    # Literal id="..." inside querySelector/querySelectorAll/closest/matches is
    # a read-only selector, not a DOM producer.
    for m in re.finditer(r"\\bid=[\"']([A-Za-z0-9_:.\\-]+)[\"']",txt):
        pre=txt[max(0,m.start()-140):m.start()]
        if re.search(r'(?:querySelector(?:All)?|closest|matches)\\s*\\([^)]*$',pre,re.I):
            continue
        out.append(m.group(1))
    out+=re.findall(r"\\.id\\s*=\\s*[\"']([A-Za-z0-9_:.\\-]+)[\"']",txt)
    out+=re.findall(r"setAttribute\\(\\s*[\"']id[\"']\\s*,\\s*[\"']([A-Za-z0-9_:.\\-]+)[\"']",txt)
    return out


producers=collections.defaultdict(list)
for order,src in enumerate(srcs):
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    for i in sorted(set(js_ids(txt))):
        producers[i].append(src)

def only(idv,allowed,max_count=1):
    rows=producers.get(idv,[])
    return len(rows)<=max_count and all(x in allowed for x in rows)

contracts={}
contracts["no_static_duplicate_ids"]=all(v==1 for v in collections.Counter(static_ids).values())

m=re.search(r'<section id=["\']shop["\'] class=["\']screen["\']>([\s\S]*?)</section>',beta,re.I)
contracts["shop_static_root_only"]=bool(m) and not re.search(r'\bid=["\'](?!shop["\'])[^"\']+["\']',m.group(0),re.I)
contracts["shop_no_legacy_static_text"]=not re.search(r'Händler von Grünhain|Werte steigen jetzt klar mit der Seltenheit|Händlergasse',m.group(0) if m else '',re.I)

shop_owner={"js/features/shop/beta/v8009-s4-v461-shop-redesign.js"}
for idv in ["shopGold","shopHarz","v030MagicShop","v057GearShopCard","v057WeaponGrid","v057MagicGrid"]:
    contracts[f"shop_{idv}_single_owner"]=only(idv,shop_owner,1)

dampf_owner={"js/features/quest/beta/v8009-s6-v284-dampf-card-redesign.js"}
contracts["dampf_refill_single_owner"]=only("v026RefillBtn",dampf_owner,1)

header_owner={"js/features/ui/beta/v8009-s10-v358-global-header.js"}
for idv in ["v358Gold","v358Harz","v358Dampf","v358Power"]:
    contracts[f"header_{idv}_single_owner"]=only(idv,header_owner,1)

harz_owner={"js/features/ui/beta/v8009-s11-v283-resource-final-cleanup.js"}
contracts["harz_top_dynamic_single_owner"]=only("topHarz",harz_owner,1)

settings_owner={"js/features/ui/beta/v8009-s3-v141-settings-menu.js"}
for idv in ["v141AccountMail","v141CloudState","v141Logout","v141Delete","v141VersionLine"]:
    contracts[f"settings_{idv}_single_owner"]=only(idv,settings_owner,1)

wb_owner={"js/features/worldboss/beta/v8009-s5-v111-worldboss-visual-fix.js"}
for idv in ["v110Overlay","v110Phase","v110BossHpTxt","v110BossHp","v110PlayerHpTxt","v110PlayerHp","v110Cp","v110Attempts","v110Log","v110Fight","v110Cost","v111BossScene"]:
    contracts[f"worldboss_{idv}_single_owner"]=only(idv,wb_owner,1)

creator_allowed={
 "js/features/account/beta/v8009-s1-v200-stable-core.js",
 "js/features/account/beta/v8009-s1-v4136-account-save-owner.js",
 "js/features/account/beta/v8009-s4-v7229-server1-character-bootstrap.js"
}
for idv in ["v200CharacterModal","v200CharacterName","v200CharacterNameStatus"]:
    contracts[f"creator_{idv}_context_owners"]=only(idv,creator_allowed,3)

forbidden_shop_producers={
 "js/features/shop/beta/v8009-a1-shops-gems-enchants.js",
 "js/features/shop/beta/v8009-a1-clean-shop-core.js"
}
contracts["old_shop_renderers_no_longer_produce_shop_dom"]=all(
    not any(src in forbidden_shop_producers for src in producers.get(idv,[]))
    for idv in ["shopGold","shopHarz","v030MagicShop","v057GearShopCard","v057WeaponGrid","v057MagicGrid"]
)

payload={
 "build":"V8.009-DOM-CONTRACT-GUARD",
 "ok":all(contracts.values()),
 "contracts":contracts,
 "critical_producers":{k:producers.get(k,[]) for k in [
   "shopGold","shopHarz","v030MagicShop","v057GearShopCard","v057WeaponGrid","v057MagicGrid",
   "v026RefillBtn","v358Gold","v358Harz","v358Dampf","v358Power","topHarz",
   "v110Overlay","v110Fight","v111BossScene","v200CharacterModal"
 ]}
}
(ROOT/"V8009_DOM_CONTRACT_GUARD.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
if not payload["ok"]:
    raise SystemExit(1)
