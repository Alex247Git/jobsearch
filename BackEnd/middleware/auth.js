const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Object-level authorization: the route param must reference the
// authenticated user's own id. Pass the param name(s) that hold the
// user id, e.g. authorizeSelf('user_id') or authorizeSelf('employerId').
const authorizeSelf = (...paramNames) => (req, res, next) => {
    const ownId = req.user && req.user.user_id;
    if (ownId === undefined || ownId === null) {
        return res.status(403).json({ error: 'Invalid token payload' });
    }
    for (const name of paramNames) {
        if (req.params[name] !== undefined && String(req.params[name]) === String(ownId)) {
            return next();
        }
    }
    return res.status(403).json({ error: 'Forbidden: you can only access your own resources' });
};

// Role-based authorization, e.g. requireRole('employer').
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: `Forbidden: requires role: ${roles.join(' or ')}` });
    }
    next();
};

module.exports = { authenticateToken, authorizeSelf, requireRole };
