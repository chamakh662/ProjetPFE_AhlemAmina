import React, { useState, useEffect } from 'react';

const ProfileTab = ({ user, updateUser }) => {
    const [profileForm, setProfileForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        adresse: ''
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

    return (
        <div>
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
        </div>
    );
};

const styles = {
    form: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px' },
    formGroup: { marginBottom: '20px' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '5px' },
    submitButton: { backgroundColor: '#FF9800', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default ProfileTab;