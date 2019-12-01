var Message = require('../models/message');

module.exports = function(router, passport){

router.use(function(req, res, next){
  if(req.isAuthenticated()){                                        // Si authentifie, continue
    next();
  }
  else {                                                            // Si non authentifie, verifie si la route concerne ce routeur
    var routes = [];
    for(var r in router.stack){                                     // Liste les routes définies dans ce routeur
      var route = router.stack[r].route
      if(route && route.path && routes.indexOf(route.path) < 0){
        routes.push(route.path);
      }
    }
    if(routes.indexOf(req.path) > -1){                              // Si le chemin concerne une route de routeur
      req.flash('errorMessage', 'Veuillez vous connecter d\'abord.');
      req.session.save(function () {
        res.redirect('/auth');                                      // Redirige vers la page d'authentification
      });
    }
    else                                                            // Concerne un autre routeur, donc continue vers le routeur suivant
      next('router');
  }
  });

  router.get('/profile', function(req, res){
    res.render('pages/public/profile/profile.ejs', {
      error: req.flash('errorMessage')[0], success: req.flash('successMessage')[0]
    });
  });

  router.get('/profile/infos', function(req, res){
    if(req.user.auth == 'local')
      res.render('pages/public/profile/infos.ejs');
    else {
      req.flash('errorMessage', 'Vous ne pouvez pas modifier vos informations personnelles.');
      req.session.save(function () {
        res.redirect('/profile');
      });
    }
  });
  
  router.post('/profile/infos', function(req, res){
    var user = req.user;
    if(req.body.email.trim().length > 0)
      user.email = req.body.email.trim();
    if(req.body.name.trim().length > 0)
      user.name = req.body.name.trim();
    if(req.body.image.trim().length > 0)
      user.image = req.body.image.trim();
    user.save(function(err){
      if(err){                                                      // Si la creation du message echoue, informe l'utilisateur
        req.flash('errorMessage', 'Vos informations n\'ont pas pu être enregistrées ! Veuillez réessayer ultérieurement.');
        req.session.save(function () {
          res.redirect('/profile');
        });
      }
      else {                                                         // Le message est bien enregistre
        req.flash('successMessage', 'Vos informations ont bien été enregistrées.');
        req.session.save(function () {
          res.redirect('/profile');
        });
      }
    });
  });

  router.get('/contact-me', function(req, res){
    res.render('pages/public/contact-me.ejs', {
      error: req.flash('errorMessage')[0], success: req.flash('successMessage')[0]
    });
  });

  router.post('/contact-me', function(req, res){                      // Nécessite d'être connecté pour envoyer un message
    var message = req.body.message;
    var newMessage = new Message({                                  // Cree un nouveau message horodate dans la BDD
      text: message,
      date: new Date(),
      user_id: req.user._id
    });
    newMessage.save(function(err){
      if(err){                                                      // Si la creation du message echoue, informe l'utilisateur
        req.flash('errorMessage', 'Votre message n\'a pas pu être enregistré ! Veuillez réessayer ultérieurement.');
      }
      else                                                          // Le message est bien enregistre
        req.flash('successMessage', 'Votre message a bien été envoyé ! Vous aurez un retour rapide.');
    });
  });
}