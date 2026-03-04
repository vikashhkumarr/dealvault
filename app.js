import { db, serverTimestamp } from "./firebase.js";
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp as firestoreTimestamp,
  updateDoc,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const categories = ["Hosting", "AI Tools", "Software", "Finance", "Shopping"];

export function formatDate(value) {
  if (!value) return "Limited-time offer";
  if (typeof value === "string") return value;
  const date = value.toDate ? value.toDate() : new Date(value);
  return `Expires ${date.toLocaleDateString()}`;
}

export function slugify(text = "") {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function trackMetric(dealId, key) {
  await addDoc(collection(db, "analytics"), {
    dealId,
    [key]: 1,
    timestamp: serverTimestamp()
  });
}

export async function incrementDealClicks(dealId) {
  await updateDoc(doc(db, "deals", dealId), {
    clicks: increment(1),
    updatedAt: firestoreTimestamp()
  });
}

export async function fetchApprovedDeals({ search = "", category = "", brand = "", max = 30 } = {}) {
  let q = query(collection(db, "deals"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  let deals = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (search) {
    const term = search.toLowerCase();
    deals = deals.filter((d) =>
      [d.title, d.brand, d.category].some((f) => String(f || "").toLowerCase().includes(term))
    );
  }
  if (category) deals = deals.filter((d) => (d.category || "") === category);
  if (brand) deals = deals.filter((d) => String(d.brand || "").toLowerCase().includes(brand.toLowerCase()));

  return deals;
}

export function cardVariant(index) {
  if (index % 5 === 0) return "featured";
  if (index % 5 === 2) return "wide";
  if (index % 5 === 4) return "tall";
  return "";
}

export function renderDealCard(deal, index = 0) {
  const variant = cardVariant(index);
  const tag = variant === "featured" ? "🔥 Featured" : "Community pick";
  const discount = deal.discount || "Deal Inside";
  const expire = formatDate(deal.expiresAt || deal.expire);

  return `
    <article class="deal-card ${variant}">
      <span class="tag">${tag}</span>
      <h3 class="deal-title">${deal.title || "Untitled Deal"}</h3>
      <p class="deal-brand">${deal.brand || "Unknown Brand"}</p>
      <div class="deal-discount">${discount}</div>
      <p class="deal-expire">${expire}</p>
      <div class="deal-actions">
        <button class="btn btn-primary" data-copy="${(deal.coupon || "").replace(/"/g, "&quot;")}">Copy Code</button>
        <a class="btn btn-ghost" href="/deal/${slugify(deal.title || deal.id)}?id=${deal.id}">Get Deal</a>
      </div>
      <small class="toast"></small>
    </article>
  `;
}

export async function getDealById(id) {
  const snap = await getDoc(doc(db, "deals", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function totalApprovedDeals() {
  const result = await getCountFromServer(query(collection(db, "deals"), where("status", "==", "approved")));
  return result.data().count;
}
