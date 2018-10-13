//Node stuff
let express = require("express");
const cors = require("cors");
var deepEqual = require('deep-equal');
const { google } = require('googleapis');
const folderID = "1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO";
//var ArrayOfFolder = [];
let queueFolder = [];
let lastfolderID = '';
var noOfVideos;
var noOfAudios;
//firebase

const config = require('./firebaseConfig.json');
const GDriveOauth = require('./GDriveOauth.js')

const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();

const oauth2Client = new google.auth.OAuth2(
    GDriveOauth.Client_ID,
    GDriveOauth.Client_secret,
    "urn:ietf:wg:oauth:2.0:oob"
);

const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});
//routes
let playlist = require("./routes/playlist");
let playlistitemTHING = require('./routes/playlistitemTHING');

//random letiables
const ArrayChannelVideos = ['UUrsXeU6cuGStvMCUhAgULyg', 'UUNmRmSpIJYqu7ttPLWLx2sw'];
let ArrayPlaylist = ['UCNmRmSpIJYqu7ttPLWLx2sw', 'UCrsXeU6cuGStvMCUhAgULyg'];
let ArrayVideos = [];


const app = express();

app.use(cors({ origin: true }));

app.listen(process.env.PORT || 3000, () => {
    console.log("UP AND RUNNING");
});

async function ClearDB() {
    await database.ref("AllContents").set(":)");
    await database.ref("Collections").set(":)");
}

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
                                    noOfVideos++;
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

function RouteCountallContent() {
    return new Promise((resolve, reject) => {
        database.ref("/AllContents").once('value').then(function (allvideos) {
            console.log(allvideos.numChildren());
            database.ref("/NotificationTrigger").update({"TotalContent": allvideos.numChildren() }).then(() => { resolve() });
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

app.get("/dumpGdriveStructure",async (req, res) => {
    res.send("Dumping GDrive");
    noOfAudios= 0;
    await GDriveStructureCreator();
})

//Counter videoroutes
app.get("/ScanYoutube",async (req, res) => {
    await ClearDB();
    noOfVideos = 0;
    await RouteAllvideos();
    console.log("Video content Written");
    database.ref("/Stats/NumberOfVideos").set(noOfVideos);
    await Routeplaylist();
    await UpdateCount
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
            database.ref("YoutubePlaylistData/" + playlistName + "/" + video.snippet.resourceId.videoId).set(temp).then(() => { resolve(); });
        })
    });
}
function writeExtraDetails(data) {
    return new Promise((resolve, reject) => {
        database.ref("NEWCollections-Meta/" + data.playlistid).update({
            "NoOfVideos": data.pageInfo.totalResults,
            "Name": data.title,
            "publishedAt": data.publishedAt,
            "timestamp": (new Date(data.publishedAt)).valueOf(),
            "id": data.playlistid
        }).then(() => {
            resolve();
        });
    })
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

async function GDriveStructureCreator() {
    await refreshToken();
    await initfolder();
    printStack();
    folder(queueFolder.shift());
}
function initfolder() {
    return new Promise((res, rej) => {
        let objQ = {
            q: `'1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO' in parents`,
            fields: 'items(modifiedDate,downloadUrl,id,title,mimeType),nextPageToken'
        };
        drive.files.list(objQ, async (err, resp) => {
            if (err) {
                console.log("Die : initfolder() DriveV2apicall");
                console.log(err);
            } else {
                let dumpdata = resp.data["items"];
                noOfAudios = dumpdata.length;
                for (let i = 0; i < dumpdata.length; i++) {
                    queueFolder.push(dumpdata[i].id);
                    await database.ref("/NEWCollections-Meta/" + dumpdata[i].id).set({
                        "publishedAt": formatDate2(dumpdata[i].modifiedDate),
                        "timestamp": (new Date(dumpdata[i].modifiedDate)).valueOf(),
                        "id": dumpdata[i].id,
                        "Name": dumpdata[i].title
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
        fields: 'items(modifiedDate,downloadUrl,parents/id,id,title,mimeType),nextPageToken'
    };
    drive.files.list(objQ, async (err, resp) => {
        if (err) {
            console.log("Die : Folder() DriveV2apiCall");
            console.error(err);
        } else {
            if (resp["data"].items.length != 0) {
                await dumpstructuredata(resp["data"], id);
            }
            if (queueFolder.length != 0) {
                printStack();
                let element = queueFolder.shift();
                folder(element);
            } else {
                // CleanAudiosCollection();
                console.log("/// done ///")
                await GdriveSizes();
                await initGdriveSizes();
            }
        }
    })
}
async function initGdriveSizes() {
    let allCollections = await database.ref("/NEWCollections-Meta").once('value');
    let InfoCollections = allCollections.val();
    for (let Collection in InfoCollections) {
        if (InfoCollections[Collection]["Name"] != (null || undefined)) {
            let allInfo = await database.ref("/GDriveStructure/" + Collection).once("value");
            await database.ref("/NEWCollections-Meta/" + Collection).update({ "NoOfAudios": allInfo.numChildren() });
            console.log("Found Data For : " + Collection + "has items :" + allInfo.numChildren());
        }
    }
    console.log("Completed method call initGdriveSize")
    await database.ref("/Stats/NumberOfAudios").set(noOfAudios);
    RouteCountallContent();
}
async function GdriveSizes() {
    let allFiles = await database.ref("/GDriveStructure").once("value");
    let dataallfiles = allFiles.val();
    for (let Folder in dataallfiles) {
        for (let FindDetailsFolder in dataallfiles[Folder]) {
            if (dataallfiles[Folder][FindDetailsFolder].downloadUrl == null || dataallfiles[Folder][FindDetailsFolder].downloadUrl == undefined) {
                let serachforsubfolder = await database.ref("/GDriveStructure/" + FindDetailsFolder).once("value");
                if (serachforsubfolder.val() != null) {
                    await database.ref("/GDriveStructure/" + Folder + "/" + FindDetailsFolder).update({ "NoOfAudios": serachforsubfolder.numChildren() });
                    console.log("Found Data For : " + FindDetailsFolder + "has items :" + serachforsubfolder.numChildren());
                }
            }
        }
    }
    console.log("end")
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
            "publishedAt": formatDate2(FolderObj.modifiedDate),
            "timestamp": (new Date(FolderObj.modifiedDate)).valueOf(),
            "id": FolderObj.id,
            "Name": FolderObj.title
        }).then(() => {
            resolve();
        });
    })
}
function AudioDetails(AudioObj, parentid) {
    return new Promise((resolve, reject) => {
        noOfAudios++;
        AudioObj["publishedAt"] = formatDate2(AudioObj["modifiedDate"]);
        AudioObj["timestamp"] = (new Date(AudioObj["modifiedDate"])).valueOf();
        delete AudioObj["modifiedDate"];
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
