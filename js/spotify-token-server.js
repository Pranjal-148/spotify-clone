// js/spotify-token-server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());

const CLIENT_ID = 'd8de5026adfa44a2844ba3bce1ee4a82';
const CLIENT_SECRET = '7f2fb92ee69845139727825d62a96bf5';

app.get('/api/spotify-token', async (req, res) => {
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch token from Spotify' });
    }

    const data = await response.json();
    res.json({ access_token: data.access_token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
