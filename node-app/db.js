const mongoose = require('mongoose');
require('dotenv').config(); // .env file ko load karne ke liye

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Olx'; // Local ya Atlas ke liye

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1); // Process exit for failure
    }
};

module.exports = connectDB;
