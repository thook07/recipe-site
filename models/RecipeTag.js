const Sequelize = require('sequelize');
const db = require('../config/database');

const RecipeTag = db.define('recipe_tag', {
    recipeId: {
        type: Sequelize.STRING
    },
    tagId: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

RecipeTag.removeAttribute('id');

module.exports = RecipeTag;