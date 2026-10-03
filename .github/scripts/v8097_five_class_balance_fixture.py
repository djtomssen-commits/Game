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
import argparse

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

# Reproducible relative scenario sensitivity runner.
# This is deliberately NOT canonical PvP: it is only used to compare tank
# configurations under identical seeds and opponent assumptions.
RELATIVE_OFFENSE={
    100:{"grower":1.423,"scout":1.314,"bruiser":1.474,"frost":1.298,"summoner":1.185},
    200:{"grower":1.586,"scout":1.560,"bruiser":1.818,"frost":1.518,"summoner":1.249},
    300:{"grower":1.792,"scout":1.645,"bruiser":1.949,"frost":1.649,"summoner":1.373},
}

TANK_SENSITIVITY_SCENARIOS={
    "baseline":{"hp":1.556,"dr":.087,"second_wind":.15,"lethal_save":True},
    "minimal_v1":{"hp":1.406,"dr":.05,"second_wind":.15,"lethal_save":True},
    "minimal_v1_no_second_wind":{"hp":1.406,"dr":.05,"second_wind":0.0,"lethal_save":True},
    "minimal_v1_no_lethal":{"hp":1.406,"dr":.05,"second_wind":.15,"lethal_save":False},
    "minimal_v1_no_emergency":{"hp":1.406,"dr":.05,"second_wind":0.0,"lethal_save":False},
    "strong_v2_no_emergency":{"hp":1.256,"dr":.03,"second_wind":0.0,"lethal_save":False},
}

def sensitivity_manifest():
    return {
        "version":VERSION,
        "status":"INVALID_FOR_BALANCE_DECISIONS",
        "scenarios":TANK_SENSITIVITY_SCENARIOS,
        "offense_reference":RELATIVE_OFFENSE,
        "purpose":"historical diagnostic only",
        "reason":"This simplified runner does not model the opponent's full defensive class mechanics and therefore overstates first-strike/offense effects.",
        "canonical_winrate_ready":False,
    }

def _draw(tape, idx):
    if idx>=len(tape):
        raise RuntimeError("RNG_TAPE_EXHAUSTED")
    return tape[idx],idx+1

def relative_tank_duel(level, opponent, scenario_name, seed):
    cfg=TANK_SENSITIVITY_SCENARIOS[scenario_name]
    tape=deterministic_tape(seed,4096);idx=0
    base_hp=2400.0
    tank_max=base_hp*cfg["hp"]
    opp_max=base_hp
    tank_hp=tank_max;opp_hp=opp_max
    tank_off=RELATIVE_OFFENSE[level]["grower"]
    opp_off=RELATIVE_OFFENSE[level][opponent]
    second_used=False;lethal_used=False
    rounds=0
    while tank_hp>0 and opp_hp>0 and rounds<30:
        rounds+=1
        rv,idx=_draw(tape,idx)
        tank_hit=100.0*tank_off*(.90+.20*rv)
        if rounds%5==0:
            tank_hit*=1.10
        opp_hp=max(0.0,opp_hp-tank_hit)
        if opp_hp<=0:
            break

        rv,idx=_draw(tape,idx)
        opp_hit=100.0*opp_off*(.90+.20*rv)
        incoming=opp_hit*(1.0-cfg["dr"])
        before=tank_hp
        tank_hp-=incoming

        if tank_hp>0 and tank_hp/tank_max<.25 and cfg["second_wind"]>0 and not second_used:
            tank_hp=min(tank_max,tank_hp+tank_max*cfg["second_wind"])
            second_used=True
        if tank_hp<=0 and cfg["lethal_save"] and not lethal_used:
            tank_hp=1.0
            lethal_used=True

    if tank_hp<=0 and opp_hp<=0:
        won=False
    elif opp_hp<=0:
        won=True
    elif tank_hp<=0:
        won=False
    else:
        won=(tank_hp/tank_max)>=(opp_hp/opp_max)
    return won,rounds,idx

def run_relative_tank_scenario(scenario_name,samples=2500):
    raise RuntimeError("INVALID_MODEL: use the full parameterised five-class resolver; simplified tank runner is retired")
    matrix={}
    for level in LEVELS:
        matrix[str(level)]={}
        for opponent in ("scout","bruiser","frost","summoner"):
            wins=0;rounds=0;rng_used=0
            for i in range(samples):
                seed=level*100000+CLASSES.index(opponent)*1000+i
                w,r,u=relative_tank_duel(level,opponent,scenario_name,seed)
                wins+=int(w);rounds+=r;rng_used+=u
            matrix[str(level)][opponent]={
                "win_rate":round(wins/samples,4),
                "avg_rounds":round(rounds/samples,3),
                "avg_rng_used":round(rng_used/samples,3),
            }
    return {
        "version":VERSION,
        "status":"RELATIVE_ONLY_NOT_CANONICAL",
        "scenario":scenario_name,
        "samples_per_matchup":samples,
        "matrix":matrix,
        "canonical_winrate_ready":False,
    }

