  import React, { useEffect, useState } from 'react';
import { account } from '../utils/appwrite';

const OAuthCallback = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    account.get()
      .then((userData) => {
        setUser(userData);
        // Parse and store user info for Google sign-in
        const parsedUser = {
          email: userData.email,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
        };
        localStorage.setItem('user', JSON.stringify(parsedUser));
        console.log('PrivateRoute check - user:', JSON.stringify(parsedUser));
        console.log('User data parsed:', parsedUser);
      })
      .catch((err) => {
        // If missing scope (account), redirect to login
        if (err.message && err.message.includes('missing scope (account)')) {
          window.location.href = '/login';
        } else {
          setError(err.message || 'OAuth callback error');
        }
      });
  }, []);

  if (error) {
    return <div>OAuth callback error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name || user.email}!</h2>
      {/* ...other UI... */}
    </div>
  );
};

export default OAuthCallback;
