'use strict';

const express = require('express');
const requestProxy = require('express-request-proxy');

const router = express.Router();

router.get('/items/*', requestProxy({
  url: 'http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=*'
}));

router.get('/highscores/*', requestProxy({
  url: 'http://services.runescape.com/m=hiscore/index_lite.ws?player=*'
}));

module.exports = router;
