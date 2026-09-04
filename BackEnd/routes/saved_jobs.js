const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST new saved job
router.post('/', authenticateToken, (req, res) => {
    const { user_id, job_id, role } = req.body;
    const saved_date = new Date();


    if (!user_id || !job_id || !role) {
        console.error('Missing user_id, job_id, or role');
        return res.status(400).json({ message: 'User ID, Job ID, and Role are required' });
    }

    const checkCandidateQuery = 'SELECT * FROM users WHERE role = ? AND user_id = ?';
    const checkJobQuery = 'SELECT * FROM jobs WHERE job_id = ?';

    db.query(checkCandidateQuery, [role, user_id], (err, candidateResults) => {
        if (err || candidateResults.length === 0) {
            console.error('User not found or error occurred:', err || 'Invalid user or role mismatch');
            return res.status(400).json({ message: 'Invalid user_id or role does not match' });
        }

        db.query(checkJobQuery, [job_id], (err, jobResults) => {
            if (err || jobResults.length === 0) {
                console.error('Job not found or error occurred:', err || 'Job not found');
                return res.status(400).json({ message: 'Invalid job_id' });
            }

            const insertQuery = 'INSERT INTO saved_jobs (user_id, job_id, saved_date) VALUES (?, ?, ?)';
            const sqlParams = [user_id, job_id, saved_date];

            db.query(insertQuery, sqlParams, (err, insertResult) => {
                if (err) {
                    console.error('Error during database operation:', err.stack);
                    return res.status(500).json({
                        message: 'An error occurred while saving the job', details: err.message,
                    });
                }

                res.status(201).json({
                    message: 'Job saved successfully',
                    saved_jobs_id: insertResult.insertId,
                });
            });
        });
    });
});



// GET all saved jobs
router.get('/:user_id', authenticateToken, (req, res) => {
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
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching saved jobs:', err.stack);
            return res.status(500).json({ message: 'Failed to fetch saved jobs' });
        }
        res.status(200).json(results);
    });
});

// GET saved job by user_id and job_id
router.get('/:user_id/:job_id', authenticateToken, async (req, res) => {
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
router.delete('/:user_id/:job_id', authenticateToken, async (req, res) => {
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
