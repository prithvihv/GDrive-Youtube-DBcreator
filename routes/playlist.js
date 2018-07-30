var request = require('request');
var processs = require('./process');
const { google } = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = "./";
var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';
// Get playlists
var request = require('request');
//var googleAuthJwt = require('google-oauth-jwt');
var key = require('../AJapp-55843faea217.json');
var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES, // an array of auth scopes
    null
);

var currentplaylist;


//const isPlaylist = require("is-playlist");


var fs = require('fs');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, requestData, callback, callbackthisFile) {

    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    getNewToken(oauth2Client, requestData, callback, callbackthisFile);

    // Check if we have previously stored a token.
}

function getNewToken(oauth2Client, requestData, callback, callbackthisFile) {
    // var authUrl = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES
    // });
    // console.log('Authorize this app by visiting this url: ' , authUrl);
    // var rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });
    // rl.question('Enterprocessing the code from that page here: ', function (code) {
    //     rl.close();
    //     oauth2Client.getToken(code, function (err, token) {
    //         if (err) {
    //             console.log('Error while trying to retrieve access token', err);
    //             return;
    //         }
    //         oauth2Client.credentials = token;
    //         storeToken(token);
    //         callback(oauth2Client, requestData, callbackthisFile);
    //     });
    // });


    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
        oauth2Client.credentials = tokens;
        callback(oauth2Client, requestData, callbackthisFile);
    });
    // googleAuthJwt.authenticate({
    //     // use the email address of the service account, as seen in the API console 
    //     email: 'nodeserver@ajapp-192505.iam.gserviceaccount.com',
    //     // use the PEM file we generated from the downloaded key 
    //     keyFile: 'your-key-file.pem',
    //     // specify the scopes you wish to access 
    //     scopes: SCOPES
    //   }, function (err, token) {
    //     console.log(token);
    //     console.log("JWT")
    //     if(err){
    //         console.log('Error while trying to retrieve access token', err);
    //         return;
    //     }
    //     oauth2Client.credentials = token;
    //     storeToken(token);
    //     callback(oauth2Client, requestData, callbackthisFile);
    //   });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
    for (var p in params) {
        if (!params[p] || params[p] === 'undefined') {
            delete params[p];
        }
    }
    return params;
}

/**
 * Create a JSON object, representing an API resource, from a list of
 * properties and their values.
 *
 * @param {Object} properties A list of key-value pairs representing resource
 *                            properties and their values.
 * @return {Object} A JSON object. The function nests properties based on
 *                  periods (.) in property names.
 */
function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
        var value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (var p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
                var key = propArray[pa];
                if (pa == propArray.length - 1) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        };
    }
    return resource;
}


function playlistsListByChannelId(auth, requestData, callbackthisFile) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.playlists.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an errorrrrrrr (playlistjs): ' + err);
            return;
        }
        callbackthisFile(response);
    });
}



var processRequest = function (callbackindex, ChannelIID) {
    var param = {
        'params': {
            'maxResults': '50',
            'part': 'snippet,contentDetails'
        }
    };
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        //See full code sample for authorize() function code.
        //             //UCkFglwbnFHOuQYRGbe9yY3Q prithvi channel
        //             //UCNmRmSpIJYqu7ttPLWLx2sw atmajyothisatsang UUNmRmSpIJYqu7ttPLWLx2sw
        //             //UCrsXeU6cuGStvMCUhAgULyg Light of the Self Foundation UUrsXeU6cuGStvMCUhAgULyg
        //UCjXfkj5iapKHJrhYfAF9ZGg
        param.params.channelId = ChannelIID;
        authorize(JSON.parse(content), param, playlistsListByChannelId, function (ArrayYoutubePlaylist) {
            ArrayYoutubePlaylist.items.forEach(playlist => {
                processs.getVideos(playlist.id, callbackindex, playlist.snippet.title, null);

            });
        });
        //writing call back here
    });

};
module.exports = {
    processRequest: processRequest
};
