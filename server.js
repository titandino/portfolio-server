'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const errors = require('./lib/errhandling');

const PORT = process.env.PORT || 5555;

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

app.get('/ipviewer', function(req, res) {
  res.sendFile(path.join(__dirname, './public/ipviewer.html'));
});

app.use('/api', require('./routes/api'));
app.use('/rs', require('./routes/rs'));

app.use(errors);

const server = app.listen(PORT, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
