var secrets = require('../https/secrets');

// Objet contenant les variables de configuration pour chaque environnement
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 80,
  'httpsPort': 443,
  'envName': 'staging',
  'hashingSecret': secrets.hashingSecret,
  'templateGlobals': {
    'appName': 'PF V2',
    'companyName': 'Test Company',
    'yearCreated': 'XXXX',
    'baseUrl': '/',
  },
  'dbConfig': {
	'url': 'mongodb://127.0.0.1:27017/portfolioV2',
    'useNewUrlParser': true,
    'useFindAndModify': false,
    'useCreateIndex': true,
    'useUnifiedTopology': true,
    // Automatically try to reconnect when it loses connection to MongoDB
    'autoReconnect': true,
    // Never stop trying to reconnect
    'reconnectTries': Number.MAX_VALUE,
    // Reconnect every 500ms
    'reconnectInterval': 500,
    // Maintain up to 10 socket connections. If not connected,
    // return errors immediately rather than waiting for reconnect
    'poolSize': 10,
    // Give up initial connection after 10 seconds
    'connectTimeoutMS': 10000,
  },
};

// Production environment
environments.production = {
  'hashingSecret': secrets.hashingSecret,
  'templateGlobals': {
    'appName': 'PortfolioV2',
    'companyName': 'Dorian Souleyreau',
    'yearCreated': '2019',
    'baseUrl': '/',
  },
  'dbConfig': {
	'url': 'mongodb://192.168.1.24:27017/portfolioV2',
    'useNewUrlParser': true,
    'useFindAndModify': false,
    'useUnifiedTopology': true,
    'autoReconnect': true,
  },
};

// Determine quel environnement est passe en dernier argument
var env = process.argv.slice(-1)[0];
var currentEnvironment = typeof(env) == 'string' ? env.toLowerCase() : 'staging';

// Verifie que l'environnement selectionne est valide, sinon staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
