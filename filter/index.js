'use strict';

/*
 * Filter API https://portal.moreover.com/index.html#documentation/LN-MB-filters
 *
 * @TODO
 * - Create filters POST: https://admin-metabase.moreover.com/api/v2/filters?key={your_access_key}
 * - Read filters GET: https://admin-metabase.moreover.com/api/v2/filters?key={your_access_key}&items_per_page=25&page=0
 * - Update filters PUT: https://admin-metabase.moreover.com/api/v2/filters?key={your_access_key}
 * - Delete filters DELETE: https://admin-metabase.moreover.com/api/v2/filters?key={your_access_key}
 * - Request data from a filter http://metabase.moreover.com/api/v10/articles?key=(your API key)
 */


const BaseService = require('../lib/base_service');
const querystring = require('querystring');
const _ = require('lodash');
const q = require('q');
const changeCase = require('change-case');

/**
 *
 * @param {Object} options
 * @constructor
 */
function Filter(options) {
  BaseService.call(this, options);
};

Filter.prototype = Object.create(BaseService.prototype);


Filter.prototype.name = 'filter';
Filter.prototype.version = 'v10';
Filter.prototype.adminVersion = 'v2';
Filter.prototype.URL = Filter.prototype.baseURL + '/articles';
Filter.prototype.rateLimitInterval = 20000;   // Delay between calls.
Filter.prototype.limitMax = 500;              // Maximum results per call. Docs say 500.

Filter.prototype.fetch = function(params, callback, errorHandler) {
  const self = this;

  params = params || { };
  if ( ! params.key ) {
    params.key = self.token;
  }
  if ( ! params.format ) {
    params.format = self.format;
  }

  const resultsMax = params.limit || self.limitMax;

  if ( params.limit && params.limit > self.limitMax ) {
    console.warn(`WARNING: Cannot retrieve more than ${self.limitMax} results at a time. We will loop through getting more results. This is experimental.`);
  }

  // Current results
  let articles = [];
  let loop = 0;
  console.log('reset loop to 0')
  // A metabase parameter included in the results.
  let totalResults;

  // Get the first batch of results
  self.promiseWhile(
    // When this function returns false we have finished.
    function() {
      // Always run at least once.
      if ( loop === 0 )
        return true;
      // If some articles were returned, but not limitMax, then there aren't that many results so finish up now.
      else if ( articles.length < self.limitMax )
        return false;
      else
        return parseInt(articles.length) < parseInt(resultsMax);
    },
    function () {
      const deferred = q.defer();
      // Only use a rate limit if what we want is more than max.
      let interval = params.limit > self.limitMax ? self.rateLimitInterval : 0;
      // If we are on the first loop then no delay.
      if ( loop === 0 ) interval = 0;
      // If there are only a few results remaining then remove the delay.
      // if ( totalResults && totalResults - articles.length < self.limitMax ) interval = 0;
      console.log(`Interval is ${interval} loop ${loop}`);
      loop++;
      self._fetch(params).delay(interval)
        .then(function(results) {
          const data = JSON.parse(results);
          // Don't update total results if it already exists.
          // totalResults = totalResults || parseInt(data.articles.length);
          let last_id = 0;

          if ( data.articles && data.articles.length) {
            // Add the incoming articles to our articles.
            articles = articles.concat(data.articles);
            params.limit = resultsMax - articles.length;
            // Do we have a sequenceId?
            params.sequence_id = data.articles.pop().sequenceId;
          }

          deferred.resolve();
        })
        .fail(function(err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }
  ).then(function() {
    // @FIX
    const data = {
      status: 'SUCCESS',
      totalResults: totalResults,
      articles: articles,
    }
    callback(data);
  })
  .fail(function(err) {
    console.error(err)
    errorHandler(err);
  })
  .done();

  return;
}

/*
 * A single call will return up to 500 articles (maximum).
 * Typically, calls should be scheduled 20 to 60 seconds apart,
 * depending on the volume of content you are set to receive.
 * You can instruct the call to only return new articles since
 * your previous call.
 */
Filter.prototype._fetch = function(params, callback) {
  const self = this;
  const deferred = q.defer();

  const opts = {
    path: self.client.url.path,
    query: params
  }
  console.log('_fetch called');

  self.client.get(opts,
    function(err, req, res, obj) {
      if ( err )
        deferred.reject(err);
      else
        deferred.resolve(res.body);
    }
  );

  return deferred.promise;
};

/* https://stackoverflow.com/questions/17217736/while-loop-with-promises
 * `condition` is a function that returns a boolean
 * `body` is a function that returns a promise
 * returns a promise for the completion of the loop
 */
Filter.prototype.promiseWhile = function(condition, body) {
  const deferred = q.defer();

  function loop() {
    // When the result of calling `condition` is no longer true, we are
    // done.
    if (!condition()) return deferred.resolve();
    // Use `when`, in case `body` does not return a promise.
    // When it completes loop again otherwise, if it fails, reject the
    // done promise
    q.when(body(), loop, deferred.reject);
  }

  // Start running the loop in the next tick so that this function is
  // completely async. It would be unexpected if `body` was called
  // synchronously the first time.
  q.nextTick(loop);

  // The promise
  return deferred.promise;
}

module.exports = Filter;
