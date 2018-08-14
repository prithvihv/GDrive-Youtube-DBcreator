//Node stuff
let express = require("express");
const cors = require("cors");
var deepEqual = require('deep-equal');
//firebase

//const functions = require('firebase-functions');
const admin = require('firebase-admin');
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
let GDriveHandler = require("./DriveLinks.js");

//random letiables
const ArrayChannelVideos = ['UUrsXeU6cuGStvMCUhAgULyg', 'UUNmRmSpIJYqu7ttPLWLx2sw'];
let ArrayPlaylist = ['UCNmRmSpIJYqu7ttPLWLx2sw', 'UCrsXeU6cuGStvMCUhAgULyg'];
let ArrayVideos = [];
let callnumber = 0;
let indexArrayVideos = 0;


const app = express();

app.use(cors({ origin: true }));

app.listen(process.env.PORT || 3000, () => {
  //  RouteVideTime();
    RouteAllvideos().then(() => {
        
    });
    // Routeplaylist().then(() => {
    //     console.log("Playlists updated");
    //     RouteCountallVideos().then(() => {
    //         console.log("Counted videos");
    //     });
    // });
    // RouteAllvideos().then(() => {
    //     console.log("Video data writen");
    //     RouteVideTime().then(() => {
    //         console.log("Video Time writen");
    //         Routeplaylist().then(() => {
    //             console.log("Playlists updated");
    //             RouteCountallVideos().then(() => {
    //                 console.log("Counted videos");
    //             });
    //         });
    //     });
    // });
    console.log("Api Sync running")
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
    return new Promise((resolve, reject) => {
        let m = 0;
        let LoopHandler = () => {
            m++;
            console.log("Channel : " + (m+1) + " id : " + ArrayChannelVideos[m]);
            if (m < ArrayChannelVideos.length)
                LoopArrayChannel(m)
            else
                resolve();
        }
        let LoopArrayChannel = (i) => {
            playlistitemTHING.processRequest(function again(err, data) {
                return new Promise((innerResolve, innerReject) => {
                    if (err)
                        res.status(200).write("error");
                    else {
                        if (data) {
                            let ArrayVideos = data["items"];
                            let writeAllVideosLoop = (j) => {
                                writeAllContentVideo(ArrayVideos[j]).then(() => {
                                    j++;
                                    if (j < ArrayVideos.length)
                                        writeAllVideosLoop(j)
                                    else
                                        innerResolve();
                                });
                            }
                            writeAllVideosLoop(0);
                        }
                    }
                })
            }, ArrayChannelVideos[i], LoopHandler);
        }
        LoopArrayChannel(0)
    });
}

//END Videos routes---------------------------------------------------------//

//START VideosTimeQuerying routes---------------------------------------------------------//
function RouteVideTime() {
    var flag = true;
    return new Promise((resolve, reject) => {
        database.ref("/AllContents").once('value').then(function (allvideos) {
            allvideos.forEach(video => {
                ArrayVideos.push(video.child("id").val());
            });
        }).then(() => {
            console.log(resolve);
            videoTime.getVid(function (data, videolenth) {
                data["items"].forEach((item) => {
                    let temp = {
                        "duration": convertTime(item["contentDetails"]["duration"])
                    };
                    database.ref("/AllContents/" + item['id']).update(temp);
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
        let m = 0;
        let LoopHandler = () => {
            m++;
            if (m < ArrayPlaylist.length)
                LoopArrayplaylist(m)
            else
                resolve()
        }
        let LoopArrayplaylist = (i) => {
            playlist.processRequest(function again(err, data) {
                return new Promise((innerResolve, innerReject) => {
                    if (err)
                        console.log("error");
                    else {
                        writeExtraDetails(data).then(() => {
                            let ArrayVideos = data.items;
                            let writeAllVideosLoop = (j) => {
                                writevideoDetails(ArrayVideos[j], data.title).then(() => {
                                    j++;
                                    if (j < ArrayVideos.length)
                                        writeAllVideosLoop(j)
                                    else
                                        innerResolve();
                                });
                            }
                            writeAllVideosLoop(0);
                        })
                    }
                })
            }, ArrayPlaylist[i], LoopHandler);
        }
        LoopArrayplaylist(m);

        // .then(() => {
        //     if (i < ArrayPlaylist.length - 1) {
        //         i++;
        //         LoopArrayplaylist(i);
        //     } else {
        //         resolve();
        //     }
        // });
        // ArrayPlaylist.forEach(playlistID => {
        //     playlist.processRequest(function again(err, data, token) {
        //         if (err)
        //             console.log("error");
        //         else {
        //             //database.ref("playlists/"+playliststring +"/title/").set(data['title']);
        //             if (token != undefined || token != null) {
        //                 proccess.getVideos(data['playlistid'], again, data['title'], data['nextPageToken']);
        //             }
        //             writeExtraDetails(data);
        //             data.items.forEach(video => {
        //                 writevideoDetails(video, data.title);
        //             });
        //         }
        //     }, playlistID);
        // });
        // resolve();
    })
}
//video.snippet.resourceId.videoId, video.snippet.playlistId
//END PlaylistsAndVideos routes---------------------------------------------------------/

function RouteCountallVideos() {
    return new Promise((resolve, reject) => {
        database.ref("/AllContents").once('value').then(function (allvideos) {
            console.log(allvideos.numChildren());
            database.ref("/").update({ "VideoCount": allvideos.numChildren() }).then(() => { resolve() });
        })
    })
}

app.get("/AccesstokenRefesh",(req,res)=>{
    console.log("Refeshing token");
    GDriveHandler.AccesstokenRefesh(database).then(()=>{
        loader = false;
        res.send("done");
    })
})

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


function writeAllContentVideo(video) {
    return new Promise((resolve, reject) => {
        var temp = {};
        temp["title"] = video.snippet.title;
        console.log(video.snippet.title);
        temp["id"] = video.snippet.resourceId.videoId;
        //temp["publishedAt"] = formatDate((video.snippet.publishedAt).slice(0, 11));
        // temp["publishedAt"]= convertTime(video.snippet.publishedAt)
        temp["publishedAt"]=formatDate2(video.snippet.publishedAt);
        temp["timestamp"] = new Date(video.snippet.publishedAt).valueOf();
        database.ref("AllContents/" + video.snippet.resourceId.videoId).set(temp).then(() => {
            resolve();
        });
    })
}


function writevideoDetails(video, playlistName) {
    return new Promise((resolve, reject) => {
        database.ref("AllContents/" + video.snippet.resourceId.videoId).once('value').then(dataSnap => {
            var temp = dataSnap.val();
            database.ref("Collections/" + playlistName + "/YoutubeVideos/" + video.snippet.resourceId.videoId).set(temp).then(() => { resolve(); });

        })
    });
}
function writeExtraDetails(data) {
    return new Promise((resolve, reject) => {
        database.ref("Collections/" + data.title + "/information/").update({ "NoOfVideos": data.pageInfo.totalResults }).then(() => {
            resolve();
        });
    })
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
    //format dd/mm/yy
    var datePart = input.match(/\d+/g),
        year = datePart[0].substring(2), // get only two digits
        month = datePart[1], day = datePart[2];

    return day + '/' + month + '/' + year;
}
function formatDate2(input){
    //format output 09-Feb-2018
    input = (new Date(input)).toString();//"Sat Aug 04 2018 17:25:39 GMT+0530 (India Standard Time)"
    return input.substring(8,10) + "-" + input.substring(4,7) + "-" + input.substring(11,15);
}