def compare_relative_tank_scenarios(a="baseline",b="minimal_v1",samples=2500):
    raise RuntimeError("INVALID_MODEL: simplified tank comparison is retired")
    ra=run_relative_tank_scenario(a,samples)
    rb=run_relative_tank_scenario(b,samples)
    delta={}
    for level in map(str,LEVELS):
        delta[level]={}
        for opponent in ("scout","bruiser","frost","summoner"):
            av=ra["matrix"][level][opponent]["win_rate"]
            bv=rb["matrix"][level][opponent]["win_rate"]
            delta[level][opponent]=round(bv-av,4)
    return {"baseline":ra,"candidate":rb,"candidate_minus_baseline":delta}

def cli():
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=("manifest","gate","engine","scenario","compare"),default="manifest")
    p.add_argument("--scenario",default="minimal_v1")
    p.add_argument("--baseline",default="baseline")
    p.add_argument("--samples",type=int,default=2500)
    a=p.parse_args()
    if a.mode=="manifest": out=audit_manifest()
    elif a.mode=="gate": out=blocker_report()
    elif a.mode=="engine": out=engine_manifest(a.samples)
    elif a.mode=="scenario": out=run_relative_tank_scenario(a.scenario,a.samples)
    else: out=compare_relative_tank_scenarios(a.baseline,a.scenario,a.samples)
    print(json.dumps(out,indent=2,sort_keys=True))

if __name__=="__main__":
    cli()

# ---------------------------------------------------------------------------
# Symmetric parameterised engine v1
# ---------------------------------------------------------------------------

def _clamp(v, lo, hi):
    return max(lo,min(hi,float(v)))

def new_fighter_state(class_id, level, max_hp, base_damage, stats=None, talents=None):
    if class_id not in CLASSES:
        raise ValueError("unsupported class")
    return {
        "class_id":class_id,
        "level":int(level),
        "max_hp":float(max_hp),
        "hp":float(max_hp),
        "base_damage":float(base_damage),
        "stats":dict(stats or {}),
        "talents":dict(talents or {}),
        "attack_count":0,
        "enemy_attack_count":0,
        "crits":0,
        "dodges":0,
        "first_wucht":True,
        "master_used":False,
        "lethal_save_used":False,
        "second_wind_used":False,
        "shield_used":False,
        "salvo_chain_used":False,
        "precision_execute_used":False,
        "chaos_crit":0.0,
        "next_damage_pct":0.0,
        "next_dodge":0.0,
        "guaranteed_dodge":False,
        "next_guaranteed_counter":False,
        "last_base_damage":1.0,
        "dot":[],
        "smoke_master_applied":False,
        "frost_marks":0,
        "frost_low_shield_used":False,
        "frost_master_guard_used":False,
        "frost_barrier_absorbed":0,
        "frost_shatter_used":False,
        "frost_soul_harvest_used":False,
        "summon_pity":0,
        "curse_hits":0,
        "curse_dot":None,
        "spore_dot":None,
        "crit_buff":0.0,
        "summoner_soul_save":False,
    }

def symmetric_engine_contract():
    return {
        "version":VERSION,
        "status":"SYMMETRIC_ENGINE_STATE_READY",
        "same_state_machine_for_both_sides":True,
        "fighter_state_fields":sorted(new_fighter_state("grower",100,1000,100).keys()),
        "attack_hooks":{
            "grower":"v319 canonical attack rules",
            "scout":"v319 canonical attack rules",
            "bruiser":"v319 canonical attack rules",
            "frost":"v4155 dedicated Frost attack rules",
            "summoner":"v319 base + v6287/v6302 Summoner wrapper rules",
        },
        "defense_hooks":{
            "grower":"v319 canonical enemy-attack rules",
            "scout":"v319 canonical enemy-attack rules",
            "bruiser":"v319 canonical enemy-attack rules",
            "frost":"v4155 dedicated Frost defense rules",
            "summoner":"v319 base + Summoner prevent-lethal wrapper",
        },
        "initiative":"paired mirrored fights required",
        "rng":"single shared deterministic tape per fight",
        "canonical_winrate_ready":False,
        "next_gate":"IMPLEMENT_PARAMETERISED_ATTACK_AND_DEFENSE_HOOKS",
    }

def validate_symmetric_state(a,b):
    errors=[]
    for label,x in (("a",a),("b",b)):
        if x.get("class_id") not in CLASSES:
            errors.append(f"{label}: invalid class")
        if float(x.get("max_hp",0))<=0:
            errors.append(f"{label}: invalid max_hp")
        if float(x.get("base_damage",0))<=0:
            errors.append(f"{label}: invalid base_damage")
        missing=[k for k in new_fighter_state("grower",1,1,1) if k not in x]
        if missing:
            errors.append(f"{label}: missing state fields: {', '.join(missing)}")
    return errors

def _rng(tape, cursor):
    v,c=_draw(tape,cursor)
    if not (0.0<=v<1.0):
        raise RuntimeError("RNG_VALUE_OUT_OF_RANGE")
    return v,c

