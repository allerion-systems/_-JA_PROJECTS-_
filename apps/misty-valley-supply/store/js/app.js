/**
 * app.js
 * Entry point for the digital-twin layout: loads data, populates the
 * identity badge + stats strip, wires the search/assistant panel and its
 * project list, boots the full-viewport globe, and connects pin clicks /
 * list clicks / search results to the case-study overlay and camera flyTo.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const data = await PortfolioData.load();
  const { person, projects } = data;

  document.getElementById("person-name").textContent = person.name;
  document.getElementById("person-titles").textContent = person.titles[0] || "";
  document.getElementById("linkedin-link").href = person.linkedin;

  const years = projects.map((p) => p.year).filter(Boolean);
  const employers = new Set(projects.map((p) => p.employer));
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  document.getElementById("stat-row").innerHTML = `
    <div class="stat"><span class="num">${projects.length}</span><span class="label">Projects</span></div>
    <div class="stat"><span class="num">${employers.size}</span><span class="label">Employers</span></div>
    <div class="stat"><span class="num">${Math.min(...years)}–${Math.max(...years)}</span><span class="label">Years</span></div>
    <div class="stat"><span class="num">${PortfolioData.formatBudgetShort(totalBudget)}</span><span class="label">Total</span></div>
  `;

  function isPendingStatus(status) {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes("pending") || s.includes("proposal");
  }

  let activeId = null;

  function renderProjectList(list) {
    const listEl = document.getElementById("project-list");
    listEl.innerHTML = list
      .map((p) => {
        const pending = isPendingStatus(p.status);
        return `
        <button class="project-card${p.id === activeId ? " active" : ""}" data-id="${p.id}">
          <div class="pc-top">
            <div class="pc-name">${p.project}</div>
            <div class="pc-status${pending ? " pending" : ""}">${pending ? "Pending" : "Complete"}</div>
          </div>
          <div class="pc-meta">${p.year} · ${p.employer}</div>
          <div class="pc-budget">${PortfolioData.formatBudgetShort(p.budget)}</div>
        </button>`;
      })
      .join("");
    listEl.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => selectProject(card.dataset.id));
    });
  }

  renderProjectList(projects.slice().sort((a, b) => b.year - a.year));

  const searchInput = document.getElementById("search-input");
  const searchSummary = document.getElementById("search-summary");
  searchInput.addEventListener("input", () => {
    const { results, summary } = PortfolioAssistant.search(projects, searchInput.value);
    searchSummary.textContent = summary || "";
    renderProjectList(results);
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

  function selectProject(id) {
    const project = PortfolioData.findById(data, id);
    if (!project) return;
    activeId = id;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.id === id);
    });
    PortfolioGlobe.flyToProject(project);
    openCaseStudy(id);
  }

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
    PortfolioGlobe.init(container, projects, { onPointClick: selectProject, onPointHover });
    loadingEl.hidden = true;
  } catch (err) {
    // A CDN/network failure here must not abort the rest of setup below —
    // the search panel and its listeners still need to work even if the
    // map itself can't load (see js/globe.js's CESIUM_ION_TOKEN comment).
    console.error("Globe failed to initialize:", err);
    loadingEl.textContent = "Map unavailable (failed to load Cesium).";
  }
  window.addEventListener("resize", () => PortfolioGlobe.resize(container));

  const panel = document.getElementById("search-panel");
  const panelToggle = document.getElementById("search-panel-toggle");
  const panelReopen = document.getElementById("search-panel-reopen");
  panelToggle.addEventListener("click", () => {
    panel.classList.add("collapsed");
    panelReopen.hidden = false;
  });
  panelReopen.addEventListener("click", () => {
    panel.classList.remove("collapsed");
    panelReopen.hidden = true;
  });
});
