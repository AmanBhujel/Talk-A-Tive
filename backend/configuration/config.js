const mongoose = require('mongoose');
require('dotenv').config();
const mongoURL = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoURL, {
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