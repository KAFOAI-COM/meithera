#!/usr/bin/env bash
# Deterministic GitHub steps for the /backlog skill. Needs `gh` logged in.
# Usage:
#   backlog.sh whoami
#   backlog.sh check-assignee <login|@login>
#   backlog.sh search "<query>"
#   backlog.sh project-number
#   backlog.sh create --title "..." --body-file path [--label L]... [--assignee login] [--dry-run]
set -euo pipefail

REPO="${BACKLOG_REPO:-baz2024/meithera}"
OWNER="${REPO%%/*}"

die() { echo "error: $*" >&2; exit 1; }

label_color() {
  case "$1" in
    P0) echo "b60205" ;; P1) echo "d93f0b" ;; P2) echo "fbca04" ;; P3) echo "c2e0c6" ;;
    epic:*) echo "1d76db" ;; sprint:*) echo "5319e7" ;; *) echo "ededed" ;;
  esac
}

ensure_label() {
  local name="$1"
  gh label create "$name" -R "$REPO" --color "$(label_color "$name")" --force >/dev/null 2>&1 \
    || echo "warn: could not create label '$name'" >&2
}

project_number() {
  if [[ -n "${BACKLOG_PROJECT:-}" ]]; then echo "$BACKLOG_PROJECT"; return 0; fi
  gh project list --owner "$OWNER" --format json 2>/dev/null \
    | jq -r '.projects[] | select(.title | test("meithera"; "i")) | .number' | head -n1
}

cmd="${1:-}"; shift || true
case "$cmd" in
  whoami)
    gh api user --jq '.login'
    ;;

  check-assignee)
    login="${1:-}"; login="${login#@}"
    [[ -n "$login" ]] || die "login required"
    if gh api "repos/$REPO/collaborators/$login" --silent >/dev/null 2>&1; then
      echo "ok $login"
    else
      echo "invalid $login (not a collaborator on $REPO)"; exit 2
    fi
    ;;

  search)
    q="$*"
    [[ -n "$q" ]] || die "query required"
    gh issue list -R "$REPO" --state all --limit 10 --search "$q" \
      --json number,title,state,url \
      --template '{{range .}}#{{.number}}  {{.state}}  {{.title}}  {{.url}}{{"\n"}}{{end}}'
    ;;

  project-number)
    n="$(project_number)"
    if [[ -n "$n" ]]; then echo "$n"; else echo "none"; exit 3; fi
    ;;

  create)
    title=""; body_file=""; assignee=""; dry=0; labels=()
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --title) title="$2"; shift 2 ;;
        --body-file) body_file="$2"; shift 2 ;;
        --label) labels+=("$2"); shift 2 ;;
        --assignee) assignee="${2#@}"; shift 2 ;;
        --dry-run) dry=1; shift ;;
        *) die "unknown flag $1" ;;
      esac
    done
    [[ -n "$title" && -f "$body_file" ]] || die "--title and --body-file are required"

    args=(-R "$REPO" --title "$title" --body-file "$body_file")
    for l in "${labels[@]+"${labels[@]}"}"; do args+=(--label "$l"); done

    assign_status="none requested"
    if [[ -n "$assignee" ]]; then
      if gh api "repos/$REPO/collaborators/$assignee" --silent >/dev/null 2>&1; then
        args+=(--assignee "$assignee")
      else
        assign_status="skipped ($assignee is not a collaborator on $REPO)"
        assignee=""
      fi
    fi

    if [[ $dry -eq 1 ]]; then
      echo "DRY RUN — would run: gh issue create ${args[*]}"
      if [[ -n "$assignee" ]]; then echo "ASSIGNMENT=would assign $assignee"; else echo "ASSIGNMENT=$assign_status"; fi
      n="$(project_number || true)"
      echo "PROJECT=${n:+would add to project $n}${n:-not configured (no project titled 'Meithera' for $OWNER)}"
      exit 0
    fi

    for l in "${labels[@]+"${labels[@]}"}"; do ensure_label "$l"; done

    url="$(gh issue create "${args[@]}")"
    echo "ISSUE_URL=$url"

    if [[ -n "$assignee" ]]; then
      actual="$(gh issue view "$url" --json assignees --jq '.assignees[].login' | tr '\n' ' ')"
      if [[ " $actual " == *" $assignee "* ]]; then assign_status="assigned to $assignee (confirmed by GitHub)"
      else assign_status="failed (GitHub shows assignees: ${actual:-none})"; fi
    fi
    echo "ASSIGNMENT=$assign_status"

    n="$(project_number || true)"
    if [[ -z "$n" ]]; then
      echo "PROJECT=not configured (no project titled 'Meithera' for $OWNER; set BACKLOG_PROJECT=<number> to override)"
    elif gh project item-add "$n" --owner "$OWNER" --url "$url" >/dev/null 2>&1; then
      echo "PROJECT=added to project $n"
    else
      echo "PROJECT=failed to add to project $n (try: gh auth refresh -s project)"
    fi
    ;;

  *)
    die "unknown command '$cmd'. See the header of this script."
    ;;
esac
