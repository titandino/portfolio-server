'use strict';

const express = require('express');
const http = require('http');

const router = express.Router();

const SKILL_NAMES = ['Overall', 'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility',
  'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', 'Invention']

router.get('/items/:itemId', function(req, res) {
  http.get('http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=' + req.params.itemId, function(httpRes) {
    let body = '';

    httpRes.on('data', function(chunk) {
      body += chunk;
    });

    httpRes.on('end', function() {
      if (body.includes('DOCTYPE')) {
        res.end('No item information found.');
      } else {
        let allItem = JSON.parse(body);
        let item = {
          name: allItem.item.name,
          description: allItem.item.description,
          image: allItem.item.icon_large,
          price: allItem.item.current.price
        };
        res.json(item);
      }
    });
  }).on('error', function(e) {
    console.log('Error getting item details', e);
  });
});

router.get('/highscores/:username', function(req, res) {
  http.get('http://services.runescape.com/m=hiscore/index_lite.ws?player=' + req.params.username, function(httpRes) {
    let body = '';

    httpRes.on('data', function(chunk) {
      body += chunk;
    });

    httpRes.on('end', function() {
      if (body.includes('DOCTYPE')) {
        res.end('No stats found for player.');
      } else {
        let statBlocks = body.split('\n');
        let stats = [];
        for (let i = 0;i < statBlocks.length;i++) {
          if (i >= SKILL_NAMES.length)
            break;
          let statRanks = statBlocks[i].split(',');
          stats[i] = {
            skillName: SKILL_NAMES[i],
            rank: statRanks[0],
            level: statRanks[1],
            xp: statRanks[2]
          };
        }
        res.json(stats);
      }
    });
  }).on('error', function(e) {
    console.log('Error getting item details', e);
  });
});

module.exports = router;
