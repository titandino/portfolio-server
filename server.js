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
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1');
  res.setHeader('Access-Control-Allow-Origin', 'http://trentonkress.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET POST PUT');
  next();
});

app.get('/', function(req, res) {
  res.end('Welcome to the empty root. There\'s nothing to see here!');
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
        let token = jwt.sign(user, app.get('superSecret'), {
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

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
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
