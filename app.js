// Requirements
const path = require('path'),
	bodyParser = require('body-parser'),
	methodOverrride = require('method-override'),
	expressSanitizer = require('express-sanitizer'),
	mongoose = require('mongoose'),
	dbURL = 'mongodb://localhost/BlogApp',
	port = 3000,
	express = require('express'),
	app = express();

// Setup
mongoose.connect(dbURL, { useNewUrlParser: true, useFindAndModify: false });
app
	.set('view engine', 'ejs')
	.set('views', path.join(__dirname, 'views'))
	.use(express.static(__dirname + '/public'))
	.use(bodyParser.urlencoded({ extended: true }))
	.use(expressSanitizer())
	.use(methodOverrride('_method'))
	.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});

// Schemas
const blogSchema = mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', blogSchema);

// Routes
app.get('/', (req, res) => {
	res.redirect('/blogs');
});
//	Blogs	->	Index
app.get('/blogs', (req, res) => {
	Blog.find({}, (err, blogs) => {
		err ? console.log(err) : res.render('index', { blogs: blogs });
	});
});
//	Blogs	->	New
app.get('/blogs/new', (req, res) => {
	res.render('new');
});

//	Blogs	->	Create
app.post('/blogs', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, (err, blog) => {
		err ? res.render('new') : res.redirect('/blogs');
	});
});

//	Blogs ->	Show
app.get('/blogs/:id', (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		err ? res.redirect('/blogs') : res.render('show', { blog: blog });
	});
});

//	Blogs ->	Edit
app.get('/blogs/:id/edit', (req, res) => {
	Blog.findById(req.params.id, (err, blog) => {
		err ? res.redirect('/blogs') : res.render('edit', { blog: blog });
	});
});

//	Blogs ->	Update
app.put('/blogs/:id', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	const id = req.params.id;
	Blog.findByIdAndUpdate(id, req.body.blog, (err, blog) => {
		err ? res.redirect('/blogs') : res.redirect('/blogs/' + id);
	});
});

//	Blogs	->	Delete
app.delete('/blogs/:id', (req, res) => {
	Blog.findByIdAndDelete(req.params.id, (err) => {
		err ? res.redirect('/blogs') : res.redirect('/blogs');
	});
});
