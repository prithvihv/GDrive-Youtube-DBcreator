//Node stuff
let express = require("express");
const cors = require("cors");
var deepEqual = require('deep-equal');
//firebase

//const functions = require('firebase-functions');
//const admin = require('firebase-admin');
//first version database 
// let config = {
//     apiKey: "AIzaSyAufTAIIp28e8nJL_Ek1DeDxuCEJKJHKI4",
//     authDomain: "ajapp-192505.firebaseapp.com",
//     databaseURL: "https://ajapp-192505.firebaseio.com",
//     projectId: "ajapp-192505",
//     storageBucket: "ajapp-192505.appspot.com",
//     messagingSenderId: "512241350585"
// };
//test database 
let config = {
    apiKey: "AIzaSyDLi5odhLcnMqKim-bj9Z6kQyeg7-6DKmo",
    authDomain: "ajappprod.firebaseapp.com",
    databaseURL: "https://ajappprod.firebaseio.com",
    projectId: "ajappprod",
    storageBucket: "ajappprod.appspot.com",
    messagingSenderId: "485319972083"
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

app.listen(process.env.PORT || 3000, () => {
    // console.log("Api up and running");
    RouteAllvideos().then(() => {
        console.log("Video data writen");
        RouteVideTime().then(() => {
            console.log("Video Time writen");
            Routeplaylist().then(() => {
                console.log("Playlists updated");
                RouteCountallVideos().then(() => {
                    console.log("Counted videos");
                });
            });
        });
    });
});

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
        res.send("Cleared DB");
    });
}
//END test routes-----------------------------------------------------------//

//START Videos routes---------------------------------------------------------//
function RouteAllvideos() {
    indexArrayVideos = 0;
    return new Promise((resolve, reject) => {
        playlistitemTHING.processRequest(function again(err, data, token) {
            if (err)
                res.status(200).write("error");
            else {
                if (data) {
                    // database.ref("/videos/packet" + callnumber).set(data).then(() => {
                    //     console.log("datapacket written packet number :" + callnumber);
                    // });
                    // console.log(data);
                    // //RmznBCICv9YtgWaaa_nWDIH1_GM/LutSHzZCPVOFYznU-VBbRzqXBmk
                    // //RmznBCICv9YtgWaaa_nWDIH1_GM/aCPN8aEhuu_1FTi6BnVImg0aiz0
                    // return;
                    data["items"].forEach(video => {
                        var temp = {};
                        temp["title"] = video.snippet.title;
                        temp["videoID"] = video.snippet.resourceId.videoId;
                        temp["publishedAt"] = formatDate((video.snippet.publishedAt).slice(0, 11));
                        temp["timestamp"] = new Date(video.snippet.publishedAt).valueOf();

                        database.ref("AllContent/" + video.snippet.resourceId.videoId).set(temp).then(() => {
                            // console.log("video written title and id is :" + temp.title + " : " + temp.publishedAt +" : call number is : " + callnumber);
                        });
                    });
                    if (token != null || token !== undefined) {
                        playlistitemTHING.processRequest(again, token, ArrayChannelVideos[indexArrayVideos]);
                    } else {
                        indexArrayVideos++;
                        console.log("Next video :" + indexArrayVideos + "and player is :" + ArrayChannelVideos[indexArrayVideos]);
                        if (indexArrayVideos < ArrayChannelVideos.length)
                            playlistitemTHING.processRequest(again, null, ArrayChannelVideos[indexArrayVideos]);
                        else {
                            console.log("done da u chill now");
                            resolve();
                        }
                    }
                }
            }
        }, null, ArrayChannelVideos[indexArrayVideos]);
    });
}

//END Videos routes---------------------------------------------------------//

//START VideosTimeQuerying routes---------------------------------------------------------//
function RouteVideTime() {
    var flag = true;
    return new Promise((resolve, reject) => {
        database.ref("/AllContent").once('value').then(function (allvideos) {
            allvideos.forEach(video => {
                ArrayVideos.push(video.child("videoID").val());
            });
        }).then(() => {
            console.log(resolve);
            videoTime.getVid(function (data, videolenth) {
                data["items"].forEach((item) => {
                    let temp = {
                        "duration": convertTime(item["contentDetails"]["duration"])
                    };
                    database.ref("/AllContent/" + item['id']).update(temp);
                });
                console.log(videolenth);
                if (videolenth == 0 && flag) {
                    resolve();
                    flag = false;
                }
            }, ArrayVideos);
        });
    })
}
//END VideosTimeQuerying routes---------------------------------------------------------//

