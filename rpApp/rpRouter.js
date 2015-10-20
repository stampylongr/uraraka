var express = require('express');
var router = express.Router();
var redditAuthHandler = require('../reddit/redditAuthHandler');
var rpSettingsHandler = require('./rpSettingsHandler');
var rpMailHandler = require('./rpMailHandler');

router.post('/share', function(req, res, next) {

	rpMailHandler.share(req.body.to, req.body.text, req.body.subject, function(error) {
		if (error) next(error);
		else {
			res.sendStatus(200);
		}
	});

});

router.get('/settings', function(req, res, next) {
	if (req.session.userId) {

		console.log('[get/settings] authenticated, finding user to retrieve settings from....');
		
		try {
			rpSettingsHandler.getUserSettings(req.session, function(data) {
				res.json(data);
			});
			
		} catch (err) {
			next(err);
		}


	} else {
		
		console.log('[get/settings] not authenticated, retrieving from session object....');
		console.log('[get/setting] req.session: ' + JSON.stringify(req.session));

		rpSettingsHandler.getSettingsSession(req.session, function(data) {
			res.json(data);
		});

	}

});

router.post('/settings', function(req, res, next) {
	
	console.log('[post/settings] req.body: ' + JSON.stringify(req.body));

	if (req.session.userId) {
		console.log('[post/settings] authenticated, finding user....');

		try {
			rpSettingsHandler.setSettingsUser(req.session, req.body, function(data) {
				res.json(data);
			});
			
		} catch(err) {
			next(err);
		}


	} else {
		console.log('[post/settings] not authenticated, saving in session object....');
		
		try {
			rpSettingsHandler.setSettingsSession(req.session, req.body, function(data) {
				res.json(data);
			});
			
		} catch (err) {
			next(err);
		}

		
	}

});

module.exports = router;