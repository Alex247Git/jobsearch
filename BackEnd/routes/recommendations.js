const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authorizeSelf } = require('../middleware/auth');
const authorizeOwner = require('../middleware/authorizeOwner');

router.get("/jobs/:candidate_id", authenticateToken, authorizeSelf("candidate_id"), async (req, res) => {
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

router.get('/candidates/:userId', authenticateToken, authorizeSelf('userId'), async (req, res) => {
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
    try {
        const [results] = await db.promise().query(sql, params);
        res.json(results);
    } catch (err) {
        console.error("Error fetching candidate recommendations:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ PUT - Update recommendation score
// Ownership: the score is server-generated (AI worker). Only the user
// whose recommendation this is may touch it, and only with a sane value.
router.put("/:recommendation_id", authenticateToken, authorizeOwner("recommendation_id", "recommendations", "user_id"), async (req, res) => {
    const { recommendation_id } = req.params;
    const { score } = req.body;

    // Validate type and range: MySQL would otherwise throw a 500 on a
    // non-numeric value, and an out-of-range score corrupts the ranking.
    const n = Number(score);
    if (score === undefined || score === null || !Number.isFinite(n)) {
        return res.status(400).json({ error: "Score must be a number" });
    }
    if (n < 0 || n > 10) {
        return res.status(400).json({ error: "Score must be between 0 and 10" });
    }

    try {
        const [result] = await db.promise().execute(
            `UPDATE recommendations SET score = ? WHERE recommendation_id = ?`,
            [n, recommendation_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Recommendation not found" });
        }
        res.json({ message: "Recommendation updated" });
    } catch (error) {
        console.error("❌ Error updating recommendation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ DELETE - Remove recommendation
// Ownership: same rule as PUT — you can only delete your own row.
router.delete("/:recommendation_id", authenticateToken, authorizeOwner("recommendation_id", "recommendations", "user_id"), async (req, res) => {
    const { recommendation_id } = req.params;

    try {
        const [result] = await db.promise().execute(
            `DELETE FROM recommendations WHERE recommendation_id = ?`,
            [recommendation_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Recommendation not found" });
        }
        res.json({ message: "Recommendation deleted" });
    } catch (error) {
        console.error("❌ Error deleting recommendation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ POST - Trigger recommendation generation (manual)
router.post("/generate", authenticateToken, async (req, res) => {
    const recommendationService = require('../services/recommendationService');
    const { type } = req.body; // 'job', 'candidate', or 'all'
    
    // Return immediately, process in background
    res.json({ message: "Recommendation generation started", status: "running" });
    
    // Run in background (don't await)
    recommendationService.generateForAll().catch(err => {
        console.error("Manual recommendation generation failed:", err);
    });
});

// ✅ GET - Check generation status
router.get("/status", authenticateToken, async (req, res) => {
    const recommendationService = require('../services/recommendationService');
    res.json(recommendationService.getStatus());
});

module.exports = router;
