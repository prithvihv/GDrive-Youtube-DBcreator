let config = {
    apiKey: "AIzaSyDLi5odhLcnMqKim-bj9Z6kQyeg7-6DKmo",
    authDomain: "ajappprod.firebaseapp.com",
    databaseURL: "https://ajappprod.firebaseio.com",
    projectId: "ajappprod",
    storageBucket: "ajappprod.appspot.com",
    messagingSenderId: "485319972083"
};
// let config = {
//     apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
//     authDomain: "ajapp-192505.firebaseapp.com",
//     databaseURL: "https://ajapp-192505.firebaseio.com",
//     projectId: "ajapp-192505",
//     storageBucket: "ajapp-192505.appspot.com",
//     messagingSenderId: "512241350585"
// };
const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();

async function main() {
    await NewC();
    console.log("done");
}

async function NewC() {
    await database.ref('/NEW-Collections-Meta').remove();
    await database.ref('NEW-Collections').remove();
}

main();
