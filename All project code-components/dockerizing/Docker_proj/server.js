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
const session = require('express-session');
const bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
const { use } = require('chai');
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
	SESS_SECRET = 'Im a secret sshhh'
} = process.env

const dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.pg_db_nm,
	user: process.env.pg_user,
	password: process.env.pg_pswd
};
// in memory sessions
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

//connect-pg-simple to use db over in system memory (currently not working)
app.use(session({
	store: new (require('connect-pg-simple')(session))({
		conString: `postgres://${process.env.pg_user}:${process.env.pg_pswd}@db:5432/${process.env.pg_db_nm}`
	  // Insert connect-pg-simple options here
	}),
	secret: SESS_SECRET,
	resave: false,
	cookie: { maxAge: TWO_HOURS }, // 30 days
	saveUninitialized: false
	// Insert express-session options here
  }));

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

//Base setups
const s3 = new aws.S3();

const accessKeyId =  process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
// var user_id = undefined;

var [month, date, year] = new Date().toLocaleDateString().split("/");
var [hour, minute] = new Date().toLocaleTimeString().split(/:| /);
var Cdate = `${year}-${month}-${date}-${hour}-${minute}-GMT`;
// console.log(Cdate)

//setting up multer to use s3
const upload = multer({
  fileFilter: (req, file, cb) => {
		if (file.mimetype != "application/pdf") {
			// console.log("got in the filter error.")
			cb(new Error('The file must be a Pdf!'), false);
		}
		cb(null, true);
	},
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
            cb(null,`${uuid().substring(0,8)}-${Cdate}-${originalname}`);
        }
    })
});

//setup databse connection with promises
var db = pgp(dbConfig);

// // string for db sessions:
// const db = pgp(`postgresql://${process.env.pg_user}:${process.env.pg_pswd}@localhost:5432/${process.env.pg_db_nm}`);

//set path and view engine for templating
app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory


//middle-ware function for testing session authentication (valid user)
// app.use(function (req, res, next) {
//     // if user is authenticated in the session, carry on
//     if (req.isAuthenticated())
//         return next();
//     // if they aren't redirect them to the home page
//     res.redirect('/login');
// });


app.use((req,res,next) =>{
	const { userId } = req.session;
	if( userId ) {
		res.locals.user_id = userId;
	}
	next()
});

const redirectLogin = (req, res, next) => {
	if(!req.session.userId){
		res.clearCookie(SESS_NAME)
		res.redirect('/')
		// next()
	} else {
		next()
	}
}

const redirectHome = (req, res, next) => {
	if(req.session.userId){
		res.redirect('/user')
	} else {
		next()
	}
}


//  BELOW IS ALL ROUTING

// Login page
app.get(['/','/login'], redirectHome, (req, res) => {
	console.log(req.session)
	// console.log(res.locals)
	// const { userId } = req.session;
	// console.log(userId)
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page",
		error:false,
		message: ''
	});
});

app.post(['/','/login'], redirectHome, (req, res) => {
	console.log("I'm in the post login",req.session)
	const { user_id } = res.locals;
	var email = req.body.inputEmail.replace(/[^\w@.~!%*-_+]/gi,''); 
	var password = req.body.inputPassword.replace(/[^\w.~!%*-_+]/gi,'');
	let err = [];
	console.log(email)
	// console.log(password)
	if(!email){
		err.push({message: "Please enter your email."})
	}
	if(!password){
		err.push({message: 'Please enter your password.'})
	}
	if(err.length > 0){
		console.log("i tried to send it: ",err[0].message)
		return res.render('pages/login',{local_css:"signin.css",my_title:"Login Page",err});
	}

	var checkuserquery = `select user_id from users where email = '${email}' and pass_word = crypt('${password}',pass_word);`;
	console.log(checkuserquery)
	db.any(checkuserquery)
	.then(info => {
		console.log( "inside then of login: ",info)
		if (info.length) {
			// console.log(info)
			// console.log(info[0].user_id)
			// user_id = info[0].user_id;
			req.session.userId = info[0].user_id;
			console.log("about to load the user profile: ",req.session)
			return res.redirect('/user');
		}
		else {
			err.push({message: "Invalid credentials, please try again."})
			return res.render('pages/login',{local_css:"signin.css", my_title:"Login Page", error:false, message: '', err
		});
		}
	})
	.catch(error => {
		console.log(error)
		err.push({message: "There was a server error. Sorry."})
		return res.render('pages/login',{local_css:"signin.css", my_title:"Login Page", error:false, message: '', err
		});
	});

	// res.redirect('/login');
});



