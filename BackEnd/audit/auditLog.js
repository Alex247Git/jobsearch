// Simple append-only audit log. Persists to BackEnd/audit/audit.log (newline-delimited JSON).
// Each entry: { ts, event, user_id, role, ip, method, path, status, user_agent }.
// In production swap the file write for a DB table or a remote log pipeline (CloudWatch, etc.).
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'audit.log');

const writeEntry = (entry) => {
    try {
        fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
    } catch (err) {
        // Never let audit logging fail the request
        console.error('audit log write failed:', err.message);
    }
};

// Exposed as an Express middleware. Captures the request + the response status,
// then logs once the handler is done. Skips /api/health, static, and OPTIONS.
const auditMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS' || req.path === '/health') {
        return next();
    }
    res.on('finish', () => {
        // Skip 2xx for non-sensitive routes to keep the log volume manageable
        if (res.statusCode < 400 && !req.path.startsWith('/login')
            && !req.path.startsWith('/users') && !req.path.startsWith('/messages')) {
            return;
        }
        writeEntry({
            ts: new Date().toISOString(),
            event: 'http',
            user_id: req.user?.user_id ?? null,
            role: req.user?.role ?? null,
            ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            user_agent: req.headers['user-agent'],
        });
    });
    next();
};

// For explicit sensitive events (login success/fail, role change, password change).
const logEvent = (event, req, extra = {}) => {
    writeEntry({
        ts: new Date().toISOString(),
        event,
        user_id: req?.user?.user_id ?? extra.user_id ?? null,
        role: req?.user?.role ?? extra.role ?? null,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || null,
        method: req?.method,
        path: req?.originalUrl,
        status: 200,
        user_agent: req?.headers?.['user-agent'],
        ...extra,
    });
};

module.exports = { auditMiddleware, logEvent, LOG_FILE };
