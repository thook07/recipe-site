
const log = require('../config/logger');

function GroceryListItem(ingredientId, amount, recipeId, category) {
    log.trace("[GroceryListItem] constructor: ["+ingredientId+"] ["+amount+"] ["+recipeId+"] ["+category+"]")
    this.id = ingredientId;
    this.amount = [];
    this.amount.push(amount);
    this.recipes = [];
    this.recipes.push(recipeId);
    this.amountMap = {};
    this.amountMap[recipeId] = amount
    this.category = category;
}

GroceryListItem.prototype.addIngredient = function(amount, recipeId) {
    log.trace("[GroceryListItem] addIngredient: ["+amount+"] ["+recipeId+"]")
    this.amount.push(amount);
    this.recipes.push(recipeId)
    this.amountMap[recipeId] = amount
}

module.exports = GroceryListItem