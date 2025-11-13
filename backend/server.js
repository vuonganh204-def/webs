const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Middleware to enable CORS for requests from the frontend

// This must be the same Google Client ID used on your frontend.
const GOOGLE_CLIENT_ID = '247650939217-bmlgs6mlbkoetd66qthsfovaceibbnh0.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies the Google ID token and returns the user payload.
 * @param {string} token - The Google ID token from the frontend.
 * @returns {Promise<object|null>} The user payload if verification is successful, otherwise null.
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

// API endpoint for validating the Google token
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'ID token not provided.' });
  }

  const payload = await verifyGoogleToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Invalid ID token. Authentication failed.' });
  }

  // At this point, the user's identity is verified.
  // You would typically find this user in your database via their email (payload.email)
  // or create a new user account if they don't exist.
  // After that, you would generate your own application-specific session token or JWT for them.

  console.log('Successfully verified user payload:', payload);

  res.status(200).json({
    message: 'Authentication successful!',
    user: {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub, // The user's unique Google ID
    },
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`To test, send a POST request to http://localhost:${PORT}/api/auth/google`);
  console.log('Request body should be: { "token": "YOUR_GOOGLE_ID_TOKEN" }');
});
