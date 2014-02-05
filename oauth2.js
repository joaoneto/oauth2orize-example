module.exports = function (app) {
  var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    crypto = require('crypto'),
    models = require('./models');
  
  function ensureLoggedIn() {
    return function (req, res, next) {
      if (!req.session.user || !req.session.user.id) {
        return res.redirect('/login');
      }
      next();
    }
  }

  var oauth2 = oauth2orize.createServer();

  oauth2.serializeClient(function (client, done) {
    return done(null, client._id);
  });

  oauth2.deserializeClient(function (_id, done) {
    models.Client.findById(_id, function (err, client) {
      if (err) return done(err);
      return done(null, client);
    });
  });

  oauth2.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
    // var code = utils.uid(16);
    var now = new Date().getTime(),
      code = crypto.createHmac('sha1', 'access_token')
        .update([client.id, now].join())
        .digest('hex');

    var ac = new models.AuthorizationCode({
    	code: code,
    	client_id: client.id,
    	redirect_uri: redirectURI,
    	user_id: client.user_id,
    	scope: ares.scope
    });

    ac.save(function (err) {
      if (err) return done(err);
      return done(null, code);
    });
  }));

  oauth2.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
    models.AuthorizationCode.findOne({code: code}, function (err, code) {
      if (err) return done(err);
      if (client._id.toString() !== code.client_id.toString()) return done(null, false);
      if (redirectURI !== code.redirect_uri) return done(null, false);

      // var token = utils.uid(256);
      var now = new Date().getTime(),
        token = crypto.createHmac('sha1', 'access_token')
          .update([client._id, now].join())
          .digest('hex');


      var at = new models.AccessToken({
        oauth_token: token,
        user_id: code.user_id,
        client_id: client._id,
        scope: code.scope
      });
      at.save(function (err) {
        if (err) return done(err);
        return done(null, token);
      });
    });
  }));


  passport.use(new BasicStrategy(
    function (username, password, done) {
      models.Client.findById(username, function (err, client) {
        if (err) return done(err);
        if (!client) return done(null, false);
        if (client.secret != password) return done(null, false);
        return done(null, client);
      });
    }
  ));

  passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
      models.Client.findById(clientId, function (err, client) {
        if (err) return done(err);
        if (!client) return done(null, false);
        if (client.secret != clientSecret) return done(null, false);
        return done(null, client);
      });
    }
  ));

  passport.use(new BearerStrategy(
    function (accessToken, done) {
      models.AccessToken.findOne({oauth_token: accessToken}, function (err, token) {
        if (err) return done(err);
        if (!token) return done(null, false);
        
        models.User.findById(token.user_id, function (err, user) {
          if (err) return done(err);
          if (!user) return done(null, false);
          // to keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes
          var info = { scope: '*' }
          done(null, user, info);
        });
      });
    }
  ));





  // Move to routes ------------------------------------------------------------
  app.get('/authorize',
    ensureLoggedIn(),
    oauth2.authorization(function (clientID, redirectURI, done) {
      models.Client.findById(clientID, function (err, client) {
        if (err) return done(err);
        if (!client) return done(null, false);
        if (client.redirect_uri != redirectURI) return done(null, false);
        return done(null, client, redirectURI);
      });
    }),
    function (req, res) {
      res.json({
        transactionID: req.oauth2.transactionID,
        user: req.user,
        client: req.oauth2.client
      })
      // res.render('dialog', {
      //   transactionID: req.oauth2.transactionID,
      //   user: req.user,
      //   client: req.oauth2.client
      // });
    }
  );

  app.post('/authorize/decision',
    ensureLoggedIn(),
    oauth2.decision()
  );

  app.post('/token',
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauth2.token(),
    oauth2.errorHandler()
  );
}
