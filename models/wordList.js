'user strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
    }]
});
  
  module.exports = mongoose.model('WordList', schema);