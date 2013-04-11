module.exports = function () {
  var models = require('./models'),
    passport = require('passport');

  function _login(req, res) {
    if (req.session.user)
      return res.json({error: "You'r logged in!"});

    if (!req.body || !req.body.email || !req.body.password)
      return res.status(400).json({error: "Bad request"});

    models.User.authenticate(req.body.email, req.body.password, function (err, user) {
      if ('number' === typeof err)
        return res.status(err).json({error: user});

      if (!user || err)
        return res.status(400).json({error: err});

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email
      };

      res.json(req.session.user);
    });
  };

  function _logout(req, res) {
    req.session.destroy(function (err) {
      if (err)
        return res.status(500).json({error: "Internal service error."});
      delete req.session;
      res.json({success: "Good bye!"});
    });
  };

  function _info() {
    return [
      passport.authenticate('bearer', { session: false }),
      function (req, res) {
        res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
      }
    ];
  };

  return {
    login: _login,
    logout: _logout,
    info: _info
  };
}