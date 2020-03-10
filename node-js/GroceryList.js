var GroceryListItem = require("./GroceryListItem");
var Ingredient = require("./Ingredient");

class GroceryList {
    
    constructor(cache) {
        this.items = [];
        this.itemsByCategory = [];
    }
    
    addItem(id, amount, recipeId, ing) {
        
        var alreadyExists = false;
        for(i=0; i<this.items.length; i++){
            if(this.items[i].id == id) {
                alreadyExists = true;
                break;
            } 
        }
        
        if( alreadyExists ) {
            this.items[i].addIngredient(amount, recipeId);
        } else {
            this.items.push(new GroceryListItem(id,amount,recipeId,ing));
        }
        
        this.items.sort();
        
        return true;
    }
    
    toString(){
        return "GroceryList: Items ["+this.items.length+"] Ingredients:" + this.ingredients.toString();
    }
    
    populateItemsByCategory() {
        
        var catMap = {};
        for(var i=0; i<this.items.length; i++){
            var item = this.items[i];
            console.log("item: ",item.id,item.ingredient.category);
            if( catMap[item.ingredient.category] == undefined) {
                catMap[item.ingredient.category] = [item];
            } else {
                catMap[item.ingredient.category].push(item);
            }
            
        }
        
        //console.log("catmap",catMap);
        this.itemsByCategory = catMap;
        
    }
    
    
}
   

module.exports = GroceryList;