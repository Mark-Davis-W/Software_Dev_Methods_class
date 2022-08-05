/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help us connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dbConfig = {
	host: 'db',
	port: 5432,
	database: 'football_db',
	user: 'postgres',
	password: 'pwd'
};

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



/*********************************
 Below we'll add the get & post requests which will handle:
   - Database access
   - Parse parameters from get (URL) and post (data package)
   - Render Views - This will decide where the user will go after the get/post request has been processed

 Web Page Requests:

  Login Page:        Provided For you (can ignore this page)
  Registration Page: Provided For you (can ignore this page)
  Home Page:
  		/home - get request (no parameters)
  				This route will make a single query to the favorite_colors table to retrieve all of the rows of colors
  				This data will be passed to the home view (pages/home)

  		/home/pick_color - post request (color_message)
  				This route will be used for reading in a post request from the user which provides the color message for the default color.
  				We'll be "hard-coding" this to only work with the Default Color Button, which will pass in a color of #FFFFFF (white).
  				The parameter, color_message, will tell us what message to display for our default color selection.
  				This route will then render the home page's view (pages/home)

  		/home/pick_color - get request (color)
  				This route will read in a get request which provides the color (in hex) that the user has selected from the home page.
  				Next, it will need to handle multiple postgres queries which will:
  					1. Retrieve all of the color options from the favorite_colors table (same as /home)
  					2. Retrieve the specific color message for the chosen color
  				The results for these combined queries will then be passed to the home view (pages/home)

  		/team_stats - get request (no parameters)
  			This route will require no parameters.  It will require 3 postgres queries which will:
  				1. Retrieve all of the football games in the Fall 2018 Season
  				2. Count the number of winning games in the Fall 2018 Season
  				3. Count the number of lossing games in the Fall 2018 Season
  			The three query results will then be passed onto the team_stats view (pages/team_stats).
  			The team_stats view will display all fo the football games for the season, show who won each game,
  			and show the total number of wins/losses for the season.

  		/player_info - get request (no parameters)
  			This route will handle a single query to the football_players table which will retrieve the id & name for all of the football players.
  			Next it will pass this result to the player_info view (pages/player_info), which will use the ids & names to populate the select tag for a form
************************************/

// login page
app.get('/', function(req, res) {
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

// registration page
app.get('/register', function(req, res) {
	res.render('pages/register',{
		my_title:"Registration Page"
	});
});

/*Add your other get/post request handlers below here: */
app.get('/home', function(req, res) {
	var query = 'select * from favorite_colors;';
	db.any(query)
        .then(function (rows) {
            res.render('pages/home',{
				my_title: "Home Page",
				data: rows,
				color: '',
				color_msg: ''
			})

        })
        .catch(function (err) {
            console.log('error', err);
            res.render('pages/home', {
                my_title: 'Home Page',
                data: '',
                color: '',
                color_msg: ''
            })
        })
});

app.get('/home/pick_color', function(req, res) {
	var color_choice = req.query.color_selection; // Investigate why the parameter is named "color_selection"
	var color_options =  `select * from favorite_colors;`;// Write a SQL query to retrieve the colors from the database
	var color_message = `select color_msg from favorite_colors where hex_value = '${color_choice}';`;// Write a SQL query to retrieve the color message for the selected color
	db.task('get-everything', task => {
        return task.batch([
            task.any(color_options),
            task.any(color_message),
        ]);
    })
    .then(info => {
    	res.render('pages/home',{
				my_title: "Home Page",
				data: info[0], // Return the color options
				color: color_choice, // Return the color choice
				color_msg: info[1][0].color_msg, // Return the color message
			})
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/home', {
                my_title: 'Home Page',
                data: '',
                color: '',
                color_msg: ''
            })
    });

});

app.post('/home/pick_color', function(req, res) {
	var color_hex = req.body.color_hex;
	var color_name = req.body.color_name;
	var color_message = req.body.color_message;
	var insert_statement = `INSERT INTO favorite_colors(hex_value, name, color_msg) VALUES('${color_hex}','${color_name}','${color_message}');`;// Write a SQL statement to insert a color into the favorite_colors table
	var color_select = 'select * from favorite_colors;';// Write a SQL statement to retrieve all of the colors in the favorite_colors table

	db.task('get-everything', task => {
        return task.batch([
            task.any(insert_statement),
            task.any(color_select)
        ]);
    })
    .then(info => {
    	res.render('pages/home',{
				my_title: "Home Page",
				data: info[1], // Return the color choices
				color: color_hex,// Return the hex value of the color added to the table
				color_msg: color_message,// Return the color message of the color added to the table
			})
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/home', {
                my_title: 'Home Page',
                data: '',
                color: '',
                color_msg: ''
            })
    });
});

