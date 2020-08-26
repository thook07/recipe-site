const Sequelize = require('sequelize');
const db = require('../config/database')

const GroceryListItem = db.define('groceryListItem', {
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

GroceryListItem.getByIds = async function(userId, recipeId) {
    return await GroceryListItem.findOne({
        where: {
            userId: userId,
            recipeId: recipeId
        }
    });
}


module.exports = GroceryListItem