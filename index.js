var express = require("express");
var app = express();
var example = require("./example");
var listvideo = require("./listvideos");

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
var Token ;
app.get("/listvideo", (req, res) => {
  recall(null ,res);
});

function recall(Token ,res) {
  console.log("recall functions");
  listvideo.processRequest(function (err, data ,Token) {
    console.log("response");
    if (err)
      res.status(200).write("error");
    else {
      if (Token) {
        console.log(Token);
        var a =5;
        while (data['nextPageToken'] && a>0) {
          console.log("while loop da")
          recall(Token);
          a--;
        }
      }
      // if (data) {
      //   pushingkey = database.ref("/videos").set(data).then(res.status(200).write("done"));
      // }else {
      //   console.log("null ");
      // }
    }
    res.status(200).write("done");
  }, Token);
}


app.get("/", (req, res) => {
  example.processRequest(function (err, data) {
    if (err)
      res.status(200).write("error");
    else {
      if (data) {
        etag = data['title'];
        // console.log(etag,"from index.js printing title");
        // pushingkey = database.ref("/" + etag).set(data);
        pushingkey = database.ref("/" + etag).set(data).then(res.status(200).write("done"));

      } else {
        console.log("null ");
      }
    }
    res.status(200).write("done");
  });
});

app.get('/clearDB', (req, res) => {
  database.ref("/").set("h");
  res.status(200).write("done");
});

app.listen(3000);

