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

def deterministic_tape(seed, size=1024):
    # Same intent as the existing PvP parity tape: deterministic, reproducible,
    # and independent from Python's global random state.
    x=(int(seed)&0x7fffffff) or 1
    out=[]
    for _ in range(size):
        x=(1103515245*x+12345)&0x7fffffff
        out.append(x/2147483648.0)
    return out

def matchup_plan(samples_per_direction=1000):
    rows=[]
    for level in LEVELS:
        for attacker in CLASSES:
            for defender in CLASSES:
                if attacker==defender:
                    continue
                rows.append({
                    "level":level,
                    "attacker":attacker,
                    "defender":defender,
                    "samples":samples_per_direction,
                    "seed_base":level*100000 + CLASSES.index(attacker)*10000 + CLASSES.index(defender)*1000,
                })
    return rows

CLASS_MODULES={
    cls:{
        "owner":SERVER_OWNERS[cls],
        "required_mechanics":sorted(REQUIRED_MECHANICS[cls]),
        "parity_reference_green":PARITY_BASELINE[cls]["green"],
        "parity_reference_reports":PARITY_BASELINE[cls]["reports"],
    }
    for cls in CLASSES
}

def engine_manifest(samples_per_direction=1000):
    plan=matchup_plan(samples_per_direction)
    return {
        "version":VERSION,
        "status":"MATCHUP_ENGINE_SCAFFOLD_READY",
        "read_only":True,
        "levels":list(LEVELS),
        "classes":list(CLASSES),
        "ordered_matchups_per_level":len(CLASSES)*(len(CLASSES)-1),
        "total_ordered_matchups":len(plan),
        "samples_per_direction":samples_per_direction,
        "total_fights_when_unlocked":len(plan)*samples_per_direction,
        "both_directions":True,
        "deterministic_rng":True,
        "equal_budget":True,
        "class_modules":CLASS_MODULES,
        "canonical_winrate_ready":False,
        "publish_blocker":"MODEL_PARITY_PENDING",
    }

def publishable_result(result):
    # Hard guard: no synthetic win rate can be marked canonical until every
    # class module has passed trace parity against canonical server references.
    if not result.get("all_class_modules_parity_green",False):
        return {
            "status":"BLOCKED",
            "canonical_winrate_ready":False,
            "reason":"all five class modules must pass trace/RNG parity first",
        }
    return result

SOURCE_MODULES={
    "grower":{
        "source":"js/features/talents/beta/v8009-s1-v319-exact-talents-dungeon-balance.js",
        "implemented_mechanics":sorted(REQUIRED_MECHANICS["grower"]),
    },
    "scout":{
        "source":"js/features/talents/beta/v8009-s1-v319-exact-talents-dungeon-balance.js",
        "implemented_mechanics":sorted(REQUIRED_MECHANICS["scout"]),
    },
    "bruiser":{
        "source":"js/features/talents/beta/v8009-s1-v319-exact-talents-dungeon-balance.js",
        "implemented_mechanics":sorted(REQUIRED_MECHANICS["bruiser"]),
    },
    "frost":{
        "source":"js/features/character/beta/v8009-s2-v4155-frost-talents.js",
        "implemented_mechanics":sorted(REQUIRED_MECHANICS["frost"]),
    },
    "summoner":{
        "source":"js/features/combat/beta/v8009-s1-v6287-harzruferin.js",
        "implemented_mechanics":sorted(REQUIRED_MECHANICS["summoner"]),
    },
}

def module_gate_status():
    out={}
    for cls in CLASSES:
        implemented=set(SOURCE_MODULES[cls]["implemented_mechanics"])
        missing=sorted(REQUIRED_MECHANICS[cls]-implemented)
        out[cls]={
            "source":SOURCE_MODULES[cls]["source"],
            "mechanics_complete":not missing,
            "missing_mechanics":missing,
            "trace_parity_green":False,
            "status":"SOURCE_COMPLETE_PARITY_PENDING" if not missing else "SOURCE_INCOMPLETE",
        }
    return out

def blocker_report():
    modules=module_gate_status()
    blockers=[]
    for cls,v in modules.items():
        if not v["mechanics_complete"]:
            blockers.append(f"{cls}: missing mechanics")
        if not v["trace_parity_green"]:
            blockers.append(f"{cls}: trace parity pending")
    return {
        "version":VERSION,
        "modules":modules,
        "blockers":blockers,
        "all_source_modules_complete":all(v["mechanics_complete"] for v in modules.values()),
        "all_class_modules_parity_green":all(v["trace_parity_green"] for v in modules.values()),
        "canonical_winrate_ready":False,
    }

SOURCE_TRACE_PARITY={
    "grower":{"suite":"V7.061","green":114,"reports":118},
    "scout":{"suite":"V7.061","green":32,"reports":44},
    "bruiser":{"suite":"V7.061","green":3,"reports":6},
    "frost":{"suite":"V7.061","green":18,"reports":44},
    "summoner":{"suite":"V7.050","green":8,"reports":9},
}

def source_trace_gate():
    out={}
    for cls in CLASSES:
        p=SOURCE_TRACE_PARITY[cls]
        out[cls]={
            **p,
            "green_ratio":round(p["green"]/max(1,p["reports"]),4),
            "canonical_source_trace_green":p["green"]>0,
            "synthetic_module_trace_green":False,
        }
    return {
        "classes":out,
        "all_canonical_sources_have_green_trace":all(v["green"]>0 for v in SOURCE_TRACE_PARITY.values()),
        "all_synthetic_modules_trace_green":False,
        "next_blocker":"EXTRACT_CANONICAL_CLASS_MODULES_INTO_PARAMETERISED_ENGINE",
        "canonical_winrate_ready":False,
    }

BALANCE_SCENARIOS={
    "baseline":{
        "grower_tank":{
            "hp_milestones":[0.10,0.15],
            "full_branch_permanent_dr":0.087,
            "second_wind":0.15,
            "lethal_save":True,
        }
    },
    "tank_minimal_nerf_v1":{
        "grower_tank":{
            "hp_milestones":[0.05,0.05],
            "full_branch_permanent_dr":0.05,
            "second_wind":0.15,
            "lethal_save":True,
        }
    },
}

def scenario_manifest(name):
    if name not in BALANCE_SCENARIOS:
        raise KeyError(name)
    return {
        "version":VERSION,
        "scenario":name,
        "config":BALANCE_SCENARIOS[name],
        "live_values_changed":False,
        "matrix_ready":False,
        "reason":"The previous provisional matrix artifact stores results only; "
                 "no reproducible full-class combat generator is committed yet. "
                 "Do not derive new win rates by rescaling old percentages.",
        "required_next_step":"wire parameterised class resolvers into executable matchup loop",
    }

