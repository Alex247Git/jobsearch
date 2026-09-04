const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require('../middleware/auth');

router.get("/jobs/:candidate_id", authenticateToken, async (req, res) => {
    const candidate_id = parseInt(req.params.candidate_id);
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    if (isNaN(candidate_id) || isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ error: "Invalid parameters" });
    }
    try {
        const query = `
            SELECT 
                r.recommendation_id, 
                r.job_id, 
                j.title, 
                j.description, 
                j.location, 
                j.salary,
                j.job_type,
                j.category,
                j.remote_option,
                j.created_at,
                e.user_id AS employer_id, 
                c.company_name,          
                r.score
            FROM recommendations r
            JOIN jobs j ON r.job_id = j.job_id
            JOIN employers e ON j.job_id = e.job_id
            JOIN companies c ON j.company_id = c.company_id
            WHERE r.user_id = ? AND r.recommendation_type = 'job'
            ORDER BY r.score DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        const [rows] = await db.promise().execute(query, [candidate_id]);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching job recommendations:", error);
        res.status(500).json({ error: "Failed to get job recommendations" });
    }
});

router.get('/candidates/:userId', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.userId);
    const jobId = req.query.job_id ? parseInt(req.query.job_id) : null;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }
    let sql = `
        SELECT 
        r.recommendation_id, r.candidate_id, r.score, r.job_id,
        u.first_name, u.last_name, u.email, u.phone_number,
        p.*,
        c.availability
        FROM recommendations r
        JOIN users u ON r.candidate_id = u.user_id
        LEFT JOIN profiles p ON p.user_id = r.candidate_id
        LEFT JOIN candidates c ON c.user_id = r.candidate_id
        WHERE r.user_id = ? AND r.recommendation_type = 'candidate' AND availability = 'Yes'
    `;
    const params = [userId];
    if (jobId) {
        sql += ' AND r.job_id = ?';
        params.push(jobId);
    }
    sql += ' ORDER BY r.score DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error fetching candidate recommendations:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ✅ PUT - Update recommendation score
router.put("/:recommendation_id", authenticateToken, async (req, res) => {
    const { recommendation_id } = req.params;
    const { score } = req.body;

    if (!score) {
        return res.status(400).json({ error: "Score is required" });
    }

    try {
        await db.promise().execute(
            `UPDATE recommendations SET score = ? WHERE recommendation_id = ?`,
            [score, recommendation_id]
        );
        res.json({ message: "Recommendation updated" });
    } catch (error) {
        console.error("❌ Error updating recommendation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ DELETE - Remove recommendation
router.delete("/:recommendation_id", authenticateToken, async (req, res) => {
    const { recommendation_id } = req.params;

    try {
        await db.promise().execute(
            `DELETE FROM recommendations WHERE recommendation_id = ?`,
            [recommendation_id]
        );
        res.json({ message: "Recommendation deleted" });
    } catch (error) {
        console.error("❌ Error deleting recommendation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
