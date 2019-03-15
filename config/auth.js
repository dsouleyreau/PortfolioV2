var secrets = require('../https/secrets.js');

module.exports = {
	'facebookAuth' : {
		'clientID': '304599826798461',
		'clientSecret': secrets.facebook.clientSecret,
		'callbackURL': 'https://doriansouleyreau.fr/auth/facebook/callback'
	},

	'googleAuth' : {
		'clientID': '682584466606-ss5ibmsg2jfc4ktjrcoma7g1ljndqqub.apps.googleusercontent.com',
		'clientSecret': secrets.google.clientSecret,
		'callbackURL': 'https://doriansouleyreau.fr/auth/google/callback'
	}
}