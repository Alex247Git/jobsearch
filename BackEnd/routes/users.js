const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../authUtils');
const { authenticateToken, authorizeSelf } = require('../middleware/auth');
const { logEvent } = require('../audit/auditLog');


const router = express.Router();
router.use(cors());
router.use(express.json());


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;


// **REGISTER USER**
router.post('/', async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth, phone_number, is_verified, role } = req.body;
    if (!first_name || !last_name || !email || !password || !date_of_birth || !phone_number || is_verified === undefined || !role) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    try {
        const hashedPassword = await hashPassword(password);
        const query = `INSERT INTO users (first_name, last_name, email, password, date_of_birth, phone_number, is_verified, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.promise().query(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            date_of_birth,
            phone_number,
            is_verified,
            role,
        ]);
        const token = jwt.sign({ user_id: result.insertId, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User created successfully', user_id: result.insertId, token });
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const query = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.promise().query(query, [email]);
        if (rows.length === 0) {
            logEvent('login_fail', req, { reason: 'no_such_email', email });
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = rows[0];
        let isMatch = false;
        isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            logEvent('login_fail', req, { reason: 'bad_password', user_id: user.user_id });
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        logEvent('login_success', req, { user_id: user.user_id, role: user.role });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// **GET ALL USERS**
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT user_id, first_name, last_name, email, phone_number, date_of_birth, is_verified, role FROM users');

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users. Please try again later.' });
    }
});

// **GET USER BY ID**
router.get('/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const query = 'SELECT * FROM users WHERE user_id = ?';
        const [results] = await db.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `User with ID ${userId} not found` });
        }

        const { password, ...safeUser } = results[0];
        res.status(200).json(safeUser);
    } catch (err) {
        console.error(`Database query failed for user ID ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch user. Please try again later.' });
    }
});

// **UPDATE USER**
router.put('/:user_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id } = req.params;
    let { first_name, last_name, email, password, date_of_birth, phone_number, is_verified, role } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const fieldsToUpdate = [];
    const values = [];

    if (first_name) {
        fieldsToUpdate.push('first_name = ?');
        values.push(first_name);
    }
    if (last_name) {
        fieldsToUpdate.push('last_name = ?');
        values.push(last_name);
    }
    if (email) {
        fieldsToUpdate.push('email = ?');
        values.push(email);
    }
    if (password) {
        password = await bcrypt.hash(password, saltRounds);
        fieldsToUpdate.push('password = ?');
        values.push(password);
    }
    if (date_of_birth) {
        fieldsToUpdate.push('date_of_birth = ?');
        values.push(date_of_birth);
    }
    if (phone_number) {
        fieldsToUpdate.push('phone_number = ?');
        values.push(phone_number);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE user_id = ?`;
        values.push(user_id);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the user' });
    }
});

// **DELETE USER**
router.delete('/:user_id', authenticateToken, authorizeSelf('user_id'), async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const query = 'DELETE FROM users WHERE user_id = ?';
        const [result] = await db.promise().query(query, [user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the user' });
    }
});

module.exports = router;
