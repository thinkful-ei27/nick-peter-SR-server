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
  // know that if the want a password "foobar  " for example(w/ spaces on end), that 
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
  

});