import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Home.css';

function Home() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    return (
        <div className="home-container">
            <h1>Welcome {user ? user.first_name : 'Guest'}!</h1>
            {!user && (
                <p>Please log in to access job listings or employer tools.</p>
            )}
            {(user?.role === 'candidate' || user?.role === 'employed') && (
                <>
                    <h2>Find your next job here!</h2>
                    <button className="jobs-button" onClick={() => navigate('/Jobs')}>
                        Browse Jobs
                    </button>
                </>
            )}
            {user?.role === 'employer' && (
                <>
                    <h2>Find your next employee here!</h2>
                    <button className="jobs-button" onClick={() => navigate('/Candidates')}>
                        Browse Candidates
                    </button>
                </>
            )}
        </div>
    );
}

export default Home;
