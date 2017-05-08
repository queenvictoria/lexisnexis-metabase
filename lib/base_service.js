'use strict';

const restify = require('restify');
const extend = require('extend');


/**
 * Internal base class that other services inherit from
 * @param {Object} options
 * @param {String} [options.token] - token for the service.
 */
function BaseService(user_options) {
  let options = extend({}, user_options);
  options = this.initCredentials(options);
};

BaseService.prototype.version = 10;
BaseService.prototype.baseURL = 'http://metabase.moreover.com/api/v' + BaseService.prototype.version;
BaseService.prototype.URL = BaseService.prototype.baseURL;


// Same as webhoseio
BaseService.prototype.config = function(options) {
  options = this.initCredentials(options);
};


// Same as watson developer cloud
BaseService.prototype.initCredentials = function(options) {
  if ( options.token ) {
    this.token = options.token;
  }
  else if ( options.key ) {
    this.token = options.key;
  }
  else if ( options.apikey ) {
    this.token = options.apikey;
  }
  else if ( options['api-key'] ) {
    this.token = options['api-key'];
  }
  this.init();
  return options;
};


BaseService.prototype.init = function(options) {
  // If we don't have a token we can't do anything.

  this.client = restify.createJsonClient(this.URL);
};


BaseService.prototype.rateLimits = function(options) {
  var URL = this.baseURL + "/rateLimits";
};

module.exports = BaseService;
