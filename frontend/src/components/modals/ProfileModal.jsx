// src/components/ProfileModal.jsx
import React, { useState } from 'react';

const ProfileModal = ({ user, onClose, onUpdateProfile, onLogout }) => {
    const [name, setName] = useState(user.nom || '');
    const [email, setEmail] = useState(user.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        if (password && password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        const updatedUser = { ...user, nom: name, email, ...(password ? { password } : {}) };
        onUpdateProfile(updatedUser);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2>👤 Mon Profil</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                <div style={styles.form}>
                    <label>Nom:</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />

                    <label>Email:</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

                    <label>Nouveau mot de passe:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

                    <label>Confirmer mot de passe:</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

                    <div style={styles.actions}>
                        <button onClick={handleSubmit} style={styles.saveBtn}>💾 Enregistrer</button>
                        <button onClick={onLogout} style={styles.logoutBtn}>🚪 Déconnexion</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    },
    modal: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 400 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeBtn: { border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    actions: { display: 'flex', justifyContent: 'space-between', marginTop: 10 },
    saveBtn: { padding: '6px 12px', backgroundColor: '#4dabf7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
    logoutBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};

export default ProfileModal;