const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// mongoose-unique-validator, pour empecher la création de compte avec le même email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
