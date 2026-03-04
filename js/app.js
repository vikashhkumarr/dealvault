import { db, serverTimestamp } from "./firebase.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const CATEGORIES = ["Hosting", "AI Tools", "Software", "Finance", "Shopping"];

export function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function scoreTrending(deal) {
  const created = deal.createdAt?.toMillis?.() || Date.now();
  const ageHours = Math.max(1, (Date.now() - created) / 36e5);
  const clicks = deal.clicks || 0;
  const copies = deal.couponCopies || 0;
  return (clicks * 1.4 + copies * 2.2 + 25) / Math.sqrt(ageHours);
}

export async function getApprovedDeals() {
  const q = query(collection(db, "deals"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function applyFilters(deals, { search = "", category = "", brand = "" } = {}) {
  const term = search.toLowerCase().trim();
  return deals.filter((d) => {
    const hay = `${d.title || ""} ${d.brand || ""} ${d.category || ""}`.toLowerCase();
    const passSearch = !term || hay.includes(term);
    const passCategory = !category || d.category === category;
    const passBrand = !brand || d.brand === brand;
    return passSearch && passCategory && passBrand;
  });
}

export function sortDeals(deals, key = "trending") {
  const copy = [...deals];
  if (key === "newest") return copy.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  if (key === "popular") return copy.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  return copy.sort((a, b) => scoreTrending(b) - scoreTrending(a));
}

export function dealCard(deal, modeIndex = 0) {
  const feature = modeIndex % 6 === 0 ? "featured" : modeIndex % 4 === 0 ? "wide" : "";
  const discount = deal.discount || "Deal Inside";
  const expire = deal.expiresAt ? new Date(deal.expiresAt.seconds * 1000).toLocaleDateString() : "Limited-time";
  const slug = deal.slug || slugify(deal.title || deal.id);

  return `
    <article class="card ${feature}">
      <span class="tag">${feature === "featured" ? "🔥 Trending" : "Community pick"}</span>
      <h3 class="title">${deal.title || "Untitled Deal"}</h3>
      <p class="brand">${deal.brand || "Unknown Brand"}</p>
      <div class="discount">${discount}</div>
      <p class="expire">Expires: ${expire}</p>
      <div class="actions">
        <button class="btn btn-primary" data-copy="${(deal.coupon || "").replace(/"/g, "&quot;")}">Copy Code</button>
        <a class="btn" href="/deal.html?slug=${slug}">View Deal</a>
        <a class="btn btn-outline" target="_blank" rel="noopener" data-go="${deal.id}">Get Deal</a>
      </div>
      <div class="copy-feedback" aria-live="polite"></div>
    </article>
  `;
}

export async function trackEvent({ dealId, field }) {
  const dealRef = doc(db, "deals", dealId);
  await updateDoc(dealRef, { [field]: increment(1) });
  await addDoc(collection(db, "analytics"), {
    dealId,
    clicks: field === "clicks" ? 1 : 0,
    couponCopies: field === "couponCopies" ? 1 : 0,
    timestamp: serverTimestamp()
  });
}

export async function navigateReferral(dealId) {
  const dealRef = doc(db, "deals", dealId);
  const deal = await getDoc(dealRef);
  if (!deal.exists()) return;
  const data = deal.data();
  await trackEvent({ dealId, field: "clicks" });
  if (data.referralLink) window.open(data.referralLink, "_blank", "noopener");
}

export function wireCardActions(scope = document) {
  scope.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const coupon = btn.dataset.copy || "";
      if (!coupon) return;
      await navigator.clipboard.writeText(coupon);
      const card = btn.closest(".card");
      const dealId = card?.querySelector("[data-go]")?.dataset.go;
      if (dealId) await trackEvent({ dealId, field: "couponCopies" });
      const feedback = card?.querySelector(".copy-feedback");
      if (feedback) {
        feedback.textContent = `Copied: ${coupon}`;
        setTimeout(() => (feedback.textContent = ""), 1600);
      }
    });
  });

  scope.querySelectorAll("[data-go]").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await navigateReferral(link.dataset.go);
    });
  });
}

export async function getTopAnalytics() {
  const q = query(collection(db, "deals"), where("status", "==", "approved"), orderBy("clicks", "desc"), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
