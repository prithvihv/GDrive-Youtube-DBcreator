const { google } = require('googleapis');
const GDriveOauth = require('../GDriveOauth.js')
var database

const oauth2Client = new google.auth.OAuth2(
    GDriveOauth.Client_ID,
    GDriveOauth.Client_secret,
    "urn:ietf:wg:oauth:2.0:oob"
);

const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
});

/**
 * main functions
 */
function main() {

    getGdriveAudio().then(() => {
        getGdrivePlaylist().then(() => {
            writemetadata();
        });
    });
}
function GDriverefreshAccessToken(db) {
    database = db;
    return new Promise((resolve, recject) => {
        database.ref('/GoogleDriveCredentials').once('value').then((credential) => {
            let GoogleDriveCredentail = credential.val();
            oauth2Client.credentials = GoogleDriveCredentail;
            /**
             * the below method refeshes the oauth2.accesstoken
             */
            oauth2Client.refreshAccessToken((token) => {
                console.log(oauth2Client.credentials.access_token);
                writeAccesstoken(oauth2Client.credentials.access_token).then(() => {
                    resolve();
                })
            })
        })
    })
}
function writeAccesstoken(AT) {
    return new Promise((resolve, reject) => {
        database.ref('/GoogleDriveCredentials/access_token').set(AT).then(() => {
            resolve();
        })
    })
}

function getGdriveAudio() {
    return new Promise((resolve, recject) => {
        let objQ = {
            corpus: 'DEFAULT',
            includeTeamDriveItems: false,
            q: 'mimeType = "audio/mp3"',
            fields: 'etag,items(createdDate,downloadUrl,id,mimeType,parents(id,isRoot),title),nextPageToken'
        };
        drive.files.list(objQ, (err, resp) => {
            if (err) {
                console.log("error block")
                console.error(err);
            } else {
                processApicall(resp.data).then(() => {
                    resolve();
                });
            }
        })
    })
}
function processApicall(respdata) {
    return new Promise((resolve, recject) => {
        respdata["items"].forEach(audioUnit => {
            audioUnit["parents"] = audioUnit["parents"][0];
            audioUnit["publishedAt"] = audioUnit["createdDate"];
            delete audioUnit["createdDate"];
            audioUnit["timestamp"] = (new Date(audioUnit.publishedAt)).valueOf();
            console.log("running processApicall FOR : getGdriveAudio() : " + audioUnit.id);
            database.ref('/AllContents/' + audioUnit.id).set(audioUnit);
        });
        resolve();
    })
}

/**
 * Gets all the  collection information
 * ==> each collection data is then loaded
 */
function getGdrivePlaylist() {
    return new Promise((resolve, reject) => {
        let objQ = {
            corpus: 'DEFAULT',
            includeTeamDriveItems: false,
            q: "mimeType = 'application/vnd.google-apps.folder' and  '14-sAwJ0JzqGQtVQcyArtO7F9oX2TOUqG' in parents",
            fields: 'items(createdDate,id,title),nextPageToken'
        };
        drive.files.list(objQ, (err, resp) => {
            if (err) {
                console.log("error from Gdrive playlist");
                console.error(err);
            } else {
                let ArrayCollections = resp.data["items"];
                let processCollectionArray = (i) => {
                    database.ref('/Collections/' + ArrayCollections[i].title + "/information").update(ArrayCollections[i]).then(() => {
                        getGdrivePlaylistdata(ArrayCollections[i].id, ArrayCollections[i].title).then(() => {
                            countAudios(ArrayCollections[i].title).then(() => {
                                i++;
                                if (i < ArrayCollections.length)
                                    processCollectionArray(i)
                                else
                                    resolve();
                            })
                        });
                    });
                }
                processCollectionArray(0);
            }
        })
    });
}

/**
 *
 * @param {string} foldID
 * @param {string} CollectionName
 * Loads data of the GDriveAudio into collections node
 */
function getGdrivePlaylistdata(foldID, CollectionName) {
    return new Promise((resolve, recject) => {
        let objQ = {
            corpus: 'DEFAULT',
            includeTeamDriveItems: false,
            q: `mimeType ='audio/mp3' and '` + foldID + `'  in parents`,
            fields: 'items(id)',
        };
        drive.files.list(objQ, (err, resp) => {
            if (err) {
                console.log("error from Gdrive playlistdata");
                console.error(err);
            } else {
                let ArrayAudiosCollections = resp.data["items"];
                let processAudiosCollections = (i) => {
                    console.log("running getGdriveCollectionData() : PlaylistId : " + ArrayAudiosCollections[i].id);
                    database.ref("/AllContents/" + ArrayAudiosCollections[i].id).once('value').then((iddata) => {
                        let data = iddata.val();
                        database.ref("/Collections/" + CollectionName + "/GoogleAudios/" + data["id"]).set(data).then(() => {
                            i++;
                            if (i < ArrayAudiosCollections.length)
                                processAudiosCollections(i)
                            else
                                resolve();
                        });
                    });
                }
                if (ArrayAudiosCollections.length > 0)
                    processAudiosCollections(0);
                else
                    resolve();
            }
        })
    })
}

function countAudios(CollectionName) {
    return new Promise((resolve, reject) => {
        database.ref('/Collections/' + CollectionName + '/GoogleAudios/').once('value').then((Audios) => {
            let countAudios = Audios.numChildren();
            database.ref('/Collections/' + CollectionName + '/information/NoOfAudios').set(countAudios).then(() => {
                resolve();
            })
        })
    })
}
/**
 * this method isnt synced
 */
function writemetadata() {
    return new Promise((resolve, reject) => {
        database.ref('/Collections/').once('value').then((ContentUnits) => {
            ContentUnits.forEach((ContentUnit) => {
                database.ref('/CollectionsMeta/' + ContentUnit.key).set(ContentUnit.val().information);
                console.log("Processing Meta Data for : " + ContentUnit.key);
            });
            resolve();
        });
    })
}
module.exports = {
    AccesstokenRefesh: GDriverefreshAccessToken
}
