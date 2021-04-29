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
		console.log(info)
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

app.post('/reviews', function(req, res) {
	// console.log("This is the request: ",req.body)
	// console.log("This is the full req: ",req)
	var name = req.body.name;
	var text = req.body.revText;
	var svRevQuery = `INSERT INTO reviews(tv_show, review, review_date) VALUES('${name}','${text}',(SELECT current_timestamp(2))) RETURNING review_id;`
	db.any(svRevQuery)
	.then(info =>{
		console.log("Looking at the info: ",info[0].review_id)
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
	console.log("this is the search term: ",req.body.filter)
	if(!req.body.filter){ return res.status(500).render('pages/reviews',{my_title:"Reviews Page",items: '',error: true,message: 'There was no filter term entered'})};
	var search_word = req.body.filter.replace(/[^a-zA-A0-9]/gi,' ').replace(/\s{1,}/gi,' ').replace(/^\s+|\s+$/g,'').toLowerCase().replace(/(\b\w+\b)/g, "\'%$1%\'").split(' ');
	var filter_word = `select * from reviews where LOWER(tv_show) LIKE any(array[${search_word}]);`;
	console.log("this is the long ass query: ",filter_word)
	db.any(filter_word)
	.then(info =>{
		console.log(info)
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

// app.get('/player_info', function(req,res){
//     var players = 'select * from football_players;';
//     db.task('get-everything', task => {
//         return task.batch([
//             task.any(players)
//         ]);
//     })
//         .then(data => {
//             res.render('pages/player_info',{
//                 my_title:"Player Info",
//                 players: data[0],
//                 playerinfo: '',
//                 games: ''
//             })
//         })
//         .catch(err => {
//             // console.log('Uh Oh I made an oopsie');
//             req.flash('error', err);
//             res.render('pages/player_info',{
//                 my_title: "Player Info",
//                 players: '',
//                 playerinfo: '',
//                 games: ''
//             })
//         });
// });

// app.get('/player_info/player', function(req,res){
//     var players = 'select * from football_players;';
//     var player_choice = req.query.player_choice;
//     var games = 'select * from football_games where ' + player_choice + ' = any(players);';
//     var player = "select * from football_players where id = '" + player_choice + "';";
//     db.task('get-everything', task => {
//         return task.batch([
//             task.any(players),
//             task.any(player),
//             task.any(games)
//         ]);
//     })
//         .then(data => {
//             res.render('pages/player_info',{
//                 my_title:"Player Info",
//                 playerinfo: data[1][0],
//                 players: data[0],
//                 games: data[2]
//             })
//         })
//         .catch(err => {
//             console.log('Uh Oh spaghettio');
//             req.flash('error', err);
//             res.render('pages/player_info',{
//                 my_title: "Player Info",
//                 playerinfo: '',
//                 players: '',
//                 games: ''
//             })
//         });
// });


// app.get('/team_stats', function(req, res) {
//     var footballGames = 'select * from football_games;';
//     var Winning = 'select COUNT(*) from football_games where home_score > visitor_score;';
//     var Loosing = 'select COUNT(*) from football_games where home_score < visitor_score;';
//     db.task('get-everything', task => {
//         return task.batch([
//             task.any(footballGames),
//             task.any(Winning),
//             task.any(Loosing)
//         ]);
//     })
//         .then(info => {

//             for(var i=0; i<info[0].length; i++){
//                 if (info[0][i].home_score >  info[0][i].visitor_score) {
//                     info[0][i]["winner"] = "CU_Boulder"
//                 }
//                 else {
//                     info[0][i]["winner"] = info[0][i].visitor_name
//                 }
//             }
//             res.render('pages/team_stats',{
//                 my_title: "Team Stats",
//                 result: info[0],
//                 result_2: info[1],
//                 result_3: info[2]
//             })
//         })
//         .catch(error => {
//             req.flash('error', error);
//             res.render('pages/team_stats', {
//                 my_title: 'Team Stats',
//                 result: '',
//                 result_2: '',
//                 result_3: ''
//             })
//         });

// });


//app.listen(3000);
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});