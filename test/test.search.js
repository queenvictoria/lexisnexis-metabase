'use strict';

const assert = require('assert');

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';


let Search = require('../search');

// Require the dev-dependencies
// let assert = require('chai').assert
let expect = require('chai').expect
// let should = chai.should();


/*
 * @TODO
 *
 */


// Our parent block
describe('Search', function() {

  before((done) => {
    done();
  });

 /*
  * Create a Search client
  */
  describe("Create a Search client.", function() {
    it('It should create a Search API client with access to a users\'s token', function(done) {
      let client = new Search();
      expect(client).to.be.an('object');
      done();
    });

    it('The constructor should accept an API key passed in', function(done) {
      let client = new Search({token: process.env.API_KEY});
      expect(client.token).to.be.a('string');

      done();
    });

    it('It should accept a call to config with an API key', function(done) {
      let client = new Search();
      client.config({token: process.env.API_KEY});
      expect(client.token).to.be.a('string');

      done();
    });

    it('It should have the correct endpoint', function(done) {
      let client = new Search();
      client.config({token: process.env.API_KEY});
      expect(client).to.have.property('URL');
      expect(client.URL).to.be.a('string');
      expect(client.client.url.host).to.equal('metabase.moreover.com');
      expect(client.client.url.path).to.contain('searchArticles');

      done();
    });
  }); // end of Search client


 /*
  * Query a Search client
  */
  describe("Query a Search client.", function() {
    it('It can query the service using a string', function(done) {
      let client = new Search({token: process.env.API_KEY});
      let limit = 2;
      let params = {
        query: 'Jacinda Adern AND sourceCountry:"United Kingdom"',
        limit: limit,
        format: 'json',
      };

      client.query(params, function(obj, res) {
        expect(obj).to.be.an('object');

        expect(obj.status).to.equal('SUCCESS');
        expect(obj.articles).to.be.an('array');
        expect(obj.articles).to.have.length.below(limit + 1);
        expect(obj.articles).to.have.length.above(0);
        expect(obj.articles[0]).to.have.property('id');
        expect(obj.articles[0]).to.have.property('title');

        done();
      });
    });

    it('It can query the service using a complex object', function(done) {
      let client = new Search({token: process.env.API_KEY});
      let limit = 2;
      let params = {
        query: {
          '$': 'Jacinda Adern',
          'Source country': 'United Kingdom',
        },
        limit: limit,
        format: 'json',
      };

      client.query(params, function(obj, res) {
        expect(obj).to.be.an('object');

        expect(obj.status).to.equal('SUCCESS');
        expect(obj.articles).to.be.an('array');
        expect(obj.articles).to.have.length.below(limit + 1);
        expect(obj.articles).to.have.length.above(0);
        expect(obj.articles[0]).to.have.property('id');
        expect(obj.articles[0]).to.have.property('title');

        done();
      });
    });

    it('It can query the service for more than 200 articles', function(done) {
      let client = new Search({token: process.env.API_KEY});
      let limit = 400;
      let params = {
        query: {
          '$': 'Jacinda Adern',
          'Source country': 'United Kingdom',
        },
        limit: limit,
        format: 'json',
      };

      client.query(params, function(obj, res) {
        expect(obj).to.be.an('object');

        expect(obj.status).to.equal('SUCCESS');
        expect(obj.articles).to.be.an('array');
        expect(obj.articles).to.have.length.below(limit + 1);
        expect(obj.articles).to.have.length.above(0);
        expect(obj.articles[0]).to.have.property('id');
        expect(obj.articles[0]).to.have.property('title');

        done();
      });
    });
  }); // end of Query


}); // End of describe Search
