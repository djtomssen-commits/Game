#!/usr/bin/env python3
"""
V8.097 five-class balance fixture gate.

Purpose:
- keep synthetic class QA read-only;
- prevent incomplete neutral-target approximations from being reported as
  canonical PvP win rates;
- define the required contract for a future parameterised resolver.

This file intentionally does NOT mutate live player/profile data.
"""
import json

VERSION="V8.097"
CLASSES=("grower","scout","bruiser","frost","summoner")
LEVELS=(100,200,300)

# Canonical server owners discovered during the audit.
SERVER_OWNERS={
    "grower":"recovery_private.v7056_standard_pvp_shadow_simulate",
    "scout":"recovery_private.v7056_standard_pvp_shadow_simulate",
    "frost":"recovery_private.v7056_standard_pvp_shadow_simulate",
    "bruiser":"recovery_private.v7055_bruiser_shadow_simulate",
    "summoner":"recovery_private.v7052_pvp_shadow_simulate",
}

# Minimum mechanics that must be present before a synthetic matchup can be
# labelled canonical-equivalent.
REQUIRED_MECHANICS={
    "grower":{"damage","crit","wucht","rage_multi","lifesteal","tank_reduce","regen","reflect","lethal_save"},
    "scout":{"damage","crit","double_hit","triple_hit","dodge","counter","execute","salvo_chain"},
    "bruiser":{"damage","crit","crit_chain","explosion","dot","shield","damage_reduce","dot_heal"},
    "frost":{"damage","crit","frost_marks","shatter","offhand","lifesteal","barrier","reflect","soul_harvest"},
    "summoner":{"damage","crit","curse_dot","summon","second_summon","bud_heal","spore_dot","prevent_lethal"},
}

PARAMETER_CONTRACT={
    "level":"1..300",
    "combat_power":">0",
    "max_hp":">0",
    "base_crit":"0..1",
    "equipment_budget":"normalised numeric budget",
    "weapon_range":"min/avg/max, midpoint must equal neutral factor 1.0",
    "talents":"canonical rank map",
    "set_bonuses":"canonical resolver input",
    "pet_bonuses":"canonical resolver input",
    "rng":"deterministic tape shared by both sides",
}

def validate_model(model):
    errors=[]
    if set(model.get("classes",()))!=set(CLASSES):
        errors.append("all five classes are required")
    mechanics=model.get("mechanics",{})
    for cls in CLASSES:
        have=set(mechanics.get(cls,()))
        missing=sorted(REQUIRED_MECHANICS[cls]-have)
        if missing:
            errors.append(f"{cls}: missing mechanics: {', '.join(missing)}")
    if not model.get("deterministic_rng",False):
        errors.append("deterministic shared RNG tape required")
    if not model.get("equal_budget",False):
        errors.append("equal item/stat budget required")
    if not model.get("both_directions",False):
        errors.append("both matchup directions required")
    return errors

def audit_manifest():
    return {
        "version":VERSION,
        "read_only":True,
        "levels":LEVELS,
        "classes":CLASSES,
        "owners":SERVER_OWNERS,
        "parameter_contract":PARAMETER_CONTRACT,
        "required_mechanics":{k:sorted(v) for k,v in REQUIRED_MECHANICS.items()},
        "status":"GATE_ONLY",
        "canonical_winrate_ready":False,
        "reason":"Existing server Shadow RPCs depend on persisted profile/build/item state. "
                 "A synthetic resolver may only publish win rates after it implements every "
                 "required class mechanic with a deterministic shared RNG tape.",
    }

if __name__=="__main__":
    print(json.dumps(audit_manifest(),indent=2,sort_keys=True))

PARITY_BASELINE={
    "grower":{"green":136,"reports":145},
    "scout":{"green":31,"reports":40},
    "bruiser":{"green":24,"reports":32},
    "frost":{"green":25,"reports":57},
    "summoner":{"green":5,"reports":5},
}

TRACE_EVENT_FIELDS=(
    "round","actor","damage","heal","crit","dodge",
    "offhand","counter","attackerHp","defenderHp","rng_used"
)

RNG_CONTRACT={
    "tape":"deterministic shared sequence",
    "consumption":"strict order, no hidden random calls",
    "comparison":"rng_consumed must match canonical shadow trace exactly",
    "round_limit":30,
    "timeout_winner":"higher remaining HP ratio",
}

def trace_gate():
    ratios={k:round(v["green"]/max(1,v["reports"]),4) for k,v in PARITY_BASELINE.items()}
    return {
        "all_classes_have_green_reference":all(v["green"]>0 for v in PARITY_BASELINE.values()),
        "parity_baseline":PARITY_BASELINE,
        "green_ratio":ratios,
        "event_fields":TRACE_EVENT_FIELDS,
        "rng_contract":RNG_CONTRACT,
        "strictest_review_class":"frost",
        "canonical_winrate_ready":False,
        "status":"MODEL_PARITY_PENDING",
    }

