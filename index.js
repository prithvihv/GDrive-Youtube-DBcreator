//Node stuff
let express = require("express");
const cors = require("cors");
//firebase

//const functions = require('firebase-functions');
const admin = require('firebase-admin');
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

// var serviceAccount = require('./ajapp-192505-firebase-adminsdk-22c7e-b56dca2e7c.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://ajapp-192505.firebaseio.com/'
// });

//routes
let playlist = require("./routes/playlist");
let playlistitemTHING = require('./routes/playlistitemTHING');
let proccess = require("./routes/process");
let videoTime = require("./routes/videoT");

//random letiables
const ArrayChannelVideos = ['UUrsXeU6cuGStvMCUhAgULyg', 'UUNmRmSpIJYqu7ttPLWLx2sw'];
let ArrayPlaylist = ['UCrsXeU6cuGStvMCUhAgULyg', 'UCNmRmSpIJYqu7ttPLWLx2sw'];
let ArrayVideos = [];
let callnumber = 0;
let indexArrayVideos = 0;


const app = express();

app.use(cors({ origin: true }));

//START test routes----------------------------------------------------------//
{
    app.get('/', (req, res) => {
        res.send("Welcome To The Jungle");
    });
    app.get('/helloworld', (req, res) => {
        res.send("hello");

    });

    app.get('/clearDB', (req, res) => {
        database.ref("/").set(":)").then(function () {
            console.log("db cleared");
            indexArrayVideos = 0;
        });
        res.status(200).write("done");
    });
}
//END test routes-----------------------------------------------------------//

//notes:
/*
    * first get all videos and write them 
    * then sort then and write them 
    * try quering all 2000 and paginating
*/

//START Videos routes---------------------------------------------------------//
app.get('/listvideo', (req, res) => {
    playlistitemTHING.processRequest(function again(err, data, token) {
        if (err)
            res.status(200).write("error");
        else {
            if (indexArrayVideos < ArrayChannelVideos.length) {
                // database.ref("/videos/packet" + callnumber).set(data).then(() => {
                //     console.log("datapacket written packet number :" + callnumber);
                // });
                data["items"].forEach(video => {
                    var temp = {};
                    callnumber++;
                    temp["title"] = video.snippet.title;
                    temp["videoID"] = video.snippet.resourceId.videoId;
                    temp["publishedAt"] = new Date(video.snippet.publishedAt).toString();
                    temp["timestamp"] = new Date(video.snippet.publishedAt).valueOf();
                    console.log(temp);
                    database.ref("allvideos/" + video.snippet.resourceId.videoId).set(temp).then(() => {
                        // console.log("video written title and id is :" + temp.title + " : " + temp.publishedAt +" : call number is : " + callnumber);
                    });

                });
                if (token != null || token !== undefined) {
                    playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                } else {
                    indexArrayVideos++;
                    console.log(data);
                    console.log("Next video :" + indexArrayVideos + "and player is :" + ArrayChannelVideos[indexArrayVideos]);
                    if (indexArrayVideos < ArrayChannelVideos.length)
                        playlistitemTHING.processRequest(again, null, ArrayChannelVideos[indexArrayVideos]);
                    else {
                        console.log("done da u chill now");
                        res.status(200).write("DONE");
                        indexArrayVideos=0;

                    }
                }
            } else {
                console.log("DONE BOI");
                console.log(callnumber)
            }
        }
        res.status(200).write("writing vidoes......");
    }, null, ArrayChannelVideos[indexArrayVideos]);
});

//END Videos routes---------------------------------------------------------//

//START VideosTimeQuerying routes---------------------------------------------------------//
app.get('/videoT', (req, res) => {
    //first make list of data
    database.ref("/allvideos").once('value').then(function (allvideos) {
        allvideos.forEach(video => {
            ArrayVideos.push(video.child("videoID").val());
        });
    }).then(() => {
        console.log(ArrayVideos.length);
        videoTime.getVid(function (data) {
            data["items"].forEach((item) => {
                temp = {
                    "duration": item["contentDetails"]["duration"]
                }
                database.ref("/allvideos/" + item['id']).update(temp);
            });
        }, ArrayVideos);
        res.status(200).send("Updating database.......");
    });
});
//END VideosTimeQuerying routes---------------------------------------------------------//

app.listen(process.env.PORT || 3000, () => {
    console.log("Api up and running");
});

// exports.api = functions.https.onRequest(app);
//
// exports.helloworld = functions.https.onRequest((req,res)=>{
//     res.send("hello priya ");
// });



app.get('/getV', (req, res) => {
    //first make list of data
    database.ref("/allvideos").once('value').then(function (allvideos) {
            allvideos.forEach(video => {
                ArrayVideos.push(video.child("videoID").val());
            });
        }).then(()=>{
            console.log(ArrayVideos.length);
            videoTime.getVid(function (data) {
                data["items"].forEach((item) => {
                    temp = {
                        "duration": item["contentDetails"]["duration"]
                    }
                    database.ref("/allvideos/" + item['id']).update(temp);
                });
            }, ArrayVideos);
        });
        res.status(200).send("Updating database.......");
});



function writevideoDetails(video,data) {
    database.ref("allvideos/" + video.snippet.resourceId.videoId).once('value').then(dataSnap => {
        var temp = dataSnap.val();
        database.ref("playlists/" + video.snippet.playlistId + "/videos/" + video.snippet.resourceId.videoId).set(temp).then(value => {
        });
    });
}
function writeExtraDetails(data){
    database.ref("playlists/" + data.playlistid).update({"title":data.title,"noofvideos":data.pageInfo.totalResults,"playlist":data.playlistid});
}
//START PlaylistsAndVideos routes---------------------------------------------------------//
app.get("/playlist", (req, res) => {
    for(var i=0 ; i<ArrayPlaylist.length;i++){
        console.log(i);
        playlist.processRequest(function again(err, data, token) {
            if (err)
                res.status(200).write("error");
            else {
                //database.ref("playlists/"+playliststring +"/title/").set(data['title']);
                if (token != undefined || token != null) {
                    proccess.getVideos(data['playlistid'], again, data['title'], data['nextPageToken']);
                }
                writeExtraDetails(data);
                data.items.forEach(video => {
                    writevideoDetails(video,data);
                });

            }
        }, ArrayPlaylist[i]);
    }
    res.status(200).write("done writing playlists");

});
//video.snippet.resourceId.videoId, video.snippet.playlistId
//END PlaylistsAndVideos routes---------------------------------------------------------//

app.get("/updateVideos",(req,res)=>{
    database.ref("/allvideos").once('value').then(function (allvideos) {
        console.log(allvideos.numChildren());
        database.ref("/general").set({"NoofVideos" : allvideos.numChildren()})
    });
});