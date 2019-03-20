'use strict';
const passport = require('passport');
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


router.get('/', jwtAuth, (req, res, next) => {
  let userId = req.user.id;
  return User.find({ _id: userId }, { head: 1 })
    .then(result => {
      //   let head = result[0].head;
      //   console.log('Head is ', head);
      //   let word = result[0].wordSet[head];
      //   return word;
      // }).then(word => {
      //   res.json(word.portuguese);
      //   res.json(result[0].head);
      const index = result[0].head;
      const field = 'wordSet.' + index;
      const options = {'_id': userId};
      const projection = {};
      projection[field] = 1;
      //find?
      return User.find(options)
        .slice('wordSet', [index, 1])
        .then(result => {
          res.json(result[0].wordSet[0].portuguese);
        });
    })
    .catch(err => next(err));
});

router.post('/', jwtAuth, (req, res, next) => {
  let userId = req.user.id;
  let { answer } = req.body;
  let userAnswer = answer.toLowerCase();
  if(!userAnswer){
    return res.status(400).json({
      code: 400,
      reason: 'ValidationError',
      message: 'Please submit an answer',
      location: 'answer' //check with client
    });
  }
  return User.find({ _id: userId })
    .then(([result]) => {
      //this is a number pointing to head's index
      const oldHead = result.head;
      //gets the node/card at head
      let words = result.wordSet;
      const headNode = result.wordSet[oldHead];
      const trueAnswer = headNode.english;
      if(userAnswer === trueAnswer){
        const mStrength = headNode.memoryStrength * 2;
        const newHead = headNode.next;
        let prevNode = newHead;
        let tempNode = newHead;
        for(let x = 0; x < mStrength; x++){
          //We will need a base case (tempNode === null?)
          prevNode = tempNode;
          tempNode = words[tempNode].next;
          console.log(`prevNode is ${prevNode}`);
          console.log(`tempNode is ${tempNode}`);
        }
        words[prevNode].next = oldHead;
        words[oldHead].next = tempNode;
        words[oldHead].memoryStrength = mStrength;
        console.log(words);
        //HOT SPICY MANGO POLICY
        const update = {};
        update['wordSet'] = words;
        update['head'] = newHead;
        return User.findOneAndUpdate({ _id: userId}, update)
          .then(() => {
            res.json('Correct!');
          });
      } else {
        words[oldHead].memoryStrength = 1;
        const newHead = headNode.next;
        const oldNext = words[newHead].next;
        words[newHead].next = oldHead;
        words[oldHead].next = oldNext;
        console.log(words[oldHead]);
        //HOT SPICY MANGO POLICY
        const update = {};
        update['wordSet'] = words;
        update['head'] = newHead;
        return User.findOneAndUpdate({ _id: userId}, update)
          .then(() => {
            res.json(`Incorrect. The correct answer is ${trueAnswer}`);
          });
      }
    })  
    .catch(err => {
      next(err);
    });
});

module.exports = router;