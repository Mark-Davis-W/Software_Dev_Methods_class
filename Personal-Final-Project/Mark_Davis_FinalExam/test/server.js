// Imports the server.js file to be tested.
let server = require("../src/server.js");
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
    it("Testing if page is up and ok", done => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          console.log(res.status)
          expect(res).to.have.status(200);
          done();
        });
    });

    it("Testing if API response is ok and an object", done => {
      chai
        .request(server)
        .post("/search")
        .send({ title: 'albany' })
        .end((err, res) => {
          // console.log("test side:",res.body,res.status)
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          done();
        });
    });

    it("Testing if response is ok and an object", done => {
      chai
        .request(server)
        .get("/reviews")
        .send({ title: 'albany' })
        .end((err, res) => {
          // console.log("test side:",res.body,res.status)
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          done();
        });
    });
});