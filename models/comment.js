
const mongoose = require('mongoose').set('debug',true);
let commentSchema = mongoose.Schema({
	// _id: mongoose.Schema.Types.ObjectId,
	author: {
		type:String,
        required:true
	},
	email: {
		type:String,
        required:true
	},post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	},
    comment:{ 
        type: String, 
        required:true
    },
    
    created_at: {type: Date,
		"default": Date.now
	},
	replies: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Reply'
	}]
});

let Comment = module.exports = mongoose.model('Comment', commentSchema,"comments");