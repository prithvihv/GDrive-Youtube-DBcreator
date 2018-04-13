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

exports.ChannelCounttrigger = functions.database.ref('/general/channels')
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
            // value updated
            console.log('Updated: send push notification');
            console.log('number of videos now vs before : ',crnt.val(),prev.val() );
            request('https://ajnode.herokuapp.com/listvideos', function (error, response, body) {
                //make sure this is only hit when theall playlist are done writing
                request('getVTime', function (error, response, body) {
                    console.log("done updating");
                    //this is intern trigger a notification
                    request('https://ajnode.herokuapp.com/countallVideos', function (error, response, body) {
                        console.log("updated total count");
                    });
                });
            });
        }
    });


exports.VideoCount = functions.database.ref('/general/NoofVideos')
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
            // value updated
            console.log('Updated: send push notification');
            console.log('number of videos now vs before : ',crnt.val(),prev.val() );
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
                });
            console.log('Updated');
        }
    });
