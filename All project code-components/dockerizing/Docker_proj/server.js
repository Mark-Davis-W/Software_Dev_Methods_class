/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
const express = require('express'); //Ensure our express framework has been added
var aws = require('aws-sdk');
const multer = require('multer'); //Used for file upload parsing
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4; //used for a long string of unique characters (hash)
const qs = require('query-string');
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
// const session = require('express-session');
app.use(bodyParser.json());// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var pgp = require('pg-promise')(); //Create Database Connection

//time for local memory session calculation
const TWO_HOURS = 1000 * 60 * 60 * 2;
//constants are or will be used throughout
const {
	PORT = 3000,
	SESS_MAX = TWO_HOURS,
	SESS_NAME = 'sid',
	SESS_SECRET = 'jasl;dfinas'
} = process.env

// app.use(session({
// 	name: SESS_NAME,
// 	resave: false,
// 	saveUninitialized: false,
// 	secret: SESS_SECRET,
// 	cookie:{
// 		maxAge:TWO_HOURS,
// 		sameSite: true
// 	}
// }));
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
	database: process.env.pg_db_nm,
	user: process.env.pg_user,
	password: process.env.pg_pswd
};

var s3 = new aws.S3();

var accessKeyId =  process.env.AWS_ACCESS_KEY;
var secretAccessKey = process.env.AWS_SECRET_KEY;

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'notetakers',
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname });
        },
        key:(req, file, cb) => {
            const {originalname} = file;
            cb(null,`${uuid()}--${originalname}`);
        }
    })
});

var db = pgp(dbConfig);

app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

app.post('/upload', upload.single('pdf_file'), (req, res) =>{
	return res.json({status: 'OK'})
});
/*********************************
 Below we have get & post requests which will handle:
   - Database access
   - Parse parameters from get (URL) and post (data package)
   - Render Views - This will decide where the user will go after the get/post request has been processed

 Web Page Requests:

  Login Page:
  Registration Page:
  Admin_profile Page:
  Notetaker_profile Page:
  User_profile Page:
************************************/

// login page
app.get('/', function(req, res) {
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

// registration page
app.get('/registration', function(req, res) {
	res.render('pages/registration',{
		my_title:"Registration Page"
	});
});

app.get('/admin', function(req, res) {
	res.render('pages/admin_profile',{
		my_title:"Admin Profile"
	});
});

app.get('/notetaker', function(req, res) {
	res.render('pages/notetaker_profile',{
		my_title:"NoteTaker Profile"
	});
});

// Testing db at runtime to see if db outputs and connection works
// Now changing to make main route and fill site with user data
app.get('/user', function(req, res) {
	var user_id = 1;
	var query1 = `select * from notes;`;
	// console.log(query1)
	// var s_n_query = `select * from notes where note_id = any(select saved_notes from users where user_id = ${user_id});`;
	var query2 = `select * from messages where reciever_id = ${user_id};`;
	var query3 = `select * from users where user_id = ${user_id};`;
	var users_q = `select * from users;`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(query1),
            task.any(query2),
			task.any(query3),
			task.any(users_q)
        ]);
    })
	.then(info => {
		// console.log("\nThis is the first query: ",info[0]);
		// console.log("\n\nThis is the second query: ",info[1]);
		// console.log("\n\nThis is the third query: ",info[2]);
		// console.log("\n\nThis is the fourth query: ",info[3][0].saved_notes);
		res.render('pages/user_profile', {
            my_title: "User Profile",
            note: info[0],
			mess: info[1],
			about: info[2],
			users: info[3],
            error: false,
			message: ''
          });
	})
	.catch(error => {
		// console.log('error', err);
		if (error.response) {
            console.log(err.response.data);
            console.log(err.response.status);
          }
		res.render('pages/user_profile',{
            my_title: "User Profile",
            note: '',
			mess: '',
			about: '',
			users: '',
            error: true,
            message: error
        })
	});
	
	// This is a wait callback function
	// async function init() {
	// 	console.log(1);
	// 	await sleep(1000);
	// 	console.log(2);
	//   }
});




app.listen(PORT, () => console.log(
	`http://localhost:${PORT}`,'\nSeems all green!!'));










	

