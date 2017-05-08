'use strict';

const BaseService = require('../lib/base_service');
const assert = require('assert');
const querystring = require('querystring');
const _ = require('lodash');
const changeCase = require('change-case');

/**
 *
 * @param {Object} options
 * @constructor
 */
function Search(options) {
  BaseService.call(this, options);
};

Search.prototype = Object.create(BaseService.prototype);


Search.prototype.name = 'search';
Search.prototype.version = 'v1';
Search.prototype.URL = Search.prototype.baseURL + '/searchArticles';


// Same as Watson Developer Cloud
Search.prototype.query = function(params, callback) {
  var self = this;

  params = params || {};
  if ( ! params.key ) {
    params.key = self.token;
  }

  // Support mongo style query documents.
  if ( params.query && typeof params.query === 'object' ) {
    params.query = self.buildQueryString(params.query);
  }

  self.client.get(self.client.url.path + '?' + querystring.stringify(params), function(err, req, res, obj) {
    assert.ifError(err);
    // @TODO And reject the promise.

    if ( typeof callback === 'function' ) {
      callback(obj, res);
    }
    else {
      console.log("---- Not a Callback")

      // @TODO Resolve the promise
    }
  });

  // @TODO Return the promise
};


/*
 * Create a query string from a mongo style query document.
 *
 * AND
 * db.inventory.find( { status: "A", qty: { $lt: 30 } } )
 * OR
 * db.inventory.find( { $or: [ { status: "A" }, { qty: { $lt: 30 } } ] } )
 * AND AND OR
 * db.inventory.find( {
 *      status: "A",
 *      $or: [ { qty: { $lt: 30 } }, { item: /^p/ } ]
 * } )
 *
 * This:
 * {
 *   $: "london",
 *   "Source country": "United Kingdom"
 * }
 * turns into this.
 * 'london AND sourceCountry:"United Kingdom"'

 * @TODO
 * - Validate keys before using.
 * - Builder of the query builder?
 *   search.keyword("London").and("Source country", "United Kingdom").or("France").and("Date", {$gt: "2017-01-01"})
 */
Search.prototype.buildQueryString = function(params) {
  let string = '';

  // AND is all the top level queries.
  let and = [];
  _.each(params, function(value, key) {
    key = key.trim();
    if ( key == '$' ) {
      and.push(value);
    }
    // $or is an array
    else if ( Array.isArray(value) ) {
      // @TODO Handle key `$or` and others.
    }
    else if ( typeof value === 'object' ) {
      // @TODO Handle others.
    }
    else {
      // Convert to camelCase.
      key = changeCase.camelCase(key);
      and.push(key + ':"' + value.trim() + '"');
    }
  });

  string += and.join(' AND ');

  return string;
};

module.exports = Search;
