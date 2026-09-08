const { generateJobRecommendations, generateCandidateRecommendations } = require('../recommendationWorker');

let status = 'idle'; // idle | running | done | error
let lastRun = null;
let lastError = null;

async function generateForUser(userId) {
    // For now, run full generation (worker handles dedup via ON DUPLICATE KEY)
    await generateJobRecommendations();
}

// Retry helper with exponential backoff
async function withRetry(fn, retries = 3, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            await fn();
            return;
        } catch (err) {
            console.warn(`⚠️ Attempt ${i + 1}/${retries} failed: ${err.message}`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            } else {
                throw err;
            }
        }
    }
}

async function generateForAll() {
    if (status === 'running') return;
    status = 'running';
    lastError = null;

    // Generate job recommendations (critical)
    try {
        await withRetry(generateJobRecommendations, 3, 3000);
        console.log('✅ Job recommendations generated');
    } catch (err) {
        console.error('❌ Job recommendations failed after retries:', err.message);
        lastError = `Job recs: ${err.message}`;
    }

    // Wait for DB pool to stabilize before candidate recommendations
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate candidate recommendations (non-critical, can fail gracefully)
    try {
        await withRetry(generateCandidateRecommendations, 3, 5000);
        console.log('✅ Candidate recommendations generated');
    } catch (err) {
        console.error('❌ Candidate recommendations failed after retries:', err.message);
        if (!lastError) lastError = `Candidate recs: ${err.message}`;
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
        // Wait 20s for MySQL + ONNX runtime to be fully ready
        setTimeout(() => {
            generateForAll();
            scheduleDailyRefresh();
        }, 20000);
    },
};
