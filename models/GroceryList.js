const GroceryListItem = require('./GroceryListItem');
const log = require('../config/logger');

function GroceryList(items, recipes) {
    this.items = items;
    this.recipes = recipes;
    this.nestedRecipes = [];
}

GroceryList.prototype.addRI = function(ri) {
    for(const item of this.items) {
        if(item.recipeIngredient.ingredient.id == ri.ingredient.id) {
            item.addIngredient(ri.amount, ri.recipeId)
            return;
        }
    }
    this.items.push(new GroceryListItem(ri));
    //this.items.push(ri);
    //this.items.sort();
}

GroceryList.prototype.addItem = function(ingredient, amount, recipeId, category) {
    log.trace("[GroceryList] addItem...["+JSON.stringify(ingredient)+"] ["+amount+"] ["+recipeId+"] ["+JSON.stringify(category)+"]")
    var alreadyExists = false;
    for(var i=0; i<this.items.length; i++){
        log.trace(JSON.stringify(this.items[i]));
        if(this.items[i].id == ingredient.id) {
            alreadyExists = true;
            break;
        } 
    }
    log.trace("[GroceryList] done checking. alreadyExists:  ["+alreadyExists+"]")
    if( alreadyExists ) {
        this.items[i].addIngredient(amount, recipeId);
    } else {
        log.trace("[GroceryList] Adding new GroceryListItem to GroceryList");
        this.items.push(new GroceryListItem(ingredient,amount,recipeId,category));
    }
    
    log.trace("[GroceryList] sorting...");
    this.items.sort();
    
    return true;
}

GroceryList.prototype.getItemsByCategory = function() {
    log.trace("[GroceryList] Entering getItemsByCategory")
    var catMap = {};
    for(const item of this.items){
        if( catMap[item.recipeIngredient.ingredient.ingredientCategory.name] == undefined) {
            catMap[item.recipeIngredient.ingredient.ingredientCategory.name] = [item];
        } else {
            catMap[item.recipeIngredient.ingredient.ingredientCategory.name].push(item);
        }
        
    }
    return catMap;
    
}

GroceryList.prototype.setRecipes = function(recipes) {
    this.recipes = recipes;
}

module.exports = GroceryList