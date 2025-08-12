import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import all your page components
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile.jsx';
import OAuthCallback from './components/OAuthCallback.jsx';

// Your PrivateRoute component remains the same
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      JSON.parse(user); // Just validate if it's a valid JSON
      return children;
    } catch (error) {
      console.error('Error parsing user data, redirecting:', error);
      return <Navigate to="/signin" />;
    }
  }
  return <Navigate to="/signin" />;
};


function App() {
    return (
        <Router>
            <Routes>
                {/* The LandingPage component is now used for the root path */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Your other routes remain the same */}
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute><Dashboard /></PrivateRoute>}
                />
                <Route path="/profile" element={<Profile />} />
                
                {/* A catch-all route to redirect unknown paths back to the home page */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;