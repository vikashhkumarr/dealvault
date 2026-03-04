import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tableBody = document.getElementById("adminDeals");
const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const clickCount = document.getElementById("clickCount");
const gate = document.getElementById("adminGate");
const panel = document.getElementById("adminPanel");

async function isAdmin(uid) {
  const users = await getDocs(query(collection(db, "users"), where("id", "==", uid)));
  return users.docs[0]?.data()?.role === "admin";
}

async function loadStats() {
  const allDeals = await getDocs(collection(db, "deals"));
  const list = allDeals.docs.map((d) => d.data());
  pendingCount.textContent = list.filter((d) => d.status === "pending").length;
  approvedCount.textContent = list.filter((d) => d.status === "approved").length;
  clickCount.textContent = list.reduce((sum, d) => sum + (d.clicks || 0), 0);
}

async function loadDeals() {
  const snap = await getDocs(query(collection(db, "deals"), orderBy("createdAt", "desc")));
  tableBody.innerHTML = "";

  snap.forEach((row) => {
    const deal = row.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${deal.title || "Untitled"}</td>
      <td>${deal.brand || "-"}</td>
      <td><span class="badge ${deal.status || "pending"}">${deal.status || "pending"}</span></td>
      <td>${deal.clicks || 0}</td>
      <td>
        <button class="btn btn-primary" data-action="approve">Approve</button>
        <button class="btn btn-ghost" data-action="reject">Reject</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </td>
    `;

    tr.querySelector('[data-action="approve"]').onclick = async () => {
      await updateDoc(doc(db, "deals", row.id), { status: "approved" });
      loadDeals();
      loadStats();
    };

    tr.querySelector('[data-action="reject"]').onclick = async () => {
      await updateDoc(doc(db, "deals", row.id), { status: "rejected" });
      loadDeals();
      loadStats();
    };

    tr.querySelector('[data-action="delete"]').onclick = async () => {
      await deleteDoc(doc(db, "deals", row.id));
      loadDeals();
      loadStats();
    };

    tableBody.appendChild(tr);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    gate.textContent = "Please login as admin.";
    return;
  }

  const admin = await isAdmin(user.uid);
  if (!admin) {
    gate.textContent = "Access denied. Admin role required.";
    return;
  }

  gate.classList.add("hidden");
  panel.classList.remove("hidden");
  await loadStats();
  await loadDeals();
});
