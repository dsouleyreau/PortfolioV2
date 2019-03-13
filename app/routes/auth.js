module.exports = function(router, passport){

	//localhost:8080/auth/
    router.use(function(req, res, next){
        if(req.isAuthenticated() && req.path != '/logout')
            res.redirect('/profile');
        else
            next();
    });
    
	router.get('/', function(req, res){
		res.render('pages/auth.ejs');
	});
	
	//localhost:8080/auth/login
	router.get('/login', function(req, res){
		res.render('pages/login.ejs', { message: req.flash('loginMessage') });
	});

	router.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/auth/login',
		failureFlash: true
	}));

	//localhost:8080/auth/signup
	router.get('/signup', function(req, res){
		res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
	});


	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/auth/signup',
		failureFlash: true
	}));

	// router.get('/profile', isLoggedIn, function(req, res){
	// 	res.render('pages/profile.ejs', { user: req.user });
	// });
	
	router.get('/facebook', passport.authenticate('facebook',  {scope: ['email']}));

	router.get('/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));

	router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

	router.get('/google/callback', 
	  passport.authenticate('google', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));

	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/auth');
	});
};