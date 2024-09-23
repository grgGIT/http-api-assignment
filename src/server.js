const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Function to send response based on status code and accept header
const sendResponse = (statusCode, message, response, acceptHeader) => {
  let id;
  if (statusCode === 200) {
    id = 'success';
  } else if (statusCode === 400) {
    id = 'badRequest';
  } else if (statusCode === 401) {
    id = 'unauthorized';
  } else if (statusCode === 403) {
    id = 'forbidden';
  } else if (statusCode === 500) {
    id = 'internal';
  } else if (statusCode === 501) {
    id = 'notImplemented';
  } else {
    id = 'notFound';
  }
  // Prepare response messages
  const jsonResponse = { message, id };
  const xmlResponse = `<response><message>${message}</message><id>${id}</id></response>`;

  // Log the appropriate message to the console based on acceptHeader
  if (acceptHeader.includes('text/xml')) {
    console.log(`XML Response: ${xmlResponse}`);
    response.writeHead(statusCode, { 'Content-Type': 'text/xml' });
    response.end(xmlResponse);
  } else {
    console.log(`JSON Response: ${JSON.stringify(jsonResponse)}`);
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(jsonResponse));
  }
};

const onRequest = (request, response) => {
  const { url, headers } = request;
  const acceptHeader = headers.accept || 'application/json';

  // Serve the HTML file
  if (url === '/' || url === '/client.html') {
    const filePath = path.join(__dirname, '../client/client.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal Server Error');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
      }
    });
    return;
  }

  // Serve the CSS file
  if (url === '/style.css') {
    const filePath = path.join(__dirname, '../client/style.css');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('CSS file read error:', err);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('Internal Server Error');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.end(data);
      }
      console.log('Requesting CSS:', url);
    });
    return;
  }

  const validQuery = new URLSearchParams(url.split('?')[1]).get('valid');
  const loggedInQuery = new URLSearchParams(url.split('?')[1]).get('loggedIn');

  // Handle different status codes based on URL
  switch (url.split('?')[0]) {
    case '/success':
      sendResponse(200, 'Success!', response, acceptHeader);
      break;
    case '/badRequest':
      if (!validQuery) {
        sendResponse(400, 'Bad Request: Missing query parameter ?valid=true', response, acceptHeader);
      } else if (validQuery === 'true') {
        sendResponse(200, 'Valid Request!', response, acceptHeader);
      }
      break;
    case '/unauthorized':
      if (!loggedInQuery) {
        sendResponse(401, 'Unauthorized: Missing query parameter ?loggedIn=yes', response, acceptHeader);
      } else if (loggedInQuery === 'yes') {
        sendResponse(200, 'Authorized Access!', response, acceptHeader);
      }
      break;
    case '/forbidden':
      sendResponse(403, 'You do not have access to this content.', response, acceptHeader);
      break;
    case '/internal':
      sendResponse(500, 'Internal Server Error', response, acceptHeader);
      break;
    case '/notImplemented':
      sendResponse(501, 'Not Implemented', response, acceptHeader);
      break;
    default:
      sendResponse(404, 'Not Found', response, acceptHeader);
      break;
  }
};

// Create and run the server
const server = http.createServer(onRequest);

server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
