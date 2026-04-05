import React, { useState, useEffect } from 'react';

const EyeIcon = ({ open }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9e9e9e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {open ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

const ProfileTab = ({ user, updateUser }) => {
    const [profileForm, setProfileForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        adresse: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (!user) return;
        setProfileForm({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            adresse: user.adresse || ''
        });
    }, [user]);

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        updateUser(profileForm);
        alert('Profil mis à jour avec succès !');
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${user._id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(data.message || 'Erreur lors de la mise à jour.');
                return;
            }

            setPasswordSuccess('Mot de passe mis à jour avec succès !');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError('Erreur réseau. Veuillez réessayer.');
        }
    };

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div>
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear,
                input[type="password"]::-webkit-credentials-auto-fill-button,
                input[type="password"]::-webkit-textfield-decoration-container {
                    display: none !important;
                    visibility: hidden;
                    pointer-events: none;
                }
            `}</style>
            <h2>👤 Mon Profil</h2>
            <form onSubmit={handleProfileUpdate} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Prénom</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={profileForm.prenom}
                        onChange={(e) => setProfileForm({ ...profileForm, prenom: e.target.value })}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Nom</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={profileForm.nom}
                        onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        style={styles.input}
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                    />
                </div>
                {user?.role === 'agent' && (
                    <div style={styles.formGroup}>
                        <label>Adresse</label>
                        <input
                            type="text"
                            style={styles.input}
                            value={profileForm.adresse}
                            onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })}
                        />
                    </div>
                )}
                <button type="submit" style={styles.submitButton}>💾 Enregistrer</button>
            </form>

            {/* Section mot de passe — visible uniquement pour les agents */}
            {user?.role === 'agent' && (
                <div style={styles.passwordSection}>
                    <h3 style={styles.passwordTitle}>🔒 Modifier le mot de passe</h3>
                    <form onSubmit={handlePasswordUpdate} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label>Mot de passe actuel</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    style={styles.inputWithIcon}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    style={styles.eyeButton}
                                    onClick={() => toggleShow('current')}
                                    title={showPasswords.current ? 'Masquer' : 'Afficher'}
                                >
                                    <EyeIcon open={showPasswords.current} />
                                </button>
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Nouveau mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    style={styles.inputWithIcon}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    style={styles.eyeButton}
                                    onClick={() => toggleShow('new')}
                                    title={showPasswords.new ? 'Masquer' : 'Afficher'}
                                >
                                    <EyeIcon open={showPasswords.new} />
                                </button>
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label>Confirmer le nouveau mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    style={styles.inputWithIcon}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    style={styles.eyeButton}
                                    onClick={() => toggleShow('confirm')}
                                    title={showPasswords.confirm ? 'Masquer' : 'Afficher'}
                                >
                                    <EyeIcon open={showPasswords.confirm} />
                                </button>
                            </div>
                        </div>

                        {passwordError && <p style={styles.errorMessage}>⚠️ {passwordError}</p>}
                        {passwordSuccess && <p style={styles.successMessage}>✅ {passwordSuccess}</p>}

                        <button type="submit" style={styles.submitButton}>🔑 Changer le mot de passe</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const styles = {
    form: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px' },
    formGroup: { marginBottom: '20px' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '5px', boxSizing: 'border-box' },
    inputWrapper: { position: 'relative', marginTop: '5px' },
    inputWithIcon: { width: '100%', padding: '12px 44px 12px 12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', WebkitAppearance: 'none', MozAppearance: 'none' },
    eyeButton: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: '0.7', transition: 'opacity 0.2s' },
    submitButton: { backgroundColor: '#FF9800', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    passwordSection: { marginTop: '30px' },
    passwordTitle: { marginBottom: '10px', color: '#333' },
    errorMessage: { color: '#e53935', marginBottom: '12px', fontWeight: '500' },
    successMessage: { color: '#43a047', marginBottom: '12px', fontWeight: '500' }
};

export default ProfileTab;
