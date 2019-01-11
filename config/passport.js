const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const credentials = require('../config/credentials');

module.exports = function(passport){
	//local strategy
	passport.use(new LocalStrategy(function(email, password,done){
		//match email
		let query= {email:email};
		User.findOne(query, function(err, user){
			if(err){
				console.log(err);
				throw err;
			}
			if(!user){
				return done(null, false,{message:"Email does not exist!"});
			}

			//match passwword
			bcrypt.compare(password, user.password, function(err, isMatch){
				if(err){
					console.log(err);
					throw err;
				}
				if(isMatch){
					return done(null, user)
				}
				else{
					return done(null, false,{message:"Wrong password!"});
				}
			});
			
		});
	}));

	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);

		});
	})
}