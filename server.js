'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res, next) {
  console.log('Connection from: ' + req.connection.remoteAddress.replace('::ffff:', '') + ' requesting ' + req.url);
  next();
});

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './public/admin.html'));
});

app.get('/asteroids', function(req, res) {
  res.redirect('http://titandino.github.io/canvas-game');
});

app.use('/api', require('./routes/api'));
app.use('/rs', require('./routes/rs'));

const server = app.listen(process.env.PORT, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
