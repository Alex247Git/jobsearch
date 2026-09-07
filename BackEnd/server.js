const express = require('express');
require('express-async-errors');
const dotenv = require('dotenv');
dotenv.config();

// Fail fast: without a JWT secret every authenticated route would 500
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
    process.exit(1);
}

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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


const app = express();
const { auditMiddleware } = require('./audit/auditLog');
const errorHandler = require('./middleware/errorHandler');

app.use(helmet());

// Brute-force protection for the login endpoint.
// Note: in-memory store — restarts clear the counter, so in
// development restart the server if you lock yourself out.
// For production use a persistent store (Redis via rate-limit-redis).
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes or restart the backend.',
    },
});
app.use('/users/login', loginLimiter);

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocket(server, db);

app.use(auditMiddleware);
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

app.use(errorHandler);

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        // Start recommendation generation in background
        const recommendationService = require('./services/recommendationService');
        recommendationService.initRecommendations();
    });
}

module.exports = app;
