const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const localAuth = passport.authenticate('local', { session: false, failWithError: true });

router.post('/login', localAuth, (req, res, next) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });  
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/refresh', jwtAuth, (req, res, next) => {
  console.log('passed the JWTauth');
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

function createAuthToken(user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

module.exports = router;