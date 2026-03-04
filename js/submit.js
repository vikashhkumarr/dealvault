import { auth, db, serverTimestamp } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { CATEGORIES, slugify } from "./app.js";

const form = document.getElementById("submitForm");
const msg = document.getElementById("submitMsg");
const catSelect = document.getElementById("category");
CATEGORIES.forEach((c) => catSelect.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));

let user = null;
onAuthStateChanged(auth, (u) => {
  user = u;
  document.getElementById("authHint").textContent = u ? `Signed in as ${u.email}` : "You must login to submit deals.";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!user) return (msg.textContent = "Please login first.");

  const payload = Object.fromEntries(new FormData(form));
  await addDoc(collection(db, "deals"), {
    title: payload.title,
    brand: payload.brand,
    coupon: payload.coupon,
    referralLink: payload.referralLink,
    category: payload.category,
    discount: payload.discount,
    description: payload.description,
    submittedBy: user.uid,
    clicks: 0,
    couponCopies: 0,
    createdAt: serverTimestamp(),
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    status: "pending",
    slug: slugify(`${payload.brand}-${payload.title}`)
  });

  form.reset();
  msg.textContent = "Submitted for review. Thank you!";
});
