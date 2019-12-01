module.exports = function(router, passport){

  router.use(function(req, res, next){
    if(req.isAuthenticated() && req.path != '/logout')          // Si deja authentifie
      res.redirect('/profile');                                 // redirige vers le profil
    else
      next();                                                   // Sinon, continue
  });

  router.get('/', function(req, res){                           // Rendu de la page '/auth'
    res.render('pages/auth/auth.ejs', {
      error: req.flash('errorMessage')[0], success: req.flash('successMessage')[0]
    });
  });

  router.get('/login', function(req, res){                      // Rendu de la page '/login' avec message flash
    res.render('pages/auth/login.ejs', {
      error: req.flash('errorMessage')[0], success: req.flash('successMessage')[0]
    });
  });
  
  router.post('/login', passport.authenticate('local-login', {  // /login POST => tentative d'authentification locale
    successRedirect: '/profile',                                // URL de redirection si l'authentification est validee
    failureRedirect: '/auth/login',                             // URL de redirection si l'authentification echoue
    failureFlash: true                                          // Autorise le message flash si l'authentification echoue
  }));

  router.get('/signup', function(req, res){
    res.render('pages/auth/signup.ejs', {
      error: req.flash('errorMessage')[0], success: req.flash('successMessage')[0]
    });
  });


  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/auth/signup',
    failureFlash: true
  }));

  router.get('/facebook', passport.authenticate('facebook'));

  router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/auth'
  }));

  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/auth'
  }));

  router.get('/linkedin', passport.authenticate('linkedin'));

  router.get('/linkedin/callback', passport.authenticate('linkedin', {
    successRedirect: '/profile',
    failureRedirect: '/auth'
  }));

  router.get('/logout', function(req, res){
    req.logout();                                                 // Deconnexion de la session
    res.redirect('/auth');                                        // Redirection vers la page de connexion
  });
};