import React from 'react';

const AddPointForm = ({ newPoint, setNewPoint, handleAddPoint, loading }) => {
    return (
        <div style={styles.inlineBox}>
            <input
                type="text"
                placeholder="Nom"
                value={newPoint.nom}
                onChange={(e) => setNewPoint({ ...newPoint, nom: e.target.value })}
                style={styles.input}
            />

            <input
                type="text"
                placeholder="Adresse"
                value={newPoint.adresse}
                onChange={(e) => setNewPoint({ ...newPoint, adresse: e.target.value })}
                style={styles.input}
            />

            <button onClick={handleAddPoint} style={styles.button} disabled={loading}>
                + Ajouter
            </button>
        </div>
    );
};

const styles = {
    inlineBox: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '10px'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px'
    },
    button: {
        backgroundColor: '#1976D2',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '10px'
    }
};

export default AddPointForm;