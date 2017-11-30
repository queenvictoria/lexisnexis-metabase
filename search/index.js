'use strict';

const BaseService = require('../lib/base_service');
const assert = require('assert');
const querystring = require('querystring');
const _ = require('lodash');
const q = require('q');
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
Search.prototype.rateLimitInterval = 20000;   // Delay between calls.
Search.prototype.limitMax = 200;              // Maximum results per call. Docs say 500.


// Same as Watson Developer Cloud
Search.prototype.query = function(params, callback, errorHandler) {
  var self = this;

  params = params || {};
  if ( ! params.key ) {
    params.key = self.token;
  }

  // Support mongo style query documents.
  if ( params.query && typeof params.query === 'object' ) {
    params.query = self.buildQueryString(params.query);
  }

  const resultsMax = params.limit || self.limitMax;

  if ( params.limit && params.limit > self.limitMax ) {
    console.error(`WARNING: Cannot retrieve more than ${self.limitMax} results at a time. We will loop through getting more results. This is experimental.`);
  }

  // Current results
  let articles = [];
  // A metabase parameter included in the results.
  let totalResults;

  // Get the first batch of results
  self.promiseWhile(
    // When this function returns false we have finished.
    function() {
      // There are actually no results.
      if ( totalResults === 0 )
        return false;
      // There aren't that many results so finish up now.
      else if ( totalResults && totalResults < resultsMax )
        return false;
      else
        return articles.length < resultsMax;
    },
    function () {
      const deferred = q.defer();
      // @TODO Insert delay.
      // @TODO Create timer
      // Only use a rate limit if what we want is more than max.
      let interval = params.limit > self.limitMax ? self.rateLimitInterval : 0;
      self._query(params).delay(interval)
        .then(function(results) {

          const data = JSON.parse(results);
          totalResults = parseInt(data.totalResults);
          let last_id = 0;

          if ( data.articles && data.articles.length) {
            // Add the incoming articles to our articles.
            articles = articles.concat(data.articles);
            params.limit = resultsMax - articles.length;
            // Do we have a sequenceId?
            params.sequence_id = data.articles.pop().sequenceId;
          }

          console.log(`
Retrieved ${articles.length} articles from a total of ${totalResults}.
Wanted ${resultsMax} articles.
Last article ID was ${params.sequence_id}.`);

          deferred.resolve();
        })
        .fail(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }
  ).then(function() {
    const data = {
      status: 'SUCCESS',
      totalResults: totalResults,
      articles: articles,
    }
    callback(data);
  }).done();

  return;
}

/*
 * A single call will return up to 500 articles (maximum).
 * Typically, calls should be scheduled 20 to 60 seconds apart,
 * depending on the volume of content you are set to receive.
 * You can instruct the call to only return new articles since
 * your previous call.
 */
Search.prototype._query = function(params, callback) {
  const self = this;
  const deferred = q.defer();

  self.client.get(self.client.url.path + '?' + querystring.stringify(params),
    function(err, req, res, obj) {
      if ( err )
        deferred.reject(err);
      else
        deferred.resolve(res.body);
    }
  );

  return deferred.promise;
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


/* https://stackoverflow.com/questions/17217736/while-loop-with-promises
 * `condition` is a function that returns a boolean
 * `body` is a function that returns a promise
 * returns a promise for the completion of the loop
 */
Search.prototype.promiseWhile = function(condition, body) {
    var done = q.defer();

    function loop() {
        // When the result of calling `condition` is no longer true, we are
        // done.
        if (!condition()) return done.resolve();
        // Use `when`, in case `body` does not return a promise.
        // When it completes loop again otherwise, if it fails, reject the
        // done promise
        q.when(body(), loop, done.reject);
    }

    // Start running the loop in the next tick so that this function is
    // completely async. It would be unexpected if `body` was called
    // synchronously the first time.
    q.nextTick(loop);

    // The promise
    return done.promise;
}

module.exports = Search;
