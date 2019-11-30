var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-api-v2').LinkedinAuth;

var User = require('../app/models/user');
var configAuth = require('../https/secrets.js');


/* TODO: Modifier pour avoir 1 utilisateur pour 1 compte (pas de liaison entre les comptes) */

module.exports = function(passport) {


	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});


	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		process.nextTick(function(){
			User.findOne({'email': email, 'auth': 'local'}, function(err, user){
				if(err)
					return done(err);
				else if(user)
					return done(null, false, req.flash('signupMessage', 'Ce mail est déjà utilisé !'));
                else {
                    var newUser = new User();
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.name = req.body.name;
                    newUser.user_id = newUser.generateId();
                    newUser.token = newUser.generateToken();
                    newUser.auth = 'local';

                    newUser.save(function(err){
                        if(err)
                            return done(err, null);
                    });
                    return done(null, newUser);
                }
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done){
			process.nextTick(function(){
                User.findOne({ 'email': email, 'auth': 'local'}, function(err, user){
                    if(err)
                        return done(err);
                    else if(!user)
                        return done(null, false, req.flash('loginMessage', 'Mail invalide'));
                    else if(!user.validPassword(user.password))
                        return done(null, false, req.flash('loginMessage', 'Mot de passe invalide'));
                    else {
                        user.token = user.generateToken();
                        user.save(function(err){
                            if(err)
                                return done(err, null);
                        });
                        return done(null, user);
                    }
                });
			});
		}
	));


	passport.use('facebook', new FacebookStrategy({
	        clientID: configAuth.facebook.clientID,
	        clientSecret: configAuth.facebook.clientSecret,
	        callbackURL: configAuth.facebook.callbackURL,
            profileFields: ['id', 'name', 'email','photos'],
            passReqToCallback: true
	    },
	    function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		//user is not logged in yet
                User.findOne({'user_id': profile.id, 'auth': 'facebook'}, function(err, user){
                    if(err)
                        return done(err);
                    else if(user){
                        user.token = accessToken;
                        user.name = profile.name.givenName + ' ' + profile.name.familyName;
                        user.email = profile.emails[0].value;
                        user.image = profile.photos ? profile.photos[0].value : undefined;
                        user.save(function(err){
                            if(err)
                                return done(err, null);
                        });
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.user_id = profile.id;
                        newUser.token = accessToken;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.auth = 'facebook';
                        newUser.image = profile.photos ? profile.photos[0].value : undefined;

                        newUser.save(function(err){
                            if(err)
                                return done(err, null);
                        });
                        return done(null, newUser);
                    }
                });
	    	});
	    }
	));

	passport.use('google', new GoogleStrategy({
	        clientID: configAuth.google.clientID,
	        clientSecret: configAuth.google.clientSecret,
	        callbackURL: configAuth.google.callbackURL,
            /*profileFields: ['profile', 'email'],*/
	        passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                User.findOne({'user_id': profile.id, 'auth': 'google'}, function(err, user){
                    if(err)
                        return done(err);
                    else if(user){
                        user.token = accessToken;
                        user.name = profile.displayName;
                        user.email = profile.emails[0].value;
                        user.image = profile.photos ? profile.photos[0].value : undefined;
                        user.save(function(err){
                            if(err)
                                return done(err, null);
                        });
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.user_id = profile.id;
                        newUser.token = accessToken;
                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.auth = 'google';
                        newUser.image = profile.photos ? profile.photos[0].value : undefined;

                        newUser.save(function(err){
                            if(err)
                                return done(err, null);
                        });
                        return done(null, newUser);
                    }
                });
            });
        }
    ));
    
    passport.use('linkedin', new LinkedInStrategy({
	        clientID: configAuth.linkedin.clientID,
	        clientSecret: configAuth.linkedin.clientSecret,
	        callbackURL: configAuth.linkedin.callbackURL,
            profileFields: [
                "id",
                "first-name",
                "last-name",
                "email-address",
            ],
            scope: [ 'r_liteprofile', 'r_emailaddress' ],
	        passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                LinkedInStrategy.getLiteProfile(accessToken, function(err, profile){
//                    console.log('profile' + JSON.stringify(profile));
                    User.findOne({'user_id': profile.linkedIn.id, 'auth': 'linkedin'}, function(err, user){
                        if(err)
                            return done(err);
                        else if(user){
                            user.token = accessToken;
                            user.name = profile.firstName + ' ' + profile.lastName;
                            user.email = profile.email;
                            user.image = profile.profilePicture;
                            user.save(function(err){
                                if(err)
                                    return done(err, null);
                            });
                            return done(null, user);
                        }
                        else {
                            var newUser = new User();
                            newUser.user_id = profile.linkedIn.id;
                            newUser.token = accessToken;
                            newUser.name = profile.firstName + ' ' + profile.lastName;
                            newUser.email = profile.email;
                            newUser.auth = 'linkedin';
                            newUser.image = profile.profilePicture;

                            newUser.save(function(err){
                                if(err)
                                    return done(err, null);
                            });
                            return done(null, newUser);
                        }
                    });
                });
            });
        }
    ));
};