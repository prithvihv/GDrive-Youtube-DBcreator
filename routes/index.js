var express = require("express");
var app = express();

var example = require("./example");
var listvideo = require("./listvideos");
var playlistitemTHING = require('./playlistitemTHING');

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

var callnumber= 0 ;
var ArrayChannelVideos = ['UUNmRmSpIJYqu7ttPLWLx2sw','UUrsXeU6cuGStvMCUhAgULyg'] ;
var indexArrayVideos= 0;

app.get("/listvideo", (req, res) => {
  playlistitemTHING.processRequest(function again(err, data, token) {
    if (err)
      res.status(200).write("error");
    else {
      // console.log(data["items"].length , "before if") ;
      console.log(callnumber);
      //data["items"].length > 0
      if (indexArrayVideos<2) {
        pushingkey = database.ref("/videos/packet" + callnumber ).set(data).then(res.status(200).write("done"));
        callnumber++;
        if (token) {
          playlistitemTHING.processRequest(again , token, ArrayChannelVideos[indexArrayVideos]);
        }else{
          token = null;
          indexArrayVideos++;
          playlistitemTHING.processRequest(again , token , ArrayChannelVideos[indexArrayVideos]);
        }
      } 
    }
    res.status(200).write("done");
  },null,ArrayChannelVideos[indexArrayVideos]);
});

app.get("/", (req, res) => {
  example.processRequest(function (err, data) {
    if (err)
      res.status(200).write("error");
    else {
      if (data) {
        etag = data['title'];
        // console.log(etag,"from index.js printing title");
        // pushingkey = database.ref("/" + etag).set(data);
        pushingkey = database.ref("/playlists/" + etag).set(data).then(res.status(200).write("done"));
      } else {
        console.log("null ");
      }
    }
    res.status(200).write("done");
  });
});

app.get('/clearDB', (req, res) => {
  database.ref("/").set("h").then(function(){
    console.log("db cleared");
    res.status(200).write("done");
  });
});

app.listen(3000);

