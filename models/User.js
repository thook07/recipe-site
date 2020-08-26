const Sequelize = require('sequelize')
const crypto = require('crypto')
const db = require('../config/database')
const log = require('../config/logger')
const Recipe = require('../models/Recipe');
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
        console.log(recipes);
    }
    return recipes;
}

User.prototype.getGroceryList = async function() {
    // - First: Get the recipeIds
    const groceryListRecipes = await GroceryListRecipe.findAll({
        where: {
            userId: this.id
        }
    });

    const groceryList = new GroceryList([], []);
    const recipes = [];
    const recipeQuantityMap = {};
    for (const groceryListRecipe of groceryListRecipes) {  
        ("[User] GroceryListRecipe: " + JSON.stringify(groceryListRecipe));
        const recipe = await Recipe.byId(groceryListRecipe.recipeId);
        recipes.push(recipe);
        recipeQuantityMap[recipe.id] = groceryListRecipe.quantity;
        for(const ri of recipe.recipeIngredients) {
            if(ri.isRecipe) {
                //todo handle this
            } else {
                log.trace('[User] getGroceryList: RecipeIngredient: ' + JSON.stringify(ri));
                log.trace('[User] getGroceryList: IngredientID: ' + ri.ingredientId);
                if(ri.ingredientId == null) {
                    log.warn('[User] getGroceryList: RecipeIngredient has null IngredientId. RecipeIngredient.ID: ['+ri.id+']');
                    log.warn('[User] getGroceryList: Skipping this RI')
                } else {
                    var ingredient = await Ingredient.findByPk(ri.ingredientId);
                    groceryList.addItem(ingredient.id, ri.amount, recipe.id, ingredient.category)                    
                }
                //items.push(item); 
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

const setSaltAndPassword = user => {
    if (user.changed('password')) {
        user.salt = User.generateSalt()
        user.password = User.encryptPassword(user.password(), user.salt())
    }
}


User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

module.exports = User;