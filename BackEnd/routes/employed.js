const express = require("express");
const router = express.Router();
const db = require('../db');

// Create a new employed record
router.post("/", async (req, res) => {
    const { user_id, job_id, employer_id, employment_start_date, employment_end_date, salary, employment_status, notes } = req.body;

    if (!user_id || !job_id || !employer_id || !employment_start_date || !employment_status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const [result] = await db.promise().execute(
            `INSERT INTO employed (user_id, job_id, employer_id, employment_start_date, employment_end_date, salary, employment_status, notes, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [user_id, job_id, employer_id, employment_start_date, employment_end_date || null, salary || null, employment_status, notes || null]
        );
        res.status(201).json({ message: "Employment record created", employed_id: result.insertId });
    } catch (error) {
        console.error("❌ Error creating employment record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get employment records for a specific user with employer and job details
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.promise().execute(`
                    SELECT em.*, 
            j.title AS job_title, j.description AS job_description, 
            j.location AS job_location, j.skills_required AS job_skills, 
            j.salary AS job_salary, j.job_type AS job_type, j.category AS job_category,
            j.updated_at AS job_updated_at, 
            e.company_id AS company_id, 
            c.company_name AS company_name, c.industry AS company_industry, 
            c.location AS company_location,
            em.employed_id, em.employment_start_date, em.employment_end_date,
            em.salary AS employment_salary, em.employment_status, em.notes, em.created_at AS employment_created_at,
            
            -- Employer Profile Info
            p.age AS employer_age,
            p.bio AS employer_bio,
            p.location AS employer_location,
            p.website AS employer_website,
            p.certifications AS employer_certifications,
            p.languages AS employer_languages,
            p.social_links AS employer_social_links,
            p.cv AS employer_cv

        FROM employed em
        LEFT JOIN employers e ON em.employer_id = e.user_id
        LEFT JOIN jobs j ON em.job_id = j.job_id
        LEFT JOIN companies c ON e.company_id = c.company_id
        LEFT JOIN profiles p ON p.user_id = em.employer_id
        WHERE em.user_id = ?
        `,
            [user_id]
        );

        if (rows.length === 0) {
            console.log("❌ No employment record found.");
            return res.json({ employed: null });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("⚠️ Error fetching employment record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /employed/employer/:employerId
router.get('/employer/:employerId', async (req, res) => {
    const { employerId } = req.params;

    try {
        const query = `
            SELECT 
            u.*,p.*, e.* 
            FROM employed e
            JOIN users u ON u.user_id = e.user_id
            LEFT JOIN profiles p ON p.user_id = u.user_id
            WHERE e.employer_id = ?
        `;
        const [results] = await db.promise().query(query, [employerId]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Update an employment record
router.put("/:employed_id", async (req, res) => {
    const { employed_id } = req.params;
    const { employment_end_date, salary, employment_status, notes } = req.body;

    try {
        const [result] = await db.promise().execute(
            `UPDATE employed SET 
                employment_end_date = COALESCE(?, employment_end_date), 
                salary = COALESCE(?, salary), 
                employment_status = COALESCE(?, employment_status), 
                notes = COALESCE(?, notes) 
            WHERE employed_id = ?`,
            [employment_end_date || null, salary || null, employment_status || null, notes || null, employed_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Employment record not found" });
        }
        res.json({ message: "Employment record updated" });
    } catch (error) {
        console.error("❌ Error updating employment record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/leavejob/:user_id', async (req, res) => {
    const user_id = req.params.user_id;

    try {
        const [deleteResult] = await db.promise().execute(
            'DELETE FROM employed WHERE user_id = ?',
            [user_id]
        );

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'No employment found for this user.' });
        }

        await db.promise().execute(
            `UPDATE candidates 
            SET availability = "Yes",
            WHERE user_id = ?`,
            [user_id]
        );

        await db.promise().execute(
            `UPDATE users 
            SET role = ? 
            WHERE user_id = ?`,
            ['candidate', user_id]
        );

        await db.promise().execute(
            `UPDATE jobs 
            SET is_available = 1 
            WHERE job_id = ?`,
            [job_id]
        );


        res.status(200).json({ message: 'Successfully left the job and updated candidate status and role.' });
    } catch (err) {
        console.error('Error processing leave job:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an employment record
router.delete("/:employed_id", async (req, res) => {
    const { employed_id } = req.params;
    try {
        const [result] = await db.promise().execute("DELETE FROM employed WHERE employed_id = ?", [employed_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Employment record not found" });
        }
        res.json({ message: "Employment record deleted" });
    } catch (error) {
        console.error("❌ Error deleting employment record:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
