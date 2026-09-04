const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-jwt-secret';

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
