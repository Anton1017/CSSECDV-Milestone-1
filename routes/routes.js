const router = require('express').Router();
// Use the controller to process requests
const controller = require('../controllers/controller.js');
const homeController = require('../controllers/homeController.js')

const { isPrivate } = require('../middlewares/checkAuth'); //requires users to be logged in to access these pages
const nocache = require('../middlewares/invalidateCache');
const resetSessionTimeout = require('../middlewares/resetSessionTimeout');

const { postValidation } = require('../validators.js');

const Comment = require('../models/Comment.js');
const Post = require('../models/Post.js');
const Profile = require('../models/Profile.js');
const User = require('../models/User.js');
const sqlhomeController = require('../controllers/sqlhomeController');
const sqlcontroller = require('../controllers/sqlcontroller');
const { logMiddleware, withErrorHandling } = require('../middlewares/loggingBase');
const path = require('path');

router.use(nocache);
router.use(resetSessionTimeout);

router.get('/', isPrivate, sqlcontroller.getPosts);

//duplicate route for home
router.get('/home', isPrivate, sqlcontroller.getPosts);


router.get('/view-profile', isPrivate, logMiddleware, sqlcontroller.getViewProfile);

router.get('/edit-profile', isPrivate, controller.getEditProfile);

router.get('/view-post', isPrivate,logMiddleware, sqlcontroller.getViewPost);

router.get('/like-post', isPrivate, controller.likePost);

router.get('/like-comment', isPrivate, controller.likeComment);

router.post('/submit-post', isPrivate, logMiddleware, postValidation, sqlhomeController.submitPost);

router.post('/admin/delete-post', isPrivate, logMiddleware, sqlhomeController.adminDeletePost);

router.post('/admin/pin-post', isPrivate, logMiddleware, sqlhomeController.adminPinPost);

router.post('/admin/unpin-post', isPrivate, logMiddleware, sqlhomeController.adminUnpinPost);

router.post('/comment-post', isPrivate, homeController.submitComment);

router.post('/save-editprofile', isPrivate, homeController.editProfile); 

router.post('/save-editpost', isPrivate, postValidation, homeController.editPost);

router.get('/delete-post', isPrivate, homeController.deletePost);

router.get('/delete-comment', isPrivate, homeController.deleteComment);

router.get('/delete-profile' , isPrivate, homeController.deleteProfile);

router.post('/save-editComment' , isPrivate, homeController.editComment);

router.get('/search-posts', isPrivate, controller.searchPosts);

router.get('/about', isPrivate, controller.getAbout);   

module.exports = router;