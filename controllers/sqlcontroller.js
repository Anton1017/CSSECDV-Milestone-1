const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const moment = require('moment');
var path = require('path');
const { cp } = require('fs');
const { devNull } = require('os');
const { ExpressHandlebars } = require('express-handlebars');
// this was causing the warning for circular dependency
// controller requires routes but routes also requires controller
//const { post } = require('../routes/routes.js');
const sendErrorMessage = require('../middlewares/errorMessage');

const sqlcontroller = {

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

    getAdminHome: (req, res) => {
        res.render('home', {
            pageTitle: 'Home',
            layout: 'index'
        });
    },

    getAbout: async (req, res) => {
        about_user = await prisma.users.findUnique({
            where: {
                Username: req.session.username,
            },

        })
        res.render('about', { 
            username: req.session.username,
            headerProfileImg: about_user.ProfileImg,
            pageTitle: 'About Animatrix', 
            name: req.session.name,
            layout: 'main'
        });
    },

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
            const header = await prisma.usercredentials.findUnique({
                where: {
                    Username: req.session.username
                }
            });

            const user = await prisma.users.findUnique({
                where: {
                    Username: req.session.username
                }
            })

            const formattedDateCreated = moment(user.DateRegistered).format('YYYY-MM-DD');

            console.log(posts);
            // Render the home page
            res.render('home', { 
                posts,
                username: req.session.username,
                userID: req.session.userID,
                headerProfileImg: user?.ProfileImg,
                pageTitle: 'Home', 
                name: req.session.name,
                isAdmin: header.isAdmin,
                layout: 'main',
                dateCreated: formattedDateCreated,
                phoneNumber: user.ContactNumber
            });
    
        } catch (error) {
            console.error("Error in getPosts:", error);
            res.status(500).send("An error occurred while fetching posts");
        }
    },
    // Display view profile page
    getViewProfile: async (req, res) => {
        try{
            const user =  await prisma.users.findUnique({
                where: {
                    Username: req.session.username
                },
            })
            
            profile_render = { 
                username: req.session.username,
                profileUsername: req.session.username,
                headerProfileImg: user.ProfileImg,
                profileImg: user.ProfileImg,
                faveCharImg: user.ProfileImg,
                bio: user.Bio,
                faveQuote: user.FavoriteQuote,
                pageTitle: 'View Profile', 
                name: req.session.name,
                layout: 'main',
                isOwnProfile: true
            }
            if (req.session.username != req.query.username){
                about_user = await prisma.users.findUnique({
                    where: {
                        Username: req.query.username,
                    },
                })
                profile_render["ProfileImg"] = about_user.profileImg
                profile_render["FavoriteCharImg"] = about_user.profileImg
                profile_render["Bio"] = about_user.profileImg
                profile_render["FavoriteQuote"] = about_user.profileImg
            }
            res.render('view_profile', profile_render);
        } catch(error){
            let error_msg = "Error in getViewProfile: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    // Display edit profile page
    getEditProfile: async (req, res) => {
        const header =  await prisma.users.findUnique({
            where: {
                Username: req.session.username
            },
        })
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
    },

    getViewPost: async (req, res) => {
        const post =  await prisma.posts.findUnique({
            where: {
                PostID: req.query._id
            },
            include: {
                PostComments: true
            }
        })
        const user =  await prisma.users.findUnique({
            where: {
                Username: req.session.username
            },
           
        })
        comments = post.PostComments
        post = post.toJSON();
        post.postingTime = moment(post.postingTime).fromNow();
        comments = comments.map(comments => comments.toJSON());
        comments.forEach(element => {
            element.postingTime = moment(element.postingTime).fromNow();
            element.isOwnComment = req.session.username === element.username
        });
        comments = comments.reverse();
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
    },
    likePost: async (req, res) => {
        const user =  await prisma.users.findUnique({
            where: {
                Username: req.session.username
            },
        })
        const like_count =  await prisma.postlikes.count({
            where: {
                PostID: req.query._id
            }
        })
        const post_liked =  await prisma.postlikes.findUnique({
            where: {
                PostID: req.query._id,
                UserID: user.UserID
            },
        })
        // no record of the post is being liked
        if (post_liked == null){
            // create a record
            await prisma.postlikes.create({
                data: {
                    PostID: req.query._id,
                    UserID: user.UserID
                },
            })
            // need to figure out what to return 
            res.json({likes: like_count + 1});
        }
        // already liked the post, so it will reverse that
        await prisma.postlikes.delete({
            data: {
                PostLikeID: post_liked.PostLikeID
            },
        })
        res.json({likes: like_count - 1});

    },
    likeComment: async (req, res) => {
        const user =  await prisma.users.findUnique({
            where: {
                Username: req.session.username
            },
           
        })
        const like_count =  await prisma.commentlikes.count({
            where: {
                CommentID: req.query._id
            }
        })
        const comment_liked =  await prisma.commentlikes.findUnique({
            where: {
                CommentID: req.query._id,
                UserID: user.UserID
            }
        })
        // no record of the post is being liked
        if (comment_liked == null){
            // create a record
            await prisma.commentlikes.create({
                data: {
                    CommentID: req.query._id,
                    UserID: user.UserID
                },
            })
            // need to figure out what to return 
            res.json({likes: like_count + 1});
        }
        // already liked the post, so it will reverse that
        await prisma.commentlikes.delete({
            data: {
                CommentLikeID: post_liked.PostLikeID
            },
        })
        res.json({likes: like_count - 1});
    },
    searchPosts: async (req, res) => {

        let returnArray = [];
        let postTitle = {
            title: new RegExp(req.query.text, "i")
        }
        let user_name = {
            username: new RegExp(req.query.text, "ig")
        }
        const users =  await prisma.users.findMany({
            where: {
                Username: {
                    contains: req.query.text
                }
            },
           
        })
        const posts =  await prisma.posts.findMany({
            where: {
                Title: {
                    contains: req.query.text
                }
            },
           
        })
        posts = posts.map(posts => posts.toJSON());
        posts.forEach(element => {
            element.contentType = 'post';
            element.postingTime = moment(element.postingTime).fromNow();
        })
        Array.prototype.push.apply(returnArray, posts);
        profiles = profiles.map(profiles => profiles.toJSON());
        profiles.forEach(element => {
            element.contentType = 'profile';
        })
        Array.prototype.push.apply(returnArray, profiles);
        //console.log("returnArray: " + returnArray);
        res.json({ returnResult: returnArray });

      
        
    }
}


module.exports = sqlcontroller;