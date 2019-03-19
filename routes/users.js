'use strict';

const express = require('express');

const User = require('../models/user');

const router = express.Router();

/* ============ POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  /***** Validate user input ******/
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If username and pswd aren't trimmed we give an error. We need to let the user
  // know that if they want a password "foobar  " for example(w/ spaces on end), that 
  // having spaces are not allowed rather than silently trimming them and not telling user
  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 10, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] && 
    req.body[field].trim().length < sizedFields[field].min
  );
  
  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields &&
    req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password } = req.body;
  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          status: 400,
          code: 400,
          reason: 'ValidationError',
          message: 'The username already exist',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(digest => {
      const newUser = {
        username,
        password: digest
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`${req.originalUrl}/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;