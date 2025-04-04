const mongoose = require('mongoose');

// MongoDB Connection
const connectDB = async () => {
    try {
        mongoose.connect('mongodb+srv://gaurav12:gaurav12@cluster0.xsskxr5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
            .then(() => console.log('✅ Connected to MongoDB'))
            .catch((err) => console.error('❌ MongoDB Connection Error:', err));
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
