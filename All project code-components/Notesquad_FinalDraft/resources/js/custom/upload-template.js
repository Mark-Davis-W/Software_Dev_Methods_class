var multer = require('multer');
var aws = require('aws-sdk');
const express = require('express'); //Ensure our express framework has been added
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4; //used for a long string of unique characters (hash)

var app = express();
var s3 = new aws.S3();

var accessKeyId =  process.env.AWS_ACCESS_KEY;
var secretAccessKey = process.env.AWS_SECRET_KEY;

const upload = multer({
    storage: multS3({
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

app.use(express.static('public'));
app.post('/upload', upload.single('pdf_file'), (req, res) =>{
	return res.json({status: 'OK'})
});

app.listen(3000);
console.log('3000 is the magic port');










// aws.config.update({
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey
// });

// app.use(multer({ // https://github.com/expressjs/multer
//   dest: './public/uploads/', 
//   limits : { fileSize:100000 },
//   rename: function (fieldname, filename) {
//     return filename.replace('/\W+/g', '-').toLowerCase();
//   },
//   onFileUploadData: function (file, data, req, res) {
//     // file : { fieldname, originalname, name, encoding, mimetype, path, extension, size, truncated, buffer }
//     var params = {
//       Bucket: 'makersquest',
//       Key: file.name,
//       Body: data
//     };

//     s3.putObject(params, function (perr, pres) {
//       if (perr) {
//         console.log("Error uploading data: ", perr);
//       } else {
//         console.log("Successfully uploaded data to myBucket/myKey");
//       }
//     });
//   }
// }));

// app.post('/upload', function(req, res){
//     if(req.files.image !== undefined){ // `image` is the field name from your form
//         // res.redirect("/uploads"); // success
//         alert("succcess")
//     }else{
//         res.send("error, no file chosen");
//     }
// });