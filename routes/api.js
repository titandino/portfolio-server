'use strict';

const express = require('express');
const mongoose = require('mongoose');
const jsonToken = require('jsonwebtoken');

const Auth = require('../models/auth');
const Project = require('../models/project');

const router = express.Router();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-server';
const TOKEN_KEY = process.env.TOKEN_KEY || 'testtestmeme';

const TOKEN_EXPIRY_TIME = 60 * 60 * 24;

mongoose.Promise = global.Promise;

mongoose.connect(MONGODB_URI, function(err) {
  if (err) {
    console.log('Error connecting to MongoDB.');
    return;
  }
  console.log('Successfully connected to MongoDB');
});

router.post('/login', function(req, res, next) {
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
      if (err) return next(err);
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
    if (err) console.log(err);
  });
});

router.get('/projects', function(req, res, next) {
  Project.find(function(err, projects) {
    if (err) return next(err);
    projects.sort((a, b) => {
      a = a.date.split(' ');
      b = b.date.split(' ');
      return new Date(Date.parse(b[0] + ' 1, ' + b[1])) - new Date(Date.parse(a[0] + ' 1, ' + a[1]));
    });
    res.json(projects);
  });
});

router.get('/projects/:id', function(req, res, next) {
  Project.findById(req.params.id, function(err, project) {
    if (err) return next(err);
    res.json(project);
  });
});

router.use(require('../lib/auth-middleware'));

router.post('/projects', function(req, res, next) {
  let newProject = new Project(req.body);
  newProject.save(function(err) {
    if (err) return next(err);
    res.json(newProject);
  });
});

router.get('/users', function(req, res, next) {
  Auth.find(function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

router.delete('/projects/:id', function(req, res, next) {
  Project.findByIdAndRemove(req.params.id, function(err) {
    if (err) return next(err);
    res.end('Successfully deleted.');
  });
});

router.put('/projects/:id', function(req, res, next) {
  Project.findByIdAndUpdate(req.params.id, req.body, function(err, project) {
    if (err || !project) return next(err);
    res.json(project);
  });
});

module.exports = router;
