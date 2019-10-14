var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

API_HOSTNAME = process.env.API_HOSTNAME;
API_PORT = process.env.API_PORT;

/*------------------------------------------------------------------------------
Using https for localhost will result in a cert validation error, so
use http instead of https if API_HOSTNAME == localhost.
-----------------------------------------------------------------------------*/
var http = require('https');
if (API_HOSTNAME == "localhost") {
    http = require('http');
}

var request = require('request');

console.log("API_HOSTNAME: " + API_HOSTNAME);
console.log("API_PORT: " + API_PORT);

function call_api(USER_req, USER_resp) {
    console.log("Got call_api");
    var body = JSON.stringify(USER_req.body)
    console.log(body);
    request.post({
        url : API_HOSTNAME,
        headers : {
            'Content-Type': 'application/json',
        },
        body: body,
    }, function(error, response, body) {
        console.log("Got call_api -> got response");
        console.log("response.statusCode");
        console.log(response.statusCode);
        console.log("response.headers");
        console.log(response.headers);
        console.log("response.body");
        console.log(response.body);
        USER_resp.writeHead(response.statusCode, response.headers);
        USER_resp.write(response.body);
        USER_resp.end();
    });        
    /*
    console.log(API_request_opt);
    console.log("Got call_api -> defined request");
    var API_req = http.request(API_request_opt, res => {
        console.log("Got call_api -> data");
        res.on('data', API_resp_data => {
            console.log("Got call_api -> API_resp");
            console.log(API_resp_data.toString('utf-8'));
            USER_resp.writeHead(res.statusCode, res.headers);
            USER_resp.write(API_resp_data);
            USER_resp.end();
        })
    }).on('error', error => {
        console.log("Got call_api -> error");
        USER_resp.writeHead(503, {
            "Content-Type": "application/json",
        });
        USER_resp.write("503");
        USER_resp.end();
    })
    /*
    .on('end', () => {
        API_req.write(JSON.stringify(USER_req.body));
        API_req.end();
    });
    */
}

/*------------------------------------------------------------------------------
Set the port the server should serve at.
-----------------------------------------------------------------------------*/
app.set('port', (process.env.PORT || 5200));

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
app.get('/', function(req, response) {
	response.render('pages/index')
});
/*
API Calls to other domains will result in CORS errors, so API requests have to
be sent to this web server where the request will be forwarded to the actual
API url.
*/
app.post('/', function(req, response) {
    call_api(req, response);
});
app.get('/for-drivers', function(req, response) {
	response.render('pages/for-drivers')
});
app.get('/for-riders', function(req, response) {
	response.render('pages/for-riders')
});
app.get('/why-homobiles', function(req, response) {
	response.render('pages/why-homobiles')
});
app.get('/signup', function(req, response) {
	response.render('pages/signup')
});
/*
app.get('/login', function(req, response) {
	response.render('pages/login')
});
*/
app.get('*', function(req, response) {
	response.status(404).render('pages/page_404')
});

/*------------------------------------------------------------------------------
START THE SERVER
-----------------------------------------------------------------------------*/
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
