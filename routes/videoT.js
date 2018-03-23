
let fs = require('fs');
let readline = require('readline');
let google = require('googleapis');
let googleAuth = require('google-auth-library');
let SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';

// Load client secrets from a local file.
let param = {
    'params': {
        'id': 'fUpdBdwMy3M',
        'part': 'contentDetails'
    }
};
let GetVideoTime = function (callbackIndex , list_IDvideos) {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        //param.params.id = list_IDvideos;
        authorize(JSON.parse(content) , param , videosListById ,callbackIndex);
    });
};

function authorize(credentials, requestData, callback) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, requestData, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, requestData);
        }
    });
}
function getNewToken(oauth2Client, requestData, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client, requestData);
        });
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
    for (let p in params) {
        if (!params[p] || params[p] === undefined) {
            delete params[p];
        }
    }
    return params;
}
function createResource(properties) {
    let resource = {};
    let normalizedProps = properties;
    for (let p in properties) {
        let value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            let adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (let p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            let propArray = p.split('.');
            let ref = resource;
            for (let pa = 0; pa < propArray.length; pa++) {
                let key = propArray[pa];
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
function videosListById(auth, requestData) {
    let service = google.youtube('v3');
    let parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.videos.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
}

module.exports = {
    getVid :GetVideoTime
};