import { CATEGORIES, applyFilters, dealCard, getApprovedDeals, sortDeals, wireCardActions } from "./app.js";

const dealsEl = document.getElementById("browseDeals");
const searchInput = document.getElementById("search");
const categorySel = document.getElementById("category");
const brandSel = document.getElementById("brand");
const sortSel = document.getElementById("sort");
const pageInfo = document.getElementById("pageInfo");

const PAGE_SIZE = 9;
let page = 1;
let allDeals = [];

CATEGORIES.forEach((c) => categorySel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));

function paginate(items) {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function render() {
  const sorted = sortDeals(
    applyFilters(allDeals, { search: searchInput.value, category: categorySel.value, brand: brandSel.value }),
    sortSel.value
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  const view = paginate(sorted);

  dealsEl.innerHTML = view.map((deal, i) => dealCard(deal, i)).join("") || "<p class='small'>No deals found.</p>";
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  wireCardActions(dealsEl);
}

async function boot() {
  allDeals = await getApprovedDeals();
  const brands = [...new Set(allDeals.map((d) => d.brand).filter(Boolean))].sort();
  brands.forEach((b) => brandSel.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`));
  render();
}

[searchInput, categorySel, brandSel, sortSel].forEach((el) => el.addEventListener("input", () => { page = 1; render(); }));
document.getElementById("prevPage").addEventListener("click", () => { if (page > 1) { page--; render(); }});
document.getElementById("nextPage").addEventListener("click", () => { page++; render(); });

boot();
