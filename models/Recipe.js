const Sequelize = require('sequelize');
const db = require('../config/database');
const Tag = require('./Tag');
const RecipeTag = require('./RecipeTag');
const RecipeIngredient = require('./RecipeIngredient');


const Recipe = db.define('recipe', {
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
    author: {
        type: Sequelize.VIRTUAL,
        get() {
            return `${this.attAuthor}`;
        },
        set(value) {
            throw new Error('Do not try to set the `author` value! User attAuthor instead.');
        }
    },
    attLink: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.VIRTUAL,
        get() {
            return `${this.attLink}`;
        },
        set(value) {
            throw new Error('Do not try to set the `url` value! User attLink instead.');
        }
    },
    cookTime: {
        type: Sequelize.STRING,
        defaultValue: '0'
    },
    prepTime: {
        type: Sequelize.STRING,
        defaultValue: '0'
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
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

});

const { Op } = require('sequelize');

Recipe.byId = async function byId(id) {
    return await Recipe.findByPk(id);
};

Recipe.prototype.getTags = async function getTags() {
    const joins = await RecipeTag.findAll({
        where: {
            recipeId: this.id,
        },
    });

    var tagIds = []
    joins.forEach(join => tagIds.push(join.tagId))

    return await Tag.findAll({
        where: {
            id: { [Op.in]: tagIds },
        },
    });
}

Recipe.prototype.getRecipeIngredients = async function getRecipeIngredients() {
    return await RecipeIngredient.findAll({
        where: {
            recipeId: this.id,
        },
    });
}

Recipe.prototype.getNestedRecipes = async function getNestedRecipes() {
    const recipeIngredients = await RecipeIngredient.findAll({
        where: {
            recipeId: this.id,
        },
    });

    nestedRecipes = [];
    recipeIngredients.forEach(ri => {
        if(ri.isRecipe) {
            nestedRecipes.push(ri.ingredientId) //recipeId is stored in ingredientid, if its a recipe
        }
    });

    return  Recipe.findAll({
        where: {
            id: { [Op.in]: nestedRecipes },
        },
    });


}


module.exports = Recipe;