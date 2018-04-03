
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
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
var param = {
    'params': {
        // 'id': 'fUpdBdwMy3M',
        'part': 'contentDetails'
    }
};
var list_IDvideos;
var GetVideoTime = function (callbackIndex, listIDvideos) {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        list_IDvideos = listIDvideos;

        authorize(JSON.parse(content), param, videosListById, callbackIndex);
    });
};

function authorize(credentials, requestData, callback, callbackIndex) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (list_IDvideos.length > 50) {
            while (list_IDvideos.length) {
                requestData.params.id = (list_IDvideos.splice(0, 50)).toString();
                if (err) {
                    getNewToken(oauth2Client, requestData, callback, callbackIndex);
                } else {
                    oauth2Client.credentials = JSON.parse(token);
                    callback(oauth2Client, requestData, callbackIndex);
                }
            }
        } else {
            requestData.params.id = list_IDvideos;
            if (err) {
                getNewToken(oauth2Client, requestData, callback, callbackIndex);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client, requestData, callbackIndex);
            }
        }
    });
}
function getNewToken(oauth2Client, requestData, callback, callbackIndex) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(tokens);
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
    service.videos.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log("reponse recreated");
        callbackIndex(response);
    });
}

module.exports = {
    getVid: GetVideoTime
};