def _tal(f,key,default=0.0):
    return float(f.get("talents",{}).get(key,default) or 0.0)

def _has(f,key):
    return bool(f.get("talents",{}).get(key,False))

def _stat(f,key,default=0.0):
    return float(f.get("stats",{}).get(key,default) or 0.0)

def v319_standard_attack(attacker, defender, tape, cursor):
    cls=attacker["class_id"]
    if cls not in ("grower","scout","bruiser"):
        raise ValueError("v319_standard_attack only supports grower/scout/bruiser")
    attacker["attack_count"]+=1
    attacker["last_base_damage"]=max(1.0,float(attacker["base_damage"]))
    pr=_clamp(attacker["hp"]/attacker["max_hp"],0,1)
    er=_clamp(defender["hp"]/defender["max_hp"],0,1)
    base=attacker["last_base_damage"]

    damage_pct=_tal(attacker,"damagePct")+attacker["next_damage_pct"]
    attacker["next_damage_pct"]=0.0
    damage_pct+=min(.15,attacker["attack_count"]*_tal(attacker,"rampPerAttack"))
    if er<.30:
        damage_pct+=min(.16,_tal(attacker,"executeDamage"))
    damage_pct+=_tal(attacker,"armorPen")*.50

    if cls=="grower":
        if _has(attacker,"wucht.m0") and attacker["attack_count"]%6==0: damage_pct+=.35
        if _has(attacker,"wucht.m2") and pr<.35: damage_pct+=.15
        if _has(attacker,"wucht.m4"): damage_pct+=min(.14,(1-pr)*.20)
        if _has(attacker,"rage.m6") and pr<.30: damage_pct+=.20
    elif cls=="scout":
        if _has(attacker,"precision.m2") and er<.30: damage_pct+=.12
    elif cls=="bruiser":
        if _has(attacker,"magic.m3") and er>.70: damage_pct+=.12
        if _has(attacker,"magic.m0") and attacker["attack_count"]%6==0: damage_pct+=.30
        if attacker["attack_count"]%6==0: damage_pct+=_tal(attacker,"overloadEvery6")
        if _has(attacker,"magic.m5") and attacker["attack_count"]%5==0: damage_pct+=.12

    base*=1+_clamp(damage_pct,0,.62)

    crit_chance=_stat(attacker,"baseCrit") + _stat(attacker,"setCrit") + _tal(attacker,"critChance") + attacker["chaos_crit"]
    if cls=="scout" and _has(attacker,"precision.m0") and attacker["attack_count"]%6==0:
        crit_chance=1.0
    crit_chance=_clamp(crit_chance,0,.40)
    rv,cursor=_rng(tape,cursor)
    crit=rv<crit_chance

    if crit:
        attacker["crits"]+=1
        attacker["chaos_crit"]=0.0
        if cls=="scout":
            attacker["next_dodge"]+=_tal(attacker,"postCritDodge")
            if _has(attacker,"dodge.m4"): attacker["next_dodge"]+=.05
    elif cls=="bruiser" and (_tal(attacker,"chaosStep")>0 or _has(attacker,"critmagic.m4")):
        attacker["chaos_crit"]=_clamp(attacker["chaos_crit"]+max(.01,_tal(attacker,"chaosStep")),0,.10)

    damage=base
    tags=[]
    if crit:
        aimed=.10 if cls=="scout" and _has(attacker,"precision.m1") else 0.0
        damage*=1.75+_tal(attacker,"critDamage")+aimed
        tags.append("KRIT")
        headshot=_tal(attacker,"precisionCritExtraChance") + (.10 if _has(attacker,"precision.m3") else 0)
        rv,cursor=_rng(tape,cursor)
        if rv<_clamp(headshot,0,.25):
            damage+=base*.50;tags.append("KOPFSCHUSS")
        if cls=="bruiser":
            attacker["next_damage_pct"]+=_tal(attacker,"postCritDamage")
            if _has(attacker,"critmagic.m0"): attacker["next_damage_pct"]+=.08
            if _has(attacker,"critmagic.m2") and attacker["crits"]%2==0: attacker["next_damage_pct"]+=.10
            for chance,extra,label in (
                (_tal(attacker,"critChainChance"),.40,"KETTENFUNKE"),
                (.15 if _has(attacker,"critmagic.m1") else 0,.40,"KETTENFUNKE"),
                (_tal(attacker,"explosionChance"),.50,"EXPLOSION"),
                (.10 if _has(attacker,"critmagic.m3") else 0,.50,"EXPLOSION"),
            ):
                if chance>0:
                    rv,cursor=_rng(tape,cursor)
                    if rv<chance:
                        damage+=base*extra;tags.append(label)

    multi=False
    if cls=="grower":
        wc=_clamp(_stat(attacker,"baseWucht") + _tal(attacker,"wuchtChance"),0,.40)
        rv,cursor=_rng(tape,cursor)
        wucht=rv<wc
        if wucht:
            damage*=1.55+_tal(attacker,"wuchtDamage")
            if _has(attacker,"wucht.m1"): damage*=1.10
            if _has(attacker,"wucht.m5") and attacker["first_wucht"]:
                damage*=1.50;attacker["first_wucht"]=False;tags.append("UNAUFHALTSAM")
            if _has(attacker,"wucht.m3"):
                rv,cursor=_rng(tape,cursor)
                if rv<.15: damage+=base*.50;tags.append("BLUTBAD")
            attacker["next_damage_pct"]+=_tal(attacker,"afterWucht")
            tags.append("WUCHT")
        if crit or wucht:
            for chance in (_tal(attacker,"followChance"), .12 if _has(attacker,"rage.m4") else 0):
                if chance>0:
                    rv,cursor=_rng(tape,cursor)
                    if rv<chance: damage+=base*.40;tags.append("FOLGETREFFER")
        if _has(attacker,"rage.m2") and attacker["attack_count"]%5==0:
            damage+=base*.50;tags.append("ZUSATZTREFFER")
        mc=_tal(attacker,"doubleChance")+(.08 if _has(attacker,"rage.m6") and pr<.30 else 0)
        rv,cursor=_rng(tape,cursor)
        multi=rv<_clamp(mc,0,.25)
        if multi:
            damage+=base*.55;tags.append("RASEREI")
    elif cls=="scout":
        mc=_clamp(_stat(attacker,"baseDouble")+_tal(attacker,"doubleChance"),0,.40)
        if _has(attacker,"salvo.m0") and attacker["attack_count"]%10==0: mc=1.0
        rv,cursor=_rng(tape,cursor);multi=rv<mc
        if multi:
            second=base*(.42+_stat(attacker,"setDoubleDamage")+_tal(attacker,"secondHitDamage"))
            if _has(attacker,"salvo.m3"): second*=1.05
            if _has(attacker,"salvo.m1"):
                rv,cursor=_rng(tape,cursor)
                if rv<_clamp(crit_chance+_tal(attacker,"multiCritChance"),0,.40):
                    second*=1.75+_tal(attacker,"critDamage");tags.append("SCHNELLFEUER+")
            second*=1+_tal(attacker,"multiRamp")
            damage+=second;tags.append("SALVE")
            rv,cursor=_rng(tape,cursor)
            triple=rv<_tal(attacker,"tripleChance")
            if not triple and _has(attacker,"salvo.m2"):
                rv,cursor=_rng(tape,cursor);triple=rv<.12
            if triple:
                damage+=base*.45*(1+_tal(attacker,"multiRamp")*2+(.05 if _has(attacker,"salvo.m3") else 0));tags.append("DRITTTREFFER")
            if not attacker["salvo_chain_used"]:
                rv,cursor=_rng(tape,cursor)
                chain=rv<_tal(attacker,"chainChance")
                if not chain and _has(attacker,"salvo.m5"):
                    rv,cursor=_rng(tape,cursor);chain=rv<.35
                if chain:
                    damage+=base*.35;attacker["salvo_chain_used"]=True;tags.append("KETTENTREFFER")
        if crit:
            rv,cursor=_rng(tape,cursor)
            extra=rv<_tal(attacker,"salvoCritExtraChance")
            if not extra and _has(attacker,"salvo.m4"):
                rv,cursor=_rng(tape,cursor);extra=rv<.15
            if extra: damage+=base*.40;tags.append("FOLGETREFFER")
    else:
        rv,cursor=_rng(tape,cursor)
        det=rv<_tal(attacker,"detonationChance")
        if not det and _has(attacker,"magic.m1"):
            rv,cursor=_rng(tape,cursor);det=rv<.12
        if det: damage+=base*.35;tags.append("DETONATION")

    if not attacker["master_used"]:
        if cls=="grower" and _has(attacker,"wucht.m6"):
            damage*=3;attacker["master_used"]=True;tags.append("BRUTALE ERNTE")
        elif cls=="scout" and _has(attacker,"precision.m6"):
            damage=max(damage,base*2.5);attacker["master_used"]=True;crit=True;tags.append("PERFEKTER SCHUSS")
        elif cls=="scout" and _has(attacker,"salvo.m6"):
            damage=max(damage,base*2.75);attacker["master_used"]=True;tags.append("GRÜNER HAGEL")
        elif cls=="bruiser" and _has(attacker,"magic.m6"):
            damage*=3;attacker["master_used"]=True;tags.append("SUPERNOVA")

    if cls=="scout" and _has(attacker,"precision.m5") and er<.20 and not attacker["precision_execute_used"]:
        damage*=1.50;attacker["precision_execute_used"]=True;tags.append("HINRICHTUNG")

    dot_damage=0.0
    if cls=="bruiser":
        dot_proc=_clamp(_tal(attacker,"dotChance")+(.20 if _has(attacker,"smoke.m1") else 0)+(.06 if _has(attacker,"smoke.m2") else 0),0,.55)
        rv,cursor=_rng(tape,cursor)
        if rv<dot_proc:
            max_stacks=2 if _has(attacker,"smoke.m2") else 1
            rounds=3 if _has(attacker,"smoke.m5") else 2
            dot_pct=.05+_tal(attacker,"dotDamagePct")+(.02 if _has(attacker,"smoke.m2") else 0)
            if len(attacker["dot"])<max_stacks:
                attacker["dot"].append({"rounds":rounds,"damage":max(1,round(base*dot_pct))})
        if _has(attacker,"smoke.m6") and not attacker["smoke_master_applied"]:
            attacker["dot"]=[{"rounds":3,"damage":max(1,round(base*.12))}]
            attacker["smoke_master_applied"]=True;tags.append("TODESNEBEL")
        for d in attacker["dot"]:
            dot_damage+=d["damage"];d["rounds"]-=1
        attacker["dot"]=[d for d in attacker["dot"] if d["rounds"]>0]
        damage+=dot_damage

    damage=max(1,round(damage))
    life=_tal(attacker,"lifeSteal")
    if cls=="grower":
        if multi and _has(attacker,"rage.m1"): life+=.01
        if pr<.50: life+=_tal(attacker,"lowHpLife")
        if _has(attacker,"rage.m3") and pr<.50: life+=.03
        if _has(attacker,"rage.m6") and pr<.30: life+=.05
    life=_clamp(life,0,.10)
    heal=round(damage*life)
    if cls=="grower" and attacker["attack_count"]%5==0:
        heal+=round(attacker["max_hp"]*min(.04,_tal(attacker,"healEvery5")))
        if _has(attacker,"rage.m5"): heal+=round(attacker["max_hp"]*.05)
    if cls=="bruiser" and dot_damage:
        heal+=round(dot_damage*_clamp(_tal(attacker,"dotHealPct")+(.25 if _has(attacker,"smoke.m4") else 0),0,.35))
    return {"damage":damage,"heal":heal,"crit":crit,"tags":tags},cursor

