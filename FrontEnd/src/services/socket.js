import { io } from "socket.io-client";
import { API_BASE_URL } from '../api';

const SOCKET_URL = `${API_BASE_URL}`;
export const socket = io(SOCKET_URL, { autoConnect: false });

// Connect with the JWT from localStorage. The server verifies it in the
// socket handshake middleware and derives identity from it — the userId
// is NEVER sent as a plain value the server would have to trust.
export const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    socket.auth = { token };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};
