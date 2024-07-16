const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const options = {
	host: 'localhost',
	port: 3306,
	user: process.env.DB_HOST,
	password: process.env.DB_PASS,
	database: 'animatrix'
};


module.exports = session({
    store: new MySQLStore(options),
    secret: 'mySecret',
    saveUninitialized: false,
    resave: false,
    name: 'sessionId',
    cookie: {
      secure: true, // if true: only transmit cookie over https, in prod, always activate this
      httpOnly: true, // if true: prevents client side JS from reading the cookie
      maxAge: 1000 * 60 * 30, // session max age in milliseconds
      // explicitly set cookie to lax
      // to make sure that all cookies accept it
      // you should never use none anyway
      sameSite: 'lax',
      // session expires after 5 minutes
      expires: 1000 * 60 * 5,
    },
    rolling: true // reset expiration time on each response
  });