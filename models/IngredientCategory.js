const Sequelize = require('sequelize');
const db = require('../config/database');

const IngredientCategory = db.define('ingredientCategory', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    } 
},{
    timestamps: false
});


module.exports = IngredientCategory;




