const express = require('express');
const passport = require('passport');
const VkStrategy = require('passport-vkontakte').Strategy;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const VK_APP_ID = process.env.VK_APP_ID;
const VK_APP_SECRET = process.env.VK_APP_SECRET;
const PORT = process.env.PORT || 3000;

if (!VK_APP_ID || !VK_APP_SECRET) {
    throw new Error('Set VK_APP_ID and VK_APP_SECRET env vars to run the example');
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new VkStrategy({
    clientID: VK_APP_ID,
    clientSecret: VK_APP_SECRET,
    callbackURL: "http://9fc1ebe1.ngrok.io/auth/vk/callback",
//    callbackURL: "http://localhost:3000/auth/vk/callback",
    scope: ['email'],
    profileFields: ['email']
  }, function verify(accessToken, refreshToken, params, profile, done) {

    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: '123vk',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/vk',
  passport.authenticate('vkontakte'),
  function(req, res){
    "use strict";

  });

app.get('/auth/vk/callback',
  passport.authenticate('vkontakte', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(PORT, function() {
  console.log(`Server listening on ${PORT} port`);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
