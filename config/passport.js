/* Classes d'authentification */

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-api-v2').LinkedinAuth;

/* * * * * * * */

var User = require('../app/models/user');
var configAuth = require('../https/secrets.js');

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
                var name = req.body.name.trim();
				if(err)
					done(err, false, req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
				else if(user)
					done(err, false, req.flash('errorMessage', 'Cette adresse email est déjà utilisée'));
                else if(!password)
					done(err, false, req.flash('errorMessage', 'Mot de passe non valide'));
                else if(!name)
					done(err, false, req.flash('errorMessage', 'Veuillez indiquer votre nom'));
                else {
                    var newUser = new User();
                    newUser.email = email.trim();
                    newUser.password = newUser.generateHash(password);
                    newUser.name = name;
                    newUser.auth_id = newUser.generateId();
                    newUser.token = newUser.generateToken();
                    newUser.auth = 'local';

                    newUser.save(function(err){
                        if(err)
					        done(err, false, req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                    });
                    done(null, newUser, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
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
					    done(err, false, req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                    else if(!user)
                        done(null, false, req.flash('errorMessage', 'Adresse email invalide'));
                    else if(!user.validPassword(password))
                        done(null, false, req.flash('errorMessage', 'Mot de passe invalide'));
                    else {
                        user.token = user.generateToken();
                        user.save(function(err){
                            if(err)
					            done(err, false, req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        });
                        done(null, user, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
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
                User.findOne({'auth_id': profile.id, 'auth': 'facebook'}, function(err, user){
                    if(err)
                        done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                    else if(user){
                        user.token = accessToken;
                        user.name = profile.name.givenName + ' ' + profile.name.familyName;
                        user.email = profile.emails[0].value;
                        user.image = profile.photos ? profile.photos[0].value : undefined;
                        user.save(function(err){
                            if(err)
                                done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        });
                        done(null, user, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
                    }
                    else {
                        var newUser = new User();
                        newUser.auth_id = profile.id;
                        newUser.token = accessToken;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.auth = 'facebook';
                        newUser.image = profile.photos ? profile.photos[0].value : undefined;

                        newUser.save(function(err){
                            if(err)
                                done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        });
                        done(null, newUser, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
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
                User.findOne({'auth_id': profile.id, 'auth': 'google'}, function(err, user){
                    if(err)
                        done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                    else if(user){
                        user.token = accessToken;
                        user.name = profile.displayName;
                        user.email = profile.emails[0].value;
                        user.image = profile.photos ? profile.photos[0].value : undefined;
                        user.save(function(err){
                            if(err)
                                done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        });
                        done(null, user, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
                    }
                    else {
                        var newUser = new User();
                        newUser.auth_id = profile.id;
                        newUser.token = accessToken;
                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.auth = 'google';
                        newUser.image = profile.photos ? profile.photos[0].value : undefined;

                        newUser.save(function(err){
                            if(err)
                                done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        });
                        done(null, newUser, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
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
                    User.findOne({'auth_id': profile.linkedIn.id, 'auth': 'linkedin'}, function(err, user){
                        if(err)
                            done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                        else if(user){
                            user.token = accessToken;
                            user.name = profile.firstName + ' ' + profile.lastName;
                            user.email = profile.email;
                            user.image = profile.profilePicture;
                            user.save(function(err){
                                if(err)
                                    done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                            });
                            done(null, user, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
                        }
                        else {
                            var newUser = new User();
                            newUser.auth_id = profile.linkedIn.id;
                            newUser.token = accessToken;
                            newUser.name = profile.firstName + ' ' + profile.lastName;
                            newUser.email = profile.email;
                            newUser.auth = 'linkedin';
                            newUser.image = profile.profilePicture;

                            newUser.save(function(err){
                                if(err)
                                    done(err, false,  req.flash('errorMessage', 'Erreur interne. Veuillez réessayer ultérieurement'));
                            });
                            done(null, newUser, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
                            done(null, newUser, req.flash('successMessage', 'Bienvenue, ' + user.name + ' !'));
                        }
                    });
                });
            });
        }
    ));
};