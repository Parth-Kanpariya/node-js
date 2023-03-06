const express = require('express')
const app = express()

app.use(express.json())
app.use(require('./routes/tourRoute'))

app.use((req, resp, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

//always put below code under below the route middleware
app.all('*', (req, resp, next) => {
    resp.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    })
})

module.exports = app