const { PrismaClient } = require('@prisma/client')
const { RateLimiterMemory } = require("rate-limiter-flexible");

const prisma = new PrismaClient()

const { validationResult,body } = require('express-validator');
const bcrypt = require('bcryptjs');

const opts = {
  points: 5, // Maximum of 5 points (5 attempts)
  duration: 5 * 60, // Points regenerated every 5 minutes
  blockDuration: 25 * 60, // Block for 25 minutes if points are depleted
};

const rateLimiter = new RateLimiterMemory(opts);


// body('email')
// .isEmail().withMessage('Enter a valid email address.')
// .matches(/^[a-zA-Z\d]+([_.-][a-zA-Z\d]+)*@[a-zA-Z\d]+[a-zA-Z\d\-]*(?<!-)(\.(?!-)(?=.*[A-Za-z].*[A-Za-z])[a-zA-Z\d\-]{2,}(?<!-))+$/).withMessage('Invalid email format.'),
// body('contact_number')
// .matches(/^\+63\d{10}$|^09\d{9}$/).withMessage('Phone number must either be +63 XXX XXX XXXX or 09XX XXX XXXX.'),
exports.registerUser = [
  // Add express-validator middleware for server-side validation
  body('email')
  .isEmail().withMessage('Enter a valid email address.')
  .matches(/^[a-zA-Z\d]+([_.-][a-zA-Z\d]+)*@[a-zA-Z\d]+[a-zA-Z\d\-]*(?<!-)(\.(?!-)(?=.*[A-Za-z].*[A-Za-z])[a-zA-Z\d\-]{2,}(?<!-))+$/).withMessage('Invalid email format.'),
  
  body('contact_number')
  .matches(/^\+63\d{10}$|^09\d{9}$/).withMessage('Phone number format must be "+63 XXX XXX XXXX" or "09XX XXX XXXX"'),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors.array().map((item) => item.msg);
      req.flash('error_msg', messages.join(' '));
      return res.redirect('/signup');
    }

    const { username, email, password, full_name, contact_number, imageContent } = req.body;
    const results = await prisma.users.findUnique({
      where: { Username: username },
    });

    if (results != null) {
      req.flash('error_msg', 'Username already exists.');
      return res.redirect('/signup');
    }

    const saltRounds = 10;

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      await prisma.users.create({
        data: {
          Username: username,
          Email: email,
          Password: hashedPassword,
          PasswordSalt: salt,
          ContactNumber: contact_number,
          ProfileImg: imageContent,
          FullName: full_name,
        },
      });

      req.flash('success_msg', 'You are now registered and can log in');
      return res.redirect('/login');
    } catch (error) {
      console.log(error);
      req.flash('error_msg', 'Could not create user. Please try again.');
      return res.redirect('/signup');
    }
  }
];

exports.loginUser = async (req, res) => {
  // 1. Validate request

  // 2. If VALID, find if email exists in users
  //      EXISTING USER (match retrieved)
  //        a. Check if password matches hashed password in database
  //        b. If MATCH, save info to session and redirect to home
  //        c. If NOT equal, redirect to login page with error
  //      UNREGISTERED USER (no results retrieved)
  //        a. Redirect to login page with error message

  // 3. If INVALID, redirect to login page with errors
  

  rateLimiter.consume(req.connection.remoteAddress) // consume 2 points
  .then(async (rateLimiterRes) => {
    // 1 points consumed
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const {
        username,
        password
      } = req.body;

      const user = await prisma.users.findUnique({
        where: {
          Username: username,
        },
      })
      if (user==null){
        req.flash('error_msg', 'No registered user with that username. Create a new account by clicking the link above.');
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.Password, (err, result) => {
        // passwords match (result == true)
        if (result) {
          // Update session object once matched!
          // req.session.user = user.UsersID;
          // req.session.username = user.Username;
          // console.log("Login Success");
          // console.log(req.session);
          
          res.redirect('/signup');
        } else {
          // passwords don't match
          req.flash('error_msg', 'Incorrect password. Please try again.');
          return res.redirect('/login');
        }
      });
    } else {
      const messages = errors.array().map((item) => item.msg);
      req.flash('error_msg', messages.join(' '));
      return res.redirect('/login');
    }
    
  })
  .catch((rateLimiterRes) => {
    // Not enough points to consume
    req.flash('error_msg', 'You have exceeded the login attempts. Please come back later.');
    return res.redirect('/login');
  });

  
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.redirect('/login');
    });
  }
};

//module.exports = userController;
