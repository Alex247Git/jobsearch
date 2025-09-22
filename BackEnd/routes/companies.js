const express = require('express');
const router = express.Router();
const db = require('../db');

// POST new company
router.post('/', async (req, res) => {
    const { company_name, industry, founded_year, location, description } = req.body;
    if (!company_name || !location || !industry || !founded_year || !description) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }
    try {
        const query = `
            INSERT INTO companies (company_name, industry, founded_year, location, description)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(query, [
            company_name,
            industry,
            founded_year,
            location,
            description
        ]);
        res.status(201).json({ message: 'Company created successfully', companyId: result.insertId });
    } catch (err) {
        console.error('Error creating company:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the company' });
    }
});


// GET all companies
router.get('/', async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM companies');

        if (results.length === 0) {
            return res.status(404).json({ error: 'No companies found' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching companies:', err.message);
        res.status(500).json({ error: 'Failed to fetch companies. Please try again later.' });
    }
});

// GET company by id
router.get('/:id', async (req, res) => {
    const companyId = req.params.id;

    try {
        const query = 'SELECT * FROM companies WHERE company_id = ?';
        const [results] = await db.promise().query(query, [companyId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `Company with ID ${companyId} not found` });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error(`Database query failed for company ID ${companyId}:`, err);
        res.status(500).json({ error: 'Failed to fetch company. Please try again later.' });
    }
});

// UPDATE company by id
router.put('/:id', async (req, res) => {
    const companyId = req.params.id;
    const { company_name, industry, founded_year, location, description } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (company_name) {
        fieldsToUpdate.push('company_name = ?');
        values.push(company_name);
    }
    if (location) {
        fieldsToUpdate.push('location = ?');
        values.push(location);
    }
    if (description) {
        fieldsToUpdate.push('description = ?');
        values.push(description);
    }
    if (founded_year) {
        fieldsToUpdate.push('founded_year = ?');
        values.push(founded_year);
    }
    if (industry) {
        fieldsToUpdate.push('industry = ?');
        values.push(industry);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `UPDATE companies SET ${fieldsToUpdate.join(', ')} WHERE company_id = ?`;
        values.push(companyId);

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.status(200).json({ message: 'Company updated successfully' });
    } catch (err) {
        console.error('Error updating company:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the company' });
    }
});

// DELETE company by id
router.delete('/:id', async (req, res) => {
    const companyId = req.params.id;

    try {
        const query = 'DELETE FROM companies WHERE company_id = ?';
        const [result] = await db.promise().query(query, [companyId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (err) {
        console.error('Error deleting company:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the company' });
    }
});

module.exports = router;
