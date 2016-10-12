'use strict';

const express = require('express');
const app = express();
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/portfolioProjects', function(err) {
  if (err)
    throw err;
  console.log('Successfully connected to MongoDB');
});

const authSchema = new mongoose.Schema({
  username: String,
  password: String
});

authSchema.pre('save', function(next) {
  //Check if the password was changed in the save so we don't encrypt it twice.
  if (!this.isModified('password'))
    return next();

  //encrypt the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err)
      return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err)
        return next(err);

      this.password = hash;
      next();
    });
  });
});

authSchema.methods.checkPass = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, matches) {
    if (err)
      return callback(err);
    callback(null, matches);
  });
};

const Auth = mongoose.model('Auth', authSchema);

const projectSchema = new mongoose.Schema({
  name: String,
  role: String,
  shortDesc: String,
  date: String,
  desc: String,
  img: String,
  type: String
});

const Project = mongoose.model('Project', projectSchema);

app.use(bodyParser.urlencoded(
  { extended: true }
));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/', function(req, res) {
  res.end('Welcome to the empty root. There\'s nothing to see here!');
});

app.post('/login', function(req, res) {
  Auth.findOne({ username: req.body.details.username }, function(err, user) {
    if (err)
      throw err;
    user.checkPass(req.body.details.password, function(err, isMatch) {
      if (err)
        throw err;
      console.log('Authentication request for ' + req.body.details.username, isMatch);
      if (isMatch) {
        res.end('Logged in.');
      } else {
        res.end('Invalid login details.');
      }
    });
  });
});

app.post('/projects', function(req, res) {
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
      if (req.body.project[key]) {
        projectParams[key] = req.body.project[key];
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
      console.log(newProject);
      res.end('Successfully added: ' + projectParams.name);
    }
  });
});

app.get('/projects', function(req, res) {
  Project.find(function(err, projects) {
    if (err)
      console.log(err);
    res.json(projects);
  });
});

app.get('/projects/:id', function(req, res) {
  Project.findById(req.params.id, function(err, project) {
    if (err)
      console.log(err);
    res.json(project);
  });
});

app.put('/projects/:id', function(req, res, next) {
  Project.findByIdAndUpdate(req.params.id, req.body, function(err, project) {
    if (err)
      console.log(err);
    res.json(project);
  });
});

app.get('/rs/items/:itemId', function(req, res) {
  http.get('http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=' + req.params.itemId, function(httpRes) {
    let body = '';

    httpRes.on('data', function(chunk) {
      body += chunk;
    });

    httpRes.on('end', function() {
      res.end(body);
    });
  }).on('error', function(e) {
    console.log('Error getting item details', e);
  });
});

const server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
