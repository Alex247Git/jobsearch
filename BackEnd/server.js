const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const userRoutes = require('./routes/users');
const db = require('./db');
const candidatesRouter = require('./routes/candidates');
const companiesRouter = require('./routes/companies');
const employersRouter = require('./routes/employers');
const jobsRouter = require('./routes/jobs');
const messagesRouter = require('./routes/messages');
const profilesRouter = require('./routes/profiles');
const companyRatingsRouter = require('./routes/company_ratings');
const candidateRatingsRoutes = require('./routes/candidate_ratings');
const recommendationsRouter = require('./routes/recommendations');
const savedJobsRouter = require('./routes/saved_jobs');
const searchHistoryRouter = require('./routes/search_history');
const applicationsRouter = require('./routes/applications');
const employedRouter = require('./routes/employed');
const http = require('http');
const initializeSocket = require('./socket');


console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('DB_NAME:', process.env.DB_NAME);

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocket(server, db);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use('/users', userRoutes);
app.use('/candidates', candidatesRouter);
app.use('/companies', companiesRouter);
app.use('/employers', employersRouter);
app.use('/jobs', jobsRouter);
app.use('/messages', messagesRouter);
app.use('/profiles', profilesRouter);
app.use('/company_ratings', companyRatingsRouter);
app.use('/candidate_ratings', candidateRatingsRoutes);
app.use('/recommendations', recommendationsRouter);
app.use('/saved_jobs', savedJobsRouter);
app.use('/search_history', searchHistoryRouter);
app.use('/applications', applicationsRouter);
app.use('/employed', employedRouter);

module.exports = app;
