var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/oauth2orize');

// User
var UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String }
});
UserSchema.methods.comparePassword = function (password) {
  return this.password === password;
};
UserSchema.methods.getRoleId = function () {
  return this.role || 'guest';
};
UserSchema.statics.authenticate = function (email, password, next) {
  this.findOne({ email: email }, function (err, user) {
    if (err)
      return next(500, 'Internal service error');

    if (!user || !user.comparePassword(password))
      return next(403, 'E-mail or password invalid');

    return next(null, user);
  });
};
exports.User = mongoose.model('User', UserSchema);

// Client
var ClientSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
  secret: { type: String },
  redirect_uri: { type: String }
});
exports.Client = mongoose.model('Client', ClientSchema);

// AuthorizationCode
var AuthorizationCodeSchema = new mongoose.Schema({
  code: { type: String },
  client_id: { type: mongoose.Schema.ObjectId, ref: 'Client' },
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
  redirect_uri: { type: String },
  scope: { type: String }
});
exports.AuthorizationCode = mongoose.model('AuthorizationCode', AuthorizationCodeSchema);

// AccessToken
var AccessTokenSchema = new mongoose.Schema({
  oauth_token: { type: String },
  user_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
  client_id: { type: mongoose.Schema.ObjectId, ref: 'Client' },
  expires: { type: Number },
  scope: { type: String }
});
exports.AccessToken = mongoose.model('AccessToken', AccessTokenSchema);
