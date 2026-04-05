const Produit = require('../models/produit.model');
const Ingredient = require('../models/ingredient.model');
const Notification = require('../models/notification.model');
const { emitNotification } = require('../socket'); // ← NOUVEAU

// ─── Helper : crée la notif en DB ET l'envoie en temps réel ──────────────────
const sendNotification = async ({ recipientId, message, productName, agentName }) => {
    try {
        if (!recipientId) return;

        // 1. Persister en MongoDB (déjà existant)
        const notif = await Notification.create({
            recipientId,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false
        });

        // 2. Émettre en temps réel via Socket.io (NOUVEAU)
        emitNotification(String(recipientId), {
            _id: notif._id,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false,
            createdAt: notif.createdAt,
        });

    } catch (err) {
        console.error('Erreur création notification:', err.message);
    }
};

// ─── (Helpers inchangés) ──────────────────────────────────────────────────────
const normalizeCodeBarre = (payload) => {
    const code = String(payload?.code_barre || payload?.codeBarres || '').trim();
    return code;
};

const normalizeIngredientNames = (names) => {
    if (!names) return [];
    if (Array.isArray(names)) {
        return names.map((x) => String(x || '').trim()).filter(Boolean);
    }
    return String(names).split(',').map((x) => x.trim()).filter(Boolean);
};

const resolveIngredientIds = async (ingredientNames) => {
    const names = normalizeIngredientNames(ingredientNames);
    if (names.length === 0) return [];
    const docs = [];
    for (const nom of names) {
        let ing = await Ingredient.findOne({ nom });
        if (!ing) ing = await Ingredient.create({ nom });
        docs.push(ing);
    }
    return docs.map((d) => d._id);
};

const normalizeLocalisation = (body) => {
    const loc = body.localisation || {};
    return {
        adresse: String(loc.adresse || '').trim(),
        lat: loc.lat !== undefined && loc.lat !== '' ? Number(loc.lat) : null,
        lng: loc.lng !== undefined && loc.lng !== '' ? Number(loc.lng) : null
    };
};

// ─── Ajouter produit (par agent directement) ─────────────────────────────────
exports.createProduit = async (req, res) => {
    try {
        const ingredientIds = await resolveIngredientIds(req.body.ingredients);
        const codeBarre = normalizeCodeBarre(req.body);

        const produit = new Produit({
            ...req.body,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            ingredients: ingredientIds,
            localisation: normalizeLocalisation(req.body)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Fournisseur: soumettre un produit en attente ────────────────────────────
exports.createPendingProduit = async (req, res) => {
    try {
        const ingredientIds = await resolveIngredientIds(req.body.ingredients);
        const codeBarre = normalizeCodeBarre(req.body);

        const produit = new Produit({
            nom: req.body.nom,
            description: req.body.description,
            image: req.body.image,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            origine: req.body.origine,
            ingredients: ingredientIds,
            pointsDeVente: Array.isArray(req.body.pointsDeVente) ? req.body.pointsDeVente : [],
            createdBy: req.body.createdBy,
            status: 'pending',
            localisation: normalizeLocalisation(req.body)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer tous les produits ─────────────────────────────────────────────
exports.getAllProduits = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.createdBy) filter.createdBy = req.query.createdBy;

        // Ne pas charger `image` en liste : certains docs ont des base64 énormes (>200ko) et
        // bloquent la réponse HTTP/curl pendant des dizaines de secondes via Atlas.
        const produits = await Produit.find(filter)
            .select('-image')
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .lean()
            .maxTimeMS(8000);

        res.status(200).json(produits);
    } catch (error) {
        console.error('getAllProduits error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingProduits = async (req, res) => {
    try {
        const produits = await Produit.find({ status: 'pending' })
            .select('-image')
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .lean()
            .maxTimeMS(8000)
            .sort({ createdAt: -1 });

        res.status(200).json(produits);
    } catch (error) {
        console.error('getPendingProduits error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
// ─── Récupérer produit par ID ─────────────────────────────────────────────────
exports.getProduitById = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom email')
            .populate('validatedBy', 'nom email');

        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Modifier produit ─────────────────────────────────────────────────────────
exports.updateProduit = async (req, res) => {
    try {
        const ingredientIds = await resolveIngredientIds(req.body.ingredients);
        const codeBarre = normalizeCodeBarre(req.body);

        const updatePayload = {
            ...req.body,
            ...(codeBarre ? { code_barre: codeBarre, codeBarres: codeBarre } : {}),
            ...(ingredientIds.length ? { ingredients: ingredientIds } : {}),
            ...(req.body.localisation ? { localisation: normalizeLocalisation(req.body) } : {})
        };

        const produit = await Produit.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        const populated = await Produit.findById(produit._id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom email')
            .populate('validatedBy', 'nom email');

        const createdById = populated.createdBy?._id || populated.createdBy;
        const agentId = req.body.modifiedBy || req.body.validatedBy;
        if (createdById && String(createdById) !== String(agentId)) {
            await sendNotification({
                recipientId: createdById,
                productName: populated.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `✏️ Votre produit "${populated.nom}" a été modifié par l'agent.`
            });
        }

        res.status(200).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Approuver un produit ─────────────────────────────────────────────────────
exports.approveProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        produit.status = 'approved';
        produit.validatedBy = req.body.validatedBy || null;
        produit.validatedAt = new Date();
        await produit.save();

        const populated = await Produit.findById(produit._id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom email')
            .populate('validatedBy', 'nom email');

        const createdById = populated.createdBy?._id || populated.createdBy;
        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: populated.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `✅ Votre produit "${populated.nom}" a été accepté et publié.`
            });
        }

        res.status(200).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Rejeter un produit ───────────────────────────────────────────────────────
exports.rejectProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        produit.status = 'rejected';
        produit.validatedBy = req.body.validatedBy || null;
        produit.validatedAt = new Date();
        await produit.save();

        const createdById = produit.createdBy?._id || produit.createdBy;
        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: produit.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `❌ Votre produit "${produit.nom}" a été refusé par l'agent.`
            });
        }

        res.status(200).json({ message: 'Produit rejeté', produit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Supprimer produit ────────────────────────────────────────────────────────
exports.deleteProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        const createdById = produit.createdBy?._id || produit.createdBy;
        const nomProduit = produit.nom;

        await Produit.findByIdAndDelete(req.params.id);

        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: nomProduit,
                agentName: req.body.agentName || 'Un agent',
                message: `🗑️ Votre produit "${nomProduit}" a été supprimé par l'agent.`
            });
        }

        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
