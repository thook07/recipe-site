const Sequelize = require('sequelize');
const db = require('../config/database')

const Recipe = db.define('recipes', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    attAuthor: {
        type: Sequelize.STRING
    },
    attLink: {
        type: Sequelize.STRING
    },
    cookTime: {
        type: Sequelize.STRING
    },
    prepTime: {
        type: Sequelize.STRING
    },
    images: {
        type: Sequelize.JSON
    },
    instructions: {
        type: Sequelize.JSON
    },
    notes: {
        type: Sequelize.JSON
    },
    approved: {
        type: Sequelize.BOOLEAN
    }

});

module.exports = Recipe;