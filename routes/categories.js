// /blog route
const express = require('express');
const router = express.Router();
var mongoose = require('mongoose').set('debug',true);
const { check, validationResult } = require('express-validator/check');

const paginate = require('express-paginate');
const { ensureAuthenticated } = require('../config/auth');


//form&files handling
// var formidable = require('formidable');
// var fs = require("fs");
var  path = require("path");
 
 //inport models
const Category = require('../models/category');
const Post = require('../models/post');
const Tag = require('../models/tag');


// categories 
router.get('/', function(req, res){

	res.render('categories', {
		pageTitle: "Categories",
		pageId : "categories",
		layout:'layouts/main',
	});
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
    		const [ results, itemCount, tags ] = await Promise.all([
	      		Post.find({category:category}).populate('author').populate('category').limit(req.query.limit).skip(req.skip).lean().sort('-created_at').exec(),
		      	Post.countDocuments({category:category}),
		      	Tag.find({}).limit(25).sort('-created_at').exec()
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
		        pageTitle: category.title, category:category, pageId : pageId, layout: 'layouts/main',
		        tags: tags
		      });
 
		} catch (err) {
		    next(err);
		}
																						
	});

});


 
module.exports = router;