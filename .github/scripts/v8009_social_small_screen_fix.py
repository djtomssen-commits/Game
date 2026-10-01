from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old="shell.querySelector('[data-v371-head=\"mail\"]').onclick=()=>{try{v032Go('friends')}catch(e){}};"
new="shell.querySelector('[data-v371-head=\"mail\"]').onclick=()=>{try{v032Go('mail')}catch(e){}};"
n=c.count(old)
if n!=1: raise SystemExit(f"v371 mail route expected 1 got {n}")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "v371_mail_route_fixed":"[data-v371-head=\"mail\"]').onclick=()=>{try{v032Go('mail')" in c,
 "v372_mail_route_correct":"[data-head=\"mail\"]').onclick=()=>{try{v032Go('mail')" in c,
 "v382_compose_delay_kept":"v032Go('mail');\n    setTimeout(()=>{" in c,
 "v333_visibility_refresh_kept":"setTimeout(v073LoadFriends,350)" in c,
 "v382_friend_decorator_kept":"const baseFriends=v073LoadFriends" in c,
 "v383_name_fix_kept":"v383-friend-mail-name-fix" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_SOCIAL_SMALL_SCREEN_QA.json").write_text(json.dumps({
 "build":"V8.009-SOCIAL-SMALL-SCREEN-QA",
 "checks":checks,
 "scope":"friends/mail navigation and lifecycle coverage; remote refresh and compose ordering preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(checks))