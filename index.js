'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

// Import routers
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const wordRouter = require('./routes/wordset');
const progressRouter = require('./routes/progress');


const app = express();

// Log all requests
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// Set up CORS
app.use(
  cors({
    // quick and dirty need to fix
    origin: CLIENT_ORIGIN
  })
);

// Parse request body
app.use(express.json());

// Utilize the given strategy
passport.use(localStrategy);
passport.use(jwtStrategy);

// Protext endpoints using JWT Strategy
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api', authRouter);
app.use('/api/words', wordRouter);
app.use('/api/progress', progressRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 400;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = {...err, message: err.message};
    res.status(err.status).json(errBody);
  } else {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error'});
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
