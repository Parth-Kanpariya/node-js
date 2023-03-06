require('dotenv').config()
require('./db/connection')
const app = require('./app')

const PORT = process.env.PORT || 3000
//uncaught exception........
process.on('uncaughtException', err=>{
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION!...Shutting Down!!');
    //first server close then callback come and close the APP gracefully
    process.exit(1)
})


const server = app.listen(PORT, () => {
    console.log(`App is runnig at ${PORT}`)
})

//unhandled rejection........like mongodb server error etc
process.on('unhandledRejection', err=>{
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!...Shutting Down!!');
    //first server close then callback come and close the APP gracefully
    server.close(()=>{
        process.exit(1)
    })
})



