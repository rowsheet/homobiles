#!/bin/bash
service nginx start
cd /app && node server.js > logs
tail -f /dev/null
