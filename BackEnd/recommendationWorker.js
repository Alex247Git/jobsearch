const { parentPort } = require('worker_threads');
const db = require('./db');
const { computeSimilarityBatch, computeSimilarity, composeText } = require('./semanticMatcherNew');

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
        console.log("✅ Job recommendations generated (new model in worker).");
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
        console.log("✅ Candidate recommendations generated (new model in worker).");
    } catch (error) {
        console.error("❌ Error generating candidate recommendations:", error);
    }
}

parentPort.on('message', async (message) => {
    if (message.type === 'generateJobRecommendations') {
        await generateJobRecommendations();
        parentPort.postMessage({ type: 'done', function: 'generateJobRecommendations' });
    } else if (message.type === 'generateCandidateRecommendations') {
        await generateCandidateRecommendations();
        parentPort.postMessage({ type: 'done', function: 'generateCandidateRecommendations' });
    }
});
