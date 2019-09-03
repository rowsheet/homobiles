const http = require('http')

var body = JSON.stringify({
        // "command": "request_a_ride"
        "command": "test_error"
})

function call_api(body) {
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
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.write(body)
    req.end()
}

call_api(body)
