const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false, // Make optional for OAuth users
        trim: true,
    },
    lastName: {
        type: String,
        required: false, // Make optional for OAuth users
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: false, // Make optional for OAuth users
        minlength: 6,
    },
    appwriteId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
    },
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// 🔒 Hash password before saving (only if password exists)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 🔑 Method to compare entered password with hashed one
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DETAIL', UserSchema);