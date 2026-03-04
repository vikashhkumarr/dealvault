import { db } from "./firebase.js";

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.addDeal = async function(){

const title=document.getElementById("title").value;

const brand=document.getElementById("brand").value;

const coupon=document.getElementById("coupon").value;

const referral=document.getElementById("referral").value;

await addDoc(collection(db,"deals"),{

title:title,
brand:brand,
coupon:coupon,
referral:referral,
date:Date.now()

});

alert("Deal Added!");

}