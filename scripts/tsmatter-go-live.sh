#!/usr/bin/env bash
# tsmatter-go-live.sh — publish docs/ of whiteheadlatorrey1-boop/tsm-executive-portfolio
# on GitHub Pages at tsmatter.com, show the DNS records to add, then turn on HTTPS.
# Safe to re-run. Never touches DNS itself, and never changes MX/TXT (email) records.
#   bash tsmatter-go-live.sh          # set up Pages + show DNS status
#   bash tsmatter-go-live.sh --wait   # also wait for DNS + certificate, then enforce HTTPS
set -euo pipefail
REPO="whiteheadlatorrey1-boop/tsm-executive-portfolio"
DOMAIN="tsmatter.com"
GH_IPS="185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153"
PAGES_HOST="whiteheadlatorrey1-boop.github.io"
die(){ echo "STOP: $*" >&2; exit 1; }
ok(){ echo "OK: $*"; }

command -v gh >/dev/null || die "GitHub CLI (gh) is not installed. Install it: https://cli.github.com"
command -v curl >/dev/null || die "curl is not installed."

# 1. Must be signed in to GitHub as an admin of the repo (whiteheadlatorrey1-boop).
ADMIN=$(gh api "repos/$REPO" --jq '.permissions.admin' 2>/dev/null || echo "none")
if [ "$ADMIN" != "true" ]; then
  echo "Signed in to GitHub as: $(gh api user --jq .login 2>/dev/null || echo 'nobody')"
  die "This account is not an admin of $REPO. Run:  gh auth login   and sign in as whiteheadlatorrey1-boop, then re-run this script."
fi
ok "GitHub admin access to $REPO"

# 2. Confirm the site files are on main.
for f in docs/index.html docs/CNAME docs/.nojekyll; do
  gh api "repos/$REPO/contents/$f?ref=main" --jq .path >/dev/null 2>&1 || die "$f is missing on main. Merge the website PR first."
done
ok "Website files found in docs/ on main"

# 3. Turn on Pages from main /docs (create, or update the source if Pages already exists).
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null
  ok "Pages source set to main /docs"
else
  gh api -X POST "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null
  ok "Pages turned on from main /docs"
fi

# 4. Custom domain.
gh api -X PUT "repos/$REPO/pages" -f "cname=$DOMAIN" >/dev/null
ok "Custom domain set to $DOMAIN"

# 5. Current DNS (DNS-over-HTTPS, works without dig).
q(){ curl -fsS "https://dns.google/resolve?name=$1&type=$2" 2>/dev/null | python3 -c "import json,sys;d=json.load(sys.stdin);print(' '.join(a['data'] for a in d.get('Answer',[]) if a.get('type') in (1,5,15,16,2)))" 2>/dev/null || true; }
echo
echo "Current DNS for $DOMAIN"
echo "  Name servers (where to edit DNS): $(q $DOMAIN NS)"
echo "  A (website):                      $(q $DOMAIN A)"
echo "  www:                              $(q www.$DOMAIN CNAME) $(q www.$DOMAIN A)"
echo "  MX (email, DO NOT CHANGE):        $(q $DOMAIN MX)"
echo
echo "Add these at your DNS provider (the name servers above tell you which company):"
for ip in $GH_IPS; do echo "  A      @     $ip"; done
echo "  CNAME  www   $PAGES_HOST"
echo "Delete any OTHER A record on @ (an old website). Leave every MX and TXT record alone."
echo

have_all(){ local cur; cur=$(q $DOMAIN A); for ip in $GH_IPS; do [[ " $cur " == *" $ip "* ]] || return 1; done; }
if have_all; then ok "DNS already points to GitHub Pages"; else echo "WAIT: DNS does not point to GitHub Pages yet."; fi

[ "${1:-}" = "--wait" ] || { echo; echo "When the DNS records are added, run:  bash $0 --wait"; exit 0; }

# 6. Wait for DNS, then for GitHub's certificate, then enforce HTTPS (up to ~60 min).
for i in $(seq 1 60); do have_all && break; echo "  waiting for DNS ($i/60)..."; sleep 60; done
have_all || die "DNS still does not point to GitHub after an hour. Check the records, then re-run with --wait."
ok "DNS points to GitHub Pages"
for i in $(seq 1 60); do
  if gh api -X PUT "repos/$REPO/pages" -F https_enforced=true >/dev/null 2>&1; then ok "HTTPS enforced"; break; fi
  echo "  waiting for GitHub's HTTPS certificate ($i/60)..."; sleep 60
done
gh api "repos/$REPO/pages" --jq '"Pages status: \(.status)  https_enforced: \(.https_enforced)  url: \(.html_url)"'
echo "Open https://$DOMAIN to check the site."
