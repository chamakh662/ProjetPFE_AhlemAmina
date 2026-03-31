import React, { useEffect, useState } from 'react';

const MESSAGES_STORAGE_KEY = 'platform_messages';

const NotificationsTab = ({ user }) => {
    const [inboxMessages, setInboxMessages] = useState([]);
    const [sentMessages, setSentMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [replyingTo, setReplyingTo] = useState(null);

    const [messageForm, setMessageForm] = useState({
        toRole: 'fournisseur',
        subject: '',
        content: ''
    });

    const loadMessages = () => {
        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');

        // Messages reçus par l'agent
        const inbox = allMessages
            .filter((m) => m.toRole === 'agent')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInboxMessages(inbox);

        // Messages envoyés par l'agent
        const sent = allMessages
            .filter((m) => m.fromRole === 'agent')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSentMessages(sent);
    };

    useEffect(() => {
        loadMessages();
    }, [user?.id]);

    // Envoyer un nouveau message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageForm.subject.trim() || !messageForm.content.trim()) {
            alert('Veuillez remplir le sujet et le message.');
            return;
        }

        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
        const newMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fromId: user?.id || 'agent',
            fromRole: 'agent',
            fromName: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Agent' : 'Agent',
            toRole: messageForm.toRole,
            toId: null,
            subject: messageForm.subject.trim(),
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: null
        };

        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([newMessage, ...allMessages]));
        loadMessages();
        setMessageForm({ toRole: 'fournisseur', subject: '', content: '' });
        alert('Message envoyé avec succès.');
        setActiveTab('sent');
    };

    // Répondre à un message reçu
    const handleReply = (e) => {
        e.preventDefault();
        if (!replyingTo || !messageForm.content.trim()) {
            alert('Veuillez écrire un message.');
            return;
        }

        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');

        // Marquer l'original comme lu
        const updated = allMessages.map((m) =>
            m.id === replyingTo.id ? { ...m, read: true } : m
        );

        const replyMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fromId: user?.id || 'agent',
            fromRole: 'agent',
            fromName: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Agent' : 'Agent',
            toId: replyingTo.fromId || null,
            toRole: replyingTo.fromRole,
            subject: `Re: ${replyingTo.subject}`,
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: replyingTo.id
        };

        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([replyMessage, ...updated]));
        loadMessages();
        setReplyingTo(null);
        setMessageForm({ toRole: 'fournisseur', subject: '', content: '' });
        alert('Réponse envoyée avec succès.');
        setActiveTab('sent');
    };

    const startReply = (message) => {
        setReplyingTo(message);
        setMessageForm({ toRole: message.fromRole, subject: '', content: '' });
        setActiveTab('compose');
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setMessageForm({ toRole: 'fournisseur', subject: '', content: '' });
    };

    const unreadCount = inboxMessages.filter((m) => !m.read).length;

    return (
        <div style={styles.wrapper}>
            <h2 style={styles.pageTitle}>📨 Messagerie Agent</h2>

            {/* Tabs */}
            <div style={styles.tabBar}>
                {[
                    { key: 'compose', label: replyingTo ? '↩ Répondre' : '✏️ Nouveau message' },
                    { key: 'sent', label: `📤 Envoyés (${sentMessages.length})` },
                    { key: 'received', label: `📥 Reçus` },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        style={{ ...styles.tabBtn, ...(activeTab === tab.key ? styles.tabBtnActive : {}) }}
                        onClick={() => {
                            if (tab.key !== 'compose') {
                                setReplyingTo(null);
                                setMessageForm({ toRole: 'fournisseur', subject: '', content: '' });
                            }
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

            {/* ── Compose / Reply Tab ── */}
            {activeTab === 'compose' && (
                <div style={styles.card}>
                    {replyingTo && (
                        <div style={styles.replyBanner}>
                            <div>
                                <span style={styles.replyLabel}>↩ Réponse à :</span>
                                <strong> {replyingTo.subject}</strong>
                                <span style={styles.replyMeta}>
                                    {' '}— De {replyingTo.fromName || replyingTo.fromRole} •{' '}
                                    {new Date(replyingTo.createdAt).toLocaleString('fr-FR')}
                                </span>
                            </div>
                            <button style={styles.cancelBtn} onClick={cancelReply}>✕ Annuler</button>
                        </div>
                    )}

                    <form onSubmit={replyingTo ? handleReply : handleSendMessage}>
                        {/* Destinataire — masqué en mode réponse */}
                        {!replyingTo && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destinataire *</label>
                                <select
                                    value={messageForm.toRole}
                                    onChange={(e) => setMessageForm({ ...messageForm, toRole: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="fournisseur">Fournisseur</option>
                                    <option value="administrateur">Administrateur</option>
                                </select>
                            </div>
                        )}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Sujet *</label>
                            <input
                                type="text"
                                value={replyingTo ? `Re: ${replyingTo.subject}` : messageForm.subject}
                                onChange={(e) => !replyingTo && setMessageForm({ ...messageForm, subject: e.target.value })}
                                style={{ ...styles.input, ...(replyingTo ? styles.inputReadonly : {}) }}
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

            {/* ── Sent Tab ── */}
            {activeTab === 'sent' && (
                <div>
                    {sentMessages.length === 0 ? (
                        <div style={styles.emptyBox}><p>Aucun message envoyé.</p></div>
                    ) : (
                        <div style={styles.messagesList}>
                            {sentMessages.map((m) => (
                                <div key={m.id} style={styles.messageCard}>
                                    <div style={styles.messageHeader}>
                                        <div>
                                            <strong style={styles.subject}>{m.subject}</strong>
                                            {m.replyToId && <span style={styles.replyBadge}>↩ Réponse</span>}
                                        </div>
                                        <span style={styles.messageMeta}>{new Date(m.createdAt).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <p style={styles.messageText}>{m.content}</p>
                                    <small style={styles.messageMeta}>
                                        À : {m.toRole === 'fournisseur' ? 'Fournisseur' : m.toRole === 'administrateur' ? 'Administrateur' : m.toRole}
                                    </small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Received Tab ── */}
            {activeTab === 'received' && (
                <div>
                    {inboxMessages.length === 0 ? (
                        <div style={styles.emptyBox}><p>Aucun message reçu pour le moment.</p></div>
                    ) : (
                        <div style={styles.messagesList}>
                            {inboxMessages.map((m) => (
                                <div key={m.id} style={{ ...styles.messageCard, ...(!m.read ? styles.messageCardUnread : {}) }}>
                                    <div style={styles.messageHeader}>
                                        <div>
                                            {!m.read && <span style={styles.unreadDot}>●</span>}
                                            <strong style={styles.subject}>{m.subject}</strong>
                                        </div>
                                        <span style={styles.messageMeta}>{new Date(m.createdAt).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <p style={styles.messageText}>{m.content}</p>
                                    <div style={styles.messageFooter}>
                                        <small style={styles.messageMeta}>
                                            De : <strong>{m.fromName || m.fromRole}</strong>
                                        </small>
                                        <button style={styles.replyBtn} onClick={() => startReply(m)}>
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

    tabBar: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    tabBtn: {
        padding: '9px 18px', border: '1px solid #d1d5db', borderRadius: '6px',
        backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '14px',
        fontWeight: '500', color: '#374151', position: 'relative'
    },
    tabBtnActive: { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' },
    badge: {
        position: 'absolute', top: '-6px', right: '-6px',
        backgroundColor: '#ef4444', color: 'white', borderRadius: '50%',
        width: '18px', height: '18px', fontSize: '11px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
    },

    card: { backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    emptyBox: { backgroundColor: 'white', padding: '30px 20px', borderRadius: '10px', textAlign: 'center', color: '#9ca3af' },
    messagesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    messageCard: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    messageCardUnread: { borderLeft: '4px solid #3b82f6', backgroundColor: '#f0f7ff' },
    messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' },
    subject: { fontSize: '15px', color: '#111827' },
    messageMeta: { color: '#6b7280', fontSize: '12px' },
    messageText: { marginTop: '4px', marginBottom: '10px', color: '#374151', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' },
    messageFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
    replyBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
    unreadDot: { color: '#3b82f6', marginRight: '6px', fontSize: '10px' },
    replyBadge: { marginLeft: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' },

    replyBanner: {
        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px',
        padding: '10px 14px', marginBottom: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
    },
    replyLabel: { color: '#2563eb', fontWeight: '600', fontSize: '13px' },
    replyMeta: { color: '#6b7280', fontSize: '12px' },

    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    inputReadonly: { backgroundColor: '#f9fafb', color: '#6b7280' },
    textarea: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '120px', boxSizing: 'border-box', resize: 'vertical' },
    formActions: { display: 'flex', gap: '10px', alignItems: 'center' },
    submitButton: { backgroundColor: '#3b82f6', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
    cancelBtn: { backgroundColor: 'transparent', color: '#6b7280', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};

export default NotificationsTab;
