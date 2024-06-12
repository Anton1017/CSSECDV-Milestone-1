const router = require('express').Router();
const userController = require('../controllers/userController');
const controller = require('../controllers/controller');
const { registrationValidation, loginValidation } = require('../validators.js');
const { isPublic, isPrivate } = require('../middlewares/checkAuth');
const express = require('express');

const sqluserController = require('../controllers/sqluserController.js')
// GET login to display login page
router.get('/login', isPublic, controller.getLogin);

// GET register to display registration page
router.get('/signup', isPublic, controller.getSignup);

// POST methods for form submissions
router.post('/signup', isPublic, registrationValidation, sqluserController.registerUser);
router.post('/login', isPublic, loginValidation, sqluserController.loginUser);

// logout
router.get('/logout', isPrivate, userController.logoutUser);

//temporary only
router.post('/test-register', sqluserController.registerUser)
router.post('/test-login', sqluserController.loginUser);

//for admin and user view
router.get('/admin-home', isPublic, controller.getAdminHome);
router.get('/user-home', isPublic, controller.getUserHome);

module.exports = router;