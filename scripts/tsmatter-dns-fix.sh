#!/usr/bin/env bash
# tsmatter-dns-fix.sh — two small Cloudflare DNS fixes for tsmatter.com, each confirmed before it runs:
#   1. Restore app.tsmatter.com and insurance.tsmatter.com (A + AAAA to the Fly app, Proxied, as before)
#   2. Merge the two SPF TXT records on tsmatter.com into one valid record (keeps every include)
# Never touches MX records, the DKIM record, the website (@ / www) records or any other TXT record.
# Needs a Cloudflare API token with "Zone → DNS → Edit" for tsmatter.com. The token is typed in hidden,
# used only for this run, and never saved or printed.
#   bash tsmatter-dns-fix.sh            # show plan, ask before each change
#   bash tsmatter-dns-fix.sh --dry-run  # show plan only, change nothing
set -euo pipefail
ZONE_NAME="tsmatter.com"
FLY_V4="66.241.124.194"
FLY_V6="2a09:8280:1::137:4df0:0"
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
die(){ echo "STOP: $*" >&2; exit 1; }
command -v curl >/dev/null || die "curl is not installed."
command -v python3 >/dev/null || die "python3 is not installed."

if [ -z "${CF_API_TOKEN:-}" ]; then
  echo "Create a token: dash.cloudflare.com → My Profile → API Tokens → Create Token →"
  echo "  template 'Edit zone DNS' → Zone Resources: Include → Specific zone → $ZONE_NAME → Create."
  read -rsp "Paste the Cloudflare API token (hidden): " CF_API_TOKEN; echo
fi
[ -n "$CF_API_TOKEN" ] || die "No token given."
API="https://api.cloudflare.com/client/v4"
cf(){ curl -fsS -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" "$@"; }
ok_json(){ python3 -c "import json,sys;d=json.load(sys.stdin);sys.exit(0 if d.get('success') else 1)"; }

ZONE_ID=$(cf "$API/zones?name=$ZONE_NAME" | python3 -c "import json,sys;r=json.load(sys.stdin)['result'];print(r[0]['id'] if r else '')") \
  || die "Token rejected by Cloudflare. Check it has DNS Edit for $ZONE_NAME."
[ -n "$ZONE_ID" ] || die "Zone $ZONE_NAME not visible to this token."
RECS=$(cf "$API/zones/$ZONE_ID/dns_records?per_page=500")
echo "OK: connected to $ZONE_NAME"

confirm(){ [ $DRY = 1 ] && { echo "  (dry run: no change)"; return 1; }; read -rp "  Apply this? [y/N] " a; [ "$a" = y ] || [ "$a" = Y ]; }

# ---------- 1. app + insurance ----------
echo; echo "== 1. Restore app.$ZONE_NAME and insurance.$ZONE_NAME =="
TODO=$(echo "$RECS" | python3 -c "
import json,sys
recs=json.load(sys.stdin)['result']
want=[(h+'.$ZONE_NAME',t,c) for h in ('app','insurance') for t,c in (('A','$FLY_V4'),('AAAA','$FLY_V6'))]
for n,t,c in want:
    same=[r for r in recs if r['name']==n and r['type']==t]
    clash=[r for r in recs if r['name']==n and r['type']=='CNAME']
    if clash: print('CLASH',n,t,c)
    elif any(r['content']==c for r in same): print('HAVE',n,t,c)
    else: print('ADD',n,t,c)
")
echo "$TODO" | while read -r k n t c; do
  case $k in HAVE) echo "  already there: $t $n → $c";; ADD) echo "  will add:      $t $n → $c (Proxied)";; CLASH) echo "  SKIP: $n has a CNAME; not touching it";; esac
done
if echo "$TODO" | grep -q '^ADD' && confirm; then
  echo "$TODO" | grep '^ADD' | while read -r k n t c; do
    body=$(python3 -c "import json,sys;print(json.dumps({'type':sys.argv[1],'name':sys.argv[2],'content':sys.argv[3],'proxied':True,'ttl':1}))" "$t" "$n" "$c")
    cf -X POST "$API/zones/$ZONE_ID/dns_records" --data "$body" | ok_json && echo "  added $t $n" || die "could not add $t $n"
  done
fi

# ---------- 2. SPF merge ----------
echo; echo "== 2. Merge SPF records on $ZONE_NAME =="
PLAN=$(echo "$RECS" | python3 -c "
import json,sys
recs=json.load(sys.stdin)['result']
spf=[r for r in recs if r['type']=='TXT' and r['name']=='$ZONE_NAME' and r['content'].strip().strip('\"').strip().lower().startswith('v=spf1')]
if len(spf)<2: print(json.dumps({'n':len(spf)})); sys.exit()
mech=[];alls=[]
for r in spf:
    for p in r['content'].strip().strip('\"').split()[1:]:
        if p.lower().endswith('all'): alls.append(p)
        elif p not in mech: mech.append(p)
end='~all' if '~all' in alls or not alls else ('-all' if '-all' in alls else alls[0])
print(json.dumps({'n':len(spf),'old':[{'id':r['id'],'content':r['content']} for r in spf],'new':'v=spf1 '+' '.join(mech+[end])}))
")
N=$(echo "$PLAN" | python3 -c "import json,sys;print(json.load(sys.stdin)['n'])")
if [ "$N" -lt 2 ]; then
  echo "  Only $N SPF record found — nothing to merge."
else
  echo "$PLAN" | python3 -c "
import json,sys;p=json.load(sys.stdin)
for o in p['old']: print('  will remove: TXT',o['content'])
print('  will add:    TXT \"%s\"'%p['new'])"
  if confirm; then
    NEW=$(echo "$PLAN" | python3 -c "import json,sys;print(json.load(sys.stdin)['new'])")
    body=$(python3 -c "import json,sys;print(json.dumps({'type':'TXT','name':sys.argv[1],'content':'\"'+sys.argv[2]+'\"','ttl':1}))" "$ZONE_NAME" "$NEW")
    # add the merged record first, so there is never a moment with no SPF
    cf -X POST "$API/zones/$ZONE_ID/dns_records" --data "$body" | ok_json || die "could not add merged SPF; nothing removed"
    echo "  added merged SPF"
    for id in $(echo "$PLAN" | python3 -c "import json,sys;[print(o['id']) for o in json.load(sys.stdin)['old']]"); do
      cf -X DELETE "$API/zones/$ZONE_ID/dns_records/$id" | ok_json && echo "  removed old SPF $id" || echo "  WARNING: could not remove $id — delete it by hand"
    done
  fi
fi

echo; echo "Done. MX, DKIM and website records were not touched."
echo "You can delete the API token now: My Profile → API Tokens → ⋯ → Delete."
