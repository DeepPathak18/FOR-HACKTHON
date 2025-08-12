const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, phoneNumber, gender, email, password } = req.body;

    console.log('Signup attempt for email:', email);

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        const missingFields = [];
        if (!firstName) missingFields.push('first name');
        if (!lastName) missingFields.push('last name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        
        return res.status(400).json({ 
            message: `Missing required fields: ${missingFields.join(', ')}` 
        });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        console.log('Attempting to find existing user...');
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating new user...');
        user = new User({
            firstName,
            lastName,
            phoneNumber,
            gender,
            email,
            password,
        });

        console.log('Saving user to database...');
        await user.save();
        console.log('User created successfully:', email);

        res.json({ message: 'Signup successful' });
    } catch (err) {
        console.error('Signup error details:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Signin attempt for email:', email);
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Use the matchPassword method to compare hashed password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Success: send user info or token
    console.log('Sign in successful for user:', email);
    res.json({ 
      message: 'Sign in successful', 
      user: { 
        _id: user._id, // Add MongoDB document ID
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        // Add any other fields needed for profile
      } 
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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
    res.status(200).json({ message: 'Google login successful', user });
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
