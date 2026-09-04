const { Worker } = require('worker_threads');
const path = require('path');

async function generateJobRecommendations() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'recommendationWorker.js'));
        worker.postMessage({ type: 'generateJobRecommendations' });
        worker.on('message', (message) => {
            if (message.type === 'done' && message.function === 'generateJobRecommendations') {
                worker.terminate();
                resolve();
            }
        });
        worker.on('error', (error) => {
            console.error('Worker error:', error);
            reject(error);
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function generateCandidateRecommendations() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'recommendationWorker.js'));
        worker.postMessage({ type: 'generateCandidateRecommendations' });
        worker.on('message', (message) => {
            if (message.type === 'done' && message.function === 'generateCandidateRecommendations') {
                worker.terminate();
                resolve();
            }
        });
        worker.on('error', (error) => {
            console.error('Worker error:', error);
            reject(error);
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

module.exports = {
    generateJobRecommendations,
    generateCandidateRecommendations
};
