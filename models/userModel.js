const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['Super_Admin', 'Admin', 'Employee', 'Intern'],  
    },
    subRole: {
        type: String,
        enum: ["CEO", "COO", "CAO", "HR", "HR Coordinator", "HR Executive", "Team Leader", "Manager", "Developer", "App Developer", "UI/UX Designer"],  
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});



// Hash password before saving
// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//       next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   });
  
//   // Method to check if password matches
//   UserSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
//   };
  
module.exports = mongoose.model('User', UserSchema);
