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

app.listen(process.env.PORT || 3000, () => {
    console.log("Api up and running");
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
app.get('/listvideo', (req, res) => {
    res.send("writing to videos to db");
    playlistitemTHING.processRequest(function again(err, data, token) {
        indexArrayVideos=0;
        if (err)
            res.status(200).write("error");
        else {
            if (indexArrayVideos < ArrayChannelVideos.length) {
                // database.ref("/videos/packet" + callnumber).set(data).then(() => {
                //     console.log("datapacket written packet number :" + callnumber);
                // });
                // console.log(data);
                // //RmznBCICv9YtgWaaa_nWDIH1_GM/LutSHzZCPVOFYznU-VBbRzqXBmk
                // //RmznBCICv9YtgWaaa_nWDIH1_GM/aCPN8aEhuu_1FTi6BnVImg0aiz0
                // return;
                data["items"].forEach(video => {
                    var temp = {};
                    callnumber++;

                    temp["title"] = video.snippet.title;
                    temp["videoID"] = video.snippet.resourceId.videoId;
                    temp["publishedAt"] = (new Date(video.snippet.publishedAt).toString()).slice(0,11);
                    temp["timestamp"] = new Date(video.snippet.publishedAt).valueOf();

                    database.ref("allvideos/" + video.snippet.resourceId.videoId).set(temp).then(() => {
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
                        indexArrayVideos=0;
                        return;
                    }
                }
            } else {
                console.log("DONE BOI");
                console.log(callnumber)
            }
        }
    }, null, ArrayChannelVideos[indexArrayVideos]);
});

//END Videos routes---------------------------------------------------------//

//START VideosTimeQuerying routes---------------------------------------------------------//
app.get('/getVTime', (req, res) => {
    //first make list of data
    database.ref("/allvideos").once('value').then(function (allvideos) {
        allvideos.forEach(video => {
            ArrayVideos.push(video.child("videoID").val());
        });
    }).then(()=>{
        console.log(ArrayVideos.length);
        videoTime.getVid(function (data) {
            data["items"].forEach((item) => {
                let temp = {
                    "duration": convertTime(item["contentDetails"]["duration"])
                };
                database.ref("/allvideos/" + item['id']).update(temp);
            });
        }, ArrayVideos);
    });
    res.send("Writing time to every video");
});
//END VideosTimeQuerying routes---------------------------------------------------------//

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
    res.send("Writing playlists");

});
//video.snippet.resourceId.videoId, video.snippet.playlistId
//END PlaylistsAndVideos routes---------------------------------------------------------/


//Counter videoroutes
app.get("/countallVideos",(req,res)=>{
    database.ref("/allvideos").once('value').then(function (allvideos) {
        console.log(allvideos.numChildren());
        database.ref("/general").set({"NoofVideos" : allvideos.numChildren()})
    });
    res.send("counting videos");
});
app.get("/countEachChannel",(req,res)=>{
    var channelCounter=0;
    playlistitemTHING.processRequest(function again(err, data, token) {
        if (err)
            res.status(200).write("error");
        else {
            var a= ArrayChannelVideos[channelCounter];
            var b= data["pageInfo"]["totalResults"];
            let temp ={};
            temp[a]=b;
            database.ref("general/channels").update(temp).then(()=>{
                if (channelCounter < ArrayChannelVideos.length) {
                    channelCounter++;
                    playlistitemTHING.processRequest(again, null, ArrayChannelVideos[channelCounter]);
                }
            });

        }
    }, null, ArrayChannelVideos[channelCounter]);
    res.send("counting each channel videos");

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



function convertTime(element) {
    let time = element.toString().slice(2,);
    let collector= "";
    let coll= "";
    for(var i=0;time.length>i;i++){
        if(time.charAt(i)=='H'||time.charAt(i)=='S'||time.charAt(i)=='M'){
            if(collector==""){
                if(coll.length==1)
                    coll = "0"+coll;
                collector = coll;
                coll = "";
                continue;
            }
            if(coll.length==1)
                coll = "0"+coll;
            collector =  collector +':'   + coll;
            coll="";
            continue;
        }
        coll=coll + time.charAt(i);
    }
    return collector;
}