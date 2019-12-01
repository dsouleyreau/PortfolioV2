var Hero = require('../models/hero');
var Region = require('../models/region');
var Message = require('../models/message');

module.exports = function(router){
    
  router.get('/', function(req, res){                                 // Rendu de la page '/'
    res.render('pages/index.ejs');
  });

                                                                      // Rendu des pages de projects
  router.get('/projects/:page(merchant|raspi|wizard-escape)', function(req, res){
    res.render('pages/public/projects/' + req.params.page);
  });

  router.get('/projects/merchant/heroesSchema', function(req, res){   // API envoyant les donnees de heros pour merchantSharingComp
    Hero.find({}, { _id: false }, function(err, data){                // Selection de toutes les donnees sans le champ _id
      if(!err)                                                        // Renvoie les donnees s'il n'y a pas d'erreur
        res.json(data);
      else
        res.status(404).json({'error': 'Cannot find data'});          // En cas d'erreur, indique que les donnes sont indisponibles
    });
  });

  router.get('/projects/merchant/regionsSchema', function(req, res){
    Region.find({}, { _id: false }, function(err, data){
      if(!err)
        res.json(data);
      else
        res.status(404).json({'error': 'Cannot find data'});
    });
  });

  router.get('/:page(contact-me|about-me|terms-of-service|privacy-policy)', function(req, res){
    res.render('pages/public/' + req.params.page);
  });

};