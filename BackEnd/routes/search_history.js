const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeSelf } = require('../middleware/auth');

// POST new search history entry
router.post('/', authenticateToken, async (req, res) => {
    const { keywords, searched_at } = req.body;
    const candidate_id = req.user.user_id; // server-authoritative

    if (!candidate_id || !keywords || !searched_at) {
        return res.status(400).json({ error: 'Please provide candidate_id, keywords, and searched_at' });
    }

    try {
        const query = `INSERT INTO search_history (candidate_id, keywords, searched_at) VALUES (?, ?, ?)`;
        const [result] = await db.promise().query(query, [candidate_id, keywords, searched_at]);
        res.status(201).json({ message: 'Search history entry created successfully', searchHistoryId: result.insertId });
    } catch (err) {
        console.error('Error creating search history entry:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the search history entry' });
    }
});

// GET all search history entries
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM search_history');

        if (results.length === 0) {
            return res.status(404).json({ error: 'No search history entries found' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching search history entries:', err.message);
        res.status(500).json({ error: 'Failed to fetch search history entries. Please try again later.' });
    }
});

// GET search history entry by candidate_id
router.get('/:candidate_id', authenticateToken, authorizeSelf('candidate_id'), async (req, res) => {
    const candidateId = req.params.candidate_id;

    try {
        const query = 'SELECT * FROM search_history WHERE candidate_id = ?';
        const [results] = await db.promise().query(query, [candidateId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `No search history found for candidate ID ${candidateId}` });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error(`Error fetching search history for candidate ID ${candidateId}:`, err.message);
        res.status(500).json({ error: 'Failed to fetch search history. Please try again later.' });
    }
});

// DELETE search history entry by search_history_id
router.delete('/:search_history_id', authenticateToken, async (req, res) => {
    const searchHistoryId = req.params.search_history_id;

    try {
        const query = 'DELETE FROM search_history WHERE search_history_id = ?';
        const [result] = await db.promise().query(query, [searchHistoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Search history entry not found' });
        }

        res.status(200).json({ message: 'Search history entry deleted successfully' });
    } catch (err) {
        console.error('Error deleting search history entry:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the search history entry' });
    }
});

module.exports = router;
