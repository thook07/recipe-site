const Sequelize = require('sequelize');
const db = require('../config/database');
const log = require('../config/logger');
const Tag = require('./Tag');
const RecipeTag = require('./RecipeTag');
const RecipeIngredient = require('./RecipeIngredient');
const RecipePageVisit = require('./RecipePageVisit');


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
    },
    recipeType: {
        type: Sequelize.STRING
    },
    viewCount: {
        type: Sequelize.VIRTUAL,
        async get() {
            return await RecipePageVisit.count({
                where:{
                    recipeId: this.id
                }
            });
        },
        set(value) {
            throw new Error('Do not try to set the `url` value! User attLink instead.');
        }
    }

});


const { Op } = require('sequelize');

Recipe.byId = async function byId(id) {
    log.trace('[RECIPE] Entering Recipe.byId ['+id+']')
    const recipe = await Recipe.findByPk(id, { include: [Tag, RecipeIngredient]});
    recipe.nestedRecipes = await recipe.getNestedRecipes();
    log.trace('[RECIPE] Done');
    return recipe;
};

Recipe.getIds = async function getIds() {
    const recipes = await Recipe.findAll({ attributes: ['id'] });

    recipeIds = [];
    recipes.forEach(recipe => { recipeIds.push(recipe.id) })

    return recipeIds;
}

Recipe.getAllAttributes = async function getAllAttributes(atts) {
    const recipes = await Recipe.findAll({ attributes: atts });
    return recipes;
}

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

Recipe.prototype.getDisplayableTags = function getDisplayableTags(){
    var str = '';
    if(this.tags) {
        for(const tag of this.tags) {
            str = str + tag.name + ', '
        }
        return str.slice(0, -2);
    }
    return '';

}

module.exports = Recipe;