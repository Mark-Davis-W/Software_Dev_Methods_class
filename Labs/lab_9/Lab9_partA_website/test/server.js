// Imports the server.js file to be tested.
let server = require("../server");
//Assertion (Test Driven Development) and Should, Expect(Behaviour driven development) library
let chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp); 
const { expect } = chai;
var assert = chai.assert;
// let ops = require("../server/operations");




describe("Server!", () => {

    // Sample test case given to test / endpoint. 
    it("Returns the default welcome message", done => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals("success");
          assert.strictEqual(res.body.message, "Welcome!");
          done();
        });
    });

    // Please add your test cases here.
    it("Tested return of ops", done => {
      chai
        .request(server)
        .get("/operations")
        .end((err, res) => {
          console.log(res.body,res.status)
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          done();
        });
    });

    it("Tested return of ID's", done => {
      chai
        .request(server)
        .get("/operations/1")
        .end((err, res) => {
          console.log(res.body,res.status)
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('sign');
          done();
        });
    });

    it("Tested adding new operation", done => {
      chai
        .request(server)
        .post("/operations")
        .send({name: 'hi', sign: '&' })
        .end((err, res) => {
          console.log(res.body,res.status)
          expect(res.body).to.have.property('id', 4);
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('sign');
          done();
        });
    });
 
  });