const Sequelize = require('sequelize')
const crypto = require('crypto')
const db = require('../config/database')
const log = require('../config/logger')
const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const GroceryListRecipe = require('./GroceryListRecipe');
const GroceryListItem = require('./GroceryListItem');
const GroceryList = require('./GroceryList');
const Favorite = require('../models/Favorite');
const Ingredient = require('../models/Ingredient');

const User = db.define('user', {
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        get() {
            return () => this.getDataValue('password')
        }
    },
    salt: {
        type: Sequelize.STRING,
        get() {
            return() => this.getDataValue('salt')
        }
    },
    role: {
        type: Sequelize.STRING,
        defaultValue: "User"
    }
});

User.generateSalt = function() {
    return crypto.randomBytes(16).toString('base64')
}
User.encryptPassword = function(plainText, salt) {
    return crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex')
}

User.byId = async function(id) {
    return await User.findByPk(id);
}

User.byEmail = async function(email) {
    return await User.findOne({
        where: {
          email: email
        }
    });
}

User.prototype.getFavorites = async function(){
    const favorites = await Favorite.findAll({
        where: {
            userId: this.id
        }
    });
    var ids = [];
    favorites.forEach(favorite => ids.push(favorite.recipeId))
    return ids;
}

User.prototype.getFavoriteRecipes = async function(){
    const favorites = await Favorite.findAll({
        where: {
            userId: this.id
        }
    });
    var recipes = [];
    for (const favorite of favorites) {  
        const recipe = await Recipe.byId(favorite.recipeId);
        recipe.favoredDate = favorite.createdAt
        recipe.tags = await recipe.getTags();
        recipes.push(recipe);
    }
    return recipes;
}

User.prototype.getGroceryList = async function() {
    // - Get the Recipe with ALL associations
    const groceryListRecipes = await GroceryListRecipe.findAll({
        where: {
            userId: this.id
        },
        include: {
            all: true,
            nested: true
        }
    });
    const groceryList = new GroceryList([], []);
    const recipes = [];
    const recipeQuantityMap = {};
    for(const groceryListRecipe of groceryListRecipes) {
        recipeQuantityMap[groceryListRecipe.recipe.id] = groceryListRecipe.quantity;
        groceryListRecipe.recipe.quantity = groceryListRecipe.quantity;
        recipes.push(groceryListRecipe.recipe);
        log.debug('[User] getGroceryList: Recipe: ' + groceryListRecipe.recipe.name);
        for(const ri of groceryListRecipe.recipe.recipeIngredients) {
            if(ri.isRecipe) {
                const nestedRecipe = await Recipe.findOne({
                    where: {
                        id: ri.ingredientId
                    },
                    include: {
                        all: true,
                        nested: true
                    }
                })
                recipeQuantityMap[nestedRecipe.id] = groceryListRecipe.quantity;
                log.info('[User] Nested Recipe found: ['+nestedRecipe.name+']')
                for(const nestedRi of nestedRecipe.recipeIngredients) {
                    log.debug('[User] nested: ' + nestedRi.ingredientDescription)
                    if(ri.ingredientId == null) {
                        log.warn('[User] getGroceryList nested: RecipeIngredient has null IngredientId. RecipeIngredient.ID: ['+nestedRi.id+']');
                        log.warn('[User] getGroceryList nested: Skipping this RI')
                    } else {
                        log.debug('[User] getGroceryList nested: Adding Item: ' + nestedRi.ingredient.id)
                        groceryList.addRI(nestedRi);                    
                    }
                }
            } else {
                log.trace('[User] getGroceryList: RecipeIngredient: ' + JSON.stringify(ri));
                log.debug('[User] getGroceryList: IngredientID: ' + ri.ingredientId);
                if(ri.ingredientId == null) {
                    log.warn('[User] getGroceryList: RecipeIngredient has null IngredientId. RecipeIngredient.ID: ['+ri.id+']');
                    log.warn('[User] getGroceryList: Skipping this RI')
                } else {
                    log.debug('[User] getGroceryList: Adding Item: ' + ri.ingredient.name)
                    groceryList.addRI(ri);                    
                }
            }
        }
    }

    groceryList.recipes = recipes;
    groceryList.recipeQuantityMap = recipeQuantityMap;
    
    return groceryList;
}

User.prototype.getGroceryListRecipes = async function() {
    const listItems = await GroceryListRecipe.findAll({
        where: {
            userId: this.id
        }
    });
    var recipes = [];
    for (const listItem of listItems) {  
        const recipe = await Recipe.byId(listItem.recipeId);
        //recipe.favoredDate = favorite.createdAt
        recipe.tags = await recipe.getTags();
        recipe.recipeIngredients = await recipe.getRecipeIngredients();
        recipe.quantity = listItem.quantity;
        recipes.push(recipe);
    }
    return recipes;
}

User.prototype.correctPassword = function(enteredPassword) {
    return User.encryptPassword(enteredPassword, this.salt()) === this.password()
}

const setSaltAndPassword = (user, options) => {
    log.debug('[User] setSaltAndPassword: Entering...')
    if (user.changed('password')) {
        log.debug('[User] user has changed password. Encrypting!')
        user.salt = User.generateSalt()
        user.password = User.encryptPassword(user.password(), user.salt())
    }
}

User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

module.exports = User;