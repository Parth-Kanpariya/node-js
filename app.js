const express = require('express')
const app = express()
const AppError = require('./util/appError')
const globalErrorHandle = require('./controller/errorController')

app.use(express.json())
app.use(require('./routes/tourRoute'))
app.use(require('./routes/userRoutes'))

app.use((req, resp, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

//always put below code under below the route middleware
//below code handles the all unhandled routes
app.all('*', (req, resp, next) => {
    //1st approach
    // resp.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    //2nd approach
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404


    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})

//global error handling middleware
app.use(globalErrorHandle)



module.exports = app