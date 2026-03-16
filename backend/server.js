require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 3000;

// Connexion à MongoDB via db.js, puis démarrage du serveur
connectDB().then(() => {
    console.log('✅ Connecté à MongoDB');
    app.listen(port, () => console.log(`✅ Serveur démarré sur http://localhost:${port}`));
})
.catch(err => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
});