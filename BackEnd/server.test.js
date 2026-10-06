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

test('Should not list all users by name search (endpoint is closed)', async () => {
    const response = await request(app)
        .get('/users?name=John')
        .set('Authorization', token());
    // The bulk user listing endpoint is disabled: it previously dumped
    // every user's email/phone/DOB to any authenticated account, and the
    // ?name filter was never actually implemented (no req.query.name).
    expect(response.statusCode).toBe(403);
});

test('Should not return a paginated user list (endpoint is closed)', async () => {
    const response = await request(app)
        .get('/users?page=1&limit=10')
        .set('Authorization', token());
    expect(response.statusCode).toBe(403);
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
// Sprint 4 — authorization / ownership negative tests.
// These are the tests that were missing: they assert that a
// request from the WRONG user is rejected, not just that a
// request from the RIGHT user succeeds.
// =============================================================

test('Should reject an update to another users profile (IDOR)', async () => {
    // Attacker holds a valid token for user_id 1 but targets user_id 2.
    const attackerToken = 'Bearer ' + jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET);

    const response = await request(app)
        .put('/users/2')
        .send({ first_name: 'Hacked' })
        .set('Authorization', attackerToken);

    expect(response.statusCode).toBe(403);
});

test('Should reject reading another users profile (IDOR)', async () => {
    const attackerToken = 'Bearer ' + jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET);

    const response = await request(app)
        .get('/users/2')
        .set('Authorization', attackerToken);

    expect(response.statusCode).toBe(403);
});

test('Should not let a client escalate its own role via profile update', async () => {
    // A candidate attempts to promote themselves to employer.
    const response = await request(app)
        .put('/users/1')
        .send({ role: 'employer', is_verified: 1 })
        .set('Authorization', token());

    // Whether the update succeeds or not, the role must be ignored.
    // We assert on the SQL actually executed against the DB.
    const updateCalls = db.promise().query.mock.calls.filter(c =>
        String(c[0]).toLowerCase().includes('update users set')
    );
    updateCalls.forEach(call => {
        expect(String(call[0]).toLowerCase()).not.toContain('role');
    });
});

test('Should not let a candidate accept their own application', async () => {
    const response = await request(app)
        .put('/applications/application/1')
        .set('Authorization', token()); // candidate token

    expect(response.statusCode).toBe(403);
});

test('GET /applications must scope results to the authenticated user', async () => {
    db.promise().query.mockResolvedValueOnce([[]]);

    const response = await request(app)
        .get('/applications')
        .set('Authorization', token());

    expect(response.statusCode).toBe(200);
    const selectCall = db.promise().query.mock.calls.find(c =>
        String(c[0]).toLowerCase().includes('select') &&
        String(c[0]).toLowerCase().includes('from applications')
    );
    expect(selectCall).toBeDefined();
    expect(String(selectCall[0]).toLowerCase()).toContain('where');
});

test('GET /messages must scope results to the authenticated user', async () => {
    db.promise().query.mockResolvedValueOnce([[]]);

    const response = await request(app)
        .get('/messages')
        .set('Authorization', token());

    expect(response.statusCode).toBe(200);
    const selectCall = db.promise().query.mock.calls.find(c =>
        String(c[0]).toLowerCase().includes('from messages')
    );
    expect(selectCall).toBeDefined();
    expect(String(selectCall[0]).toLowerCase()).toContain('where');
});

test('Should not let a candidate set the status of their own application to accepted', async () => {
    db.promise().query.mockResolvedValueOnce([[]]); // no existing application
    db.promise().query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }]);

    const response = await request(app)
        .post('/applications')
        .send({ job_id: 3, status: 'accepted' })
        .set('Authorization', token());

    expect(response.statusCode).toBe(201);
    const insertCall = db.promise().query.mock.calls.find(c =>
        String(c[0]).toLowerCase().includes('insert into applications')
    );
    expect(insertCall).toBeDefined();
    // The stored status must be the server-chosen default, not the client's value.
    expect(insertCall[1][2]).toBe('pending');
});

// =============================================================
// Sprint 4 — remaining ownership gaps found by the systematic
// grep audit of every GET route that authenticates but does not
// authorize. Four endpoints still returned rows for any user id.
// =============================================================

test('GET /profiles/:userId must only return the callers own profile', async () => {
    db.promise().query.mockResolvedValueOnce([[{ user_id: 1, cv: 'secret.pdf' }]]);

    const response = await request(app)
        .get('/profiles/2')
        .set('Authorization', token()); // token is user_id 1

    expect(response.statusCode).toBe(403);
});

test('GET /search_history must only return the callers own history', async () => {
    db.promise().query.mockResolvedValueOnce([[]]);

    const response = await request(app)
        .get('/search_history')
        .set('Authorization', token());

    expect(response.statusCode).toBe(200);
    const selectCall = db.promise().query.mock.calls.find(c =>
        String(c[0]).toLowerCase().includes('from search_history')
    );
    expect(selectCall).toBeDefined();
    expect(String(selectCall[0]).toLowerCase()).toContain('where');
});

