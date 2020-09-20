const Sequelize = require('sequelize');
const db = require('../config/database');
const dateformat = require('dateformat');

const RecipePageVisit = db.define('recipePageVisit', {
    recipeId: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
    createdAtPretty: {
        type: Sequelize.VIRTUAL,
        get() {
            return dateformat(this.get('createdAt'), "dddd, mm/dd/yy h:MM:ss TT Z");
        },
        set(value) {
            throw new Error('Do not try to set the `url` value! User attLink instead.');
        }
    },
    updatedAtPretty: {
        type: Sequelize.VIRTUAL,
        get() {
            return dateformat(this.get('updatedAt'), "dddd, mm/dd/yy h:MM:ss TT Z");
        },
        set(value) {
            throw new Error('Do not try to set the `url` value! User attLink instead.');
        }
    }

});


module.exports = RecipePageVisit;




