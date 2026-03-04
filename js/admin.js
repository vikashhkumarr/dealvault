import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getTopAnalytics } from "./app.js";

const tbody = document.getElementById("pendingRows");
const kpi = {
  pending: document.getElementById("kpiPending"),
  approved: document.getElementById("kpiApproved"),
  clicks: document.getElementById("kpiClicks"),
  copies: document.getElementById("kpiCopies")
};

async function requireAdmin(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() && snap.data().role === "admin";
}

async function loadDashboard() {
  const pendingQ = query(collection(db, "deals"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const approvedQ = query(collection(db, "deals"), where("status", "==", "approved"));
  const [pending, approved, top] = await Promise.all([getDocs(pendingQ), getDocs(approvedQ), getTopAnalytics()]);

  kpi.pending.textContent = pending.size;
  kpi.approved.textContent = approved.size;
  kpi.clicks.textContent = top.reduce((s, d) => s + (d.clicks || 0), 0);
  kpi.copies.textContent = top.reduce((s, d) => s + (d.couponCopies || 0), 0);

  tbody.innerHTML = pending.docs.map((d) => {
    const deal = d.data();
    return `<tr>
      <td>${deal.title}</td>
      <td>${deal.brand}</td>
      <td>${deal.category || "-"}</td>
      <td>
        <button class="btn btn-primary" data-a="approve" data-id="${d.id}">Approve</button>
        <button class="btn btn-outline" data-a="reject" data-id="${d.id}">Reject</button>
        <button class="btn btn-danger" data-a="delete" data-id="${d.id}">Delete</button>
      </td>
    </tr>`;
  }).join("") || "<tr><td colspan='4' class='small'>No pending deals</td></tr>";

  tbody.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const action = btn.dataset.a;
    if (action === "approve") await updateDoc(doc(db, "deals", id), { status: "approved" });
    if (action === "reject") await updateDoc(doc(db, "deals", id), { status: "rejected" });
    if (action === "delete") await deleteDoc(doc(db, "deals", id));
    await loadDashboard();
  }));
}

onAuthStateChanged(auth, async (user) => {
  const gate = document.getElementById("adminGate");
  const app = document.getElementById("adminApp");
  if (!user) {
    gate.textContent = "Please login as admin.";
    return;
  }
  if (!(await requireAdmin(user))) {
    gate.textContent = "Access denied: admin only.";
    return;
  }
  gate.classList.add("hidden");
  app.classList.remove("hidden");
  loadDashboard();
});
