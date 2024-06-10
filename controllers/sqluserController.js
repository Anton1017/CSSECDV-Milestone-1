const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


exports.registerUser = async (req, res) => {
  // 1. Validate request

  // 2. If VALID, find if username exists in users
  //      NEW USER (no results retrieved)
  //        a. Hash password
  //        b. Create user
  //        c. Redirect to login page
  //      EXISTING USER (match retrieved)
  //        a. Redirect user to login page with error message.

  // 3. If INVALID, redirect to register page with errors
  const errors = validationResult(req);

  if (!errors.isEmpty()){
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/signup');
  }

  const { username, email, password, full_name, contact_number } = req.body;
  const results = await prisma.users.findUnique({
    where: {
      Username: username,
    },
  })

  if (results!=null){
    console.log(results);
    // found a match, return to login with error
    req.flash('error_msg', 'Username already exists.');
    res.redirect('/signup');
  }

  const saltRounds = 10;


  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, async function(err, hashed) {
        try {
          await prisma.users.create({
              data: {
                Username: username,
                Email: email,
                Password: hashed,
                PasswordSalt: salt,
                ContactNumber: contact_number,
                ProfileImg: "profile.img",
                FullName: full_name
                //REMINDER: Add UserProfile
              },
            })
          
        } catch (error) {
          console.log(error)
          req.flash('error_msg', 'Could not create user. Please try again.');
          res.redirect('/signup');
        }
       
    });
  });

  
};

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
      res.redirect('/login');
    }

    bcrypt.compare(password, user.Password, (err, result) => {
      // passwords match (result == true)
      if (result) {
        // Update session object once matched!
        req.session.user = user._id;
        req.session.username = user.username;

        console.log(req.session);

        res.redirect('/');
      } else {
        // passwords don't match
        req.flash('error_msg', 'Incorrect password. Please try again.');
        res.redirect('/login');
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/login');
  }
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  }
};

//module.exports = userController;
