// Run recommendation generation directly in main process
// (Worker threads have issues with MySQL connections in rootless podman)
const { generateJobRecommendations: workerGenerateJob, generateCandidateRecommendations: workerGenerateCandidate } = require('./recommendationWorker');

async function generateJobRecommendations() {
    return workerGenerateJob();
}

async function generateCandidateRecommendations() {
    return workerGenerateCandidate();
}

module.exports = {
    generateJobRecommendations,
    generateCandidateRecommendations
};
