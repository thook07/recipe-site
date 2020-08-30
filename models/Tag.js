const Sequelize = require('sequelize');
const db = require('../config/database');
const Recipe = require('./Recipe');
const RecipeTag = require('./RecipeTag');

const Tag = db.define('tag', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    },

});

/*Tag.associate = function(models) {
    Tag.hasMany(models.Recipe);
    Tag.belongsToMany(models.Recipe, { through: models.RecipeTag, as: 'recipeTag', foreignKey: 'recipeId' })
};*/



//Tag.belongsTo(Recipe);
//Tag.belongsToMany(Recipe, { through: 'RecipeTag' });

module.exports = Tag;