const mongoose = require('mongoose')
const fs = require('fs')
const TourModel = require('../model/toueModel')
require('dotenv').config()

const DB = process.env.DATABSE_CLOUD.replace('<PASSWORD>', process.env.DATABSE_PASSWORD)

mongoose.set('strictQuery', false)

try {

    mongoose.connect(DB, {

    }).then(con => {
        // console.log(con.connection)
        console.log("DB connection Successfully")
    })
} catch (e) {
    console.log("Error occured while connecting with the database")
}

//READ json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tour-simple.json`, 'utf-8'));

//Import data into DB
const importData = async() => {
    try {
        await TourModel.create(tours)
        console.log('Data successfully loaded!')
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

//Delete all data from DB
const deleteData = async() => {
    try {
        await TourModel.deleteMany()
        console.log('Data successfully deleted!')
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

if (process.argv[2] === "--import") {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}