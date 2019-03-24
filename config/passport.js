var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-api-v2').LinkedinAuth;

var User = require('../app/models/user');
var configAuth = require('./auth');


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
				if(user)
					return done(null, false, req.flash('signupMessage', 'Ce mail est déjà utilisé !'));
                
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
                    if(!user)
                        return done(null, false, req.flash('loginMessage', 'Mail invalide'));
                    if(!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Mot de passe invalide'));
    
                    user.token = user.generateToken();
                    user.save(function(err){
                        if(err)
                            return done(err, null);
                    });
                    return done(null, user);
                });
			});
		}
	));


	passport.use('facebook', new FacebookStrategy({
	        clientID: configAuth.facebookAuth.clientID,
	        clientSecret: configAuth.facebookAuth.clientSecret,
	        callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'name', 'email'],
            passReqToCallback: true
	    },
	    function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		//user is not logged in yet
                User.findOne({'user_id': profile.id, 'auth': 'facebook'}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        user.token = accessToken;
                        user.name = profile.name.givenName + ' ' + profile.name.familyName;
                        user.email = profile.emails[0].value;
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
	        clientID: configAuth.googleAuth.clientID,
	        clientSecret: configAuth.googleAuth.clientSecret,
	        callbackURL: configAuth.googleAuth.callbackURL,
            /*profileFields: ['profile', 'email'],*/
	        passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                User.findOne({'user_id': profile.id, 'auth': 'google'}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        user.token = accessToken;
                        user.name = profile.displayName;
                        user.email = profile.emails[0].value;
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
	        clientID: configAuth.linkedInAuth.clientID,
	        clientSecret: configAuth.linkedInAuth.clientSecret,
	        callbackURL: configAuth.linkedInAuth.callbackURL,
            scope: ['r_emailaddress', 'r_liteprofile'],
            profileFields : ['email', 'first-name', 'last-name', 'id'],
	        passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                LinkedInStrategy.getLiteProfile(accessToken, function(err, profile){
                    console.log('profile' + JSON.stringify(profile));
                    User.findOne({'user_id': profile.id, 'auth': 'linkedin'}, function(err, user){
                        if(err)
                            return done(err);
                        if(user){
                            user.token = accessToken;
                            user.name = profile.firstName + ' ' + profile.lastName;
                            user.email = profile.email;
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