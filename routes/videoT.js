
var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
var googleAuth = require('google-auth-library');
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
// Load client secrets from a local file.
var counter = 0;
var list_IDvideos;
var GetVideoTime = function (callbackIndex, listIDvideos) {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        var param = {
            'params': {
                // 'id': 'fUpdBdwMy3M',
                'part': 'contentDetails'
            }
        };
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        list_IDvideos = listIDvideos;
        console.log("length of list is ", list_IDvideos.length);

        authorize(JSON.parse(content), param, videosListById, callbackIndex);
    });
};

function authorize(credentials, requestData, callback, callbackIndex) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];

    var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    getNewToken(oauth2Client, requestData, callback, callbackIndex);
    // Check if we have previously stored a token.
}
function getNewToken(oauth2Client, requestData, callback, callbackIndex) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
        oauth2Client.credentials = tokens;
        callback(oauth2Client, requestData, callbackIndex);
    });
}
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}
function removeEmptyParameters(params) {
    for (var p in params) {
        if (!params[p] || params[p] === undefined) {
            delete params[p];
        }
    }
    return params;
}
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
                if (pa === (propArray.length - 1)) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        };
    }
    return resource;
}
function videosListById(auth, requestData, callbackIndex) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;

    // Check if we have previously stored a token.
    let repeat = ()=> {

        parameters['id'] = (list_IDvideos.splice(0, 50)).toString();

        service.videos.list(parameters, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            callbackIndex(response.data, list_IDvideos.length);
            console.log(list_IDvideos.length);
            if (list_IDvideos.length > 0)
                repeat();
        });
    };
    repeat();
}

module.exports = {
    getVid: GetVideoTime
};