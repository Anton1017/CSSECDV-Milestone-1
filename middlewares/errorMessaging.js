function sseMiddleware(req, res, next) {
    // Set the headers to establish an SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Store the response object so we can send messages later
    req.app.locals.clients = req.app.locals.clients || [];
    req.app.locals.clients.push(res);

    // Clean up when the client closes the connection
    req.on('close', () => {
        req.app.locals.clients = req.app.locals.clients.filter(client => client !== res);
    });
}

function sendSSEMessage(clients, message) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
    });
}

function sseErrorHandlingMiddleware(err, req, res, next) {
    const isDebugMode = process.env.DEBUG_MODE === 'true';
    
    if (isDebugMode && req.app.locals.clients) {
        sendSSEMessage(req.app.locals.clients, {
            message: err.message,
            stack: err.stack,
        });
    }
    
    res.status(500).json({ message: err.message });
}

module.exports = {
    sseMiddleware,
    sseErrorHandlingMiddleware,
    sendSSEMessage,
};
