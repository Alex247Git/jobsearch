const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST employer
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, company_id,job_id } = req.body;

    if (!user_id || !company_id || !job_id) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const query = `INSERT INTO employers (user_id, company_id, job_id) VALUES (?, ?, ?, ?)`;
        const [result] = await db.promise().query(query, [user_id, company_id, job_id]);
        res.status(201).json({ message: 'Employer created successfully', employerId: result.insertId });
    } catch (err) {
        console.error('Error creating employer:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the employer' });
    }
});

// GET all employers
router.get('/', async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM employers');

        if (results.length === 0) {
            return res.status(404).json({ error: 'No employers found' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching employers:', err.message);
        res.status(500).json({ error: 'Failed to fetch employers. Please try again later.' });
    }
});

// GET employer by id
router.get('/:id', async (req, res) => {
    const employerId = req.params.id;

    try {
        const query = 'SELECT * FROM employers WHERE id = ?';
        const [results] = await db.promise().query(query, [employerId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `Employer with ID ${employerId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Database query failed for employer ID ${employerId}:`, err);
        res.status(500).json({ error: 'Failed to fetch employer. Please try again later.' });
    }
});

// UPDATE employer by id
router.put('/:id', authenticateToken, async (req, res) => {
    const employerId = req.params.id;
    const {company_id,job_id } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (company_id) {
        fieldsToUpdate.push('company_id = ?');
        values.push(company_id);
    }
    if (job_id) {
        fieldsToUpdate.push('job_id = ?');
        values.push(job_id);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE employers SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(employerId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employer not found' });
        }

        res.status(200).json({ message: 'Employer updated successfully' });
    } catch (err) {
        console.error('Error updating employer:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the employer' });
    }
});

// DELETE employer by id
router.delete('/:id', authenticateToken, async (req, res) => {
    const employerId = req.params.id;

    try {
        const query = 'DELETE FROM employers WHERE id = ?';
        const [result] = await db.promise().query(query, [employerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employer not found' });
        }

        res.status(200).json({ message: 'Employer deleted successfully' });
    } catch (err) {
        console.error('Error deleting employer:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the employer' });
    }
});

module.exports = router;
