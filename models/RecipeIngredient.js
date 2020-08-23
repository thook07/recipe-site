const Sequelize = require('sequelize');
const db = require('../config/database');
const Recipe = require('./Recipe');

`amount`, `id`, `ingredient`, `ingredientId`, `isRecipe`, `recipeId`

const RecipeIngredient = db.define('recipeIngredient', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recipeId: {
        type: Sequelize.STRING
    },
    amount: {
        type: Sequelize.STRING
    },
    ingredientId: {
        type: Sequelize.STRING
    },
    ingredient: {
        type: Sequelize.STRING
    },
    isRecipe: {
        type: Sequelize.BOOLEAN
    }

});


module.exports = RecipeIngredient;




