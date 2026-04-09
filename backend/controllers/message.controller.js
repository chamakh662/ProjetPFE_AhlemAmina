const Message = require('../models/message.model');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages', error: err.message });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const newMessage = new Message({
            ...req.body,
            fromId: req.user._id, // Securise fromId par rapport au token de l'utilisateur
        });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(400).json({ message: 'Erreur création message', error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMessage = await Message.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        res.status(200).json(updatedMessage);
    } catch (err) {
        res.status(400).json({ message: 'Erreur mise à jour message', error: err.message });
    }
};
