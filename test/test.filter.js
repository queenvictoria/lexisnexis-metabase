'use strict';

const assert = require('assert');

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
const API_KEY = process.env.FILTER_API_KEY


let Filter = require('../filter');

// Require the dev-dependencies
// let assert = require('chai').assert
let expect = require('chai').expect
// let should = chai.should();


/*
 * @TODO
 *
 */


// Our parent block
describe('Filter', function() {

  before((done) => {
    done();
  });


 /*
  * Create a Filter client
  */
  describe("Create a Filter client.", function() {
    it('It should create a Filter API client with access to a users\'s token', function(done) {
      let client = new Filter();
      expect(client).to.be.an('object');

      done();
    });

    it('The constructor should accept an API key passed in', function(done) {
      let client = new Filter({token: API_KEY});
      expect(client.token).to.be.a('string');

      done();
    });

    it('It should accept a call to config with an API key', function(done) {
      let client = new Filter();
      client.config({token: API_KEY});
      expect(client.token).to.be.a('string');

      done();
    });

    it('It should have the correct endpoint', function(done) {
      let client = new Filter();
      client.config({token: API_KEY});
      expect(client).to.have.property('URL');
      expect(client.URL).to.be.a('string');
      expect(client.client.url.host).to.equal('metabase.moreover.com');
      expect(client.client.url.path).to.contain('articles');

      done();
    });
  }); // end of Filter client


  describe("Administer filters.", function() {
    it("Create a filter.");
    it("Read filters.");
    it("Update a filter.");
    it("Delete a filter.");
  });


 /*
  * Fetch data from a Filter client
  */
  describe("Fetch data from a Filter client.", function() {
    it('It can fetch data', function(done) {
      let client = new Filter({token: API_KEY});
      let params = {
        // format: 'json',
      };

      client.fetch(params, function(obj, res) {
        expect(obj).to.be.an('object');

        expect(obj.status).to.equal('SUCCESS');
        expect(obj.articles).to.be.an('array');
        expect(obj.articles).to.have.length.below(500 + 1);
        expect(obj.articles).to.have.length.above(0);
        expect(obj.articles[0]).to.have.property('id');
        expect(obj.articles[0]).to.have.property('title');

        done();
      });
    }).timeout(60000);


    // @FIX Delay or Metabase's rate limiter kicks in.
    it('Needs to delay before hitting metabase again', done => {
      setTimeout(() => {
        done();
      }, 20000)
    }).timeout(30000);


    it('It can get data from the service for more than 500 articles', function(done) {
      let client = new Filter({token: API_KEY});
      let limit = 1000;
      let params = {
        limit: limit,
        format: 'json',
      };

      client.fetch(params, function(obj, res) {
        expect(obj).to.be.an('object');

        expect(obj.status).to.equal('SUCCESS');
        expect(obj.articles).to.be.an('array');
        expect(obj.articles).to.have.length.below(limit + 1);
        expect(obj.articles).to.have.length.above(0);
        expect(obj.articles[0]).to.have.property('id');
        expect(obj.articles[0]).to.have.property('title');

        done();
      });
    }).timeout(60000);
  }); // end of Fetch


}); // End of describe Filter
