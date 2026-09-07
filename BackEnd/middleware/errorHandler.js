// Central error handler. Routes call next(err) (or throw) and this
// converts it to a consistent JSON response. Keep the real error in
// the log — never leak internals to the client.
const errorHandler = (err, req, res, _next) => {
    console.error('Unhandled error:', err);
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
};

module.exports = errorHandler;