import { API_BASE_URL } from './api';

const postJob = async (jobData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to post job');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error posting job:', error);
        throw error;
    }
};

export { postJob };
