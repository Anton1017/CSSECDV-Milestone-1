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
            layout: 'index'
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
    getPosts: (req,res) => {
        db.findMany(Post, {}, '', function (posts){
            //console.log(posts);
            posts = posts.map(posts => posts.toJSON()); //formats 'posts' to JSON to remove mongoose schema formatting to edit the date on the next step
            posts.forEach(element => { //uses the moments module to format the date
                element.postingTime = moment(element.postingTime).fromNow();
            });
            posts = posts.reverse();
            //req.session.destroy();
            db.findOne(Profile, { username: req.session.username }, '', (header) =>{ //profile pic query
                res.render('home', { 
                    posts,
                    username: req.session.username,
                    headerProfileImg: header.profileImg,
                    pageTitle: 'Home', 
                    name: req.session.name,
                    layout: 'main' } );
            })
            //console.log(posts);
    });
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

    // Display edit profile page
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

    getViewPost: (req, res) => {
       
        //console.log("getViewPost req.query._id: " + req.query._id);
        db.findOne(Post, {_id: req.query._id}, '', function (post){
            //console.log("req.query._id again: " + req.query._id);
            //console.log("Printing the post: " + post);
            post = post.toJSON();
            post.postingTime = moment(post.postingTime).fromNow();
            db.findMany(Comment, {postid: req.query._id}, '', function (comments){
                db.updateOne(Post, {_id: req.query._id}, { $set: {numComments: comments.length} }, (err, res) => {
                    //console.log(res)
                }) //updates number of comments
                comments = comments.map(comments => comments.toJSON());
                comments.forEach(element => {
                    element.postingTime = moment(element.postingTime).fromNow();
                    element.isOwnComment = req.session.username === element.username
                });
                comments = comments.reverse();
                db.findOne(Profile, { username: req.session.username }, 'profileImg', (header) =>{ //profile pic query
                    res.render('view_post', { 
                        post,
                        comments,
                        username: req.session.username,
                        headerProfileImg: header.profileImg,
                        pageTitle: 'View Post', 
                        name: req.session.name,
                        layout: 'main', 
                        _id: req.query._id,
                        isOwnPost: (req.session.username === post.username)
                        
                    });
                }) 
            })
 
        })
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
        db.findMany(Post, postTitle, 'title _id postingTime', function(posts){
            //console.log("posts: " + posts);
            posts = posts.map(posts => posts.toJSON());
            posts.forEach(element => {
                element.contentType = 'post';
                element.postingTime = moment(element.postingTime).fromNow();
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
/*
db.findMany(Comment, {postid: post._id}, '', function (comments){
    //console.log(comments)
    comments = comments.map(comments => comments.toJSON());
    comments.forEach(element => {
        element.postTime = moment(element.postTime).fromNow();
    })
console.log(post);
    db.findOne(Profile, { username: req.session.username }, 'profileImg', (header) =>{ //profile pic query
        res.render('view_post', { 
            post,
            comments,
            username: req.session.username,
            profileImg: header.profileImg,
            pageTitle: 'View Post', 
            name: req.session.name,
            layout: 'main' 
        });
    })
}) */
