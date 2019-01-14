// /post route
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose').set('debug',true);
const { check, validationResult } = require('express-validator/check');
//pagnation
const paginate = require('express-paginate');

const { ensureAuthenticated, mustBeSuperAdmin,  mustBeAdmin , mustBeVisitor } = require('../../config/auth');

//form&files handling
// var formidable = require('formidable');
// var fs = fs = require("fs");
var  path = require("path");
// var  sharp = require("sharp");

const extractFrame = require('ffmpeg-extract-frame')
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
    var name = Date.now();
    var file_name = name+ext;
    obj.file_name = file_name;
    obj.name = name;
    
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
let Category = require('../../models/category');
let Reply = require('../../models/reply');
let Comment = require('../../models/comment');
let Post = require('../../models/post');
let User = require('../../models/user');
let Tag = require('../../models/tag');


//add new blog get
router.get('/add', mustBeAdmin, (req, res)=>{

  
  // Category.find({}, function(err, categories){
  //   if(err) console.log(err);
    // console.log(categories);
    res.render('admin/add-blog', {
      pageTitle: "Add Blog",
      pageId : "add-blog",
      layout:'layouts/admin_main',
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
router.post('/add', mustBeAdmin, upload_image, validateAddNewPostBody, async (req, res)=>{
  
    if (!obj.file_name) {
        res.redirect('back');
    }else{
        //get post tags
        tags = req.body.tags;
        tags = tags.split(',');


        newPost = new Post({
              title : req.body.title,
              category : req.body.category,
              body : req.body.body,
              image: obj.file_name,
              author: req.user
          
        }); 

        savePostAndTags(newPost, tags);
          req.flash('success', "Blog posted");
          res.redirect(303, '/admin');
        
    }
    
});

function savePostAndTags(newPost, tags){
    newPost.save()
        .then((post)=>{

             tags.forEach(async(tag)=>{
                tag = tag.trim()
                //do we hve this tag before? i dont know, shut up check
                // let t = await Promise.all([Tag.findOne({title:tag}) ]);
                await Tag.findOne({title:tag})
                    .then(async t=>{
                        console.log("found t "+t)
                        if(t == null){
                            //tag doesnt exist yet
                            t = new Tag({
                                title: tag
                            })
                        console.log("creted t "+t)
                        }
                        await t.save()
                            .then(async(newTag) => {
                                //put tag to post
                                post.tags.addToSet(newTag._id);
                                await Post.updateOne({_id: mongoose.Types.ObjectId(post._id)},{}).set('tags', post.tags);
                                //put post to tag
                                newTag.posts.addToSet(post._id);
                                // await Tag.updateOne(mongoose.Types.ObjectId(post._id),{$set:{posts:newTag.posts}});
                                await Tag.updateOne({_id: mongoose.Types.ObjectId(newTag._id)},{}).set('posts', newTag.posts);

                            })
                            .catch(err=>console.log(err));
                        // console.log("cccccccccccccccccccccccc"+tag_list)
                });
                    })
   
        })
        // .then()
        .catch((err)=>console.log(err))
    
}

// add new post postMethod
router.post('/add_video', mustBeAdmin, upload_video, validateAddNewPostBody, async (req, res, next)=>{
    try{
        if (!obj.file_name) {
            res.redirect('back');
        }else{

            //create frame from video
            extractFrame({
                input: './public/uploads/videos/'+obj.file_name,
                output: './public/uploads/blogs/'+obj.file_name+'.jpg',
                offset: 1000 // seek offset in milliseconds
            })

            //get post tags
            tags = req.body.tags;
            tags = tags.split(',');

            newPost = new Post({
                title : req.body.title,
                category : req.body.category,
                body : req.body.body,
                image: obj.file_name,
                author: req.user
          
            });


        savePostAndTags(newPost, tags);
          req.flash('success', "Blog posted");
            
        res.redirect(303, '/admin');

        
      }
  }
   catch (err) {
    next(err);
  } 
    
});



module.exports = router;
