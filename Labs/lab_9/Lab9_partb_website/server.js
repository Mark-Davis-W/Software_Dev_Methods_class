// Load the modules
var express = require('express'); //Express - a web application framework that provides useful utility functions like 'http'
var app = express();
var bodyParser = require('body-parser'); // Body-parser -- a library that provides functions for parsing incoming requests
app.use(bodyParser.json());              // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies


// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));// Set the relative path; makes accessing the resource directory easier

// Simple get api provided to check if the node.js starts up successfully. Opening up http://localhost:3000 should display the below returned json.
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

//Add your code support two new API's /add and /divide here.

// Divide numbers provided in specific order
app.post("/divide" , (request, response) => {
  // console.log(response)
  const num1 = request.body.num1;
  const num2 = request.body.num2;
  // console.log(num1,num2)
  if(num2 === 0)
    return response.status(404).send("The denominator(2nd number) cannot be 0!");
  if(typeof(num1) !== 'number' || typeof(num2) !== 'number') 
    return response.status(404).send("The input must be numbers");
  const num3 = num1 / num2;
  response.status(200).send({num3});
});

// Divide numbers provided in specific order
app.post("/add" , (request, response) => {
  // console.log(response)
  const num1 = request.body.num1;
  const num2 = request.body.num2;
  // console.log(num1,num2)
  if(typeof(num1) !== 'number' || typeof(num2) !== 'number') 
    return response.status(404).send("The input must be numbers");
  
  const num3 = num1 + num2;
  response.status(200).send({num3});
});


module.exports = app.listen(3000);
console.log('3000 is the magic port');
