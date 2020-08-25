const Sequelize = require('sequelize');
const db = require('../config/database')

const GroceryList = db.define('groceryList', {
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

GroceryList.getByIds = async function(userId, recipeId) {
    return await GroceryList.findOne({
        where: {
            userId: userId,
            recipeId: recipeId
        }
    });
}

module.exports = GroceryList;