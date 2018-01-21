var request = require('request');
var process = require('./process');
var cheerio = require('cheerio');
var processRequest = function (callback) {
var url = 'https://www.youtube.com/user/LightoftheSelf/playlists';
    try {
        request(url, function (err, resp, body) {
            $ = cheerio.load(body);
            links = $('a'); //jquery get all hyperlinks
            $(links).each(function (i, link) {
                var line = $(link).attr('href');
                if (line.indexOf("youtube") == -1)
                    line = "https://www.youtube.com" + line;
                if(urlParser.parse(line)){
                    if(urlParser.parse(line).mediaType =="playlist"){
                        process.getVideos(urlParser.parse(line).list,callback);
                    }
                }
            });
        });
    }
    catch (e) {
        callback(false, {
            key: "ENW0003",
            value: {
                action: "50",
                message: "Request Failed"
            }
        });
    }
}
module.exports = {
    processRequest: processRequest
    
};
