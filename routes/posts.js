// /post route
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose').set('debug',true);
const { check, validationResult } = require('express-validator/check');
//pagnation
const paginate = require('express-paginate');



//inport models
let Category = require('../models/category');
let Reply = require('../models/reply');
let Comment = require('../models/comment');
let Post = require('../models/post');
let User = require('../models/user');
let Tag = require('../models/tag');


// blog 
router.get('/', async (req, res, next) => {
 
  //  i blv you are using Node v7.6.0+ which has async/await support
  try {
 
    const [ results, itemCount ] = await Promise.all([
      Post.find({}).populate('author').populate('category').limit(req.query.limit).skip(req.skip).lean().sort('-created_at').exec(),
      Post.countDocuments({})
    ]);
 
    const pageCount = Math.ceil(itemCount / req.query.limit);
 
 	// if(req.xhr || req.accepts('json')==='json'){
    //   // inspired by Stripe's API response for list objects
    //   res.json({
    //     object: 'list',
    //     has_more: paginate.hasNextPages(req)(pageCount),
    //     data: results
    //   });
    // } else {
      res.render('category_view', {
        posts: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(5, pageCount, req.query.page),
        pageTitle: "All Posts", pageId : "all_post", layout: 'layouts/main'
      });
    // }
 
  } catch (err) {
    next(err);
  }
 
});


//view blog/post get Method
router.get('/view/:blogId', function(req, res, next){

    var blogId = req.params.blogId;
    Post.findById(mongoose.Types.ObjectId(blogId))
    .populate('author')
    .populate({path:'comments', populate:{path:"author"}})
    .populate('category')
    .populate('tags')
    // .populate({path:'comments', populate: {path: 'replies'}})
    .exec( function(err, post){
        if(err) 
            // res.redirect(303, '/posts');
            next(err);
        if(!post){
            req.flash('danger', 'Post not found.');
            // res.redirect(303, '/posts');
            next();
        }
        else{
            res.render('view', { pageTitle: post.title, pageId : "blog_view", layout: 'layouts/main', post:post, tags:post.tags })
            post.times_seen = post.times_seen + 1;
            post.save();
        }

      
                for(comment of post.comments){
                    console.log(comment.author)
                }
    });

  
});



//validateAddNewPostBody
const validateAddCommentBody = function(req,res,next){

    if(!req.user){ //not a logged in user
        req.checkBody('author').notEmpty().withMessage('Your name is required');
        req.checkBody('email').notEmpty().withMessage('Email is required');
        req.checkBody('email').isEmail().withMessage('Email is not valid');
    }

    req.checkBody('comment').notEmpty().withMessage('Comment is required');

  req.asyncValidationErrors().then(function() {
    // console.log("No error")
      next();
  }).catch(function(errors) {
    for (var i = 0; i < errors.length; i++) {
      req.flash('danger', errors[i].msg);
      }
      res.redirect('back');
  });
}

// post comment 
router.post('/comment', validateAddCommentBody, async(req, res, next)=>{

    let blogId = req.body.post_id;

    let post;
    // find post
    try{
        const post = await Promise.all([
            Post.findOne({_id:blogId})
        ]);
        if (!post) {
            next(err);
        }

        if(!req.user){ //not a logged in user
            email = req.body.email;
            name = req.body.author;
            await User.findOne({email:email}, (err, user)=>{
                console.log(user);
                if(!user){
                    user = new User({name, email, password:""});
                    user.save(err=>{
                        if(err) throw err;
                        console.log("innnnnn "+user);

                    });
                    
                }

                saveComment(req, res, user, post[0]/*//the promise on post returns an array*/)


            });
            

        }
        else{
            let author = req.user;
            saveComment(req, res, author, post[0]/*//the promise on post returns an array*/)
        }
        
    }
    catch (err) {
        next(err);
    }

   

});


function saveComment(req, res, author, post){
    comment = new Comment({
        author: author._id,
        comment: req.body.comment,
        post: post._id
    });

    comment.save(function(err){
        if(err) throw err;
        post.comments.addToSet(comment._id);
        
        post.save();
        res.redirect('/posts/view/'+post._id);
    });
}

//view blogs/posts based on tag get Method
router.get('/tags/:tagId', (req, res, next)=>{

    var tagId = req.params.tagId;
    Tag.findById(mongoose.Types.ObjectId(tagId))
    
    .exec( async(err, tag)=>{
        if(err) 
            // res.redirect(303, '/posts');
            next(err);
        if(!tag){
            req.flash('danger', 'Tag posts not found.');
            // res.redirect(303, '/posts');
            next();
        }
        else{
            const [ results, itemCount ] = await Promise.all([
              Post.find({"tags":tag._id}).populate('category').populate('author').limit(req.query.limit).skip(req.skip).lean().sort('-created_at').exec(),
              Post.countDocuments({"tags":tag._id})
            ]);
         
            const pageCount = Math.ceil(itemCount / req.query.limit);
         
            res.render('category_view', { 
                 posts:results,
                 pageCount,
                itemCount,
                pages: paginate.getArrayPages(req)(5, pageCount, req.query.page),
                pageTitle: tag.title, 
                pageId : "tag_view", layout: 'layouts/main',
             })
            
        }

      
                
    });

  
});


 
module.exports = router;