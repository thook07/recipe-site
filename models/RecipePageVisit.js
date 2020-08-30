const Sequelize = require('sequelize');
const db = require('../config/database');

const RecipePageVisit = db.define('recipePageVisit', {
    recipeId: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    }

});


module.exports = RecipePageVisit;




