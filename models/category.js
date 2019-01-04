const mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
	// _id: mongoose.Schema.Types.ObjectId,
	title: {
		type: String,
		required: true,
	    createIndex: true,
	    unique: true
	},
	color: {type:String},
	description: {type:String},
	image:{
		type: String,
		required: true
	} 

});


let Category = module.exports = mongoose.model('Category', categorySchema,"categories");
