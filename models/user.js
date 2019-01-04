var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	authId: { 
        type: String, 
        // required:true
    },
	name: { 
        type: String, 
        required:true
    },
	email: { 
        type: String, 
        required:true,
        unique:true,
    },
	role: { 
        type: String, 
        required:true,
        "default": "admin"
    },
	created_at:{type: Date,
		"default": Date.now
	},
	password:{ 
        type: String, 
        // required:true
    },
});
const User = module.exports = mongoose.model('User', userSchema);
