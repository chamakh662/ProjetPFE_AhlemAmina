const Commentaire = require('../models/commentaire.model');


// Ajouter commentaire
exports.createCommentaire = async (req, res) => {
    try {

        const commentaire = new Commentaire({
            id_comnt: req.body.id_comnt,
            contenu: req.body.contenu,
            utilisateur: req.body.utilisateur,
            produit: req.body.produit
        });

        const saved = await commentaire.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Tous les commentaires
exports.getAllCommentaires = async (req, res) => {
    try {

        const commentaires = await Commentaire.find()
        .populate('utilisateur')
        .populate('produit');

        res.json(commentaires);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// commentaire par id
exports.getCommentaireById = async (req, res) => {
    try {

        const commentaire = await Commentaire.findById(req.params.id)
        .populate('utilisateur')
        .populate('produit');

        if (!commentaire) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
        }

        res.json(commentaire);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// supprimer commentaire
exports.deleteCommentaire = async (req, res) => {
    try {

        await Commentaire.findByIdAndDelete(req.params.id);

        res.json({ message: "Commentaire supprimé" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
