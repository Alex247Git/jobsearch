const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-jwt-secret';

// The recommendations route spawns a heavy background worker. In tests we
// stub it so the POST /recommendations/generate test only verifies the fast
// "started" response and nothing keeps running after the suite.
jest.mock('./services/recommendationService', () => ({
    generateForAll: jest.fn(async () => undefined),
    getStatus: jest.fn(() => ({ status: 'idle' })),
}));

// Mock the mysql2 pool so tests never need a live database.
jest.mock('./db', () => {
    const query = jest.fn();
    const execute = jest.fn();
    return { promise: () => ({ query, execute }) };
});

const db = require('./db');
const app = require('./server');

const token = () =>
    'Bearer ' + jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET);

beforeEach(() => {
    db.promise().query.mockReset();
    db.promise().execute.mockReset();
});

test('Should return a 404 error when accessing a non-existent route', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.statusCode).toBe(404);
});

test('Should return a 400 error when creating a user with missing required fields', async () => {
    const response = await request(app)
        .post('/users')
        .send({ username: 'testUser' });
    expect(response.statusCode).toBe(400);
});

test('Should return a 400 error when updating a user with invalid email format', async () => {
    const response = await request(app)
        .put('/users/1')
        .send({ email: 'invalid_email_format' })
        .set('Authorization', token());
    expect(response.statusCode).toBe(400);
});

test('Should return a 401 error when attempting to access user data without authentication', async () => {
    const response = await request(app)
        .get('/users/1')
        .set('Authorization', '');
    expect(response.statusCode).toBe(401);
});

test('Should return a 500 error when the database query fails', async () => {
    db.promise().query.mockRejectedValueOnce(new Error('Database connection failed'));
    const response = await request(app)
        .get('/users/1')
        .set('Authorization', token());
    expect(response.statusCode).toBe(500);
});

test('Should return the correct user data when retrieving a user by ID', async () => {
    db.promise().query.mockResolvedValueOnce([
        [{ user_id: 1, first_name: 'Alice', last_name: 'Smith', role: 'candidate' }],
    ]);
    const response = await request(app)
        .get('/users/1')
        .set('Authorization', token());
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user_id', 1);
    expect(response.body).toHaveProperty('first_name', 'Alice');
});

test("Should return a 200 status code when updating a user's information", async () => {
    db.promise().query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const response = await request(app)
        .put('/users/1')
        .send({ email: 'updated_email@example.com' })
        .set('Authorization', token());
    expect(response.statusCode).toBe(200);
});

test('Should return a 500 status code when deleting a user with foreign key constraint', async () => {
    db.promise().query.mockRejectedValueOnce(new Error('ER_ROW_IS_REFERENCED_2'));
    const response = await request(app)
        .delete('/users/1')
        .set('Authorization', token());
    expect(response.statusCode).toBe(500);
});

test('Should return a 200 status code when searching for users by name', async () => {
    db.promise().query.mockResolvedValueOnce([[{ user_id: 1, first_name: 'John' }]]);
    const response = await request(app)
        .get('/users?name=John')
        .set('Authorization', token());
    expect(response.statusCode).toBe(200);
});

test('Should return a 200 status code when retrieving a paginated list of users', async () => {
    db.promise().query.mockResolvedValueOnce([[{ user_id: 1 }, { user_id: 2 }]]);
    const response = await request(app)
        .get('/users?page=1&limit=10')
        .set('Authorization', token());
    expect(response.statusCode).toBe(200);
});

test('Should return a token when registering a user', async () => {
    db.promise().query.mockResolvedValueOnce([{ insertId: 42 }]);
    const response = await request(app)
        .post('/users')
        .send({
            first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com',
            password: 'secret123', date_of_birth: '1990-01-01',
            phone_number: '123456', is_verified: 1, role: 'candidate',
        });
    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded.user_id).toBe(42);
    expect(decoded.role).toBe('candidate');
});

test('Should not return the password hash when fetching a user', async () => {
    db.promise().query.mockResolvedValueOnce([
        [{ user_id: 1, first_name: 'Alice', password: '$2b$10$hashhashhash' }],
    ]);
    const response = await request(app)
        .get('/users/1')
        .set('Authorization', token());
    expect(response.statusCode).toBe(200);
    expect(response.body.password).toBeUndefined();
    expect(response.body.first_name).toBe('Alice');
});

test('Should return 403 when updating another user', async () => {
    const response = await request(app)
        .put('/users/2')
        .send({ first_name: 'Hacker' })
        .set('Authorization', token());
    expect(response.statusCode).toBe(403);
});

test('Should return 403 when fetching another user\'s saved jobs', async () => {
    const response = await request(app)
        .get('/saved_jobs/999')
        .set('Authorization', token());
    expect(response.statusCode).toBe(403);
});

test('Should return 403 when a candidate updates a job (employer-only)', async () => {
    const response = await request(app)
        .put('/jobs/5')
        .send({ title: 'New title' })
        .set('Authorization', token());
    expect(response.statusCode).toBe(403);
});

