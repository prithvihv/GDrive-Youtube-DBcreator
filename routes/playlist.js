var request = require('request');
var processs = require('./process');
var {google} = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
// Get playlists
var request = require('request');
//var googleAuthJwt = require('google-oauth-jwt');
var key = require('../AjAppV2-phvajapp.json');
var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES, // an array of auth scopes
    null
);

var currentplaylist;

//var googleAuth = require('google-auth-library');
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

    jwtClient.authorize((err, tokens) => {
        if (err) {
            console.log(err);
            return;
        }
        oauth2Client.credentials = tokens;
        callback(oauth2Client, requestData, callbackthisFile);
    });

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

function playlistsListByChannelId(auth, requestData, callbackthisFile) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.playlists.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an errorrrrrrr: ' + err);
            return;
        }
        callbackthisFile(response);
    });
}



var processRequest = function (callbackindex, ChannelIID, LoopHandler) {
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
        authorize(JSON.parse(content), param, playlistsListByChannelId, (ArrayYoutubePlaylist) => {
            let i = 0;
            let ArrayPlaylistChannel = ArrayYoutubePlaylist.data.items;
            let Looper = () => {
                i++;
                if (i < ArrayPlaylistChannel.length)
                    processPlaylistChannels(i);
                else
                    LoopHandler();
            }
            let processPlaylistChannels = (j) => {
                processs.getVideos(ArrayPlaylistChannel[j].id, callbackindex, ArrayPlaylistChannel[j].snippet.title, null, Looper,ArrayPlaylistChannel[j].snippet.publishedAt);
            }
            processPlaylistChannels(i);
        });
        //writing call back here
    });

};
module.exports = {
    processRequest: processRequest
};
