var express = require('express');
var app = express();

/*------------------------------------------------------------------------------
Set the port the server should serve at.
-----------------------------------------------------------------------------*/
app.set('port', (process.env.PORT || 5000));

/*------------------------------------------------------------------------------
Place fils in the public dir, i.e.
	/public/css/test.css
Access these files at /public for urls, i.e.
	/public/test/test.css
-----------------------------------------------------------------------------*/
app.use('/public', express.static(__dirname + '/public'));

/*------------------------------------------------------------------------------
Views is directory for all template files from the directory views
and use ejs as the view engine.
-----------------------------------------------------------------------------*/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/*------------------------------------------------------------------------------
Specifiy all pages that are in view/pages, i.e.
	view/pages/index.ejs
-----------------------------------------------------------------------------*/
app.get('/', function(request, response) {
	response.render('pages/index')
});
app.get('/for-drivers', function(request, response) {
	response.render('pages/for-drivers')
});
app.get('/for-riders', function(request, response) {
	response.render('pages/for-riders')
});
app.get('/why-homobiles', function(request, response) {
	response.render('pages/why-homobiles')
});
app.get('/signup', function(request, response) {
	response.render('pages/signup')
});
app.get('/login', function(request, response) {
	response.render('pages/login')
});
app.get('*', function(request, response) {
	response.status(404).render('pages/page_404')
});

/*------------------------------------------------------------------------------
START THE SERVER
-----------------------------------------------------------------------------*/
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
