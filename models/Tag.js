const Sequelize = require('sequelize');
const db = require('../config/database')

const Recipe = db.define('tags', {
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

module.exports = Recipe;