'use strict';

const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonToken = require('jsonwebtoken');
const path = require('path');

const config = require('./config');

const Auth = require('./models/auth');
const Project = require('./models/project');

mongoose.Promise = global.Promise;

app.set('tokenKey', config.tokenKey);

mongoose.connect(config.database, function(err) {
  if (err)
    throw err;
  console.log('Successfully connected to MongoDB');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './public/admin.html'));
});

const rsRoutes = express.Router();

//"just for fun" mirror to test bypassing cross-origin limit BS
rsRoutes.get('/rs/items/:itemId', function(req, res) {
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

app.use('/rs', apiRoutes);

const githubRoutes = express.Router();

githubRoutes.get('/user', function(req, res) {
  let options = {
    hostname: 'https://api.github.com',
    port: 80,
    path: '/user',
    headers: {
      'Authentication': 'token ' + config.githubToken
    }
  };
  https.get(options, (httpsRes) => {
    res.json(httpsRes);
  });
});

app.use('/github', githubRoutes);

const apiRoutes = express.Router();

apiRoutes.post('/login', function(req, res) {
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
            let token = jsonToken.sign(auth, app.get('tokenKey'), {
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

apiRoutes.get('/projects', function(req, res) {
  Project.find(function(err, projects) {
    if (err)
      console.log(err);
    res.json(projects);
  });
});

apiRoutes.get('/projects/:id', function(req, res) {
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      res.json({
        message: 'No project found with that ID.'
      });
    }
    res.json(project);
  });
});

apiRoutes.use(function(req, res, next) {
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

apiRoutes.post('/projects', function(req, res) {
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

apiRoutes.get('/users', function(req, res) {
  Auth.find(function(err, projects) {
    if (err)
      console.log(err);
    res.json(projects);
  });
});

apiRoutes.delete('/projects', function(req, res) {
  Project.findById(req.body.projId).remove().exec(function() {
    res.end('Successfully deleted.');
  });
});

apiRoutes.put('/projects', function(req, res) {
  Project.findByIdAndUpdate(req.body._id, req.body, function(err, project) {
    if (err)
      console.log(err);
    res.end('Successfully updated. ', project.name);
  });
});

app.use('/api', apiRoutes);

const server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
