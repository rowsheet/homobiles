var express = require('express');
var bodyParser = require('body-parser')
var https = require('https');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function call_api(request, response) {
    const options = {
        // hostname: 'localhost',
        // port: 5001, // Local dev test
        // port: 8006, // Local docker test
        hostname: 'api.homobiles.org',
        port: 443,
        path: '/',
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
        }
    }

    const req = https.request(options, res => {
        res.on('data', d => {
            console.log(res.headers["content-type"]);
            response.writeHead(res.statusCode, {
                "Content-Type": res.headers["content-type"],
            });
            response.write(d.toString('utf-8'));
            response.end();
        })
    })

    req.on('error', error => {
        console.log("ERROR");
        console.log(error);
        response.writeHead(503, {
            "Content-Type": "application/json",
        });
        response.write("503");
        response.end();
    })

    req.write(JSON.stringify(request.body));
    req.end();
}

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
/*
API Calls to other domains will result in CORS errors, so API requests have to
be sent to this web server where the request will be forwarded to the actual
API url.
*/
app.post('/', function(request, response) {
    call_api(request, response);
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
