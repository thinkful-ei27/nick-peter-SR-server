'use strict';
const passport = require('passport');
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


router.get('/', jwtAuth, (req, res, next) => {
  let userId = req.user.id
  return User.find({ _id: userId }, { head: 1 })
  .then(result => {
  //   let head = result[0].head;
  //   console.log('Head is ', head);
  //   let word = result[0].wordSet[head];
  //   return word;
  // }).then(word => {
  //   res.json(word.portuguese);
  //   res.json(result[0].head);
    let index = result[0].head;
    let field = "wordSet." + index;
    let options = {"_id": userId};
    let projection = {};
    projection[field] = 1;
    //find?
    return User.find(options)
    .slice('wordSet', [index, 1])
    .then(result => {
      console.log(result[0].wordSet[0].portuguese);
      res.json(result);
    })
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
    return User.find({ _id: userId }, { head: 1 })
      .then(result => {
        console.log(result);
        res.json(result[0].head);
        //this is the current head index
        // let head = result[0].head;
        // //the head (word wise)
        // let word = result[0].wordSet[head];
        // //number that will indicate how many spaces the word will move (if correct)
        // let oldValue = word.memoryStrength;
        // //number that will be turned into the new head indicator
        // let next = result[0].wordSet[head].next;
        // //this will be the updated memoryStrength
        // let newValue;
        // if(answer === word.english){
        //   newValue = oldValue * 2;
        //   return User.findOneAndUpdate({_id: userId}, {$set: {"head": next}})
        //   .then(() => res.json(`Correct!`));
        // } else {
        //   newValue = 1;
        //   return User.findOneAndUpdate({_id: userId}, {$set: {"head": next}})
        //   .then(() => res.json(`Incorrect. The correct answer is ${word.english}`));
        // }
        //compare answer to head's answer/english value
          //(True) new memoryStrength = oldValue * 2
          //new head number equals old head's next
          //using the head (number) as the index, find the word's next
          //set head to that next value (index of new head)
          //while loop (n<oldValue, next !== null) Traverse using temp node
          //set tempNodes.next equal to answered word
          //set answered word's next equal to original tempNodes.next
        //


        // if(answer === wordSet[0].English){
        //   let oldValue = newValue;
        //   newValue = newValue * 2;
        //   return User.findOneAndUpdate({ _id: userId}, {$set: {"wordSet.0.M": newValue}})
        //   .then(() => res.json('Correct!'));
        // } else {
        //   newValue = newValue - 1;
        //   if(newValue < 0){
        //     newValue = 0;
        //   }
        //   let response = `Incorrect. The correct answer is ${wordSet[0].English}`;
        //   return User.findOneAndUpdate({ _id: userId}, {$set: {"wordSet.0.M": newValue}})
        //   .then(() => res.json(response));
        // }
      }).catch(err => {
        next(err);
      })
})

module.exports = router;