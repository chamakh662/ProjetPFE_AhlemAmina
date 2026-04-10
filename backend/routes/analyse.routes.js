const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const analyseController = require('../controllers/analyse.controller');
const { predictIngredients } = require('../controllers/analyse.controller');

router.post('/predict', analyseController.predictProduct);

router.post('/', analyseController.createAnalyse);

router.get('/', analyseController.getAllAnalyses);

router.get('/:id', analyseController.getAnalyseById);

router.put('/:id', analyseController.updateAnalyse);

router.delete('/:id', analyseController.deleteAnalyse);
router.post('/predict', protect, predictIngredients);


module.exports = router;
