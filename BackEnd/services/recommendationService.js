const { generateJobRecommendations, generateCandidateRecommendations } = require('../recommendationSystemNew');

let status = 'idle'; // idle | running | done | error
let lastRun = null;
let lastError = null;

async function generateForUser(userId) {
    // For now, run full generation (worker handles dedup via ON DUPLICATE KEY)
    await generateJobRecommendations();
}

async function generateForAll() {
    if (status === 'running') return;
    status = 'running';
    lastError = null;
    try {
        await generateJobRecommendations();
        console.log('✅ Job recommendations generated');
    } catch (err) {
        console.error('❌ Job recommendations failed:', err);
        lastError = err.message;
    }
    // Wait a bit for DB to be ready for candidate recommendations
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await generateCandidateRecommendations();
        console.log('✅ Candidate recommendations generated');
    } catch (err) {
        console.error('❌ Candidate recommendations failed:', err.message);
        // Don't overwrite lastError if job recs succeeded
        if (!lastError) lastError = `Candidate recs failed: ${err.message}`;
    }
    status = 'done';
    lastRun = new Date().toISOString();
}

function getStatus() {
    return { status, lastRun, lastError };
}

// Daily refresh at 3 AM
function scheduleDailyRefresh() {
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);
    if (now >= next3AM) {
        next3AM.setDate(next3AM.getDate() + 1);
    }
    const msUntil3AM = next3AM - now;
    setTimeout(() => {
        generateForAll();
        setInterval(generateForAll, 24 * 60 * 60 * 1000); // Every 24h
    }, msUntil3AM);
    console.log(`⏰ Daily recommendation refresh scheduled for ${next3AM.toLocaleString()}`);
}

module.exports = {
    generateForUser,
    generateForAll,
    getStatus,
    initRecommendations: () => {
        // Wait 10s for MySQL to be ready before starting recommendations
        setTimeout(() => {
            generateForAll();
            scheduleDailyRefresh();
        }, 10000);
    },
};
