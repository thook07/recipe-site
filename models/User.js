const Sequelize = require('sequelize')
const crypto = require('crypto')
const db = require('../config/database')
const Recipe = require('../models/Recipe');
const GroceryList = require('../models/GroceryList');
const Favorite = require('../models/Favorite');

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
        recipe.tags = recipe.tags = await recipe.getTags();
        recipes.push(recipe);
        console.log(recipes);
    }
    return recipes;
}

User.prototype.getGroceryList = async function() {
    // -- This ones interesting.
    const groceryList = {};
    groceryList.items = []; //array of ingredients (includes ingredientId, amount, recipeId, quantity)
    groceryList.recipes = []; //array of recipes (inclues quantity);
    groceryList.itemCategoryMap = {}; //map of items based on category

    // - First: Get the recipeIds
    const listItems = await GroceryList.findAll({
        where: {
            userId: this.id
        }
    });
    // - Second: Build the full Recipe. Add quantity to the recipe
    var recipes = [];
    for (const listItem of listItems) {  
        const recipe = await Recipe.byId(listItem.recipeId);
        //recipe.favoredDate = favorite.createdAt
        recipe.recipeIngredients = await recipe.getRecipeIngredients();
        recipe.quantity = listItem.quantity;
        recipes.push(recipe);
    }
    groceryList.recipes = recipes;
    // - Third: Build Array of Ingredients
    for(const recipe of recipes) {
        recipe.
    }


    return groceryList;
}

User.prototype.getGroceryListRecipes = async function() {
    const listItems = await GroceryList.findAll({
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