const functions = require('firebase-functions');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var admin = require('firebase-admin');

var serviceAccount = require('./ajapp-192505-firebase-adminsdk-22c7e-b56dca2e7c.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ajapp-192505.firebaseio.com/'
});
//admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {

});

exports.detectChange = functions.database.ref('/videos')
    .onWrite(event => {
        const crnt = event.data.current;
        const prev = event.data.previous;

        if (crnt.val() && !prev.val()) {
            // value created
            console.log('Created: send push notification');
            var message = {
                notification: {
                    title: "Prabuji",
                    body: "New talk"
                },
                topic: "global"
            };
            admin.messaging().send(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    response.send("done sending");
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    response.send("error:/");
                });

        } else if (!crnt.val() && prev.val()) {
            // value removed
            console.log('Removed: send push notification');
        } else {
            // value updated
            console.log('Updated');
        }
    })
