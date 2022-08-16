/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const axios = require('axios');
const qs = require('query-string');
process.env.TZ = 'America/Denver'; 

//Create Database Connection
var pgp = require('pg-promise')();

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user:  process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
//This line is necessary for us to use relative paths and access our resources directory
app.use(express.static(__dirname + '/'));

// home page
app.get(['/','/home'], function(req, res) {
	// console.log("This is response: ",res.body,"\nThis is request: ",req)
	res.status(200).render('pages/main',{
		my_title: "Home Page",
		items: '',
		error: false,
		message: '',
	});
});

// saved reviews page
app.get('/reviews', function(req, res) {
	var query = `SELECT * FROM reviews;`
	db.any(query)
	.then(info =>{
		// console.log(info)
		res.status(200).render('pages/reviews',{
			my_title:"Reviews Page",
			items: info,
			error: false,
			message: '',
		});
	})
	.catch(error =>{
		res.status(500).render('pages/reviews',{
			my_title:"Reviews Page",
			items: '',
			error: true,
			message: error.message
		});
	})
});

app.get('/about', function(req, res) {
		// console.log(info)
	res.status(200).render('pages/about',{
		my_title:"About",
		items: '',
		error: false,
		message: '',
	})
});

app.post('/reviews', function(req, res) {
	// console.log("This is the request: ",req.body)
	// console.log("This is the full req: ",req)
	var name = req.body.name.replace(/[^\w.?:-=+)(*&^%$#@!\s]/gi,'');
	var text = req.body.revText.replace(/[^\w.?:-=+)(*&^%$#@!\s]/gi,'');
	// console.log("show name pulled: ",name)
	var svRevQuery = `INSERT INTO reviews(tv_show, review, review_date) VALUES('${name}','${text}',(SELECT current_timestamp(2))) RETURNING review_id;`
	// console.log("full query before: ",svRevQuery)
	db.any(svRevQuery)
	.then(info =>{
		// console.log("Looking at the info: ",info[0].review_id)
		if (info[0].review_id) {
			res.status(200).redirect('/reviews');
		}
		else {
			res.status(500).render('pages/reviews',{
				my_title:"Reviews Page",
				items: '',
				error: true,
				message: 'Something went wrong with the save to database.'			});
		}				
	})
	.catch(error =>{
		res.render('pages/reviews',{
			my_title:"Reviews Page",
			items: '',
			error: true,
			message: error.message,
		});
	})
	
});

app.post('/filter', function(req, res) {
	// console.log("this is the search term: ",req.body.filter)
	if(!req.body.filter){ return res.status(500).render('pages/reviews',{my_title:"Reviews Page",items: '',error: true,message: 'There was no filter term entered'})};
	var search_word = req.body.filter.replace(/[^a-zA-Z0-9]/gi,' ').replace(/\s{1,}/gi,' ').replace(/^\s+|\s+$/g,'').toLowerCase().replace(/(\b\w+\b)/g, "\'%$1%\'").split(' ');
	var filter_word = `select * from reviews where LOWER(tv_show) LIKE any(array[${search_word}]);`;
	// console.log("this is the long ass query: ",filter_word)
	db.any(filter_word)
	.then(info =>{
		// console.log(info)
		if(info.length){
			return res.status(200).render('pages/reviews',{
				my_title:"Reviews Page",
				items: info,
				error: false,
				message: '',
			});
		}else{
			return res.status(500).redirect('/reviews');
		}
	})
	.catch(error =>{
		res.status(500).render('pages/reviews',{
			my_title:"Reviews Page",
			items: '',
			error: true,
			message: error.message
		});
	})
});

app.post('/search', function(req, res) {
	// console.log("request parameters: ", req.body)
	var title = req.body.title; //TODO: Remove null and fetch the param (e.g, req.body.param_name); Check the NYTimes_home.ejs file or console.log("request parameters: ", req) to determine the parameter names
	// console.log(title)
	if(title) {
	  axios({
		url: `http://api.tvmaze.com/search/shows?q=${title}`,
		  method: 'GET',
		  dataType:'json',
		})
		  .then(items => {
			// console.log(items.data[0])
			// for(var i=0; i < items.data.results.length; i++) {
			//   console.log(items.data.results[i]);
			// }
			res.status(200).render('pages/main', {
			  my_title: "Home Page",
			  items: items.data[0],
			  error: false,
			  message: ''
			});
			// console.log(items);
			// console.log(items.data.results);
		  })
		  .catch(error => {
			console.log(error);
			if (error.response) {
			  console.log(error.response.data);
			  console.log(error.response.status);
			}
			res.status(500).render('pages/main',{
			  my_title: "Home Page",
			  items: '',
			  error: true,
			  message: error.message
			})
		  });
	}
	else {
	  res.render('pages/main',{
		my_title: "Home Page",
		items: '',
		error: true,
		message: 'Please enter a search term or terms'
	  });
	}
  });

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
module.exports = server;
