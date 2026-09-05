#!/usr/bin/env python3
"""Generate the Obsidian vault (obsidian/) from data/projects.json.

Mechanical generation, not content authoring: project notes link out to
employer/year/lssbb notes via [[wikilinks]] so Obsidian's Graph View shows
the whole portfolio as a connected network. Re-run any time projects.json
changes or content/lssbb/*.md gains new files.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "projects.json")
LSSBB_DIR = os.path.join(ROOT, "content", "lssbb")
VAULT = os.path.join(ROOT, "obsidian")


def slugify(name):
    s = re.sub(r"[^\w\s-]", "", name).strip()
    s = re.sub(r"[\s_]+", " ", s)
    return s


def main():
    with open(DATA_PATH) as f:
        data = json.load(f)
    projects = data["projects"]
    lssbb_ids = set()
    if os.path.isdir(LSSBB_DIR):
        lssbb_ids = {
            os.path.splitext(fn)[0] for fn in os.listdir(LSSBB_DIR) if fn.endswith(".md")
        }

    employers = sorted({p["employer"] for p in projects})
    years = sorted({p["year"] for p in projects})

    os.makedirs(os.path.join(VAULT, "projects"), exist_ok=True)
    os.makedirs(os.path.join(VAULT, "employers"), exist_ok=True)
    os.makedirs(os.path.join(VAULT, "years"), exist_ok=True)
    os.makedirs(os.path.join(VAULT, "lssbb"), exist_ok=True)

    # Employer stub notes — Obsidian auto-populates backlinks from project notes.
    for emp in employers:
        emp_projects = [p for p in projects if p["employer"] == emp]
        total = sum(p["budget"] or 0 for p in emp_projects)
        path = os.path.join(VAULT, "employers", f"{slugify(emp)}.md")
        with open(path, "w") as f:
            f.write(f"# {emp}\n\n")
            f.write(f"{len(emp_projects)} project(s), ${total:,.0f} combined budget.\n\n")
            f.write("## Projects\n\n")
            for p in sorted(emp_projects, key=lambda x: x["year"]):
                f.write(f"- [[../projects/{p['id']}|{p['project']} ({p['year']})]]\n")

    # Year stub notes.
    for yr in years:
        yr_projects = [p for p in projects if p["year"] == yr]
        path = os.path.join(VAULT, "years", f"{yr}.md")
        with open(path, "w") as f:
            f.write(f"# {yr}\n\n")
            f.write("## Projects\n\n")
            for p in sorted(yr_projects, key=lambda x: x["employer"]):
                f.write(f"- [[../projects/{p['id']}|{p['project']}]] — {p['employer']}\n")

    # Project notes — the hub of the graph, linking employer + year + (optional) lssbb.
    written = 0
    for p in projects:
        path = os.path.join(VAULT, "projects", f"{p['id']}.md")
        budget_str = f"${p['budget']:,.0f}" if p["budget"] is not None else "Not disclosed"
        with open(path, "w") as f:
            f.write("---\n")
            f.write(f"year: {p['year']}\n")
            f.write(f"budget: {p['budget']}\n")
            f.write(f"status: \"{p['status'] or ''}\"\n")
            f.write("---\n\n")
            f.write(f"# {p['project']}\n\n")
            f.write(f"- **Employer:** [[../employers/{slugify(p['employer'])}|{p['employer']}]]\n")
            f.write(f"- **Year:** [[../years/{p['year']}|{p['year']}]]\n")
            f.write(f"- **Location:** {p['location']}\n")
            f.write(f"- **Budget:** {budget_str}\n")
            if p.get("scope"):
                f.write(f"- **Scope:** {p['scope']}\n")
            if p.get("role"):
                f.write(f"- **Role:** {p['role']}\n")
            if p.get("status"):
                f.write(f"- **Status:** {p['status']}\n")
            if p["id"] in lssbb_ids:
                f.write(f"\n## Lean Six Sigma Black Belt Case Study\n\n")
                f.write(f"See [[../lssbb/{p['id']}|LSSBB write-up]].\n")
        written += 1

    # LSSBB transclusion notes — one source of truth stays in content/lssbb/*.md;
    # these just transclude it into the vault and backlink to the project.
    lssbb_written = 0
    for pid in lssbb_ids:
        p = next((x for x in projects if x["id"] == pid), None)
        if not p:
            continue
        path = os.path.join(VAULT, "lssbb", f"{pid}.md")
        with open(path, "w") as f:
            f.write(f"# {p['project']} — LSSBB Case Study\n\n")
            f.write(f"Back to [[../projects/{pid}|{p['project']}]]\n\n")
            f.write(f"![[../../content/lssbb/{pid}.md]]\n")
        lssbb_written += 1

    print(f"Employers: {len(employers)}, Years: {len(years)}, Projects: {written}, LSSBB notes: {lssbb_written}")


if __name__ == "__main__":
    main()
