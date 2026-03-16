const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse.controller');


router.post('/', analyseController.createAnalyse);

router.get('/', analyseController.getAllAnalyses);

router.get('/:id', analyseController.getAnalyseById);

router.put('/:id', analyseController.updateAnalyse);

router.delete('/:id', analyseController.deleteAnalyse);


module.exports = router;
