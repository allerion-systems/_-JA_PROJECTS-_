# estimating/ — INTERNAL, CONFIDENTIAL

Working job-cost files: takeoffs, buy-out budgets, subcontractor rates, supplier RFQs.

**Do not publish.** This repo deploys to GitHub Pages from `main`/root. Anything merged to
`main` is served publicly. These files contain client contract values, gross margins,
subcontractor labor rates, and supplier pricing.

Guards in place:
- `_config.yml` at repo root excludes `estimating/` from the Pages build.
- Keep this work on a branch unless the repo is made private or the folder is moved out.

If any of that changes, pull this directory before merging.
