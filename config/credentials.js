module.exports = {
	cookieSecret: "don't stress it, we will be alright, las las ",
	mongo: {
		development: {
			connectionString: 'mongodb://localhost:27017/resptech',
		},
		production: {
			connectionString: 'mongodb://localhost:27017/resptech',
		},
	},
};