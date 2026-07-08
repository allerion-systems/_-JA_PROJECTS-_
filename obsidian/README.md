# Obsidian Vault

Open this `obsidian/` folder as an Obsidian vault (Obsidian → Open folder as vault) and switch to Graph View to see the whole portfolio as a network.

## Note types

- **`projects/<id>.md`** — one per project (40 total). The hub of the graph: each links to its employer, its year, and (if one exists) its LSSBB case study.
- **`employers/<name>.md`** — one per employer (8 total). Stub notes — Obsidian's backlinks panel auto-populates the list of projects for that employer, but each note also lists them directly.
- **`years/<year>.md`** — one per year, 2018–2025.
- **`lssbb/<id>.md`** — thin notes that transclude the real write-up from `../content/lssbb/<id>.md` (one source of truth — these don't duplicate the content) and link back to the project note.

## Regenerating

All of this is generated from `data/projects.json` (+ `content/lssbb/*.md` for the LSSBB links) by `scripts/gen_obsidian.py` at the repo root. Re-run it after editing project data or adding LSSBB write-ups:

```bash
python3 scripts/gen_obsidian.py
```

It's idempotent — safe to re-run any time.
