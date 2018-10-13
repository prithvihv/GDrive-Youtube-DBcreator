var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
// Get playlists
var request = require('request');
var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
//const isPlaylist = require("is-playlist");
var count = 0;
var that;
var key = require('../AjAppV2-phvajapp.json');
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

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }

    oauth2Client.credentials = tokens;

    callback(oauth2Client, requestData, callbackindex, title, playlistIDNODE);
  });

}

function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
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

