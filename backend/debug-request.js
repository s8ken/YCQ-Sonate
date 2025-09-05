const express = require('express');
const app = express();

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log('=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Origin:', req.get('Origin'));
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('Body:', body);
    console.log('========================');
    res.status(200).json({ received: true, body: body });
  });
});

app.listen(5001, () => {
  console.log('Debug server listening on port 5001');
});