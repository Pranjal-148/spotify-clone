const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    // From Step 2
    password: { type: String, required: true },
    passwordCreatedAt: { type: Date, default: Date.now },
    
    // From Step 3
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'] },
    
    // Progress tracking
    signupStep: { type: Number, default: 2 },
    completed: { type: Boolean, default: false }
});

// Add this pre-save middleware to hash passwords
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
