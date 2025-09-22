import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();

    const isAuthenticated = !!user;
    const userRole = user?.role;

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        logout();
        navigate('/HomeNotLoggedIn');
    };

    return (
        <nav className="navbar">
            <ul className="navbar-links">
                {isAuthenticated && (userRole === 'candidate' || userRole === 'employed') && (
                    <li><Link to="/Jobs">Jobs</Link></li>
                )}
                {isAuthenticated && userRole === 'employer' && (
                    <li><Link to={`/Candidate/${user?.user_id}`}>Candidates</Link></li>
                )}
                {isAuthenticated && userRole === 'employer' && (
                    <li><Link to="/MyEmployees">My Employees</Link></li>
                )}
                {isAuthenticated && userRole === 'employed' && (
                    <li><Link to="/MyJob">My Job</Link></li>
                )}
                {isAuthenticated ? (
                    <li className="navbar-user-menu">
                        <button className="navbar-user-name-btn" onClick={toggleDropdown}>
                            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
                        </button>
                        {dropdownVisible && (
                            <ul className="navbar-dropdown-menu">
                                <li><Link to={`/Profile/${user?.user_id}`}>Profile</Link></li>
                                <li><Link to="/Messages">My Messages</Link></li>
                                {(userRole === 'candidate' || userRole === 'employed') && (
                                    <>
                                        <li><Link to="/Applications">My Applications</Link></li>
                                        <li><Link to="/saved-jobs">My Saved Jobs</Link></li>
                                    </>
                                )}
                                {userRole === 'employer' && (
                                    <li><Link to="/Applicants">Applicants</Link></li>
                                )}
                                <li>
                                    <button className="navbar-btn navbar-logout-btn" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>
                ) : (
                    <li className="navbar-auth-buttons">
                        <Link to="/register">
                            <button className="navbar-btn navbar-register-btn">Register</button>
                        </Link>
                        <Link to="/login">
                            <button className="navbar-btn navbar-login-btn">Login</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
