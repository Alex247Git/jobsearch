const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST new rating for company
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, company_id, rating, comment } = req.body;

    if (!user_id || !company_id || rating === undefined) {
        return res.status(400).json({ error: 'Please provide user_id, company_id, and rating' });
    }

    try {
        const query = `
            INSERT INTO company_ratings (user_id, company_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, NOW())`;
        const [result] = await db.promise().query(query, [user_id, company_id, rating, comment || null]);
        res.status(201).json({ message: 'Rating created successfully', ratingId: result.insertId });
    } catch (err) {
        console.error('Error creating rating:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the rating' });
    }
});

// GET all ratings
router.get('/', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at
            FROM company_ratings
        `);

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching ratings:', err.message);
        res.status(500).json({ error: 'Failed to fetch ratings. Please try again later.' });
    }
});

// GET rating by rating_id
router.get('/:ratingId', async (req, res) => {
    const ratingId = req.params.ratingId;

    try {
        const query = `
            SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at
            FROM company_ratings
            WHERE rating_id = ?
        `;
        const [results] = await db.promise().query(query, [ratingId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `Rating with ID ${ratingId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Database query failed for rating ID ${ratingId}:`, err);
        res.status(500).json({ error: 'Failed to fetch rating. Please try again later.' });
    }
});

// GET all ratings for a specific company
router.get('/company/:companyId', async (req, res) => {
    const { companyId } = req.params;

    try {
        const query = `
            SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at
            FROM company_ratings
            WHERE company_id = ?
        `;
        const [results] = await db.promise().query(query, [companyId]);

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching ratings for company:', err.message);
        res.status(500).json({ error: 'Failed to fetch company ratings' });
    }
});

// UPDATE rating by rating_id
router.put('/:ratingId', authenticateToken, async (req, res) => {
    const ratingId = req.params.ratingId;
    const { rating, comment } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (rating !== undefined) {
        fieldsToUpdate.push('rating = ?');
        values.push(rating);
    }
    if (comment) {
        fieldsToUpdate.push('comment = ?');
        values.push(comment);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `
            UPDATE company_ratings SET ${fieldsToUpdate.join(', ')}
            WHERE rating_id = ?
        `;
        values.push(ratingId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        res.status(200).json({ message: 'Rating updated successfully' });
    } catch (err) {
        console.error('Error updating rating:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the rating' });
    }
});

// DELETE rating by rating_id
router.delete('/:ratingId', authenticateToken, async (req, res) => {
    const ratingId = req.params.ratingId;

    try {
        const query = `DELETE FROM company_ratings WHERE rating_id = ?`;
        const [result] = await db.promise().query(query, [ratingId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (err) {
        console.error('Error deleting rating:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the rating' });
    }
});

module.exports = router;
