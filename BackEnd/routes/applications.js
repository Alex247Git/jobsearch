const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeSelf, requireRole } = require('../middleware/auth');
const authorizeOwner = require('../middleware/authorizeOwner');
const { logEvent } = require('../audit/auditLog');

// POST new application
router.post('/', authenticateToken, async (req, res) => {
    const { job_id, status, applied_at } = req.body;
    const user_id = req.user.user_id; // server-authoritative

    try {
        const [results] = await db.promise().query(
            'SELECT * FROM applications WHERE user_id = ? AND job_id = ?',
            [user_id, job_id]
        );
        if (results.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        await db.promise().query(
            'INSERT INTO applications (user_id, job_id, status, applied_at) VALUES (?, ?, ?, ?)',
            [user_id, job_id, status, applied_at]
        );
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all applications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM applications');

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching applications:', err.message);
        res.status(500).json({ error: 'Failed to fetch applications. Please try again later.' });
    }
});

// GET applications by candidate user_id
router.get('/candidate/:user_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id } = req.params;

    const query = `
                SELECT 
            a.application_id,
            a.status AS application_status,
            a.applied_at AS application_date,
            j.job_id,
            j.title AS job_title,
            j.description AS job_description,
            j.location AS job_location,
            j.salary AS job_salary,
            j.skills_required,
            j.job_type,
            j.remote_option,
            j.category AS job_category,
            j.is_available,
            j.created_at AS job_created_at,
            j.updated_at AS job_updated_at,
            c.company_id,
            c.company_name,
            c.industry,
            c.location AS company_location,
            e.user_id AS employer_id,
            u.first_name AS employer_first_name,
            u.last_name AS employer_last_name,
            p.location AS employer_location,
            p.website AS employer_website,
            p.certifications AS employer_certifications,
            p.languages AS employer_languages,
            p.social_links AS employer_social_links,
            p.cv AS employer_cv,
            p.bio AS employer_bio
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN employers e ON e.job_id = j.job_id  
        LEFT JOIN companies c ON e.company_id = c.company_id
        LEFT JOIN profiles p ON p.user_id = e.user_id
        JOIN users u ON u.user_id = e.user_id
        WHERE a.user_id = ?;`;

    try {
        const [results] = await db.promise().query(query, [user_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching applications:', err.stack);
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});


// GET application by user_id
router.get('/employer/:user_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id } = req.params;

    const query = `
    SELECT 
    jobs.job_id,
    jobs.title AS job_title,
    jobs.description,
    jobs.location,
    jobs.salary,
    jobs.job_type,
    jobs.remote_option,
    users.user_id AS candidate_id,
    users.first_name AS candidate_first_name,
    users.last_name AS candidate_last_name,
    users.email AS candidate_email,
    applications.application_id,
    applications.status AS application_status,
    applications.applied_at AS application_date
    FROM jobs
    JOIN employers ON jobs.company_id = employers.company_id
    JOIN applications ON jobs.job_id = applications.job_id
    JOIN users ON applications.user_id = users.user_id  
    WHERE employers.user_id = ?`;


    try {
        const [results] = await db.promise().query(query, [user_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching applicants:', err.stack);
        res.status(500).json({ message: 'Failed to fetch applicants' });
    }

});


// GET application by application_id
router.get('/:application_id', authenticateToken, async (req, res) => {
    const applicationId = req.params.application_id;

    try {
        const query = 'SELECT * FROM applications WHERE application_id = ?';
        const [results] = await db.promise().query(query, [applicationId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `Application with ID ${applicationId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Error fetching application with ID ${applicationId}:`, err.message);
        res.status(500).json({ error: 'Failed to fetch application. Please try again later.' });
    }
});

// UPDATE application by application_id
router.put('/:application_id', authenticateToken, async (req, res) => {
    const applicationId = req.params.application_id;
    const { job_id, status, applied_at, user_id } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (job_id) {
        fieldsToUpdate.push('job_id = ?');
        values.push(job_id);
    }
    if (status) {
        fieldsToUpdate.push('status = ?');
        values.push(status);
    }
    if (applied_at) {
        fieldsToUpdate.push('applied_at = ?');
        values.push(applied_at);
    }
    if (user_id) {
        fieldsToUpdate.push('user_id = ?');
        values.push(user_id);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE applications SET ${fieldsToUpdate.join(', ')} WHERE application_id = ?`;
        values.push(applicationId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.status(200).json({ message: 'Application updated successfully' });
    } catch (err) {
        console.error('Error updating application:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the application' });
    }
});

// PUT /application/:application_id - Accept applicant and create employment
router.put("/application/:application_id", authenticateToken, requireRole("employer"), async (req, res) => {
    const { application_id } = req.params;

    try {
        // Get necessary data from the application and related job/company
        const [appRows] = await db.promise().execute(
            `SELECT 
            a.user_id AS candidate_id,
            a.job_id,
            j.company_id,
            e.user_id AS employer_id
            FROM applications a
            JOIN jobs j ON a.job_id = j.job_id
            JOIN employers e ON e.job_id = j.job_id
            WHERE a.application_id = ?`,
            [application_id]
        );

        if (appRows.length === 0) {
            return res.status(404).json({ error: "Application not found or incomplete." });
        }

        const { candidate_id, job_id, employer_id } = appRows[0];
        const employment_start_date = new Date().toISOString().slice(0, 10);

        // 1. Insert into employed table
        await db.promise().execute(
            `INSERT INTO employed (user_id, job_id, employer_id, employment_start_date, employment_status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [candidate_id, job_id, employer_id, employment_start_date, 'active']
        );

        // 2. Update application status
        await db.promise().execute(
            `UPDATE applications SET status = 'accepted' WHERE application_id = ?`,
            [application_id]
        );

        // 3. Update user role
        await db.promise().execute(
            `UPDATE users SET role = 'employed' WHERE user_id = ?`,
            [candidate_id]
        );

        // 4. Update candidate status
        await db.promise().execute(
            `UPDATE candidates 
            JOIN applications ON candidates.user_id = applications.user_id
            SET applications.status = 'accepted', 
            candidates.availability = 'No', 
            applications.applied_at = ?
            WHERE candidates.user_id = ?`,
            [employment_start_date, candidate_id]
        );


        res.status(200).json({ message: "Application accepted and candidate employed." });
    } catch (error) {
        console.error("❌ Error accepting application and hiring candidate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE application by application_id
router.delete('/:application_id',
    authenticateToken,
    authorizeOwner('application_id', 'applications', 'user_id'),
    async (req, res) => {
        try {
            const [result] = await db.promise().query(
                'DELETE FROM applications WHERE application_id = ?',
                [req.params.application_id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }
            logEvent('application_delete', req, { application_id: req.params.application_id });
            res.status(200).json({ message: 'Application deleted successfully' });
        } catch (err) {
            console.error('Error deleting application:', err.message);
            res.status(500).json({ error: 'An error occurred while deleting the application' });
        }
    }
);

module.exports = router;
