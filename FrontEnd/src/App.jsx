import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthContext, AuthProvider } from './context/AuthContext';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import HomeNotLoggedIn from './pages/HomeNotLoggedIn';
import Register from './pages/Register';
import Login from './pages/Login';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Applications from './pages/Applications';
import Applicants from './pages/Applicants';
import SavedJobs from './pages/SavedJobs';
import Candidates from './pages/Candidates';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import Rating from './components/Rating';
import MyJob from './pages/MyJob';
import MyEmployees from './pages/MyEmployees';
import { apiFetch } from './api';

function InnerApp() {
    const { user, logout } = useContext(AuthContext);
    const [employmentInfo, setEmploymentInfo] = useState(null);
    const isAuthenticated = !!user;
    const userRole = user?.role;
    useEffect(() => {
        if (!user?.user_id || userRole !== "employed") return;
        const fetchEmploymentInfo = async () => {
            try {
                const response = await apiFetch(`/employed/${user.user_id}`, {
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

const theme = createTheme({
    palette: {
        primary: {
            main: '#b4f000', // greenyellow equivalent
        },
        secondary: {
            main: '#282c34', // dark background
        },
        background: {
            default: '#282c34',
            paper: '#282c34',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b4f000',
        },
    },
    typography: {
        h1: {
            fontSize: '2rem',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <InnerApp />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
