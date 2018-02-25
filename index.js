

var express = require("express");
var app = express();
var example = require("./example");


var pushingkey;
var etag;

const firebase = require("firebase");
var config = {
  apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
  authDomain: "ajapp-192505.firebaseapp.com",
  databaseURL: "https://ajapp-192505.firebaseio.com",
  projectId: "ajapp-192505",
  storageBucket: "ajapp-192505.appspot.com",
  messagingSenderId: "512241350585"
};
firebase.initializeApp(config);

var database = firebase.database();
app.get("/", (req, res) => {
  example.processRequest(function (err, data) {
    if (err)
      res.status(200).write("error");
    else {
      if (data) {
        console.log(data);
        etag = data['etag'] ;
        pushingkey = database.ref("/" + etag).set(data);
      }else {
        console.log("null ");
      }
    }
    //comment that later
    res.status(200).write("done");
  });

});
app.get('/clearDB',(req,res)=>{
  database.ref("/").set("h");
});
app.listen(3000);

