import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6893bc88002d2718b00e');

const account = new Account(client);
export { client, account };

const handleGoogleLogin = () => {
  account.createOAuth2Session(
    'google',
    'http://localhost:5173/dashboard', // Success redirect to dashboard
    'http://localhost:5173/signin'     // Failure redirect
  );
};

export default {
  mongoURI: 'mongodb://localhost:27017/user',
};