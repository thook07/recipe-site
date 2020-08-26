const Sequelize = require('sequelize');
const log = require('./logger')

module.exports = new Sequelize('recipes', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    operatorAliases: false,
    logging: log.trace,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idel: 10000
    }
});