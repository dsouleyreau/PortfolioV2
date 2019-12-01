/* Import des modules */

var
  fs = require('fs'),         // Lecteur de fichiers
  path = require('path'),     // Constructeur de chemin de fichiers
  http = require('http'),     // Constructeur de serveur/client HTTP
  https = require('https'),   // Constructeur de serveur/client HTTPS
                              // Callbacks de lecture des certificats HTTPS (pas charges en memoire)
  httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, './https/private.key')),
    'cert': fs.readFileSync(path.join(__dirname, './https/certificate.crt')),
    'ca': fs.readFileSync(path.join(__dirname, './https/ca_bundle.crt'))
  };

var
  config = require('./config/config.js'),         // Configuration custom selon l'environnement
  express = require('express'),                   // Express, base du serveur web NodeJS
  app = express(),                                // Application principale du serveur web
  cookieParser = require('cookie-parser'),        // Gestionnaire de cookies HTTP
  session = require('express-session'),           // Gestionaire de session utilisateur
  bodyParser = require('body-parser'),            // Gestionnaire de corps de requete
  helmet = require('helmet'),                     // Utilitaire de sécurite du formatage d'en-tetes de reponses
  flash = require('connect-flash'),               // Utilitaire de passage de message entre le controleur Node et la vue EJS
  logger = require('morgan'),                     // Mise en forme des logs du serveur
  mongoose = require('mongoose'),                 // BDD NoSQL
  MongoStore = require('connect-mongo')(session), // Chargement et sauvegarde des sessions dans la BDD
  passport = require('passport');                 // Middleware d'authentification
  require('./config/passport')(passport);         // Parametrage des classes d'authentification (local, Facebook, Google, linkedIn)
  try {require('./app/models/dbUpdate');}         // Mise a jour de la BDD pour le projet MerchantSharingComp
  catch(e) {require('./app/models/dbUpdate2');}   // avec version 2 en statique (pour deposer sur GitHub)
/* * * * * * * * * */

/* Config */

/*mongoose                                  // Parametrage de la BDD
  .set('useFindAndModify', false)         // Eviter des erreurs lors de modification de la BDD
  .set('useNewUrlParser', true)
  .connect(dbConfig.url)                  // Connexion à la BDD via l'URL dans config
  .catch(function(err){                   // En cas d'erreur, logger l'erreur
    console.log(err);
    process.exit(1);
  });*/
mongoose
  .connect(config.dbConfig.url, config.dbConfig)
  .catch(function(err){
    console.log(err);
    process.exit(1);
  });
/* * * * * * * * */

/* Middlewares */

app.set('trust proxy', true)                        // Pour fonctionner derriere une box
                                                    // Log des requetes
  .use(logger(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'))
  .use(cookieParser())                              // Initilisation du gestionnaire de cookies
  .use(bodyParser.urlencoded({ extended: false }))  // Initialisation du gestionnaire de corps de requete
  .use(session({                                    // Configuration du gestionnaire de session
    secret: config.hashingSecret,                   // Chaîne de sécurisation des sessions stockees
    name: 'sessionId',                              // Nom de l'objet contenant les informations de session (ici req.sessionId)
    saveUninitialized: true,
    resave: false,                                  // Ne pas sauvegarder s'il n'y a pas de changement entre deux requetes
    cookie: {                                       // Configuration des cookies
      secure: true,                                 // Envoi de cookies seulement en HTTPS
      httpOnly: true,                               // Pas d'envoi vers un client JS ou hors HTTPS
      domain: 'doriansouleyreau.fr',                // Limitation des cookies au domaine de l'application doriansouleyreau.fr
      maxAge: 1 * 60 * 60 * 1000                    // Limite de validite du cookie a 1h
    },
                                                    // Chargement et sauvegarde des sessions dans la BDD
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  }))
  .use(passport.initialize())                       // Initialisation des classes d'authentification
  .use(passport.session())                          // Recuperation des authentifications dans les sessions chargees depuis la BDD
  .use(flash())                                     // Initialisation de l'utilitaire de message controleur
  .use(helmet())                                    // Initilisation de l'utilitaire de securite des en-tetes
  .use(function (req, res, next) {                  // Middleware de passage de variables vers la vue EJS
    var user = req.user;
    if(user)
      delete user._id, user.password, user.token, user.auth_id;
    res.locals = Object.assign(res.locals, { user : user, 'rootPath' : path.join(__dirname, 'views') }, config.templateGlobals, {url : req.path.split('/')[1]});
    next();
  })
                                                    // Chemin vers les fichiers "statiques" publics
  .use('/public', express.static(path.join(__dirname,'./public')))
                                                    // Chemin vers le dossier .well-known pour la creation de certificats HTTPS
  .use('/.well-known', express.static(path.join(__dirname,'./.well-known')))

  .use(function(req, res, next){                    // Middleware de debuggage pour afficher les informations de l'utilisateur
    //        console.log(req.user);
    next();
  })
  .set('views', path.join(__dirname,'views'))       // Chargement des vues EJS
  .set('view engine', 'ejs');                       // EJS defini comme moteur de vue
/* * * * * * * */

/* Routes */
var public = express.Router();            // Creation d'un routeur vers les routes publiques
require('./app/routes/public')(public);   // Configuration des "sous-routes"
app.use('/', public);                     // Chemin de base du routeur

var auth = express.Router();
require('./app/routes/auth')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./app/routes/secure')(secure, passport);
app.use('/', secure);

app.get('/:notFound', function(req, res){ // Route pour toutes les 404
                                          // Rendu 404
res.status(404).render('pages/404.ejs', { link : req.params.notFound });
});

/* * * * * */

/* Server */
                                                          // Parametrage du serveur HTTPS
var httpsServer = https.createServer(httpsServerOptions, app).listen(config.httpsPort, 'doriansouleyreau.fr');

var httpServer = http.createServer(function(req,res){     // Paramétrage du serveur HTTP
  if(!req.url.startsWith('/.well-known/acme-challenge')){ // Si la requête n'est pas destinee a .well-known, redirection HTTPS
    res.writeHead(301, {'Location': 'https://' + req.headers.host + req.url});
    res.end();
  }
  else {                                                  // .well-knonw => creation de certificats HTTPS
    var filePath = path.join(__dirname, req.url);         // Recuperation du chemin vers les fichiers acme-challenge
    console.log(filePath);
    try {                                                 // S'il n'y a pas d'erreur (si les fichiers sont trouves)
      var stat = fs.statSync(filePath);                   // Recupere la taille du fichier demande

      res.writeHead(                                      // En-tete de reponse
        200,                                              // Status 200 => OK
        {                                
          'Content-Type': 'text/plain',                   // Le fichier est en text brut
          'Content-Length': stat.size                     // Taille du fichier
        }
      );

      var readStream = fs.createReadStream(filePath);     // Lecteur asynchrone pour charger le fichier
      
      readStream.pipe(res);                               // Ecriture du fichier une fois entierement charge
    } catch(e) {                                          // En cas d'erreur
      console.log("acme-challenge error :" + e);          // Log l'erreur
      res.writeHead(
        404,                                              // Status 404 => fichier introuvable
        {'Content-type': 'application/json'}              // Reponse au format JSON
      );
                                                          // Renvoie une erreur
      res.end(JSON.stringify({'error':'Cannot find ' + req.url}));
    }
  }
}).listen(config.httpPort, 'doriansouleyreau.fr');

console.log('Server is running');

/* * * * */