/*
 * 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
 * in this JS file.
 * */
const express = require("express");
const session = require("express-session");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const FlashMessenger = require("flash-messenger");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const passport = require("passport");

/*
// var admin = require('firebase-admin');
var firebase = require("firebase/app");

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
	apiKey: "AIzaSyChyx6R5wRsaoNUiBZ7VJoxRp4PJyKMAZw",
    authDomain: "ecommerce-fsdp.firebaseapp.com",
    databaseURL: "https://ecommerce-fsdp.firebaseio.com",
    projectId: "ecommerce-fsdp",
    storageBucket: "ecommerce-fsdp.appspot.com",
    messagingSenderId: "548076658656",
    appId: "1:548076658656:web:38072e836b6ed8d41fd585",
    measurementId: "G-5VHT5HKZZ7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// // Initialize Firebase
// firebase.initializeApp();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://ecommerce-fsdp.firebaseio.com"
// });

// /*
// var refreshToken; // Get refresh token from OAuth2 flow

// admin.initializeApp({
//   credential: admin.credential.refreshToken(refreshToken),
//   databaseURL: 'https://ecommerce-fsdp.firebaseio.com'
// });*/

// console.log(admin.app().name);  // '[DEFAULT]'*/

// Library to use MySQL to store session objects
const MySQLStore = require("express-mysql-session");
const db = require("./config/db"); // db.js config file

// Bring in database connection
const mySqlDatabase = require("./config/DBConnection");

// Connects to MySQL database
mySqlDatabase.setUpDB(false); // To set up database with new tables set (true)

// Passport Config
const authenticate = require("./config/passport");
//authenticate.localStrategy(passport);
authenticate.MultiStrategy(passport);

/*
 * Loads routes file main.js in routes directory. The main.js determines which function
 * will be called based on the HTTP request and URL.
 */
const mainRoute = require("./routes/main_route");
const userRoute = require("./routes/user_route");
const adminRoute = require("./routes/admin_route");
const merchantRoute = require("./routes/merchant_route");
const apiRoute = require("./routes/api_route");
const testRoute = require("./routes/test_route");
// const smsRoute = require('./routes/sms_route');
const authRoute = require("./routes/auth_route");
const deliveryRoute = require("./routes/delivery_route");
const masterRoute = require("./routes/mastercontrol_route");
const queryRoute = require("./routes/query_route");

// Bring in Handlebars Helpers here
// Copy and paste this statement only!!
const { formatDate, replaceEmptyString, radioCheck } = require("./helpers/hbs");
const { if_Equal } = require("./helpers/hbs_conditional_operator");

/*
 * Creates an Express server - Express is a web application framework for creating web applications
 * in Node JS.
 */
const app = express();

// Handlebars Middleware
/*
 * 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
 * from Node JS.
 *
 * 2. Node JS will look at Handlebars files under the views directory
 *
 * 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
 *
 * */
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      formatDate: formatDate,
      if_Equal: if_Equal,
      replaceEmptyString: replaceEmptyString,
      radioCheck: radioCheck,
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "main", // Specify default template views/layout/main.handlebar
  })
);
app.set("view engine", "handlebars");

// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride("_method"));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// To store session information. By default it is stored as a cookie on browser
app.use(
  session({
    key: "fsdp_session",
    secret: "tojiv",
    store: new MySQLStore({
      host: db.host,
      port: 3306,
      user: db.username,
      password: db.password,
      database: db.database,
      clearExpired: true,
      // How frequently expired sessions will be cleared; milliseconds:
      checkExpirationInterval: 900000,
      // The maximum age of a valid session; milliseconds:
      expiration: 900000,
    }),
    resave: false,
    saveUninitialized: false,
  })
);

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Error message display
app.use(flash());
app.use(FlashMessenger.middleware);

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Place to define global variables - not used in practical 1
app.use(function (req, res, next) {
  next();
});

// Use Routes
/*
 * Defines that any root URL with '/' that Node JS receives request from, for eg. http://localhost:5000/, will be handled by
 * mainRoute which was defined earlier to point to routes/main.js
 * */
app.use("/", mainRoute); // mainRoute is declared to point to routes/main.js
// This route maps the root URL to any path defined in main.js
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/merchant", merchantRoute);
app.use("/test", testRoute);
app.use("/auth", authRoute);
app.use("/delivery", deliveryRoute);
app.use("/api", apiRoute);
app.use("/mastercontrol", masterRoute);
app.use("/query", queryRoute)

// app.use('/sms', smsRoute);

//error 404 and 500 handling
app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }
});
app.use(function (req, res, next) {
	res.status(500);
  
	// respond with html page
	if (req.accepts("html")) {
	  res.render("500", { url: req.url });
	  return;
	}
  });
  
/*
 * Creates a unknown port 5000 for express server since we don't want our app to clash with well known
 * ports such as 80 or 8080.
 * */
const PORT = 5000;

//const PORT = process.env.PORT || 3000 - for heroku

// Starts the server and listen to port 5000
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
