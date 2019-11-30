/* Modules import */

var fs = require('fs'),         // Lecteur de fichiers
    path = require('path'),     // Constructeur de chemin de fichiers
    http = require('http'),     // Constructeur de serveur/client HTTP
    https = require('https'),   // Constructeur de serveur/client HTTPS
    // Fichiers
    httpsServerOptions = {
        'key': fs.readFileSync(path.join(__dirname, './https/private.key')),
        'cert': fs.readFileSync(path.join(__dirname, './https/certificate.crt')),
        'ca': fs.readFileSync(path.join(__dirname, './https/ca_bundle.crt'))
    };

var express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    config = require('./config/config.js'),
    passport = require('passport'),
    flash = require('connect-flash'),
    MongoStore = require('connect-mongo')(session);
    try {require('./app/models/dbUpdate');}
    catch(e) {require('./app/models/dbUpdate2');}
/* * * * * * * * * */

/* Config */

var dbConfig = config.dbConfig;
mongoose
    .set('useFindAndModify', false)
    .set('useNewUrlParser', true)
    .set('useUnifiedTopology', true)
    .connect(dbConfig.url)
    .catch(function(err){
        console.log(err);
    });
require('./config/passport')(passport);
/* * * * * * * * */

/* Middlewares */

app.set('trust proxy', true)
    .use(logger(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'))
    .use(cookieParser())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(session({
        secret: config.hashingSecret,
        name: 'sessionId',
        saveUninitialized: true,
        resave: false,
        cookie: {
            secure: true,
            httpOnly: true,
            domain: 'doriansouleyreau.fr',
            //path: 'foo/bar',
            maxAge: 1 * 60 * 60 * 1000
        },
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use(flash())
    //
    .use(helmet())

   .use(function (req, res, next) {
       res.locals = Object.assign(res.locals, { user : req.user, 'rootPath' : path.join(__dirname, 'views') }, config.templateGlobals, {url : req.path.split('/')[1]});
       next();
    })
    .use('/public', express.static(path.join(__dirname,'./public')))
    .use('/.well-known', express.static(path.join(__dirname,'./.well-known')))

    .use(function(req, res, next){
//        console.log(req.user);
        next();
    })
    .set('views', path.join(__dirname,'views'))
    .set('view engine', 'ejs');
/* * * * * * * */

/* Routes */
var public = express.Router();
require('./app/routes/public')(public);
app.use('/', public);

var auth = express.Router();
require('./app/routes/auth')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./app/routes/secure')(secure, passport);
app.use('/', secure);

app.get('/:notFound', function(req, res){
    res.status(404).render('pages/404.ejs', { link : req.params.notFound });
});

/* * * * * */

/* Server */

//var httpServer = http.createServer(app).listen(config.httpPort);
var httpsServer = https.createServer(httpsServerOptions, app).listen(config.httpsPort, 'doriansouleyreau.fr');

var httpServer = http.createServer(function(req,res){
    if(!req.url.startsWith('/.well-known/acme-challenge')){
        res.writeHead(301, {'Location': 'https://' + req.headers.host + req.url});
        res.end();
    }
    else {
        var filePath = path.join(__dirname, req.url);
        console.log(filePath);
        try {
            var stat = fs.statSync(filePath);

            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Length': stat.size
            });

            var readStream = fs.createReadStream(filePath);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
        } catch(e) {
            console.log("acme-challenge error :" + e);
            res.end("Cannot find " + req.url);
        }
    }
}).listen(config.httpPort, 'doriansouleyreau.fr');

console.log('Server is running');

/* * * * */