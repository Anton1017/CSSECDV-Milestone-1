const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const db = require('../models/db.js');
const Post = require('../models/Post.js');
const Comment = require('../models/Comment.js');
const Profile = require('../models/Profile.js');
const User = require('../models/User.js');


const moment = require('moment');
var path = require('path');
const { cp } = require('fs');
const { devNull } = require('os');
const { ExpressHandlebars } = require('express-handlebars');
// this was causing the warning for circular dependency
// controller requires routes but routes also requires controller
//const { post } = require('../routes/routes.js');

const controller = {

    // Display login page after receiving request from auth.js
    getLogin: (req, res) => {
        res.render('login', {
            pageTitle: 'Login',
            layout: 'index'
          });
    },

    // Display signup page after receiving request from auth.js
    getSignup: (req, res) => {
        res.render('signup', {
            pageTitle: 'Registration',
            layout: 'index'
        });
    },

    getAdminHome: (req, res) => {
        res.render('home', {
            pageTitle: 'Home',
            layout: 'index'
        });
    },

    getUserHome: (req, res) => {
        res.render('home', {
            pageTitle: 'Home',
            layout: 'index'
        });
    },

    getHome: (req, res) => {
        res.render('home', {
            pageTitle: 'Home',
            layout: 'main'
        });
    },

    getAbout: (req, res) => {
        db.findOne(Profile, { username: req.session.username }, 'profileImg', (header) =>{ //profile pic query
            res.render('about', { 
                username: req.session.username,
                headerProfileImg: header.profileImg,
                pageTitle: 'About Animatrix', 
                name: req.session.name,
                layout: 'main'
            });
        }) 
    },

    // Display home page
    getPosts: async (req,res) => {
        console.log("We're at getPosts");
        //console.log(req.session);
        try {
            // Fetch all posts
            let posts = await prisma.posts.findMany({
                orderBy: {
                    TimePosted: 'desc'
                },
                include: {
                    users: {
                        select: {
                            Username: true
                        }
                    }
                }
            });
    
            // Format the posts
            posts = posts.map(post => ({
                ...post,
                TimePosted: moment(post.TimePosted).fromNow(),
                Username: post.users.Username 
            }));
    
            // Fetch the user's profile
            const header = await prisma.users.findUnique({
                where: {
                    Username: req.session.username
                }
            });
            
            console.log(posts);
            // Render the home page
            res.render('home', { 
                posts,
                username: req.session.username,
                userID: req.session.userID,
                headerProfileImg: header?.profileImg,
                pageTitle: 'Home', 
                name: req.session.name,
                isAdmin: req.session.isAdmin,
                layout: 'main'
            });
    
        } catch (error) {
            console.error("Error in getPosts:", error);
            res.status(500).send("An error occurred while fetching posts");
        }
    },

    // Display view profile page
    getViewProfile: (req, res) => {
        // Accessing your own profile
        
        db.findOne(Profile, { username: req.session.username }, '', (profile) =>{ 
            // Viewing your own profile
            if (req.session.username === req.query.username)
            {
                res.render('view_profile', { 
                    username: req.session.username,
                    profileUsername: req.session.username,
                    headerProfileImg: profile.profileImg,
                    profileImg: profile.profileImg,
                    faveCharImg: profile.faveCharImg,
                    bio: profile.bio,
                    faveQuote: profile.faveQuote,
                    pageTitle: 'View Profile', 
                    name: req.session.name,
                    layout: 'main',
                    isOwnProfile: true
                });
            }
            // Viewing someone else's profile
            else 
            {
                db.findOne(Profile, { username: req.query.username }, '', (profile2) =>{ //profile pic query
                    res.render('view_profile', { 
                        username: req.session.username,
                        profileUsername: req.query.username,
                        headerProfileImg: profile.profileImg,
                        profileImg: profile2.profileImg,
                        faveCharImg: profile2.faveCharImg,
                        bio: profile2.bio,
                        faveQuote: profile2.faveQuote,
                        pageTitle: 'View Profile', 
                        name: req.session.name,
                        layout: 'main',
                        isOwnProfile: false
                    });
                });
            }
        });
             
    },
    getEditProfile: (req, res) => {
        db.findOne(Profile, { username: req.session.username }, '', (header) =>{ //profile pic query
            res.render('edit_profile', { 
                username: req.session.username,
                headerProfileImg: header.profileImg,
                faveCharImg: header.faveCharImg,
                bio: header.bio,
                faveQuote: header.faveQuote,
                pageTitle: 'Edit Profile', 
                name: req.session.name,
                layout: 'main' 
            });
        })
    },

    getViewPost: async (req, res) => {
        try {
            console.log(req.query._id);

            const post = await prisma.posts.findUnique({
                where: { PostID: req.query._id },
                include: {
                    users: {
                        select: {
                            Username: true
                        }
                    }
                }
            });

            console.log(post);

            if (post.IsDeleted) {
                return res.redirect('/home-page');
            }

            post.TimePosted = moment(post.TimePosted).fromNow();

            const comments = await prisma.postcomments.findMany({
                where: { PostID: req.query._id },
                orderBy: { TimeCommented: 'desc' },
                include: {
                    users: {
                        select: {
                            Username: true
                        }
                    }
                }
            });

            const formattedComments = comments.map(comment => ({
                ...comment,
                timeCommented: moment(comment.TimeCommented).fromNow(),
                isOwnComment: req.session.username === comment.CommenterID,
                CommenterUsername: comment.users.Username
            }));

            const header = await prisma.users.findUnique({
                where: { Username: req.session.username },
                select: { ProfileImg: true }
            });

            res.render('view_post', { 
                post,
                comments: formattedComments,
                username: req.session.username,
                headerProfileImg: header?.ProfileImg,
                pageTitle: 'View Post', 
                name: req.session.name,
                layout: 'main', 
                _id: req.query._id,
                isOwnPost: (req.session.userID === post.UserID)
            });
        } catch (error) {
            console.error("Error in getViewPost:", error);
            res.status(500).send("An error occurred while fetching post");
        }
    },


    likePost: (req, res) => {
        //console.log('controller.js likePost id: ' + req.query._id);
        var isLiked = false;

        db.findOne(Post, {_id: req.query._id}, '', function(post) {
            //console.log('likePost return ' + post);
            
            // Check if post has been liked by current user
            isLiked = post.likesBy.includes(req.session.username);

            if (isLiked) // Has already been liked, so will remove the like
            {
                db.updateOne(Post, {_id: req.query._id}, { $pull: {likesBy: req.session.username} }, (err, res) => {
                    //console.log(err);
                });

                res.json({likes: post.likesBy.length - 1});
            }
            else // Not yet liked, will add the like
            {
                db.updateOne(Post, {_id: req.query._id}, { $push: {likesBy: req.session.username} }, (err, res) => {
                    //console.log(err);
                });

                res.json({likes: post.likesBy.length + 1});
            }
        });
        
        
    },

    likeComment: (req, res) => {
        //console.log('controller.js likeComment id: ' + req.query._id);
        var isLiked = false;
        
        db.findOne(Comment, {_id: req.query._id}, '', function(comment) {
            //console.log('likeComment return ' + comment);

            // Check if comment has already been liked by current user
            isLiked = comment.likesBy.includes(req.session.username);

            if (isLiked)
            {
                db.updateOne(Comment, {_id: req.query._id}, { $pull: {likesBy: req.session.username} }, (err, res) => {
                    //console.log(err);
                });

                res.json({likes: comment.likesBy.length - 1});
            }
            else
            {
                db.updateOne(Comment, {_id: req.query._id}, { $push: {likesBy: req.session.username} }, (err, res) => {
                    //console.log(err);
                });

                res.json({likes: comment.likesBy.length + 1});
            }
        });
        
    },

    searchPosts: (req, res) => {

        let returnArray = [];
        let postTitle = {
            title: new RegExp(req.query.text, "i")
        }
        let user_name = {
            username: new RegExp(req.query.text, "ig")
        }
        db.findMany(Post, postTitle, 'title _id TimePosted', function(posts){
            //console.log("posts: " + posts);
            posts = posts.map(posts => posts.toJSON());
            posts.forEach(element => {
                element.contentType = 'post';
                element.TimePosted = moment(element.TimePosted).fromNow();
            })
            Array.prototype.push.apply(returnArray, posts);
            //console.log("returnArray: " + returnArray);
            db.findMany(Profile, user_name, 'username', function(profiles){
                profiles = profiles.map(profiles => profiles.toJSON());
                profiles.forEach(element => {
                    element.contentType = 'profile';
                })
                Array.prototype.push.apply(returnArray, profiles);
                //console.log("returnArray: " + returnArray);
                res.json({ returnResult: returnArray });
            })
        })
        
    }

}

module.exports = controller;