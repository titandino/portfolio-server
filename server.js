'use strict';

const webpack = require('webpack');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const errors = require('./lib/errhandling');

const PORT = process.env.PORT || 5555;
let server;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function(req, res, next) {
  console.log('Connection from: ' + req.connection.remoteAddress.replace('::ffff:', '') + ' requesting ' + req.url);
  next();
});

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './build/admin.html'));
});

app.get('/ipviewer', function(req, res) {
  res.sendFile(path.join(__dirname, './build/ipviewer.html'));
});

app.use('/api', require('./routes/api'));
app.use('/rs', require('./routes/rs'));

app.use(errors);


console.log('Building webpage...');
webpack(require('./webpack.config.js'), (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(err);
    return;
  }
  console.log('Built webpage successfully...');
  server = app.listen(PORT, function() {
    console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
  });
});
