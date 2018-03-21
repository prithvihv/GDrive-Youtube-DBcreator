const functions = require('firebase-functions');
var express = require("express");
const cors = require("cors")
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// const firebase = require("firebase");
// var config = {
//     apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
//     authDomain: "ajapp-192505.firebaseapp.com",
//     databaseURL: "https://ajapp-192505.firebaseio.com",
//     projectId: "ajapp-192505",
//     storageBucket: "ajapp-192505.appspot.com",
//     messagingSenderId: "512241350585"
// };
// firebase.initializeApp(config);
// const admin = require('firebase-admin');
// admin.initializeApp(functions.config().firebase);
// var database = firebase.database();

const app = express();
app.use(cors({ origin: true }));

app.get('/',(req,res)=>{
    res.send("Welcome to Junngle");
});

app.get('/helloworld', (req, res) => {
    res.send("hello");
});

exports.api = functions.https.onRequest(app);

exports.helloworld = functions.https.onRequest((req,res)=>{
    res.send("hello priya ");
});