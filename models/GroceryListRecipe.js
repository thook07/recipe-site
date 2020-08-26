const Sequelize = require('sequelize');
const db = require('../config/database')
const log = require('../config/logger')

const GroceryListRecipe = db.define('groceryListRecipe', {
    recipeId: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
    quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});

GroceryListRecipe.getByIds = async function(userId, recipeId) {
    log.trace('[GroceryListRecipe] entering getByIds: ['+userId+'] ['+recipeId+']');
    return await GroceryListRecipe.findOne({
        where: {
            userId: userId,
            recipeId: recipeId
        }
    });
}


module.exports = GroceryListRecipe;