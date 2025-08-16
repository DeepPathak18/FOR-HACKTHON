const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
            { expiresIn: '1d' },   // Token expires in 5 hours
            (err, token) => {
                if (err) throw err;
                // <-- 4. Send the token back to the client
                res.json({ 
                    message: 'Signup successful', 
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

        // Log login activity
        const loginActivity = new Activity({
            user: user._id,
            activityType: 'login',
            description: 'User logged in.',
        });
        await loginActivity.save();

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

// Google Sign-In
router.post('/google-signin', async (req, res) => {
    const { email, firstName, lastName, googleId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                email,
                firstName,
                lastName,
                googleId,
                // You might want to generate a random password or handle this differently
                password: Math.random().toString(36).slice(-8),
            });
            await user.save();
        }

        // Log login activity
        const loginActivity = new Activity({
            user: user._id,
            activityType: 'login',
            description: 'User logged in via Google.',
        });
        await loginActivity.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
            },
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Sign in successful',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                    },
                });
            }
        );
    } catch (err) {
        console.error('Google Sign-in error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GitHub OAuth
router.get('/github', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    // Fetch user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`
      }
    });

    const githubUser = userResponse.data;
    let email = githubUser.email;

    // If email is null, fetch from the primary email endpoint
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${access_token}`
        }
      });
      const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
      if (primaryEmail) {
        email = primaryEmail.email;
      }
    }

    if (!email) {
      return res.status(400).send("Could not retrieve a verified email from GitHub.");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: githubUser.name || githubUser.login,
        lastName: '',
        githubId: githubUser.id,
        password: Math.random().toString(36).slice(-8),
      });
      await user.save();
    }

    // Log login activity
    const loginActivity = new Activity({
        user: user._id,
        activityType: 'login',
        description: 'User logged in via GitHub.',
    });
    await loginActivity.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);

  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 1. Create an API client (e.g., api.js)
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Use an interceptor to add the token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));


// Use a response interceptor to handle expired tokens
api.interceptors.response.use(
    (response) => response, // Simply return the response if it's successful
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and it's an expired token error
        if (error.response.status === 401 && error.response.data.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            originalRequest._retry = true; // Mark it as retried

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Request a new access token using the refresh token
                const { data } = await axios.post('http://localhost:5000/api/auth/refresh-token', { refreshToken });

                // Store the new access token
                localStorage.setItem('accessToken', data.accessToken);

                // Update the header of the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If the refresh token is also invalid, logout the user
                console.error("Refresh token failed", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/signin'; // Redirect to login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Profile fetching function
const fetchProfile = async () => {
    try {
        const response = await api.get('/profile/me'); // This will automatically handle token refresh
        setProfile(response.data);
    } catch (error) {
        console.error("Failed to fetch profile", error);
    }
}

module.exports = router;