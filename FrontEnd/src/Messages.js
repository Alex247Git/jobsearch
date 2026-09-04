import React, { useEffect, useState, useRef } from "react";
import { socket, connectSocket, disconnectSocket } from "./socket";
import "./Messages.css";
import { API_BASE_URL } from './api';

function Messages({ user }) {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user?.user_id) return;
        connectSocket(user.user_id);
        fetch(`${API_BASE_URL}/messages/conversations/${user.user_id}`)
            .then(res => res.json())
            .then(data => setConversations(data))
            .catch(err => console.error("Error fetching conversations:", err));
        const handleMessage = (data) => {
            if (selectedUser && (data.sender_id === selectedUser.user_id || data.receiver_id === selectedUser.user_id)) {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        };
        socket.on("receiveMessage", handleMessage);
        return () => {
            socket.off("receiveMessage", handleMessage);
            disconnectSocket();
        };
    }, [user?.user_id, selectedUser?.user_id]);

    const loadMessages = (conversation) => {
        setSelectedUser(conversation);
        fetch(`${API_BASE_URL}/messages/${user.user_id}/${conversation.user_id}`)
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                scrollToBottom();
            })
            .catch(err => console.error("Error fetching messages:", err));
    };

    const sendMessage = () => {
        if (!message.trim() || !selectedUser) return;

        const messageData = {
            sender_id: user.user_id,
            receiver_id: selectedUser.user_id,
            message: message,
        };

        fetch(`${API_BASE_URL}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || "Failed to send message"); });
                }
                return res.json();
            })
            .then(savedMessage => {
                const newMessage = {
                    message_id: savedMessage.messageId,
                    sender_id: user.user_id,
                    receiver_id: selectedUser.user_id,
                    message: message,
                    created_at: new Date().toISOString()
                };

                setMessages([...messages, newMessage]);
                setMessage("");
                socket.emit("sendMessage", newMessage);
                scrollToBottom();
            })
            .catch(err => {
                console.error("Error sending message:", err.message);
                alert(`Error: ${err.message}`);
            });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="sidebar">
                <h3>Chats</h3>
                <div className="conversation-list">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <div
                                key={conv.user_id}
                                className={`conversation-item ${selectedUser?.user_id === conv.user_id ? "active" : ""}`}
                                onClick={() => loadMessages(conv)}
                            >
                                <div className="conversation-avatar">{conv.first_name.charAt(0)}</div>
                                <div className="conversation-info">
                                    <p className="conversation-name">{conv.first_name} {conv.last_name}</p>
                                    <p className="conversation-last-message">Click to view chat</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-conversations">You don't have open conversations</p>
                    )}
                </div>
            </div>
            <div className="chat-box">
                {conversations.length === 0 ? (
                    <div className="empty-chat-box">
                        <p><strong>You don't have open conversations</strong></p>
                    </div>
                ) : selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>
                        </div>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender_id === user.user_id ? "sent" : "received"}`}
                                >
                                    <p>{msg.message}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="input-container">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <p className="select-chat"><strong>Select a conversation to start chatting</strong></p>
                )}
            </div>
        </div>
    );
}

export default Messages;