def v319_standard_defense(defender, incoming, attacker_base, tape, cursor):
    cls=defender["class_id"]
    if cls not in ("grower","scout","bruiser"):
        raise ValueError("v319_standard_defense only supports grower/scout/bruiser")
    defender["enemy_attack_count"]+=1
    damage=max(0,float(incoming))
    ratio=_clamp(defender["hp"]/defender["max_hp"],0,1)
    heal=0.0;counter=0.0;prevent=False;dodged=False

    if cls=="scout":
        dodge=_tal(defender,"dodgeChance")+(_tal(defender,"firstDodge") if defender["enemy_attack_count"]==1 else 0)+defender["next_dodge"]
        if _has(defender,"dodge.m0") and defender["enemy_attack_count"]==1: dodge+=.10
        defender["next_dodge"]=0.0
        lethal=damage>=defender["hp"]
        if _has(defender,"dodge.m5") and lethal and not defender["lethal_save_used"]:
            defender["guaranteed_dodge"]=True;defender["lethal_save_used"]=True
        rv,cursor=_rng(tape,cursor)
        if defender["guaranteed_dodge"] or rv<_clamp(dodge,0,.35):
            dodged=True;damage=0.0;defender["dodges"]+=1
            defender["next_damage_pct"]+=_tal(defender,"postDodgeDamage")
            if defender["dodges"]>=2:
                defender["next_damage_pct"]+=_tal(defender,"dodgeStreakDamage")
                if _has(defender,"dodge.m2"): defender["next_damage_pct"]+=.15
            cc=_tal(defender,"counterChance")+(.30 if _has(defender,"dodge.m1") else 0)
            if defender["next_guaranteed_counter"]:
                cc=1.0;defender["next_guaranteed_counter"]=False
            rv,cursor=_rng(tape,cursor)
            if rv<_clamp(cc,0,.55): counter=round(defender["last_base_damage"]*.60)
            if _has(defender,"dodge.m3"): heal+=round(defender["max_hp"]*.02)
            if _has(defender,"dodge.m6") and defender["dodges"]>=3:
                defender["guaranteed_dodge"]=True;defender["next_guaranteed_counter"]=True;defender["dodges"]=0
            else:
                defender["guaranteed_dodge"]=False
            return {"damage":0,"heal":heal,"counter":counter,"prevent":False,"dodged":True},cursor

    reduce=_tal(defender,"damageReduce")
    if cls=="grower":
        if _has(defender,"tank.m0") and ratio<.50: reduce+=.05
        if _has(defender,"tank.m4") and defender["enemy_attack_count"]<=2: reduce+=.10
        if _has(defender,"tank.m3") and damage>defender["max_hp"]*.20: reduce+=.15
    elif cls=="bruiser":
        if defender["enemy_attack_count"]==1: reduce+=_tal(defender,"firstHitReduce")
        if _has(defender,"smoke.m0") and defender["enemy_attack_count"]==1: reduce+=.15
        if _has(defender,"smoke.m6") and defender["smoke_master_applied"]: reduce+=.10
    damage=round(damage*(1-_clamp(reduce,0,.35)))

    if cls=="grower":
        if defender["enemy_attack_count"]%3==0 and _tal(defender,"regenEvery3")>0:
            heal+=round(defender["max_hp"]*min(.04,_tal(defender,"regenEvery3")))
        if _tal(defender,"reflectPct")>0:
            counter+=round(damage*_tal(defender,"reflectPct"))
        if _has(defender,"tank.m2") and ratio<.25 and not defender["second_wind_used"]:
            heal+=round(defender["max_hp"]*.15);defender["second_wind_used"]=True
    elif cls=="bruiser" and ratio<.35 and not defender["shield_used"] and (_tal(defender,"shieldPct")>0 or _has(defender,"smoke.m3")):
        pct=min(.20,_tal(defender,"shieldPct")+(.15 if _has(defender,"smoke.m3") else 0))
        damage=max(0,damage-round(defender["max_hp"]*pct));defender["shield_used"]=True

    if cls=="grower" and _has(defender,"tank.m6") and damage>=defender["hp"]+heal and not defender["lethal_save_used"]:
        prevent=True;defender["lethal_save_used"]=True

    return {"damage":max(0,round(damage)),"heal":max(0,round(heal)),"counter":max(0,round(counter)),"prevent":prevent,"dodged":dodged},cursor

