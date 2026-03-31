import React from 'react';

const OverviewTab = () => (
    <div>
        <h2>Tableau de bord Agent</h2>
        <div style={styles.infoBox}>
            <p>Bienvenue dans votre espace agent.</p>
        </div>
    </div>
);

const styles = { infoBox: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' } };

export default OverviewTab;