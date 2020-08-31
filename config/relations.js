const Sequelize = require('sequelize');

const User = require('../models/User')
const Recipe = require('../models/Recipe')
const RecipeIngredient = require('../models/RecipeIngredient')
const RecipeTag = require('../models/RecipeTag')
const Favorite = require('../models/Favorite')
const GroceryListRecipe = require('../models/GroceryListRecipe')
const Tag = require('../models/Tag')
const Ingredient = require('../models/Ingredient')
const IngredientCategory = require('../models/IngredientCategory')
const RecipePageVisit = require('../models/RecipePageVisit');


Recipe.belongsToMany(Tag, { through: 'recipe_tag' });
Tag.belongsToMany(Recipe, { through: 'recipe_tag' });
Recipe.hasMany(RecipeIngredient);
RecipeIngredient.belongsTo(Recipe);
//Recipe.hasMany(RecipePageVisit); --> See recipe.viewCount VIRTUAL field for more info

//Ingredient.hasMany(RecipeIngredient);
//Ingredient.hasOne(IngredientCategory);
RecipeIngredient.belongsTo(Ingredient)
Ingredient.belongsTo(IngredientCategory, { foreignKey: 'categoryId' }); 

User.hasMany(Favorite);
Favorite.belongsTo(User);
User.hasMany(GroceryListRecipe);
GroceryListRecipe.belongsTo(User);
GroceryListRecipe.belongsTo(Recipe);
Recipe.hasMany(GroceryListRecipe)
//User.belongsToMany(Recipe, {though: 'groceryListRecipe'} );
//User.belongsToMany(Recipe, {through: 'groceryListRecipe'});
//Recipe.belongsToMany(User, {through: 'groceryListRecipe'});



