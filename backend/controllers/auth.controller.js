const User = require('../models/user.model.js');
const generateToken = require('../utils/generateToken');

// 👉 REGISTER
exports.register = async (req, res) => {
    try {
        console.log(req.body)
        const { nom, prenom, email, password, role } = req.body;
        console.log("test 2",email)
        // Vérifier email déjà utilisé
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // Créer utilisateur
        const user = await User.create({
            nom,
            prenom,
            email,
            password,
            role
        });
 console.log("test 3",user);
        // Générer token
        const token = generateToken(user);
      
        res.status(201).json({
            message: "Inscription réussie",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role 
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



// 👉 LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email  incorrect" });
        }

        // Vérifier mot de passe
        const isMatch = await user.password == password;
        console.log(user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "mot de passe incorrect" });
        }

        // Générer token
        const token = generateToken(user);

        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// 🟢 Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-mot_de_passe');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Mettre à jour le profil
exports.updateProfile = async (req, res) => {
    try {
        const { nom, prenom } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { nom, prenom },
            { new: true, runValidators: true }
        ).select('-mot_de_passe');
        
        res.json({ message: 'Profil mis à jour', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};