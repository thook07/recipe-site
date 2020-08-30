const Sequelize = require('sequelize');

const User = require('../models/User')
const Recipe = require('../models/Recipe')
const RecipeIngredient = require('../models/RecipeIngredient')
const RecipeTag = require('../models/RecipeTag')
const Favorite = require('../models/Favorite')
const GroceryListRecipe = require('../models/GroceryListRecipe')
const Tag = require('../models/Tag')
const RecipePageVisit = require('../models/RecipePageVisit');


Recipe.belongsToMany(Tag, { through: 'recipe_tag' });
Tag.belongsToMany(Recipe, { through: 'recipe_tag' });
Recipe.hasMany(RecipeIngredient);
RecipeIngredient.belongsTo(Recipe);
Recipe.hasMany(RecipePageVisit);

User.hasMany(Favorite);
Favorite.belongsTo(User);
User.hasMany(GroceryListRecipe);
GroceryListRecipe.belongsTo(User);