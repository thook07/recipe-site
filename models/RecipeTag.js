const Sequelize = require('sequelize');
const db = require('../config/database');
const Recipe = require('./Recipe')
const Tag = require('./Tag')

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

RecipeTag.prototype.test = function(){
    return 1;
}



module.exports = RecipeTag;