test('GET /applications/:application_id must reject a non-owner', async () => {
    db.promise().query.mockResolvedValueOnce([[{ application_id: 1, user_id: 9 }]]);

    const response = await request(app)
        .get('/applications/1')
        .set('Authorization', token()); // token is user_id 1, row belongs to 9

    expect(response.statusCode).toBe(403);
});

test('GET /users must not expose every user to any authenticated caller', async () => {
    const response = await request(app)
        .get('/users')
        .set('Authorization', token()); // a candidate token, not an admin

    // The endpoint is closed: no bulk user dump for ordinary accounts.
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toMatch(/forbidden/i);
});


// =============================================================
// =============================================================
// Sprint 4 — server-authoritative registration fields.
// A fresh signup must never be pre-verified, regardless of what the
// client puts in the body (mass assignment).
// =============================================================

test('Should force is_verified to 0 on signup regardless of client input', async () => {
    db.promise().query.mockResolvedValueOnce([{ insertId: 42 }]);

    await request(app)
        .post('/users')
        .send({
            first_name: 'Eve', last_name: 'Attacker', email: 'eve@example.com',
            password: 'secret123', date_of_birth: '1990-01-01',
            phone_number: '123456',
            is_verified: 1,          // tries to self-verify
            role: 'candidate',
        });

    const insertCall = db.promise().query.mock.calls.find(c =>
        String(c[0]).toLowerCase().includes('insert into users')
    );
    expect(insertCall).toBeDefined();
    // is_verified is the 7th bound parameter and must always be 0.
    expect(insertCall[1][6]).toBe(0);
});


// Sprint 4 — socket authorization tests.
//
// The socket layer previously accepted ANY userId from the client
// with no authentication: registerUser trusted the payload, and
// sendMessage wrote straight to MySQL from the claimed senderId.
// These tests assert that a socket connection must present a valid
// JWT, and that identity comes from the token, never from the event.
// =============================================================

// Helper: build a socket.io client that connects with a given auth.
const { io: ioClient } = require('socket.io-client');

const startSocketServer = () => new Promise((resolve) => {
    const httpServer = require('http').createServer();
    const initializeSocket = require('./socket');
    const io = initializeSocket(httpServer, db);
    httpServer.listen(0, () => {
        resolve({
            io,
            httpServer,
            port: httpServer.address().port,
            close: () => new Promise(r => { io.close(); httpServer.close(r); }),
        });
    });
});

const connectClient = (port, auth) => new Promise((resolve, reject) => {
    const client = ioClient(`http://localhost:${port}`, {
        auth,
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
        timeout: 2000,
    });
    const timer = setTimeout(() => { client.close(); reject(new Error('connect timeout')); }, 3000);
    client.on('connect', () => { clearTimeout(timer); resolve(client); });
    client.on('connect_error', (err) => { clearTimeout(timer); client.close(); reject(err); });
});

describe('Socket authorization', () => {
    let server;

    beforeAll(async () => {
        server = await startSocketServer();
    });

    afterAll(async () => {
        await server.close();
    });

    beforeEach(() => {
        db.promise().query.mockReset();
    });

    test('Should reject a socket connection with no token', async () => {
        await expect(connectClient(server.port, {}))
            .rejects.toThrow();
    });

    test('Should reject a socket connection with an invalid token', async () => {
        await expect(connectClient(server.port, { token: 'not-a-jwt' }))
            .rejects.toThrow();
    });

    test('Should accept a socket connection with a valid token', async () => {
        const client = await connectClient(server.port, {
            token: jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET),
        });
        expect(client.connected).toBe(true);
        client.close();
    });

    test('Should ignore registerUser spoofing and use the token identity', async () => {
        // Receiver connects with a valid token for user 2.
        const receiver = await connectClient(server.port, {
            token: jwt.sign({ user_id: 2, role: 'employer' }, process.env.JWT_SECRET),
        });
        const received = [];
        receiver.on('receiveMessage', (m) => received.push(m));

        // Sender connects with a valid token for user 1, then lies about
        // its identity via the legacy registerUser event.
        const sender = await connectClient(server.port, {
            token: jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET),
        });
        sender.emit('registerUser', 999);
        await new Promise(r => setTimeout(r, 100));

        // REST already persisted this message; the socket only relays it.
        sender.emit('sendMessage', { receiver_id: 2, message_id: 77, message: 'hi' });
        await new Promise(r => setTimeout(r, 200));

        expect(received).toHaveLength(1);
        // server-authoritative: sender is 1 (the verified JWT), never 999.
        expect(received[0].sender_id).toBe(1);
        expect(received[0].receiver_id).toBe(2);
        expect(received[0].message_id).toBe(77);

        sender.close();
        receiver.close();
    });

    test('Should never write to the database from the socket layer', async () => {
        const client = await connectClient(server.port, {
            token: jwt.sign({ user_id: 1, role: 'candidate' }, process.env.JWT_SECRET),
        });

        client.emit('sendMessage', { senderId: 1, receiverId: 2, messageContent: 'hi' });
        await new Promise(r => setTimeout(r, 150));

        const insertCall = db.promise().query.mock.calls.find(c =>
            String(c[0]).toLowerCase().includes('insert into messages')
        );
        // The REST route owns persistence. The socket only relays.
        expect(insertCall).toBeUndefined();

        client.close();
    });
});


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
