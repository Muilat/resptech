const mongoose = require('mongoose');

let tagSchema = mongoose.Schema({
	// _id: mongoose.Schema.Types.ObjectId,
	title: {
		type: String,
		required: true,
	    createIndex: true,
	    unique: true
	},
	posts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post'
    }]

});


let tag = module.exports = mongoose.model('Tag', tagSchema,"tags");
