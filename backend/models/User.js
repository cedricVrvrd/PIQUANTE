// require, uniquevalidator => vérification d'un email unique
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// création du schema utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);