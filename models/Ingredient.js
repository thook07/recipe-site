const Sequelize = require('sequelize');
const db = require('../config/database');

const Ingredient = db.define('ingredient', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    categoryId: {
        type: Sequelize.STRING
    }

});


module.exports = Ingredient;




