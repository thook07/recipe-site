const GroceryListItem = require('./GroceryListItem');
const log = require('../config/logger');

function GroceryList(items, recipes) {
    this.items = items;
    this.recipes = recipes;
    this.nestedRecipes = [];
}

GroceryList.prototype.addItem = function(id, amount, recipeId, category) {
    log.trace("[GroceryList] addItem...["+id+"] ["+amount+"] ["+recipeId+"] ["+category+"]")
    var alreadyExists = false;
    for(var i=0; i<this.items.length; i++){
        log.trace(JSON.stringify(this.items[i]));
        if(this.items[i].id == id) {
            alreadyExists = true;
            break;
        } 
    }
    log.trace("[GroceryList] done checking. alreadyExists:  ["+alreadyExists+"]")
    if( alreadyExists ) {
        this.items[i].addIngredient(amount, recipeId);
    } else {
        log.trace("[GroceryList] Adding new GroceryListItem to GroceryList");
        this.items.push(new GroceryListItem(id,amount,recipeId,category));
    }
    
    log.trace("[GroceryList] sorting...");
    this.items.sort();
    
    return true;
}

GroceryList.prototype.getItemsByCategory = function() {
    log.trace("[GroceryList] Entering getItemsByCategory")
    var catMap = {};
    for(var i=0; i<this.items.length; i++){
        var item = this.items[i];
        if( catMap[item.category] == undefined) {
            catMap[item.category] = [item];
        } else {
            catMap[item.category].push(item);
        }
        
    }
    
    return catMap;
    
}

GroceryList.prototype.setRecipes = function(recipes) {
    this.recipes = recipes;
}

module.exports = GroceryList