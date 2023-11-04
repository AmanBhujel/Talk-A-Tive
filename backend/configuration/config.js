const mongoose = require('mongoose');
require('dotenv').config();

//this is from .env but it does not work in production 
const mongoURL = process.env.MONGO_URL;

//this is a separate function from which I am passing MONGO_PASS which i can hide from git ignore
const { MONGODB_URI } = require('../mongoDbPass')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected : ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold)
        process.exit();
    }
}
module.exports = connectDB;