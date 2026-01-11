const dgram = require('dgram');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Create UDP server
const udpServer = dgram.createSocket('udp4');

// Create HTTP server
const httpServer = http.createServer((req, res) => {
  console.log(`HTTP request: ${req.method} ${req.url}`);

  if (req.url === '/') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: Could not load index.html');
        console.error('Error reading HTML file:', err);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url.endsWith('.html')) {
    // Serve any HTML file
    const fileName = req.url.substring(1); // Remove leading slash
    const htmlPath = path.join(__dirname, fileName);
    console.log(`Attempting to serve HTML file: ${htmlPath}`);
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`HTML file not found: ${fileName}`);
        console.error('Error reading HTML file:', err);
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
      console.log(`Successfully served ${fileName}`);
    });
  } else if (req.url.endsWith('.js')) {
    // Serve any JavaScript file
    const fileName = req.url.substring(1); // Remove leading slash
    const jsPath = path.join(__dirname, fileName);
    console.log(`Attempting to serve JS file: ${jsPath}`);
    fs.readFile(jsPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`JavaScript file not found: ${fileName}`);
        console.error('Error reading JavaScript file:', err);
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
      console.log(`Successfully served ${fileName}`);
    });
  } else if (req.url.endsWith('.json')) {
    // Serve any JSON file
    const fileName = req.url.substring(1); // Remove leading slash
    const jsonPath = path.join(__dirname, fileName);
    console.log(`Attempting to serve JSON file: ${jsonPath}`);
    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`JSON file not found: ${fileName}`);
        console.error('Error reading JSON file:', err);
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
      console.log(`Successfully served ${fileName}`);
    });
  } else if (req.url.endsWith('.glb')) {
    const fileName = req.url.substring(1); // Remove leading slash
    const glbPath = path.join(__dirname, fileName);
    console.log(`Attempting to serve GLB file: ${glbPath}`);
    fs.readFile(glbPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`GLB file not found: ${fileName}`);
        console.error('Error reading GLB file:', err);
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'model/gltf-binary',
        'Cache-Control': 'no-cache',
      });
      res.end(data);
      console.log(`Successfully served ${fileName}`);
    });
  } else if (req.url === '/api/local-ip') {
    // Return the numeric, non-loopback IP used by the server
    const ip = getLocalIp();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    res.end(JSON.stringify({ ip }));
    console.log(`Served local IP via /api/local-ip: ${ip}`);
    return;
  } else {
    console.log(`404 - File not found: ${req.url}`);
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server: httpServer });

// Store connected WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    const data = message.toString();
    console.log(`WebSocket message received: ${data}`);

    // Send the message to the device via UDP
    if (lastDeviceAddress) {
      udpServer.send(data, lastDeviceAddress.port, lastDeviceAddress.address, (err) => {
        if (err) {
          console.error('Error sending UDP message:', err);
        } else {
          console.log(`Sent to device [${lastDeviceAddress.address}:${lastDeviceAddress.port}]: ${data}`);
        }
      });
    } else {
      console.warn('No device address known yet. Waiting for device to send data first.');
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast data to all connected WebSocket clients
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Store last known device address
let lastDeviceAddress = null;

udpServer.on('message', (msg, rinfo) => {
  const data = msg.toString();

  // Remember the device address for sending messages back
  lastDeviceAddress = { address: rinfo.address, port: rinfo.port };

  // Broadcast to all connected WebSocket clients
  broadcast(data);
});

// Helper: return the first non-internal IPv4 address (numeric), or 127.0.0.1 as fallback
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1'; // fallback
  for (let iface in interfaces) {
    for (let addr of interfaces[iface]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIP = addr.address;
        break;
      }
    }
    if (localIP !== '127.0.0.1') break;
  }
  return localIP;
}

udpServer.on('listening', () => {
  const address = udpServer.address();
  const localIP = getLocalIp();
  console.log(`UDP server listening on ${localIP}:${address.port}`);
  console.log('Waiting for data...');
});

udpServer.bind(41234); // Bind to port 41234

// Start HTTP/WebSocket server
const HTTP_PORT = 3000;
httpServer.listen(HTTP_PORT, () => {
  const localIP = getLocalIp();
  console.log(`Web server running at http://${localIP}:${HTTP_PORT}`);
  console.log(`Open http://localhost:${HTTP_PORT} in your browser`);
});
