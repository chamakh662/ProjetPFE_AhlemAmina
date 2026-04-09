import React, { useState, useEffect } from 'react';
import './Messagerie.css';

const MESSAGES_STORAGE_KEY = 'platform_messages';

const Messagerie = ({ user, role }) => {
    // ─── Config selon le rôle ───────────────────────────────────────────────
    const config = {
        agent: {
            fromRole: 'agent',
            defaultToRole: 'fournisseur',
            destinataireOptions: [
                { value: 'fournisseur', label: 'Fournisseur' },
                { value: 'administrateur', label: 'Administrateur' },
            ],
            accentColor: '#10b981',
            unreadColor: '#3b82f6',
            unreadBg: '#f0f7ff',
            replyBannerBg: '#eff6ff',
            replyBannerBorder: '#bfdbfe',
            replyLabelColor: '#2563eb',
            pageTitle: 'Messagerie Agent',
            filterReceived: (m) => m.toRole === 'agent',
            filterSent: (m) => m.fromRole === 'agent',
        },
        fournisseur: {
            fromRole: 'fournisseur',
            defaultToRole: 'administrateur',
            destinataireOptions: [
                { value: 'administrateur', label: 'Administrateur' },
                { value: 'agent', label: 'Agent' },
            ],
            accentColor: '#10b981',
            unreadColor: '#3b82f6',
            unreadBg: '#f0f7ff',
            replyBannerBg: '#eff6ff',
            replyBannerBorder: '#bfdbfe',
            replyLabelColor: '#2563eb',
            pageTitle: 'Messagerie',
            filterReceived: (m, userId) =>
                m.toRole === 'fournisseur' &&
                (m.fromRole === 'administrateur' || m.fromRole === 'agent'),
            filterSent: (m, userId) =>
                m.fromId === userId && m.fromRole === 'fournisseur',
        },
        administrateur: {
            fromRole: 'administrateur',
            defaultToRole: 'agent',
            destinataireOptions: [
                { value: 'agent', label: 'Agent' },
                { value: 'fournisseur', label: 'Fournisseur' },
            ],
            accentColor: '#10b981',
            unreadColor: '#10b981',
            unreadBg: '#ecfdf5',
            replyBannerBg: '#d1fae5',
            replyBannerBorder: '#34d399',
            replyLabelColor: '#065f46',
            pageTitle: 'Messagerie Admin',
            filterReceived: (m, userId) =>
                m.toRole === 'administrateur' &&
                (m.fromRole === 'agent' || m.fromRole === 'fournisseur'),
            filterSent: (m, userId) =>
                m.fromId === userId && m.fromRole === 'administrateur',
        }
    };

    const cfg = config[role];

    // ─── State ──────────────────────────────────────────────────────────────
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('compose');
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageForm, setMessageForm] = useState({
        toRole: cfg.defaultToRole,
        subject: '',
        content: '',
    });

    // ─── Load messages ───────────────────────────────────────────────────────
    const loadMessages = () => {
        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
        const sent = allMessages
            .filter((m) => cfg.filterSent(m, user?.id))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSentMessages(sent);

        const received = allMessages
            .filter((m) => cfg.filterReceived(m, user?.id))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReceivedMessages(received);
    };

    useEffect(() => {
        loadMessages();
    }, [user?.id]);

    // ─── Envoyer un nouveau message ──────────────────────────────────────────
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageForm.subject.trim() || !messageForm.content.trim()) {
            alert('Veuillez remplir le sujet et le message.');
            return;
        }

        const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
        const newMessage = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fromId: user?.id || role,
            fromRole: cfg.fromRole,
            fromName: user
                ? `${user.prenom || ''} ${user.nom || ''}`.trim() || cfg.fromRole
                : cfg.fromRole,
            toRole: messageForm.toRole,
            toId: null,
            subject: messageForm.subject.trim(),
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: null,
        };

        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([newMessage, ...allMessages]));
        loadMessages();
        setMessageForm({ toRole: cfg.defaultToRole, subject: '', content: '' });
        alert('Message envoyé avec succès.');
        setActiveTab('sent');
    };

    // ─── Répondre à un message ───────────────────────────────────────────────
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
            fromId: user?.id || role,
            fromRole: cfg.fromRole,
            fromName: user
                ? `${user.prenom || ''} ${user.nom || ''}`.trim() || cfg.fromRole
                : cfg.fromRole,
            toId: replyingTo.fromId || null,
            toRole: replyingTo.fromRole,
            subject: `Re: ${replyingTo.subject.replace(/^Re:\s*/, '')}`,
            content: messageForm.content.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            replyToId: replyingTo.id,
        };

        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([replyMessage, ...updated]));
        loadMessages();
        setReplyingTo(null);
        setMessageForm({ toRole: cfg.defaultToRole, subject: '', content: '' });
        alert('Réponse envoyée avec succès.');
        setActiveTab('sent');
    };

    // ─── Démarrer une réponse ────────────────────────────────────────────────
    const startReply = (message) => {
        setReplyingTo(message);
        setMessageForm({ toRole: message.fromRole, subject: '', content: '' });
        setActiveTab('compose');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Marquer comme lu immédiatement si cliqué sur répondre
        if (!message.read) {
            const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
            const updated = allMessages.map((m) => m.id === message.id ? { ...m, read: true } : m);
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
            loadMessages();
        }
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setMessageForm({ toRole: cfg.defaultToRole, subject: '', content: '' });
    };

    const unreadCount = receivedMessages.filter((m) => !m.read).length;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="msg-wrapper" style={{
            '--accent': cfg.accentColor,
            '--unread': cfg.unreadColor,
            '--unread-bg': cfg.unreadBg,
            '--banner-bg': cfg.replyBannerBg,
            '--banner-border': cfg.replyBannerBorder,
            '--banner-color': cfg.replyLabelColor,
        }}>
            <div className="msg-header">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: cfg.accentColor}}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <h2 className="msg-title">{cfg.pageTitle}</h2>
            </div>

            {/* Tabs */}
            <div className="msg-tabs">
                <button
                    className={`msg-tab-btn ${activeTab === 'compose' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('compose');
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    {replyingTo ? 'Répondre' : 'Nouveau message'}
                </button>
                <button
                    className={`msg-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => {
                        setReplyingTo(null);
                        setMessageForm({ toRole: cfg.defaultToRole, subject: '', content: '' });
                        setActiveTab('sent');
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    Envoyés ({sentMessages.length})
                </button>
                <button
                    className={`msg-tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => {
                        setReplyingTo(null);
                        setMessageForm({ toRole: cfg.defaultToRole, subject: '', content: '' });
                        setActiveTab('received');
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Reçus
                    {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}
                </button>
            </div>

            {/* ── Compose / Reply ── */}
            {activeTab === 'compose' && (
                <div className="msg-card">
                    {replyingTo && (
                        <div className="msg-reply-banner">
                            <div>
                                <span className="msg-reply-title">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                    Réponse à : {replyingTo.subject}
                                </span>
                                <span className="msg-reply-meta">
                                    De {replyingTo.fromName || replyingTo.fromRole} • {new Date(replyingTo.createdAt).toLocaleString('fr-FR', {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', ' à')}
                                </span>
                            </div>
                            <button className="btn-cancel-msg" onClick={cancelReply}>✕ Annuler</button>
                        </div>
                    )}

                    <form onSubmit={replyingTo ? handleReply : handleSendMessage}>
                        {!replyingTo && (
                            <div className="msg-form-group">
                                <label className="msg-label">Destinataire <span style={{color: '#ef4444'}}>*</span></label>
                                <select
                                    value={messageForm.toRole}
                                    onChange={(e) => setMessageForm({ ...messageForm, toRole: e.target.value })}
                                    className="msg-select"
                                >
                                    {cfg.destinataireOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="msg-form-group">
                            <label className="msg-label">Sujet <span style={{color: '#ef4444'}}>*</span></label>
                            <input
                                type="text"
                                value={replyingTo ? `Re: ${replyingTo.subject.replace(/^Re:\s*/, '')}` : messageForm.subject}
                                onChange={(e) => !replyingTo && setMessageForm({ ...messageForm, subject: e.target.value })}
                                className={`msg-input ${replyingTo ? 'readonly' : ''}`}
                                readOnly={!!replyingTo}
                                placeholder="Titre de votre message"
                                required
                            />
                        </div>

                        <div className="msg-form-group">
                            <label className="msg-label">Message <span style={{color: '#ef4444'}}>*</span></label>
                            <textarea
                                value={messageForm.content}
                                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                                className="msg-textarea"
                                placeholder={replyingTo ? 'Saisissez votre réponse...' : 'Saisissez votre message...'}
                                required
                            />
                        </div>

                        <div className="msg-form-actions">
                            {replyingTo && (
                                <button type="button" className="btn-cancel-msg" onClick={cancelReply}>
                                    Annuler
                                </button>
                            )}
                            <button type="submit" className="btn-primary-msg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                {replyingTo ? 'Envoyer la réponse' : 'Envoyer le message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Envoyés ── */}
            {activeTab === 'sent' && (
                <div>
                    {sentMessages.length === 0 ? (
                        <div className="msg-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: '1rem'}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                            <p style={{margin: 0}}>Aucun message envoyé pour le moment.</p>
                        </div>
                    ) : (
                        <div className="msg-list">
                            {sentMessages.map((m) => (
                                <div key={m.id} className="msg-item">
                                    <div className="msg-item-header">
                                        <div className="msg-subject-wrap">
                                            <span className="msg-subject">{m.subject || '—'}</span>
                                            {m.replyToId && (
                                                <span className="msg-reply-badge">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                                    Réponse
                                                </span>
                                            )}
                                        </div>
                                        <span className="msg-time">
                                            {new Date(m.createdAt).toLocaleString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', ' à')}
                                        </span>
                                    </div>
                                    <p className="msg-body">{m.content || '—'}</p>
                                    <div className="msg-footer">
                                        <span className="msg-sender">
                                            À : <strong>{cfg.destinataireOptions.find(o => o.value === m.toRole)?.label || m.toRole}</strong>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Reçus ── */}
            {activeTab === 'received' && (
                <div>
                    {receivedMessages.length === 0 ? (
                        <div className="msg-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: '1rem'}}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                            <p style={{margin: 0}}>Votre boîte de réception est vide.</p>
                        </div>
                    ) : (
                        <div className="msg-list">
                            {receivedMessages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`msg-item ${!m.read ? 'unread' : ''}`}
                                >
                                    <div className="msg-item-header">
                                        <div className="msg-subject-wrap">
                                            {!m.read && <span className="msg-dot">●</span>}
                                            <span className="msg-subject">{m.subject || '—'}</span>
                                        </div>
                                        <span className="msg-time">
                                            {new Date(m.createdAt).toLocaleString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', ' à')}
                                        </span>
                                    </div>
                                    <p className="msg-body">{m.content || '—'}</p>
                                    <div className="msg-footer">
                                        <span className="msg-sender">
                                            De : <strong>{m.fromName || m.fromRole}</strong>
                                        </span>
                                        <button className="btn-reply-msg" onClick={() => startReply(m)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                                            Répondre
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

export default Messagerie;