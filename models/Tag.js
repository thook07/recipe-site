const Sequelize = require('sequelize');
const db = require('../config/database')
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

module.exports = Tag;