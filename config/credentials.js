module.exports = {
	cookieSecret: "don't stress it, we will be alright, las las ",
	mongo: {
		development: {
			connectionString: 'mongodb://muilat:Resptech1@ds155164.mlab.com:55164/resptech',
		},
		production: {
			connectionString: 'mongodb://localhost:27017/resptech',
		},
	},
};