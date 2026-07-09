/**
 * app.js
 * Entry point: loads data, populates the header, renders the project list,
 * boots the globe, and wires pin/card clicks to the case-study overlay.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const data = await PortfolioData.load();
  const { person, projects } = data;

  document.getElementById("person-name").textContent = person.name;
  document.getElementById("person-titles").textContent = person.titles.join(" · ");
  document.getElementById("person-location").textContent = person.location;
  document.getElementById("person-summary").textContent = person.summary;
  document.getElementById("linkedin-link").href = person.linkedin;
  document.getElementById("footer-year").textContent = new Date().getFullYear();

  const years = projects.map((p) => p.year).filter(Boolean);
  const employers = new Set(projects.map((p) => p.employer));
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  document.getElementById("stat-row").innerHTML = `
    <div class="stat"><span class="num">${projects.length}</span><span class="label">Projects</span></div>
    <div class="stat"><span class="num">${employers.size}</span><span class="label">Employers</span></div>
    <div class="stat"><span class="num">${Math.min(...years)}–${Math.max(...years)}</span><span class="label">Years</span></div>
    <div class="stat"><span class="num">${PortfolioData.formatBudgetShort(totalBudget)}</span><span class="label">Total Budget</span></div>
  `;
  document.getElementById("project-count").textContent = `(${projects.length})`;

  function isPendingStatus(status) {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes("pending") || s.includes("proposal");
  }

  const listEl = document.getElementById("project-list");
  listEl.innerHTML = projects
    .slice()
    .sort((a, b) => b.year - a.year)
    .map((p, i) => {
      const pending = isPendingStatus(p.status);
      return `
      <button class="project-card" data-id="${p.id}" style="animation-delay:${Math.min(i * 25, 400)}ms">
        <div class="pc-top">
          <div class="pc-name">${p.project}</div>
          <div class="pc-status${pending ? " pending" : ""}">${pending ? "Pending" : "Complete"}</div>
        </div>
        <div class="pc-meta">${p.year} · ${p.employer}</div>
        <div class="pc-coords">${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</div>
        <div class="pc-budget">${PortfolioData.formatBudgetShort(p.budget)}</div>
      </button>`;
    })
    .join("");
  listEl.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => openCaseStudy(card.dataset.id));
  });

  const overlay = document.getElementById("case-study-overlay");
  const closeBtn = document.getElementById("cs-close");

  function openCaseStudy(id) {
    overlay.hidden = false;
    CaseStudy.render(data, id);
  }
  function closeCaseStudy() {
    overlay.hidden = true;
  }
  closeBtn.addEventListener("click", closeCaseStudy);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCaseStudy();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeCaseStudy();
  });

  const tooltip = document.getElementById("hover-tooltip");
  function onPointHover(point) {
    if (!point) {
      tooltip.hidden = true;
      return;
    }
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${point.project}</strong><span>${point.employer}</span>`;
  }
  document.addEventListener("mousemove", (e) => {
    if (tooltip.hidden) return;
    tooltip.style.left = `${e.clientX + 14}px`;
    tooltip.style.top = `${e.clientY + 14}px`;
  });

  const container = document.getElementById("globe-container");
  const loadingEl = document.getElementById("globe-loading");
  try {
    PortfolioGlobe.init(container, projects, { onPointClick: openCaseStudy, onPointHover });
  } finally {
    loadingEl.hidden = true;
  }
});
