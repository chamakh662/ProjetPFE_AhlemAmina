const Analyse = require('../models/analyse.model');


// CREATE analyse
exports.createAnalyse = async (req, res) => {
    try {

        const analyse = new Analyse({
            id_analyse: req.body.id_analyse,
            produit: req.body.produit
        });

        const savedAnalyse = await analyse.save();

        res.status(201).json(savedAnalyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET ALL analyses
exports.getAllAnalyses = async (req, res) => {
    try {

        const analyses = await Analyse.find()
        .populate('produit');

        res.status(200).json(analyses);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET analyse by ID
exports.getAnalyseById = async (req, res) => {
    try {

        const analyse = await Analyse.findById(req.params.id)
        .populate('produit');

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json(analyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE analyse
exports.updateAnalyse = async (req, res) => {
    try {

        const analyse = await Analyse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json(analyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// DELETE analyse
exports.deleteAnalyse = async (req, res) => {
    try {

        const analyse = await Analyse.findByIdAndDelete(req.params.id);

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json({
            message: "Analyse supprimée avec succès"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
