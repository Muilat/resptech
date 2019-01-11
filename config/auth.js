module.exports = {
	//must be logged in 
	ensureAuthenticated : function(req, res, next){
	  if(req.isAuthenticated()){
	    return next();
	  }
	  else{
	    req.flash('danger', 'Please login');
	    res.redirect('/users/login')
	  }
	  
	},
	
	mustBeSuperAdmin : function(req, res, next){
	  if(req.isAuthenticated()){
	  	if(req.user.isSuperAdmin)
	    	return next();
	    else
	    	req.flash('danger', 'Access denied');
	    	res.redirect('/admin')
	  }
	  else{
	    req.flash('danger', 'Please login');
	    res.redirect('/users/login')
	  }
	  
	},

	mustBeAdmin : function(req, res, next){
	  if(req.isAuthenticated()){
	  	if(req.user.isAdmin)
	    	return next();
	    else
	    	req.flash('danger', 'Access denied');
	    	res.redirect('/admin')
	  }
	  else{
	    req.flash('danger', 'Please login');
	    res.redirect('/users/login')
	  }
	  
	}
}