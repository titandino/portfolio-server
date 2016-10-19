# Trent's Portfolio Website/API Server
This is the source to Trent's Code 301 portfolio website and small (and slightly unecessary) API that handles the project data via an admin page.

## Dependencies
Here are the main dependencies that are being utilized within the project.

**Express**
  : This package is what runs the server. It provides a very streamlined way of adding middleware to an HTTP server in NodeJS.

**Body-Parser**
  : Allows easy reading of request bodies by automatically parsing JSON and turning URL Encoded information into a body object.

**Mongoose**
  : Amazing package that integrates Node with a MongoDB server in a very object-oriented Schema fashion. (I love this compared to SQL..)

**JSONWebToken**
  : Powers my authentication system with json web tokens that have expiry and security built into them when they are generated.

**BCryptJS**
  : Encrypts all the passwords for my oh so numerous.. single.. admin account that allows me to edit my projects database. Increases security by not storing the passwords in raw text format.

## API Reference

### Authentication
Logging in can be done by sending a POST request to

<code>POST http://trentonkress.com/api/login?username=USER_NAME&password=PASSWORD</code>

If the login credentials are incorrect, the server will send over this object:

``` javascript
{
  success: false,
  message: 'Username or password incorrect.',
}
```

Upon successful login, the object will contain an auth token along with the date that it will expire like so:

``` javascript
{
  success: true,
  message: 'Login sucessful.',
  token: JSON_WEB_TOKEN,
  expiresIn: Date.now() + (config.token_expiry_time * 1000)
}
```

### Project Data Endpoints
You can use the API to get project information in the form of either a list of all existing projects or a single project by project id.

To get a list of all projects in JSON format send a GET request like so:

<code>GET http://trentonkress.com/api/projects</code>

This will respond with a list of every project in the database.

For details on a single project, send a GET request with the project id in the path like this:

<code>GET http://trentonkress.com/api/projects/PROJECT_ID</code>

The server will respond with a single project object. If the project does not exist in the database, the server will respond with this json object and error message:

``` javascript
{ message: 'No project found with that ID.' }
```

### Modifying Project Data
Modifying project data requires a valid token by logging in and can be done by sending the following requests:

#### Deletion

To delete a project, send a DELETE request to the <code>http://trentonkress.com/api/project</code> endpoint with a json object formatted as follows:

``` javascript
{ projId: PROJECT_ID, token: YOUR_VALID_TOKEN }
```

#### Adding and Modifying
Modifying and adding are done the same way but with PUT and POST requests to the <code>http://trentonkress.com/api/project</code> endpoint. The requests must contain the following JSON object format as data:

``` javascript
{
  _id: PROJECT_ID //(if editing through PUT. Not used on POST)
  name: PROJECT_NAME,
  role: PROJECT_ROLE,
  shortDesc: SHORT_DESCRIPTION,
  date: DATE,
  desc: LONG_DESCRIPTION, //Can contain HTML to render
  img: IMAGE_LINK,
  type: PROJECT_TYPE,
  token: VALID TOKEN
}
```
