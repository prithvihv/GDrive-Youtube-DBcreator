//Node stuff
var express = require("express");
const cors = require("cors")

//firebase
const firebase = require("firebase");
var config = {
    apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
    authDomain: "ajapp-192505.firebaseapp.com",
    databaseURL: "https://ajapp-192505.firebaseio.com",
    projectId: "ajapp-192505",
    storageBucket: "ajapp-192505.appspot.com",
    messagingSenderId: "512241350585"
};
//const functions = require('firebase-functions');
const admin = require('firebase-admin');

//more firebase

firebase.initializeApp(config);
var database = firebase.database();
//admin.initializeApp(functions.config().firebase);
//routes
var playlist = require("../routes/playlist");
var playlistitemTHING = require('../routes/playlistitemTHING');
var proccess = require("../routes/process");

//random variables
var ArrayChannelVideos = ['UUNmRmSpIJYqu7ttPLWLx2sw', 'UUrsXeU6cuGStvMCUhAgULyg'];
var ArrayPlaylist = ['UCrsXeU6cuGStvMCUhAgULyg' , 'UCNmRmSpIJYqu7ttPLWLx2sw'];
var callnumber = 0;
var indexArrayVideos = 0;

const app = express();

app.use(cors({ origin: true }));

//START test routes----------------------------------------------------------//
app.get('/', (req, res) => {
    res.send("Welcome to Junngle");
});

app.get('/helloworld', (req, res) => {
    res.send("hello");
});

app.get('/clearDB', (req, res) => {
    database.ref("/videos").set(":)").then(function () {
        console.log("db cleared");
    });
    res.status(200).write("done");
});
//END test routes-----------------------------------------------------------//

//START Videos routes---------------------------------------------------------//
app.get('/listvideo', (req, res) => {
    playlistitemTHING.processRequest(function again(err, data, token) {
        if (err)
            res.status(200).write("error");
        else {
            if (indexArrayVideos < ArrayChannelVideos.length) {
                database.ref("/videos/packet" + callnumber).set(data).then(() => {
                    console.log("datapacket written packet number :" + callnumber);
                }
                );
                callnumber++;
                if (token != null || token != undefined) {
                    playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                } else {
                    token = null;
                    indexArrayVideos++;
                    console.log("Next video :" + indexArrayVideos);
                    if (indexArrayVideos < ArrayChannelVideos.length)
                        playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                    else {
                        console.log("done da u chill now");
                        res.status(200).write("DOOONNEEEE")
                    }
                }
            } else {
                console.log("DONNNNNEEE BOI")
                res.status(200).write("Completed writing");
            }
        }
        res.status(200).write("done");
    }, null, ArrayChannelVideos[indexArrayVideos]);
});
//END Videos routes---------------------------------------------------------//


//START PlaylistsAndVideos routes---------------------------------------------------------//
app.get("/playlist", (req, res) => {
    playlist.processRequest(function again(err, data) {
        if (err)
            res.status(200).write("error");
        else {
            if (indexArrayVideos < ArrayChannelVideos.length) {
                database.ref("/playlists/" + data['title'] + "/packet" + callnumber).set(data);
                callnumber++;
                if (data['nextPageToken'] != null || data['nextPageToken'] != undefined) {
                    proccess.getVideos(data['playlistid'], again, data['title']);
                } else {
                    callnumber=0;
                    console.log("OR");
                    res.status(200).write("Completed writing");
                    //indexArrayVideos++;
                    // if (indexArrayVideos < ArrayChannelVideos.length)
                    //     playlist.processRequest(again);
                    // else {
                    //     console.log("done da u chill now");
                    //     res.status(200).write("DOOONNEEEE")
                    // }
                }
            } else {
                res.status(200).write("Completed writing");
            }
        }
    });
    res.status(200).write("done");
});
//END PlaylistsAndVideos routes---------------------------------------------------------//


app.listen(3000, () => {
    console.log("Api up and running");
});

// exports.api = functions.https.onRequest(app);

// exports.helloworld = functions.https.onRequest((req,res)=>{
//     res.send("hello priya ");
// });