
const mongoose = require('mongoose').set('debug',true);
let replySchema = mongoose.Schema({
	// _id: mongoose.Schema.Types.ObjectId,
	author: {
		type: String, 
        required:true
	},
    reply:{ 
        type: String, 
        required:true
    },
    comment: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'comment'
    },
    created_at: {type: Date,
		"default": Date.now
	}
});

let Reply = module.exports = mongoose.model('Reply', replySchema,"replies");