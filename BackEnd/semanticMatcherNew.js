let extractor;

async function initModel() {
    if (!extractor) {
        const { pipeline } = await import('@huggingface/transformers');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
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

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
}

async function computeSimilarityBatch(jobInputs, resumeInputs) {
    await initModel();

    const jobTexts = jobInputs.map(composeText);
    const resumeTexts = resumeInputs.map(composeText);
    const allTexts = [...jobTexts, ...resumeTexts];

    const outputs = await extractor(allTexts, { pooling: 'mean', normalize: true });
    const embeddings = outputs.data; // Assuming it's a flat array

    // Reshape to 2D array: [num_texts, embedding_dim]
    const embeddingDim = 384; // For all-MiniLM-L6-v2
    const numTexts = allTexts.length;
    const reshapedEmbeddings = [];
    for (let i = 0; i < numTexts; i++) {
        reshapedEmbeddings.push(embeddings.slice(i * embeddingDim, (i + 1) * embeddingDim));
    }

    const jobEmbeddings = reshapedEmbeddings.slice(0, jobInputs.length);
    const resumeEmbeddings = reshapedEmbeddings.slice(jobInputs.length);

    const similarityMatrix = [];
    for (let i = 0; i < jobInputs.length; i++) {
        const row = [];
        for (let j = 0; j < resumeInputs.length; j++) {
            const sim = cosineSimilarity(jobEmbeddings[i], resumeEmbeddings[j]);
            row.push(normalizeScore(sim));
        }
        similarityMatrix.push(row);
    }

    return similarityMatrix;
}

async function computeSimilarity(jobInput, resumeInput) {
    const scores = await computeSimilarityBatch([jobInput], [resumeInput]);
    return scores[0][0];
}

module.exports = {
    computeSimilarityBatch,
    computeSimilarity
};
