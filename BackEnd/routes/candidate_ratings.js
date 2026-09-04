const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST route to create a new candidate rating
router.post('/', authenticateToken, async (req, res) => {
    const { candidate_id, employer_id, rating, comment } = req.body;

    if (!candidate_id || !employer_id || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await db.promise().execute(
            'INSERT INTO candidate_ratings (candidate_id, employer_id, rating, comment) VALUES (?, ?, ?, ?)',
            [candidate_id, employer_id, rating, comment || null]
        );

        const newRating = {
            rating_id: result.insertId,
            candidate_id,
            employer_id,
            rating,
            comment,
            created_at: new Date()
        };

        res.status(201).json(newRating);
    } catch (error) {
        console.error('Error creating candidate rating:', error);
        res.status(500).json({ error: 'Failed to create candidate rating' });
    }
});

//GET route to fetch all candidate ratings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM candidate_ratings');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching candidate ratings:', error);
        res.status(500).json({ error: 'Failed to fetch candidate ratings' });
    }
});

// GET route to fetch ratings for a specific candidate
router.get('/candidate/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM candidate_ratings WHERE candidate_id = ?', [id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching candidate ratings for user:', error);
        res.status(500).json({ error: 'Failed to fetch candidate ratings' });
    }
});


module.exports = router;
