/**
 * data.js
 * Loads data/projects.json and exposes small formatting helpers.
 * No factual data is altered here — only display-time derived strings.
 */

const PortfolioData = (() => {
  let cache = null;

  async function load() {
    if (cache) return cache;
    const res = await fetch("data/projects.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to load data/projects.json: ${res.status}`);
    }
    cache = await res.json();
    return cache;
  }

  function formatBudget(amount) {
    if (amount === null || amount === undefined) return "Not disclosed";
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    });
  }

  function formatBudgetShort(amount) {
    if (amount === null || amount === undefined) return "N/A";
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
  }

  function findById(data, id) {
    return data.projects.find((p) => p.id === id) || null;
  }

  return { load, formatBudget, formatBudgetShort, findById };
})();
