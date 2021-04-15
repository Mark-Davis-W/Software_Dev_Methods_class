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
const session = require('express-session');
const { Endpoint } = require('aws-sdk');
app.use(bodyParser.json());// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const pgp = require('pg-promise')(); //Create Database Connection

//time for session calculation
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
var user_id = 5;

var [month, date, year] = new Date().toLocaleDateString().split("/");
var [hour, minute] = new Date().toLocaleTimeString().split(/:| /);
var Cdate = `${year}-${month}-${date}${(parseInt(hour)-16)}-${minute}`;
// console.log(Cdate)


const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'notetakers',
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname });
        },
        key:(req, file, cb) => {
            var {originalname} = file;
			console.log(file)
			console.log(Cdate)
			// let [month, date, year] = new Date().toLocaleDateString().split("/");
			// let [hour, minute] = new Date().toLocaleTimeString().split(/:| /);
			// Cdate = `${year}-${month}-${date-1}-${parseInt(hour)-6}-${minute}`;
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
	// req.session.userId = 
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

app.post('/login', function(req, res) {

	var email = req.body.inputEmail;
	var password = req.body.inputPassword;
	console.log(email)
	console.log(password)
	
	var checkuserquery = `select user_id from users where email = '${email}' and pass_word = crypt('${password}',pass_word);`;
	console.log(checkuserquery)
	db.any(checkuserquery)
	.then(info => {
		if (info.length) {
			console.log(info)
			console.log(info[0].user_id)
			user_id = parseInt(info[0].user_id)
			res.redirect('/user')
		}
		else {
			throw Error
		}
	})
	.catch(error => {
		// $.alert({
		// 	title:'Alert!',
		// 	content:'Username or password is incorrect'
		// });
		res.redirect('/?e=' + encodeURIComponent('Incorrect username or password')
		console.log(error)
	});
});

// registration page
app.get('/register', function(req, res) {
	res.render('pages/registration',{
		my_title:"Registration Page"
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

app.post('/register', function(req, res) {
	res.render('pages/registration',{
		my_title:"Registration Page"
	});
});

app.post('/logout', function(req, res) {
	user_id = 0;
	res.redirect('/')
});

// 	res.render('pages/login',{
// 		local_css:"signin.css",
// 		my_title:"Login Page"
// 	});
// 	// res.write({'Hello':here});
// 	// res.end();

// })

app.post('/upload', function(req, res) {
	// console.log("inside0 upload: ",req.body)
	// console.log("inside2 upload: ",req.files)
	const sUpload = upload.any('pdf_file');
	// console.log(sUpload)
	sUpload(req,res, function(err){
		// console.log("inside1 upload: ",req.body.major)
		// console.log("inside2 upload: ",req.files[0])
		var major = req.body.major;
		var	course = req.body.course;
		// console.log(req.file)
		// File size error
		if(err instanceof multer.MulterError){
			// console.log("1: ",err)
			return res.send(err);		
		}
		else if(err) {
			// console.log("2: ",err)
			return res.status(333).send(err);
		}
		// FILE NOT SELECTED
        else if (!req.files) {
			// console.log("3: ",err)
			return res.status(330).send({ error: 'File was not selected for upload.' })
        }
		 // SUCCESS
		else {
            console.log("File uploaded successfully!");
            console.log("File response", req.files[0].location);
			var f_path = req.files[0].location;
			// console.log(req.files[0].location)
			// var major = 'major';
			// var course = 'course';
			var f_name = req.files[0].key;
			// var sem = myTime;
			// var user_id = '1';
			
			console.log("new path: ",f_path);
			var insert_new = `INSERT INTO notes(filepath, major, course_id, note_title, semester, reported, note_user_id)
			VALUES('${f_path}','${major}','${course}','${f_name}','${year}-${month}-${date}','False','${user_id}') RETURNING note_id;`;
			
			// res.end("Great we have a file!")
			console.log("looking at that insert: ",insert_new);
			db.any(insert_new)
			.then(info =>{
				console.log("information before update: ",info[0].note_id)
				var save_user = `UPDATE users SET saved_notes = array_append(saved_notes,${parseInt(info[0].note_id)}) WHERE user_id = ${user_id};`;
				console.log("1: ",save_user);
				db.any(save_user)
				.then(() =>{
					console.log("2: ",save_user);
					res.redirect('/user');
				}).catch(error => {
					if (error) {
						console.log(error);
						return res.send(error);
					  }
				})
				
			})
			.catch(error => {
				if (error) {
					console.log(error);
					return res.send(error);
					// console.log(err.response.data);
					// console.log(err.response.status);
				  }
			})
        }
	})
	// console.log(res)
	// return res.json({status: 'OK'})
});

function uploadFiles(req, res,next) {
    // console.log(req.body);
    // console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
	next();
}

app.listen(PORT, () => console.log(
	`http://localhost:${PORT}`,'\nSeems all green!!'));
