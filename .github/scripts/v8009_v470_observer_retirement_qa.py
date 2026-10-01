from pathlib import Path
import json,re
p=Path("js/features/character/beta/v8009-s4-v470-character-slot-art-canonical-comparison.js")
txt=p.read_text(encoding="utf-8")
checks={
 "no_mutation_observer_ctor": "new MutationObserver" not in txt,
 "render_inventory_hook": "__v470InventoryWrapped" in txt and "renderInventory=function" in txt,
 "equip_hook": "__v470EquipWrapped" in txt,
 "unequip_hook": "__v470UnequipWrapped" in txt,
 "character_navigation_hook":"growlegends:navigation-open-v7119" in txt,
 "observer_flags_retired":"__V470_SLOT_OBSERVER__='retired'" in txt and "__V470_COMPARE_OBSERVER__='retired'" in txt
}
payload={"build":"V8.009-V470-OBSERVER-RETIREMENT-QA","checks":checks}
Path("V8009_V470_OBSERVER_RETIREMENT_QA.json").write_text(json.dumps(payload,indent=2)+"\n",encoding="utf-8")
if not all(checks.values()):
 raise SystemExit(json.dumps(payload))
print(json.dumps(payload))