app.post('/remove_note', redirectLogin, function(req, res) {
  const { user_id } = res.locals;
  var note_id = req.body.Johnny;
  var rm_db = "DELETE from notes where note_id = '" + note_id + "';";
  var upd_users = `UPDATE users SET saved_notes = ARRAY_REMOVE(saved_notes, '${note_id}') WHERE user_id = ANY(SELECT user_id FROM users WHERE '${note_id}' = ANY(saved_notes)); `;

  console.log("This is what note_title is: ",req.body);
  console.log("currently looking at note: ",note_id);

	db.task('get-everything', task => {
    return task.batch([
      task.any(rm_db),
	  task.any(upd_users)
    ]);
  })
  .then(()=> { res.redirect('/user')
  })
  .catch(err => {
    console.log('error', err);
  });
});

app.get('/about', (req, res) => {
	res.render('pages/aboutNoteSquad',{
		my_title:"About Page"
	});
});

// Registration page
app.get('/register', redirectHome, (req, res) => {
	res.render('pages/registration',{
		my_title:"Registration Page",
		error: false,
		message: '',
	});
});

app.post('/register', redirectHome, (req, res) => {
	var new_user = req.body.username1.replace(/[^\w.~!%*-_+]/gi,'');
	var new_name = req.body.fullname.replace(/[^\w\s.~!%*-_+]/gi,'');
	var new_email = req.body.email1.replace(/[^@\w.~!%*-_+]/gi,'');
	var new_uni = req.body.university1;
	var new_psw = req.body.psw.replace(/[^\w.~!%*-_+]/gi,'');
	var new_cpsw = req.body.cpsw.replace(/[^\w.~!%*-_+]/gi,'');
	var new_acc_type = req.body.custSelect;

	let err = [];

	if(!new_user || !new_name || !new_email || !new_uni || !new_psw || !new_cpsw || !new_acc_type){
		err.push({message: "Please enter all fields."});
	}
	if(new_psw.length < 8){
		err.push({message: "Password should be at least 8 alphanumeric characters."})
	}
	if(new_psw.toLowerCase() == new_psw){
		err.push({message:"Passwords must have at least one capital."})
	}
	if(new_psw.replace(/[^\w]/gi,'') == new_psw){
		err.push({message:"Passwords must have at least one special character."})
	}
	if(new_psw !== new_cpsw){
		err.push({message:"Passwords do not match."})
	}
	if(new_acc_type.length < 0){
		err.push({message: "You must pick a role."})
	}
	if(err.length > 0){
		return res.render('pages/registration', {my_title:"Registration Page",error: false,message: '', err});
	}
	console.log(err)

	var insert_new_user = `INSERT INTO users(username, full_name, email, pass_word, account_type, is_admin, university)
	VALUES('${new_user}','${new_name}','${new_email}',crypt('${new_psw}', gen_salt('bf')),'${new_acc_type}','False','${new_uni}') RETURNING user_id;`;
	console.log("before then: ",insert_new_user)
	db.any(insert_new_user)
	.then(info => {
		// console.log(info);
		// console.log(info[0].user_id);
		req.session.userId = parseInt(info[0].user_id);
		return res.redirect('/user');
	})
	.catch(error => {
		// req.('error',error)
		console.log(error.message);
		if(error.message.includes('duplicate')){
			err.push({message: 'That username is not available. Please try again or choose another username.'})
			return res.render('pages/registration',{
				my_title:"Registration Page",
				error:false,
				message:'',
				err
			});
		}
		
		err.push({message: 'Something weird happened check log.'})
		console.log(error)
		return res.render('pages/registration',{
			my_title:"Registration Page",
			error:false,
			message:'',
			err
		});
	});
});


// Testing db at runtime to see if db outputs and connection works
// Now changing to make main route and fill site with user data
app.get('/user', redirectLogin, (req, res) => {
	const { user_id } = res.locals;
	console.log("this is user: ",user_id)
	var n_query = `select * from notes where note_id in (select unnest(saved_notes) from users where user_id ='${user_id}');`;
	var m_query = `select * from messages where reciever_id = '${user_id}';`;
	var a_query = `select * from users where user_id = '${user_id}';`;
	var u_query= `select * from users;`;
  var notes_query = `select * from notes where reported = 'TRUE';`;
	db.task('get-everything', task => {
        return task.batch([
            task.any(n_query),
            task.any(m_query),
            task.any(a_query),
            task.any(u_query),
            task.any(notes_query)
        ]);
    })
	.then(info => {
		return res.render('pages/user_profile', {
            my_title: "User Profile",
            note: info[0],
            mess: info[1],
            about: info[2],
            users: info[3],
            reported: info[4],
            error: false,
			message: ''
          });
	})
	.catch(error => {
        console.log("this is the message: ",error.stat);
		res.send("<h2>Something went horribly wrong! Please see an admin!</h2>")
	});
});



