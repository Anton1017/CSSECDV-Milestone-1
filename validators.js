const { body } = require('express-validator');

const registrationValidation = [

    // Uname should not be empty
  body('username').not().isEmpty().withMessage("Username is required.")
  .isLength( {min: 3, max: 16} ).withMessage("Username must be between 3 and 16 characters.")
  .matches(/^[^'"]*$/).withMessage("Place a proper username"),

  // Email should not be empty and must be a valid email
  body('email').not().isEmpty().withMessage("Email is required.")
  // .isEmail().withMessage("Please provide a valid email.")
  .matches(/^[a-zA-Z\d]+([_.-][a-zA-Z\d]+)*@[a-zA-Z\d]+[a-zA-Z\d\-]*(?<!-)(\.(?!-)(?=.*[A-Za-z].*[A-Za-z])[a-zA-Z\d\-]{2,}(?<!-))+$/).withMessage('Please provide a valid email.'),
  
  body('full_name').not().isEmpty().withMessage("Full name is required.")
  .matches(/^[A-Za-z]+(?:\s[A-Za-z]+)+$/).withMessage("Please enter your full name"),

  body('contact_number').not().isEmpty().withMessage("Contact Number is required.")
  .matches(/^\+63\d{10}$|^09\d{9}$/).withMessage('Phone number format must be "+63 XXX XXX XXXX" or "09XX XXX XXXX"'),

  // Password needs to be min 8 chars and follows security guideline
  body('password').isStrongPassword().withMessage("Password must be at least 8 characters long, and a combination of upper and lowercase characters, numbers and symbols.")
  .isLength({max: 60}).withMessage("Password length should be up to 60 characters"),

  // Confirm Password needs to be min 6 chars AND must match the req.body.password field
  body('confirmPass').isStrongPassword().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match.");
      }
      return true;
    })
];

const loginValidation = [
  // Email should not be empty and must be a valid email
  body('username').not().isEmpty().withMessage("Username is required."),

  // Password should not be empty and needs to be min 6 chars
  body('password').not().isEmpty().withMessage("Password is required.")
];

const postValidation = [
  // Post title should not be empty
  body('title').isLength( {min: 1, max: 50} ).withMessage("Post title must be between 1 and 50 characters.")
];


module.exports = { registrationValidation, loginValidation, postValidation };