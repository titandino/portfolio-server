var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.end('Root');
});

app.get('/data/create', function(req, res) {

});

app.get('/data/projects', function(req, res) {

});

var server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
