const { google } = require('googleapis');
const folderID = "1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO";
const ArrayOfFolder = [];
var countAudios = 0;

let config = {
    apiKey: "AIzaSyDLi5odhLcnMqKim-bj9Z6kQyeg7-6DKmo",
    authDomain: "ajappprod.firebaseapp.com",
    databaseURL: "https://ajappprod.firebaseio.com",
    projectId: "ajappprod",
    storageBucket: "ajappprod.appspot.com",
    messagingSenderId: "485319972083"
};

const oauth2Client = new google.auth.OAuth2(
    "512241350585-gp19bgimhm0151j9eelmjidho8dgdbpb.apps.googleusercontent.com",
    "Mx7r2e2m9ODERZuTdMda6hdi",
    "urn:ietf:wg:oauth:2.0:oob"
);

const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});

const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();

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
        main();
    })
})

function main() {
    folder(folderID);
    //database.ref("/").set(":)");
}
async function CleanAudiosCollection() {
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

function i(resp) {
    return function () {
        let ArrayData = resp.data["items"];
        let j = 0;
        return new Promise((resolve, reject) => {
            let loophandler = () => {
                j++;
                if (ArrayData.length > j)
                    processData(j)
                else {
                    if (ArrayOfFolder.length != 0)
                        resolve();
                    else
                        CleanAudiosCollection();
                }
            }
            let processData = (j) => {
                if (ArrayData.length != 0) {
                    if (ArrayData[j].mimeType == "application/vnd.google-apps.folder") {
                        FolderDetails(ArrayData[j]).then(() => {
                            //console.log("folder : " + ArrayData[j].title);
                            ArrayOfFolder.push(ArrayData[j].id);
                            // reducearray().then(() => {
                            //     loophandler();
                            // })
                            loophandler();
                        });
                    } else {//audio
                        AudioDetails(ArrayData[j]).then(() => {
                            //console.log("audio : " + ArrayData[j].title);
                            loophandler();
                        });
                    }
                } else {
                    loophandler();
                }
            }
            processData(0)
        })
    }
}

function folder(id) {
    return new Promise(function (resolve, reject) {
        let objQ = {
            q: `'${id}' in parents`,
            fields: 'items(createdDate,downloadUrl,id,title,mimeType,parents(id)),nextPageToken'
        };
        drive.files.list(objQ, (err, resp) => {
            if (err) {
                console.log("Die : Folder() DriveV2apiCall");
                console.error(err);
            } else {
                let Iterator = i(resp);
                Iterator().then(() => {
                    if (ArrayOfFolder.length != 0) {
                        printStack();
                        let element = ArrayOfFolder.pop();
                        folder(element);
                    } else {
                        resolve();
                    }
                });
            }
        })
    })
}
function reducearray() {
    return new Promise((resolve, reject) => {
        let len = ArrayOfFolder.length - 1;
        for (var i = 0; i < len; i++)
            ArrayOfFolder.pop();
        resolve();
    })
}
function printStack() {
    console.log("----------------------------------------");
    ArrayOfFolder.forEach(item => {
        console.log(item);
    });
    console.log("----------------------------------------")
}
function FolderDetails(FolderObj) {
    return new Promise((resolve, reject) => {
        delete FolderObj.parents;
        database.ref("/Collections-Meta/" + FolderObj.id).set(FolderObj).then(() => {
            resolve();
        });
    })
}
function AudioDetails(AudioObj) {
    return new Promise((resolve, reject) => {
        let path = AudioObj.parents[0].id;
        AudioObj["publishedAt"] = formatDate2(AudioObj["createdDate"]);
        AudioObj["timestamp"] = (new Date(AudioObj["createdDate"])).valueOf();
        delete AudioObj["createdDate"];
        delete AudioObj["parents"];
        database.ref("/Collections/" + path + "/" + AudioObj.id).update(AudioObj).then(() => {
            countAudios++;
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
