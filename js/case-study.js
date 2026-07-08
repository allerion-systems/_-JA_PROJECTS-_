/**
 * case-study.js
 * Renders a single project's case-study panel. LSSBB content is fetched
 * separately per project and the section is omitted entirely on a 404 —
 * most projects won't have a write-up yet, so this must degrade silently.
 */

const CaseStudy = (() => {
  function statusPillClass(status) {
    if (!status) return "status-pill";
    const s = status.toLowerCase();
    return s.includes("pending") || s.includes("proposal") ? "status-pill pending" : "status-pill";
  }

  function field(label, value) {
    if (value === null || value === undefined || value === "") return "";
    return `
      <div class="cs-field">
        <div class="cs-label">${label}</div>
        <div class="cs-value">${value}</div>
      </div>`;
  }

  async function fetchLssbb(id) {
    try {
      const res = await fetch(`content/lssbb/${id}.md`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  async function render(data, id) {
    const project = PortfolioData.findById(data, id);
    const contentEl = document.getElementById("cs-content");
    if (!project) {
      contentEl.innerHTML = "<p>Project not found.</p>";
      return;
    }

    contentEl.innerHTML = `
      <h2 id="cs-title">${project.project}</h2>
      <div class="cs-employer">${project.employer}</div>
      <div class="cs-year">${project.year} — ${project.location}</div>
      ${field("Budget", `<span class="cs-value budget">${PortfolioData.formatBudget(project.budget)}</span>`)}
      ${field("Scope", project.scope)}
      ${field("Role", project.role)}
      ${field("Status", project.status ? `<span class="${statusPillClass(project.status)}">${project.status}</span>` : "")}
      <div id="cs-lssbb-slot"></div>
    `;

    const md = await fetchLssbb(id);
    if (md) {
      const slot = document.getElementById("cs-lssbb-slot");
      if (slot) {
        slot.innerHTML = `
          <div class="lssbb-section">
            <h3>Lean Six Sigma Black Belt Case Study</h3>
            <div class="lssbb-body"></div>
          </div>`;
        // textContent, not innerHTML: markdown is rendered as pre-wrapped
        // plain text (see .lssbb-body CSS), so raw text can't inject HTML.
        slot.querySelector(".lssbb-body").textContent = md;
      }
    }
  }

  return { render };
})();
