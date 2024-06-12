/******* Initializations ************/ 
var PORT = process.env.PORT || 3000;

const express = require('express');

const fs = require('fs');
const https = require('https');
const session = require('express-session');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

// For File Uploads
const fileUpload = require('express-fileupload');

// Post initializations. 1, the schema model, the path directory for file uploads, and a static resource folder //
const path = require('path'); // Local path directory for our static resource folder

// using handlebars 
const hbs = require('hbs');

// Using body parser for form input
const bodyParser = require('body-parser');

//Using multer for uploading multipart/form-data
const multer = require('multer');

// Using routes
const routes = require('./routes/routes.js');
const authRouter = require('./routes/auth');

// Using db functions
const db = require('./models/db.js');

db.connect();

/********* Using initializations **********/

// Initializing the express app
const app = express();

// Setting bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// Setting hbs and registering partials for rendering
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, '/views/layouts'),
  partialsDir: path.join(__dirname, '/views/partials')
  
}));

app.set('view engine', 'hbs');

// Setting dotenv and port
HOSTNAME = process.env.HOSTNAME;
mongoURI = process.env.DB_URL;

// Initialize data and static folder that our app will use
app.use(express.json()); // Use JSON throughout our app for parsing
app.use(express.urlencoded( {extended: true})); // Information consists of more than just strings
app.use(express.static('public')); // static directory name, meaning that the application will also refer to a folder named 'public'
app.use(express.static(__dirname + '/public'));//use to apply css
app.use(express.static(__dirname + '/'));//use to apply css
app.use(fileUpload()); // for fileuploading

// SSL options
const options = {
  key: fs.readFileSync('./SSL/localhost.key'),
  cert: fs.readFileSync('./SSL/localhost.cert')
};

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || mongoURI}),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 14 }
  }));

// Flash
app.use(flash());

// Global messages vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(flash());

app.use('/', routes); // Use the routes var to process webpages
app.use('/', authRouter); // Use the routes var to process registration/login

/** Setting server */


// var server = app.listen(PORT, function()
// {
//     console.log("Server is running at: " + "http://" + HOSTNAME + ":" + PORT);
// });

https.createServer(options, app).listen(PORT, () => {
  console.log("Server is running at: " + "https://" + HOSTNAME + ":" + PORT);
});