app.get('/team_stats', function(req, res) {
	var query = 'SELECT * FROM football_games;';
	db.any(query)
		.then(function (rows) {
			var wins = 0; var losses = 0; var winner = [];
			rows.forEach(e => {
				if(e.home_score > e.visitor_score){
					winner.push("CU Boulder");
					wins++;
				}
				else if (e.home_score < e.visitor_score){
					winner.push(e.visitor_name);
					losses++;
				}
				else{
					winner.push("Tie");
				}
			});
			res.render('pages/team_stats',{
				my_title: "team Stats",
				data: rows,
				wins: wins,
				losses: losses,
				winner: winner,
			})
		})
		.catch(function (err) {
			// display error message in case an error
			console.log('error', err);
			res.render('pages/team_stats',{
				my_title: "Team Stats",
				data: ''
			});
		});
	
});

app.get('/player_info', function(req, res) {
	var query = 'SELECT * FROM football_players;';
	var pic = '../resources/img/helmet.jpg';
	db.any(query)
        .then(function (rows) {
            res.render('pages/player_info',{
				my_title: "Player Info",
				data: rows,
				pic: pic,
			})
        })
        .catch(function (err) {
            console.log('error', err);
            res.render('pages/player_info', {
                my_title: 'Player Info',
                data: '',
				pic: pic,
            })
        })
});

app.get('/player_info/player', function(req, res) {
	var player_chozen = req.query.player_choice; 
	var query = 'SELECT * FROM football_players;';
	var game_ttl = `SELECT COUNT(players) FROM football_games WHERE ${player_chozen} = ANY(players);`;
	// var pic = req.query.player_choice;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query),
            task.any(game_ttl),
        ]);
    })
    .then(info => {
		var data = [];
			info[0].forEach(e => {
				data[e.id] = e;
			});
			// console.log(data[player_chozen]);
    	res.render('pages/player_info',{
				my_title: "Player Info",
				data: data,
				player: data[player_chozen], 
				ttl: parseInt(info[1][0].count),
				pic: data[player_chozen].img_src,
			})
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/player_info', {
                my_title: 'Player Info',
                data: '',
				player: '', 
				ttl: '',
				pic: '../resources/img/helmet.jpg',
            })
    });

});

app.post('/player_info/add_player', function(req, res) {
	var p_name = req.body.player_name;
	var p_year = req.body.player_year;
	var p_major = req.body.player_major;
	var p_p_yards = req.body.player_passing_yards;
	var p_ru_yards = req.body.player_rushing_yards;
	var p_re_yards = req.body.player_receiving_yards;
	var insert_stats = `INSERT INTO football_players(name, year, major, passing_yards, rushing_yards, receiving_yards,img_src) VALUES('${p_name}','${p_year}','${p_major}','${p_p_yards}','${p_ru_yards}','${p_re_yards}','../resources/img/helmet.jpg');`;// Write a SQL statement to insert
	var player_s = 'select * from football_players;';// Write a SQL statement to retrieve all

	db.task('get-everything', task => {
        return task.batch([
            task.any(insert_stats),
            task.any(player_s)
        ]);
    })
    .then(info => {
    	res.render('pages/player_info',{
				my_title: "Player Info",
				data : info[1],
				pic: '../resources/img/helmet.jpg',
			})
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/player_info', {
                my_title: 'Player Info',
				data: '',
				pic: '../resources/img/helmet.jpg',
            })
    });
});

app.post('/player_info/add_game', function(req, res) {
	var v_name = req.body.visitor_name;
	var h_score = req.body.home_score;
	var v_score = req.body.visitor_score;
	var g_date = req.body.game_date;
	var n_player = req.body.players;
	var insert_stats = `INSERT INTO football_games(visitor_name, home_score, visitor_score, game_date, players) VALUES('${v_name}','${h_score}','${v_score}','${g_date}','${n_player}');`;// Write a SQL statement to insert
	var n_game = 'select * from football_players;';// Write a SQL statement to retrieve all

	db.task('get-everything', task => {
        return task.batch([
            task.any(insert_stats),
            task.any(n_game)
        ]);
    })
    .then(info => {
    	res.render('pages/player_info',{
				my_title: "Player Info",
				data : info[1],
				pic: '../resources/img/helmet.jpg',
			})
    })
    .catch(err => {
            console.log('error', err);
            res.render('pages/player_info', {
                my_title: 'Player Info',
				data: '',
				pic: '../resources/img/helmet.jpg',
            })
    });
});


app.listen(3000);
console.log('3000 is the magic port');
