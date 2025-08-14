/* eslint-disable */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Basic user schema used for authentication.  Passwords are hashed
// using bcryptjs.  Roles default to `user`.
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'scholar', 'admin'], default: 'user' },
    // Optional profile fields used for the profile and settings screens.  Gender
    // and language are stored as simple strings; location is a freeform
    // address.  Defaults are provided where sensible.
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    language: { type: String, default: 'en' },
    location: { type: String },
    createdAt: { type: Date, default: () => new Date() },
  },
  { minimize: false }
);

UserSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports.User = mongoose.model('User', UserSchema);