//Logout route that should clear session and redirect/render login page
app.post('/logout', redirectLogin,  (req, res) => {
	// user_id = 0;
	req.session.destroy(err=>{
		if(err) {
			return res.redirect('/user')
		}
		res.clearCookie(SESS_NAME)
		res.redirect('/login')
	})
	
});


//Upload path using multer for PDF to amazon s3
app.post('/upload', redirectLogin,  (req, res) => {
	const { user_id } = res.locals;
	// console.log("inside0 upload: ",req.body)
	// console.log("inside1 upload: ",req.files)
	const sUpload = upload.any('pdf_file');
	// console.log(sUpload)
	sUpload(req,res, function(err){
		// console.log("inside2 upload: ",req.body.major)
		// console.log("inside3 upload: ",req.files[0])
		var major = req.body.major;
		var	course = req.body.course;
		// console.log(req.file)
		// File size error
		if(err instanceof multer.MulterError){
			console.log("1: ",err)
			return res.send(`<h2>${err.message}</h2>`);		
		}
		// INVALID FILE TYPE, message return from fileFilter callback
		else if(err) {
			// console.log("2: ",err)
			return res.send(`<h2>${err.message}</h2>`);
			// return res.status(333).send(err);
		}
		// FILE NOT SELECTED
        else if (!req.files[0]) {
			// console.log("3: ",err)
			return res.send(`<h2>Please select a file!</h2>`)
        }
		 // SUCCESS
		else {
            console.log("File uploaded successfully!");
            console.log("File response", req.files);
			var f_path = req.files[0].location;
			var f_name = req.files[0].key;
			
			console.log("new path: ",f_path);
			var insert_new = `INSERT INTO notes(filepath, major, course_id, note_title, semester, reported, note_user_id)
			VALUES('${f_path}','${major}','${course}','${f_name}','${year}-${month}-${date}','False','${user_id}') RETURNING note_id;`;
			
			// res.end("Great we have a file!")
			console.log("looking at that insert: ",insert_new);
			db.any(insert_new)
			.then(info =>{
				console.log("information before update: ",info[0].note_id)
				var save_user = `UPDATE users SET saved_notes = array_append(saved_notes,'${parseInt(info[0].note_id)}') WHERE user_id = '${user_id}';`;
				console.log("1: ",save_user);
				db.any(save_user)
				.then(() => {
					console.log("2: ",save_user);
					return res.redirect('/user');
				}).catch(error => {
					if (error) {
						console.log(error);
						return res.send(error);
					  }
				})
				
			})
			.catch(error => {
				// if (error) {
					console.log(error);
					return res.send(error);
				//   }
			})
        }
	})
	
	// console.log(res)
	// return res.json({status: 'OK'})
});


app.post('/update', redirectLogin,  (req, res) => {
	const { user_id } = res.locals;

	console.log("full request body is: ",req.body)
	const { email, fullname, university } = req.body;
	var n_email = email.replace(/[^\w@.~!%*-_+]/gi,'');
	var n_fullname = fullname.replace(/[^\w\s.~!%*-_+]/gi,'');
	var n_university = university.replace(/[^\w\s.~!%*-_+]/gi,'');

	console.log("trying to get the deets: ",n_fullname,n_email,n_university)

	var save_user1 = `SELECT full_name,university,email from users where user_id = '${user_id}';`;

	db.any(save_user1)
	.then(info =>{
		console.log("inside first db call to get info: ",info)

		console.log("the new email length: ",n_email.length)
		if(n_fullname.length == 0){n_fullname = info[0].full_name;}

		if(n_university.length == 0){n_university = info[0].university;}
		
		if(n_email.length == 0){n_email = info[0].email;}
		

		save_user2 = `UPDATE users SET full_name='${n_fullname}',university='${n_university}',email='${n_email}' WHERE user_id = '${user_id}';`;
		db.any(save_user2)
		.then(() => {
			console.log("inside second db call for update: ",save_user2);
			return res.redirect('/user');
		}).catch(error => {
			if (error) {
				console.log(error);
				return res.send(error);
				}
		})
	})
	.catch(error => {
		    console.log("this is the error for update message: ",error);
			res.send("<h2>Something went horribly wrong! Please see an admin!</h2>")
	});
});


app.listen(PORT, () => console.log(
	`http://localhost:${PORT}`,'\nSeems all green!!'));