const express = require('express');
const router = express.Router();

const produitController = require('../controllers/produit.controller');


// CRUD Produit

router.post('/', produitController.createProduit);

// 🔴 Workflow fournisseur/admin
router.post('/pending', produitController.createPendingProduit);
router.get('/pending', produitController.getPendingProduits);
router.put('/:id/approve', produitController.approveProduit);
router.put('/:id/reject', produitController.rejectProduit);

router.get('/', produitController.getAllProduits);

router.get('/:id', produitController.getProduitById);

router.put('/:id', produitController.updateProduit);

router.delete('/:id', produitController.deleteProduit);


module.exports = router;