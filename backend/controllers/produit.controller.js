const Produit = require('../models/produit.model');


// Ajouter produit
exports.createProduit = async (req, res) => {
    try {

        const produit = new Produit(req.body);
        const savedProduit = await produit.save();

        res.status(201).json(savedProduit);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }
};


// Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
    try {

        const produits = await Produit.find()
        .populate('ingredients')
        .populate('pointsDeVente');

        res.status(200).json(produits);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }
};


// Récupérer produit par ID
exports.getProduitById = async (req, res) => {
    try {

        const produit = await Produit.findById(req.params.id)
        .populate('ingredients')
        .populate('pointsDeVente');

        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        res.status(200).json(produit);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Modifier produit
exports.updateProduit = async (req, res) => {
    try {

        const produit = await Produit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        res.status(200).json(produit);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }
};


// Supprimer produit
exports.deleteProduit = async (req, res) => {
    try {

        const produit = await Produit.findByIdAndDelete(req.params.id);

        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        res.status(200).json({ message: "Produit supprimé" });

    } catch (error) {

        res.status(500).json({ message: error.message });

    }
};