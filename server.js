var express = require('express'),
  passport = require('passport');

// Init app
var app = module.exports = express();

var SessionStore = express.session.MemoryStore;

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.methodOverride());
  app.use(express.favicon());

  app.use(express.session({
    key: '_session',
    secret: 'MYSecurityString',
    store: new SessionStore(),
    maxAge: 7200000
  }));
  
  app.use(passport.initialize());

  app.use(app.router);
});

// OAuth server
var oauth2 = require('./oauth2')(app);

// Routes
var routes = require('./routes')(app);

app.post('/login', routes.login);
app.post('/logout', routes.logout);

app.get('/info', routes.info());

app.listen(3000, function () {
  console.log('> NODE_ENV:', app.settings.env);
  console.log('> Express server listening on port:', 3000);
});