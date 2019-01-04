// /post route
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose').set('debug',true);
const { check, validationResult } = require('express-validator/check');
//pagnation
const paginate = require('express-paginate');

//form&files handling
// var formidable = require('formidable');
// var fs = fs = require("fs");
var  path = require("path");
// var  sharp = require("sharp");


const multer = require('multer');
// Set The Storage Engine
var obj = {};
var image_storage = multer.diskStorage({
  destination: './public/uploads/blogs/',
  filename: filename
});

var video_storage = multer.diskStorage({
  destination: './public/uploads/videos/',
  filename: filename
});


//functin to get filename
function filename(req, file, cb){
    var ext = path.extname(file.originalname);
    var file_name = Date.now()+ext;
    obj.file_name = file_name;
    
    cb(null,file_name);
};

// Init image Upload
var upload_image = multer({
  storage: image_storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    // console.log('res'+res)
    checkFileType(file,req, "image", cb);
  }
}).single('image');

// Init video Upload
var upload_video = multer({
  storage: video_storage,
  limits:{fileSize: 10000000},
  fileFilter: function(req, file, cb){
    // console.log('res'+res)
    checkFileType(file,req, "video", cb);
  }
}).single('image');//yeah image is the name but it holds video

// Check File Type
function checkFileType(file, req, type, cb){
    if (type == "video") {
        // Allowed ext
        filetypes = /mp4|avi|mpeg|flv|mov|wmv/;
    }else{
        // Allowed ext
        filetypes = /jpeg|jpg|png|gif/;
    }
  
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null,true);
  } else {
    obj.file_name = '';
    if (type == "video") {
        req.flash("danger","File upload only supports mp4, mov, wmv, flv, avi");
    }else{
        req.flash("danger","File upload only supports jpeg, jpg, png, gif");
        
    }return cb(null,false)
  }
}


//inport models
let Category = require('../models/category');
let Reply = require('../models/reply');
let Comment = require('../models/comment');
let Post = require('../models/post');
let User = require('../models/user');


// blog 
router.get('/', async (req, res, next) => {
 
  //  i blv you are using Node v7.6.0+ which has async/await support
  try {
 
    const [ results, itemCount ] = await Promise.all([
      Post.find({}).populate('category').limit(req.query.limit).skip(req.skip).lean().sort('-created_at').exec(),
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
    // .populate('author')
    .populate('comments')
    .populate('category')
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
            res.render('view', { pageTitle: post.title, pageId : "blog_view", layout: 'layouts/main', post:post })
            post.times_seen = post.times_seen + 1;
            post.save();
        }

      
                
    });

  
});

//add new blog get
router.get('/add', /*ensureAuthenticated,*/ (req, res)=>{

  
  // Category.find({}, function(err, categories){
  //   if(err) console.log(err);
    // console.log(categories);
    res.render('add-blog', {
      pageTitle: "Add Blog",
      pageId : "add-blog",
      layout:'layouts/main',
      // categories: categories
    }); 
                                            
  // });
  
});

//validateAddNewPostBody
const validateAddNewPostBody = function(req,res,next){

  req.checkBody('title').notEmpty().withMessage('Post title is required'),
  req.checkBody('category').notEmpty().withMessage('Blog Category is required'),
  req.checkBody('body').notEmpty().withMessage('Category Description is required'),
  // req.checkBody('descrip').notEmpty().withMessage('Category Color is required'),

  req.asyncValidationErrors().then(function() {
    // console.log("No error")
      next();
  }).catch(function(errors) {
    for (var i = 0; i < errors.length; i++) {
      req.flash('danger', errors[i].msg);
      }
      // console.log(errors)
      res.status(500).redirect('back');
  });
}

// add new post postMethod
router.post('/add', upload_image, validateAddNewPostBody, function(req, res){
  
  if (!obj.file_name) {
      res.redirect('back');
  }else{
    post = new Post({
      title : req.body.title,
      category : req.body.category,
      body : req.body.body,
      image: obj.file_name,
      author:"muibudeen Abdullateeef"
      
    });

      post.save(function(err){
      if(err) throw err;
      // console.log(post); 
      res.redirect(303, '/');

    });
  }
    
});

// add new post postMethod
router.post('/add_video', upload_video, validateAddNewPostBody, function(req, res, next){
  try{
      if (!obj.file_name) {
          res.redirect('back');
      }else{
        post = new Post({
          title : req.body.title,
          category : req.body.category,
          body : req.body.body,
          image: obj.file_name,
          author:"muibudeen Abdullateeef"
          
        });

          post.save(function(err){
          if(err) throw err;
          // console.log(post); 
          res.redirect(303, '/');

        });
      }
  }
   catch (err) {
    next(err);
  } 
    
});

//validateAddNewPostBody
const validateAddCommentBody = function(req,res,next){

    if(!req.user){ //not a logged in user
        req.checkBody('author').notEmpty().withMessage('Your name is required');
        req.checkBody('email').notEmpty().withMessage('Email is required');
        req.checkBody('email').isEmail().withMessage('Email is required');
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

    var blogId = req.body.post_id;
    console.log(blogId)

    var post;
    // find post
    try{
        const post1 = await Promise.all([
            Post.findOne({_id:blogId})
        ]);
        console.log()
        post = post1;

    }
    catch (err) {
        next(err);
    }

    if(!req.user){ //not a logged in user
        email = req.body.email;
        author = req.body.author;
    }
    else{
        email = req.user.email;
        author = req.user.name;
    }
    comment = new Comment({
        author: author,
        email: email,
        comment: req.body.comment,
        post: blogId
    });

    post = post[0];//the promise on post returns an array
    comment.save(function(err){
        if(err) throw err;
        post.comments.addToSet(comment._id);
        
        post.save();
        res.redirect('/posts/view/'+blogId);
    });


    
});

//access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('danger', 'Please login');
    res.redirect('/users/login')
  }
  
}
 
module.exports = router;