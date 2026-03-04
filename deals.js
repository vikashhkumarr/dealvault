import { fetchApprovedDeals, renderDealCard, categories } from "./app.js";

const grid = document.getElementById("dealsGrid") || document.getElementById("deals");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const brandFilter = document.getElementById("brandFilter");

function attachCardActions() {
  grid.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-copy");
      if (!code) return;
      await navigator.clipboard.writeText(code);
      const toast = button.closest(".deal-card")?.querySelector(".toast");
      if (toast) {
        toast.textContent = `Copied: ${code}`;
        setTimeout(() => (toast.textContent = ""), 1600);
      }
    });
  });
}

async function renderDeals() {
  if (!grid) return;
  const deals = await fetchApprovedDeals({
    search: searchInput?.value?.trim() || "",
    category: categoryFilter?.value || "",
    brand: brandFilter?.value?.trim() || "",
    max: 60
  });

  grid.innerHTML = deals.map((deal, i) => renderDealCard(deal, i)).join("");
  if (!deals.length) {
    grid.innerHTML = `<article class="panel"><h3>No deals found</h3><p>Try changing filters or submit a new deal.</p></article>`;
  }
  attachCardActions();
}

function bindFilters() {
  if (categoryFilter && !categoryFilter.dataset.hydrated) {
    categoryFilter.innerHTML = `<option value="">All categories</option>${categories.map((c) => `<option>${c}</option>`).join("")}`;
    categoryFilter.dataset.hydrated = "1";
  }

  [searchInput, categoryFilter, brandFilter].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", renderDeals);
    el.addEventListener("change", renderDeals);
  });
}

bindFilters();
renderDeals();
