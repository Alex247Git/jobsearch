import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Header.css';

function Header({ isAuthenticated, onLogout, toggleUserRole, userRole, user, employmentInfo }) {
    const navigate = useNavigate();


    const handleLogoClick = () => {
        if (isAuthenticated) {
            navigate('/');
        } else {
            navigate('/HomeNotLoggedIn');
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <button
                    className="logo-button"
                    onClick={handleLogoClick}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        cursor: 'pointer',
                        textDecoration: 'none',
                    }}
                >
                    <h1 className="logo">JobSearch</h1>
                </button>
                <Navbar
                    isAuthenticated={isAuthenticated}
                    onLogout={onLogout}
                    userRole={userRole}
                    toggleUserRole={toggleUserRole}
                    user={user}
                    employmentInfo={employmentInfo}
                />
            </div>
        </header>
    );
}

export default Header;
