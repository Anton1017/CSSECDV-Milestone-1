const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, '..', 'logs', 'user-actions.log');

// Queue to hold log messages
let logQueue = [];
let isWriting = false;

// Function to write log entries from the queue to the log file
function writeLog() {
  if (logQueue.length === 0 || isWriting) {
    return;
  }

  isWriting = true;
  const logEntry = logQueue.shift();

  fs.appendFile(logFilePath, logEntry, (err) => {
    isWriting = false;
    if (err) {
      console.error('Failed to write to log file:', err);
    }
    writeLog();
  });
}

// Function to log messages
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  logQueue.push(logEntry);
  writeLog();
}

// Middleware to log user actions
function logMiddleware(req, res, next) {
  res.on('finish', () => {
    const user = req.session && req.session.user && req.session.user.username ? req.session.user.username : 'Guest';
    const statusMsg = res.locals.logMessage || "N/A"
    const message = `IP: ${req.ip}, User: ${user}, Method: ${req.method}, URL: ${req.url}, Message: ${statusMsg}`;
    console.log(res.locals)
    logMessage(message);
  });
  next();
}

// Export the middleware function
module.exports = logMiddleware;
