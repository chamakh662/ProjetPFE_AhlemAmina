const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ['consommateur', 'agent_saisie', 'fournisseur', 'admin'],
        default: 'consommateur'
    },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Middleware pour hasher le mot de passe
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password= await bcrypt.hash(this.password, 10);
    
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);