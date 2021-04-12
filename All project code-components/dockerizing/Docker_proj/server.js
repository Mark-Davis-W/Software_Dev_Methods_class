/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
const express = require('express'); //Ensure our express framework has been added
const aws = require('aws-sdk');
const multer = require('multer'); //Used for file upload parsing
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4; //used for a long string of unique characters (hash)
const qs = require('query-string');
const app = express();
const bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
const { use } = require('chai');
// const session = require('express-session');
app.use(bodyParser.json());// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const pgp = require('pg-promise')(); //Create Database Connection

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

const s3 = new aws.S3();

const accessKeyId =  process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const user_id = 7;

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'notetakers',
		acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname });
        },
        key:(req, file, cb) => {
            var {originalname} = file;
			let [month, date, year] = new Date().toLocaleDateString().split("/");
			let [hour, minute] = new Date().toLocaleTimeString().split(/:| /);
			Cdate = `${year}-${month}-${date-1}-${parseInt(hour)-6}-${minute}`;
			// console.log(Cdate)
            cb(null,`${uuid().substring(0,8)}-${Cdate}-${originalname}`);
        }
    }),
	fileFilter: async (req, file, cb) => {
		if (file.mimetype != "application/pdf") {
			cb(new Error('The file must be a Pdf!'), false);
		}
		cb(null, true);
	  }
});

var db = pgp(dbConfig);

app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

// app.use(function (req, res, next) {
//     // if user is authenticated in the session, carry on
//     if (req.isAuthenticated())
//         return next();
//     // if they aren't redirect them to the home page
//     res.redirect('/login');
// });

app.post('/upload', function(req, res) {
	const sUpload = upload.single('pdf_file');
	sUpload(req,res, function(err){
		// console.log(req.file)
		// File size error
		if(err instanceof multer.MulterError){
			// console.log(err)
			// return res.end(err);
		}
		else if(err) {
			return res.status(333).end(err.message);
		}
		// FILE NOT SELECTED
        else if (!req.file) {
			return res.send({ error: 'File was not selected for upload.' })
			// return res.end(err);
			// res.writeHead(302,{
			// 	'Location':'/user',
			// 	'message':'File not selected!'
			// });
			// return res.end();
        }
		 // SUCCESS
		else {
            // console.log("File uploaded successfully!");
            // console.log("File response", req.file);
			var f_path = req.file.location;
			var maj = 'Computer Science';
			var course = 'CSCI5000';
			var f_name = req.file.key;
			var sem = '20210408';
			// var user_id = '1';

			console.log("new path: ",f_path);
			var insert_new = `INSERT INTO notes(filepath, major, course_id, note_title, semester, reported, note_user_id)
			VALUES('${f_path}','${maj}','${course}','${f_name}','${sem}','False','${user_id}') RETURNING note_id;`;

			// res.end("Great we have a file!")
			console.log(insert_new);
			db.any(insert_new)
			.then(info =>{
				console.log(info[0].note_id)
				var save_user = `UPDATE users SET saved_notes = array_append(saved_notes,${parseInt(info[0].note_id)}) WHERE user_id = ${user_id};`;
				console.log(save_user);
				db.any(save_user)
				.catch(function (error) {
					if (error.response) {
						console.log(err.response.data);
						console.log(err.response.status);
					  }
				});
				// return res.end(err.message)
				// return res.redirect('/user');
				res.writeHead(302,{
					'Location':'/user',
				});
				res.end();
			})
			.catch(function (error) {
				if (error.response) {
					console.log(err.response.data);
					console.log(err.response.status);
				  }
			})
        }
	})


	// console.log(res)
	// return res.json({status: 'OK'})
});
//====================== Graces Notes ===========
/*
app.post('/sumbit', function(req, res) {
  console.log(user_id);
  var new_user = req.query.username1;
  var new_name = req.query.fullname;
  var new_email = req.query.email1;
  var new_uni = req.query.university1;
  var new_psw = req.query.username1;
  var new_acc_type = req.query.custSelect;
	var check = `select * from users where username = ${new_user}`;
  db.task('get-everything', task => {
        return task.batch([
            task.any(new_user),
            task.any(new_name),
      task.any(new_uni),
      task.any(new_psw),
      task.any(new_acc_type),
      task.any(check)
        ]);
    })
    .then(info => {
      console.log("\nusername: ",info[0]);
      console.log("\nname: ",info[1]);
      console.log("\nemail: ",info[2]);
      console.log("\nuniversity: ",info[3]);
      console.log("\npassword: ",info[4]);
      console.log("\naccount type: ",info[5]);
      //console.log("\nthe check: ",info[6]);
      if(check){
        return res.send({ error: 'Username is taken' })
      }

      var insert_new_user = `INSERT INTO users(user_id, username, full_name, email, university, pass_word, account_type)
      VALUES('${user_id}','${new_user}','${new_name}','${new_email}','${new_uni}','${new_psw}','${new_acc_type}');`;
      db.any(insert_new_user)
      .catch(function (error) {
        if (error.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          }
      });
  	})
  	.catch(error => {
  		if (error.response) {
              console.log(err.response.data);
              console.log(err.response.status);
            }
        })
});
*/
app.post('/registration/submit', function(req, res) {
  //console.log('\nrequest',req);
  //console.log('\nreqBody',req.body);
  var new_user = req.body.username1;
  var new_name = req.body.fullname;
  var new_email = req.body.email1;
  var new_uni = req.body.university1;
  var new_psw = req.body.psw;
  var new_acc_type = req.body.custSelect;
  //console.log("\nusername: ",new_user);
  //console.log("\nname: ",new_name);
  //console.log("\nemail: ",new_email);
  //console.log("\nuniversity: ",new_uni);
  //console.log("\npassword: ",new_psw);
  //console.log("\naccount type: ",new_acc_type);
	//var check = `select * from users where username = ${new_user}`;
  var insert_new_user = `INSERT INTO users(user_id, username, full_name, email, pass_word, account_type, is_admin, university)
  VALUES('${user_id}','${new_user}','${new_name}','${new_email}',crypt('${new_psw}', gen_salt('bf')),'${new_acc_type}','False','${new_uni}');`;
  db.any(insert_new_user)
	//db.task('get-everything', task => {
        //return task.batch([
            //task.any(check),
            //task.any(insert_new_user)
        //]);
    //})
    .then(info => {
      //if(check){
        //return res.send({ error: 'Username is taken' })
      //}
      res.render('pages/login',{
    		local_css:"signin.css",
    		my_title:"Login Page"
    	});
    })
    .catch(function (error) {
      if (error.response) {
        console.log(err.response.data);
        console.log(err.response.status);
        }
    });
});
//================== end =================
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

// app.get('/admin', function(req, res) {
// 	res.render('pages/admin_profile',{
// 		my_title:"Admin Profile"
// 	});
// });

app.get('/notetaker', function(req, res) {
	res.render('pages/notetaker_profile',{
		my_title:"NoteTaker Profile"
	});
});

// Testing db at runtime to see if db outputs and connection works
// Now changing to make main route and fill site with user data
app.get('/user', function(req, res) {
	// var user_id = 1;
	var n_query = `select * from notes where note_id in (select unnest(saved_notes) from users where user_id =${user_id});`;
	// console.log(query1)
	// var s_n_query = `select * from notes where note_id = any(select saved_notes from users where user_id = ${user_id});`;
	var m_query = `select * from messages where reciever_id = ${user_id};`;
	var a_query = `select * from users where user_id = ${user_id};`;
	var u_query= `select * from users;`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(n_query),
            task.any(m_query),
			task.any(a_query),
			task.any(u_query)
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
