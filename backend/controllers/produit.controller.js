const fs = require('fs');
const path = require('path');
const Produit = require('../models/produit.model');
const Ingredient = require('../models/ingredient.model');
const Notification = require('../models/notification.model');
const { emitNotification } = require('../socket');

// ─── Helper : Sauvegarder l'image base64 ─────────────────────────────────────
const saveBase64Image = (base64String) => {
    // Vérifier si c'est du base64
    if (!base64String || !base64String.includes('base64,')) {
        return base64String; // Retourne tel quel si ce n'est pas du base64
    }

    // Extraire le type et les données
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        console.error('Format base64 invalide');
        return null;
    }

    const mimeType = matches[1];
    const data = matches[2];

    // Déterminer l'extension
    let extension = '.jpg';
    if (mimeType.includes('png')) extension = '.png';
    if (mimeType.includes('gif')) extension = '.gif';
    if (mimeType.includes('webp')) extension = '.webp';
    if (mimeType.includes('jpeg')) extension = '.jpg';

    // Chemin absolu basé sur le répertoire du projet
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Dossier uploads créé:', uploadDir);
    }

    // Générer un nom unique
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    try {
        // Sauvegarder le fichier
        fs.writeFileSync(filePath, data, 'base64');
        console.log('💾 Image sauvegardée:', filePath);
        // Retourner le chemin relatif
        return `/uploads/${fileName}`;
    } catch (err) {
        console.error('Erreur sauvegarde image:', err);
        return null;
    }
};

// ─── Helper : Traiter l'image avant sauvegarde ────────────────────────────────
const processImage = (produitData) => {
    if (produitData.image && produitData.image.includes('base64,')) {
        const imagePath = saveBase64Image(produitData.image);
        if (imagePath) {
            produitData.image = imagePath;
        }
    }
    return produitData;
};

// ─── Helper : crée la notif en DB ET l'envoie en temps réel ──────────────────
const sendNotification = async ({ recipientId, message, productName, agentName }) => {
    try {
        if (!recipientId) return;

        const notif = await Notification.create({
            recipientId,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false
        });

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
        // Traiter l'image si elle est en base64
        const processedData = processImage(req.body);

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const produit = new Produit({
            ...processedData,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            ingredients: ingredientIds,
            localisation: normalizeLocalisation(processedData)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy', 'nom prenom email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Erreur createProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Fournisseur: soumettre un produit en attente ────────────────────────────
exports.createPendingProduit = async (req, res) => {
    try {
        // Traiter l'image si elle est en base64
        const processedData = processImage(req.body);

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const produit = new Produit({
            nom: processedData.nom,
            description: processedData.description,
            marque: processedData.marque,
            image: processedData.image,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            origine: processedData.origine,
            ingredients: ingredientIds,
            pointsDeVente: Array.isArray(processedData.pointsDeVente) ? processedData.pointsDeVente : [],
            createdBy: processedData.createdBy,
            status: 'pending',
            localisation: normalizeLocalisation(processedData)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy', 'nom prenom email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Erreur createPendingProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer tous les produits ─────────────────────────────────────────────
exports.getAllProduits = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.createdBy) filter.createdBy = req.query.createdBy;

        const produits = await Produit.find(filter)
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .populate({ path: 'createdBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .populate({ path: 'validatedBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .lean()
            .maxTimeMS(8000);

        res.status(200).json(produits);
    } catch (error) {
        console.error('getAllProduits error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer produits en attente ───────────────────────────────────────────
exports.getPendingProduits = async (req, res) => {
    try {
        const produits = await Produit.find({ status: 'pending' })
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .populate({ path: 'createdBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .populate({ path: 'validatedBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
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
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Modifier produit ─────────────────────────────────────────────────────────
exports.updateProduit = async (req, res) => {
    try {
        // Traiter la nouvelle image si elle est en base64
        const processedData = processImage(req.body);

        // Si une nouvelle image a été uploadée, récupérer l'ancienne pour la supprimer
        const existingProduit = await Produit.findById(req.params.id);
        if (existingProduit && existingProduit.image &&
            processedData.image &&
            existingProduit.image !== processedData.image &&
            existingProduit.image.startsWith('/uploads/')) {

            // Supprimer l'ancienne image du disque
            const oldImagePath = path.join(process.cwd(), existingProduit.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log('🗑️ Ancienne image supprimée:', oldImagePath);
            }
        }

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const updatePayload = {
            ...processedData,
            ...(codeBarre ? { code_barre: codeBarre, codeBarres: codeBarre } : {}),
            ...(ingredientIds.length ? { ingredients: ingredientIds } : {}),
            ...(processedData.localisation ? { localisation: normalizeLocalisation(processedData) } : {})
        };

        const produit = await Produit.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        const populated = await Produit.findById(produit._id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

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
        console.error('Erreur updateProduit:', error);
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
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

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
        console.error('Erreur approveProduit:', error);
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
        console.error('Erreur rejectProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Supprimer produit ────────────────────────────────────────────────────────
exports.deleteProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        // Supprimer l'image associée si elle existe
        if (produit.image && produit.image.startsWith('/uploads/')) {
            const imagePath = path.join(process.cwd(), produit.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('🗑️ Image supprimée:', imagePath);
            }
        }

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
        console.error('Erreur deleteProduit:', error);
        res.status(500).json({ message: error.message });
    }
};