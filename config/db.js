const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://yogibaba1207:74488851@ascetic.zjr8s.mongodb.net/?retryWrites=true&w=majority&appName=Ascetic');
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
