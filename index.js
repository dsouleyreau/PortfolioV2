/* Modules import */

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'./https/private.key')),
    'cert': fs.readFileSync(path.join(__dirname,'./https/certificate.crt')),
    'ca': fs.readFileSync(path.join(__dirname,'./https/ca_bundle.crt')),
};

var express = require('express');
var app = express();
//var port = process.env.PORT || 8080;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var config = require('./config.js');

/* * * * * * * * * */

/* DB connection */

mongoose.set('useFindAndModify', false);
var dbConfig = config.dbConfig;
mongoose.connect(dbConfig.url, dbConfig.parser).catch(function(err){
    console.log(err);
});

/* * * * * * * * */

/* Middlewares */
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(
{
    secret: 'portofolio',
    name: 'sessionId',
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: true,
        httpOnly: true,
        domain: 'doriansouleyreau.fr',
        //path: 'foo/bar',
        maxAge: 1 * 60 * 60 * 1000
    }
}));
app.use(helmet());

app.set('view engine', 'ejs');


// app.use('/', function(req, res){
// 	res.send('Our First Express program!');
// 	console.log(req.cookies);
// 	console.log('================');
// 	console.log(req.session);
// });

/* * * * * * * */

/* Server */

require('./app/routes.js')(app);
var httpServer = http.createServer(function(req,res){
    res.writeHead(301, {'Location': 'https://' + req.headers.host + req.url});
    res.end();
}).listen(config.httpPort);
var httpsServer = https.createServer(httpsServerOptions, app).listen(config.httpsPort);
console.log('HTTPS server is running');

/* * * * */