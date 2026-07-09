/**
 * assistant.js
 * Lightweight client-side "project assistant" — no AI backend, no API key.
 * Parses simple natural-language-ish queries (location/employer/year/budget
 * keywords) and scores projects against them. This is deliberately a search
 * layer over real data/projects.json, not a generative chatbot — a static
 * GitHub Pages site can't hold an LLM API key safely, so answers are always
 * grounded in the actual project records, never invented.
 */

const PortfolioAssistant = (() => {
  const UNIT = { k: 1_000, thousand: 1_000, m: 1_000_000, million: 1_000_000 };

  function parseAmount(numStr, unitStr) {
    const n = parseFloat(numStr.replace(/,/g, ""));
    const mult = unitStr ? UNIT[unitStr.toLowerCase()] || 1 : 1;
    return n * mult;
  }

  function extractFilters(query) {
    const q = query.toLowerCase();
    const filters = { minBudget: null, maxBudget: null, year: null, terms: [] };

    const over = /(?:over|above|more than|>)\s*\$?\s*([\d,.]+)\s*(k|m|thousand|million)?/i.exec(q);
    if (over) filters.minBudget = parseAmount(over[1], over[2]);

    const under = /(?:under|below|less than|<)\s*\$?\s*([\d,.]+)\s*(k|m|thousand|million)?/i.exec(q);
    if (under) filters.maxBudget = parseAmount(under[1], under[2]);

    const year = /\b(20[12][0-9])\b/.exec(q);
    if (year) filters.year = parseInt(year[1], 10);

    // Strip the numeric/unit tokens already captured above so leftover words
    // become plain search terms (location, employer, project-name keywords).
    const stripped = q
      .replace(/(?:over|above|more than|under|below|less than)\s*\$?\s*[\d,.]+\s*(?:k|m|thousand|million)?/gi, "")
      .replace(/[<>]\s*\$?\s*[\d,.]+\s*(?:k|m|thousand|million)?/gi, "")
      .replace(/\b20[12][0-9]\b/g, "")
      .replace(/[^\w\s]/g, " ");
    filters.terms = stripped.split(/\s+/).filter((t) => t.length > 2 && !STOPWORDS.has(t));

    return filters;
  }

  const STOPWORDS = new Set([
    "the", "and", "for", "with", "that", "this", "show", "find", "what", "which",
    "projects", "project", "did", "was", "were", "has", "have", "any", "all",
  ]);

  function score(project, filters) {
    if (filters.minBudget !== null && (project.budget || 0) < filters.minBudget) return -1;
    if (filters.maxBudget !== null && (project.budget || 0) > filters.maxBudget) return -1;
    if (filters.year !== null && project.year !== filters.year) return -1;

    if (filters.terms.length === 0) return 1;

    const haystack = [project.project, project.employer, project.location, project.scope, project.role, project.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let matched = 0;
    for (const term of filters.terms) {
      if (haystack.includes(term)) matched += 1;
    }
    return matched === filters.terms.length ? matched + 1 : matched > 0 ? matched * 0.5 : 0;
  }

  function search(projects, query) {
    const trimmed = query.trim();
    if (!trimmed) return { results: projects.slice().sort((a, b) => b.year - a.year), summary: null };

    const filters = extractFilters(trimmed);
    const scored = projects
      .map((p) => ({ p, s: score(p, filters) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.p.year - a.p.year)
      .map((x) => x.p);

    const bits = [];
    if (filters.terms.length) bits.push(`"${filters.terms.join(" ")}"`);
    if (filters.year) bits.push(`in ${filters.year}`);
    if (filters.minBudget) bits.push(`over ${PortfolioData.formatBudgetShort(filters.minBudget)}`);
    if (filters.maxBudget) bits.push(`under ${PortfolioData.formatBudgetShort(filters.maxBudget)}`);

    const summary = scored.length
      ? `${scored.length} project${scored.length === 1 ? "" : "s"} ${bits.length ? "matching " + bits.join(", ") : ""}`.trim()
      : `No projects match ${bits.join(", ") || "that query"} — try a different location, employer, year, or budget range.`;

    return { results: scored, summary };
  }

  return { search };
})();
