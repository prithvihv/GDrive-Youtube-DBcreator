var request = require('request');
var cheerio = require('cheerio');
//const isPlaylist = require("is-playlist");
urlParser = require('js-video-url-parser');
var url = 'https://www.youtube.com/user/LightoftheSelf/playlists';
var count = 0;
request(url, function (err, resp, body) {
    $ = cheerio.load(body);
    links = $('a'); //jquery get all hyperlinks
    $(links).each(function (i, link) {
        var line = $(link).attr('href');
        if (line.indexOf("youtube") == -1)
            line = "https://www.youtube.com" + line;
        if(urlParser.parse(line)){
            if(urlParser.parse(line).mediaType =="playlist"){
                console.log(urlParser.parse(line));
                count++;
            }
        }
    });
});





