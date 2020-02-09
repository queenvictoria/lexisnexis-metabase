# LexisNexis Metabase client for Node.js #

A node js client library for the LexisNexis Metabase/Moreover search API. This requires a [paid account](https://www.lexisnexis.com/en-us/products/metabase.page).

## Usage ##

```Javascript
let MetabaseSearch = require('lexisnexis-metabase/search');
let client = new MetabaseSearch({token: "[YOUR_API_KEY]"});

let params = {
  format: json,
  limit: 10,
  query: {
    '$': 'london',
    'Source country': 'United Kingdom'
  }
};

client.query(params, function(data, response) {
  console.log(data);
}, function(err) {
  console.error(err);
});
```

## Tests ##

```Shell
$ env API_KEY=[YOUR_API_KEY] npm test
```

## Changelog ##

- 2020-02-10  v1.0.17 Upgrade Restify to restify-clients.
- 2019-08-31  v1.0.16 Upgrade lodash and Mocha.
- 2019-08-31  v1.0.15 Remove quotes in some cases.
- 2019-05-16  v1.0.14 Upgrade Mocha.
- 2019-02-21  v1.0.13 Tests for looping fetcher. Upgrade dependencies.
- 2017-12-19  v1.0.12 Don't die on a network error.
- 2017-12-02  v1.0.11 Repair meta response.
- 2017-11-30  v1.0.10 Fix for when there are zero totalResults.
- 2017-11-30  v1.0.9  Fix for when there aren't many totalResults. Don't wait if we don't have to.
- 2017-11-30  v1.0.8  Respects Metabases rate limit timeout of 20 seconds.
- 2017-11-30  v1.0.7  Now supports large `limit` parameters. Metabase documentation says that 500 can be returned at a time. However our testing shows that that number is actually 200. We now use `q` to fetch multiple times and stitch the results together.

## Documentation ##

* [API documentation](https://portal.moreover.com/index.html#documentation/LN-MB-technical) (requires account).
* [Product information](https://www.lexisnexis.com/en-us/products/metabase.page)

## Dependencies ##

This is built on the excellent [restify client library](http://restify.com/#client-api). Also uses lodash and change-case. Testing with mocha.
