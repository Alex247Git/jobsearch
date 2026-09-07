const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeSelf } = require('../middleware/auth');

// POST new saved job
router.post('/', authenticateToken, async (req, res) => {
    const { job_id } = req.body;
    const user_id = req.user.user_id; // server-authoritative
    const role = req.user.role;
    const saved_date = new Date();


    if (!user_id || !job_id || !role) {
        console.error('Missing user_id, job_id, or role');
        return res.status(400).json({ message: 'User ID, Job ID, and Role are required' });
    }

    const checkCandidateQuery = 'SELECT * FROM users WHERE role = ? AND user_id = ?';
    const checkJobQuery = 'SELECT * FROM jobs WHERE job_id = ?';

    try {
        const [candidateResults] = await db.promise().query('SELECT * FROM users WHERE role = ? AND user_id = ?', [role, user_id]);
        if (candidateResults.length === 0) {
            return res.status(400).json({ message: 'Invalid user_id or role does not match' });
        }

        const [jobResults] = await db.promise().query('SELECT * FROM jobs WHERE job_id = ?', [job_id]);
        if (jobResults.length === 0) {
            return res.status(400).json({ message: 'Invalid job_id' });
        }

        const [insertResult] = await db.promise().query(
            'INSERT INTO saved_jobs (user_id, job_id, saved_date) VALUES (?, ?, ?)',
            [user_id, job_id, saved_date]
        );

        res.status(201).json({
            message: 'Job saved successfully',
            saved_jobs_id: insertResult.insertId,
        });
    } catch (err) {
        console.error('Error during database operation:', err.stack);
        res.status(500).json({ message: 'An error occurred while saving the job', details: err.message });
    }
});



// GET all saved jobs
router.get('/:user_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id } = req.params;

    const query = `SELECT 
    jobs.job_id,
    jobs.title,
    jobs.location,
    jobs.job_type,
    jobs.remote_option,
    jobs.salary,
    jobs.description,
    companies.company_name
FROM saved_jobs
JOIN jobs ON saved_jobs.job_id = jobs.job_id
JOIN employers ON jobs.job_id = employers.job_id
JOIN companies ON employers.company_id = companies.company_id
WHERE saved_jobs.user_id = ?`;
    try {
        const [results] = await db.promise().query(query, [user_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching saved jobs:', err.stack);
        res.status(500).json({ message: 'Failed to fetch saved jobs' });
    }
});

// GET saved job by user_id and job_id
router.get('/:user_id/:job_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id, job_id } = req.params;

    try {
        const query = 'SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?';
        const [results] = await db.promise().query(query, [user_id, job_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Saved job not found' });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Error fetching saved job:', err.message);
        res.status(500).json({ error: 'Failed to fetch saved job. Please try again later.' });
    }
});

// DELETE saved job by user_id and job_id
router.delete('/:user_id/:job_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id, job_id } = req.params;

    try {
        const query = 'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?';
        const [result] = await db.promise().query(query, [user_id, job_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Saved job not found' });
        }

        res.status(200).json({ message: 'Saved job deleted successfully' });
    } catch (err) {
        console.error('Error deleting saved job:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the saved job' });
    }
});

module.exports = router;
