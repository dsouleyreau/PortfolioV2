module.exports = function(router, passport){

    router.use(function(req, res, next){
        next();
    });
    
	router.get('/', function(req, res){
		res.render('pages/index.ejs');
	});
    
	router.get('/merchant', function(req, res){
		res.render('pages/merchant/index.ejs');
	});
};