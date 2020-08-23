var GroceryListItem = require("./GroceryListItem");
var Ingredient = require("./Ingredient");
var log = require('../config/logger.js');

class GroceryList {
    
    constructor() {
        this.items = [];
        this.nestedRecipesIds = {};
    }
    
    addItem(id, amount, recipeId, category) {
        log.trace("[GroceryList] addItem...["+id+"] ["+amount+"] ["+recipeId+"] ["+category+"]")
        var alreadyExists = false;
        for(var i=0; i<this.items.length; i++){
            log.trace(this.items[i]);
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
    
    toString(){
        return "GroceryList: Items ["+this.items.length+"]";
    }
    
    getItemsByCategory() {
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
        
        //console.log("catmap",catMap);
        return catMap;
        
    }

    
    
}
   

module.exports = GroceryList;