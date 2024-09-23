/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');

const path = require('path');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  if (request.url === '/' || request.url === '/client.html') {
    const filePath = path.join(__dirname, '../client/client.html');

    // Read the HTML file from the filesystem
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('File read error:', err); // Log the error
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.write('Internal Server Error');
        response.end();
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
      }
    });
  }
  const sendResponse = (statusCode, message) => {
    const jsonResponse = {
      message,
      id: statusCode,
    };
    const acceptHeader = request.headers['.accept'] || 'application/json';
    
    if (acceptHeader.includes('text/xml')) {
        contentType = 'text/xml';
        response.writeHead(statusCode, { 'Content-Type': contentType });
        const xmlResponse = `<message>${message}</message><id>${statusCode}</id>`;
        response.end(xmlResponse);
      } else {
        response.writeHead(statusCode, { 'Content-Type': contentType });
        response.end(JSON.stringify(jsonResponse));
      }
    };
  const codes = request.url;
  // Handle various routes
  switch (codes) {
    case '/success':
      sendResponse(200, 'Success!');
      break;
    case '/badRequest':
      const validQuery = new URLSearchParams(request.url.split('?')[1]).get('valid');
      if (!validQuery) {
        sendResponse(400, 'Bad Request: missing query parameter ?valid=true');
      } else if (validQuery === 'true') {
        sendResponse(200, 'Bad Request but valid!');
      }
      break;
    case '/unauthorized':
      const loggedInQuery = new URLSearchParams(request.url.split('?')[1]).get('loggedIn');
      if (!loggedInQuery) {
        sendResponse(401, 'Unauthorized: missing query parameter ?loggedIn=yes');
      } else if (loggedInQuery === 'yes') {
        sendResponse(200, 'Unauthorized but logged in!');
      }
      break;
    case '/forbidden':
      sendResponse(403, 'Forbidden');
      break;
    case '/internal':
      sendResponse(500, 'Internal Server Error');
      break;
    case '/notImplemented':
      sendResponse(501, 'Not Implemented');
      break;
    default:
      sendResponse(404, 'Not Found');
      break;
  }
};

const server = http.createServer(onRequest);

server.listen(port, () => {
// eslint-disable-next-line no-console
  console.log(`Listening on 127.0.0.1:${port}`);
});
