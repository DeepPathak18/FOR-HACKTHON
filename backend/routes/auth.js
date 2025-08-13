const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // <-- 1. IMPORT THE JWT LIBRARY

// Signup
router.post('/signup', async (req, res) => {
    const { username, firstName, lastName  , email, password } = req.body;

    console.log('Signup attempt for email:', email);
    console.log('Request body:', req.body);

    // --- No changes to your validation logic ---
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    // --- End of validation ---

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            username,
            firstName,
            lastName,
            email,
            password,
        });

        await user.save();
        console.log('User created successfully:', email);
        
        // --- ADDED JWT GENERATION ON SIGNUP ---
        // <-- 2. Create the payload for the token
        const payload = {
            user: {
                id: user.id // Use the MongoDB document ID
            }
        };

        // <-- 3. Sign the token with your secret key
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env file
            { expiresIn: '5h' },   // Token expires in 5 hours
            (err, token) => {
                if (err) throw err;
                // <-- 4. Send the token back to the client
                res.json({ message: 'Signup successful', token });
            }
        );
        // --- END OF JWT GENERATION ---

    } catch (err) {
        console.error('Signup error details:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Signin
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log('Signin attempt for email:', email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // --- ADDED JWT GENERATION ON SIGNIN ---
        // <-- 2. Create the payload for the token
        const payload = {
            user: {
                id: user.id // Use the MongoDB document ID
            }
        };
        
        console.log('Sign in successful, creating token for user:', email);
        
        // <-- 3. Sign the token with your secret key
        jwt.sign(
            payload,
            process.env.JWT_SECRET,   // Your secret key from .env file
            { expiresIn: '5h' },      // Token expires in 5 hours
            (err, token) => {
                if (err) throw err;
                // <-- 4. Send the token and user info back to the client
                res.json({ 
                    message: 'Sign in successful', 
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username
                    }
                });
            }
        );
        // --- END OF JWT GENERATION ---
        
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Google OAuth route
router.post('/google', async (req, res) => {
    const { email, name, appwriteId } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                firstName: name,
                email,
                appwriteId,
            });
            await user.save();
        }
        
        // --- ADDED JWT GENERATION ON OAUTH ---
        // <-- 2. Create the payload for the token
        const payload = {
            user: {
                id: user.id
            }
        };

        // <-- 3. Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                // <-- 4. Send the token back
                res.status(200).json({ message: 'Google login successful', token });
            }
        );
        // --- END OF JWT GENERATION ---
        
    } catch (err) {
        console.error('OAuth error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;  