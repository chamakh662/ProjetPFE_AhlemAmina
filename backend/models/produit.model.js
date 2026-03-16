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