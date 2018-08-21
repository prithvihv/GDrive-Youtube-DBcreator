var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';
// Get playlists
var request = require('request');
var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
//const isPlaylist = require("is-playlist");
var count = 0;
var that;
var key = require('../AJapp-55843faea217.json');
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES, // an array of auth scopes
  null
);
var CallbackLooper;
var publishedtime ; 

function getVideos(playlistIDNODE, callbackindex, title, gg, loopfunctions,publishedAt) {

  // Load client secrets from a local file.
  CallbackLooper = loopfunctions;
  publishedtime = publishedAt;
  var param = {
    'params': {
      'maxResults': '50',
      'part': 'snippet',
    }
  };
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    //See full code sample for authorize() function code.
    param.params.playlistId = playlistIDNODE;
    authorize(JSON.parse(content), param, playlistItemsListByPlaylistId, callbackindex, title, playlistIDNODE);
  });
}
function authorize(credentials, requestData, callback, callbackindex, title, playlistIDNODE) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
  getNewToken(oauth2Client, requestData, callback, callbackindex, title, playlistIDNODE);
}
function getNewToken(oauth2Client, requestData, callback, callbackindex, title, playlistIDNODE) {
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

    callback(oauth2Client, requestData, callbackindex, title, playlistIDNODE);
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
//oauth2Client, requestData, callbackindex,title,playlistIDNODE,call
function playlistItemsListByPlaylistId(auth, requestData, callbackindex, title, playlistIDNODE) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  parameters['playlistId'] = playlistIDNODE;
  service.playlistItems.list(parameters, function again(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    response.data['playlistid'] = playlistIDNODE;
    response.data['title'] = title;
    response.data['publishedAt']=publishedtime;
    console.log("Playlist Tilte :" + title);
    if (response.data['nextPageToken'] == null || response.data['nextPageToken'] == undefined) {
      callbackindex(false, response.data).then(() => {
        CallbackLooper();
      });
    } else {
      callbackindex(false, response.data).then(() => {
        parameters['pageToken'] = response.data['nextPageToken'];
        service.playlistItems.list(parameters, again);
      });
    }
  });
}
module.exports = {
  getVideos: getVideos
};

