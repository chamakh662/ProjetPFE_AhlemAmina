// controllers/notification.controller.js
const Notification = require('../models/notification.model');

// 🟢 Créer une notification (appelé par produit.controller.js)
exports.createNotification = async (req, res) => {
    try {
        const { recipientId, message, productName, agentName } = req.body;

        if (!recipientId || !message) {
            return res.status(400).json({ message: 'recipientId et message sont requis' });
        }

        const notification = new Notification({
            recipientId,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false
        });

        const saved = await notification.save();
        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Récupérer les notifications d'un fournisseur
exports.getNotifications = async (req, res) => {
    try {
        const { recipientId } = req.query;

        if (!recipientId) {
            return res.status(400).json({ message: 'recipientId est requis' });
        }

        const notifications = await Notification.find({ recipientId })
            .sort({ createdAt: -1 }); // Plus récentes en premier

        res.status(200).json(notifications);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.status(200).json(notification);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
    try {
        const { recipientId } = req.query;

        if (!recipientId) {
            return res.status(400).json({ message: 'recipientId est requis' });
        }

        await Notification.updateMany(
            { recipientId, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'Toutes les notifications marquées comme lues' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Supprimer une notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.status(200).json({ message: 'Notification supprimée' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
