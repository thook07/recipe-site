
const log = require('../config/logger');

function GroceryListItem(recipeIngredient) {
    log.trace("[GroceryListItem] constructor: "+ JSON.stringify(recipeIngredient));
    this.recipeIngredient = recipeIngredient;
    this.amount = [];
    this.amount.push(recipeIngredient.amount);
    this.recipes = [];
    this.recipes.push(recipeIngredient.recipeId);
    this.amountMap = {};
    this.amountMap[recipeIngredient.recipeId] = recipeIngredient.amount
}

GroceryListItem.prototype.addIngredient = function(amount, recipeId) {
    log.debug("[GroceryListItem] addIngredient: ["+amount+"] ["+recipeId+"]")
    this.amount.push(amount);
    this.recipes.push(recipeId)
    this.amountMap[recipeId] = amount
}

module.exports = GroceryListItem