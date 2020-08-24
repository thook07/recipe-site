const Sequelize = require('sequelize');
const db = require('../config/database');

const Ingredient = db.define('ingredient', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    }

});


module.exports = Ingredient;




