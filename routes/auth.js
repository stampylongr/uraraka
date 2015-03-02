var express = require('express');
var router = express.Router();
var RedditStrategy = require('passport-reddit').Strategy;
var crypto = require('crypto');
var RedditUser = require('../models/redditUser');
var REDDIT_CONSUMER_KEY = "Gpy69vUdPU_-MA";
var REDDIT_CONSUMER_SECRET = "zlcuxzzwfexoVKpYatn_1lfZslI";
var redditApi = require('../reddit/redditApi');
var config = require('./config.json');

exports.auth = function(passport){
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  RedditUser.findById(id, function(err, user){
	  	done(err, user);
	  });
	});

	// Use the RedditStrategy within Passport.
	//   Strategies in Passport require a `verify` function, which accept
	//   credentials (in this case, an accessToken, refreshToken, and Reddit
	//   profile), and invoke a callback with a user object.
	passport.use(
		new RedditStrategy(config.redditStrategyConfig,
		function(accessToken, refreshToken, profile, done) {
			// asynchronous verification, for effect...
			process.nextTick(function () {

			RedditUser.findOne({'reddit.id': profile.id}, function(err, user){
				if (err) {
					console.log("[AUTH USER FINDONE ERROR]");
					return done(err);
				}
				if (user) {
					console.log("[AUTH USER FOUND]");
					return done(null, user);
				}
				else {
					console.log("[AUTH NEW USER]");
					var newUser = new RedditUser();
					newUser.reddit.id = profile.id;
					newUser.reddit.accessToken = accessToken;
					newUser.reddit.refreshToken = refreshToken;

					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		})
		})
	);

	router.get('/reddit', function(req, res, next){
		req.session.state = crypto.randomBytes(32).toString('hex');
		passport.authenticate('reddit', {
			state: req.session.state
		})(req, res, next);
	});

	router.get('/reddit/callback', function(req, res, next){
	  // Check for origin via state token
		if (req.query.state == req.session.state){
		passport.authenticate('reddit', {
			successRedirect: '/',
		  	failureRedirect: '/'
		})(req, res, next);
		}
		else {
			next( new Error(403) );
		}
	});

	router.get('/reddit/appcallback', function (req, res, next) {
	    var state = req.query.state;
	    var code = req.query.code;
	    var error = req.query.error;

	    if(state && code) {
	        console.log("state: " + state + ", code: " + code);
	        redditApi.completeAuthorization(state, code, error, function(){
	            console.log("[ROUTER] completeAuth callback");
	            res.redirect('/');
	        });
	    }
	    // next(new Error 'OAuth failure Error');
	});

	router.get('/', function(req, res, next) {
	   res.render('index', { title: 'logon redirect...' }); 
	});

	router.get('/profile', function(req, res, next) {
	   res.render('index', { title: 'profile' }); 
	});

	router.get('/reddit/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});

	return router;
}
/*
	Use to make sure only authenticated users can access certain paths/middleware
*/
exports.isLoggedIn = function(req, res, next) {
  console.log('[isAuthenticated]');
  if (req.isAuthenticated()) { 
    return next(); 
  }
  var error = new Error("Not authorized to view this resource");
  error.http_code = 401;
  next(error);
}   