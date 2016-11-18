'use strict';

const express = require('express');
const requestProxy = require('express-request-proxy');

const router = express.Router();

router.get('/items/:itemId', requestProxy({
  url: 'http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=:itemId'
}));

router.get('/highscores/:username', requestProxy({
  url: 'http://services.runescape.com/m=hiscore/index_lite.ws?player=:username'
}));

module.exports = router;
