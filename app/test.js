const http = require('http')

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/ping',
  method: 'GET'
}

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
    console.log(d.toString('utf-8'))
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()
