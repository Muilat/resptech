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
	isSuperAdmin: { 
        type: Boolean, 
        required:true,
        "default": false
    },
    isAdmin: { 
        type: Boolean, 
        required:true,
        "default": false
    },
    created_at:{type: Date,
		"default": Date.now
	},
	password:{ 
        type: String, 
        // required:true
    },
    avatar:{ 
        type: String, 
        "default": "avatar.png"
        // required:true
    },
});
const User = module.exports = mongoose.model('User', userSchema);
