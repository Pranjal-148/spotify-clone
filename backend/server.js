require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Add this import
const User = require('./models/user');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// IMPORTANT: Session middleware must come BEFORE any routes that use it
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_fallback_secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions' 
    }),
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Track progress middleware - now correctly placed after session initialization
app.use((req, res, next) => {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => {
                console.error(err);
                next();
            });
    } else next();
});

// Step 1: Create initial user and store session
app.post('/api/signup/step1', async (req, res) => {
    try {
        // Create a blank user (fields will be updated in later steps)
        const newUser = new User({
            password: 'placeholder-password',  // temporary value
            name: 'placeholder-name',          // temporary value
            dob: new Date(),                   // temporary value
            gender: 'prefer-not-to-say'        // default
        });

        await newUser.save();

        // Store user ID in session
        req.session.userId = newUser._id;

        res.json({ nextStep: '/signup-step2.html' });
    } catch (error) {
        console.error('Signup step1 failed:', error);
        res.status(500).json({ error: 'Initial signup failed' });
    }
});


// Step 2: Password Creation
app.post('/api/signup/step2', async (req, res) => {
    try {
        console.log('Session data:', req.session);
        
        if (!req.session.userId) {
            return res.status(401).json({ 
                error: 'Session expired. Please restart signup.' 
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found. Please restart signup.' 
            });
        }

        // Manual validation as backup
        if (!req.body.password || req.body.password.length < 10) {
            return res.status(400).json({ 
                error: 'Password does not meet requirements' 
            });
        }

        user.password = req.body.password;
        await user.save();

        console.log('Password updated for user:', user._id);
        res.json({ 
            success: true, 
            nextStep: '/signup-step3.html' 
        });

    } catch (error) {
        console.error('Password save error:', error);
        res.status(500).json({ 
            error: 'Password update failed. Please try again.' 
        });
    }
});
  
  

// Step 3: Personal Info
app.post('/api/signup/step3', async (req, res) => {
    try {
        // Use findById and save instead of findByIdAndUpdate to ensure middleware runs
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.name = req.body.name;
        user.dob = new Date(req.body.dob);
        user.gender = req.body.gender;
        user.signupStep = 4;
        
        await user.save();
        res.json({ nextStep: '/signup-step4.html' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Profile save failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

