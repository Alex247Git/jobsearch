const express = require('express');
const router = express.Router();
const db = require('../db');
const nlp = require('compromise');
const { generateCandidateRecommendations } = require('../recommendationWorker');
const { authenticateToken, authorizeSelf, requireRole } = require('../middleware/auth');

// POST new job
router.post('/', authenticateToken, requireRole('employer'), async (req, res) => {
    const { title, company_id, location, description, salary, skills_required, job_type, remote_option, category } = req.body;
    const requiredFields = [title, company_id, location, description, salary, skills_required, job_type, remote_option, category];
    if (requiredFields.some(field => field === undefined || field === null || field === '')) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    try {
        const query = `INSERT INTO jobs (title, company_id, location, description, salary, skills_required, job_type, remote_option, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.promise().query(query, [title, company_id, location, description, salary, skills_required, job_type, remote_option, category]);
        const newJobId = result.insertId;
        await db.promise().query(`DELETE FROM recommendations WHERE job_id = ? AND recommendation_type = 'candidate'`, [newJobId]);
        generateCandidateRecommendations(result.insertId).catch(err => console.error('Failed to generate candidate recommendations for job', result.insertId, err));
        res.status(201).json({ message: 'Job created successfully', jobId: result.insertId });
    } catch (err) {
        console.error('Error creating job:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the job' });
    }
});

// GET all jobs
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT j.*, e.user_id AS employer_id, c.company_name
            FROM jobs j
            JOIN employers e ON j.job_id = e.job_id
            JOIN companies c ON j.company_id = c.company_id
        `;

        const [results] = await db.promise().query(query);

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching jobs:', err.message);
        res.status(500).json({ error: 'Failed to fetch jobs. Please try again later.' });
    }
});

// GET job by id
router.get('/:id', async (req, res) => {
    const jobId = req.params.id;

    try {
        const query = `
            SELECT j.*, e.user_id AS employer_id, c.company_name
            FROM jobs j
            JOIN employers e ON j.job_id = e.job_id
            JOIN companies c ON j.company_id = c.company_id
            WHERE j.job_id = ?;
        `;
        const [results] = await db.promise().query(query, [jobId]);


        if (results.length === 0) {
            return res.status(404).json({ error: `Job with ID ${jobId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Database query failed for job ID ${jobId}:`, err);
        res.status(500).json({ error: 'Failed to fetch job. Please try again later.' });
    }
});

// GET jobs by employer id
router.get('/employer/:employerId', authenticateToken, authorizeSelf('employerId'), async (req, res) => {
    const { employerId } = req.params;

    try {
        const query = `
            SELECT j.*
            FROM jobs j
            INNER JOIN employers e ON j.job_id = e.job_id
            WHERE e.user_id = ?
        `;

        const [results] = await db.promise().query(query, [employerId]);


        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching employer jobs:', error.message);
        res.status(500).json({ message: 'Server error fetching employer jobs' });
    }
});



// SEARCH with NLP
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    try {
        const doc = nlp(q.toLowerCase());
        const jobTitles = doc.match('#Noun+').out('array');
        const locations = doc.match('#Place').out('array');
        const skills = doc.match('#Noun').out('array');
        const remote = q.includes('remote') ? 'remote' : null;

        let sql = 'SELECT * FROM jobs WHERE 1=1';
        const values = [];

        if (jobTitles.length > 0) {
            sql += ` AND ( ${jobTitles.map(() => 'LOWER(title) LIKE ?').join(' OR ')} )`;
            values.push(...jobTitles.map(title => `%${title}%`));
        }

        if (locations.length > 0) {
            sql += ` AND ( ${locations.map(() => 'LOWER(location) LIKE ?').join(' OR ')} )`;
            values.push(...locations.map(loc => `%${loc}%`));
        }

        if (skills.length > 0) {
            sql += ` AND ( ${skills.map(() => 'LOWER(skills_required) LIKE ?').join(' OR ')} )`;
            values.push(...skills.map(skill => `%${skill}%`));
        }

        if (remote) {
            sql += ' AND LOWER(remote_option) = ?';
            values.push('remote');
        }

        const [results] = await db.promise().query(sql, values);

        res.json(results);
    } catch (err) {
        console.error('NLP search error:', err);
        res.status(500).json({ error: 'An error occurred while processing the search' });
    }
});

// UPDATE job by id
router.put('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
    const jobId = req.params.id;
    const { title, company_id, location, description, salary, created_by, skills_required, job_type, remote_option, category } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (title) {
        fieldsToUpdate.push('title = ?');
        values.push(title);
    }
    if (location) {
        fieldsToUpdate.push('location = ?');
        values.push(location);
    }
    if (description) {
        fieldsToUpdate.push('description = ?');
        values.push(description);
    }
    if (salary !== undefined) {
        fieldsToUpdate.push('salary = ?');
        values.push(salary);
    }
    if (company_id) {
        fieldsToUpdate.push('company_id = ?');
        values.push(company_id);
    }
    if (created_by) {
        fieldsToUpdate.push('created_by = ?');
        values.push(created_by);
    }
    if (skills_required) {
        fieldsToUpdate.push('skills_required = ?');
        values.push(skills_required);
    }
    if (job_type) {
        fieldsToUpdate.push('job_type = ?');
        values.push(job_type);
    }
    if (remote_option) {
        fieldsToUpdate.push('remote_option = ?');
        values.push(remote_option);
    }
    if (category) {
        fieldsToUpdate.push('category = ?');
        values.push(category);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE jobs SET ${fieldsToUpdate.join(', ')} WHERE job_id = ?`;
        values.push(jobId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({ message: 'Job updated successfully' });
    } catch (err) {
        console.error('Error updating job:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the job' });
    }
});

// DELETE job by id
router.delete('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
    const jobId = req.params.id;

    try {
        const query = 'DELETE FROM jobs WHERE job_id = ?';
        const [result] = await db.promise().query(query, [jobId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error('Error deleting job:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the job' });
    }
});

module.exports = router;
