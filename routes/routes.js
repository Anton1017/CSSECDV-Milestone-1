const router = require('express').Router();
// Use the controller to process requests
const controller = require('../controllers/controller.js');
const homeController = require('../controllers/homeController.js')

const { isPrivate } = require('../middlewares/checkAuth'); //requires users to be logged in to access these pages

const { postValidation } = require('../validators.js');

const Comment = require('../models/Comment.js');
const Post = require('../models/Post.js');
const Profile = require('../models/Profile.js');
const User = require('../models/User.js');


const path = require('path');


router.get('/', isPrivate, homeController.getPosts);

//duplicate route for home
router.get('/home', isPrivate, homeController.getPosts);


router.get('/view-profile', isPrivate, controller.getViewProfile);

router.get('/edit-profile', isPrivate, controller.getEditProfile);

router.get('/view-post', isPrivate, controller.getViewPost);

router.get('/like-post', isPrivate, controller.likePost);

router.get('/like-comment', isPrivate, controller.likeComment);

router.post('/submit-post', isPrivate, homeController.submitPost);

router.post('/comment-post', isPrivate, homeController.submitComment);

router.post('/save-editprofile', isPrivate, homeController.editProfile); 

router.post('/save-editpost', isPrivate, homeController.editPost);

router.get('/delete-post', isPrivate, homeController.deletePost);

router.get('/delete-comment', isPrivate, homeController.deleteComment);

router.get('/delete-profile' , isPrivate, homeController.deleteProfile);

router.post('/save-editComment' , isPrivate, homeController.editComment);



module.exports = router;