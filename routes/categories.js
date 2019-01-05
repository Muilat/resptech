// /blog route
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose').set('debug',true);
const { check, validationResult } = require('express-validator/check');

const paginate = require('express-paginate');


//form&files handling
// var formidable = require('formidable');
// var fs = require("fs");
var  path = require("path");
var Jimp = require("jimp");


const multer = require('multer');
// Set The Storage Engine
image_path = './public/uploads/categories/';
var obj = {};
var storage = multer.diskStorage({
  destination: image_path,
  filename: function(req, file, cb){
    	var ext = path.extname(file.originalname);
        var file_name = Date.now()+ext;
        obj.file_name = file_name;
	
	  	

        cb(null,file_name);
        //manipulate the image
	  	Jimp.read(image_path+obj.file_name)
	  		.then(image=>{
	  		// image.scale(0.5)
	  		// 	.resize(600,600)//to get close to images used with template
	  			
	  		// 	.quality(60)//jst used it as used in example
	  		// 	.write(image_path+obj.file_name);
	  			var w = image.bitmap.width; // the width of the image
	    		var h = image.bitmap.height; // the height of the image
		  		if(w > 600 || h > 600){

		  		
		  			console.log(w +" > "+ h);
			  		image.scale(0.5)
			  			.resize(600,600)//to get close to images used with template
			  			
			  			.quality(60)//jst used it as used in example
			  			.write(image_path+obj.file_name);
			  		}
			  	else{

		  			console.log(w +" < "+ h);
			  		image.resize(600,600)//to get close to images used with template
			  			
			  			.quality(60)//jst used it as used in example
			  			.write(image_path+obj.file_name);
			  	}
			  })
	  		.catch(err=>{
		  		console.log(err);

	  		})

	  	
  	}
});

// Init Upload
var upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
  	// console.log('res'+res)
    checkFileType(file,req, cb);
  }
}).single('image');

// Check File Type
function checkFileType(file, req, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname){
  	
  	 // Jimp.read(obj.file_name)
  		// .then(image=>{
  		// 	return image.resize(600,600)//to get close to images used with template
  		// 	.quality(60)//just used it as used in example
  		// 	.write(obj.file_name);
  		// })
  		// .catch(err=>{throw err});	
    return cb(null,true);
  } else {
		obj.file_name = '';

    // req.flash("danger","File upload only supports the following filetypes - " + filetypes);
    return cb(null,false)
  }
}



//inport models
let Category = require('../models/category');
let Post = require('../models/post');





///////////////admin////////////
// categories 
router.get('/', function(req, res){

	res.render('category', {
		pageTitle: "Categories",
		pageId : "categories",
		layout:'layouts/main',
	});
});

//validateBody
const validateBody = function(req,res,next){

	req.checkBody('title').notEmpty().withMessage('Post title is required'),
	req.checkBody('color').notEmpty().withMessage('Category Color is required'),
	req.checkBody('description').notEmpty().withMessage('Category Description is required'),
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

// add new category postMethod
router.post('/add', upload, validateBody, function(req, res){
	
	if (!obj.file_name) {
    	req.flash("danger","File upload only supports jpeg, jpg, png, gif");
	    res.redirect('back');
	}else{
		category = new Category({
			title : req.body.title,
			color : req.body.color,
			description : req.body.description,
			image: obj.file_name
			
		});

	    category.save(function(err){
			if(err) throw err;
			console.log(category); 
			res.redirect(303, '/categories');

		});
	}
		
});

 
//view category getMethod
router.get('/:category', async (req, res, next) =>{

	var category_name = req.params.category;
	// console.log(category)
	Category.findOne({title:category_name}, async (err, category) =>{
		if(err) 
			return next(err);
		if(!category)
			return next();
		
		try {
 
			 //  i blv you are using Node v7.6.0+ which has async/await support
    	const [ results, itemCount ] = await Promise.all([
      	Post.find({category:category}).populate('category').limit(req.query.limit).skip(req.skip).lean().sort('-created_at').exec(),
	      	Post.countDocuments({category:category})
	    ]);
 
    	const pageCount = Math.ceil(itemCount / req.query.limit);
 		
 		if(category.title == "Videos")
			pageId = "video_category";
		else 
			pageId = "other_category";
 	
      res.render('category_view', {
        posts: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(5, pageCount, req.query.page),
        pageTitle: category.title, category:category, pageId : pageId, layout: 'layouts/main'
      });
 
  } catch (err) {
    next(err);
  }
																						
	});

});
 
module.exports = router;