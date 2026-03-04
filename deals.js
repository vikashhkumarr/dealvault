import { db } from "./firebase.js";

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const dealsContainer = document.getElementById("deals");

async function loadDeals(){

const querySnapshot = await getDocs(collection(db,"deals"));

querySnapshot.forEach((doc)=>{

const deal = doc.data();

const card = `

<div class="deal-card">

<h3>${deal.title}</h3>

<p>${deal.brand}</p>

<button onclick="goDeal('${deal.referral}')">

Get Deal

</button>

</div>

`;

dealsContainer.innerHTML += card;

});

}

loadDeals();

window.goDeal = function(link){

window.open(link,"_blank");

}