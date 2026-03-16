const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
    // 🔹 Bypass en mode développement si activé dans .env
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
        req.user = {
            _id: '000000000000000000000000',
            nom: 'dev',
            prenom: 'bypass',
            email: 'dev-bypass@example.com',
            role: 'admin'
        };
        console.warn('⚠️ Authentification désactivée (mode développement)');
        return next();
    }

    // 🔹 Récupérer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔹 Récupérer l’utilisateur et enlever mot_de_passe
        req.user = await User.findById(decoded.id).select('-mot_de_passe');
        console.log("user auth",req.user)

        if (!req.user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = protect;