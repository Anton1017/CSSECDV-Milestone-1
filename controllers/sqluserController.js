const { PrismaClient } = require('@prisma/client')
const { RateLimiterMemory } = require("rate-limiter-flexible");
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient()

const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');

const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');

const opts = {
  points: 5000, // Maximum of 5 points (5 attempts)
  duration: 5 * 60, // Points regenerated every 5 minutes
  blockDuration: 25 * 60, // Block for 25 minutes if points are depleted
};
//Function checks if the file is an actual JPEG or PNG
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
      res.locals.logMessage = 'Validation failed'
      return res.redirect('/signup');
    }

    const { username, email, password, full_name, contact_number, imageContent } = req.body;  

    const results = await prisma.users.findUnique({
      where: { Username: username },
    });

    if (results != null) {
      req.flash('error_msg', 'User already exists.');
      res.locals.logMessage = 'User already exists'
      return res.redirect('/signup');
    }

    const saltRounds = 10;

    try {
      const form_files = req.files;
      let image = null;
      let newname = null;

      if(form_files != null && "imageContent" in form_files){
        const imageFile = req.files.imageContent;

        image = imageFile;
        newname = uuidv1() + path.extname(image.name);

        if (!validateFileType(imageFile)) {
          req.flash('error_msg', 'The file you selected is not a JPG or PNG image.');
          res.locals.logMessage = 'Invalid image file submission'
          return res.redirect('/signup');
        } else {
          fs.stat('./public/images/' + newname, function(err, data){
              if(err){
                  image.name = newname;
              }
          });
          image.mv(path.resolve('./public/images', newname), (error) => {
              if(error){
                req.flash('error_msg', 'Error on image upload.');
                res.locals.logMessage = 'Error on image file submission'
                return res.redirect('/signup');
              }
          });
        }
      }

      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const user = await prisma.users.create({
        data: {
          Username: username,
          Email: email,
          ContactNumber: contact_number,
          ProfileImg: (form_files != null && "imageContent" in form_files) ? '/images/' + newname : "/images/generic_profile_pic.png",
          FullName: full_name,
        },
      })
      const credentials = await prisma.usercredentials.create({
        data: {
          UserID: user.UserID,
          Username: user.Username,
          Password: hashedPassword,
          PasswordSalt: salt,
        },
      })
      req.flash('success_msg', 'You are now registered and can log in');
      res.locals.logMessage = 'User created'
      return res.redirect('/login');
    } catch (error) {
      console.log(error);
      req.flash('error_msg', 'Could not create user. Please try again.');
      res.locals.logMessage = 'Error on user creation'
      return res.redirect('/signup');
    }
  }
];

exports.loginUser = async (req, res) => {
 
  //rateLimiter.consume(req.connection.remoteAddress)
  //.then(async (rateLimiterRes) => {
    // 1 points consumed
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const {
        username,
        password
      } = req.body;

      const user = await prisma.usercredentials.findUnique({
        where: {
          Username: username,
        },
      })
      console.log(user)
      if (user==null){
        req.flash('error_msg', 'Incorrect credentials. Please try again.');
        res.locals.logMessage = 'Incorrect credentials'
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
          console.log("Login successful.")
          req.session.user = user.UserID;
          req.session.username = user.Username;
          req.session.IsAdmin = user.isAdmin;
          console.log(req.session.IsAdmin);
          if (user.isAdmin == 1)
          {
            console.log("is admin");
            res.locals.logMessage = `Login successful (admin) (userID: ${user.UserID})`
            return res.redirect('/home-page');
          }
          else if (user.isAdmin == 0)
          {
            console.log("is not admin");
            res.locals.logMessage = `Login successful (userID: ${user.UserID})`
            return res.redirect('/home-page');
          }
          //return res.redirect('/login');
        } else {
          // passwords don't match
          req.flash('error_msg', 'Incorrect credentials. Please try again.');
          res.locals.logMessage = 'Incorrect credentials'
          return res.redirect('/login');
        }
      });
    } else {
      const messages = errors.array().map((item) => item.msg);
      req.flash('error_msg', messages.join(' '));
      res.locals.logMessage = 'Validation failed'
      return res.redirect('/login');
    }
    
  //})
  //.catch((rateLimiterRes) => {
    // Not enough points to consume
    //req.flash('error_msg', 'You have exceeded the login attempts. Please come back later.');
    //return res.redirect('/login');
  //});

  
};

exports.logoutUser = (req, res) => {
  // Destroy the session and redirect to login page
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.setHeader("Surrogate-Control", "no-store");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Expires", "0");
       res.locals.logMessage = `User logged out (userID: ${UserID})`
      return res.redirect('/login');
    });
  }
};

//module.exports = userController;
