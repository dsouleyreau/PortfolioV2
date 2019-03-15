/* Modules import */

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , https = require('https')
  , httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'./https/private.key')),
    'cert': fs.readFileSync(path.join(__dirname,'./https/certificate.crt')),
    'ca': fs.readFileSync(path.join(__dirname,'./https/ca_bundle.crt')),
    };

var express = require('express')
  , app = express()
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , logger = require('morgan')
  , mongoose = require('mongoose')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')
  , config = require('./config/config.js')
  , passport = require('passport')
  , flash = require('connect-flash')
  , MongoStore = require('connect-mongo')(session);
/* * * * * * * * * */

/* Config */

var dbConfig = config.dbConfig;
mongoose.set('useFindAndModify', false)
        .connect(dbConfig.url, dbConfig.parser)
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
   .use(session(
    {
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
   .use(helmet())

   .use(function(req, res, next){
       next();
   })
   .use(function (req, res, next) {
       res.locals = Object.assign(res.locals, config.templateGlobals, {url : req.path.split('/')[1]});
       next();
    })
    .use('/public', express.static(path.join(__dirname,'./public')))
    .use('/.well-known', express.static(path.join(__dirname,'./.well-known')))

    .set('view engine', 'ejs');
/* * * * * * * */

/* Routes */
var public = express.Router();
require('./app/routes/public')(public, passport);
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

var httpsServer = https.createServer(httpsServerOptions, app).listen(config.httpsPort);

var httpServer = http.createServer(function(req,res){
    res.writeHead(301, {'Location': 'https://' + req.headers.host + req.url});
    res.end();
}).listen(config.httpPort);

console.log('Server is running');

/* * * * */