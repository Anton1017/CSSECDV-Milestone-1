const { PrismaClient } = require('@prisma/client')
const { RateLimiterMemory } = require("rate-limiter-flexible");
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient()

const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');

const opts = {
  points: 5, // Maximum of 5 points (5 attempts)
  duration: 5 * 60, // Points regenerated every 5 minutes
  blockDuration: 25 * 60, // Block for 25 minutes if points are depleted
};

function validateFileType(file) {
  const viewArray = new Uint8Array(file.data);

  // Check magic numbers for JPG and PNG
  const isJPG = viewArray[0] === 0xFF && viewArray[1] === 0xD8;
  const isPNG = viewArray[0] === 0x89 && viewArray[1] === 0x50 && viewArray[2] === 0x4E && viewArray[3] === 0x47;

  return isJPG || isPNG;
}

const rateLimiter = new RateLimiterMemory(opts);
exports.registerUser = [
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors.array().map((item) => item.msg);
      req.flash('error_msg', messages.join(' '));
      return res.redirect('/signup');
    }

    const { username, email, password, full_name, contact_number, imageContent } = req.body;

    const form_files = req.files;
    
    if(form_files != null && "imageContent" in form_files){
      const imageFile = req.files.imageContent;

      if (!validateFileType(imageFile)) {
        req.flash('error_msg', 'The file you selected is not a JPG or PNG image.');
        return res.redirect('/signup');
      }
    }

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
          ProfileImg: (form_files != null && "imageContent" in form_files) ? form_files.imageContent.name : "generic_profile_pic.png",
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
        req.flash('error_msg', 'Incorrect credentials. Please try again.');
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
          req.flash('error_msg', 'Login successful.');
          return res.redirect('/login');
        } else {
          // passwords don't match
          req.flash('error_msg', 'Incorrect credentials. Please try again.');
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
