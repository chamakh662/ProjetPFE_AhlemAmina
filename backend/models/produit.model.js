const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    code_barre: {
        type: String,
        unique: true,
        sparse: true
    },
    // Compatibilité avec ancien schéma/index Mongo (codeBarres_1)
    codeBarres: {
        type: String,
        unique: true,
        sparse: true
    },
    origine: {
        type: String
    },
    scoreBio: {
        type: Number,
        default: 0
    },
    risque: {
        type: String
    },

    // 🔴 Workflow de validation (fournisseur -> admin)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validatedAt: {
        type: Date
    },

    ingredients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient'
    }],

    pointsDeVente: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointDeVente'
    }]

}, { timestamps: true });

module.exports = mongoose.model('Produit', produitSchema);