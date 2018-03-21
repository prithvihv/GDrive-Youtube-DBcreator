
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/google-apis-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';
// Get playlists
var request = require('request');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
//const isPlaylist = require("is-playlist");
var count = 0;
var that;

var param = {
  'params': {
    'maxResults': '50',
    'part': 'snippet',
  }
};

function getVideos(playlistIDNODE, callback1, title, token) {
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    //See full code sample for authorize() function code.
    param.params.playlistId = playlistIDNODE;
    console.log(token);
    if (token != null || token != undefined)
      param.params.pageToken = token;
    authorize(JSON.parse(content), param, playlistItemsListByPlaylistId, callback1, title, playlistIDNODE);
  });
}
function authorize(credentials, requestData, callback, callback1, title, playlistIDNODE) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, requestData, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, requestData, callback1, title, playlistIDNODE);
    }
  });
}
function getNewToken(oauth2Client, requestData, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
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
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
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

var ttle;
var plid;
var self;
function playlistItemsListByPlaylistId(auth, requestData, callback1, title, playlistIDNODE) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  parameters['playlistId'] = playlistIDNODE;
  service.playlistItems.list(parameters, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    /*if(response.items.length!=0)
      response.items.forEach(element => {
        console.log(element.contentDetails);
      });*/
    if (response['nextPageToken'] == null || response['nextPageToken'] == undefined) {
      console.log("no token");
      response["title"] = title;
      //console.log(response);
      callback1(false, response);
      // console.log(response);
    }

    if (response['nextPageToken'] != null || response['nextPageToken'] != undefined) {
      console.log("token present", " ", title);
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the YouTube API.
      //See full code sample for authorize() function code.
      // authorize(JSON.parse(content), {
      //   'params': {
      //     'maxResults': '50',
      //     'pageToken': response.nextPageToken,
      //     'part': 'snippet,contentDetails',
      //     'playlistId': currentplaylist
      //   }
      // }, playlistItemsListByPlaylistId);
      response['playlistid'] = playlistIDNODE;
      response['title'] = title;
      callback1(false, response);
    }
  });
}
module.exports = {
  getVideos: getVideos
};

