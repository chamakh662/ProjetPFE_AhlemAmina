const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, updatePassword } = require('../controllers/user.controller');
const protect = require('../middlewares/auth.middleware');
const permit = require('../middlewares/role.middleware');

// Admin only
router.get('/', protect, permit('admin'), getAllUsers);
router.delete('/:id', protect, permit('admin'), deleteUser);

// Admin or owner (check inside controller)
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

// Modifier mot de passe (utilisateur connecté)
router.put('/:id/password', protect, updatePassword);

module.exports = router;