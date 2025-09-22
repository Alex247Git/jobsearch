const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    const { user_id, reviewer_id, job_id, rating, comment } = req.body;
    if (!user_id || !reviewer_id || !rating) {
        return res.status(400).json({ error: 'Please provide all required fields (user_id, reviewer_id, rating)' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    try {
        const query = `INSERT INTO ratings (user_id, reviewer_id, job_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.promise().query(query, [user_id, reviewer_id, job_id, rating, comment]);
        
        res.status(201).json({ message: 'Rating submitted successfully', ratingId: result.insertId });
    } catch (err) {
        console.error('Error submitting rating:', err.message);
        res.status(500).json({ error: 'An error occurred while submitting the rating' });
    }
});

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = 'SELECT * FROM ratings WHERE user_id = ? ORDER BY created_at DESC';
        const [results] = await db.promise().query(query, [user_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No ratings found for this user' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching ratings:', err.message);
        res.status(500).json({ error: 'An error occurred while fetching ratings' });
    }
});

module.exports = router;
