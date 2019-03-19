'use strict';
const passport = require('passport');
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


router.get('/', (req, res, next) => {
    const wordSet = [{Portuguese: 'Ola', English: 'Hello', M: 0},
 {Portuguese: 'Amor', English: 'Love', M: 0},
  {Portuguese: 'Felicidade', English: 'Happiness', M: 0}, 
  {Portuguese: 'Gato', English: 'Cat', M:0}, 
  {Portuguese: 'Sorrir', English: 'Smile', M: 0}];

  res.json(wordSet[0].Portuguese);
  //Will return the first card's Portuguese value in the array
})

router.post('/', (req, res, next) => {
    let { answer } = req.body;
    answer = answer.toLowerCase();
    if(!answer){
        return res.status(400).json({
            code: 400,
            reason: 'ValidationError', //???
            message: 'Please submit an answer',
            location: 'answer' //check with client
          });
      }
    const wordSet = [{Portuguese: 'Ola', English: 'hello', M: 0},
    {Portuguese: 'Amor', English: 'love', M: 0},
     {Portuguese: 'Felicidade', English: 'happiness', M: 0}, 
     {Portuguese: 'Gato', English: 'cat', M:0}, 
     {Portuguese: 'Sorrir', English: 'smile', M: 0}];
    if(answer === wordSet[0].English){
      res.json('Correct!');
    } else {
      let response = `Incorrect. The correct answer is ${wordSet[0].English}`
      res.json(response);

    }

    //Will return a success, but the message will be one of two: "Yes", or "No"/"Real Value"
})

module.exports = router;