import { applyFilters, dealCard, getApprovedDeals, sortDeals, wireCardActions } from "./app.js";

const dealsEl = document.getElementById("trendingDeals");
const searchInput = document.getElementById("globalSearch");

let allDeals = [];

function render(deals) {
  dealsEl.innerHTML = deals.map((deal, i) => dealCard(deal, i)).join("");
  wireCardActions(dealsEl);
}

async function boot() {
  allDeals = sortDeals(await getApprovedDeals(), "trending").slice(0, 12);
  render(allDeals);
}

searchInput?.addEventListener("input", () => {
  const filtered = applyFilters(allDeals, { search: searchInput.value });
  render(filtered);
});

boot();
