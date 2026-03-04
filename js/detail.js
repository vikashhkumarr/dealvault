import { db } from "./firebase.js";
import { collection, getDocs, limit, orderBy, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { dealCard, navigateReferral, trackEvent, wireCardActions } from "./app.js";

const detail = document.getElementById("dealDetail");
const related = document.getElementById("relatedDeals");

async function boot() {
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) {
    detail.innerHTML = "<p>Deal not found.</p>";
    return;
  }

  const q = query(collection(db, "deals"), where("slug", "==", slug), where("status", "==", "approved"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    detail.innerHTML = "<p>Deal not found.</p>";
    return;
  }

  const dealDoc = snap.docs[0];
  const deal = { id: dealDoc.id, ...dealDoc.data() };

  detail.innerHTML = `
    <h1>${deal.title}</h1>
    <p class="brand">${deal.brand}</p>
    <p class="meta">${deal.category || "General"}</p>
    <p style="margin:12px 0 18px">${deal.description || "No description provided."}</p>
    <div class="discount">${deal.discount || "Deal Inside"}</div>
    <p class="expire" style="margin-top:10px">Code: <strong>${deal.coupon || "N/A"}</strong></p>
    <div class="actions" style="margin-top:16px">
      <button id="copyBtn" class="btn btn-primary">Copy Code</button>
      <button id="goBtn" class="btn">Get Deal</button>
    </div>
    <p id="feedback" class="copy-feedback"></p>
  `;

  document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!deal.coupon) return;
    await navigator.clipboard.writeText(deal.coupon);
    await trackEvent({ dealId: deal.id, field: "couponCopies" });
    document.getElementById("feedback").textContent = "Coupon copied";
  });

  document.getElementById("goBtn").addEventListener("click", () => navigateReferral(deal.id));

  const relatedQ = query(
    collection(db, "deals"),
    where("status", "==", "approved"),
    where("category", "==", deal.category || ""),
    orderBy("createdAt", "desc"),
    limit(3)
  );
  const relatedSnap = await getDocs(relatedQ);
  const relatedDeals = relatedSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => d.id !== deal.id);
  related.innerHTML = relatedDeals.map((d, i) => dealCard(d, i)).join("");
  wireCardActions(related);
}

boot();
