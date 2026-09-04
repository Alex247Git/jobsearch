const express = require('express');
const router = express.Router();
const db = require('../db');

// POST new message
router.post('/', async (req, res) => {
    const { sender_id, receiver_id, message } = req.body;

    if (!sender_id || !receiver_id || !message) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const query = `INSERT INTO messages (sender_id, receiver_id, message, sent_at) VALUES (?, ?, ?, NOW())`;
        const [result] = await db.promise().execute(query, [sender_id, receiver_id, message]);

        if (result.affectedRows === 0) {
            throw new Error("Message was not inserted");
        }

        res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'An error occurred while sending the message', details: err.message });
    }
});


// GET all messages
router.get("/", async (req, res) => {
    try {
        const [results] = await db.promise().query("SELECT * FROM messages ORDER BY created_at ASC");

        if (results.length === 0) {
            return res.status(404).json({ error: "No messages found" });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({ error: "Failed to fetch messages. Please try again later." });
    }
});

// GET all conversations for a user
router.get("/conversations/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT DISTINCT u.user_id, u.first_name, u.last_name
        FROM users u
        JOIN messages m ON u.user_id = 
            CASE 
                WHEN m.sender_id = ? THEN m.receiver_id
                WHEN m.receiver_id = ? THEN m.sender_id
            END
        WHERE u.user_id != ?
    `;
    try {
        const [results] = await db.promise().query(query, [user_id, user_id, user_id]);

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});


// GET messages between two users
router.get('/:sender_id/:receiver_id', async (req, res) => {
    const { sender_id, receiver_id } = req.params;

    const query = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY sent_at ASC
    `;

    try {
        const [results] = await db.promise().query(query, [sender_id, receiver_id, receiver_id, sender_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


// UPDATE message by ID
router.put("/:id", async (req, res) => {
    const messageId = req.params.id;
    const { message_content } = req.body;

    if (!message_content) {
        return res.status(400).json({ error: "Message content is required for update" });
    }

    try {
        const query = `UPDATE messages SET message_content = ? WHERE message_id = ?`;
        const [result] = await db.promise().query(query, [message_content, messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.status(200).json({ message: "Message updated successfully" });
    } catch (err) {
        console.error("Error updating message:", err.message);
        res.status(500).json({ error: "An error occurred while updating the message" });
    }
});

// DELETE message by ID
router.delete("/:id", async (req, res) => {
    const messageId = req.params.id;

    try {
        const query = "DELETE FROM messages WHERE message_id = ?";
        const [result] = await db.promise().query(query, [messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err.message);
        res.status(500).json({ error: "An error occurred while deleting the message" });
    }
});

module.exports = router;
