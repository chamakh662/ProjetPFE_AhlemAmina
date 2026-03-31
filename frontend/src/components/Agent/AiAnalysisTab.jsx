import React from 'react';

const AiAnalysisTab = () => (
    <div>
        <h2>Suivi de l'analyse IA</h2>
        <div style={styles.analysisBox}>
            <h3>Analyse des produits</h3>
            <p>Produits analysés: 150</p>
            <p>Dernière analyse: 05/03/2026</p>
        </div>
    </div>
);

const styles = {
    analysisBox: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }
};

export default AiAnalysisTab;