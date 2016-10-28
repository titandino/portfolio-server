'use strict';

const express = require('express');
const mongoose = require('mongoose');
const jsonToken = require('jsonwebtoken');

const config = require('../config');

const Auth = require('../models/auth');
const Project = require('../models/project');

const router = express.Router();

mongoose.Promise = global.Promise;

mongoose.connect(config.database, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected to MongoDB');
});

router.post('/login', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.end('Username or password not given.');
  } else {
    Auth.findOne({ username: req.body.username }, function(err, auth) {
      if (err)
        throw err;
      if (!auth) {
        res.json({
          success: false,
          message: 'Username or password incorrect.',
        });
      } else {
        auth.checkPass(req.body.password, function(err, isMatch) {
          if (err)
            throw err;
          console.log('Authentication request for ' + req.body.username, isMatch);
          if (isMatch) {
            let token = jsonToken.sign(auth, config.tokenKey, {
              expiresIn: config.token_expiry_time
            });

            // return the information including token as JSON
            res.json({
              success: true,
              message: 'Login sucessful.',
              token: token,
              expiresIn: Date.now() + (config.token_expiry_time * 1000)
            });
          }
        });
      }
    });
  }
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
    jsonToken.verify(token, app.get('tokenKey'), function(err, decoded) {
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
  Auth.find(function(err, projects) {
    if (err)
      console.log(err);
    res.json(projects);
  });
});

router.delete('/projects', function(req, res) {
  Project.findById(req.body.projId).remove().exec(function() {
    res.end('Successfully deleted.');
  });
});

router.put('/projects', function(req, res) {
  Project.findByIdAndUpdate(req.body._id, req.body, function(err, project) {
    if (err)
      console.log(err);
    res.end('Successfully updated. ', project.name);
  });
});

module.exports = router;
