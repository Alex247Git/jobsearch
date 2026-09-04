import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { apiFetch } from '../api';

const Rating = ({ user }) => {
    const { companyId } = useParams();   
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user?.user_id) {
            setMessage('Πρέπει να είστε συνδεδεμένοι για να υποβάλετε αξιολόγηση.');
            return;
        }

        const user_id = user?.user_id;

        try {
            const response = await apiFetch(`/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id,
                    company_id: companyId, 
                    rating,
                    comment,
                }),
            });
            if (!response.ok) {
                throw new Error(`Σφάλμα: ${response.status}`);
            }
            setMessage('Η αξιολόγησή σας υποβλήθηκε με επιτυχία!');
        } catch (err) {
            console.error(err);
            setMessage('Υπήρξε πρόβλημα με την υποβολή της αξιολόγησής σας.');
        }
    };

    return (
        <div>
            <h2>Rate the Company</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Βαθμολογία:
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        min="1"
                        max="5"
                        required
                    />
                </label>
                <br />
                <label>
                    Σχόλιο (προαιρετικό):
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Γράψτε ένα σχόλιο αν θέλετε..."
                    />
                </label>
                <br />
                <button type="submit">Υποβολή Αξιολόγησης</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Rating;
