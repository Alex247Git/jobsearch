const db = require('./db');
const { computeSimilarityBatch } = require('./semanticMatcherNew');

// Retry wrapper for functions that may fail
const retryWithDelay = async (fn, retries = 3, delay = 5000, fnName = 'unnamed') => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`[${fnName}] Attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        console.error(`[${fnName}] All retries exhausted. Giving up.`);
        throw error;
      }
      console.log(`[${fnName}] Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Wait for DB to be ready
const waitForDB = async (maxAttempts = 30, delay = 3000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await db.promise().query('SELECT 1');
      console.log('✅ Database connection ready');
      return true;
    } catch (err) {
      console.log(`⏳ Waiting for database... (attempt ${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Database not available after maximum attempts');
};

async function generateJobRecommendations() {
    try {
        const [candidates] = await db.promise().query(`
            SELECT c.user_id AS candidate_id, p.location, p.education, p.languages, p.certifications
            FROM candidates c JOIN profiles p ON c.user_id = p.user_id`);
        const [jobs] = await db.promise().query(`
            SELECT j.job_id, j.title, j.description, j.location, j.skills_required, j.salary, j.job_type, j.remote_option FROM jobs j`);
        const [existingRecs] = await db.promise().query(`SELECT job_id, candidate_id FROM recommendations WHERE recommendation_type = 'job'`);
        const existingSet = new Set(existingRecs.map(r => `${r.job_id}-${r.candidate_id}`));
        const jobInputs = jobs.map(job => ({
            title: job.title, description: job.description, skills: job.skills_required, location: job.location, job_type: job.job_type,
            salary: job.salary, remote_option: job.remote_option
        }));
        const resumeInputs = candidates.map(c => ({
            education: c.education, languages: c.languages, certifications: c.certifications, location: c.location
        }));
        const scoreMatrix = await computeSimilarityBatch(jobInputs, resumeInputs);
        const insertPromises = [];
        for (let i = 0; i < jobs.length; i++) {
            for (let j = 0; j < candidates.length; j++) {
                const jobId = jobs[i].job_id;
                const candidateId = candidates[j].candidate_id;
                const key = `${jobId}-${candidateId}`;
                if (existingSet.has(key)) continue;
                const score = scoreMatrix[i][j];
                if (score > 0) {
                    insertPromises.push(
                        db.promise().execute(`
                            INSERT INTO recommendations (user_id, job_id, candidate_id, score, recommendation_type, created_at)
                            VALUES (?, ?, ?, ?, 'job', NOW())
                            ON DUPLICATE KEY UPDATE score = VALUES(score), created_at = NOW()
                        `, [candidateId, jobId, candidateId, score])
                    );
                }
            }
        }
        await Promise.all(insertPromises);
        console.log("✅ Job recommendations generated.");
    } catch (error) {
        console.error("❌ Error generating job recommendations:", error);
    }
}

async function generateCandidateRecommendations() {
    try {
        const [candidates] = await db.promise().query(`
            SELECT c.user_id AS candidate_id, p.location, p.education, p.languages, p.certifications
            FROM candidates c JOIN profiles p ON c.user_id = p.user_id`);
        if (candidates.length === 0) {
            console.log("No candidates with profiles found.");
            return;
        }
        const resumeInputs = candidates.map(c => ({
            education: c.education, languages: c.languages, certifications: c.certifications, location: c.location
        }));
        const [employers] = await db.promise().query(`SELECT user_id FROM users WHERE role = 'employer'`);
        const [existingRecs] = await db.promise().query(`SELECT user_id, job_id, candidate_id
            FROM recommendations WHERE recommendation_type = 'candidate'`);
        const existingSet = new Set(existingRecs.map(r => `${r.user_id}-${r.job_id}-${r.candidate_id}`));
        for (const employer of employers) {
            const [jobs] = await db.promise().query(`
                SELECT j.job_id, j.title, j.description, j.location, j.skills_required, j.salary, j.job_type, j.remote_option
                FROM jobs j JOIN companies c ON j.company_id = c.company_id JOIN employers e ON c.company_id = e.company_id
                WHERE e.user_id = ?`, [employer.user_id]);
            if (jobs.length === 0) continue;
            const jobInputs = jobs.map(job => ({
                title: job.title, description: job.description, skills: job.skills_required, location: job.location,
                job_type: job.job_type, salary: job.salary, remote_option: job.remote_option
            }));
            const scoreMatrix = await computeSimilarityBatch(jobInputs, resumeInputs);
            const insertPromises = [];
            for (let i = 0; i < jobs.length; i++) {
                for (let j = 0; j < candidates.length; j++) {
                    const jobId = jobs[i].job_id;
                    const candidateId = candidates[j].candidate_id;
                    const key = `${employer.user_id}-${jobId}-${candidateId}`;
                    if (existingSet.has(key)) continue;
                    const score = scoreMatrix[i][j];
                    if (score > 0) {
                        insertPromises.push(
                            db.promise().execute(`
                                INSERT INTO recommendations (user_id, job_id, candidate_id, score, recommendation_type, created_at)
                                VALUES (?, ?, ?, ?, 'candidate', NOW())
                            `, [employer.user_id, jobId, candidateId, score])
                        );
                    }
                }
            }
            await Promise.all(insertPromises);
        }
        console.log("✅ Candidate recommendations generated.");
    } catch (error) {
        console.error("❌ Error generating candidate recommendations:", error);
    }
}

// Main execution loop with proper startup sequence
const runRecommendations = async () => {
  try {
    // Wait for DB to be ready first
    await waitForDB();

    // Give MySQL a bit more time to be fully operational
    console.log('⏳ Waiting 12s for MySQL to be fully operational...');
    await new Promise(resolve => setTimeout(resolve, 12000));

    // Generate job recommendations first (higher priority)
    await retryWithDelay(
      generateJobRecommendations,
      3,
      5000,
      'JobRecommendations'
    );

    // Generate candidate recommendations with retry
    await retryWithDelay(
      generateCandidateRecommendations,
      3,
      5000,
      'CandidateRecommendations'
    );

    console.log('🎉 All recommendations completed!');
  } catch (error) {
    console.error('❌ Error in recommendation worker:', error);
  } finally {
    process.exit(0);
  }
};

module.exports = {
    generateJobRecommendations,
    generateCandidateRecommendations,
    runRecommendations,
    waitForDB,
    retryWithDelay,
};
