'use strict';

const express = require('express');
const mongoose = require('mongoose');
const jsonToken = require('jsonwebtoken');

const Auth = require('../models/auth');
const Project = require('../models/project');

const router = express.Router();

const TOKEN_EXPIRY_TIME = 60 * 60 * 24;

let projects = [
  {
    "name":"Asteroids",
    "role":"Engine/Content Programmer",
    "shortDesc":"A 2D implementation of Asteroids in JavaScript.",
    "date":"August 2016 - September 2016",
    "desc":"<p>Programmed both the engine and the gameplay from scratch. Small engine that was created includes game object rendering with the 3 essential position, rotation, and scaling transformations, particle system with fading transparency, bounding box static collision, and basic physics up to acceleration. Gameplay includes a menu flow, random asteroids that split based on scale, and powerups. Click <a href=\"http://titandino.github.io/canvas-game/\" target=\"_blank\">here</a> to play the game.</p>",
    "img":"img/asteroids.png",
    "type":"game"
  },
  {
    "name":"RuneScape Private Servers",
    "role":"Programmer/Project Manager",
    "shortDesc":"RuneScape server emulations written in Java.",
    "date":"June 2007 - July 2016",
    "desc":"<p>Reverse engineering obfuscated Java game clients and writing servers that communicate with them to both emulate the real game and create custom content that players suggest ingame or on the website forum. An example showcasing boss mechanics can be seen on my YouTube channel <a href=\"https://www.youtube.com/watch?v=q2-tvHWhIBA\" target=\"_blank\">here</a>.</p>",
    "img":"img/runescape.png",
    "type":"game"
  },
  {
    "name":"Curiosity",
    "role":"Engine/Content Programmer",
    "shortDesc":"A 2D puzzle platformer game written in C. (Team of 3 programmers)",
    "date":"April 2013 - June 2013",
    "desc":"<p>Programmed many engine elements including particle systems and an audio controller using the FMOD API. Worked a lot on the physics and graphics end which involved matrices for sprite transformations and vectors for physics and collision detection.</p>",
    "img":"img/curiosity.png",
    "type":"game"
  }
];

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected to MongoDB');
});

router.get('/createprojects', function(req, res) {
  for (let i = 0;i < projects.length;i++) {
    let project = new Project(projects[i]);
    project.save(function(err) {
      if (err) console.log(err);
      console.log('Saved ' + i);
    });
  }
});

router.post('/login', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.end('Username or password not given.');
  }

  let promise = Auth.findOne({ username: req.body.username }).exec();

  promise.then(function(auth) {
    if (!auth) {
      res.json({
        success: false,
        message: 'Username or password incorrect.',
      });
    }
    return auth;
  }).then(function(auth) {
    auth.checkPass(req.body.password, function(err, isMatch) {
      if (err)
        throw err;
      console.log('Authentication request for ' + req.body.username, isMatch);
      if (isMatch) {
        let token = jsonToken.sign(auth, process.env.TOKEN_KEY, {
          expiresIn: TOKEN_EXPIRY_TIME
        });

        res.json({
          success: true,
          message: 'Login sucessful.',
          token: token,
          expiresIn: Date.now() + (TOKEN_EXPIRY_TIME * 1000)
        });
      }
    });
  }).catch(function(err) {
    console.log(err);
  });
});

router.get('/projects', function(req, res) {
  Project.find(function(err, projects) {
    if (err)
      console.log(err);
    res.json(projects);
  });
});

router.get('/projects/:id', function(req, res) {
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      res.json({
        message: 'No project found with that ID.'
      });
    }
    res.json(project);
  });
});

router.use(function(req, res, next) {
  console.log(req.body);
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jsonToken.verify(token, process.env.TOKEN_KEY, function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

router.post('/projects', function(req, res) {
  let projectParams = {
    name:'Default Filler',
    role:'Programmer',
    shortDesc:'Default filler project.',
    date:'Sploosh',
    desc:'<p>Hey there!</p>',
    img:'img/default.png',
    type:'default'
  };

  for (let key in projectParams) {
    if (projectParams.hasOwnProperty(key)) {
      if (req.body[key]) {
        projectParams[key] = req.body[key];
      } else {
        res.end('Missing form value', key);
      }
    }
  }

  let newProject = new Project(projectParams);
  newProject.save(function(err) {
    if (err) {
      console.log(err);
      res.end('Error adding project');
    } else {
      console.log('Successfully added: ' + projectParams.name);
      res.end('Successfully added: ' + projectParams.name);
    }
  });
});

router.get('/users', function(req, res) {
  Auth.find(function(err, users) {
    if (err)
      console.log(err);
    res.json(users);
  });
});

router.delete('/projects', function(req, res) {
  Project.findById(req.body.projId).remove().exec(function() {
    res.end('Successfully deleted.');
  });
});

router.put('/projects', function(req, res) {
  Project.findOneByIdAndUpdate(req.body._id, req.body, function(err, project) {
    if (err)
      console.log(err);
    res.end('Successfully updated. ', project.name);
  });
});

module.exports = router;
