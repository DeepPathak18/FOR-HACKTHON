import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all your page components
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile.jsx';
import ActivityPage from './components/ActivityPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import AuthCallback from './components/AuthCallback.jsx';

// Your PrivateRoute component remains the same
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return children;
  }
  return <Navigate to="/signin" />;
};


function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* The LandingPage component is now used for the root path */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Your other routes remain the same */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
            path="/dashboard" 
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route 
            path="/profile" 
            element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        <Route 
            path="/activity" 
            element={<PrivateRoute><ActivityPage /></PrivateRoute>}
        />
        
        {/* A catch-all route to redirect unknown paths back to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;