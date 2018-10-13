const functions = require('firebase-functions');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
let express = require("express");
const cors = require("cors");
const { google } = require('googleapis');

var admin = require('firebase-admin');

let serviceAccount = require('./ajappprod-firebase-adminsdk-yysba-8e45c1218f.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ajappprod.firebaseio.com/'
});

let database = admin.database();

const oauth2Client = new google.auth.OAuth2(
    "512241350585-gp19bgimhm0151j9eelmjidho8dgdbpb.apps.googleusercontent.com",
    "Mx7r2e2m9ODERZuTdMda6hdi",
    "urn:ietf:wg:oauth:2.0:oob"
);

const app = express();
app.use(cors({ origin: true }));
app.get('/AccesstokenRefesh', (req, res) => {
    console.log("Refeshing token");
    GDriverefreshAccessToken().then(() => {
        res.send("done");
    });
});
function GDriverefreshAccessToken() {
    return new Promise((resolve, recject) => {
        database.ref('/GoogleDriveCredentials').once('value').then((credential) => {
            let GoogleDriveCredentail = credential.val();
            oauth2Client.credentials = GoogleDriveCredentail;
            oauth2Client.refreshAccessToken((token) => {
                console.log(oauth2Client.credentials.access_token);
                database.ref('/GoogleDriveCredentials/access_token').set(oauth2Client.credentials.access_token).then(() => {
                    resolve();
                })
            })
        })
    })
}
exports.GDriveHandler = functions.https.onRequest(app);

// exports.VideoCount = functions.database.ref('/VideoCount')
//     .onWrite(event => {
//         const crnt = event.data.current;
//         const prev = event.data.previous;

//         if (crnt.val() && !prev.val()) {
//             // value created
//             console.log('Created: no notification');
//         } else if (!crnt.val() && prev.val()) {
//             // value removed
//             console.log('Removed: no push');
//         } else {
//             var NumberOfNewVideos = crnt.val() - prev.val();
//             console.log(NumberOfNewVideos)
//             var message = {
//                 notification: {
//                     title: "Prabuji's Talk",
//                     body: NumberOfNewVideos + NumberOfNewVideos == 1 ? "New talk" : "New talks"
//                 },
//                 topic: "global"
//             };
//             admin.messaging().send(message)
//                 .then((response) => {
//                     // Response is a message ID string.
//                     console.log('Successfully sent message:', response);
//                     response.send("done sending");
//                     return 0;
//                 })
//                 .catch((error) => {
//                     console.log('Error sending message:', error);
//                 });
//             console.log('Updated');
//         }
//     });