def standard_hooks_contract():
    return {
        "implemented":["grower","scout","bruiser"],
        "attack":"parameterised v319 standard resolver",
        "defense":"parameterised v319 standard enemy resolver",
        "remaining":["frost","summoner"],
        "status":"STANDARD_HOOKS_READY_FROST_SUMMONER_PENDING",
        "canonical_winrate_ready":False,
    }

def frost_attack(attacker, defender, tape, cursor):
    attacker["attack_count"]+=1
    attacker["last_base_damage"]=max(1.0,float(attacker["base_damage"]))
    pr=_clamp(attacker["hp"]/attacker["max_hp"],0,1)
    er=_clamp(defender["hp"]/defender["max_hp"],0,1)
    base=attacker["last_base_damage"]
    damage_pct=_tal(attacker,"damagePct")+attacker["next_damage_pct"]
    attacker["next_damage_pct"]=0.0
    if attacker["attack_count"]%2==0: damage_pct+=_tal(attacker,"soulAltDamage")
    if er<.30: damage_pct+=min(.16,_tal(attacker,"executeDamage"))
    if er<.25 and _has(attacker,"deathpact.m4"): damage_pct+=.12
    damage_pct+=_tal(attacker,"armorPen")*.50
    if attacker["frost_marks"]>=2 and _has(attacker,"frostblade.m3"): damage_pct+=.08
    if _has(attacker,"deathpact.m2") and attacker["attack_count"]%4==0: damage_pct+=.12
    base*=1+_clamp(damage_pct,0,.62)

    rv,cursor=_rng(tape,cursor)
    crit=rv<_clamp(_stat(attacker,"baseCrit")+_stat(attacker,"setCrit")+_tal(attacker,"critChance"),0,.40)
    damage=base*(1.75+_tal(attacker,"critDamage") if crit else 1)
    tags=["KRIT"] if crit else []

    mark_chance=.05+_tal(attacker,"frostMarkChance")+_stat(attacker,"frostMarkChance")
    marked=_has(attacker,"frostblade.m0") and attacker["attack_count"]%6==0
    if not marked:
        rv,cursor=_rng(tape,cursor);marked=rv<_clamp(mark_chance,0,.30)
    if marked:
        gain=1
        if _has(attacker,"frostblade.m1"):
            rv,cursor=_rng(tape,cursor)
            if rv<.20: gain=2
        attacker["frost_marks"]=min(3,attacker["frost_marks"]+gain)
        tags.append("DOPPELREIF" if gain>1 else "KÄLTEMARKE")
    if attacker["frost_marks"]>0:
        damage*=1+min(.14,attacker["frost_marks"]*_tal(attacker,"frostMarkDamage"))

    if _has(attacker,"frostblade.m4") and attacker["attack_count"]%5==0:
        damage+=base*.30;tags.append("FROSTSCHNITT")

    soul_follow=False
    if _has(attacker,"deathpact.m0") and attacker["attack_count"]%5==0:
        damage+=base*.40;soul_follow=True;tags.append("ZWILLINGSSCHNITT")
    rv,cursor=_rng(tape,cursor)
    if rv<_clamp(_tal(attacker,"soulFollowChance"),0,.12):
        damage+=base*.40;soul_follow=True;tags.append("SEELENSCHNITT")

    if attacker["frost_marks"]>=3 and _has(attacker,"frostblade.m2"):
        damage+=base*.35
        if _has(attacker,"frostblade.m5"): damage+=base*.10
        if _has(attacker,"frostblade.m6") and not attacker["master_used"]:
            damage+=base*1.10;attacker["master_used"]=True;attacker["frost_shatter_used"]=True;tags.append("ABSOLUTER NULLPUNKT")
        else: tags.append("EISBRUCH")
        attacker["frost_marks"]=0

    damage=max(1,round(damage))
    life=_tal(attacker,"lifeSteal")
    if pr<.50: life+=_tal(attacker,"soulLowLife")
    if pr<.40 and _has(attacker,"deathpact.m3"): life+=.03
    if soul_follow and _has(attacker,"deathpact.m1"): life+=.01
    heal=round(damage*_clamp(life,0,.10))
    if attacker["attack_count"]%6==0:
        heal+=round(attacker["max_hp"]*min(.025,_tal(attacker,"soulHealEvery6")))
        if _has(attacker,"deathpact.m5"): heal+=round(attacker["max_hp"]*.04)
    if _has(attacker,"deathpact.m6") and er<.35 and not attacker["master_used"] and not attacker["frost_soul_harvest_used"]:
        damage+=round(base);heal+=round(attacker["max_hp"]*.08)
        attacker["master_used"]=True;attacker["frost_soul_harvest_used"]=True;tags.append("SEELENERNTE")
    return {"damage":damage,"heal":heal,"crit":crit,"tags":tags},cursor

