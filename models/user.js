'user strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  wordSet: [{
    _id: mongoose.Schema.Types.ObjectId,
    //Portuguese version of the word
    portuguese: String, 
    //English version of the word
    english: String,
    //Indicator of how well the user remembers the word, SRA
    memoryStrength: Number,
    //Index of the next number (mimics SLL)
    next: Number
  }],
  //This will be what get requests grab
  head: {
    type: Number, 
    default: 0
  }
});

// Transform output during `res.json(data)`, `console.log(data)` etc...
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
    delete result.wordSet;
    delete result.head;
  }
});

// Note: Use `function` keyword instead of `=>` to allow setting of `this`
schema.methods.validatePassword = function (pwd) {
  const currentUser = this;
  return bcrypt.compare(pwd, currentUser.password);
};

schema.statics.hashPassword = function (pwd) {
  return bcrypt.hash(pwd, 10);
};

module.exports = mongoose.model('User', schema);