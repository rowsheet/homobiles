var express = require('express');
var bodyParser = require('body-parser')
var http = require('http');
var https = require('https');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

APP_CONFIG = {
    "DEPLOYMENT_MODE": "dev",
    "API_HOSTNAME": "localhost",
    "API_PORT": "5200",
    "API_PATH": "/",
    "API_SSL": false,
}

function get_config(config) {
    return config.toLowerCase().replace(/[^0-9a-z]/gi, '')
}

RECAPTCHA_SECRET = "6LeoZbYUAAAAAJAN7NGGbFuT8qNKGPdKyqG6IgRR";
RECAPTCHA_MIN_SCORE = 0.7

function call_api(USER_req, USER_resp) {
    const API_request_opt = {
        hostname: 'localhost',
        port: 5201, // Local dev test
        // port: 8006, // Local docker test
        // hostname: 'api.homobiles.org',
        // port: 443,
        path: '/',
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
        }
    }
    if (USER_req.body.hasOwnProperty("_grecaptcha_token") == false) {
        USER_resp.writeHead(503, {
            "Content-Type": "application/json",
        });
        USER_resp.write("403");
        USER_resp.end("Missing reCAPTCHA token.");
    } else {
        token = USER_req.body._grecaptcha_token;
        const GOOGLE_req_opt = {
            hostname: 'www.google.com',
            port: 443,
            path: "/recaptcha/api/siteverify?secret=" + RECAPTCHA_SECRET + "&response=" + token,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
        const GOOGLE_req = https.request(GOOGLE_req_opt, GOOGLE_resp => {
            GOOGLE_resp.on('data', GOOGLE_resp_data => {
                GOOGLE_resp_dataJSON = JSON.parse(GOOGLE_resp_data);
                if (GOOGLE_resp_dataJSON.success == true) {
                    if (GOOGLE_resp_dataJSON.score >= RECAPTCHA_MIN_SCORE) {
                        const API_req = http.request(API_request_opt, res => {
                            res.on('data', API_resp_data => {
                                USER_resp.writeHead(res.statusCode, res.headers);
                                USER_resp.write(API_resp_data);
                                USER_resp.end();
                            })
                        })
                        API_req.on('error', error => {
                            USER_resp.writeHead(503, {
                                "Content-Type": "application/json",
                            });
                            USER_resp.write("503");
                            USER_resp.end();
                        })
                        API_req.write(JSON.stringify(USER_req.body));
                        API_req.end();
                    } else {
                        USER_resp.writeHead(403, {
                            "Content-Type": "application/json",
                        });
                        USER_resp.write("Suspicious request, ignored.");
                        USER_resp.end();
                    }
                } else {
                    USER_resp.writeHead(500, {
                        "Content-Type": "application/json",
                    });
                    USER_resp.write("Error verifying reCAPTCHA token.");
                    USER_resp.end();
                }
            })
        })
        GOOGLE_req.on('error', error => {
            USER_resp.writeHead(403, {
                "Content-Type": "application/json",
            });
            USER_resp.write("Unable to validate reCAPTCHA token.");
            USER_resp.end();
        })
        GOOGLE_req.write("");
        GOOGLE_req.end();
    }
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
