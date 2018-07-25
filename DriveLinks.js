const { google } = require('googleapis');
const fileId = '1biz-7bST4HjoykaqSHaooh0bVyvNa2xk';

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

const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();

async function processOauth() {
    const drive = google.drive({
        version: 'v2',
        auth: oauth2Client
    });
    drive.files.get({ fileId: fileId, fields: 'downloadUrl' }, (err, resp) => {
        if (err) {
            console.error(err);
        }
        console.log(resp.data);
    });
}
database.ref('/GoogleDriveCredentials').once('value').then((credential) => {
    let GoogleDriveCredentail = credential.val();
    console.log(GoogleDriveCredentail.access_token);
    // oauth2Client.refreshToken
    oauth2Client.credentials = GoogleDriveCredentail;
    /**
     * the below method refeshes the oauth2.accesstoken
     */
    oauth2Client.refreshAccessToken((token)=>{
        console.log("inside refeshAccessToken")
        console.log(oauth2Client.credentials.access_token);
    })
    processOauth();
})

module.exports = {
    getUrl: processOauth
};
