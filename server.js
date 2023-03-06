require('dotenv').config()
require('./db/connection')
const app = require('./app')

const PORT = process.env.PORT || 3000



app.listen(PORT, () => {
    console.log(`App is runnig at ${PORT}`)
})