const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/produits',require('./routes/produit.routes'));
app.use('/api/ingredients',require('./routes/ingredient.routes'));
app.use('/api/pointDeVente',require('./routes/pointDeVente.routes'));
app.use('/api/analyses', require('./routes/analyse.routes'));
app.use('/api/commentaires', require('./routes/commentaire.routes'));
app.use('/api/historiques', require('./routes/historique.routes'));
app.use('/api/favoris', require('./routes/favoris.routes'));
;

// Middleware global d'erreurs (optionnel)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

module.exports = app;