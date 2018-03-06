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

var callnumber =1;

app.get("/listvideo", (req, res) => {
  listvideo.processRequest(function again(err, data, token) {
    console.log("token from index callback")
    console.log(token);
    if (err)
      res.status(200).write("error");
    else {
      if (data) {
        pushingkey = database.ref("/videos" + callnumber ).set(data).then(res.status(200).write("done"));
        callnumber++;
        if (token) {
          console.log("going to call process");
          listvideo.processRequest(again , token);
        }
      } else {
        console.log("null ");
      }
    }

    res.status(200).write("done");
  });
});

// app.get("/", (req, res) => {
//   example.processRequest(function (err, data, token) {
//     console.log("token from index callback")
//     console.log(token);
//     if (err)
//       res.status(200).write("error");
//     else {
//       if (data) {
//         etag = data['title'];
//         // console.log(etag,"from index.js printing title");
//         // pushingkey = database.ref("/" + etag).set(data);
//         pushingkey = database.ref("/" + etag).set(data).then(res.status(200).write("done"));
//         if(data['nextPageToken']){
//           console.log("going to call process");
//           // example.processRequest(again , token);
//         }
//       } else {
//         console.log("null ");
//       }
//     }
//     res.status(200).write("done");
//   },token);
// });



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

