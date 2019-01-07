const express = require('express');
const path = require("path");
const credentials = require('./config/credentials.js');
//passport 
const passport = require('passport');

const cookieParser = require('cookie-parser');
const session = require("express-session");
const validator = require("express-validator")
// const { check, validationResult } = require('express-validator/check');
//pagnation
const paginate = require('express-paginate');

const flash = require("connect-flash");
const faker = require("faker");

//dateformat
var moment = require('moment');
moment().format();
var mongoose = require('mongoose').set('debug',true);




// set up handlebars view engine
var hbs = require('hbs');
var hbsutils = require('hbs-utils');

//init app
const app = express();

//for form
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({extended:true}));

app.use(cookieParser());
//express session middlewware
app.use(session({
  	secret: "keyboard cat",
  	resave: true,
  	saveUninitialized : true,
  	// cookie : { secure : true}
}));

// express messages middleware
app.use(flash());
app.use(function(req, res, next){
	res.locals.messages = require("express-messages")(req, res)();
	// res.locals.messages = req.session.sessionFlash;
  	// delete req.session.sessionFlash;
  next();
}); 

//express validator middleware
app.use(validator(
{
	errorFormatter : function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		while(namespace.length){
			formParam += '['+namespace.shift()+']';
		}
		return {
			param 	: 	formParam,
			msg 	: 	msg,
			value 	:   value, 
		};
	}
}
));

// this must come after we link in cookie-parser and connect-session
// app.use(require('csurf')());
// app.use(function(req, res, next){
// 	res.locals._csrfToken = req.csrfToken();
// 	next();
// });


//passport config
require('./config/passport.js')(passport);
//passpoorrt middleware
app.use(passport.initialize());
app.use(passport.session());


// //inport models
let Category = require('./models/category');
let Post = require('./models/post');
let Comment = require('./models/comment');
let Tag = require('./models/tag');

//global variable for all routes
app.get('*', async (req, res, next) => {
	res.locals.user = req.user || null;
	
	///get poopular post
	//Porpular blog
	// Post.find({times_seen: { $gte: 0 }})
	// .sort('-times_seen')
 //    .limit(3)
 //    .populate('category')
 //    // .skip(1)
 //    .exec(function(err, posts){
	// 	if(err) throw err;
 //    	app.locals.porpularPosts = posts;
	// });

	// ///get recentPosts
	// //recentPosts 
	// Post.find({})
	// .sort('-created_at')
 //    .limit(4)
 //    .populate('category')
 //    .exec(function(err, posts){
	// 	if(err) throw err;
 //    	app.locals.recentPosts = posts;
	// });

	// ///get categories
	// //categories 
	try{
		const [ categories ] = await Promise.all([
	 	Category.find({})
		
		]);
    	app.locals.categories = categories;

	}
	catch (err) {
	    next(err);
	}
    
	
	//get recent coommeents
	// recent comments
	// Comment.find({})
	// 	.sort('-created_at')
	//     .limit(3)
	//     // .skip(1) 
	//     .exec(function(err, comments){
	// 		if(err) throw err;
	//     	app.locals.recentComments = comments;
	// 	});

	next();
});




const blocks = {};


const templateUtil = hbsutils(hbs);
templateUtil.registerPartials('${__dirname}/views/partials');
templateUtil.registerWatchedPartials('${__dirname}/views/partials');
templateUtil.precompilePartials('${__dirname}/views/partials');
//register helper
hbs.registerHelper({
	count: (array) => { return array.length; },
	aside_blog_body: (text) => { 
		 if(text.length > 80)
		 	return new hbs.handlebars.SafeString(text.substring(0,77)+"...");
		 else
		 	return new hbs.handlebars.SafeString(text);  
	},
	blog_body: (text, blogId) => { 
		 if(text.length > 250)
		 	return new hbs.handlebars.SafeString(text.substring(0,247)+`<a href='/posts/view/${blogId}' style=' width:auto;height:auto; color:#fff;' class='load_more_button btn btn-md  btn-noborder-radius'> ...read more</a>`);
		 else
		 	return new hbs.handlebars.SafeString(text);  
	},
	format_messages:(messages)=>{
		if (!messages) {return ;}
		//replace thiis
			/*<div id="messages">
              <ul class="success">
                <li>success</li>
              </ul>
              <ul class="danger">
                <li>Danger</li>
              </ul>
            </div>*/
         // with
        messages = messages.replace('<div id="messages">', '<div id="flash-messages" class="">');
        messages = messages.replace('<ul class="success">', '<ul class="alert alert-success">');
        messages = messages.replace('<ul class="info">', '<ul class="alert alert-info">');
        messages = messages.replace('<ul class="danger">', '<ul class="alert alert-danger">');
        messages = messages.replace('<ul class="error">', '<ul class="alert alert-danger">');
        messages = messages.replace('<ul class="warning">', '<ul class="alert alert-warning">');
		// console.log(messages);
		
		return new hbs.handlebars.SafeString(messages);
	},
	paginator:(paginate, pageCount, pages)=>{
		var pagination_html = '';
		if (paginate.hasPreviousPages || paginate.hasNextPages(pageCount)){

		    pagination_html += `				<ul class="pagination align-items-center" align='center' style='width:auto'>`;
		      if (paginate.hasPreviousPages)
		    pagination_html +=     `<li> <a href="${paginate.href(true)}" class='load_more_button btn btn-md  btn-noborder-radius'>Previous</a> </li> `;
		      if (pages)
		        /*pages.forEach(function(page){
		        	if(paginate.page == page.number)
		    pagination_html +=     	`<li class="active" >`;
		    		else
		    pagination_html +=     	`<li>`;
		    pagination_html +=     	`<a href="${page.url}" class='load_more_button btn btn-md  btn-noborder-radius'>${page.number}</a> </li>`;
		        });*/
		      if (paginate.hasNextPages(pageCount))
		    pagination_html +=      `<li> <a href="${paginate.href()}" class='load_more_button btn btn-md  btn-noborder-radius'> Next&nbsp;</a>`;
		    pagination_html +=  `</ul> `;
		}
		return new hbs.handlebars.SafeString(pagination_html)
	},
	user_auth: (user) => { 
		
		 if(user)
                
		 	return new hbs.handlebars.SafeString(`<li><a href="/users/logout">Logout</a></li>`);
		 else
		 	return new hbs.handlebars.SafeString(`<li><a href="/users/register">Register</a></li>
                <li><a href="/users/login">Login</a></li>`);  
	},
	cat_tag:(index)=>{
		if (index%5 == 4) return 'cat_innovation';
		if (index%5 == 3) return 'cat_video';
		if (index%5 == 2) return 'cat_world';
		if (index%5 == 1) return 'cat_party';
		if (index%5 == 0) return 'cat_technology';

	}
	
	
});
//date-format
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
//moment
hbs.registerHelper('moment', function(datetime){
	if (moment) {

		
		let time_24 = 86400000/*new Date(24 * 3600 * 1000) //24hours*/;
		if(moment() - moment(datetime).format("x") > time_24){
			return moment(datetime).format("lll");
		}
		else{
			return moment(datetime).fromNow();
		}
  	}
  	else {
    	return datetime;
  	}
});
//increment index 
hbs.registerHelper('inc',  function(value, options){
	return parseInt(value)+1;
});
//json
hbs.registerHelper('JSON', function(value, options){
	return new hbs.handlebars.SafeString(JSON.stringify(value));
})
hbs.registerHelper('block', function(name){
	const val = (blocks[name]||[]).join('\n');
 
	//clear block
	blocks[name] = []; 
	return val;
});

