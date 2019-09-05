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

function call_api(request, response) {

    console.log("request.body: ");
    console.log(request.body);

    const options = {
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

    if (request.body.hasOwnProperty("_grecaptcha_token") == false) {
        console.log("NO TOKEN");
        response.writeHead(503, {
            "Content-Type": "application/json",
        });
        response.write("403");
        response.end("Invalid reCAPTCHA token.");
    } else {

        token = request.body._grecaptcha_token;
        console.log("token: " + token);

        GR_requestData = "secret=6LeoZbYUAAAAAJAN7NGGbFuT8qNKGPdKyqG6IgRR&response=" + token;
        console.log("GR_requestData:");
        console.log(GR_requestData);

        const GR_options = {
            hostname: 'www.google.com',
            port: 443,
            path: '/recaptcha/api/siteverify?' + GR_requestData,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }

        console.log("GR_request start...");
        const GR_request = https.request(GR_options, GR_response => {
            console.log("GR API 200");
            GR_response.on('data', GR_ResponseData => {
                console.log("GR_ResponseData: " + GR_ResponseData);
                GR_ResponseDataJSON = JSON.parse(GR_ResponseData);
                console.log("success: " + GR_ResponseDataJSON.success);
                if (GR_ResponseDataJSON.success == true) {
                    if (GR_ResponseDataJSON.score >= 0.7) {

                        console.log("IN GR RESPONSE: " + JSON.stringify(request.body));

                        const req = http.request(options, res => {
                            res.on('data', apiResponseData => {
                                console.log("API 200");
                                console.log(res.headers);
                                response.writeHead(res.statusCode, res.headers);
                                response.write(apiResponseData);
                                response.end();
                            })
                        })

                        req.on('error', error => {
                            console.log("API ERROR");
                            console.log("error: " + error);
                            response.writeHead(503, {
                                "Content-Type": "application/json",
                            });
                            response.write("503");
                            response.end();
                        })

                        req.write(JSON.stringify(request.body));
                        req.end();

                    } else {
                        response.writeHead(403, {
                            "Content-Type": "application/json",
                        });
                        response.write("Suspicious request, ignored.");
                        response.end();
                    }
                } else {
                    response.writeHead(500, {
                        "Content-Type": "application/json",
                    });
                    response.write("Error verifying reCAPTCHA token.");
                    response.end();
                }
            })
        })

        GR_request.on('error', error => {
            console.log("GR API ERROR");
            console.log("error: " + error);
            response.writeHead(403, {
                "Content-Type": "application/json",
            });
            response.write("Unable to validate reCAPTCHA token.");
            response.end();
        })

        GR_request.write("");
        GR_request.end();

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
