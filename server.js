var express = require('express');
var app = express();
var fs = require('fs');

app.get('/projects', function(req, res) {
  fs.readFile(__dirname + '/data/projects.json', 'utf8', function(err, data) {
    res.end(data);
  });
});

var server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
