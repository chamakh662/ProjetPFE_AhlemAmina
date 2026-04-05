const express = require('express');
const cors = require('cors');
const app = express();

// JSON parser
// Autorise des payloads plus volumineux (image base64 envoyée depuis le frontend)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⚡ CORS correctement configuré pour dev
app.use(
    cors({
        origin: 'http://localhost:3000', // l’URL exacte de ton frontend
        credentials: true,               // indispensable si tu utilises fetch avec cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);


// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/produits', require('./routes/produit.routes'));
app.use('/api/ingredients', require('./routes/ingredient.routes'));
app.use('/api/pointDeVente', require('./routes/pointDeVente.routes'));
app.use('/api/analyses', require('./routes/analyse.routes'));
app.use('/api/commentaires', require('./routes/commentaire.routes'));
app.use('/api/historiques', require('./routes/historique.routes'));
app.use('/api/favoris', require('./routes/favoris.routes'));
app.use('/api/notifications', require('./routes/notification.routes')); 

// Middleware global d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

module.exports = app;