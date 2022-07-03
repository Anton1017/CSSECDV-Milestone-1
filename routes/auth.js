const router = require('express').Router();
const userController = require('../controllers/userController');
const controller = require('../controllers/controller');
const { registrationValidation, loginValidation } = require('../validators.js');
const { isPublic, isPrivate } = require('../middlewares/checkAuth');


// GET login to display login page
router.get('/login', isPublic, controller.getLogin);

// GET register to display registration page
router.get('/signup', isPublic, controller.getSignup);

// POST methods for form submissions
router.post('/signup', isPublic, registrationValidation, userController.registerUser);
router.post('/login', isPublic, loginValidation, userController.loginUser);

// logout
router.get('/logout', isPrivate, userController.logoutUser);

module.exports = router;