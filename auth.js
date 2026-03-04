import { auth, db, serverTimestamp } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const resetForm = document.getElementById("resetForm");
const statusEl = document.getElementById("authStatus");
const userChip = document.getElementById("userChip");
const logoutButtons = document.querySelectorAll("[data-logout]");

async function fetchRole(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data().role || "user" : "user";
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginForm.email.value.trim(), loginForm.password.value);
      window.location.href = "/";
    } catch (error) {
      statusEl.textContent = error.message;
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const credential = await createUserWithEmailAndPassword(auth, signupForm.email.value.trim(), signupForm.password.value);
      await setDoc(doc(db, "users", credential.user.uid), {
        id: credential.user.uid,
        email: credential.user.email,
        role: "user",
        createdAt: serverTimestamp()
      });
      statusEl.textContent = "Account created!";
    } catch (error) {
      statusEl.textContent = error.message;
    }
  });
}

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetForm.email.value.trim());
      statusEl.textContent = "Password reset email sent.";
    } catch (error) {
      statusEl.textContent = error.message;
    }
  });
}

logoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
});

onAuthStateChanged(auth, async (user) => {
  if (!userChip) return;
  if (!user) {
    userChip.textContent = "Guest";
    return;
  }
  const role = await fetchRole(user.uid);
  userChip.textContent = `${user.email} (${role})`;
});
