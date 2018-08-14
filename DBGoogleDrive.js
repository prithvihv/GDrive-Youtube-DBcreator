const { google } = require('googleapis');
const folderID = "1yhcRUfFAltmN4izu1k7cBoIe_HM1MrgO";


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
console.log(oauth2Client.generateAuthUrl());
oauth2Client

oauth2Client.credentials = GoogleDriveCredentail;
/**
 * the below method refeshes the oauth2.accesstoken
 */
oauth2Client.refreshAccessToken((token) => {
    console.log("inside refeshAccessToken");
    console.log(oauth2Client.credentials.access_token);
    main();
})