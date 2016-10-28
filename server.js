'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './public/admin.html'));
});

app.use('/api', require('./routes/api'));
app.use('/rs', require('./routes/rs'));

const server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
