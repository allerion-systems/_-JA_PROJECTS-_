# Joey's Portfolio

An always-evolving portfolio site for James "Joey" Allee — construction estimator / project manager. The centerpiece is an interactive 3D globe with a pin for every project he's worked on; clicking a pin opens a case-study panel with real project facts and, where available, a Lean Six Sigma Black Belt (DMAIC) write-up.

## What's here

- **`index.html` / `css/` / `js/`** — the site itself. Plain HTML/CSS/JS, no build step, no framework. The globe is rendered with [globe.gl](https://github.com/vasturiano/globe.gl) (a Three.js-based helper), loaded via CDN.
- **`data/projects.json`** — the source of truth: every project's year, employer, location, budget, scope, role, and status, extracted from Joey's master project log. Coordinates are city/site-level approximations for map plotting, not survey-grade.
- **`content/lssbb/`** — first-draft Lean Six Sigma Black Belt (DMAIC) case studies per project. These are AI-drafted narratives grounded in the real project facts; any quantified metric that wasn't in the source data is marked `[QUANTIFY: ...]` and needs Joey's real numbers before being presented to an employer as fact. See `content/lssbb/README.md`.
- **`obsidian/`** — an Obsidian vault view of the same data: one note per project, employer, and year, cross-linked so Graph View shows the whole portfolio as a network (project ↔ employer, project ↔ year, project ↔ LSSBB write-up). Regenerate it any time the data changes: `python3 scripts/gen_obsidian.py`.

## Running locally

No build step — just serve the directory and open it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(A plain `file://` open won't work — the site `fetch()`s `data/projects.json` and `content/lssbb/*.md`, which needs a real HTTP origin.)

## Adding a new project

Add an entry to `data/projects.json`'s `projects` array (see existing entries for the shape), then optionally add a matching `content/lssbb/<id>.md` write-up. Re-run `python3 scripts/gen_obsidian.py` to refresh the vault.

## Deploying

GitHub Pages, serving from `main` / root. (Enable under repo Settings → Pages if not already on.)
