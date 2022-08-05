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


//Import complete


describe("Server!", () => {
      // Add your test cases here
      it("Bad input testing of DIVIDE route, provided 0 as denominator", done => {
            chai
              .request(server)
              .post("/divide")
              .send({num1: 1 , num2: 0 })
              .end((err, res) => {
                expect(res.status).to.equals(404);
                console.log(res.text,res.status)
                // console.log(res.status)
                done();
              });
          });
      it("Bad input testing of DIVIDE route, provided not a number", done => {
      chai
            .request(server)
            .post("/divide")
            .send({num1: 'r', num2: 2 })
            .end((err, res) => {
            expect(res.status).to.equals(404);
            console.log(res.text,res.status)
            // console.log(res.status)
            done();
            });
      });

      it("Positive testing of DIVIDE route", done => {
      chai
            .request(server)
            .post("/divide")
            .send({num1: 11, num2: 2 })
            .end((err, res) => {
            console.log(res.body,res.status)
            expect(res.status).to.equals(200);
            expect(res.body).to.have.property('num3',5.5);
            // console.log(res.status)
            done();
            });
      });

      it("Bad input testing of ADD route, providing a letter", done => {
      chai
            .request(server)
            .post("/add")
            .send({num1: '11', num2: 2 })
            .end((err, res) => {
            expect(res.status).to.equals(404);
            console.log(res.text,res.status)
            // console.log(res.status)
            done();
            });
      });

      it("Positive testing of ADD route", done => {
      chai
            .request(server)
            .post("/add")
            .send({num1: 11, num2: 2 })
            .end((err, res) => {
            console.log(res.body,res.status)
            expect(res.status).to.equals(200);
            expect(res.body).to.have.property('num3',13);
            // console.log(res.status)
            done();
            });
      });
      
});