const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    // Normal HTTP requests handler
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy Server Running Smoothly');
});

// The strict CONNECT handler required for HTTP1.1 200 Established
server.on('connect', (req, clientSocket, head) => {
    const srvUrl = url.parse(`http://${req.url}`);
    console.log(`Creating Tunnel to: ${srvUrl.hostname}:${srvUrl.port || 443}`);

    const serverSocket = net.connect(srvUrl.port || 443, srvUrl.hostname, () => {
        // Send the exact target signal you are looking for back to the caller
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', () => {
        clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    });
    
    clientSocket.on('error', () => serverSocket.end());
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy listening on port ${PORT}`);
});
          
