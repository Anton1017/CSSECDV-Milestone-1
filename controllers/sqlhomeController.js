const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const prisma = new PrismaClient()
const { validationResult } = require('express-validator');
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const sendErrorMessage = require('../middlewares/errorMessage');
function validateFileType(file) {
    const viewArray = new Uint8Array(file.data);

    // Check magic numbers for JPG and PNG
    const isJPG = viewArray[0] === 0xFF && viewArray[1] === 0xD8;
    const isPNG = viewArray[0] === 0x89 && viewArray[1] === 0x50 && viewArray[2] === 0x4E && viewArray[3] === 0x47;

    return isJPG || isPNG;
}

  const homeController = {
    //to submit a post
    submitPost : async (req, res) => {
        try{
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                const messages = errors.array().map((item) => item.msg);
                req.flash('error_msg', messages.join(' '));
                return res.redirect('/');
            }
        
            // Check if user is authenticated
            if (!req.session.user) {
                req.flash('error_msg', 'You must be logged in to post.');
                return res.redirect('/login');
            }
        
            try {
                let ImageContent = null;
        
                if (req.files && req.files.imageContent) {
                    const image = req.files.imageContent;
        
                    // Check file type using magic numbers
                    if (!validateFileType(image)) {
                        req.flash('error_msg', 'Invalid image type');
                        return res.redirect('/');
                    }
        
                    // Validate file size
                    if (image.size > MAX_IMAGE_SIZE) {
                        req.flash('error_msg', 'Image size exceeds the limit of 5MB');
                        return res.redirect('/');
                    }
        
                    // Sanitize file name
                    const ext = path.extname(image.name);
                    const newname = uuidv1() + ext;
                    const imagePath = path.resolve('./public/images', newname);
        
                    // Ensure the directory exists
                    if (!fs.existsSync(path.dirname(imagePath))) {
                        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
                    }
        
                    await image.mv(imagePath);
        
                    ImageContent = '/images/' + newname;
                }
        
                await prisma.posts.create({
                    data: {
                        Title: req.body.title.trim(),
                        TextContent: req.body.textContent.trim() || "(Empty post body)",
                        ImageContent,
                        UserID: req.session.user
                    }
                });
                res.locals.logMessage = `UserID: ${req.session.user} created a post titled ${req.body.title.trim()}`
                res.redirect('/');
            } catch (error) {
                console.error("Error in submitPost:", error);
                res.status(500).send("An error occurred while submitting the post");
                res.locals.logMessage = `UserID: ${req.session.user} has an error in submitting a post`
            }
        } catch(error){
            let error_msg = "Error in submitPost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    submitComment: async (req, res) => {
        try{
            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                const messages = errors.array().map((item) => item.msg);
                req.flash('error_msg', messages.join(' '));
                return res.redirect('/');
            }
            // Check if user is authenticated
            if (!req.session.user) {
                req.flash('error_msg', 'You must be logged in to post.');
                return res.redirect('/login');
            }
        
            try {
                let ImageContent = null;
        
                if (req.files && req.files.imageContent) {
                    const image = req.files.imageContent;
        
                    // Check file type using magic numbers
                    if (!validateFileType(image)) {
                        req.flash('error_msg', 'Invalid image type');
                        return res.redirect('/');
                    }
        
                    // Validate file size
                    if (image.size > MAX_IMAGE_SIZE) {
                        req.flash('error_msg', 'Image size exceeds the limit of 5MB');
                        return res.redirect('/');
                    }
        
                    // Sanitize file name
                    const ext = path.extname(image.name);
                    const newname = uuidv1() + ext;
                    const imagePath = path.resolve('./public/images', newname);
        
                    // Ensure the directory exists
                    if (!fs.existsSync(path.dirname(imagePath))) {
                        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
                    }
        
                    await image.mv(imagePath);
        
                    ImageContent = '/images/' + newname;
                }
        
                await prisma.postcomments.create({
                    data: {
                    PostID: req.body._id,
                    CommenterID: req.session.user, 
                    TextContent: req.body.textContent || "(Empty post body)",
                    ImageContent,
                    },
                });
                res.locals.logMessage = `UserID: ${req.session.username} created a comment on post ${req.body._id}`
                res.redirect('/view-post?_id=' + req.body._id)
            } catch (error) {
                console.error("Error in submitComment:", error);
                res.status(500).send("An error occurred while submitting the comment");
                res.locals.logMessage = `UserID: ${req.session.user} has an error in submitting a comment`
            }
        } catch(error){
            let error_msg = "Error in submitComment: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    editProfile: async (req, res) => {
        try{
            filter = {
                UserID: req.session.username,
            }
            updates = {
                Bio: req.body.bio,
                FavQuote: req.body.faveQuote,
            }
            const profImg = req.files.profileImg
            let newname = uuidv4() + path.extname(profImg.name)
            profImg.mv(path.resolve('./public/images', newname), async (error) =>{
                updates[profileImg] = '/images/' + newname
                await prisma.userprofile.update({
                    where: filter,
                    data: updates
                }) 
            })
            const CharImg = req.files.faveCharImg
            let newname2 = uuidv4() + path.extname(CharImg.name)
            CharImg.mv(path.resolve('./public/images', newname2), async (error) =>{
                updates[faveCharImg] = '/images/' + newname2
                await prisma.userprofile.update({
                    where: filter,
                    data: updates
                })
            })
            await prisma.userprofile.update({
                where: filter,
                data: updates,
            })
            res.redirect('/view-profile?username=' + req.session.username)
        } catch(error){
            let error_msg = "Error in editProfile: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    editPost: async (req, res) => {
        try{
            filter = {
                PostID: req.body._id,
                UserID: req.session.username,
            }
            updates = {
                TextContent: req.body.textContent || "(Empty post body)",
            }
            const newImg = req.files.imageContent;
            let newname = uuidv1() + path.extname(newImg.name);
            newImg.name = newname;
            
            newImg.mv(path.resolve('./public/images', newname), async (error) =>{
                updates["ImageContent"] = '/images/' + newname
                await prisma.posts.update({
                    where: filter,
                    data: update
                }) 
            });
            await prisma.posts.update({
                where: filter,
                data: update
            })
            res.redirect('/view-post?_id=' + req.body._id);
        } catch(error){
            let error_msg = "Error in editPost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    editComment: async (req, res) => {
        try{
            filter = {
                CommentID: req.body._id,
                UserID: req.session.username,
            }
            updates = {
                TextContent: req.body.textContent,
            }
            if (req.body.textContent != '')
            {   
                try{
                    const newImg = req.files.imageContent;
                    let newname = uuidv1() + path.extname(newImg.name);
                    newImg.name = newname;
                    
                    newImg.mv(path.resolve('./public/images', newname), async (error) => {
                        updates["ImageContent"] =  '/images/' + newname 
                        await prisma.comment.update({
                            where: filter,
                            data: update
                        })
                    });
                }
                catch(e){
        
                }
                await prisma.comment.update({
                    where: filter,
                    data: update
                })
            }
            queries ={
                CommentID: req.body._id
            }
            comment_results = await prisma.comment.findUnique({
                where: queries
            })
            res.redirect('/view-post?_id=' + comment_results.PostID);
        } catch(error){
            let error_msg = "Error in editComment: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    deletePost: async (req, res) => {
        try{
            const deleteComments = prisma.comment.deleteMany({
                where: {
                  PostID: req.query._id,
                },
              })
              
            const deletePosts = prisma.posts.delete({
                where: {
                    PostID: req.query._id,
                    UserID: req.session.username,
                },
            })
            const transaction = await prisma.$transaction([deletePosts, deleteComments])
        } catch(error){
            let error_msg = "Error in deletePost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    deleteComment: (req, res) => {
        try{
            const deleteComments = prisma.comment.deleteMany({
                where: {
                  CommenttID: req.query._id,
                  UserID: req.session.username,
                },
            })
        } catch(error){
            let error_msg = "Error in deleteComment: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    deleteProfile: async (req, res) => {
        try{
            var conditions = {
                UserID: req.session.username
            }
            const deleteUser = prisma.users.delete({
                where: conditions,
            })
            const deleteProfile = prisma.userprofile.delete({
                where: conditions,
            })
            const deleteComments = prisma.comment.deleteMany({
                where: conditions,
              })
              
            const deletePosts = prisma.posts.deleteMany({
                where: conditions,
            })
            const transaction = await prisma.$transaction([deleteUser, deleteProfile, deletePosts, deleteComments])
        } catch(error){
            let error_msg = "Error in deleteProfile: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    //to delete a post via admin
    adminDeletePost: async (req, res) => {
        try {
            const { postId } = req.body;
            if (req.session.IsAdmin){
                await prisma.posts.update({
                    where: { PostID: postId },
                    data: { isDeleted: 1 },
                });
                res.locals.logMessage = `Admin: ${req.session.user} deleted a post ${postId}`
                res.redirect('/');
            }
            else
                {
                    res.status(403).send('Unauthorized');
                    res.locals.logMessage = `User is not authorized to delete a post`
                }
        } catch (error) {
            res.locals.logMessage = `Admin: ${req.session.user} has an error in deleting a post ${postId}`
            let error_msg = "Error in adminDeletePost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }   
    },

    //to pin a post via admin
    adminPinPost: async (req, res) => {
        try {
            const { postId } = req.body;
            if (req.session.IsAdmin){
                await prisma.posts.update({
                    where: { PostID: postId },
                    data: { isPinned: 1 },
                });
                res.locals.logMessage = `Admin: ${req.session.user} pin a post ${postId}`
                res.redirect('/');
            }
            else
            {
                res.status(403).send('Unauthorized');
                res.locals.logMessage = `User is not authorized to pin a post`
            }
                
        } catch (error) {
            res.locals.logMessage = `Admin: ${req.session.user} has an error in pinning a post ${postId}`
            let error_msg = "Error in adminPinPost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    },

    //to unpin a post via admin
    adminUnpinPost: async (req, res) => {
        try {
            const { postId } = req.body;
            if (req.session.IsAdmin){
                await prisma.posts.update({
                    where: { PostID: postId },
                    data: { isPinned: 0 },
                });
                res.locals.logMessage = `Admin: ${req.session.user} unpin a post ${postId}`
                res.redirect('/');
            }
            else
            {
                res.status(403).send('Unauthorized');
                res.locals.logMessage = `User is not authorized to unpin a post`
            }
        } catch (error) {
            res.locals.logMessage = `Admin: ${req.session.user} has an error in pinning a post ${postId}`
            let error_msg = "Error in adminUnpinPost: " + error
            console.error(error_msg);
            sendErrorMessage(error_msg, res);
        }
    }
}

module.exports = homeController;