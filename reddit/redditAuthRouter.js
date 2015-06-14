var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var redditAuth = require('./redditAuth');
var redditServer = require('./redditServer');

router.get('/reddit', function(req, res, next) {
	req.session.generatedState = crypto.randomBytes(32).toString('hex');
	req.session.save(function(err){
		if (err)
			next(err);
		console.log('/reddit generatedState saved in session cookie');
	});
	res.redirect(redditAuth.newInstance(req.session.generatedState));
});

router.get('/reddit/callback', function(req, res, next) {
   console.log('/reddit/callback: req.session.generatedState: ' + req.session.generatedState);
    var returnedState = req.query.state;
    var generatedState = req.session.generatedState;
    var code = req.query.code;
    var error = req.query.error;
    if (error) {
    	next(new Error(error));
    }
    if (returnedState && code) {
        redditAuth.completeAuth(generatedState, returnedState, code, error, 
        	function(){
        		res.redirect('/');
			}
		);
    }
});

router.get('/reddit/appcallback', function (req, res, next) {
   	var returnedState = req.query.state;
	var code = req.query.code;
	var error = req.query.error;
	if (error) {
		next(new Error(error));
	}
	if (returnedState && code) {
	    redditServer.completeServerAuth(returnedState, code, error, 
	    	function(){
	    		res.redirect('/');
			}
		);
	}
});

router.get('/reddit/logout', function(req, res, next) {
	redditAuth.removeInstance(req.session.generatedState);
	res.redirect('/');
	//delete the session.generated key as well..
	//req.session.destroy()?
});

module.exports = router;