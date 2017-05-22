'use strict';

const express = require('express');
const mongoose = require('mongoose');
const jsonToken = require('jsonwebtoken');

const Auth = require('../models/auth');
const Project = require('../models/project');

const router = express.Router();

const MONGODB_URI = 'process.env.MONGODB_URI' || 'mongodb://localhost:27017/portfolio-server';
const TOKEN_KEY = process.env.TOKEN_KEY || 'testtestmeme';

const TOKEN_EXPIRY_TIME = 60 * 60 * 24;

mongoose.Promise = global.Promise;

mongoose.connect(MONGODB_URI, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected to MongoDB');
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
        let token = jsonToken.sign(auth, TOKEN_KEY, {
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

router.use(require('../lib/auth-middleware'));

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
