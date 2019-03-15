/*
 * Create and export configuration variables
 *
 */

var secrets = require('../https/secrets');

// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : secrets.hashingSecret,
  'templateGlobals' : {
    'appName' : 'PortfolioV2',
    'companyName' : 'Dorian Souleyreau',
    'yearCreated' : '2019',
    'baseUrl' : '/',
    'siteUrl': 'https://doriansouleyreau.fr:3001'
  },
  'dbConfig' : {
	'url': 'mongodb://192.168.1.24:27017/portfolioV2',
    'parser': {'useNewUrlParser': true}
  },
};

// Production environment
environments.production = {
  'httpPort' : 80,
  'httpsPort' : 443,
  'envName' : 'production',
  'hashingSecret' : secrets.hashingSecret,
  'templateGlobals' : {
    'appName' : 'PortfolioV2',
    'companyName' : 'Dorian Souleyreau',
    'yearCreated' : '2019',
    'baseUrl' : '/',
    'siteUrl': 'https://doriansouleyreau.fr'
  },
  'dbConfig' : {
	'url': 'mongodb://192.168.1.24:27017/portfolioV2',
    'parser': {'useNewUrlParser': true}
  },
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
