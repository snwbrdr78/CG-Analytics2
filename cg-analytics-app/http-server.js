const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
  } else if (req.url === '/') {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'CG Analytics API Server' }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server running on port ${PORT}`);
});