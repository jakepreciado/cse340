/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/intentionalError")
const utilities = require('./utilities/')
const accountRoute = require('./routes/accountRoute')
const jwt = require("jsonwebtoken");

/* ***********************
 * Middleware
 * ************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(utilities.checkJWTToken)

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use((req, res, next) => {
  const token = req.cookies.authToken; // Access cookies here
  // Check if the token exists and is valid
  if (token) {
    try {
      const decoded = jwt.verify(token, "your-secret-key");
      res.locals.loggedIn = true;
      res.locals.clientName = decoded.name; // Assuming the JWT contains the client's name
    } catch (error) {
      console.error("Invalid token:", error);
      res.locals.loggedIn = false;
      res.locals.clientName = null;
    }
  } else {
    res.locals.loggedIn = false;
    res.locals.clientName = null;
  }

  next();
});


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use(express.static('public'));

/* ***********************
 * Routes
 *************************/
// Intentional error route for testing
app.use(errorRoute)
app.use(static)
// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// Account routes
app.use("/account", accountRoute)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav(); // Navigation helper function
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});