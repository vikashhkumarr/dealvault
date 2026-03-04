import { auth, db, serverTimestamp } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { categories } from "./app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const form = document.getElementById("submitForm");
const category = document.getElementById("category");
const statusEl = document.getElementById("submitStatus");

category.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");

let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    statusEl.textContent = "Please login to submit a deal.";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    statusEl.textContent = "Login required before submitting.";
    return;
  }

  const payload = {
    title: form.title.value.trim(),
    brand: form.brand.value.trim(),
    coupon: form.coupon.value.trim(),
    referralLink: form.referralLink.value.trim(),
    category: form.category.value,
    description: form.description.value.trim(),
    discount: form.discount.value.trim(),
    expiresAt: form.expiresAt.value,
    submittedBy: currentUser.uid,
    clicks: 0,
    createdAt: serverTimestamp(),
    status: "pending"
  };

  await addDoc(collection(db, "deals"), payload);
  form.reset();
  statusEl.textContent = "Deal submitted for review ✅";
});
