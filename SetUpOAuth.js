const scopes = [
    'https://www.googleapis.com/auth/drive'
];
const { google } = require('googleapis');
const readline = require('readline');
let getUrl = require('./DriveLinks.js');

let config = {
    apiKey: "AIzaSyDLi5odhLcnMqKim-bj9Z6kQyeg7-6DKmo",
    authDomain: "ajappprod.firebaseapp.com",
    databaseURL: "https://ajappprod.firebaseio.com",
    projectId: "ajappprod",
    storageBucket: "ajappprod.appspot.com",
    messagingSenderId: "485319972083"
};
const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();



const oauth2Client = new google.auth.OAuth2(
    "512241350585-gp19bgimhm0151j9eelmjidho8dgdbpb.apps.googleusercontent.com",
    "Mx7r2e2m9ODERZuTdMda6hdi",
    "urn:ietf:wg:oauth:2.0:oob"
);
const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
});
console.log('Authorize this app by visiting this url: ', url);
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Enterprocessing the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
        console.log("getToken Method : " + JSON.stringify(token));
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        oauth2Client.credentials = token;
        //getUrl.getUrl(oauth2Client);
        database.ref("/GoogleDriveCredentials").update(token).then(() => {
            console.log("Wrote to db");
        }).catch(() => {
            console.log("fail");
        });
    });
    // oauth2Client.on('tokens', (tokens) => {
    //     if (tokens.refresh_token) {
    //         // store the refresh_token in my database!
    //         console.log("onMethod refeshtoken : " + tokens.refresh_token);
    //     }
    //     // database.ref("/GoogleDriveCredentials").update(tokens).then(() => {
    //     //     console.log("Wrote to db");
    //     // }).catch(() => {
    //     //     console.log("fail");
    //     // });
    //     console.log("onMethod accesstoken : " + tokens.access_token);
    // });
});
