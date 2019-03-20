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
    let head = result[0].head;
    console.log('Head is ', head);
    let word = result[0].wordSet[head];
    return word;
  }).then(word => {
    res.json(word.portuguese);
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
        let newValue = wordSet[0].M;
        if(answer === wordSet[0].English){
          newValue = newValue + 1;
          return User.findOneAndUpdate({ _id: userId}, {$set: {"wordSet.0.M": newValue}})
          .then(() => res.json('Correct!'));
        } else {
          newValue = newValue - 1;
          if(newValue < 0){
            newValue = 0;
          }
          let response = `Incorrect. The correct answer is ${wordSet[0].English}`;
          return User.findOneAndUpdate({ _id: userId}, {$set: {"wordSet.0.M": newValue}})
          .then(() => res.json(response));
        }
      }).catch(err => {
        next(err);
      })
})

module.exports = router;