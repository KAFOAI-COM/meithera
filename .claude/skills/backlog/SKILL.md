---
name: backlog
description: Turn selected or pasted text (a meeting note, a sprint checklist line, a bug report, a stray idea) into a GitHub issue on the Meithera repository (KAFOAI-COM/meithera, formerly baz2024/meithera) with an epic, sprint, priority, acceptance criteria, an optional assignee and a Meithera Project link. Use this whenever the user says /backlog, "add this to the backlog", "make an issue for this", "ticket this", "log this for later", or pastes a to-do and asks where it should go, even if they do not say "issue" or "GitHub".
---

# /backlog — text to GitHub issue

Usage: `/backlog [@assignee] [P0|P1|P2|P3] [--dry-run]` with the task text selected or pasted
in the same message (or the message just before). Example: `/backlog @rashedalketbi P1`.

The skill is deliberately light: you do the reading and judgement, the script does the
GitHub calls and tells you what GitHub actually did. Ask the user something only when the
owner, the intended action or the target repository is genuinely unclear. Never invent an
assignee, and never say an issue was assigned or added to a project unless the script
printed that GitHub confirmed it.

Script: `.claude/skills/backlog/scripts/backlog.sh` (needs `gh` logged in). It targets
the current checkout's repository as GitHub knows it today (the repo started as
`baz2024/meithera` and now lives at `KAFOAI-COM/meithera`); override with
`BACKLOG_REPO=owner/name`.

## 1. Read the text and draft the issue

From the selected or pasted text, write:

- **Title**: one line, under 70 characters, imperative ("Add borrower-default diagram to
  regulatory demo"), no trailing full stop, no priority or epic in the title (labels carry
  those).
- **Description**: two to five sentences in plain English. Keep the user's intent and any
  numbers, routes or file names they mentioned. If the text is a Meithera hard rule (no
  claims of Central Bank approval, gross-to-net figures, stage badges, fictional data only),
  carry that constraint into the body so the implementer sees it.
- **Acceptance criteria**: three to five checkbox lines that someone else could verify
  without asking you. Prefer observable results ("`/regulatory-demo` section C shows the
  client-money flow at 390px without horizontal scroll") over activities ("investigate").

If the text contains several unrelated tasks, say so and create one issue per task, or ask
which one they meant if that is cheaper than guessing.

## 2. Pick epic, sprint and priority

Read `references/epics.md` in this skill folder, then the newest file in `docs/sprints/`,
and choose:

- `epic:<slug>` from the table (one epic; `epic:general` if nothing fits).
- `sprint:<slug>` from the newest sprint document, or `sprint:backlog` when the task is
  post-sprint, unscheduled or the sprint has ended.
- Priority `P0`–`P3`. A priority passed on the command line wins. Otherwise derive it from
  the sprint document's section the task matches (P0 blocks the next milestone, P1 this
  sprint, P2 next, P3 later) and say in your reply why you chose it.

Add `bug` when the text describes something broken, `documentation` when the deliverable
is a doc. The script creates missing `epic:*`, `sprint:*` and `P*` labels on first use.

## 3. Validate the assignee (only if one was given)

```bash
.claude/skills/backlog/scripts/backlog.sh check-assignee @login
```

`ok` means a repository collaborator. `invalid` means GitHub does not know that login as a
collaborator: do not guess a similar name, do not assign; tell the user the login was not
valid and offer the collaborators the script can see
(`gh api repos/{owner}/{repo}/collaborators --jq '.[].login'`). A bare first name such
as `@basel` is not a GitHub login unless it validates.

## 4. Check for duplicates

```bash
.claude/skills/backlog/scripts/backlog.sh search "<three or four distinctive words from the title>"
```

Run it twice if the first query is too narrow (a route name, then a plain-English phrase).
If an open issue clearly covers the same work, stop and show it instead of creating a new
one; offer to comment on it or to create anyway. A closed match or a loosely related issue
is just a "Related: #n" line in the body.

## 5. Create the issue

Write the body to a temp file using this layout, then run the script:

```markdown
<description>

**Epic:** epic:<slug> · **Sprint:** sprint:<slug> · **Priority:** P<n> · **Stage:** <n · name, if relevant>

## Acceptance criteria
- [ ] ...
- [ ] ...

## Source
<the pasted text, quoted, trimmed to what matters>

Related: #<n> (only if found in step 4)
```

```bash
.claude/skills/backlog/scripts/backlog.sh create \
  --title "<title>" --body-file <tmp.md> \
  --label "epic:<slug>" --label "sprint:<slug>" --label "P<n>" \
  [--assignee <login>] [--dry-run]
```

With `--dry-run` the script prints the exact command and creates nothing; use it when the
user asked for a preview or when anything in steps 1–4 felt uncertain.

The script prints three lines: `ISSUE_URL=`, `ASSIGNMENT=` and `PROJECT=`. It re-reads the
issue from GitHub before reporting assignment, and it looks for a GitHub Project whose title
contains "Meithera" (or `BACKLOG_PROJECT=<number>`) before adding the item. "not configured"
and "failed" are normal outcomes to pass on, not errors to work around.

## 6. Reply

Report, in this order and nothing more:

1. The issue link.
2. Title, epic, sprint, priority, one line each.
3. Assignment status exactly as the script printed it.
4. Project status exactly as the script printed it.
5. Any duplicate or assignee caveat from steps 3–4.

**Example reply**

> Created https://github.com/KAFOAI-COM/meithera/issues/12
> Title: Add borrower-default scenario to Stage 1 worked example
> epic:finance-model · sprint:2026-10-readiness · P0
> Assignment: assigned to rashedalketbi (confirmed by GitHub)
> Project: not configured (no project titled 'Meithera' for KAFOAI-COM)
