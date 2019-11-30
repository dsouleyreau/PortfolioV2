var Hero = require('../models/hero');
var Region = require('../models/region');

module.exports = function(router){

    router.use(function(req, res, next){
        next();
    });
    
	router.get('/', function(req, res){
		res.render('pages/index.ejs');
	});
    
	router.get('/projects/:page(merchant|raspi|wizard-escape)', function(req, res){
		res.render('pages/public/projects/' + req.params.page);
	});
    
    router.get('/projects/merchant/heroesSchema', function(req, res){
        Hero.find({}, { _id: false }, function(err, data){
            if(!err){
                res.json(data);
            }
            else
                console.log(err);
        });
    });
    
    router.get('/projects/merchant/regionsSchema', function(req, res){
        Region.find({}, { _id: false }, function(err, data){
            if(!err){
                res.json(data);
            }
            else
                console.log(err);
        });
    });
    
	router.get('/:page(contact-me|about-me|terms-of-service|privacy-policy)', function(req, res){
		res.render('pages/public/' + req.params.page);
	});
    
	router.post('/contact-me', function(req, res){
		res.render('pages/public/contact-me', {message: 'Votre message a bien été envoyé ! Vous aurez un retour rapide.'});
	});
};