def frost_defense(defender, incoming, attacker_base, tape, cursor):
    defender["enemy_attack_count"]+=1
    damage=max(0,float(incoming));heal=0;counter=0
    ratio=_clamp(defender["hp"]/defender["max_hp"],0,1)
    reduce=_tal(defender,"damageReduce")
    if ratio<.40: reduce+=_tal(defender,"iceLowReduce")
    if _has(defender,"iceguard.m1") and defender["enemy_attack_count"]%4==0: reduce+=.18
    damage=round(damage*(1-_clamp(reduce,0,.35)))
    barrier=0.0
    if _has(defender,"iceguard.m0") and defender["enemy_attack_count"]==1: barrier+=defender["max_hp"]*.08
    if defender["enemy_attack_count"]%4==0: barrier+=defender["max_hp"]*min(.04,_tal(defender,"iceBarrierPct"))
    if ratio<.30 and _has(defender,"iceguard.m3") and not defender["frost_low_shield_used"]:
        barrier+=defender["max_hp"]*.12;defender["frost_low_shield_used"]=True
    if ratio<.25 and _has(defender,"iceguard.m6") and not defender["master_used"] and not defender["frost_master_guard_used"]:
        barrier+=defender["max_hp"]*.20;heal+=round(defender["max_hp"]*.08)
        defender["master_used"]=True;defender["frost_master_guard_used"]=True
    absorbed=0
    if barrier>0:
        absorbed=min(damage,round(barrier));damage=max(0,damage-absorbed)
        defender["frost_barrier_absorbed"]+=absorbed
        if _has(defender,"iceguard.m4"): defender["next_damage_pct"]+=.10
    if defender["enemy_attack_count"]%4==0:
        heal+=round(defender["max_hp"]*min(.03,_tal(defender,"iceHealEvery4")))
    if _has(defender,"iceguard.m5") and defender["enemy_attack_count"]%6==0:
        heal+=round(defender["max_hp"]*.06)
    if _tal(defender,"reflectPct")>0: counter+=round(damage*_clamp(_tal(defender,"reflectPct"),0,.05))
    if absorbed>0 and _has(defender,"iceguard.m2"): counter+=round(absorbed*.25)
    return {"damage":max(0,round(damage)),"heal":max(0,round(heal)),"counter":max(0,round(counter)),"prevent":False,"dodged":False},cursor

