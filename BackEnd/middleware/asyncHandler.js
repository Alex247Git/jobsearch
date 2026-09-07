// Wrap async route handlers to forward errors to the central
// error handler. Without this, an unhandled promise rejection in
// an async handler would just hang the request.
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