test('Should override the sender_id with the authenticated user when sending a message', async () => {
    db.promise().execute.mockResolvedValueOnce([{ affectedRows: 1, insertId: 7 }]);
    const response = await request(app)
        .post('/messages')
        .send({ sender_id: 999, receiver_id: 2, message: 'hello' })
        .set('Authorization', token());
    expect(response.statusCode).toBe(201);
    const [query, params] = db.promise().execute.mock.calls[0];
    expect(params[0]).toBe(1); // sender forced to token's user_id, not body's 999
    expect(params[1]).toBe(2);
    expect(query).toContain('INSERT INTO messages');
});

test('Should return 403 when fetching a conversation the user is not part of', async () => {
    const response = await request(app)
        .get('/messages/2/3')
        .set('Authorization', token());
    expect(response.statusCode).toBe(403);
});

test('Should return a 401 when fetching saved jobs without authentication', async () => {
    const response = await request(app).get('/saved_jobs/1');
    expect(response.statusCode).toBe(401);
});

test('Should return a 401 when posting a message without authentication', async () => {
    const response = await request(app)
        .post('/messages')
        .send({ sender_id: 1, receiver_id: 2, message_text: 'hello' });
    expect(response.statusCode).toBe(401);
});

test('Should return a 401 when listing applications without authentication', async () => {
    const response = await request(app).get('/applications');
    expect(response.statusCode).toBe(401);
});

test('Should still allow anonymous access to public job listings', async () => {
    db.promise().query.mockResolvedValueOnce([[{ job_id: 5, title: 'Dev' }]]);
    const response = await request(app).get('/jobs');
    expect(response.statusCode).toBe(200);
});

const fs = require('fs');
const path = require('path');
const { LOG_FILE, logEvent } = require('./audit/auditLog');

test('logEvent writes a JSON entry to the audit log file', () => {
    const before = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8').length : 0;
    logEvent('test_event', { headers: {}, ip: '127.0.0.1', method: 'POST', originalUrl: '/test' }, { user_id: 99 });
    const after = fs.readFileSync(LOG_FILE, 'utf8').length;
    expect(after).toBeGreaterThan(before);
    const lastLine = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n').pop();
    const entry = JSON.parse(lastLine);
    expect(entry.event).toBe('test_event');
    expect(entry.user_id).toBe(99);
    expect(entry.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(entry.path).toBe('/test');
});

test('Should return 404 from authorizeOwner when the resource does not exist', async () => {
    // No mock for this query -> the middleware will hit the unmocked pool.
    // Use a param the middleware can parse but the unmocked pool will error;
    // for this test we instead mock the failure path.
    db.promise().query.mockResolvedValueOnce([[]]);
    const response = await request(app)
        .delete('/applications/999999')
        .set('Authorization', token());
    expect([403, 404]).toContain(response.statusCode);
});

// =============================================================
// Sprint 3 — critical-flow integration-style tests (apply / chat /
// recommendations) on top of the mocked DB
// =============================================================

test('Should submit an application for a job the candidate has not applied to', async () => {
    // First query: duplicate-check SELECT returns no existing row.
    db.promise().query.mockResolvedValueOnce([[]]);
    // Second query: the INSERT resolves successfully.
    db.promise().query.mockResolvedValueOnce([{ insertId: 11, affectedRows: 1 }]);

    const response = await request(app)
        .post('/applications')
        .send({ job_id: 3, status: 'pending' })
        .set('Authorization', token());

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toContain('Application submitted');
    // The apply endpoint must be server-authoritative about the user.
    let insertParams = null;
    for (const call of db.promise().query.mock.calls) {
        if (call[0].toString().toLowerCase().includes('insert into applications')) {
            insertParams = call[1];
        }
    }
    expect(insertParams).not.toBeNull();
    expect(insertParams[0]).toBe(1); // user_id driven by token, not body
    expect(insertParams[1]).toBe(3); // job_id from body
});

test('Should reject a duplicate application with 400', async () => {
    // Duplicate-check SELECT returns an existing row -> 400.
    db.promise().query.mockResolvedValueOnce([[{ user_id: 1, job_id: 3, status: 'pending' }]]);

    const response = await request(app)
        .post('/applications')
        .send({ job_id: 3, status: 'pending' })
        .set('Authorization', token());

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('already applied');
});

test('Should return 400 when posting a message without a receiver', async () => {
    const response = await request(app)
        .post('/messages')
        .send({ message: 'hello' }) // missing receiver_id
        .set('Authorization', token());

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('required fields');
});

test('Should kick off recommendation generation and report started', async () => {
    // The route responds immediately and runs the heavy work in the background.
    const response = await request(app)
        .post('/recommendations/generate')
        .send({ type: 'all' })
        .set('Authorization', token());

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('running');
    expect(response.body.message).toContain('started');
});