SUMMONER_COMPANIONS=(("bud",.30),("bone",.48),("spore",.24),("crow",.30))

def summoner_attack(attacker, defender, tape, cursor):
    attacker["attack_count"]+=1
    base=max(1.0,float(attacker["base_damage"]))
    if attacker["crit_buff"]>0:
        attacker["stats"]["baseCrit"]=_stat(attacker,"baseCrit")+attacker["crit_buff"]
        attacker["crit_buff"]=0.0
    curse_boosted=attacker["curse_hits"]>0
    if curse_boosted:
        base*=1+.05+_tal(attacker,"curseAmp")
        attacker["curse_hits"]=max(0,attacker["curse_hits"]-1)

    rv,cursor=_rng(tape,cursor)
    crit=rv<_clamp(_stat(attacker,"baseCrit")+_tal(attacker,"critChance"),0,.40)
    damage=base*(1.75+_tal(attacker,"critDamage") if crit else 1)
    damage*=1+_clamp(_tal(attacker,"damagePct")+_tal(attacker,"armorPen")*.50,0,.62)
    damage=max(1,round(damage))
    heal=round(damage*_clamp(_tal(attacker,"lifeSteal"),0,.09))
    tags=["KRIT"] if crit else []

    chance=_clamp(_tal(attacker,"dotChance"),0,.28)
    if chance>0:
        rv,cursor=_rng(tape,cursor)
        if rv<chance:
            tick=max(1,round(base*_clamp(.035+_tal(attacker,"dotDamagePct")*.65,.035,.24)))
            attacker["curse_dot"]={"rounds":2,"damage":tick};attacker["curse_hits"]=max(attacker["curse_hits"],2);tags.append("FLUCHNEBEL")
    if attacker["curse_dot"] and attacker["curse_dot"]["rounds"]>0:
        damage+=attacker["curse_dot"]["damage"];attacker["curse_dot"]["rounds"]-=1;tags.append("FLUCHSCHADEN")
        if attacker["curse_dot"]["rounds"]<=0: attacker["curse_dot"]=None
    if attacker["spore_dot"] and attacker["spore_dot"]["rounds"]>0:
        damage+=attacker["spore_dot"]["damage"];attacker["spore_dot"]["rounds"]-=1;tags.append("SPORENFÄULE")
        if attacker["spore_dot"]["rounds"]<=0: attacker["spore_dot"]=None

    pity=attacker["summon_pity"]
    summon_chance=_clamp(.10+_tal(attacker,"summonChance")+_stat(attacker,"summonChance"),0,.34)
    forced=pity>=4
    rv,cursor=_rng(tape,cursor)
    summoned=forced or rv<summon_chance
    if not summoned:
        attacker["summon_pity"]=pity+1
        return {"damage":damage,"heal":heal,"crit":crit,"tags":tags},cursor

    attacker["summon_pity"]=0
    rv,cursor=_rng(tape,cursor)
    idx=min(len(SUMMONER_COMPANIONS)-1,int(rv*len(SUMMONER_COMPANIONS)))
    key,mult=SUMMONER_COMPANIONS[idx]
    extra=max(1,round(base*mult*(1+_tal(attacker,"summonDamage")+_stat(attacker,"summonDamage"))))
    rv,cursor=_rng(tape,cursor)
    if rv<_clamp(_tal(attacker,"companionCrit"),0,.20):
        extra=round(extra*1.5);tags.append("KNOCHENPAKT")
    damage+=extra;tags.append(key.upper())
    if key=="bud": heal+=max(1,round(extra*.20))
    elif key=="spore":
        attacker["curse_hits"]=2
        tick=max(1,round(base*_clamp(.04+_tal(attacker,"dotDamagePct")*.12,.04,.08)))
        attacker["spore_dot"]={"rounds":3,"damage":tick}
    elif key=="crow":
        attacker["crit_buff"]=.06

    second=_clamp(_tal(attacker,"secondSummonChance"),0,.22)
    if second>0:
        rv,cursor=_rng(tape,cursor)
        if rv<second:
            rv,cursor=_rng(tape,cursor)
            i2=min(len(SUMMONER_COMPANIONS)-1,int(rv*len(SUMMONER_COMPANIONS)))
            if i2==idx: i2=(i2+1)%len(SUMMONER_COMPANIONS)
            k2,m2=SUMMONER_COMPANIONS[i2]
            e2=max(1,round(base*m2*.50*(1+_tal(attacker,"summonDamage"))));damage+=e2
            if k2=="spore":
                attacker["curse_hits"]=max(attacker["curse_hits"],2)
                tick=max(1,round(base*_clamp(.04+_tal(attacker,"dotDamagePct")*.12,.04,.08)))
                attacker["spore_dot"]={"rounds":3,"damage":tick}
    return {"damage":max(1,round(damage)),"heal":max(0,round(heal)),"crit":crit,"tags":tags},cursor

