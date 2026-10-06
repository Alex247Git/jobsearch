const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = (server, db) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // Map: user_id (from the verified JWT) -> socket.id.
    const userSockets = {};

    io.use((socket, next) => {
        // Handshake auth: the client must present a JWT.
        // Without this, ANY client could connect and claim any identity
        // via the old `registerUser` event (identity spoofing).
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            // Attach the verified identity — never trust the client payload.
            socket.userId = payload.user_id;
            socket.role = payload.role;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id, 'user:', socket.userId);
        userSockets[socket.userId] = socket.id;

        // Legacy event kept for backwards compatibility, but the server
        // IGNORES the payload — identity comes from the verified JWT only.
        socket.on('registerUser', () => { /* no-op: identity is socket.userId */ });

        // The socket layer is a RELAY ONLY. It must never write to the
        // database — persistence is owned by POST /messages (REST),
        // which validates input, enforces ownership, and writes the
        // audit log. The socket only forwards the already-saved message
        // to the receiver's screen in real time.
        socket.on('sendMessage', (data) => {
            const { receiver_id, message_id, message, created_at } = data || {};
            if (!receiver_id) return;
            const target = userSockets[receiver_id];
            if (target) {
                io.to(target).emit('receiveMessage', {
                    message_id,
                    sender_id: socket.userId,   // server-authoritative
                    receiver_id,
                    message,
                    created_at,
                });
            }
        });

        socket.on('disconnect', () => {
            if (userSockets[socket.userId] === socket.id) {
                delete userSockets[socket.userId];
            }
            console.log('Socket disconnected:', socket.id, 'user:', socket.userId);
        });
    });

    return io;
};
