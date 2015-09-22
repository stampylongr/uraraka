var RedditUser = require('../models/redditUser.js');

exports.getUserSettings = function(generatedState, callback) {

	RedditUser.findOne({generatedState: generatedState}, function(err, returnedUser) {
		if (err) throw new error(err);
		if (returnedUser) {
			console.log('[get/settings] user found ' + returnedUser.name +  
				', returning user settings, returnedUser.settings: ' +
				 JSON.stringify(returnedUser.settings));
			if (returnedUser.settings)
				callback(returnedUser.settings);
			else
				callback({loadDefaults: true});
		} else {
			console.log('[get/settings] no settings found, returning empty object.');
			callback({loadDefaults: true});
		}	
	});


};

exports.getSettingsSession = function(session, callback) {
	if (session.settings) {
		// console.log('[get/settings] settings session object found, returning session settings.')
		callback(session.settings);
	} else {
		// console.log('[get/settings] no settings found, returning empty object.');
		callback({loadDefaults: true});
	}
};

exports.setSettingsUser = function(generatedState, settings, callback) {
	RedditUser.findOne({generatedState: generatedState}, function(err, returnedUser) {
		if (err) throw new error(err);
		if (returnedUser) {
			// console.log('[post/settings] user found, saving settings....');
			returnedUser.settings = settings;
			returnedUser.save(function(err) {
				if (err) throw new error(err);
				// console.log('[post/settings] settings saved in user model.');
				callback(returnedUser.settings);
			});
		}
	});	
};

exports.setSettingsSession = function(session, settings, callback) {

	session.settings = settings;
	console.log('[post/settings] session.settings: ' + session.settings);

	session.save(function(err) {
		if (err) {
			next(err);
			// console.log('[post/settings] error saving session');
		}

		// console.log('[post/settings] settings saved in session object.');
		// console.log('[post/settings] req.session: ' + JSON.stringify(req.session));
		callback(session.settings);
	});

};