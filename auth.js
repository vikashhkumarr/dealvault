function login(){

const email = document.getElementById("email").value

const password = document.getElementById("password").value

firebase.auth().signInWithEmailAndPassword(email,password)

.then(()=>{

window.location="admin.html"

})

.catch((error)=>{

alert(error.message)

})

}