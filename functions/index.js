const functions = require('firebase-functions');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var request = require('request');

var admin = require('firebase-admin');

var serviceAccount = require('./ajapp-192505-firebase-adminsdk-22c7e-b56dca2e7c.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ajapp-192505.firebaseio.com/'
});
//admin.initializeApp(functions.config().firebase);
exports.StartTokenRefesh = functions.database.ref('/GoogleDriveCredentials')
    .onCreate((snap, context) => {
        const token = snap.val();
        const oauth2Client = new google.auth.OAuth2(
            "512241350585-gqeg1u8fa33ncv9fldftcmdgvrgcpu1p.apps.googleusercontent.com",
            "NQ7qvlrZ7K9QW_FRWxcL8R6b",
            "urn:ietf:wg:oauth:2.0:oob"
        );
        oauth2Client.credentials = token;
        setInterval(() => {
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                getUrl.getUrl(oauth2Client);
                database.ref("/GoogleDriveCredentials").update(token).then(() => {
                    console.log("Wrote to db");
                }).catch(() => {
                    console.log("fail");
                });
            });
        }, 36000)
    });
exports.VideoCount = functions.database.ref('/VideoCount')
    .onWrite(event => {
        const crnt = event.data.current;
        const prev = event.data.previous;

        if (crnt.val() && !prev.val()) {
            // value created
            console.log('Created: no notification');
        } else if (!crnt.val() && prev.val()) {
            // value removed
            console.log('Removed: no push');
        } else {
            var NumberOfNewVideos = crnt.val() - prev.val();
            console.log(NumberOfNewVideos)
            var message = {
                notification: {
                    title: "Prabuji's Talk",
                    body: NumberOfNewVideos + NumberOfNewVideos == 1 ? "New talk" : "New talks"
                },
                topic: "global"
            };
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    response.send("done sending");
                    return 0;
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
            console.log('Updated');
        }
    });
