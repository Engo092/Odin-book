const createError = require('http-errors');
const express = require('express');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const User = require('./models/user');

require('dotenv').config();

const indexRouter = require('./routes/index');

const app = express();

app.use(cors({
  origin : 'http://localhost:5173',
  credentials: true,
}));

// set-up MongoDB connection
const mongoose = require('mongoose');
const MongoDB = process.env.MONGO_URL;
mongoose.connect(MongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: "Some session Secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
  }
}));

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "Incorrect E-mail" }); 
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect Password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);


passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/api/oauth2/redirect/facebook',
    profileFields: ['id', 'name', 'email', 'displayName', 'picture.type(large)'],
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      const cred = await User.findOne({ facebookId: profile.id }).exec();
      if (!cred) {
        // Facebook account has not logged in to this app before. Create a new user account and link it to the facebook account
        const user = new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          facebookId: profile.id,
          picture: profile.photos && profile.photos[0].value,
        });

        await user.save();
        done(null, user);
      } else {
        done(null, cred);
      }
    } catch(err) {
      done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const output = {
      error: {
        name: err.name,
        message: err.message,
        text: err.toString()
      }
  };
  const statusCode = err.status || 500;
  res.status(statusCode).json(output);
});


module.exports = app;