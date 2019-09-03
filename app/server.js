var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
const http = require('http');
function call_api(request, response) {
    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/',
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
        }
    }

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
            console.log("DATA: " + d.toString('utf-8'))
            console.log(typeof(res.statusCode));
            response.writeHead(res.statusCode, {
                "Content-Type": "application/json",
            });
            response.write(d.toString('utf-8'));
            response.end();
        })
    })

    req.on('error', error => {
        res.on('data', d => {
            response.writeHead(503, {
                "Content-Type": "application/json",
            });
            response.write();
            response.end();
        })
    })

    req.write(JSON.stringify(request.body));
    req.end();
}
app.post('/', function(request, response) {
    // console.log("request.body:");
    // console.log(request.body);
    // console.log(typeof(request.body));
    // console.log(JSON.stringify(request.body));
    /*
    response.writeHead(200, {
        "Content-Type": "application/json",
    })
    response.write(JSON.stringify({
        "error": false,
        "data": "OK"
    }))
    response.end();
    */
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
