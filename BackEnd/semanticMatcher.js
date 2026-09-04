const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs');

let model;

async function initModel() {
    if (!model) {
        model = await use.load();
    }
    return model;
}

function l2Normalize(tensor) {
    const norm = tf.norm(tensor, 'euclidean', 1, true);
    return tensor.div(norm);
}

function composeText({
    title = '',
    description = '',
    skills = '',
    education = '',
    certifications = '',
    languages = '',
    location = '',
    job_type = '',
    salary = '',
    remote_option = ''
}) {
    const textParts = [
        `Title: ${title}`,
        `Description: ${description}`,
        `Skills: ${skills}`,
        `Education: ${education}`,
        `Certifications: ${certifications}`,
        `Languages: ${languages}`,
        `Job Type: ${job_type}`,
        `Location: ${location}`,
        `Salary: ${salary}`,
        `Remote Option: ${remote_option}`
    ];

    return textParts.filter(part => part.trim() !== '').join(' ').trim() || 'No relevant information';
}

function normalizeScore(score, threshold = 0.5) {
    if (score < threshold) return 0;
    const scaled = ((score - threshold) / (1 - threshold)) * 10;
    return Math.min(Math.max(scaled, 0), 10);
}

async function computeSimilarityBatch(jobInputs, resumeInputs) {
    await initModel();

    const jobTexts = jobInputs.map(composeText);
    const resumeTexts = resumeInputs.map(composeText);
    const allTexts = [...jobTexts, ...resumeTexts];

    const embeddings = await model.embed(allTexts);

    const jobEmbeddings = embeddings.slice([0, 0], [jobInputs.length, -1]);
    const resumeEmbeddings = embeddings.slice([jobInputs.length, 0], [resumeInputs.length, -1]);

    const normJobs = l2Normalize(jobEmbeddings);
    const normResumes = l2Normalize(resumeEmbeddings);

    const similarityMatrix = tf.matMul(normJobs, normResumes, false, true);
    const rawScores = await similarityMatrix.array();

    const normalizedScores = rawScores.map(row => row.map(score => normalizeScore(score)));
    return normalizedScores;
}

async function computeSimilarity(jobInput, resumeInput) {
    const scores = await computeSimilarityBatch([jobInput], [resumeInput]);
    return scores[0][0]; 
}

module.exports = {
    computeSimilarityBatch,
    computeSimilarity
};

