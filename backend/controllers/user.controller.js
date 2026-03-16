const User = require('../models/user.model');

// 🟢 Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    console.log("test users")
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Get one user by ID (admin or owner)
exports.getUserById = async (req, res) => {
    try {
        // Vérifier si admin ou owner
        if (req.user.role !== 'administrateur' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id).select('-mot_de_passe');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user (admin or owner)
exports.updateUser = async (req, res) => {
    try {
        if (req.user.role !== 'administrateur' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const allowedUpdates = ['nom', 'email'];
        if (req.user.role === 'administrateur') allowedUpdates.push('role');

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-mot_de_passe');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'administrateur') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.mot_de_passe = await bcrypt.hash(req.body.newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};