'use strict';

const express = require('express');
const requestProxy = require('express-request-proxy');

const router = express.Router();

router.get('/rs/items/:itemId', requestProxy({
  url: 'http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=:itemId'
}));

module.exports = router;