hbs.registerHelper('extend', function(name, context){
	let block = blocks[name];

	if(!block){
		block = blocks[name] = [];
	}

	block.push(context.fn(this));
});

hbs.registerHelper('section', function(name, options){
		if(!this._sections) this._sections = {};
		this._sections[name] = options.fn(this);
		return null;
		
});
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
//register partials
hbs.registerPartials(__dirname + '/views/partials');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//export locals to template
hbs.localsAsTemplateData(app);
app.locals.deFaultPageTitle = "Resp Tech ~ ";



//middleware for static files (css, image)
app.use(express.static(__dirname + '/public'));







//db connection
var opts = { useNewUrlParser: true,autoIndex: false }
switch(app.get('env')){
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString, opts);
		break;
	case 'production':
		mongoose.connect(credentials.mongo.production.connectionString, opts);
		break;
	default:
		throw new Error('Unknown execution environment: ' + app.get('env'));
}
mongoose.connect(credentials.mongo.development.connectionString );
let db = mongoose.connection;
db.on('open', function(){
	console.log("connected to mongodb");
});



//check for db error
db.on('error', function(err){
	console.log(err);
});
  

// keep this before all routes that will use pagination
/*param limit, */
app.use(paginate.middleware(5, 50));




// //bring in routes
// app.use(require('./routes/blog'));
// app.use(require('./routes/category'));
// app.use(require('./routes/comment'));

app.use('/posts', require('./routes/posts'));
app.use('/categories', require('./routes/categories'));


// //bring in models
// let Post = require('./models/post');
// let Category = require('./models/category');
// let Comment = require('./models/comment');


// home route
app.get('/', async (req, res)=>{

	var categories = app.locals.categories;
	var categories_posts = [];
	
	for (var i = 0; i < categories.length; i++) {
		category = categories[i];

		try{
			const [ posts ] = await Promise.all([
		 		Post.find({category:category}).populate('category').limit(2).sort('-created_at').exec()
			
			]);


			var posts_list = [];

			posts.forEach((post)=>{
	    		posts_list.push(post);
			});

			if(posts_list.length != 0)
				categories_posts.push({
					category: category.title,
					posts: posts_list
				});

		}
		catch (err) {
		    next(err);
		}

	}
	res.render('index',{
		
        pageTitle: "Technology and Innovation",
        layout: 'layouts/main',
        home: true,
        categories_posts: categories_posts
	})
	// res.send("Hello World");
});



app.get('/faker', function(req, res){
	faker.seed(123);
	
        Category.findById("5c09c39efb9c4f9a0c645a2a",function(err, category){

for (var i = 0; i < 80; i++) {
        var post = new Post();

	        post.category = category._id;
	        post.title = faker.lorem.sentence();
	        post.body = faker.lorem.paragraphs();
	        // post.image = faker.image.image();
	        post.image = "1544181558497.jpeg";

	        post.save(function(err) {
	            if (err) throw err
	        });

    }});
    res.redirect('/posts') 
});



// custom 404 page
app.use(function(req, res){
	// res.type('text/plain');
	res.status(404);
	res.render('404', {layout: 'layouts/main'});
});
// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

// start server on port 8000
app.listen(8000, function(){
	console.log("Server running " + app.get('env') +
" mode on port 8000");
})