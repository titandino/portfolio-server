'use strict';

const express = require('express');
const app = express();
const requestProxy = require('express-request-proxy');
const bodyParser = require('body-parser');
const path = require('path');

const config = require('./config');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res, next) {
  console.log('Connection from: ' + req.connection.remoteAddress.replace('::ffff:', '') + ' requesting ' + req.url);
  next();
});

app.get('/github/*', requestProxy({
  url: 'https://api.github.com/*',
  headers: { Authorization: 'token ' + config.githubToken}
}));

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './public/admin.html'));
});

app.get('/asteroids', function(req, res) {
  res.redirect('http://titandino.github.io/canvas-game');
});

app.use('/api', require('./routes/api'));
app.use('/rs', require('./routes/rs'));

const server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
