module.exports = function(router, passport){

	//localhost:8080/auth/
    router.use(function(req, res, next){
        next();
    });
    
	router.get('/', function(req, res){
		res.render('pages/index.ejs');
	});
};