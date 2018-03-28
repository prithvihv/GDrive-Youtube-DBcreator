//Node stuff
let express = require("express");
const cors = require("cors");
//firebase

const functions = require('firebase-functions');
//const admin = require('firebase-admin');
let config = {
    apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
    authDomain: "ajapp-192505.firebaseapp.com",
    databaseURL: "https://ajapp-192505.firebaseio.com",
    projectId: "ajapp-192505",
    storageBucket: "ajapp-192505.appspot.com",
    messagingSenderId: "512241350585"
};
const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();
//admin.initializeApp(functions.config().firebase);

//routes
let playlist = require("./routes/playlist");
let playlistitemTHING = require('./routes/playlistitemTHING');
let proccess = require("./routes/process");
let videoTime = require("./routes/videoT");

//random letiables
const ArrayChannelVideos = ['UUNmRmSpIJYqu7ttPLWLx2sw', 'UUrsXeU6cuGStvMCUhAgULyg'];
let ArrayPlaylist = ['UCrsXeU6cuGStvMCUhAgULyg', 'UCNmRmSpIJYqu7ttPLWLx2sw'];
let ArrayVideos = [];
let callnumber = 0;
let indexArrayVideos = 0;

const app = express();

app.use(cors({ origin: true }));

//START test routes----------------------------------------------------------//
{
    app.get('/', (req, res) => {
        res.send("Welcome to Jungle");
    });
    app.get('/helloworld', (req, res) => {
        res.send("hello");
    });

    app.get('/clearDB', (req, res) => {
        database.ref("/").set(":)").then(function () {
            console.log("db cleared");
        });
        res.status(200).write("done");
    });
}
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
                });
                callnumber++;
                if (token != null || token !== undefined) {
                    playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                } else {
                    token = null;
                    indexArrayVideos++;
                    console.log("Next video :" + indexArrayVideos);
                    if (indexArrayVideos < ArrayChannelVideos.length)
                        playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                    else {
                        console.log("done da u chill now");
                        res.status(200).write("DONE");
                    }
                }
            } else {
                console.log("DONE BOI");
            }
        }
        res.status(200).write("writing vidoes......");
    }, null, ArrayChannelVideos[indexArrayVideos]);
});
//END Videos routes---------------------------------------------------------//

//START PlaylistsAndVideos routes---------------------------------------------------------//
app.get("/playlist", (req, res) => {
    playlist.processRequest(function again(err, data, call) {
        if (call == null || call === undefined) {
            call = 0;
            console.log("undefined call")
        }
        if (err)
            res.status(200).write("error");
        else {
            database.ref("/playlists/" + data['title'] + "/packet" + call).set(data);
            if (data['nextPageToken'] != null || data['nextPageToken'] !== undefined) {
                console.log("getting more videos");
                call = call + 1;
                proccess.getVideos(data['playlistid'], again, data['title'], data['nextPageToken'], call);
            } else {
                console.log("OR");
                res.status(200).write("Completed writing");
                indexArrayVideos++;
                if (indexArrayVideos < ArrayPlaylist.length)
                    playlist.processRequest(again, ArrayPlaylist[indexArrayVideos]);
                else {
                    console.log("done da u chill now");
                    res.status(200).write("DONE")
                }
            }
        }
        res.status(200).write("writing plalists.....");
    }, ArrayPlaylist[0]);
});
//END PlaylistsAndVideos routes---------------------------------------------------------//

//START VideosTimeQuerying routes---------------------------------------------------------//
app.get('/videoT', (req, res) => {
    //first make list of data
    database.ref("/videos").once('value').then(function (packets) {
        packets.forEach(packet=>{
            packet.child('items').forEach(videoitem=>{
                ArrayVideos.push(videoitem.child('snippet').child('resourceId').child('videoId').val());
            });
        });
    }).then(()=>{
        videoTime.getVid(function (data) {
            data["items"].forEach((item)=>{
                database.ref("/timeV/" + item['id']).set(item["contentDetails"]["duration"]).then(()=>{
                    console.log("done writing times");
                });
            });
        },ArrayVideos);
        res.status(200).send("Updating database");
    });
});
//END VideosTimeQuerying routes---------------------------------------------------------//

app.listen(process.env.PORT ||3000, () => {
    console.log("Api up and running");
});

// exports.api = functions.https.onRequest(app);
//
// exports.helloworld = functions.https.onRequest((req,res)=>{
//     res.send("hello priya ");
// });
