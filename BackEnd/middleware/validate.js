// Declarative body validation. Keeps numeric/required checks out of
// individual route handlers so a new route cannot forget them.
//
// Usage:
//   router.post('/', authenticateToken,
//       validateBody({ company_id: 'int', salary: 'number?' }),
//       handler);
//
// Types: 'int', 'number', 'string', 'string?', 'int?', 'number?'
//   '?' suffix = optional (skipped when undefined/null).
// On failure it responds 400 with the offending field names.

const RULES = {
    int: (v) => Number.isInteger(v) && v > 0,
    intOptional: (v) => v === undefined || v === null || (Number.isInteger(v) && v > 0),
    number: (v) => Number.isFinite(v),
    numberOptional: (v) => v === undefined || v === null || Number.isFinite(v),
    string: (v) => typeof v === 'string' && v.trim() !== '',
    stringOptional: (v) => v === undefined || v === null || typeof v === 'string',
};

const validateBody = (schema) => (req, res, next) => {
    const problems = [];
    for (const [field, rule] of Object.entries(schema)) {
        const value = req.body ? req.body[field] : undefined;
        const check = RULES[rule];
        if (!check) {
            // Misconfiguration is a server bug, not a client error.
            return res.status(500).json({ error: `Unknown validation rule: ${rule}` });
        }
        if (!check(value)) {
            problems.push(field);
        }
    }
    if (problems.length > 0) {
        return res.status(400).json({
            error: `Invalid field(s): ${problems.join(', ')}`,
            fields: problems,
        });
    }
    next();
};

module.exports = { validateBody };
