import React from 'react';
import { Link } from 'react-router-dom';
import './HomeNotLoggedIn.css';

function HomeNotLoggedIn() {
    return (
        <div className="home-not-logged-container">
            <h1>Welcome to Our Platform!</h1>
            <p className="subtitle">Discover job opportunities and connect with employers.</p>
            <p className="login-callout">
                Please <Link to="/login">log in</Link> or <Link to="/register">sign up</Link> to get started.
            </p>
        </div>
    );
}

export default HomeNotLoggedIn;
