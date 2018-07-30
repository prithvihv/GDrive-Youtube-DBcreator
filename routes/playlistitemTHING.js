var fs = require('fs');
var readline = require('readline');
const { google } = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/google-apis-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';
var key = require('../AJapp-55843faea217.json');
var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES, // an array of auth scopes
    null
);

// 'part': 'snippet,contentDetails',
// 'playlistId': 'PLBCF2DAC6FFB574DE'


var processRequest = function (callbackIndex, token, playlistChannel) {
    var param = {
        'params': {
            'maxResults': '50',
            'part': 'snippet',
        }
    };
    // console.log("process called");
    // console.log(token);
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        param.params.playlistId = playlistChannel;
        if (token) {
            param.params.pageToken = token;
        }else{
            console.log("no token ", playlistChannel);
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        //See full code sample for authorize() function code.
        authorize(JSON.parse(content), param, playlistItemsListByPlaylistId, callbackIndex);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, requestData, callback, callbackIndex) {
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var redirectUrl = credentials.web.redirect_uris[0];

        var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

        //       Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, requestData, callback, callbackIndex);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client, requestData, callbackIndex);
            }
        });
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, requestData, callback, callbackIndex) {
    // var authUrl = oauth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: SCOPES
    // });
    // console.log('Authorize this app by visiting this url: ', authUrl);
    // var rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });
    // rl.question('Enter the code from that page here: ', function (code) {
    //     rl.close();
    //     oauth2Client.getToken(code, function (err, token) {
    //         if (err) {
    //             console.log('Error while trying to retrieve access token', err);
    //             return;
    //         }
    //         oauth2Client.credentials = token;
    //         storeToken(token);
    //         callback(oauth2Client, requestData, callbackIndex);
    //     });
    // });
    

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
        oauth2Client.credentials = tokens;
        callback(oauth2Client, requestData, callbackIndex);
    });
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
        if (!params[p] || params[p] == 'undefined') {
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


function playlistItemsListByPlaylistId(auth, requestData, callbackIndex) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    console.log(parameters);
    service.playlistItems.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an errorrrrrrr (playlistitemjs): ' + err);
            return;
        }
        //console.log("got response re routing");
        callbackIndex(false, response, response['nextPageToken']);
    });
}

module.exports = {
    processRequest: processRequest
};