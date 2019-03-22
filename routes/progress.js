'use strict';
const passport = require('passport');
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


router.get('/', jwtAuth, (req, res, next) => {
  let userId = req.user.id;
  return User.find({ _id: userId })
    .then(([result]) => {
      const words = result.wordSet;
      const currIdx = result.head;
      const currWord = words[currIdx].portuguese;
      const numCorrect = words[currIdx].numberCorrect;
      const numIncorrect = words[currIdx].numberIncorrect;
      const totalTimesGuessed = numCorrect + numIncorrect;
      const percentCorrect = (numCorrect / totalTimesGuessed) * 100;
      const percentIncorrect = (numIncorrect / totalTimesGuessed) * 100;

      const progress = { numCorrect, numIncorrect, totalTimesGuessed, percentCorrect, percentIncorrect, currWord };
      let data = JSON.stringify(progress);
      res.json(data);
    })
    .catch(err => next(err));
});

module.exports = router;