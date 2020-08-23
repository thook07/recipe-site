
const Sequelize = require('sequelize');
const db = require('../config/database')

const File = db.define('file', {
    name: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
    size: {
        type: Sequelize.FLOAT
    },
    type: {
        type: Sequelize.STRING
    },
    path: {
        type: Sequelize.STRING
    },

});

module.exports = File;