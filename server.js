'use strict';

const express = require('express');
const app = express();
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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

app.use(bodyParser.urlencoded(
  { extended: true }
));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
  //res.setHeader('Access-Control-Allow-Origin', 'http://trentonkress.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET POST PUT');
  next();
});

app.get('/', function(req, res) {
  res.end('Welcome to the empty root. There\'s nothing to see here!');
});

const apiRoutes = express.Router();

apiRoutes.post('/login', function(req, res) {
  Auth.findOne({ username: req.body.details.username }, function(err, auth) {
    if (err)
      throw err;
    auth.checkPass(req.body.details.password, function(err, isMatch) {
      if (err)
        throw err;
      console.log('Authentication request for ' + req.body.details.username, isMatch);
      if (isMatch) {
        let token = jwt.sign(user, app.get('tokenKey'), {
          expiresInMinutes: 1440
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Login sucessful.',
          token: token
        });
      }
    });
  });
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
    if (err)
      console.log(err);
    res.json(project);
  });
});

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('tokenKey'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
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

apiRoutes.put('/projects/:id', function(req, res) {
  Project.findByIdAndUpdate(req.params.id, req.body, function(err, project) {
    if (err)
      console.log(err);
    res.json(project);
  });
});

app.use('/api', apiRoutes);

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

const server = app.listen(80, function() {
  console.log('Portfolio server listening at http://' + server.address().address + ':' + server.address().port);
});
