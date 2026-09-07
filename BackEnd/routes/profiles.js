const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeSelf } = require('../middleware/auth');

// CREATE user profile
router.post('/', authenticateToken, async (req, res) => {
    const { bio, skills, experience, location, education, certifications, languages, social_links, cv, availability, website } = req.body;
    const user_id = req.user.user_id; // server-authoritative

    try {
        const query = `
            INSERT INTO profiles (user_id, bio, skills, experience, location, education, certifications, languages, social_links, cv, website) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(query, [
            user_id, bio || null, skills || null, experience || null, location || null,
            education || null, certifications || null, languages || null, social_links || null,
            cv || null, website || null
        ]);
        // Trigger recommendation generation for this user
        const recommendationService = require('../services/recommendationService');
        recommendationService.generateForUser(user_id).catch(() => {});
        res.status(201).json({ message: 'Profile created successfully', profileId: result.insertId });
    } catch (err) {
        console.error('Error creating profile:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the profile' });
    }
});

// GET user profile by user_id
router.get('/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = 'SELECT * FROM profiles WHERE user_id = ?';
        const [results] = await db.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).json({ error: 'Failed to fetch profile. Please try again later.' });
    }
});

// UPDATE user and profile
router.put('/:userId', authenticateToken, authorizeSelf('userId'), async (req, res) => {
    const userId = req.params.userId;
    const {
        bio, skills, experience, location, education, certifications,
        languages, social_links, availability, website, profile_picture,
        phone_number, date_of_birth
    } = req.body;

    const profileFields = [];
    const profileValues = [];

    const userFields = [];
    const userValues = [];

    if (bio) profileFields.push('bio = ?'), profileValues.push(bio);
    if (skills) profileFields.push('skills = ?'), profileValues.push(skills);
    if (experience) profileFields.push('experience = ?'), profileValues.push(experience);
    if (location) profileFields.push('location = ?'), profileValues.push(location);
    if (education) profileFields.push('education = ?'), profileValues.push(education);
    if (certifications) profileFields.push('certifications = ?'), profileValues.push(certifications);
    if (languages) profileFields.push('languages = ?'), profileValues.push(languages);
    if (social_links) profileFields.push('social_links = ?'), profileValues.push(social_links);
    if (cv) profileFields.push('cv = ?'), profileValues.push(cv);
    if (availability) profileFields.push('availability = ?'), profileValues.push(availability);
    if (website) profileFields.push('website = ?'), profileValues.push(website);
    if (profile_picture) profileFields.push('profile_picture = ?'), profileValues.push(profile_picture);
    if (phone_number) userFields.push('phone_number = ?'), userValues.push(phone_number);
    if (date_of_birth) userFields.push('date_of_birth = ?'), userValues.push(date_of_birth);

    try {
        if (profileFields.length > 0) {
            const query = `UPDATE profiles SET ${profileFields.join(', ')} WHERE user_id = ?`;
            profileValues.push(userId);
            await db.promise().query(query, profileValues);
        }

        if (userFields.length > 0) {
            const query = `UPDATE users SET ${userFields.join(', ')} WHERE user_id = ?`;
            userValues.push(userId);
            await db.promise().query(query, userValues);
        }

        // Trigger recommendation regeneration if profile changed
        if (profileFields.length > 0) {
            const recommendationService = require('../services/recommendationService');
            recommendationService.generateForUser(userId).catch(() => {});
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating profile:', err.message);
        res.status(500).json({ error: 'An error occurred while updating the profile' });
    }
});


// DELETE user profile
router.delete('/:userId', authenticateToken, authorizeSelf('userId'), async (req, res) => {
    const userId = req.params.userId;

    try {
        const query = 'DELETE FROM profiles WHERE user_id = ?';
        const [result] = await db.promise().query(query, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (err) {
        console.error('Error deleting profile:', err.message);
        res.status(500).json({ error: 'An error occurred while deleting the profile' });
    }
});

module.exports = router;
