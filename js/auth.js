import { auth, db, serverTimestamp } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const status = document.getElementById("authStatus");

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email: user.email, role: "user", createdAt: serverTimestamp() });
  }
}

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password);
  status.textContent = "Logged in.";
};

window.signup = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user);
  status.textContent = "Account created.";
};

window.resetPassword = async () => {
  const email = document.getElementById("email").value;
  await sendPasswordResetEmail(auth, email);
  status.textContent = "Password reset email sent.";
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  const state = document.getElementById("sessionState");
  if (!state) return;
  if (user) {
    await ensureUserDoc(user);
    state.textContent = `Active session: ${user.email}`;
  } else {
    state.textContent = "No active session";
  }
});
