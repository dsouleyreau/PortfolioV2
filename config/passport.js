var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
			User.findOne({'local.email': email}, function(err, user){
				if(err)
					return done(err);
				if(user)
					return done(null, false, req.flash('signupMessage', 'Ce mail est déjà utilisé !'));
                
                var newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.local.name = req.body.name;
                newUser.local.id = newUser.generateId();
                newUser.local.token = newUser.generateToken();

                newUser.save(function(err){
                    if(err)
                        throw err;
                })
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
                User.findOne({ 'local.email': email}, function(err, user){
                    if(err)
                        return done(err);
                    if(!user)
                        return done(null, false, req.flash('loginMessage', 'Mail invalide'));
                    if(!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Mot de passe invalide'));
                    
                    if(!user.local.token){
                        user.token = user.generateToken();
                        user.save(function(err){
                            if(err)
                                throw err;
                        });
                    }
                    return done(null, user);
                });
			});
		}
	));


	passport.use(new FacebookStrategy({
	        clientID: configAuth.facebookAuth.clientID,
	        clientSecret: configAuth.facebookAuth.clientSecret,
	        callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'name', 'email'],
            passReqToCallback: true
	    },
	    function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		//user is not logged in yet
                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        if(!user.facebook.token){
                            user.facebook.token = accessToken;
                            user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = profile.emails[0].value;
                            user.save(function(err){
                                if(err)
                                    throw err;
                            });

                        }
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                        });
                        return done(null, newUser);
                    }
                });
	    	});
	    }
	));

	passport.use(new GoogleStrategy({
	        clientID: configAuth.googleAuth.clientID,
	        clientSecret: configAuth.googleAuth.clientSecret,
	        callbackURL: configAuth.googleAuth.callbackURL,
            /*profileFields: ['profile', 'email'],*/
	        passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                User.findOne({'google.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        if(!user.google.token){
                            user.google.token = accessToken;
                            user.google.name = profile.displayName;
                            user.google.email = profile.emails[0].value;
                            user.save(function(err){
                                if(err)
                                    throw err;
                            });
                        }
                        return done(null, user);
                    }
                    else {
                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        })
                    }
                });
            });
        }
    ));
};