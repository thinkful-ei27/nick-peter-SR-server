'use strict';
const passport = require('passport');
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


router.get('/', jwtAuth, (req, res, next) => {
  let userId = req.user.id
  return User.find({ _id: userId })
  .then(result => {
    let wordSet = result[0].wordSet;
    return wordSet;
  }).then(wordSet => {
    res.json(wordSet[0].Portuguese);
  })
  .catch(err => next(err));
})

router.post('/', jwtAuth, (req, res, next) => {
    let userId = req.user.id
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
    return User.find({ _id: userId })
      .then(result => {
        console.log('find by id result:');
        console.log(result);
        let wordSet = result[0].wordSet;
        return wordSet;
      }).then(wordSet => {
        if(answer === wordSet[0].English){
          let newValue = wordSet[0].M + 1;
          console.log(newValue);
          res.json('Correct!');
        } else {
          let newValue = wordSet[0].M - 1;
          if(newValue < 0){
            newValue = 0;
          }
          console.log(newValue);
          let response = `Incorrect. The correct answer is ${wordSet[0].English}`
          res.json(response);
        }
      }).catch(err => {
        next(err);
      })
    //Will return a success, but the message will be one of two: "Yes", or "No"/"Real Value"
})

module.exports = router;