// user route
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose').set('debug',true);
const bcrypt = require('bcryptjs');

const passport = require('passport');
//passport config
var credentials = require('../../config/passport.js');

const { ensureAuthenticated, mustBeSuperAdmin,  mustBeAdmin , mustBeVisitor } = require('../../config/auth');


//inport models
let User = require('../../models/user');



// register get 
router.get('/', async(req, res) => {

	const [users] = await Promise.all([
		User.find({}).exec()
		]);
	res.render('admin/users', {
		pageTitle: "Users",
		pageId : "users",
		layout:'layouts/admin_main',
		users, users
	});	 
	
});


// register get 
router.get('/register', function(req, res){

	res.render('register', {
		pageTitle: "User Registration",
		pageId : "register",
		// layout:'layouts/main',
	});	 
	
});


//validateRegistration
const validateRegistration = (req,res,next)=>{

    req.checkBody('name','Name is required').notEmpty();
 	req.checkBody('email','Email is required').notEmpty();
 	req.checkBody('email','Email is not valid').isEmail();
 	req.checkBody('password','Password is required').notEmpty();
 	req.checkBody('password','Passwords do not match').equals(req.body.password2);


  	req.asyncValidationErrors().then(function() {
    	// console.log("No error")
    	next();
  	}).catch(function(errors) {
    	console.log(errors)
    	for (var i = 0; i < errors.length; i++) {
      		req.flash('danger', errors[i].msg);
      	}
     	 res.redirect('back');
  	});
}

// // reg new user prroceess
router.post('/register', validateRegistration, 
 function(req, res){

 	const name = req.body.name;
 	const email = req.body.email;
 	const password = req.body.password;

 	// u = new User({name:"mui",email});
 	// u.save();

 	User.findOne({email:email}, (err, user)=>{
 		if(err) throw err;
 		if(user){
 			//email exist, check if password is set,
 			//remember, a visitor email is sved when commenting on a post
 			//with no passport
 			if(user.password != ""){
 				req.flash('danger', 'Email already exists.');
 				return res.redirect('back');
 			}else
	 			saveUser(req, res, user);
 		}
 		else{
			user = new User({name,email,password});
 			user.isAdmin = true;
			saveUser(req, res, user);
 		}

 	})
});

function saveUser(req, res, user){
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(user.password, salt, function(err, hash){
			if(err)
				console.log("Hashing error " + err);
			else{
				user.name = req.body.name;
				user.password = hash;
				user.save(function(err){
					if (err) 
						console.log(err);
					else{
						if (user._id == user._id) {
							//user created by admin
							req.flash('success', `${user.name} successfully added as admin`)
							res.redirect("/admin/users");
						}else{
							//self reg
							req.flash('success', 'You are registered, and can now log in')
							res.redirect("/admin/users/login");
						}
						
					}

					
				})
			}
		})
	})
}



//login form
router.get('/login', mustBeVisitor, function(req, res){
	res.render('login',{
		pageTitle: "User Login",
		pageId : "login",
		// layout:'layouts/main',
	})
});

router.post('/login', function(req, res, next){
	passport.authenticate('local', {
		successRedirect: '/admin/',
		failureRedirect: '/admin/users/login',
		failureFlash:true
	})(req, res, next);

})
 
//logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are logged out');
	res.redirect('/admin/users/login');
	
});

//validateRegistration
const validateAddUser = (req,res,next)=>{

    req.checkBody('name','Name is required').notEmpty();
 	req.checkBody('email','Email is required').notEmpty();
 	req.checkBody('email','Email is not valid').isEmail();
 	// req.checkBody('password','Password is required').notEmpty();
 	// req.checkBody('password','Passwords do not match').equals(req.body.password2);


  	req.asyncValidationErrors().then(function() {
    	// console.log("No error")
    	next();
  	}).catch(function(errors) {
    	console.log(errors)
    	for (var i = 0; i < errors.length; i++) {
      		req.flash('danger', errors[i].msg);
      	}
     	 res.redirect('back');
  	});
}
 // // admin add new user proceess
router.post('/add', mustBeSuperAdmin, validateAddUser, 
 function(req, res){

 	const name = req.body.name;
 	const email = req.body.email;

 	// u = new User({name:"mui",email});
 	// u.save();

 	User.findOne({email:email}, (err, user)=>{
 		if(err) throw err;
 		if(user){
 			//email exist, check if password is set,
 			//remember, a visitor email is sved when commenting on a post
 			//with no passport
 			console.log(user + " ")
 			if(user.password != ""){
 				req.flash('danger', 'Email already exists.');
 				return res.redirect('back');
 			}else
	 			saveUser(req, res, user);
 		}
 		else{
			user = new User({name,email,/*password*/});
			user.isAdmin = true;
			user.password = user._id //use id as password
			saveUser(req, res, user);
 		}

 	})
});




module.exports = router;