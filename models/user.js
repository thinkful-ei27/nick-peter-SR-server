'user strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true }
});

// Transform output during `res.json(data)`, `console.log(data)` etc...
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result.__id;
    delete result.__v;
    delete result.password;
  }
});

module.exports = mongoose.model('User', schema);