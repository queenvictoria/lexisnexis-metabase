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

- 2017-11-30  Now supports large `limit` parameters. Metabase documentation says that 500 can be returned at a time. However our testing shows that that number is actually 200. We now use `q` to fetch multiple times and stitch the results together.

## Documentation ##

* [API documentation](https://portal.moreover.com/index.html#documentation/LN-MB-technical) (requires account).
* [Product information](https://www.lexisnexis.com/en-us/products/metabase.page)

## Dependencies ##

This is built on the excellent [restify client library](http://restify.com/#client-api). Also uses lodash and change-case. Testing with mocha.
