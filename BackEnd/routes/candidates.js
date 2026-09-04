const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateJobRecommendations } = require('../recommendationSystemNew');
const { authenticateToken } = require('../middleware/auth');

// POST candidate
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, cover_letter, availability } = req.body;
    if (!user_id || !cover_letter || availability == null) {
        return res.status(400).json({ error: 'Please provide all required fields except application_id' });
    }
    if (!['Yes', 'No'].includes(availability)) {
        return res.status(400).json({ error: 'Invalid availability value. Use "Yes" or "No".' });
    }
    try {
        const query = `INSERT INTO candidates (user_id, cover_letter, availability) VALUES (?, ?, ?)`;
        const [result] = await db.promise().query(query, [user_id, cover_letter, availability]);
        res.status(201).json({ message: 'Candidate created successfully', candidateId: result.insertId });
        await db.promise().query(`DELETE FROM recommendations WHERE candidate_id = ? AND recommendation_type = 'job'`, [user_id]);
        generateJobRecommendations(user_id).catch(err =>console.error('Failed to generate recommendations for user', user_id, err));
    } catch (err) {
        console.error('Error creating candidate:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the candidate' });
    }
});


// GET all candidates with user info
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*, 
                u.first_name, u.last_name, u.email, u.phone_number,
                p.*
            FROM candidates c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN profiles p ON c.user_id = p.user_id
            ORDER BY availability ASC
        `;
        const [results] = await db.promise().query(query);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No candidates found' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching candidates:', err.message);
        res.status(500).json({ error: 'Failed to fetch candidates. Please try again later.' });
    }
});


// GET candidate by id with user info
router.get('/:id', async (req, res) => {
    const candidateId = req.params.id;

    try {
        const query = `
            SELECT c.*, u.first_name, u.last_name, u.email, u.phone_number
            FROM candidates c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.id = ?
        `;
        const [results] = await db.promise().query(query, [candidateId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `Candidate with ID ${candidateId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Database query failed for candidate ID ${candidateId}:`, err);
        res.status(500).json({ error: 'Failed to fetch candidate. Please try again later.' });
    }
});

// UPDATE candidate by id
router.put('/:id', authenticateToken, async (req, res) => {
    const candidateId = req.params.id;
    const { cover_letter, application_id, availability } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (cover_letter) {
        fieldsToUpdate.push('cover_letter = ?');
        values.push(cover_letter);
    }
    if (application_id) {
        fieldsToUpdate.push('application_id = ?');
        values.push(application_id);
    }
    if (availability) {
        if (!['Yes', 'No'].includes(availability)) {
            return res.status(400).json({ error: 'Invalid availability value. Use "Yes" or "No".' });
        }
        fieldsToUpdate.push('availability = ?');
        values.push(availability);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE candidates SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(candidateId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate updated successfully' });
    } catch (err) {
        console.error('Error updating candidate:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the candidate' });
    }
});

// DELETE candidate by id
router.delete('/:id', authenticateToken, async (req, res) => {
    const candidateId = req.params.id;

    try {
        const query = 'DELETE FROM candidates WHERE id = ?';
        const [result] = await db.promise().query(query, [candidateId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.error('Error deleting candidate:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the candidate' });
    }
});

module.exports = router;
