

var express = require("express");
var app = express();
var example = require("./example");
var database = firebase.database();
app.get("/", (req, res) => {
  example.processRequest( function (err, data) {
    if (err)
      res.status(200).write("error");
    else {
      res.status(200).json(data);
    }
  });
});
app.listen(3000);

