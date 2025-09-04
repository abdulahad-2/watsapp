// Keep-alive service to prevent Render from sleeping
const https = require('https');

const BACKEND_URL = 'https://watsapp-backend-mscv.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15 minutes)

function pingServer() {
  const url = `${BACKEND_URL}/health`;
  
  https.get(url, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`Keep-alive error: ${err.message} at ${new Date().toISOString()}`);
  });
}

// Start keep-alive pings
console.log('Starting keep-alive service...');
setInterval(pingServer, PING_INTERVAL);

// Initial ping
pingServer();
