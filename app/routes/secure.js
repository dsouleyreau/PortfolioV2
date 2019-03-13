module.exports = function(router, passport){

	router.use(function(req, res, next){
		if(req.isAuthenticated()) {
            next();
        } else {
            var routes = [];
            router.stack.forEach(function(r){
              if(r.route && r.route.path){
                routes.push(r.route.path);
              }
            })
            if(routes.indexOf(req.path) > -1)
                res.redirect('/auth');
            else
            next('router');
        }
	});

	router.get('/profile', function(req, res){
		res.render('pages/profile.ejs', { user: req.user });
	});
}