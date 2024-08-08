const router = require('express').Router();
const userController = require('../controllers/userController');
const controller = require('../controllers/controller');
const sqlcontroller = require('../controllers/sqlcontroller');
const sqluserController = require('../controllers/sqluserController');
const { registrationValidation, loginValidation } = require('../validators.js');


// middlewares
const { isPublic, isPrivate } = require('../middlewares/checkAuth');
const { logMiddleware, withErrorHandling } = require('../middlewares/loggingBase');
const nocache = require('../middlewares/invalidateCache');
const resetSessionTimeout = require('../middlewares/resetSessionTimeout');

const express = require('express');

router.use(nocache);
router.use(resetSessionTimeout);

// GET login to display login page
router.get('/login', isPublic, sqlcontroller.getLogin);

// GET register to display registration page
router.get('/signup', isPublic, sqlcontroller.getSignup);

// POST methods for form submissions
router.post('/signup', isPublic, registrationValidation, logMiddleware, sqluserController.registerUser);
router.post('/login', isPublic, loginValidation, logMiddleware, sqluserController.loginUser);

// logout
router.get('/logout', isPrivate, logMiddleware, sqluserController.logoutUser);

//temporary only
// router.post('/test-register', sqluserController.registerUser)
// router.post('/test-login', sqluserController.loginUser);

//for admin and user view
// router.get('/admin-home', isPublic, controller.getAdminHome);
// router.get('/user-home', isPublic, controller.getUserHome);

router.get('/home-page', isPublic, sqlcontroller.getPosts);

module.exports = router;