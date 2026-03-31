// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false); // pour ouvrir/fermer la fenêtre du chat
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Bonjour ! Je suis ton assistant. Comment puis-je t’aider ?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Scroll automatique vers le dernier message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simuler une réponse du bot
    const botReply = (userMessage) => {
        const reply = `🤖 Tu as dit : "${userMessage}"`; // exemple simple
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'bot', text: reply }]);
        }, 800);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { from: 'user', text: input }]);
        botReply(input);
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={styles.chatContainer}>
            {/* Bouton pour ouvrir/fermer le chat */}
            <button style={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div style={styles.chatBox}>
                    <div style={styles.header}>ChatBot</div>

                    <div style={styles.messages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.message,
                                    alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.from === 'user' ? '#4dabf7' : '#e5e5e5',
                                    color: msg.from === 'user' ? '#fff' : '#000'
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Écris un message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            style={styles.input}
                        />
                        <button onClick={handleSend} style={styles.sendBtn}>➡️</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles inline simples
const styles = {
    chatContainer: { position: 'fixed', bottom: 20, right: 20, zIndex: 1000 },
    toggleBtn: {
        backgroundColor: '#4dabf7',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 60,
        height: 60,
        cursor: 'pointer',
        fontSize: 24
    },
    chatBox: {
        width: 300,
        maxHeight: 400,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 10,
        overflow: 'hidden'
    },
    header: { backgroundColor: '#4dabf7', color: '#fff', padding: 10, fontWeight: 'bold' },
    messages: { flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' },
    message: { padding: 8, borderRadius: 8, maxWidth: '80%' },
    inputArea: { display: 'flex', borderTop: '1px solid #ccc' },
    input: { flex: 1, padding: 8, border: 'none', outline: 'none' },
    sendBtn: { padding: '0 10px', border: 'none', backgroundColor: '#4dabf7', color: '#fff', cursor: 'pointer' }
};

export default ChatBot;