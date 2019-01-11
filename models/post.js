
const mongoose = require('mongoose').set('debug',true);
// var categorySchema = require('mongoose').model('Category').schema
// var commentSchema = require('mongoose').model('Comment').schema;
// let Category = require('./category');

let postSchema = mongoose.Schema({
	// _id: mongoose.Schema.Types.ObjectId,
	title: {
		type: String,
		required: true
	},
    body:{ 
        type: String, 
        // required:true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    image:{ 
        type: String, 
        required:true
    },
    created_at: {type: Date,
        "default": Date.now
    },
    times_seen: {type: Number,
        "default": 0
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category'
    },
    comments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment'
    }],
    tags: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tag'
    }],
    
});

let Post = module.exports = mongoose.model('Post', postSchema,"posts");