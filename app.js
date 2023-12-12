const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const sessionConfig = require('./config/sessions');
const todoList = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const db = require('./data/database');
const authMiddleware = require('./middleware/auth-middleware');

var userProfile;

let port = 3000;

if (process.env.PORT) {
  port = process.env.PORT;
}
else {
  // To test social login on local environment
  require('dotenv').config();
}

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const mongodbSessionStore = sessionConfig.createSessionStore(session);
const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)
app.use('/files', express.static('files')); // Serve user uploaded files to view templete

app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));
app.use(authMiddleware);

app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: "/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(authRoutes);
app.use(todoList);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

db.connectToDatabase().then(function () {
  app.listen(port);
})