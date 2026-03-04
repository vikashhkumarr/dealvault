import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC48oL4RCxONkat4DTKVjparBkbJgdHJpo",
  authDomain: "coupon-app-39c05.firebaseapp.com",
  projectId: "coupon-app-39c05",
  storageBucket: "coupon-app-39c05.firebasestorage.app",
  messagingSenderId: "1021067457486",
  appId: "1:1021067457486:web:63bab0b651c77f5184719f",
  measurementId: "G-B11WD909VZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics = null;
analyticsSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app);
});

export { app, db, auth, analytics, serverTimestamp };
