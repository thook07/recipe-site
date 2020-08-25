const Sequelize = require('sequelize');
const db = require('../config/database')

const Favorite = db.define('favorite', {
    recipeId: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    }
});

Favorite.getByIds = async function(userId, recipeId) {
    return await Favorite.findOne({
        where: {
            userId: userId,
            recipeId: recipeId
        }
    });
}

module.exports = Favorite;