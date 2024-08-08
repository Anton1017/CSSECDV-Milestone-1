const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient()

const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');


const homeController = {
    //to submit a post
    submitPost: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // refactor this to the logger later
            const messages = errors.array().map((item) => item.msg);
            req.flash('error_msg', messages.join(' '));
            res.redirect('/');
        }
        if(req.files == null){
            await prisma.posts.create({
                data: {
                  UserID: req.session._userid, 
                  Title: req.body.title,
                  TextContent: req.body.textContent || "(Empty post body)",
                
                },
              });
            res.redirect('/');
        }
        const image = req.files.imageContent
        //console.log(image);
        let newname = uuidv1() + path.extname(image.name);
        fs.stat('./public/images/' + newname, function(err, data){
            if(err){
                image.name = newname;
            }
        });
        //console.log(req.files.imageContent)
        //console.log(path.resolve('./public/images', newname));
        image.mv(path.resolve('./public/images', newname), async (error) => {
            await prisma.posts.create({
                data: {
                  UserID: req.session._userid, 
                  Title: req.body.title,
                  TextContent: req.body.textContent || "(Empty post body)",
                  IMageContent: '/images/' + newname,
                },
              });
            res.redirect('/');
        }); 

    },
    submitComment: async (req, res) => {
        //validations anyone??
        if (req.files == null){
            await prisma.comment.create({
                data: {
                  UserID: req.session._userid, 
                  Title: req.body.title,
                  TextContent: req.body.textContent || "(Empty post body)",
                  ImageContent: '/images/' + newname,
                },
              });
              res.redirect('/view-post?_id=' + req.body._id)
        }
        const image = req.files.imageContent
        //console.log(req.files.imageContent)
        //console.log(path.resolve('./public/images', image.name));
        let newname = uuidv1() + path.extname(image.name);
        fs.stat('./public/images/' + newname, function(err, data){
            if(err){
                image.name = newname;
            }
        });
        image.mv(path.resolve('./public/images', newname), async (error) => {
            await prisma.comment.create({
                data: {
                  UserID: req.session._userid, 
                  Title: req.body.title,
                  TextContent: req.body.textContent || "(Empty post body)",
                  ImageContent: '/images/' + newname,
                },
              });
              res.redirect('/view-post?_id=' + req.body._id)
        });
    },
    editProfile: async (req, res) => {
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
    },
    editPost: async (req, res) => {
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
    },
    editComment: async (req, res) => {
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
       
    },
    deletePost: async (req, res) => {
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
    },
    deleteComment: (req, res) => {
        const deleteComments = prisma.comment.deleteMany({
            where: {
              CommenttID: req.query._id,
              UserID: req.session.username,
            },
          })
    },
    deleteProfile: async (req, res) => {
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
    },
    //to delete a post via admin
    adminDeletePost: async (req, res) => {
        console.log("We're at adminDeletePost");
        const { postId } = req.body;
        if (req.session.IsAdmin){
            try {
                await prisma.posts.update({
                    where: { PostID: postId },
                    data: { isDeleted: 1 },
                });
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error deleting post');
            }   
        }
        else
            res.status(403).send('Unauthorized');
    },

    //to pin a post via admin
    adminPinPost: async (req, res) => {
        console.log("We're at adminPinPost");
        const { postId } = req.body;
        if (req.session.IsAdmin){
            try {
                await prisma.posts.update({
                  where: { PostID: postId },
                  data: { isPinned: 1 },
                });
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error pinning post');
            }
        }
        else
            res.status(403).send('Unauthorized');
    },

    //to unpin a post via admin
    adminUnpinPost: async (req, res) => {
        console.log("We're at adminUnpinPost");
        const { postId } = req.body;
        if (req.session.IsAdmin){
            try {
                await prisma.posts.update({
                  where: { PostID: postId },
                  data: { isPinned: 0 },
                });
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error unpinning post');
            }
        }
        else
            res.status(403).send('Unauthorized');
    }
}

module.exports = homeController;