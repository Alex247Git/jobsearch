const { Server } = require('socket.io');

module.exports = (server, db) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    
    const userSockets = {};
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        socket.on('registerUser', (userId) => {
            userSockets[userId] = socket.id;
            console.log(`User ${userId} connected with socket ID: ${socket.id}`);
        });
        socket.on('sendMessage', async (data) => {
            const { senderId, receiverId, messageContent } = data;
            const timestamp = new Date();
            try {
                const query = `INSERT INTO messages (sender_id, receiver_id, message, sent_at) VALUES (?, ?, ?, NOW())`;
                await db.promise().query(query, [senderId, receiverId, messageContent]);
                console.log(`Message saved from ${senderId} to ${receiverId}: "${messageContent}"`);
                if (userSockets[receiverId]) {
                    io.to(userSockets[receiverId]).emit('receiveMessage', {
                        senderId,
                        messageContent,
                        timestamp,
                    });
                }
            } catch (err) {
                console.error('Error saving message:', err.message);
            }
        });
        socket.on('disconnect', () => {
            const userId = Object.keys(userSockets).find((key) => userSockets[key] === socket.id);
            if (userId) {
                delete userSockets[userId];
                console.log(`User ${userId} disconnected.`);
            }
        });
    });
    return io;
};
