const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

module.exports = mongoose.model('Auth', authSchema);
