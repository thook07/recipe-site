var GroceryListItem = require("./GroceryListItem");
var Ingredient = require("./Ingredient");

class GroceryList {
    
    constructor() {
        this.items = [];
    }
    
    addItem(id, amount, recipeId, category) {
        console.log("addItem...["+id+"] ["+amount+"] ["+recipeId+"] ["+category+"]")
        var alreadyExists = false;
        for(var i=0; i<this.items.length; i++){
            if(this.items[i].id == id) {
                alreadyExists = true;
                break;
            } 
        }
        
        if( alreadyExists ) {
            this.items[i].addIngredient(amount, recipeId);
        } else {
            this.items.push(new GroceryListItem(id,amount,recipeId,category));
        }
        
        this.items.sort();
        
        return true;
    }
    
    toString(){
        return "GroceryList: Items ["+this.items.length+"] Ingredients:" + this.ingredients.toString();
    }
    
    getItemsByCategory() {
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