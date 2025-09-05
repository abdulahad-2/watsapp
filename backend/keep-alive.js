// Keep-alive service to prevent Render from sleeping
const https = require('https');

const BACKEND_URL = 'https://watsapp-backend-mscv.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes (Render sleeps after 15 minutes)

function pingServer() {
  const url = `${BACKEND_URL}/health`;
  
  https.get(url, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`Keep-alive error: ${err.message} at ${new Date().toISOString()}`);
  });
}

// Start keep-alive pings (one-time startup ping + interval)
console.log(`Keep-alive service started. Pinging ${BACKEND_URL}/health every ${PING_INTERVAL / 60000} minutes...`);
pingServer();
setInterval(pingServer, PING_INTERVAL);
