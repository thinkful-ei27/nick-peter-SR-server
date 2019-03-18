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
    const err = new Error(`Missing ${missingField} in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (nonStringField) {
    const err = new Error(`Field ${nonStringField} must be type String`);
    err.status = 422;
    return next(err);
  }

  // If username and pswd aren't trimmed we give an error. We need to let the user
  // know that if they want a password "foobar  " for example(w/ spaces on end), that 
  // having spaces are not allowed rather than silently trimming them and not telling user
  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field ${nonTrimmedField} must be type String`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 10, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] && 
    req.body[field].trim().length < sizedFields[field].min
  );

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields &&
    req.body[field].trim().length > sizedFields[field].max
  );


  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`); 
    err.status = 422;
    return next(err);
  }

  let { username, password } = req.body;
  
  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest
      };
      return User.create(newUser);
    })
    .then(result => res.status(201).location(`${req.originalUrl}/${result.id}`).json(result))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;