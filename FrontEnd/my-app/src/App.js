import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContext, AuthProvider } from './AuthContext';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import HomeNotLoggedIn from './HomeNotLoggedIn';
import Register from './Register';
import Login from './Login';
import Jobs from './Jobs';
import Profile from './Profile';
import Messages from './Messages';
import Applications from './Applications';
import Applicants from './Applicants';
import SavedJobs from './SavedJobs';
import Candidates from './Candidates';
import JobDetails from './JobDetails';
import Companies from './Companies';
import Rating from './Rating';
import MyJob from './MyJob';
import MyEmployees from './MyEmployees';

function InnerApp() {
    const { user, logout } = useContext(AuthContext);
    const [employmentInfo, setEmploymentInfo] = useState(null);
    const isAuthenticated = !!user;
    const userRole = user?.role;
    useEffect(() => {
        if (!user?.user_id || userRole !== "employed") return;
        const fetchEmploymentInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/employed/${user.user_id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const data = await response.json();
                setEmploymentInfo(data?.employed_id ? data : null);
            } catch (err) {
                console.error("⚠️ Error fetching employment info:", err);
                setEmploymentInfo(null);
            }
        };
        fetchEmploymentInfo();
    }, [user, userRole]);
    const determineHome = () => {
        return isAuthenticated ? <Home /> : <HomeNotLoggedIn />;
    };

return (
        <Router>
            <div className="app">
                <Header
                    isAuthenticated={isAuthenticated}
                    onLogout={logout}
                    userRole={userRole}
                    user={user}
                    employmentInfo={employmentInfo}
                />
                <div className="app-body">
                    <Routes>
                        <Route path="/" element={determineHome()} />
                        <Route path="/Register" element={<Register />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="/Home" element={<Home />} />
                        <Route path="/HomeNotLoggedIn" element={<HomeNotLoggedIn />} />
                        <Route path="/Jobs" element={<Jobs user={user} />} />
                        <Route path="/Profile/:userId?" element={<Profile user={user} />} />
                        <Route path="/Messages" element={<Messages user={user} />} />
                        <Route path="/Applications" element={<Applications user={user} />} />
                        <Route path="/Applicants" element={<Applicants user={user} />} />
                        <Route path="/saved-jobs" element={<SavedJobs user={user} />} />
                        <Route path="/Candidates" element={<Candidates user={user} />} />
                        <Route path="/Job/:jobId" element={<JobDetails user={user} />} />
                        <Route path="/Companies/:companyId" element={<Companies />} />
                        <Route path="/Candidate/:user_id" element={<Candidates user={user} />} />
                        <Route path='/Rating/:companyId' element={<Rating user={user} />} />
                        <Route path="/MyJob" element={<MyJob user={user} />} />
                        <Route path="/MyCompany/:companyId" element={<Companies />} />
                        <Route path="/MyEmployees" element={<MyEmployees user={user} />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <InnerApp />
        </AuthProvider>
    );
}

export default App;
