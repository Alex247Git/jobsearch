// Central error handler. Routes call next(err) (or throw) and this
// converts it to a consistent JSON response. Keep the real error in
// the log — never leak internals to the client.
const errorHandler = (err, req, res, _next) => {
    // Map known MySQL error classes to client-friendly HTTP statuses.
    // ER_NO_REFERENCED_ROW_2 = foreign key violation (parent missing)
    // ER_DUP_ENTRY           = unique constraint violation
    // ER_ROW_IS_REFERENCED_2 = foreign key violation (child exists)
    const code = err.code || err.errno;
    if (code === 'ER_NO_REFERENCED_ROW_2' || code === 'ER_ROW_IS_REFERENCED_2') {
        console.warn('Foreign key violation:', err.message);
        return res.status(400).json({ error: 'Referenced record does not exist' });
    }
    if (code === 'ER_DUP_ENTRY') {
        console.warn('Duplicate entry:', err.message);
        return res.status(409).json({ error: 'Resource already exists' });
    }
    if (code === 'ER_BAD_NULL_ERROR') {
        console.warn('Required field missing:', err.message);
        return res.status(400).json({ error: 'Required field is missing' });
    }
    console.error('Unhandled error:', err);
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
};

module.exports = errorHandler;