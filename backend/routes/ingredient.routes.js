const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredient.controller');


// CRUD Ingredient

router.post('/', ingredientController.createIngredient);

router.get('/', ingredientController.getAllIngredients);

router.get('/:id', ingredientController.getIngredientById);

router.put('/:id', ingredientController.updateIngredient);

router.delete('/:id', ingredientController.deleteIngredient);


module.exports = router;