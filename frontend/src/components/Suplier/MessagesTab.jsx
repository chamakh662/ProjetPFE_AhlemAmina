import React, { useState, useEffect } from 'react';

const MESSAGES_STORAGE_KEY = 'platform_messages';

const MessagesTab = ({ user }) => {
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'sent' | 'received'
    const [replyingTo, setReplyingTo] = useState(null); // message being replied to
    const [messageForm, setMessageForm] = useState({
        toRole: 'administrateur',
        subject: '',
        content: ''
    });

    const loadMessages = () => {
        if (!user?.id) return;
        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');

        // Messages envoyés par ce fournisseur
        const sent = allMessages
            .filter((m) => m.fromId === user.id && m.fromRole === 'fournisseur')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSentMessages(sent);

        // Messages reçus par ce fournisseur (envoyés par admin ou agent à ce fournisseur)
        const received = allMessages
            .filter(
                (m) =>
                    m.toId === user.id &&
                    m.toRole === 'fournisseur' &&
                    (m.fromRole === 'administrateur' || m.fromRole === 'agent')
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReceivedMessages(received);
    };

    useEffect(() => {
        loadMessages();
    }, [user?.id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!user?.id) return;
        if (!messageForm.subject.trim() || !messageForm.content.trim()) {
            alert('Veuillez remplir le sujet et le message.');
            return;
        }

        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
        const newMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fromId: user.id,
            fromRole: 'fournisseur',
            fromName: `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Fournisseur',
            toRole: messageForm.toRole,
            subject: messageForm.subject.trim(),
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: null
        };

        const updated = [newMessage, ...allMessages];
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
        loadMessages();
        setMessageForm({ ...messageForm, subject: '', content: '' });
        alert('Message envoyé avec succès.');
        setActiveTab('sent');
    };

    const handleReply = (e) => {
        e.preventDefault();
        if (!user?.id || !replyingTo) return;
        if (!messageForm.content.trim()) {
            alert('Veuillez remplir le message.');
            return;
        }

        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');

        // Mark original as read
        const updatedAll = allMessages.map((m) =>
            m.id === replyingTo.id ? { ...m, read: true } : m
        );

        const replyMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fromId: user.id,
            fromRole: 'fournisseur',
            fromName: `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Fournisseur',
            toRole: replyingTo.fromRole,
            toId: replyingTo.fromId || null,
            subject: `Re: ${replyingTo.subject}`,
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: replyingTo.id
        };

        const finalMessages = [replyMessage, ...updatedAll];
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(finalMessages));
        loadMessages();
        setReplyingTo(null);
        setMessageForm({ toRole: 'administrateur', subject: '', content: '' });
        alert('Réponse envoyée avec succès.');
        setActiveTab('sent');
    };

    const startReply = (message) => {
        setReplyingTo(message);
        setMessageForm({
            toRole: message.fromRole,
            subject: `Re: ${message.subject}`,
            content: ''
        });
        setActiveTab('compose');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setMessageForm({ toRole: 'administrateur', subject: '', content: '' });
    };

    const unreadCount = receivedMessages.filter((m) => !m.read).length;

    return (
        <div style={styles.wrapper}>
            <h2 style={styles.pageTitle}>📨 Messagerie</h2>

            {/* Tabs */}
            <div style={styles.tabBar}>
                {[
                    { key: 'compose', label: replyingTo ? '↩ Répondre' : '✏️ Nouveau message' },
                    { key: 'sent', label: `📤 Envoyés (${sentMessages.length})` },
                    { key: 'received', label: `📥 Reçus${unreadCount > 0 ? ` (${unreadCount} non lus)` : ''}` }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        style={{
                            ...styles.tabBtn,
                            ...(activeTab === tab.key ? styles.tabBtnActive : {})
                        }}
                        onClick={() => {
                            if (tab.key !== 'compose') setReplyingTo(null);
                            setActiveTab(tab.key);
                        }}
                    >
                        {tab.label}
                        {tab.key === 'received' && unreadCount > 0 && (
                            <span style={styles.badge}>{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Compose / Reply Tab */}
            {activeTab === 'compose' && (
                <div style={styles.card}>
                    {replyingTo && (
                        <div style={styles.replyBanner}>
                            <div>
                                <span style={styles.replyLabel}>↩ Réponse à :</span>
                                <strong> {replyingTo.subject}</strong>
                                <span style={styles.replyMeta}>
                                    {' '}— De {replyingTo.fromRole === 'administrateur' ? 'Administrateur' : 'Agent'} •{' '}
                                    {new Date(replyingTo.createdAt).toLocaleString('fr-FR')}
                                </span>
                            </div>
                            <button style={styles.cancelBtn} onClick={cancelReply}>✕ Annuler</button>
                        </div>
                    )}

                    <form onSubmit={replyingTo ? handleReply : handleSendMessage} style={styles.form}>
                        {!replyingTo && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destinataire *</label>
                                <select
                                    value={messageForm.toRole}
                                    onChange={(e) => setMessageForm({ ...messageForm, toRole: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="administrateur">Administrateur</option>
                                    <option value="agent">Agent</option>
                                </select>
                            </div>
                        )}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Sujet *</label>
                            <input
                                type="text"
                                value={messageForm.subject}
                                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                                style={styles.input}
                                readOnly={!!replyingTo}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Message *</label>
                            <textarea
                                value={messageForm.content}
                                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                                style={styles.textarea}
                                placeholder={replyingTo ? 'Écrivez votre réponse...' : 'Écrivez votre message...'}
                                required
                            />
                        </div>

                        <div style={styles.formActions}>
                            <button type="submit" style={styles.submitButton}>
                                {replyingTo ? '↩ Envoyer la réponse' : '📤 Envoyer'}
                            </button>
                            {replyingTo && (
                                <button type="button" style={styles.cancelBtn} onClick={cancelReply}>
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Sent Tab */}
            {activeTab === 'sent' && (
                <div>
                    {sentMessages.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <p>Aucun message envoyé.</p>
                        </div>
                    ) : (
                        <div style={styles.messagesList}>
                            {sentMessages.map((m) => (
                                <div key={m.id} style={styles.messageCard}>
                                    <div style={styles.messageHeader}>
                                        <div>
                                            <strong style={styles.subject}>{m.subject || '—'}</strong>
                                            {m.replyToId && <span style={styles.replyBadge}>↩ Réponse</span>}
                                        </div>
                                        <span style={styles.messageMeta}>
                                            À : {m.toRole === 'administrateur' ? 'Admin' : 'Agent'} •{' '}
                                            {new Date(m.createdAt).toLocaleString('fr-FR')}
                                        </span>
                                    </div>
                                    <p style={styles.messageText}>{m.content || '—'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Received Tab */}
            {activeTab === 'received' && (
                <div>
                    {receivedMessages.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <p>Aucun message reçu.</p>
                        </div>
                    ) : (
                        <div style={styles.messagesList}>
                            {receivedMessages.map((m) => (
                                <div
                                    key={m.id}
                                    style={{
                                        ...styles.messageCard,
                                        ...(!m.read ? styles.messageCardUnread : {})
                                    }}
                                >
                                    <div style={styles.messageHeader}>
                                        <div>
                                            {!m.read && <span style={styles.unreadDot}>●</span>}
                                            <strong style={styles.subject}>{m.subject || '—'}</strong>
                                        </div>
                                        <span style={styles.messageMeta}>
                                            De : {m.fromRole === 'administrateur' ? 'Admin' : 'Agent'}{' '}
                                            {m.fromName ? `(${m.fromName})` : ''} •{' '}
                                            {new Date(m.createdAt).toLocaleString('fr-FR')}
                                        </span>
                                    </div>
                                    <p style={styles.messageText}>{m.content || '—'}</p>
                                    <div style={styles.messageActions}>
                                        <button
                                            style={styles.replyBtn}
                                            onClick={() => startReply(m)}
                                        >
                                            ↩ Répondre
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: { padding: '10px 0', fontFamily: 'sans-serif' },
    pageTitle: { marginBottom: '16px', color: '#111827', fontSize: '22px' },

    // Tabs
    tabBar: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    tabBtn: {
        padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px',
        backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '14px',
        fontWeight: '500', color: '#374151', position: 'relative'
    },
    tabBtnActive: {
        backgroundColor: '#4CAF50', color: 'white', borderColor: '#4CAF50'
    },
    badge: {
        position: 'absolute', top: '-6px', right: '-6px',
        backgroundColor: '#ef4444', color: 'white', borderRadius: '50%',
        width: '18px', height: '18px', fontSize: '11px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },

    // Card / Form
    card: { backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    form: {},
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '120px', boxSizing: 'border-box', resize: 'vertical' },
    formActions: { display: 'flex', gap: '10px', alignItems: 'center' },
    submitButton: { backgroundColor: '#4CAF50', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
    cancelBtn: { backgroundColor: 'transparent', color: '#6b7280', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },

    // Reply banner
    replyBanner: {
        backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px',
        padding: '10px 14px', marginBottom: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
    },
    replyLabel: { color: '#16a34a', fontWeight: '600', fontSize: '13px' },
    replyMeta: { color: '#6b7280', fontSize: '12px' },

    // Messages list
    emptyBox: { backgroundColor: 'white', padding: '30px 20px', borderRadius: '10px', textAlign: 'center', color: '#9ca3af' },
    messagesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    messageCard: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s' },
    messageCardUnread: { borderLeft: '4px solid #4CAF50', backgroundColor: '#f9fffe' },
    messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' },
    subject: { fontSize: '15px', color: '#111827' },
    messageMeta: { color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' },
    messageText: { color: '#374151', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.5', margin: '0 0 10px 0' },
    messageActions: { display: 'flex', justifyContent: 'flex-end' },
    replyBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
    unreadDot: { color: '#4CAF50', marginRight: '6px', fontSize: '10px' },
    replyBadge: { marginLeft: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' }
};

export default MessagesTab;
