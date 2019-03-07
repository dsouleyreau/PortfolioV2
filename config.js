/*
 * Create and export configuration variables
 *
 */

// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'templateGlobals' : {
    'appName' : 'Portfolio',
    'companyName' : 'Dorian Souleyreau',
    'yearCreated' : '2018',
    'baseUrl' : 'https://localhost'
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
  'hashingSecret' : 'thisIsAlsoASecret',
  'templateGlobals' : {
    'appName' : 'Portfolio',
    'companyName' : 'Dorian Souleyreau',
    'yearCreated' : '2018',
    'baseUrl' : '/'
  },
  'dbConfig' : {
	'url': 'mongodb://192.168.1.24:27017/portfolioV2',
    'parser': {'useNewUrlParser': true}
  },
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.production;

// Export the module
module.exports = environmentToExport;
