//Node stuff
let express = require("express");
const cors = require("cors");
var deepEqual = require('deep-equal');
const { google } = require('googleapis');
const folderID = "1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO";
//var ArrayOfFolder = [];
let queueFolder = [];
let lastfolderID = '';
//firebase
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

const oauth2Client = new google.auth.OAuth2(
    "512241350585-gp19bgimhm0151j9eelmjidho8dgdbpb.apps.googleusercontent.com",
    "Mx7r2e2m9ODERZuTdMda6hdi",
    "urn:ietf:wg:oauth:2.0:oob"
);

const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
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


const app = express();

app.use(cors({ origin: true }));

app.listen(process.env.PORT || 3000, () => {
    console.log("UP AND RUNNING");
    GDriveStructureCreator();
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

    app.get('/AccentureInnovation', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
}
//END test routes-----------------------------------------------------------//

//START Videos routes---------------------------------------------------------//
function RouteAllvideos() {
    return new Promise((resolve, reject) => {
        let m = 0;
        let LoopHandler = () => {
            m++;
            console.log("Channel : " + (m + 1) + " id : " + ArrayChannelVideos[m]);
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
        LoopArrayChannel(0);
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
//refreshToken
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
                                writevideoDetails(ArrayVideos[j], data.playlistid).then(() => {
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
    })
}
//video.snippet.resourceId.videoId, video.snippet.playlistId
//END PlaylistsAndVideos routes---------------------------------------------------------/

function RouteCountallVideos() {
    return new Promise((resolve, reject) => {
        database.ref("/AllContents").once('value').then(function (allvideos) {
            console.log(allvideos.numChildren());
            database.ref("/").update({ "TotalContent": allvideos.numChildren() }).then(() => { resolve() });
        })
    })
}

//refeshTokengenerator
app.get("/AccesstokenRefesh", (req, res) => {
    console.log("Refeshing token");
    GDriverefreshAccessToken().then(() => {
        loader = false;
        res.send("done");
    });
});

app.get("/ScanDrive", (req, res) => {
    res.send("Scanning drive");
    refreshToken().then(() => {
        CheckDriveChanges();
    })
})

app.get("/forceUpdateDrive", (req, res) => {
    res.send("Force Updating Drive...");
    refreshToken().then(() => {
        folder(folderID);
    })
})

//Counter videoroutes
app.get("/ScanYoutube", (req, res) => {
    var channelCounter = 0;
    let temp = {};
    playlistitemTHING.processRequest(function again(err, data, token) {
        return new Promise((resolve, reject) => {
            if (err)
                res.status(200).write("error");
            else {
                var a = ArrayChannelVideos[channelCounter];
                var b = data["pageInfo"]["totalResults"];
                temp[a] = b;
                reject(ArrayChannelVideos[channelCounter]);
                channelCounter++;
                if (channelCounter < ArrayChannelVideos.length) {
                    playlistitemTHING.processRequest(again, ArrayChannelVideos[channelCounter], () => { console.log("O.o") });
                } else {
                    database.ref("general/channels").once("value").then(datasnap => {
                        if (deepEqual(datasnap.val(), temp)) {
                            res.send("no updates");
                            console.log("no updates");
                        } else {
                            console.log("running updates");
                            database.ref("general/channels").set(temp);
                            res.send("updates triggered");
                            RouteAllvideos().then(() => {
                                console.log("Video content Written");
                                Routeplaylist().then(() => {
                                    console.log("Audio content Written");
                                })
                            })
                        }
                    })
                }
            }
        })
    }, ArrayChannelVideos[channelCounter], () => { console.log("O.o") });
});


function writeAllContentVideo(video) {
    return new Promise((resolve, reject) => {
        var temp = {};
        temp["title"] = video.snippet.title;
        temp["id"] = video.snippet.resourceId.videoId;
        //temp["publishedAt"] = formatDate((video.snippet.publishedAt).slice(0, 11));
        // temp["publishedAt"]= convertTime(video.snippet.publishedAt)
        temp["publishedAt"] = formatDate2(video.snippet.publishedAt);
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
            database.ref("Collections/" + playlistName + "/" + video.snippet.resourceId.videoId).set(temp).then(() => { resolve(); });

        })
    });
}
function writeExtraDetails(data) {
    return new Promise((resolve, reject) => {
        database.ref("Collections-Meta/" + data.playlistid).update({
            "NoOfVideos": data.pageInfo.totalResults,
            "Name": data.title,
            "publishedAt": data.publishedAt,
            "timestamp": (new Date(data.publishedAt)).valueOf()
        }).then(() => {
            resolve();
        });
    })
}


function convertTime(element) {
    let time = element.toString().slice(2);
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
function refreshToken() {
    return new Promise((resolve, reject) => {
        database.ref('/GoogleDriveCredentials').once('value').then((credential) => {
            let GoogleDriveCredentail = credential.val();
            // oauth2Client.refreshToken
            oauth2Client.credentials = GoogleDriveCredentail;
            /**
             * the below method refeshes the oauth2.accesstoken
             */
            oauth2Client.refreshAccessToken((token) => {
                console.log("inside refeshAccessToken");
                console.log(oauth2Client.credentials.access_token);
                resolve();
            })
        })
    })
}

function GDriverefreshAccessToken() {
    return new Promise((resolve, recject) => {
        database.ref('/GoogleDriveCredentials').once('value').then((credential) => {
            let GoogleDriveCredentail = credential.val();
            oauth2Client.credentials = GoogleDriveCredentail;
            /**
             * the below method refeshes the oauth2.accesstoken
             */
            oauth2Client.refreshAccessToken((token) => {
                console.log(oauth2Client.credentials.access_token);
                database.ref('/GoogleDriveCredentials/access_token').set(oauth2Client.credentials.access_token).then(() => {
                    resolve();
                })
            })
        })
    })
}

async function CleanAudiosCollection() {//1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO
    let AllCollection = await database.ref("/Collections/").once('value');
    AllCollection.forEach(item => {
        if (!item.key.startsWith("PL"))
            database.ref("/Collections-Meta/" + item.key).update({ "NoOfAudios": item.numChildren() });
    });
    let CollectionMeta = await database.ref("/Collections-Meta/").once('value');
    CollectionMeta.forEach(Metadata => {
        if (Metadata.val()["NoOfAudios"] === undefined && Metadata.val()["NoOfVideos"] == undefined) {
            database.ref("/Collections-Meta/" + Metadata.key).remove();
        }
    })
    console.log("done");
}
async function GDriveStructureCreator() {
    await  GDriverefreshAccessToken();
    await initfolder();
    printStack();
    folder(queueFolder.shift());
}
function initfolder() {
    return new Promise((res, rej) => {
        let objQ = {
            q: `'1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO' in parents`,
            fields: 'items(createdDate,downloadUrl,id,title,mimeType),nextPageToken'
        };
        drive.files.list(objQ, async (err, resp) => {
            if (err) {
                console.log("Die : initfolder() DriveV2apicall");
                console.log(err);
            } else {
                let dumpdata = resp.data["items"];
                for (let i = 0; i < dumpdata.length; i++) {
                    queueFolder.push(dumpdata[i].id);
                    await database.ref("/NEWCollections-Meta/" + dumpdata[i].id).set({
                        "publishedAt": formatDate2(dumpdata[i].createdDate),
                        "timestamp": (new Date(dumpdata[i].createdDate)).valueOf(),
                        "id": dumpdata[i].id,
                        "title": dumpdata[i].title
                    })
                }
                res();
            }
        })
    })
}
async function folder(id) {
    let objQ = {
        q: `'${id}' in parents`,
        fields: 'items(createdDate,downloadUrl,parents/id,id,title,mimeType),nextPageToken'
    };
    drive.files.list(objQ,async (err, resp) => {
        if (err) {
            console.log("Die : Folder() DriveV2apiCall");
            console.error(err);
        } else {
            if(resp["data"].items.length!=0){
                await dumpstructuredata(resp["data"], id);
            }
            if (queueFolder.length != 0) {
                printStack();
                let element = queueFolder.shift();
                folder(element);
            } else {
                // CleanAudiosCollection();
                console.log("/// done ///")
            }
        }
    })
}
function dumpstructuredata(data, parentid) {
    return new Promise((resolve, reject) => {
        let dumpdata = data["items"];
        let i = 0;
        let nexthandler = () => {
            i++
            if (i < dumpdata.length)
                processdatafor(i)
            else
                resolve();
        }
        let processdatafor = async (i) => {
            if (dumpdata[i].mimeType == "application/vnd.google-apps.folder")
                await FolderDetails(dumpdata[i], parentid)
            else
                await AudioDetails(dumpdata[i], parentid)
            nexthandler()
        }
        processdatafor(i)
    })
}
function reducearray() { //testing function
    return new Promise((resolve, reject) => {
        let len = ArrayOfFolder.length - 1;
        for (var i = 0; i < len; i++)
            ArrayOfFolder.pop();
        resolve();
    })
}
function printStack() {
    console.log("----------------------------------------");
    queueFolder.forEach(item => {
        console.log(item);
    });
    console.log("----------------------------------------")
}
function FolderDetails(FolderObj, parentid) {
    return new Promise((resolve, reject) => {
        queueFolder.push(FolderObj.id);
        database.ref("/GDriveStructure/" + parentid + "/" + FolderObj.id).set({
            "publishedAt": formatDate2(FolderObj.createdDate),
            "timestamp": (new Date(FolderObj.createdDate)).valueOf(),
            "id": FolderObj.id,
            "title": FolderObj.title
        }).then(() => {
            resolve();
        });
    })
}
function AudioDetails(AudioObj, parentid) {
    return new Promise((resolve, reject) => {
        AudioObj["publishedAt"] = formatDate2(AudioObj["createdDate"]);
        AudioObj["timestamp"] = (new Date(AudioObj["createdDate"])).valueOf();
        delete AudioObj["createdDate"];
        delete AudioObj["parents"];
        database.ref("/GDriveStructure/" + parentid + "/" + AudioObj.id).update(AudioObj).then(() => {
            database.ref("/AllContents/" + AudioObj.id).set(AudioObj).then(() => {
                resolve();
            })
        })
    })
}
function formatDate2(input) {
    //format output 09-Feb-2018
    input = (new Date(input)).toString();//"Sat Aug 04 2018 17:25:39 GMT+0530 (India Standard Time)"
    return input.substring(8, 10) + "-" + input.substring(4, 7) + "-" + input.substring(11, 15);
}

