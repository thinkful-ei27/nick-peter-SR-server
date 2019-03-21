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
    .then(([result]) => {
      const index = result.head;
      const field = 'wordSet.' + index;
      const options = {'_id': userId};
      const projection = {};
      projection[field] = 1;
    })
    .catch(err => next(err));
});

module.exports = router;