const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, '..', 'logs', 'user-actions.log');
const errorLogFilePath = path.join(__dirname, '..', 'logs', 'errors.log');

// Queue to hold log messages
let logQueue = [];
let errorLogQueue = [];
let isWriting = false;
let isWritingError = false;

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

function writeErrorLog() {
  if (errorLogQueue.length === 0 || isWritingError) {
    return;
  }

  isWritingError = true;
  const logEntry = errorLogQueue.shift();

  fs.appendFile(errorLogFilePath, logEntry, (err) => {
    isWritingError = false;
    if (err) {
      console.error('Failed to write to error log file:', err);
    }
    writeErrorLog();
  });
}

// Function to log messages
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  logQueue.push(logEntry);
  writeLog();
}

function logErrorMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  errorLogQueue.push(logEntry);
  writeErrorLog();
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

async function withErrorHandling(fn) {
  try{
    await fn()
  } catch(error){
    console.log(error.message)
    logErrorMessage(error.message)
  }
}

// Export the middleware function
module.exports = logMiddleware;