//START PlaylistsAndVideos routes---------------------------------------------------------//
function Routeplaylist() {
    return new Promise((resolve, reject) => {
        ArrayPlaylist.forEach(playlistID => {
            playlist.processRequest(function again(err, data, token) {
                if (err)
                    console.log("error");
                else {
                    //database.ref("playlists/"+playliststring +"/title/").set(data['title']);
                    if (token != undefined || token != null) {
                        proccess.getVideos(data['playlistid'], again, data['title'], data['nextPageToken']);
                    }
                    writeExtraDetails(data);
                    data.items.forEach(video => {
                        writevideoDetails(video, data);
                    });
                }
            }, playlistID);
        });
        resolve();
    })
}
//video.snippet.resourceId.videoId, video.snippet.playlistId
//END PlaylistsAndVideos routes---------------------------------------------------------/

function RouteCountallVideos() {
    return new Promise((resolve, reject) => {
        database.ref("/AllContent").once('value').then(function (AllContent) {
            console.log(AllContent.numChildren());
            database.ref("/").update({ "VideoCount": AllContent.numChildren() }).then(() => { resolve() });
        })
    })
}
//force to populate db
app.get("/forceUpdate", (req, res) => {
    res.send("Updating database");
    RouteAllvideos().then(() => {
        console.log("Video data writen");
        RouteVideTime().then(() => {
            console.log("Video Time writen");
            Routeplaylist().then(() => {
                console.log("Playlists updated");
                RouteCountallVideos().then(() => {
                    console.log("Counted videos");
                });
            });
        });
    });
});

//Counter videoroutes
app.get("/countEachChannel", (req, res) => {
    var channelCounter = 0;
    let temp = {};
    playlistitemTHING.processRequest(function again(err, data, token) {
        if (err)
            res.status(200).write("error");
        else {
            var a = ArrayChannelVideos[channelCounter];
            var b = data["pageInfo"]["totalResults"];
            temp[a] = b;
            channelCounter++;
            if (channelCounter < ArrayChannelVideos.length) {
                playlistitemTHING.processRequest(again, null, ArrayChannelVideos[channelCounter]);
            } else {
                database.ref("general/channels").once("value").then(datasnap => {
                    if (deepEqual(datasnap.val(), temp)) {
                        res.send("no updates");
                        console.log("no updates");
                    } else {
                        console.log("running updates");
                        database.ref("general/channels").set(temp);
                        RouteAllvideos().then(() => {
                            console.log("Video data writen");
                            RouteVideTime().then(() => {
                                console.log("Video Time writen");
                                Routeplaylist().then(() => {
                                    console.log("Playlists updated");
                                    RouteCountallVideos().then(() => {
                                        console.log("Counted videos");
                                    });
                                });
                            });
                        });
                        res.send("updates triggered");
                    }
                })
            }


        }
    }, null, ArrayChannelVideos[channelCounter]);


});




function writevideoDetails(video, data) {
    database.ref("/AllContent/" + video.snippet.resourceId.videoId).once('value').then(dataSnap => {
        var temp = dataSnap.val();
        database.ref("/Collections/" + video.snippet.playlistId + "/videos/" + video.snippet.resourceId.videoId).set(temp);
    });
}
function writeExtraDetails(data) {
    database.ref("playlists/" + data.playlistid).update({ "title": data.title, "noofvideos": data.pageInfo.totalResults, "playlist": data.playlistid });
}
function convertTime(element) {
    let time = element.toString().slice(2, );
    let collector = "";
    let coll = "";
    for (var i = 0; time.length > i; i++) {
        if (time.charAt(i) == 'H' || time.charAt(i) == 'S' || time.charAt(i) == 'M') {
            if (collector == "") {
                if (coll.length == 1)
                    coll = "0" + coll;
                collector = coll;
                coll = "";
                continue;
            }
            if (coll.length == 1)
                coll = "0" + coll;
            collector = collector + ':' + coll;
            coll = "";
            continue;
        }
        coll = coll + time.charAt(i);
    }
    return collector;
}

function formatDate(input) {
    var datePart = input.match(/\d+/g),
        year = datePart[0].substring(2), // get only two digits
        month = datePart[1], day = datePart[2];

    return day + '/' + month + '/' + year;
}