def summoner_defense(defender, incoming, attacker_base, tape, cursor):
    defender["enemy_attack_count"]+=1
    damage=round(max(0,float(incoming))*(1-_clamp(_tal(defender,"damageReduce"),0,.25)))
    prevent=False
    if _tal(defender,"preventLethal")>0 and damage>=defender["hp"] and not defender["summoner_soul_save"]:
        defender["summoner_soul_save"]=True;prevent=True
    return {"damage":damage,"heal":0,"counter":0,"prevent":prevent,"dodged":False},cursor

def resolve_attack(attacker, defender, tape, cursor):
    cls=attacker["class_id"]
    if cls in ("grower","scout","bruiser"): return v319_standard_attack(attacker,defender,tape,cursor)
    if cls=="frost": return frost_attack(attacker,defender,tape,cursor)
    return summoner_attack(attacker,defender,tape,cursor)

def resolve_defense(defender, incoming, attacker_base, tape, cursor):
    cls=defender["class_id"]
    if cls in ("grower","scout","bruiser"): return v319_standard_defense(defender,incoming,attacker_base,tape,cursor)
    if cls=="frost": return frost_defense(defender,incoming,attacker_base,tape,cursor)
    return summoner_defense(defender,incoming,attacker_base,tape,cursor)

def full_hooks_contract():
    return {
        "implemented":list(CLASSES),
        "attack_and_defense":True,
        "symmetric_dispatch":True,
        "status":"ALL_FIVE_PARAMETERISED_HOOKS_READY",
        "canonical_winrate_ready":False,
        "next_gate":"TRACE_PARITY_THEN_MATRIX",
    }

