#!/usr/bin/env python3
import json, random

LEVELS=(100,200,300)
CLASSES=("grower","scout","bruiser","frost","summoner")

# Canonical offensive fixture values from the V8.097 audit.
OFFENSE={
  100:{"grower":1.423,"scout":1.314,"bruiser":1.474,"frost":1.298,"summoner":1.185},
  200:{"grower":1.586,"scout":1.560,"bruiser":1.818,"frost":1.518,"summoner":1.249},
  300:{"grower":1.792,"scout":1.645,"bruiser":1.949,"frost":1.649,"summoner":1.373},
}

# Offensive-build defensive/utility terms that remain active in the canonical
# class resolvers. This harness is intentionally a neutral-target benchmark,
# not a replacement for the server Shadow RPCs.
UTILITY={
  100:{
    "grower":{"dodge":0,"lifesteal":0},
    "scout":{"dodge":.05,"lifesteal":0},
    "bruiser":{"dodge":0,"lifesteal":0},
    "frost":{"dodge":0,"lifesteal":0},
    "summoner":{"dodge":0,"lifesteal":0,"summon":.142,"summon_damage":.187},
  },
  200:{
    "grower":{"dodge":0,"lifesteal":.027},
    "scout":{"dodge":.05,"lifesteal":0},
    "bruiser":{"dodge":0,"lifesteal":0},
    "frost":{"dodge":0,"lifesteal":.018},
    "summoner":{"dodge":0,"lifesteal":0,"summon":.185,"summon_damage":.217},
  },
  300:{
    "grower":{"dodge":0,"lifesteal":.027},
    "scout":{"dodge":.05,"lifesteal":0},
    "bruiser":{"dodge":0,"lifesteal":0},
    "frost":{"dodge":0,"lifesteal":.018,"low_hp_lifesteal":.021},
    "summoner":{"dodge":0,"lifesteal":0,"summon":.214,"summon_damage":.422},
  }
}

def fight(level, cls, rng):
    hp=maxhp=2000.0
    enemy_hp=2000.0
    base_hit=100.0
    enemy_hit=100.0
    u=UTILITY[level][cls]
    no_summon=0
    rounds=0
    dealt=healed=taken=0.0
    while hp>0 and enemy_hp>0 and rounds<60:
        rounds += 1
        hit=base_hit*OFFENSE[level][cls]*rng.uniform(.90,1.10)
        if cls=="summoner":
            summon_chance=u["summon"]
            summoned=no_summon>=4 or rng.random()<summon_chance
            if summoned:
                no_summon=0
                comp=rng.choice((.30,.48,.24,.30))
                comp_damage=base_hit*comp*(1+u["summon_damage"])
                hit+=comp_damage
                if comp==.30 and rng.random()<.5:  # only one of the two .30 companions is Bud
                    heal=comp_damage*.20
                    hp=min(maxhp,hp+heal); healed+=heal
            else:
                no_summon+=1
        ls=u.get("lifesteal",0)
        if cls=="frost" and hp/maxhp<.5:
            ls+=u.get("low_hp_lifesteal",0)
        heal=hit*min(.10,ls)
        hp=min(maxhp,hp+heal); healed+=heal
        enemy_hp-=hit; dealt+=hit
        if enemy_hp<=0: break
        if rng.random()<u.get("dodge",0):
            continue
        dmg=enemy_hit*rng.uniform(.90,1.10)
        hp-=dmg; taken+=dmg
    return enemy_hp<=0, rounds, dealt, healed, taken, max(0,hp)

def run(samples=50000):
    out={"version":"V8.097","mode":"synthetic-neutral-fight-fixture","samples_per_class_level":samples,"results":{}}
    for level in LEVELS:
        out["results"][str(level)]={}
        for cls in CLASSES:
            wins=rounds=dealt=healed=taken=hp=0.0
            for i in range(samples):
                r=random.Random(level*1000000 + CLASSES.index(cls)*100000 + i)
                w,rd,d,h,t,left=fight(level,cls,r)
                wins+=int(w); rounds+=rd; dealt+=d; healed+=h; taken+=t; hp+=left
            out["results"][str(level)][cls]={
                "win_rate":round(wins/samples,4),
                "avg_rounds":round(rounds/samples,3),
                "avg_damage":round(dealt/samples,2),
                "avg_healing":round(healed/samples,2),
                "avg_damage_taken":round(taken/samples,2),
                "avg_hp_left":round(hp/samples,2)
            }
    return out

if __name__=="__main__":
    print(json.dumps(run(),indent=2,sort_keys=True))
