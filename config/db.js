const mongoose = require('mongoose');

// MongoDB Connection
const connectDB = async () => {
    try {
        mongoose.connect('mongodb://localhost:27017/OMS')
          .then(() => console.log('✅ Connected to MongoDB'))
          .catch((err) => console.error('❌ MongoDB Connection Error:', err));
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
