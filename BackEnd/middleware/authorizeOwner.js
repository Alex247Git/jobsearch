// Resource-based authorization: lookup a resource by id, check that its
// owner field matches the authenticated user. Eliminates the ad-hoc
// ownership queries scattered across route handlers.
//
// Usage:
//   const authorizeApplicationOwner = authorizeOwner('application_id', 'applications', 'user_id');
//   router.put('/:application_id', authenticateToken, authorizeApplicationOwner, handler);
//
// On success, the loaded row is attached to req.resource so the handler
// can use it without a second query.

const db = require('../db');

const authorizeOwner = (paramName, tableName, ownerColumn = 'user_id') =>
    async (req, res, next) => {
        if (!req.user || req.user.user_id == null) {
            return res.status(403).json({ error: 'Invalid token payload' });
        }
        const id = req.params[paramName];
        if (id === undefined) {
            return res.status(400).json({ error: `Missing path parameter: ${paramName}` });
        }
        try {
            // Whitelist table/column to prevent injection via route params
            if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !/^[a-zA-Z0-9_]+$/.test(ownerColumn)) {
                return res.status(500).json({ error: 'Invalid authorizeOwner config' });
            }
            const [rows] = await db.promise().query(
                `SELECT \`${ownerColumn}\` AS owner_id FROM \`${tableName}\` WHERE ${paramName === 'id' ? 'id' : paramName} = ? LIMIT 1`,
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Resource not found' });
            }
            if (String(rows[0].owner_id) !== String(req.user.user_id)) {
                return res.status(403).json({ error: 'Forbidden: you do not own this resource' });
            }
            req.resource = rows[0];
            next();
        } catch (err) {
            console.error(`authorizeOwner(${paramName}, ${tableName}) failed:`, err.message);
            res.status(500).json({ error: 'Authorization check failed' });
        }
    };

module.exports = authorizeOwner;
